import { useId, useState } from 'react';
import { ArtworkFactSection } from '@/components/discover/ArtworkFactSection';
import { ChevronIcon } from '@/components/icons/ChevronIcon';
import { Button, ButtonLink } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { UNKNOWN_ARTIST_LABEL } from '@/domain/artwork';
import {
  ESSENTIAL_FACTS_TITLE,
  type ArtworkFact,
  type ArtworkFactLink,
  type ArtworkFactSection as ArtworkFactSectionModel,
} from '@/domain/artworkFacts';
import type { ArtworkTitleScale } from '@/domain/artworkTitleScale';

/**
 * The wall label: the whole museum record of the artwork on one surface card,
 * beside the picture.
 *
 * It opens on the three lines that name the work, then the essentials, then
 * the artist. Everything else — the object, the museum, the link to the
 * museum's page — is folded under one button, because a visitor who is
 * discovering an artwork reads a few lines, not forty.
 *
 * The artist is the one field this screen cannot do without, and the one the
 * API leaves empty most often. It says so in words rather than leaving the
 * line blank.
 *
 * The folded record stays in the page and is hidden with `hidden`, so that
 * `aria-expanded` and `aria-controls` both describe an element that exists.
 *
 * Whether the record is folded is nobody's business but this card's: it is
 * undone by the next artwork, it is never read from outside, and no other
 * screen shares it, so it is held here rather than in the discovery run.
 *
 * The title is set at one of the four steps of the artwork-title scale, which
 * the domain layer chooses from its length: the museum's titles run from two
 * words to a paragraph, and a single size would either dwarf the short ones or
 * let the long ones take the whole card.
 *
 * The way out to the museum's own page closes the folded record, under its
 * blocks and outside all of them: it belongs to the artwork and not to one
 * part of its description, and it is for the visitor who has already asked to
 * go further. It leaves the application, so it says so in its accessible
 * name.
 */
const ARTWORK_TITLE_CLASS: Record<ArtworkTitleScale, string> = {
  xl: 'artwork-wall-label__title--xl text-artwork-title-xl',
  l: 'artwork-wall-label__title--l text-artwork-title-l',
  m: 'artwork-wall-label__title--m text-artwork-title-m',
  s: 'artwork-wall-label__title--s text-artwork-title-s',
};

export function ArtworkWallLabel({
  title,
  titleScale,
  artistName,
  displayDate,
  essentials,
  artistSection,
  recordSections,
  museumLink,
  className,
}: {
  title: string;
  /** Which step of the artwork-title scale the title is set at. */
  titleScale: ArtworkTitleScale;
  artistName: string | null;
  displayDate: string | null;
  essentials: readonly ArtworkFact[];
  /** `null` when the museum knows nothing about the artist. */
  artistSection: ArtworkFactSectionModel | null;
  /** The folded part of the record; empty when there is nothing to fold. */
  recordSections: readonly ArtworkFactSectionModel[];
  /** The museum's own page for this object, when it names one. */
  museumLink: ArtworkFactLink | null;
  className?: string;
}) {
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  // Generated rather than written down, so two wall labels on one screen never
  // point their disclosure at the same record.
  const recordId = useId();

  return (
    <section
      className={cn(
        'artwork-wall-label flex flex-col gap-8 rounded-card bg-surface p-6 desktop:p-10',
        className,
      )}
      aria-label="Artwork record"
    >
      <div className="artwork-wall-label__identity flex flex-col gap-4">
        <h1 className={cn('artwork-wall-label__title', ARTWORK_TITLE_CLASS[titleScale])}>{title}</h1>
        <p className="artwork-wall-label__author text-lead">
          <span className="artwork-wall-label__artist">{artistName ?? UNKNOWN_ARTIST_LABEL}</span>
          {displayDate === null ? null : (
            <span className="artwork-wall-label__date text-text-muted"> · {displayDate}</span>
          )}
        </p>
      </div>

      {essentials.length === 0 ? null : (
        <ArtworkFactSection section={{ title: ESSENTIAL_FACTS_TITLE, facts: [...essentials] }} />
      )}

      {artistSection === null ? null : <ArtworkFactSection section={artistSection} />}

      {recordSections.length === 0 && museumLink === null ? null : (
        <>
          <Button
            className="artwork-wall-label__disclosure self-start"
            variant="secondary"
            aria-expanded={isRecordOpen}
            aria-controls={recordId}
            onClick={() => setIsRecordOpen((isOpen) => !isOpen)}
          >
            {isRecordOpen ? 'Hide the full record' : 'See the full record'}
            <ChevronIcon direction={isRecordOpen ? 'up' : 'down'} />
          </Button>

          <div
            className={cn('artwork-wall-label__record flex-col gap-8', isRecordOpen && 'flex')}
            id={recordId}
            hidden={!isRecordOpen}
          >
            {recordSections.map((section) => (
              <ArtworkFactSection key={section.title} section={section} headingLevel={3} />
            ))}

            {museumLink === null ? null : (
              <ButtonLink
                className="artwork-wall-label__museum-link self-start"
                variant="secondary"
                href={museumLink.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${museumLink.label} (opens in a new tab)`}
              >
                {museumLink.label}
              </ButtonLink>
            )}
          </div>
        </>
      )}
    </section>
  );
}
