import { Pie, PieChart } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';

/**
 * The ring of the My Gallery mockup: how much of the collection has been seen,
 * as an accent arc on a `surface-muted` track, the share itself in the middle.
 *
 * It is the shadcn/ui donut-with-text chart, in the mockup's shape at a
 * smaller size — a 160 px square and an 18 px ring — so the card around it
 * stays one low row: the arc starting at
 * the top and running clockwise with rounded ends. The track is a pie of its
 * own under the arc, so it stays one unbroken circle as the mockup draws it,
 * instead of being the arc's complement with a seam at each end.
 *
 * The middle holds the share and, under it, how many artworks are left: the
 * share says how far, the count says how much further, which a percentage of
 * 2 650 does not. Both are HTML laid over the chart, as in the mockup, rather
 * than SVG text: they wear type styles of the system, and they do not depend
 * on the charting library measuring its own box.
 *
 * For a screen reader the ring is one image named by the sentence it draws;
 * the figure laid over it is hidden, since the name already says it.
 */
const RING_SIZE_PX = 160;
const RING_INNER_RADIUS_PX = 58;
const RING_OUTER_RADIUS_PX = 76;
/** Half the ring's thickness, which is what a round line cap would give. */
const ARC_CORNER_RADIUS_PX = 9;

const RING_CONFIG: ChartConfig = {
  seen: { label: 'Seen', color: 'var(--color-accent)' },
};

export function CompletionDonutChart({
  share,
  shareLabel,
  remainderLabel,
  description,
  tooltip,
  className,
}: {
  /** What has been seen, between 0 and 1. The arc is bounded to one turn. */
  share: number;
  /** The share as it is written in the middle: "71 %". */
  shareLabel: string;
  /** What is still to see, written under the share: "2,597 left". */
  remainderLabel: string;
  /** The sentence the ring draws, which names it for a screen reader. */
  description: string;
  /** What hovering the arc says: "7 of 2,650 seen". */
  tooltip: string;
  className?: string;
}) {
  // A full turn clockwise from the top is 90° down to -270°.
  const arcEndAngle = 90 - 360 * Math.min(Math.max(share, 0), 1);

  return (
    <div
      className={cn('completion-donut-chart relative shrink-0', className)}
      style={{ width: RING_SIZE_PX, height: RING_SIZE_PX }}
      role="img"
      aria-label={description}
    >
      <ChartContainer
        className="completion-donut-chart__plot aspect-auto size-full"
        config={RING_CONFIG}
        initialDimension={{ width: RING_SIZE_PX, height: RING_SIZE_PX }}
      >
        {/* Recharts makes its SVG a focusable "application", and each pie a
            tab stop, by default. This ring is one image named by its
            sentence, with nothing to operate: a stop inside it would be a
            stop that says nothing. */}
        <PieChart accessibilityLayer={false}>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={() => (
                  <span className="completion-donut-chart__tooltip text-caption-title">
                    {tooltip}
                  </span>
                )}
              />
            }
          />
          <Pie
            data={[{ value: 1 }]}
            dataKey="value"
            innerRadius={RING_INNER_RADIUS_PX}
            outerRadius={RING_OUTER_RADIUS_PX}
            fill="var(--color-surface-muted)"
            stroke="none"
            isAnimationActive={false}
            rootTabIndex={-1}
            tooltipType="none"
          />
          <Pie
            data={[{ name: 'seen', value: 1 }]}
            dataKey="value"
            nameKey="name"
            innerRadius={RING_INNER_RADIUS_PX}
            outerRadius={RING_OUTER_RADIUS_PX}
            startAngle={90}
            endAngle={arcEndAngle}
            cornerRadius={ARC_CORNER_RADIUS_PX}
            fill="var(--color-accent)"
            stroke="none"
            isAnimationActive={false}
            rootTabIndex={-1}
          />
        </PieChart>
      </ChartContainer>

      <div
        className="completion-donut-chart__centre pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1"
        aria-hidden="true"
      >
        <span className="completion-donut-chart__share text-headline">{shareLabel}</span>
        <span className="completion-donut-chart__remainder text-caption-title text-text-muted">
          {remainderLabel}
        </span>
      </div>
    </div>
  );
}
