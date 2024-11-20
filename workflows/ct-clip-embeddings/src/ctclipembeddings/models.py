from dataclasses import dataclass

from ctclipembeddings.shared import DEFAULT_BATCH_SIZE


@dataclass(frozen=True)
class QueryDeltaLakeForMessageIdsActivityInput:
    delta_table_path: str
    date: str


@dataclass(frozen=True)
class QueryDeltaLakeForMessageIdsActivityOutput:
    message_ids: list[str]


@dataclass(frozen=True)
class RadReportToEmbeddingWorkflowInput:
    rad_report_delta_table_path: str
    embedding_delta_table_path: str
    scratch_space_root: str
    date: str
    batch_size: int = DEFAULT_BATCH_SIZE
    batch_num: int = 0


@dataclass(frozen=True)
class RadReportToEmbeddingWorkflowOutput:
    pass


@dataclass(frozen=True)
class EmbedRadReportTextFromDeltaLakeActivityInput:
    delta_table_path: str
    date: str
    message_id: str
    workflow_scratch_space: str


@dataclass(frozen=True)
class EmbedRadReportTextFromDeltaLakeActivityOutput:
    date: str
    message_id: str
    embedding_path: str


@dataclass(frozen=True)
class SaveEmbeddingsToDeltaLakeActivityInput:
    delta_table_path: str
    workflow_scratch_space: str


@dataclass(frozen=True)
class Embedding:
    date: str
    message_id: str
    vector_embedding: list[float]


@dataclass(frozen=True)
class CleanUpScratchSpaceActivityInput:
    workflow_scratch_space: str
