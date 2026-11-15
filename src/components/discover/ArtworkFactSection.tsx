import type { ArtworkFactSection as ArtworkFactSectionModel } from '@/domain/artworkFacts';

/**
 * One row: the label column, then the value. Every row of every block shares
 * it, which is what keeps the list on one rhythm.
 */
const ARTWORK_FACT_ROW =
  'artwork-fact-section__row grid grid-cols-[7rem_minmax(0,1fr)] items-baseline gap-4 py-2';

/**
 * One titled block of the cartel: a heading, then the fields as a description
 * list — each label names the field, each value is the museum's own.
 *
 * The same block draws the essentials, the artist and every part of the
 * folded record, because they differ only by their rows. The accent dot of the
 * heading marks a block of the cartel the way the artboard marks it.
 *
 * The labels are prose set in the sans face at the quietest size of the scale:
 * the monospace family is reserved for figures, and a field name is not one.
 *
 * It holds rows and nothing else. The way out to the museum's page is not a
 * field of any one block, so it does not live here: the cartel sets it at the
 * foot of the card, under every block.
 *
 * The label column is a layout length rather than a spacing step, like the
 * bento row heights: it is the width at which the longest label of the record
 * sits on one line.
 */
export function ArtworkFactSection({
  section,
  headingLevel = 2,
}: {
  section: ArtworkFactSectionModel;
  /** 2 in the cartel; 3 inside the folded record, which sits under one. */
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <section className="artwork-fact-section flex flex-col gap-2">
      <Heading className="artwork-fact-section__title mb-1 flex items-center gap-2.5 text-caption-title">
        <span
          className="artwork-fact-section__dot size-2 shrink-0 rounded-pill bg-accent"
          aria-hidden="true"
        />
        {section.title}
      </Heading>

      <dl className="artwork-fact-section__facts flex flex-col">
        {section.facts.map((fact) => (
          <div key={fact.label} className={ARTWORK_FACT_ROW}>
            <dt className="artwork-fact-section__label text-caption-meta text-text-muted">
              {fact.label}
            </dt>
            <dd className="artwork-fact-section__value m-0 text-caption-title [overflow-wrap:anywhere]">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
