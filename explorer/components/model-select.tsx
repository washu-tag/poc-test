'use client';

import { supportedModels } from '@/lib/models';

export default function ModelSelect({
  model,
  handleModelChange,
}: {
  model: string;
  handleModelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="max-w-2xl w-fit text-black">
      <select
        id="model-select"
        value={model}
        onChange={handleModelChange}
        className="w-full bg-white border border-border rounded-md px-3 py-2"
      >
        {Object.keys(supportedModels).map((modelKey) => (
          <option key={modelKey} value={modelKey}>
            {supportedModels[modelKey].modelName}
          </option>
        ))}
      </select>
    </div>
  );
}
