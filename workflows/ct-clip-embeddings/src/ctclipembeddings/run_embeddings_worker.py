import asyncio
import concurrent.futures
import logging
import os
from time import perf_counter

import httpx
from temporalio.client import Client
from temporalio.worker import Worker

from ctclipembeddings.activities import embed_report_text_from_delta_lake
from ctclipembeddings.shared import EMBEDDINGS_TASK_QUEUE, MODEL_APP_URI_ENV, \
    MODEL_START_TIMEOUT_SECONDS_ENV, DEFAULT_MODEL_START_TIMEOUT_SECONDS, TEMPORAL_URI_ENV

logger = logging.getLogger("embeddings_worker")


async def wait_for_model_server_to_be_ready(model_app_uri: str, model_start_timeout_seconds: int = DEFAULT_MODEL_START_TIMEOUT_SECONDS):
    """Wait for the model API server to be ready by making a request to its health check endpoint"""
    # Initial wait
    await asyncio.sleep(10)

    start_time = perf_counter()
    async with httpx.AsyncClient() as client:
        while perf_counter() - start_time < model_start_timeout_seconds:
            try:
                logger.info("Checking if model server is ready...")
                response = await client.get(f"{model_app_uri}/.well-known/ready")
                response.raise_for_status()
                logger.info("Model server is ready")
                break
            except (httpx.HTTPStatusError, httpx.ConnectError, httpx.ConnectTimeout):
                logger.info("Model server is not ready yet. Waiting...")
                await asyncio.sleep(10)
        else:
            raise TimeoutError(f"Model server did not start within {model_start_timeout_seconds} seconds")


async def run_worker(temporal_uri: str, model_app_uri: str, model_start_timeout_seconds: int = DEFAULT_MODEL_START_TIMEOUT_SECONDS):
    logger.info("Temporal URI: %s, Model App URI: %s", temporal_uri, model_app_uri)

    client = await Client.connect(temporal_uri)
    with concurrent.futures.ThreadPoolExecutor() as pool:
        worker = Worker(
            client,
            task_queue=EMBEDDINGS_TASK_QUEUE,
            activities=[embed_report_text_from_delta_lake],
            activity_executor=pool,
        )
        try:
            await wait_for_model_server_to_be_ready(model_app_uri, model_start_timeout_seconds)

            logger.info("Starting worker...")
            await worker.run()
            logger.info("Worker stopped")
        except Exception as e:
            logger.exception("Worker stopped with an error.", exc_info=e)


def main():
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s"
    )

    temporal_uri = os.environ.get(TEMPORAL_URI_ENV, "localhost:7233")
    model_app_uri = os.environ.get(MODEL_APP_URI_ENV)
    model_start_timeout_seconds = int(os.environ.get(MODEL_START_TIMEOUT_SECONDS_ENV, DEFAULT_MODEL_START_TIMEOUT_SECONDS))
    asyncio.run(run_worker(temporal_uri, model_app_uri, model_start_timeout_seconds))


if __name__ == "__main__":
    import sys
    sys.exit(main())
