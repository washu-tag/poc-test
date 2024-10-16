import { StreamableValue, useStreamableValue } from "ai/rsc";
import { CircleLoader } from "react-spinners";

export function Status({ statusStream }: { statusStream: StreamableValue }) {
  const [value] = useStreamableValue(statusStream);
  if (
    value.endsWith("completed") ||
    value.endsWith("incomplete") ||
    value.endsWith("error")
  ) {
    return;
  }
  return (
    <div className="flex items-center space-x-2 mt-5">
      {/* 
        If we have error in the status string, this means we got an error after we rendered the main UI. 
        Show it as a "static" status.
      */}
      {!(
        value.toLowerCase().includes("error") ||
        value.toLowerCase().endsWith("cancelled")
      ) && <CircleLoader size="20px" />}
      <span className="message-tool">{value}</span>
    </div>
  );
}
