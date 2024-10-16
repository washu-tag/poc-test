'use client';

import ReactMarkdown from 'react-markdown';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';

import { StreamableValue, useStreamableValue } from 'ai/rsc';

function MarkdownStream({ textStream }: { textStream?: StreamableValue }) {
  let [text] = useStreamableValue(textStream);
  if (!text) {
    return;
  }

  return <MarkdownText text={text} />;
}

function MarkdownText({ text }: { text: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        urlTransform={(value: string) => value}
        remarkPlugins={[remarkParse, remarkGfm]}
        rehypePlugins={[
          [remarkRehype, { allowDangerousHtml: true }], // Converts markdown to HTML
          rehypeRaw, // Allows raw HTML
          rehypeSanitize, // Sanitizes the HTML
          rehypeStringify, // Converts HTML to a string
        ]}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export function Markdown({ textStream, text }: { textStream?: StreamableValue; text?: string }) {
  if (!text) {
    return <MarkdownStream textStream={textStream} />;
  } else {
    return <MarkdownText text={text} />;
  }
}
