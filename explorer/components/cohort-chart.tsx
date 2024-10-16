"use client";

import { Carousel } from "@mantine/carousel";
import { Chart } from "./chart";

export function CohortChart({ charts }: { charts?: string[] }) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {charts && charts.length > 0 ? (
        <Carousel
          slideSize="100%"
          slideGap="md"
          controlsOffset="xs"
          loop
          withIndicators
          classNames={{
            indicator: "bg-gray-400 hover:bg-gray-600",
            indicators: "bottom-4"
          }}
        >
          {charts.map((chart, i) => (
            <Carousel.Slide key={i}>
              <div className="relative flex items-center justify-center">
                <Chart imageSrc={chart} />
              </div>
            </Carousel.Slide>
          ))}
        </Carousel>
      ) : (
        <div className="text-gray-500 h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          No charts available.
        </div>
      )}
    </div>
  );
}
