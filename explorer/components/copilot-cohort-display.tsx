export function CohortDisplay({
  hits,
  query,
  maxDistance
}: {
  hits: number;
  query: string | undefined;
  maxDistance: number;
}) {
  return (
    <div className="prose">
      <p>
        I found {hits} hits for query &quot;{query || "similar images"}&quot;
        within cosine distance &le; {maxDistance}. Your data explorer has been
        updated with this cohort.
      </p>
      {hits > 0 && <p>Let&apos;s generate some charts for this data!</p>}
    </div>
  );
}
