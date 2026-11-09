import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * The quiet button of the design system: a pill on the muted surface, without
 * an icon.
 *
 * The primary and inverse variants, and the arrow that follows their label,
 * are specified in `docs/DESIGN_SYSTEM.md` and arrive with the first screen
 * that carries a main action.
 */
export function Button({ className, ...props }: ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'button inline-flex min-h-14 items-center justify-center rounded-pill bg-surface-muted px-6 text-button font-medium text-text',
        className,
      )}
      {...props}
    />
  );
}
