import { JSONValue } from 'ai';
import { Dispatch, SetStateAction, useEffect } from 'react';

import { UIBlock } from './block';
import { ImageRow } from '@/lib/weaviate/types';

type StreamingDelta = {
  type:
    | 'query'
    | 'id'
    | 'searchId'
    | 'data'
    | 'databaseQuery'
    | 'maxDistance'
    | 'resultLimit'
    | 'finish'
    | 'error';
  content: string | ImageRow[];
};

export function useBlockStream({
  streamingData,
  setBlock,
}: {
  streamingData: JSONValue[] | undefined;
  setBlock: Dispatch<SetStateAction<UIBlock>>;
}) {
  useEffect(() => {
    const mostRecentDelta = streamingData?.at(-1);
    if (!mostRecentDelta) return;

    const delta = mostRecentDelta as StreamingDelta;

    setBlock((draftBlock) => {
      switch (delta.type) {
        case 'searchId':
          return {
            ...draftBlock,
            searchId: delta.content as string,
          };

        case 'id':
          return {
            ...draftBlock,
            datasetId: delta.content as string,
          };

        case 'query':
          return {
            ...draftBlock,
            query: delta.content as string,
          };

        case 'databaseQuery':
          return {
            ...draftBlock,
            databaseQuery: delta.content as string,
          };

        case 'maxDistance':
          return {
            ...draftBlock,
            maxDistance: parseFloat(delta.content as string),
          };

        case 'resultLimit':
          return {
            ...draftBlock,
            resultLimit: parseInt(delta.content as string),
          };

        case 'data': {
          const results = JSON.parse(delta.content as string) as ImageRow[];
          return {
            ...draftBlock,
            results: results,
            resultsCount: results.length,
          };
        }

        case 'finish':
          return {
            ...draftBlock,
            status: 'idle',
          };

        default:
          return draftBlock;
      }
    });
  }, [streamingData, setBlock]);
}
