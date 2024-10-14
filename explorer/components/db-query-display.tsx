'use client';

import { Anchor } from '@mantine/core';
import { Markdown } from './markdown';

export function DbQueryDisplay({ query }: { query: string | undefined }) {
  return (
    <>
      {query && (
        <div className="mt-2 bg-white p-4 rounded w-full">
          <div className="mb-4">
            <p className="mb-2">
              The database is queried using a combination of structured filters (&quot;filter&quot;
              in the JSON below) and semantic search (&quot;query&quot; in the JSON below).
            </p>
            <p>
              From your request, the model derived the following. If there are issues with the
              generated JSON, try explaining to the model where it went wrong and what you need
              instead. If you can use column names from the table in your request, the model will
              have an easier time understanding what you want.
            </p>
          </div>
          <Markdown text={query} />
          <p className="mt-4">
            While structured filters directly constrain your result set, semantic search results are
            determined by their{' '}
            <Anchor href="https://weaviate.io/developers/weaviate/config-refs/distances">
              cosine distance
            </Anchor>{' '}
            from your encoded query. By default, the maximum distance is set to 1. You can request
            to refine your cohort using a different value for maximum distance to narrow or broaden
            your result set. Distance values must be within the range [0-2].
          </p>
        </div>
      )}
    </>
  );
}
