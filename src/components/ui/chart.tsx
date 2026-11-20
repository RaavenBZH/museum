/**
 * Vendored from shadcn/ui (`pnpm exec shadcn add chart`): the container and
 * the tooltip the project's charts are drawn in. It is copied source, like
 * every other file of `src/components/ui`, so it is edited here rather than
 * patched around, and it keeps only what the charts use.
 *
 * What the registry ships and this file drops: the legend, the per-series
 * colour configuration and the `<style>` it wrote — both charts fill their
 * marks with design-system tokens directly — the dark-mode selector `.dark`,
 * which this project never sets, and the tooltip's default rows, since every
 * tooltip here words its marks itself. What remained of the registry's
 * styling broke the design system (a border, a shadow, an 8 px radius, a raw
 * `#ccc`), so the tooltip now wears the inverted pill of the system instead.
 */
import type { ComponentProps, ReactNode } from 'react';
import {
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  type TooltipPayloadEntry,
  type TooltipValueType,
} from 'recharts';
import { cn } from '@/lib/utils';

/** The size the chart takes before it has measured its box, as in the registry. */
const INITIAL_DIMENSION = { width: 320, height: 200 } as const;

export function ChartContainer({
  className,
  children,
  initialDimension = INITIAL_DIMENSION,
  ...props
}: ComponentProps<'div'> & {
  children: ComponentProps<typeof ResponsiveContainer>['children'];
  initialDimension?: { width: number; height: number };
}) {
  return (
    <div className={cn('chart-container flex justify-center', className)} {...props}>
      <ResponsiveContainer initialDimension={initialDimension}>{children}</ResponsiveContainer>
    </div>
  );
}

export const ChartTooltip = Tooltip;

/**
 * The tooltip of a chart: one line per hovered mark, worded by the chart
 * itself through `describe` — not `formatter`, which Recharts injects into its
 * tooltip content and would overwrite — on the inverted pill — the one surface of the
 * system that stands out from the card a chart sits on without a border or a
 * shadow, which the system does not have.
 */
export function ChartTooltipContent({
  active,
  payload,
  describe,
  className,
}: Pick<Partial<TooltipContentProps<TooltipValueType, string>>, 'active' | 'payload'> & {
  describe: (value: TooltipValueType | undefined, item: TooltipPayloadEntry) => ReactNode;
  className?: string;
}) {
  if (active !== true || payload === undefined || payload.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'chart-tooltip flex flex-col gap-1 rounded-pill bg-inverse-bg px-4 py-2 text-inverse-text',
        className,
      )}
    >
      {payload
        .filter((item) => item.type !== 'none')
        .map((item) => (
          <div key={String(item.dataKey ?? item.name)} className="chart-tooltip__row">
            {describe(item.value, item)}
          </div>
        ))}
    </div>
  );
}
