"use client";

import { useState } from "react";
import { Tooltip, Drawer } from "@mantine/core";
import { IconHistory } from "@tabler/icons-react";
import SearchHistory, { ChatHistoryItem } from "./history";
import User from "./user";

export function Sidebar({
  chatHistory,
  handleReset,
  chatId,
  swapChat
}: {
  chatHistory: ChatHistoryItem[];
  handleReset: () => void;
  chatId: string;
  swapChat: (id: string) => void;
}) {
  const [opened, setOpened] = useState(false);
  const [panel, setPanel] = useState<"history" | "user">("history");

  const toggleSidebar = (panelType: "history" | "user") => {
    setOpened(!opened);
    setPanel(panelType);
  };

  return (
    <>
      <div className="p-4 flex flex-col bg-white shadow-lg">
        <div className="mb-4">
          <Tooltip label="Search History" position="right" withArrow>
            <button
              className="btn dark p-2 font-extralight"
              onClick={() => toggleSidebar("history")}
            >
              <IconHistory size={32} />
            </button>
          </Tooltip>
        </div>
        <div className="bottom-2 left-4 fixed">
          <Tooltip label="Profile" position="right" withArrow>
            <button onClick={() => toggleSidebar("user")}>
              <User size={48} />
            </button>
          </Tooltip>
        </div>
      </div>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <div className="text-xl font-semibold">
            {panel == "history" ? "Search History" : "User Profile"}
          </div>
        }
        padding="xl"
        size="md"
      >
        {panel == "history" ? (
          <SearchHistory
            chatHistory={chatHistory}
            handleReset={handleReset}
            chatId={chatId}
            swapChat={swapChat}
          />
        ) : (
          <>
            <div className="flex items-center justify-center gap-5">
              <User size={100} />
              <div>
                <p>
                  <strong>Name:</strong> Albert Einstein
                </p>
                <p>
                  <strong>Institution:</strong> Washington University
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:einsteina@wustl.edu">einsteina@wustl.edu</a>
                </p>
              </div>
            </div>
          </>
        )}
      </Drawer>
    </>
  );
}
