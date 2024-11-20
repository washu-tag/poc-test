import asyncio
from datetime import timedelta

from temporalio import workflow

from ctclipembeddings import activities, models
from ctclipembeddings.shared import EMBEDDINGS_TASK_QUEUE


@workflow.defn(sandboxed=False)
class RadReportToEmbedding:
    @workflow.run
    async def rad_report_to_embedding(
        self, workflow_input: models.RadReportToEmbeddingWorkflowInput
    ) -> models.RadReportToEmbeddingWorkflowOutput:
        workflow.logger.info("Starting RadReportToEmbedding workflow for date %s (batch %d)", workflow_input.date, workflow_input.batch_num+1)

        # Query delta lake for message IDs
        workflow.logger.info("Beginning activity query_delta_lake_for_message_ids")
        message_ids_output = await workflow.execute_activity(
            activities.query_delta_lake_for_message_ids,
            models.QueryDeltaLakeForMessageIdsActivityInput(
                delta_table_path=workflow_input.rad_report_delta_table_path,
                date=workflow_input.date,
            ),
            start_to_close_timeout=timedelta(minutes=1),
        )

        # Chunk message IDs into batches
        next_batch_num = workflow_input.batch_num + 1
        batch_start_idx = workflow_input.batch_num * workflow_input.batch_size
        batch_end_idx = next_batch_num * workflow_input.batch_size
        message_ids = sorted(message_ids_output.message_ids)[batch_start_idx:batch_end_idx]

        # Path to scratch space for this workflow
        workflow_scratch_space = (
            workflow_input.scratch_space_root.rstrip("/")
            + "/"
            + self.__class__.__name__
            + "/"
            + workflow.info().workflow_id
            + "/"
            + workflow.info().run_id
        )

        workflow.logger.info(
            "Beginning activity embed_report_text_from_delta_lake for %d/%d message ids (batch %d)",
            len(message_ids), len(message_ids_output.message_ids), workflow_input.batch_num+1,
        )
        embeddings_activity_handles = [
            workflow.start_activity(
                activities.embed_report_text_from_delta_lake,
                models.EmbedRadReportTextFromDeltaLakeActivityInput(
                    delta_table_path=workflow_input.rad_report_delta_table_path,
                    date=workflow_input.date,
                    message_id=message_id,
                    workflow_scratch_space=workflow_scratch_space,
                ),
                task_queue=EMBEDDINGS_TASK_QUEUE,
                start_to_close_timeout=timedelta(seconds=30),
            )
            for message_id in message_ids
        ]
        # Wait for all embeddings to be generated
        await asyncio.gather(*embeddings_activity_handles)

        # Save embeddings to delta lake
        workflow.logger.info("Beginning activity save_embeddings_to_delta_lake")
        await workflow.execute_activity(
            activities.save_embeddings_to_delta_lake,
            models.SaveEmbeddingsToDeltaLakeActivityInput(
                workflow_scratch_space=workflow_scratch_space,
                delta_table_path=workflow_input.embedding_delta_table_path,
            ),
            start_to_close_timeout=timedelta(minutes=1),
        )

        # Clean up scratch space
        workflow.logger.info("Beginning activity clean_up_scratch_space")
        await workflow.execute_activity(
            activities.clean_up_scratch_space,
            models.CleanUpScratchSpaceActivityInput(
                workflow_scratch_space=workflow_scratch_space
            ),
            start_to_close_timeout=timedelta(minutes=1),
        )

        # If there are more batches to process, schedule the next batch
        if batch_end_idx < len(message_ids_output.message_ids):
            workflow.logger.info("Scheduling batch %d", next_batch_num+1)
            workflow.continue_as_new(
                models.RadReportToEmbeddingWorkflowInput(
                    rad_report_delta_table_path=workflow_input.rad_report_delta_table_path,
                    embedding_delta_table_path=workflow_input.embedding_delta_table_path,
                    scratch_space_root=workflow_input.scratch_space_root,
                    date=workflow_input.date,
                    batch_size=workflow_input.batch_size,
                    batch_num=next_batch_num,
                )
            )

        workflow.logger.info("RadReportToEmbedding workflow completed")
        return models.RadReportToEmbeddingWorkflowOutput()
