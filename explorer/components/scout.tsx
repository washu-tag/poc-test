'use client';

import { useState } from 'react';
import { ChatHistoryItem } from '@/components/history';
import { generateId } from 'ai';
import { Sidebar } from '@/components/sidebar';
import { Copilot } from '@/components/copilot';
import { CohortExplorer } from '@/components/cohort-explorer';
import { ClientMessage } from '@/lib/chat/actions';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { CohortExplorerDisplay } from '@/lib/types';
import { readStreamableValue, StreamableValue } from 'ai/rsc';

const DEFAULT_SEARCH_NAME = 'Search';

async function readStreamValues(iterator: AsyncIterableIterator<any>) {
  let result = await iterator.next(); // Get first value
  while (!result.done) {
    console.log('Value:', result.value); // Do something with the value

    // Get the next value
    result = await iterator.next();
  }
  console.log('Stream finished');
}

export default function Scout() {
  const [chatId, setChatId] = useState<string>(generateId());
  const [cohortDisplay, setCohortDisplay] = useState<CohortExplorerDisplay[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    { id: chatId, text: 'Search' },
  ]);
  const [copilotExpanded, setCopilotExpanded] = useState(true);

  const setCohortDisplayFromMessage = async (message: ClientMessage) => {
    let cohortAction;
    for await (cohortAction of readStreamableValue(message.cohortAction)) {
      // Do nothing, just wait for the stream to be closed
    }
    switch (cohortAction) {
      case 'add':
        // This is a new cohort, we want a new carousel slide for it
        setCohortDisplay([message.cohortDisplay, ...cohortDisplay]);
        break;
      case 'update':
        // replace the latest cohort display with our new one
        const updatedCohortDisplay = [...cohortDisplay];
        updatedCohortDisplay[0] = message.cohortDisplay;
        setCohortDisplay(updatedCohortDisplay);
        break;
      case 'leave':
        // Do nothing
        break;
      default:
        console.error('Unknown cohort action:', cohortAction);
    }
  };

  const updateSearchName = (input: string) => {
    setChatHistory(
      chatHistory.map((item) =>
        item.id === chatId
          ? { ...item, text: (input || DEFAULT_SEARCH_NAME).substring(0, 50) }
          : item,
      ),
    );
  };

  const swapChat = (id: string) => {
    setChatId(id);
  };

  const handleReset = () => {
    const newChatId = generateId();
    setChatId(newChatId);
    setChatHistory([{ id: newChatId, text: DEFAULT_SEARCH_NAME }, ...chatHistory]);
  };

  return (
    <MantineProvider>
      <Notifications position="top-center" />
      <div className="flex bg-gray-50 h-screen overflow-hidden">
        <Sidebar
          chatHistory={chatHistory}
          handleReset={handleReset}
          chatId={chatId}
          swapChat={swapChat}
        />

        <div className="grid grid-cols-3 gap-4 h-full w-full overflow-y-auto">
          <div
            className={`transition-all ease-in-out ${
              copilotExpanded ? 'col-span-2' : 'col-span-3'
            }`}
          >
            <CohortExplorer copilotExpanded={copilotExpanded} cohorts={cohortDisplay} />
          </div>
          <div className={copilotExpanded ? 'col-span-1' : ''}>
            <Copilot
              setCohortDisplayFromMessage={setCohortDisplayFromMessage}
              chatId={chatId}
              isExpanded={copilotExpanded}
              updateSearchName={updateSearchName}
              setCopilotExpanded={setCopilotExpanded}
            />
          </div>
        </div>
      </div>
    </MantineProvider>
  );
}
