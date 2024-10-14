import AzureOpenAI from 'openai';
import { MessageContentDelta } from 'openai/resources/beta/threads/messages.mjs';
import { ToolCallDelta } from 'openai/resources/beta/threads/runs/steps.mjs';
import { tryToCloseStream } from '@/lib/utils';
import { Chart } from '@/components/chart';

export async function cohortInterrogation(
  assistantId: string,
  openai: AzureOpenAI,
  question: string,
  fileId: string | undefined,
  threadId: string | undefined,
  signal: AbortSignal,
  aiMessageInProgress: any,
  preambleTextStream: any,
  textStream: any,
  codeStream: any,
  statusStream: any,
  copilotChartStream: any,
  aiStateCallback: (
    threadId: string | undefined,
    runId: string | undefined,
    charts: string[],
    text: string,
  ) => void,
) {
  let runId: string | undefined;
  let charts: string[] = [];
  let text = '';
  let totalImageDownloads = 0;
  let completedImageDownloads = 0;
  let mainLoopComplete = false;
  let preambleShown = false;
  let hasText = false;
  let hasCode = false;

  const updateStatus = (status: string) => statusStream.update(status);

  const appendText = (newText: string) => {
    text += newText;
    textStream.append(newText);
    hasText = true;
  };

  const appendCode = (code: string) => {
    codeStream.append(code);
    hasCode = true;
  };

  const showPreambleOnce = () => {
    if (!preambleShown) {
      preambleTextStream.append('I am generating some code to fulfill the request.\n\n');
      preambleShown = true;
    }
  };

  const downloadImage = async (fileId: string) => {
    try {
      const response = await openai.files.content(fileId);
      const buffer = await response.arrayBuffer();
      const imageSrc = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
      charts.push(imageSrc);
      copilotChartStream.append(<Chart imageSrc={imageSrc} />);
    } finally {
      completedImageDownloads++;
      checkAndFinalizeStreams();
    }
  };

  const checkAndFinalizeStreams = () => {
    if (mainLoopComplete && completedImageDownloads === totalImageDownloads) {
      aiStateCallback(threadId, runId, charts, text);
      tryToCloseStream(preambleTextStream, textStream, codeStream, copilotChartStream);
      console.log('Closed streams');
    }
  };

  try {
    const assistantMessage = {
      role: 'user' as const,
      content: question,
      attachments: fileId
        ? [{ file_id: fileId, tools: [{ type: 'code_interpreter' as const }] }]
        : undefined,
    };

    let run;
    if (threadId) {
      await openai.beta.threads.messages.create(threadId, assistantMessage, { signal });
      run = await openai.beta.threads.runs.create(
        threadId,
        { assistant_id: assistantId, stream: true },
        { signal },
      );
    } else {
      run = await openai.beta.threads.createAndRun(
        {
          assistant_id: assistantId,
          stream: true,
          thread: { messages: [assistantMessage] },
        },
        { signal },
      );
    }

    for await (const delta of run) {
      if (signal.aborted) {
        run.controller.abort();
        break;
      }

      aiMessageInProgress.update(true);
      const { data, event } = delta;

      switch (event) {
        case 'thread.created':
          threadId = data.id;
          break;
        case 'thread.run.created':
          runId = data.id;
          break;
        case 'thread.message.delta':
          updateStatus('Generating message');
          data.delta.content?.forEach((part: MessageContentDelta) => {
            if (part.type === 'text' && part.text?.value) {
              appendText(part.text.value);
            } else if (part.type === 'image_file' && part.image_file?.file_id) {
              totalImageDownloads++;
              downloadImage(part.image_file.file_id);
            }
          });
          break;
        case 'thread.message.completed':
          if (hasText) {
            appendText('\n');
          }
          break;
        case 'thread.run.step.delta':
          if (data.delta.step_details?.type === 'tool_calls') {
            updateStatus('Generating code');
            showPreambleOnce();
            data.delta.step_details.tool_calls?.forEach((tool: ToolCallDelta) => {
              if (tool.type === 'code_interpreter' && tool.code_interpreter?.input) {
                appendCode(tool.code_interpreter.input);
              }
            });
          }
          break;
        case 'thread.run.step.completed':
          if (hasCode) {
            appendCode('\n');
          }
          break;
        case 'thread.run.completed':
          updateStatus('completed');
          break;
        default:
          if (
            event.endsWith('error') ||
            event.endsWith('failed') ||
            event.endsWith('cancelled') ||
            event.endsWith('expired')
          ) {
            throw new Error(event);
          }
      }
    }

    mainLoopComplete = true;
    checkAndFinalizeStreams();
  } catch (error: any) {
    updateStatus('Error');
    appendText(`\n\nError: ${error.message}`);
    mainLoopComplete = true;
    checkAndFinalizeStreams();
  }
}