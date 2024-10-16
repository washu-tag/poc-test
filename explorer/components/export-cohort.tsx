"use client";

import { RequestCohort } from "./request-form";
import { FiShare } from "react-icons/fi";
import { ImageRow } from "@/lib/types";
import { useDisclosure } from "@mantine/hooks";
import { Modal } from "@mantine/core";

export function ExportCohort({ data }: { data: ImageRow[] }) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <div className="flex items-center z-50">
      <button className="btn dark" onClick={open}>
        <span className="flex items-center justify-content gap-1">
          <FiShare /> Export cohort
        </span>
      </button>
      <Modal
        title="Export cohort"
        size="90%"
        opened={opened}
        onClose={close}
        overlayProps={{
          opacity: 0.55,
          blur: 3
        }}
        classNames={{
          title: "font-bold text-xl",
          header: "border-b border-gray-200"
        }}
      >
        <RequestCohort closeModal={close} size={data.length} />
      </Modal>
    </div>
  );
}
