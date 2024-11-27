'use client';

import { ShareIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { ModelSelector } from '@/components/model-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';

import { PlusIcon } from './icons';
import { useSidebar } from './ui/sidebar';

export function SearchHeader({ selectedModelId }: { selectedModelId: string }) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />
      {(!open || windowWidth < 768) && (
        <BetterTooltip content="New Search">
          <Button
            variant="outline"
            className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
            onClick={() => {
              router.push('/');
              router.refresh();
            }}
          >
            <PlusIcon />
            <span className="md:sr-only">New Search</span>
          </Button>
        </BetterTooltip>
      )}
      <ModelSelector selectedModelId={selectedModelId} className="order-1 md:order-2" />

      <BetterTooltip content="Share Search" align="start">
        <Button
          variant="outline"
          className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-400 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-900 md:flex py-1.5 px-2 h-fit md:h-[34px] order-4 md:ml-auto"
          onClick={() => {
            alert('Not implemented');
          }}
        >
          <ShareIcon size={16} />
        </Button>
      </BetterTooltip>
    </header>
  );
}
