import { CoreUserMessage, Message, StreamData } from 'ai';
import { models } from '@/ai/models';
import { auth } from '@/app/(auth)/auth';
import {
  deleteSearchById,
  getDatasetById,
  getSearchById,
  saveDataset,
  saveSearch,
  updateDataset,
} from '@/db/queries';
import { generateTitleFromUserMessage } from '../../actions';
import { generateUUID } from '@/lib/utils';
import { findRelevantContent, parseAndExecute } from '@/lib/weaviate/vector-search';
import { DEFAULT_MAX_DISTANCE, DEFAULT_RESULT_LIMIT, Step } from '@/lib/types';

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
    maxDistanceInit,
    resultLimitInit,
    step = Step.BuildQuery,
    existingDatasetId,
  }: {
    id: string;
    messages: Array<Message>;
    modelId: string;
    maxDistanceInit?: number;
    resultLimitInit?: number;
    step?: Step;
    existingDatasetId?: string;
  } = await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const search = await getSearchById({ id });

  if (!search) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveSearch({ id, userId: session.user.id, title });
  }

  let persistOperation = saveDataset;
  let dataset;
  if (existingDatasetId) {
    dataset = await getDatasetById({ id: existingDatasetId });
    persistOperation = updateDataset;
  }

  const datasetMaxDistance = dataset?.maxDistance
    ? parseFloat(dataset.maxDistance)
    : DEFAULT_MAX_DISTANCE;
  const maxDistance = maxDistanceInit || datasetMaxDistance;
  const resultLimit = resultLimitInit || dataset?.resultLimit || DEFAULT_RESULT_LIMIT;

  let query;
  switch (step) {
    case Step.ParseQuery:
    case Step.ExecuteQuery:
    case Step.Summarize:
    case Step.Chart:
      if (!dataset || dataset.userId !== session.user.id) {
        return new Response('No dataset found', { status: 404 });
      }
      query = dataset.query;
      break;
    case Step.BuildQuery:
    default:
      query = userMessage.content as string;
      break;
  }

  const datasetId = dataset?.id || generateUUID();
  const streamingData = new StreamData();
  (async () => {
    try {
      // Re-check session.user since we're async
      if (!session.user?.id) {
        throw new Error('Unauthorized');
      }

      streamingData.append({
        type: 'searchId',
        content: id,
      });

      streamingData.append({
        type: 'id',
        content: datasetId,
      });

      streamingData.append({
        type: 'query',
        content: query,
      });

      streamingData.append({
        type: 'maxDistance',
        content: maxDistance,
      });

      streamingData.append({
        type: 'resultLimit',
        content: resultLimit,
      });

      let databaseQuery = dataset?.databaseQuery;
      let data = dataset?.results || [];

      /* eslint-disable no-fallthrough */
      switch (step) {
        case Step.ParseQuery:
          databaseQuery = userMessage.content as string;
        case Step.ExecuteQuery:
          if (!databaseQuery) {
            throw new Error('No generated query found, start from an earlier step');
          }
          data = await parseAndExecute(databaseQuery, [], maxDistance, resultLimit, streamingData);
        case Step.Summarize: // TODO summary
        case Step.Chart: // TODO charts
          break;
        case Step.BuildQuery:
        default: {
          const results = await findRelevantContent(
            query || '',
            [],
            maxDistance,
            resultLimit,
            '',
            model.id,
            streamingData,
            request.signal
          );
          data = results.data;
          databaseQuery = results.dbQuery;
          break;
        }
      }
      /* eslint-enable no-fallthrough */

      streamingData.append({
        type: 'data',
        content: JSON.stringify(data),
      });

      streamingData.append({ type: 'finish', content: '' });

      await persistOperation({
        id: datasetId,
        query: query || '',
        databaseQuery: databaseQuery || '',
        maxDistance,
        resultLimit,
        resultsCount: data.length,
        results: data,
        userId: session.user.id,
        searchId: id,
      });
    } catch (error) {
      console.error(error);
    } finally {
      streamingData.close();
    }
  })();
  return new Response(streamingData.stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const search = await getSearchById({ id });

    if (search.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteSearchById({ id });

    return new Response('Search deleted', { status: 200 });
  } catch (_error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}

function getMostRecentUserMessage(messages: Array<Message>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1) as CoreUserMessage;
}
