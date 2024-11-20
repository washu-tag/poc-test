import asyncio
import concurrent.futures
import logging
import os

from temporalio.client import Client
from temporalio.worker import Worker

from ctclipembeddings.activities import query_delta_lake_for_message_ids, save_embeddings_to_delta_lake, \
    clean_up_scratch_space
from ctclipembeddings.shared import WORKFLOW_TASK_QUEUE
from ctclipembeddings.workflows import RadReportToEmbedding

logger = logging.getLogger("workflow_worker")


async def run_worker(temporal_uri: str):
    logger.info("Temporal URI: %s", temporal_uri)

    client = await Client.connect(temporal_uri)
    with concurrent.futures.ThreadPoolExecutor() as pool:
        worker = Worker(
            client,
            task_queue=WORKFLOW_TASK_QUEUE,
            activities=[query_delta_lake_for_message_ids, save_embeddings_to_delta_lake, clean_up_scratch_space],
            workflows=[RadReportToEmbedding],
            activity_executor=pool,
        )

        logger.info("Starting worker...")
        await worker.run()
        logger.info("Worker stopped")


def main():
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s"
    )
    _temporal_uri = os.environ.get("TEMPORAL_FRONTEND_SERVICE", "localhost:7233")
    asyncio.run(run_worker(_temporal_uri))


if __name__ == "__main__":
    import sys
    sys.exit(main())
