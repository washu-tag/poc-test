import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { Dataset } from '@/db/schema';
import { fetcher } from '@/lib/utils';

import { ImageRow } from '@/lib/weaviate/types';
import { DatasetsView } from './dataset/datasets-view';
import { Overview } from './overview';
import { Loader } from 'lucide-react';
import ErrorPage from 'next/error';

export interface UIBlock {
  searchId: string;
  datasetId: string;
  createdAt?: Date;
  query: string;
  databaseQuery: string;
  maxDistance: number;
  resultLimit: number;
  resultsCount: number;
  results: ImageRow[];
  status: 'streaming' | 'idle';
}

export function Block({
  block,
  setBlockFromDataset,
}: {
  block: UIBlock;
  setBlockFromDataset: (dataset: Dataset) => void;
}) {
  // TODO why is this getting called from unsaved searchId (i.e. new search) whenever user enters input?
  const {
    data: datasets,
    isLoading: datasetsLoading,
    mutate: mutateDatasets,
    error,
  } = useSWR<Array<Dataset>>(
    block && block.status !== 'streaming' ? `/api/dataset?searchId=${block.searchId}` : null,
    fetcher,
    {
      shouldRetryOnError: (err) => {
        return err.status !== 404;
      },
    }
  );

  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);

  useEffect(() => {
    if (datasets && datasets.length > 0) {
      const mostRecentDataset = datasets.at(-1);

      if (mostRecentDataset) {
        setCurrentVersionIndex(datasets.length - 1);
        setBlockFromDataset(mostRecentDataset);
      }
    }
  }, [datasets, setBlockFromDataset]);

  useEffect(() => {
    if (datasets && datasets.length > 0) {
      const dataset = datasets.at(currentVersionIndex);

      if (dataset) {
        setBlockFromDataset(dataset);
      }
    }
  }, [currentVersionIndex, datasets, setBlockFromDataset]);

  useEffect(() => {
    mutateDatasets();
  }, [block.status, mutateDatasets]);

  const handleVersionChange = (type: 'next' | 'prev') => {
    if (!datasets) return;

    if (type === 'prev') {
      if (currentVersionIndex > 0) {
        setCurrentVersionIndex((index) => index - 1);
      }
    } else if (type === 'next') {
      if (currentVersionIndex < datasets.length - 1) {
        setCurrentVersionIndex((index) => index + 1);
      }
    }
  };

  if (error && error.status !== 404) {
    return <ErrorPage statusCode={error.status} />;
  }

  return (
    <>
      {block.datasetId === 'init' ? (
        <>
          {datasetsLoading ? (
            <Loader className="mx-auto my-auto animate-spin" size={64} />
          ) : (
            <Overview />
          )}
        </>
      ) : (
        <DatasetsView
          block={block}
          datasetsLoading={datasetsLoading}
          handleVersionChange={handleVersionChange}
          currentVersionIndex={currentVersionIndex}
          datasetsLength={datasets ? datasets.length : 0}
        />
      )}
    </>
  );
}
