'use client';

import React, { ReactNode, useRef, useEffect } from 'react';
import { FiCpu, FiUser } from 'react-icons/fi';
import { ClientMessage } from '@/lib/chat/actions';
import { Status } from './status';
import { StreamableValue } from 'ai/rsc';

export interface EncodedImage {
  mime: string;
  image: string;
}

export function UserMessage({ input, images }: { input: string; images?: EncodedImage[] }) {
  return (
    <>
      <div className={`message-icon btn dark`}>
        <FiUser />
      </div>
      <div className={`message message-user`}>
        {input}
        {images?.map((encodedImage, index) => (
          <div key={index} className="max-w-[30%] mt-4">
            <img src={`${encodedImage.mime},${encodedImage.image}`} alt={`Uploaded image`} />
          </div>
        ))}
      </div>
    </>
  );
}

export function AiMessage({ children, status }: { children: ReactNode; status?: StreamableValue }) {
  const contentStartRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    contentStartRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'start',
      block: 'end',
    });
  };

  useEffect(() => {
    if (!contentStartRef.current) return;

    scrollToBottom();

    const observer = new MutationObserver(() => {
      scrollToBottom();
    });

    observer.observe(contentStartRef.current, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className={`message-icon btn`}>
        <FiCpu />
      </div>
      <div className="scroll-mb-10 max-w-[calc(100%-4rem)]" ref={contentStartRef}>
        <div className="message message-ai">{children}</div>
        {status && <Status statusStream={status} />}
      </div>
    </>
  );
}

const Message = ({ message }: { message: ClientMessage }) => {
  return (
    <div
      className={`message-wrapper ${message.role === 'user' ? 'message-user-wrapper' : 'message-ai-wrapper'}`}
    >
      {message.display}
    </div>
  );
};

export default Message;
