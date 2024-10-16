import { DataTable } from "@/components/data-table";
import { DbQueryDisplay } from "@/components/db-query-display";
import { findRelevantContent } from "./vector-search";
import OpenAI from "openai";
import { Cohort } from "./types";
import { CohortDisplay } from "@/components/copilot-cohort-display";

export const buildAndSaveCohort = async (
  openai: OpenAI,
  cohortMap: { [fileId: string]: Cohort },
  userQuery: string | undefined,
  allImages: string[],
  maxDistance: number,
  resultLimit: number,
  modelInstructions: string | undefined,
  model: string,
  signal: AbortSignal,
  statusStream: any,
  cohortTable: any,
  cohortDbQuery: any,
  copilotDisplayStream: any,
  userQueryDisplay: string,
  cohortFileIdStream: any,
  aiMessageInProgress: any,
  cohortChartStream: any
): Promise<{ role: string; content: string; fileId?: string }> => {
  let data, file, dbQuery;
  try {
    ({ data, file, dbQuery } = await findRelevantContent(
      userQuery,
      allImages,
      maxDistance,
      resultLimit,
      modelInstructions,
      model,
      signal
    ));
  } catch (error) {
    cohortTable.update("");
    cohortDbQuery.update("");
    copilotDisplayStream.update("");
    cohortChartStream.update("");
    throw error;
  }

  statusStream.update(`Identified ${data.length} matches, generating display`);
  cohortTable.done(
    <DataTable data={data} fileIdStream={cohortFileIdStream.value} />
  );
  cohortDbQuery.done(<DbQueryDisplay query={dbQuery} />);
  copilotDisplayStream.done(
    <CohortDisplay
      hits={data.length}
      query={userQuery}
      maxDistance={maxDistance}
    />
  );

  // like a "touch" to avoid warning about slow to update
  cohortFileIdStream.update("");
  aiMessageInProgress.update(true);

  let aiMessage;
  let cohortFileId;
  if (file) {
    statusStream.update(`Uploading ${data.length}-row csv`);
    const openAiFile = await openai.files.create({
      file,
      purpose: "assistants"
    });
    cohortFileId = openAiFile.id;
    cohortFileIdStream.done(cohortFileId);
    aiMessage = {
      role: "assistant",
      content: `Query ${userQuery} with distance ${maxDistance} and result limit ${resultLimit} produced cohort containing ${data.length} studies uploaded to file_id ${cohortFileId}`,
      fileId: cohortFileId
    };
    cohortMap[cohortFileId] = {
      data,
      charts: [],
      userQuery: userQueryDisplay,
      dbQuery
    };
  } else {
    cohortFileIdStream.done();
    aiMessage = {
      role: "assistant",
      content: `No matching results`
    };
  }
  return aiMessage;
};
