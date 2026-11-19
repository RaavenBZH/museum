import type { ComponentType } from 'react';
import { GridIcon } from '@/components/icons/GridIcon';
import { ListIcon } from '@/components/icons/ListIcon';
import type { GalleryLayout } from '@/domain/galleryLayout';
import { cn } from '@/lib/utils';

const LAYOUT_OPTIONS: readonly { layout: GalleryLayout; label: string; Icon: ComponentType }[] = [
  { layout: 'grid', label: 'Grid', Icon: GridIcon },
  { layout: 'list', label: 'List', Icon: ListIcon },
];

/**
 * Grid or list: the two-sided switch of the mockup, the same pill as the day /
 * night switch — a group on `--color-surface`, the side in use wearing the
 * inverted pill and `aria-pressed`, so the choice does not rest on colour.
 *
 * Each side names its layout in words beside its icon, and each is a target of
 * at least 44 px.
 */
export function GalleryLayoutSwitch({
  layout,
  onLayoutChange,
  className,
}: {
  layout: GalleryLayout;
  onLayoutChange: (layout: GalleryLayout) => void;
  className?: string;
}) {
  return (
    <div
      className={cn('gallery-layout-switch inline-flex gap-1 rounded-pill bg-surface p-1', className)}
      role="group"
      aria-label="Layout"
    >
      {LAYOUT_OPTIONS.map(({ layout: option, label, Icon }) => {
        const isCurrent = option === layout;

        return (
          <button
            key={option}
            type="button"
            className={cn(
              'gallery-layout-switch__option inline-flex min-h-11 items-center gap-2 rounded-pill px-4 text-caption-short transition-colors',
              isCurrent
                ? 'gallery-layout-switch__option--current bg-inverse-bg text-inverse-text'
                : 'text-text hover:bg-surface-muted',
            )}
            aria-pressed={isCurrent}
            onClick={() => onLayoutChange(option)}
          >
            <Icon />
            {label}
          </button>
        );
      })}
    </div>
  );
}
