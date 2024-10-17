import 'server-only';

import { generateId } from 'ai';
import {
  createAI,
  createStreamableUI,
  createStreamableValue,
  getMutableAIState,
  streamUI,
} from 'ai/rsc';
import { AzureOpenAI } from 'openai';
import { buildModelInstructions } from '@/lib/vector-search';
import { AZURE_API_VERSION, supportedModels } from '@/lib/models';
import { z } from 'zod';
import { AiMessage } from '@/components/message';
import { LoadingEllipses } from '@/components/loading';
import { DataTable } from '@/components/data-table';
import { DbQueryDisplay } from '@/components/db-query-display';
import { AIState, ClientMessage, ClientMessageCohortAction, Cohort } from '@/lib/types';
import { CohortChart } from '@/components/cohort-chart';
import { cohortInterrogation } from '@/lib/assistant';
import { Markdown } from '@/components/markdown';
import { stringifyError, tryToCloseStream } from '@/lib/utils';
import { buildAndSaveCohort } from '../cohort-builder';
import { ChartDisplay } from '@/components/copilot-chart-display';
import { CodeBlock } from '@/components/code';
import { SYSTEM_PROMPT_MESSAGE } from './prompt';

const DEFAULT_RESULT_LIMIT = 10_000;
const MAXIMUM_RESULTS = 100_000;
const DEFAULT_COSINE_DISTANCE = 1;
const MAX_COSINE_DISTANCE = 2;
const COHORT_MAP: { [fileId: string]: Cohort } = {};

let abortController: AbortController;

export async function abortConversation() {
  'use server';
  abortController.abort();
}

