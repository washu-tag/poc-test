import json
import os
from collections.abc import Iterator
from dataclasses import asdict
from datetime import datetime

import pandas as pd
import requests
import s3fs
from deltalake import DeltaTable, write_deltalake
from temporalio import activity

from ctclipembeddings.shared import MODEL_APP_URI_ENV
from ctclipembeddings.models import (
    Embedding,
    EmbedRadReportTextFromDeltaLakeActivityInput,
    EmbedRadReportTextFromDeltaLakeActivityOutput,
    QueryDeltaLakeForMessageIdsActivityInput,
    QueryDeltaLakeForMessageIdsActivityOutput,
    SaveEmbeddingsToDeltaLakeActivityInput,
    CleanUpScratchSpaceActivityInput,
)


@activity.defn
def query_delta_lake_for_message_ids(
    activity_input: QueryDeltaLakeForMessageIdsActivityInput,
) -> QueryDeltaLakeForMessageIdsActivityOutput:
    """Query Delta Lake for message IDs"""
    activity.logger.info(
        "Querying delta lake %s for message ids from date %s",
        activity_input.delta_table_path,
        activity_input.date,
    )
    dt = DeltaTable(
        activity_input.delta_table_path,
        storage_options=read_deltalake_storage_options_from_environment(),
    )

    # Extract date and year
    date = activity_input.date
    year = datetime.strptime(date, "%Y-%m-%d").year

    # Query the table
    df = dt.to_pandas(
        columns=["msh_10_message_control_id"],
        partitions=[("year", "=", str(year))],
        filters=[("date", "=", date)],
    )

    activity.logger.debug("Found %d message ids", len(df))
    return QueryDeltaLakeForMessageIdsActivityOutput(
        df["msh_10_message_control_id"].tolist()
    )


@activity.defn
def embed_report_text_from_delta_lake(
    activity_input: EmbedRadReportTextFromDeltaLakeActivityInput,
) -> EmbedRadReportTextFromDeltaLakeActivityOutput:
    """Query Delta Lake for rad report text matching the given criteria and generate embedding"""
    activity.logger.info(
        "Embedding report text for message id %s", activity_input.message_id
    )
    report_text = read_report_text_from_delta_lake(
        activity_input.delta_table_path,
        datetime.strptime(activity_input.date, "%Y-%m-%d"),
        activity_input.message_id,
    )
    vector_embedding = generate_embedding_from_text(report_text)

    # Save the embedding to scratch space
    scratch_path = save_embedding_to_scratch_space(
        activity_input.workflow_scratch_space.rstrip("/"),
        Embedding(activity_input.date, activity_input.message_id, vector_embedding),
    )
    return EmbedRadReportTextFromDeltaLakeActivityOutput(
        date=activity_input.date,
        message_id=activity_input.message_id,
        embedding_path=scratch_path,
    )


@activity.defn
def save_embeddings_to_delta_lake(
    activity_input: SaveEmbeddingsToDeltaLakeActivityInput,
) -> None:
    """Save embeddings to delta lake table"""
    activity.logger.info(
        "Saving embeddings to delta lake %s", activity_input.delta_table_path
    )

    def embedding_to_record(embedding: Embedding):
        return {
            "date": embedding.date,
            "msh_10_message_control_id": embedding.message_id,
            "embedding": embedding.vector_embedding,
        }

    def embeddings(workflow_scratch_space: str) -> Iterator[Embedding]:
        """Read embeddings from S3 scratch space"""
        fs = s3fs.S3FileSystem()
        for file in fs.find(workflow_scratch_space):
            yield read_embedding_from_scratch_space(file)

    df = pd.DataFrame.from_records(
        map(embedding_to_record, embeddings(activity_input.workflow_scratch_space))
    )
    # This would be better done by grouping on the date column and only instantiating the datetime object once
    df["year"] = df["date"].apply(lambda x: str(datetime.strptime(x, "%Y-%m-%d").year))

    table_exists = DeltaTable.is_deltatable(activity_input.delta_table_path)
    if not table_exists:
        write_deltalake(
            activity_input.delta_table_path,
            df,
            partition_by=["year"],
            storage_options=read_deltalake_storage_options_from_environment(),
        )
        activity.logger.info("Wrote %d embeddings to delta lake", len(df))
    else:
        dt = DeltaTable(
            activity_input.delta_table_path,
            storage_options=read_deltalake_storage_options_from_environment(),
        )
        dt.merge(
            df,
            predicate="s.msh_10_message_control_id = t.msh_10_message_control_id",
            source_alias="s",
            target_alias="t",
        ).when_matched_update_all().when_not_matched_insert_all().execute()
        activity.logger.info("Merged %d embeddings to delta lake", len(df))


