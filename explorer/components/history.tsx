"use client";

import { Button } from "@mantine/core";

export interface ChatHistoryItem {
  id: string;
  text: string;
}

interface ChatHistoryProps {
  chatHistory: ChatHistoryItem[];
  handleReset: () => void;
  chatId: string;
  swapChat: (id: string) => void;
}

const SearchHistory = ({
  chatHistory,
  handleReset,
  chatId,
  swapChat
}: ChatHistoryProps) => {
  return (
    <>
      <div className="chat-history overflow-y-auto flex-grow">
        {chatHistory.map((item: ChatHistoryItem) => (
          <div
            key={item.id}
            className={`p-2 my-2 rounded cursor-pointer ${item.id === chatId ? "bg-gray-300" : "hover:bg-gray-300"}`}
            onClick={() => swapChat(item.id)}
          >
            {item.text}
          </div>
        ))}
      </div>

      <Button className="float-right my-5" onClick={handleReset}>
        Start new search
      </Button>
    </>
  );
};

export default SearchHistory;
