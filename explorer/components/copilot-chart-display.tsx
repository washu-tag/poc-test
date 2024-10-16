"use client";

import { ReactNode, useEffect, useState } from "react";
import { Button } from "@mantine/core";
import { FiDatabase } from "react-icons/fi";
import { StreamableValue, useStreamableValue } from "ai/rsc";
import { Markdown } from "./markdown";

export function ChartDisplay({
  charts,
  code,
  preambleStream,
  text,
  inProgressStream
}: {
  charts: ReactNode;
  code: ReactNode;
  preambleStream: StreamableValue;
  text: ReactNode;
  inProgressStream: StreamableValue;
}) {
  const [inProgress] = useStreamableValue(inProgressStream);
  const [preamble] = useStreamableValue(preambleStream);
  const [showCode, setShowCode] = useState(true);

  useEffect(() => {
    if (!!!inProgress) {
      setShowCode(false);
    }
  }, [inProgress]);

  const toggleShowCode = () => {
    setShowCode(!showCode);
  };

  return (
    <>
      {preamble && (
        <>
          <div className="my-2">
            <Markdown text={preamble} />
          </div>
          <div className="my-2">
            <Button onClick={toggleShowCode}>
              <FiDatabase className="mr-2" /> {showCode ? "Hide" : "Review"}{" "}
              code
            </Button>
            <div className="w-full">{showCode && code}</div>
          </div>
        </>
      )}
      <div className="w-full">{charts}</div>
      <div className="my-2">{text}</div>
    </>
  );
}