@activity.defn
def clean_up_scratch_space(activity_input: CleanUpScratchSpaceActivityInput) -> None:
    """Clean up scratch space"""
    activity.logger.info(
        "Cleaning up scratch space %s", activity_input.workflow_scratch_space
    )
    s3fs.S3FileSystem().rm(activity_input.workflow_scratch_space, recursive=True)


def read_report_text_from_delta_lake(
    delta_table_path: str, date: datetime, message_id: str
) -> str:
    """Query Delta Lake for rad report text matching the given criteria"""
    activity.logger.debug(
        "Reading report text from delta lake %s for message id %s",
        delta_table_path,
        message_id,
    )
    dt = DeltaTable(
        delta_table_path,
        storage_options=read_deltalake_storage_options_from_environment(),
    )

    # Query the table
    df = dt.to_pandas(
        columns=["msh_10_message_control_id", "year", "obx_5_observation_value"],
        partitions=[("year", "=", str(date.year))],
        filters=[
            ("msh_10_message_control_id", "=", message_id),
            ("date", "=", date.strftime("%Y-%m-%d")),
        ],
    )

    if len(df) == 0:
        raise ValueError("No matching record found")
    if len(df) > 1:
        raise ValueError("%d matching records found:", len(df))

    report = df.iloc[0]["obx_5_observation_value"]
    activity.logger.debug("Report text len: %d", len(report))
    return report


def generate_embedding_from_text(text: str) -> list[float]:
    """Generate embedding by POSTing text to model API server"""

    model_app_uri = os.environ.get(MODEL_APP_URI_ENV)
    if not model_app_uri:
        raise ValueError(f"Environment variable {MODEL_APP_URI_ENV} is not set")

    activity.logger.debug("Posting to model API server %s", model_app_uri)

    response = requests.post(f"{model_app_uri}/latents", json={"text": text})
    response.raise_for_status()
    api_response = response.json()

    activity.logger.debug(
        "Embedding generated with dim %d", api_response.get("dim", -1)
    )
    return api_response.get("vector", [])


def save_embedding_to_scratch_space(workflow_scratch_space: str, embedding: Embedding):
    """Save embedding to scratch space"""
    scratch_path = workflow_scratch_space + "/" + activity.info().activity_id + ".txt"
    activity.logger.debug("Saving embedding to %s", scratch_path)

    with s3fs.S3FileSystem().open(scratch_path, "w") as f:
        json.dump(asdict(embedding), f)

    return scratch_path


def read_embedding_from_scratch_space(scratch_path: str) -> Embedding:
    """Read embedding from scratch space"""
    activity.logger.debug("Reading embedding from %s", scratch_path)
    with s3fs.S3FileSystem().open(scratch_path, "r") as f:
        return Embedding(**json.load(f))


def read_deltalake_storage_options_from_environment():
    """Read Delta Lake storage options from environment variables"""
    return {
        "endpoint_url": os.environ.get("AWS_ENDPOINT_URL"),
        "aws_access_key_id": os.environ.get("AWS_ACCESS_KEY_ID"),
        "aws_secret_access_key": os.environ.get("AWS_SECRET_ACCESS_KEY"),
        "aws_region": os.environ.get(
            "AWS_REGION", "us-east-1"
        ),  # necessary to avoid imds region warnings
        "aws_allow_http": os.environ.get("AWS_ALLOW_HTTP", "false"),
        "aws_allow_unsafe_renames": os.environ.get("AWS_ALLOW_UNSAFE_RENAMES", "false"),
        # "allow_invalid_certificates":"true",
    }
