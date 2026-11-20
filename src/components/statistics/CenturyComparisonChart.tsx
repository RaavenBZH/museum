import { useId } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { formatCount } from '@/domain/discoveryProgress';
import type { CenturyCount } from '@/domain/galleryInsights';
import { cn } from '@/lib/utils';

/**
 * The artworks seen, counted by the century they were begun in: one accent
 * bar per century, the vertical axis in works.
 *
 * The collection is not drawn beside them. Its 960 paintings of the
 * nineteenth century and the handful a visitor has met cannot share an axis
 * of counts, and two axes would make one bar look comparable to another that
 * is not. The collection's count of each century is given in the tooltip
 * instead, and in the table a screen reader reads, which carries every figure
 * the drawing does.
 */
const CENTURY_CHART_CONFIG: ChartConfig = {
  seenCount: { label: 'Your artworks', color: 'var(--color-accent)' },
};

/** The tops of the bars, at the radius of the system's marks. */
const BAR_RADIUS: [number, number, number, number] = [2, 2, 0, 0];

export function CenturyComparisonChart({
  rows,
  className,
}: {
  rows: readonly CenturyCount[];
  className?: string;
}) {
  const tableCaptionId = useId();

  return (
    <div className={cn('century-comparison-chart flex flex-col gap-4', className)}>
      <div className="century-comparison-chart__plot" aria-hidden="true">
        <ChartContainer className="aspect-auto h-60 w-full" config={CENTURY_CHART_CONFIG}>
          <BarChart data={[...rows]} accessibilityLayer={false} margin={{ left: -20 }}>
            <CartesianGrid vertical={false} stroke="var(--color-surface-muted)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ className: 'fill-text-muted text-mono' }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ className: 'fill-text-muted text-mono' }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, item) => (
                    <span className="century-comparison-chart__tooltip flex flex-col gap-1">
                      <span className="text-caption-title">{item.payload.label}</span>
                      <span className="font-mono text-mono text-text-muted">
                        {`${formatCount(Number(value))} seen of ${formatCount(item.payload.collectionCount)}`}
                      </span>
                    </span>
                  )}
                />
              }
            />
            <Bar
              dataKey="seenCount"
              fill="var(--color-accent)"
              radius={BAR_RADIUS}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      </div>

      <table className="century-comparison-chart__table sr-only" aria-labelledby={tableCaptionId}>
        <caption id={tableCaptionId}>Your artworks by century</caption>
        <thead>
          <tr>
            <th scope="col">Century</th>
            <th scope="col">Seen</th>
            <th scope="col">In the collection</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.century}>
              <th scope="row">{row.label}</th>
              <td>{formatCount(row.seenCount)}</td>
              <td>{formatCount(row.collectionCount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
