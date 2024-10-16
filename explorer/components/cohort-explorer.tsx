import React, { useEffect, useState } from 'react';
import { CohortPanel } from './cohort-panel';
import { Carousel, Embla } from '@mantine/carousel';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { CohortExplorerDisplay } from '@/lib/types';

export function CohortExplorer({
  cohorts,
  copilotExpanded,
}: {
  cohorts: CohortExplorerDisplay[];
  copilotExpanded: boolean;
}) {
  const [embla, setEmbla] = useState<Embla | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (embla) {
        embla.reInit();
      }
    };
    if (embla) {
      embla.reInit();
    }
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [embla, copilotExpanded, cohorts]);

  return (
    <div>
      <div className="m-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Scout Data Explorer</h1>
        <p className="text-gray-600 mb-6">
          {cohorts.length > 0
            ? 'Analyze and visualize your data.'
            : 'Use the copilot to pull in data to examine.'}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md m-6">
        {cohorts.length === 0 ? (
          <div className="p-6">
            <p className="mb-4">
              The population currently consists of the CT-RATE dataset, which comprises chest CT
              volumes paired with corresponding radiology text reports, multi-abnormality labels,
              and metadata. CT-RATE houses 25,692 non-contrast chest CT volumes, expanded to 50,188
              through various reconstructions, from 21,304 unique patients.
            </p>
            <p>Currently, 9,881 cases have been loaded.</p>
          </div>
        ) : (
          <Carousel
            getEmblaApi={setEmbla}
            slideSize="100%"
            slideGap="sm"
            containScroll="trimSnaps"
            draggable={false}
            previousControlIcon={
              <IconChevronLeft size={16} aria-label="Previous" title="Previous cohort" />
            }
            nextControlIcon={<IconChevronRight size={16} aria-label="Next" title="Next cohort" />}
            classNames={{
              root: 'relative p-6',
              controls: 'absolute grid grid-cols-2 w-20 gap-2 top-3 right-0',
              slide: 'w-full',
            }}
            styles={{
              controls: {
                left: 'unset',
              },
              control: {
                '&[data-inactive]': {
                  opacity: 0.5,
                  backgroundColor: 'gray',
                  cursor: 'default',
                  pointerEvents: 'none',
                },
              },
            }}
          >
            {cohorts.map((cohort, index) => (
              <Carousel.Slide key={index}>
                <CohortPanel cohort={cohort} />
              </Carousel.Slide>
            ))}
          </Carousel>
        )}
      </div>
    </div>
  );
}
