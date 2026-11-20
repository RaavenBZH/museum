import { Pie, PieChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { formatCount } from '@/domain/discoveryProgress';
import type { MediumCount } from '@/domain/galleryInsights';
import { cn } from '@/lib/utils';

/**
 * What the artworks seen are made of, as a pie: one slice per medium, the
 * most frequent first, clockwise from the top.
 *
 * A pie suits this question — how one whole splits — because the parts are
 * few and one of them, oil on canvas, holds most of the whole. The tail is
 * folded into one slice before it gets here, so there are never more slices
 * than the palette has fills that tell apart.
 *
 * The fills are the system's own tokens, the accent first, and the slices are
 * parted by a 2 px stroke of the card's surface. Colour is never what names a
 * slice: the legend beside the pie gives every medium in words with its count,
 * which is also what a screen reader reads, the drawing itself being hidden
 * from it.
 */
const SLICE_FILLS = [
  'var(--color-accent)',
  'var(--color-text)',
  'var(--color-text-muted)',
  'var(--color-text-subtle)',
  'var(--color-inverse-muted)',
] as const;

/** The fill of the slice at `rank`, counted from the most frequent at 0. */
function sliceFill(rank: number): string {
  return SLICE_FILLS[Math.min(rank, SLICE_FILLS.length - 1)];
}

const PIE_SIZE_PX = 160;

export function MediumPieChart({
  rows,
  className,
}: {
  /** The most frequent first, at most as many as there are fills. */
  rows: readonly MediumCount[];
  className?: string;
}) {
  const data = rows.map((row, rank) => ({ ...row, fill: sliceFill(rank) }));

  return (
    <div className={cn('medium-pie-chart flex flex-wrap items-center gap-6', className)}>
      <div
        className="medium-pie-chart__plot shrink-0"
        style={{ width: PIE_SIZE_PX, height: PIE_SIZE_PX }}
        aria-hidden="true"
      >
        <ChartContainer
          className="size-full"
          initialDimension={{ width: PIE_SIZE_PX, height: PIE_SIZE_PX }}
        >
          <PieChart accessibilityLayer={false}>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  describe={(value, item) => (
                    <span className="medium-pie-chart__tooltip text-caption-meta">
                      {`${(item.payload as MediumCount).label} · ${formatCount(Number(value))}`}
                    </span>
                  )}
                />
              }
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke="var(--color-surface)"
              strokeWidth={2}
              isAnimationActive={false}
              rootTabIndex={-1}
            />
          </PieChart>
        </ChartContainer>
      </div>

      {/* `list-none` makes Safari drop the list role, and with it the count. */}
      <ul role="list" className="medium-pie-chart__legend m-0 flex min-w-0 flex-1 list-none flex-col gap-3 p-0">
        {data.map((row) => (
          <li key={row.key} className="medium-pie-chart__entry flex items-baseline gap-2.5">
            <span
              className="medium-pie-chart__swatch size-2.5 shrink-0 rounded-mark"
              style={{ background: row.fill }}
              aria-hidden="true"
            />
            <span className="medium-pie-chart__label min-w-0 flex-1 text-caption-title">
              {row.label}
            </span>
            <span className="medium-pie-chart__count shrink-0 font-mono text-mono text-text-muted">
              {formatCount(row.count)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
