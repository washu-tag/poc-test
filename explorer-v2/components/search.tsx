'use client';

import { useChat } from 'ai/react';
import { useSWRConfig } from 'swr';
import { SearchHeader } from './search-header';
import { useCallback, useEffect, useState } from 'react';
import { BlockStreamHandler } from './block-stream-handler';
import { Block, UIBlock } from './block';
import { toast } from 'sonner';
import { DEFAULT_MAX_DISTANCE, DEFAULT_RESULT_LIMIT, Step } from '@/lib/types';
import { UseChatContext } from '@/context/use-chat-context';
import { Dataset } from '@/db/schema';

export function Search({ id, selectedModelId }: { id: string; selectedModelId: string }) {
  const { mutate } = useSWRConfig();

  const [maxDistance, setMaxDistance] = useState(DEFAULT_MAX_DISTANCE);
  const [resultLimit, setResultLimit] = useState(DEFAULT_RESULT_LIMIT);

  const [block, setBlock] = useState<UIBlock>({
    searchId: id,
    datasetId: 'init',
    createdAt: undefined,
    query: '',
    databaseQuery: '',
    maxDistance: DEFAULT_MAX_DISTANCE,
    resultLimit: DEFAULT_RESULT_LIMIT,
    resultsCount: 0,
    results: [],
    status: 'idle',
  });

  const setBlockFromDataset = useCallback(
    (dataset: Dataset) => {
      const datasetMaxDistance = dataset.maxDistance
        ? parseFloat(dataset.maxDistance)
        : DEFAULT_MAX_DISTANCE;
      const datasetResultLimit = dataset.resultLimit || DEFAULT_RESULT_LIMIT;
      setBlock({
        searchId: dataset.searchId ?? '',
        datasetId: dataset.id ?? '',
        query: dataset.query || '',
        createdAt: dataset.createdAt || '',
        databaseQuery: dataset.databaseQuery || '',
        maxDistance: datasetMaxDistance,
        resultLimit: datasetResultLimit,
        resultsCount: dataset.resultsCount || 0,
        results: dataset.results || [],
        status: 'idle',
      });
      // TODO get rid of this and use a form submission
      setMaxDistance(datasetMaxDistance);
      setResultLimit(datasetResultLimit);
    },
    [setBlock, setMaxDistance, setResultLimit],
  );

  const {
    handleSubmit,
    input,
    setInput,
    isLoading,
    stop,
    data: streamingData,
    error,
  } = useChat({
    body: { id, modelId: selectedModelId },
    api: '/api/search',
    onFinish: () => {
      mutate('/api/history');
    },
  });

  const submitForm = useCallback(
    (step: Step, datasetId?: string) => {
      window.history.replaceState({}, '', `/search/${id}`);

      // Clear the block state we're going to update
      let stepParams: Partial<UIBlock> = {
        status: 'streaming',
      };
      /* eslint-disable no-fallthrough */
      switch (step) {
        case Step.BuildQuery:
          stepParams = {
            ...stepParams,
            createdAt: undefined,
            query: '',
          };
        case Step.ParseQuery:
          stepParams = {
            ...stepParams,
            databaseQuery: '',
          };
        case Step.ExecuteQuery:
          stepParams = {
            ...stepParams,
            maxDistance,
            resultLimit,
            resultsCount: 0,
            results: [],
            status: 'streaming',
          };
          break;
        case Step.Chart:
        case Step.Summarize:
        default:
          break;
      }
      /* eslint-enable no-fallthrough */

      setBlock((currentBlock) => ({
        ...currentBlock,
        ...stepParams,
      }));

      handleSubmit(
        {},
        {
          body: {
            maxDistanceInit: maxDistance,
            resultLimitInit: resultLimit,
            step,
            existingDatasetId: datasetId,
          },
        },
      );
    },
    [handleSubmit, id, maxDistance, resultLimit, setBlock],
  );

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  return (
    <>
      <div className="flex flex-col min-w-0 bg-background">
        <SearchHeader selectedModelId={selectedModelId} />
      </div>

      <UseChatContext.Provider
        value={{
          submitForm,
          isLoading,
          stop,
          input,
          setInput,
          maxDistance,
          setMaxDistance,
          resultLimit,
          setResultLimit,
        }}
      >
        <Block block={block} setBlockFromDataset={setBlockFromDataset} />
      </UseChatContext.Provider>

      <BlockStreamHandler setBlock={setBlock} streamingData={streamingData} />
    </>
  );
}
