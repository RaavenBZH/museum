import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The bento grid: four columns of 72 px rows on desktop, two columns of 64 px
 * rows below 761 px. `dense` placement lets a short tile fall back into a hole
 * left by a taller neighbour, so the grid never shows a gap.
 *
 * The two row heights are the only raw lengths of the system. They belong to
 * this grid rather than to the palette of values components reuse, so they
 * stay here instead of becoming tokens.
 *
 * Tiles state their own span through `bentoTileClassName`.
 */
export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'bento grid auto-rows-[minmax(64px,auto)] grid-flow-dense grid-cols-2 gap-2 desktop:auto-rows-[minmax(72px,auto)] desktop:grid-cols-4 desktop:gap-3',
        className,
      )}
    >
      {children}
    </div>
  );
}
