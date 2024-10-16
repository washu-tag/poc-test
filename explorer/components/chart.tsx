'use client';

import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export function Chart({ imageSrc }: { imageSrc: string }) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <div onClick={open} className="cursor-pointer">
        <img src={imageSrc} alt="Chart" />
      </div>

      {/* <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        size="auto"
        overlayProps={{
          opacity: 0.55,
          blur: 3,
        }}
        classNames={{
          root: 'p-4',
        }}
      >
        <img src={imageSrc} alt="Chart" className="w-full h-auto" />
      </Modal> */}
    </>
  );
}
