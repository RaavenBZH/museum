import { cn } from '@/lib/utils';

/**
 * The size of a tile states the format of what it holds: a portrait painting
 * stands tall and narrow, a panorama lies wide and short.
 *
 * A tile two columns wide spans the full width of the mobile grid by
 * construction, so one class holds at both breakpoints and nothing has to be
 * undone below 761 px.
 *
 * These live beside `BentoGrid` rather than inside it, because a file that
 * exports both a component and a helper loses fast refresh.
 */
export type BentoTileFormat =
  | 'headline'
  | 'wide'
  | 'panoramic'
  | 'portrait'
  | 'small'
  | 'action';

const BENTO_TILE_CLASS: Record<BentoTileFormat, string> = {
  headline: 'bento__tile--headline col-span-2 row-span-6',
  wide: 'bento__tile--wide col-span-2 row-span-4',
  panoramic: 'bento__tile--panoramic col-span-2 row-span-3',
  portrait: 'bento__tile--portrait row-span-5',
  small: 'bento__tile--small row-span-2',
  action: 'bento__tile--action row-span-2',
};

/** The grid classes of one tile, applied by the component that fills it. */
export function bentoTileClassName(format: BentoTileFormat): string {
  return cn('bento__tile', BENTO_TILE_CLASS[format]);
}