export async function continueConversation(
  input: string,
  model: string,
  images: string[],
): Promise<ClientMessage> {
  'use server';

  const openai = new AzureOpenAI({
    apiKey: process.env.AZURE_API_KEY,
    apiVersion: AZURE_API_VERSION,
    endpoint: `https://${process.env.AZURE_RESOURCE_NAME}.openai.azure.com`,
  });

  abortController = new AbortController();
  const signal = abortController.signal;
  const aiState = getMutableAIState();
  const lastCohortFileId = aiState.get().cohortFileId;
  let lastCohort = COHORT_MAP[lastCohortFileId];

  const userContent = JSON.stringify({
    text: input,
    containsImages: images.length > 0, // We needed a way to tell the AI the user passed an image without passing said image through AI, which always messes it up
    hasCohort: !!lastCohort,
  });

  aiState.update({
    ...aiState.get(),
    images: [...aiState.get().images, ...images],
    messages: [
      ...aiState.get().messages,
      {
        role: 'user',
        content: userContent,
      },
    ],
  });

  const cohortFileIdStream = createStreamableValue(lastCohortFileId ? lastCohortFileId : undefined);
  const cohortTableStream = createStreamableUI(
    lastCohort ? (
      <DataTable data={lastCohort.data} fileIdStream={cohortFileIdStream.value} />
    ) : (
      <LoadingEllipses />
    ),
  );
  const cohortChartStream = createStreamableUI(
    lastCohort?.charts ? <CohortChart charts={lastCohort.charts} /> : <LoadingEllipses />,
  );
  const cohortUserQueryStream = createStreamableValue(
    lastCohort?.userQuery ? lastCohort.userQuery : undefined,
  );
  const cohortDbQueryStream = createStreamableUI(
    lastCohort?.dbQuery ? <DbQueryDisplay query={lastCohort.dbQuery} /> : <LoadingEllipses />,
  );

  const aiMessageInProgressStream = createStreamableValue(true);
  const cohortActionStream = createStreamableValue<ClientMessageCohortAction>('leave');
  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>;
  let textNode: undefined | React.ReactNode;
  try {
    const result = await streamUI({
      model: supportedModels[model].provider,
      abortSignal: signal,
      initial: (
        <AiMessage>
          <LoadingEllipses />
        </AiMessage>
      ),
      system: SYSTEM_PROMPT_MESSAGE,
      messages: [
        ...aiState.get().messages,
        {
          role: 'user',
          content: userContent,
        },
      ],
      text: ({ content, done, delta }) => {
        if (!textStream) {
          textStream = createStreamableValue('');
          textNode = <Markdown textStream={textStream.value} />;
        }

        if (done) {
          aiState.done({
            ...aiState.get(),
            messages: [...aiState.get().messages, { role: 'assistant', content }],
          });
          tryToCloseStream(
            textStream,
            cohortTableStream,
            cohortFileIdStream,
            cohortChartStream,
            cohortUserQueryStream,
            cohortDbQueryStream,
            cohortActionStream,
          );
          aiMessageInProgressStream.done(false);
        } else {
          textStream.append(delta);
        }

        return <AiMessage>{textNode}</AiMessage>;
      },
      tools: {
        cohortSearch: {
          description: `Build or refine a cohort matching the user's text or image query`,
          parameters: z.object({
            userQuery: z
              .string()
              .optional()
              .describe(`The user's text prompt for the cohort semantic search`),
            modelInstructions: z
              .string()
              .optional()
              .describe(
                `Any instructions or directions from the user for the model that's performing the cohort search`,
              ),
            maxDistance: z
              .number()
              .max(MAX_COSINE_DISTANCE)
              .default(DEFAULT_COSINE_DISTANCE)
              .describe(`The maximum distance for the cohort semantic search`),
            resultLimit: z
              .number()
              .max(MAXIMUM_RESULTS)
              .default(DEFAULT_RESULT_LIMIT)
              .describe(`The maximum cohort size`),
            isRefinement: z
              .boolean()
              .default(false)
              .describe(`Is the user refining an existing cohort?`),
          }),
          generate: ({ userQuery, maxDistance, resultLimit, isRefinement, modelInstructions }) => {
            if (textStream) {
              textStream.done();
            }
            console.log(
              JSON.stringify({
                userQuery,
                maxDistance,
                resultLimit,
                isRefinement,
                modelInstructions,
              }),
            );

            cohortUserQueryStream.update('');
            cohortFileIdStream.update('');
            cohortDbQueryStream.update(<LoadingEllipses />);
            cohortTableStream.update(<LoadingEllipses />);
            cohortChartStream.update(<LoadingEllipses />);
            cohortActionStream.done('add');

            const allImages = [...aiState.get().images, ...images];
            const resultLimitReadable = resultLimit.toLocaleString();

            // Strip the default text that accompanies images
            if (allImages.length > 0 && userQuery?.endsWith('images like this')) {
              userQuery = '';
            }
            const userQueryDisplay = `${userQuery || 'similar images'} within cosine distance ${maxDistance} (max results ${resultLimitReadable})`;
            cohortUserQueryStream.done(userQueryDisplay);

            let cohortSearchStatus = 'Searching for cohort';
            if (resultLimit > DEFAULT_RESULT_LIMIT) {
              cohortSearchStatus += `. You have requested up to ${resultLimitReadable} results, which may take a few minutes.`;
            }
            const statusStream = createStreamableValue(cohortSearchStatus);
            const copilotCohortStream = createStreamableUI(<LoadingEllipses />);
            const copilotAssistantStream = createStreamableUI();
            try {
              (async () => {
                try {
                  const aiMessage = await buildAndSaveCohort(
                    openai,
                    COHORT_MAP,
                    userQuery,
                    allImages,
                    maxDistance,
                    resultLimit,
                    buildModelInstructions(modelInstructions, lastCohort?.dbQuery),
                    model,
                    signal,
                    statusStream,
                    cohortTableStream,
                    cohortDbQueryStream,
                    copilotCohortStream,
                    userQueryDisplay,
                    cohortFileIdStream,
                    aiMessageInProgressStream,
                    cohortChartStream,
                  );
                  const cohortFileId = aiMessage.fileId;
                  if (!cohortFileId) {
                    aiState.done({
                      ...aiState.get(),
                      cohortFileId,
                      messages: [...aiState.get().messages, aiMessage],
                    });
                    cohortChartStream.done(<CohortChart />);
                    copilotAssistantStream.done();
                    statusStream.update('completed');
                    return;
                  }

                  lastCohort = COHORT_MAP[cohortFileId];
                  statusStream.update('Generating charts');
                  const assistantTextStream = createStreamableValue('');
                  const preambleTextStream = createStreamableValue('');
                  const codeStream = createStreamableValue('');
                  const copilotChartStream = createStreamableUI();
                  copilotAssistantStream.done(
                    <ChartDisplay
                      preambleStream={preambleTextStream.value}
                      text={<Markdown textStream={assistantTextStream.value} />}
                      code={<CodeBlock textStream={codeStream.value} />}
                      charts={copilotChartStream.value}
                      inProgressStream={aiMessageInProgressStream.value}
                    />,
                  );
                  await cohortInterrogation(
                    supportedModels[model].assistantId,
                    openai,
                    'Generate 4 separate plots for this cohort: Age, Sex, Manufacturer, and Presence of Medical Conditions',
                    cohortFileId,
                    aiState.get().threadId,
                    signal,
                    aiMessageInProgressStream,
                    preambleTextStream,
                    assistantTextStream,
                    codeStream,
                    statusStream,
                    copilotChartStream,
                    (
                      threadId: string | undefined,
                      runId: string | undefined,
                      charts: string[],
                      text: string,
                    ) => {
                      lastCohort.charts = [...lastCohort.charts, ...charts];
                      cohortChartStream.done(<CohortChart charts={lastCohort.charts} />);
                      aiState.done({
                        ...aiState.get(),
                        threadId,
                        cohortFileId,
                        messages: [
                          ...aiState.get().messages,
                          {
                            role: 'assistant',
                            content:
                              aiMessage.content +
                              `. Called assistant API on thread ${threadId}: ${text}`,
                            runId,
                            fileId: cohortFileId,
                          },
                        ],
                      });
                    },
                  );
                } catch (error: any) {
                  console.error(error);
                  const errorMessage = `Error: ${stringifyError(error)}`;
                  try {
                    copilotAssistantStream.done(errorMessage);
                    statusStream.update('error');
                  } catch (error: any) {
                    // This can happen if we already rendered & closed the copilotAssistantStream, and ran into an error later
                    statusStream.update(errorMessage);
                  }
                  tryToCloseStream(
                    cohortTableStream,
                    cohortFileIdStream,
                    cohortChartStream,
                    cohortUserQueryStream,
                    cohortDbQueryStream,
                    copilotCohortStream,
                    cohortActionStream,
                  );
                  aiState.done({
                    ...aiState.get(),
                    messages: [
                      ...aiState.get().messages,
                      {
                        role: 'assistant',
                        content: error,
                      },
                    ],
                  });
                } finally {
                  statusStream.done();
                  aiMessageInProgressStream.done(false);
                }
              })();

              return (
                <AiMessage status={statusStream.value}>
                  {textStream && (
                    <>
                      {textNode}
                      <p className="prose">&nbsp;</p>
                    </>
                  )}
                  {copilotCohortStream.value}
                  {copilotAssistantStream.value}
                </AiMessage>
              );
            } catch (error: any) {
              console.error(error);
              statusStream.done('error');
              tryToCloseStream(
                cohortTableStream,
                cohortFileIdStream,
                cohortChartStream,
                cohortUserQueryStream,
                cohortDbQueryStream,
                copilotCohortStream,
                copilotAssistantStream,
                cohortActionStream,
              );
              if (textStream) {
                tryToCloseStream(textStream);
              }
              aiState.done({
                ...aiState.get(),
                messages: [
                  ...aiState.get().messages,
                  {
                    role: 'assistant',
                    content: error,
                  },
                ],
              });
              aiMessageInProgressStream.done(false);
              return (
                <AiMessage status={statusStream.value}>
                  {textStream && textNode}
                  {error.response ? error.response.data : error.message}
                </AiMessage>
              );
            }
          },
        },
        cohortInterrogation: {
          // We needed to make this its own tool, rather than just using the assistants API for the whole shebang because we
          // cannot upload a file during a run and get code interpreter to use it, see more:
          // https://community.openai.com/t/assistants-api-adding-a-file-during-run-submit-tool-outputs/619341/20
          description: `Answer questions about the cohort, generate plots and distributions, and offer summary information`,
          // Dummy parameter so Gemeni will work (similar to issue https://github.com/vercel/ai/issues/2103)
          parameters: z.object({
            request: z.string().optional().describe(`The user's request`),
          }),
          generate: async () => {
            cohortFileIdStream.done();
            cohortUserQueryStream.done();
            cohortDbQueryStream.done();
            cohortTableStream.done();

            if (!textStream) {
              textStream = createStreamableValue('');
              textNode = <Markdown textStream={textStream.value} />;
            } else {
              textStream.append('\n');
            }

            if (!lastCohort) {
              textStream.done();
              cohortChartStream.done();
              aiMessageInProgressStream.done(false);
              cohortActionStream.done('leave');
              return <AiMessage>Error: no cohort in context</AiMessage>;
            }

            cohortActionStream.done('update');
            const statusStream = createStreamableValue('Working');
            const preambleTextStream = createStreamableValue();
            const codeStream = createStreamableValue('');
            const copilotAssistantStream = createStreamableUI();
            (async () => {
              try {
                await cohortInterrogation(
                  supportedModels[model].assistantId,
                  openai,
                  input,
                  lastCohortFileId,
                  aiState.get().threadId,
                  signal,
                  aiMessageInProgressStream,
                  preambleTextStream,
                  textStream,
                  codeStream,
                  statusStream,
                  copilotAssistantStream,
                  (
                    threadId: string | undefined,
                    runId: string | undefined,
                    charts: string[],
                    text: string,
                  ) => {
                    lastCohort.charts = [...lastCohort.charts, ...charts];
                    cohortChartStream.done(<CohortChart charts={lastCohort.charts} />);
                    aiState.done({
                      ...aiState.get(),
                      threadId,
                      cohortFileId: lastCohortFileId,
                      messages: [
                        ...aiState.get().messages,
                        {
                          role: 'assistant',
                          content: `Called assistant API on thread ${threadId}: ${text}`,
                          runId,
                        },
                      ],
                    });
                  },
                );
              } catch (error: any) {
                console.error(error);
                const errorMessage = `Error: ${JSON.stringify(error.response ? error.response.data : error.message)}`;
                try {
                  copilotAssistantStream.done(errorMessage);
                  statusStream.update('error');
                } catch (error: any) {
                  // This can happen if we already rendered & closed the copilotAssistantStream, and ran into an error later
                  statusStream.update(errorMessage);
                }
                tryToCloseStream(
                  textStream,
                  preambleTextStream,
                  codeStream,
                  cohortChartStream,
                  cohortActionStream,
                );
              } finally {
                statusStream.done();
                aiMessageInProgressStream.done(false);
              }
            })();
            return (
              <AiMessage status={statusStream.value}>
                <ChartDisplay
                  preambleStream={preambleTextStream.value}
                  text={textNode}
                  code={<CodeBlock textStream={codeStream.value} />}
                  charts={copilotAssistantStream.value}
                  inProgressStream={aiMessageInProgressStream.value}
                />
              </AiMessage>
            );
          },
        },
      },
    });

    return {
      id: generateId(),
      role: 'assistant',
      display: result.value,
      cohortDisplay: {
        table: cohortTableStream.value,
        chart: cohortChartStream.value,
        userQuery: cohortUserQueryStream.value,
        dbQuery: cohortDbQueryStream.value,
        fileId: cohortFileIdStream.value,
      },
      inProgress: aiMessageInProgressStream.value,
      cohortAction: cohortActionStream.value,
    };
  } catch (error: any) {
    aiMessageInProgressStream.update(false);
    tryToCloseStream(
      cohortChartStream,
      cohortTableStream,
      cohortUserQueryStream,
      cohortDbQueryStream,
      cohortFileIdStream,
      cohortActionStream,
      aiMessageInProgressStream,
    );
    if (textStream) {
      tryToCloseStream(textStream);
    }
    return {
      id: generateId(),
      role: 'assistant',
      display: (
        <AiMessage>{`Error: ${error.response ? error.response.data : error.message}`}</AiMessage>
      ),
      cohortDisplay: {
        table: cohortTableStream.value,
        chart: cohortChartStream.value,
        userQuery: cohortUserQueryStream.value,
        dbQuery: cohortDbQueryStream.value,
        fileId: cohortFileIdStream.value,
      },
      inProgress: aiMessageInProgressStream.value,
      cohortAction: cohortActionStream.value,
    };
  }
}

export const AI = createAI<AIState, ClientMessage[]>({
  actions: { continueConversation, abortConversation },
  initialAIState: { messages: [], images: [] },
  initialUIState: [],
});
