"use client";

import { StreamableValue, useStreamableValue } from "ai/rsc";
import { LoadingEllipses } from "./loading";

export function CodeBlock({ textStream }: { textStream?: StreamableValue }) {
  let [text] = useStreamableValue(textStream);
  if (!text) {
    text = <LoadingEllipses />;
  }

  return (
    <div className="prose my-2">
      <pre>
        <code className="language-python">{text}</code>
      </pre>
    </div>
  );
}
