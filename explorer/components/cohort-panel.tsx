import React, { useState } from 'react';
import { useStreamableValue } from 'ai/rsc';
import { FiBarChart2, FiDatabase, FiList } from 'react-icons/fi';
import { CohortExplorerDisplay } from '@/lib/types';

export function CohortPanel({ cohort }: { cohort: CohortExplorerDisplay }) {
  const [viewMode, setViewMode] = useState<'table' | 'chart' | 'database'>('table');
  const [userQuery] = useStreamableValue(cohort.userQuery);
  const [fileId] = useStreamableValue(cohort.fileId);

  return (
    <>
      <div className="flex justify-between items-center gap-2 mb-4 max-w-full">
        <div className="text-muted">
          <h2 className="text-xl font-semibold mb-2">Cohort</h2>
          <p className="mb-2">
            <strong>Query:</strong> {userQuery}
          </p>
          <p>
            <strong>File ID:</strong> {fileId}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            className={`p-2 rounded-md ${
              viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-accent text-accent'
            }`}
            onClick={() => setViewMode('table')}
          >
            <FiList size={20} />
          </button>
          <button
            className={`p-2 rounded-md ${
              viewMode === 'chart' ? 'bg-blue-500 text-white' : 'bg-accent text-accent'
            }`}
            onClick={() => setViewMode('chart')}
          >
            <FiBarChart2 size={20} />
          </button>
          <button
            className={`p-2 rounded-md ${
              viewMode === 'database' ? 'bg-blue-500 text-white' : 'bg-accent text-accent'
            }`}
            onClick={() => setViewMode('database')}
          >
            <FiDatabase size={20} />
          </button>
        </div>
      </div>

      <div className="bg-accent p-4 rounded-lg">
        {viewMode === 'table' ? (
          cohort?.table
        ) : viewMode === 'chart' ? (
          cohort?.chart
        ) : viewMode === 'database' ? (
          cohort?.dbQuery
        ) : (
          <div>Invalid view mode</div>
        )}
      </div>
    </>
  );
}
