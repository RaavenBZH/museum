import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * A surface card holding a heading, one line and, when there is something to
 * do about it, one action. Four screens were drawing it by hand: the artwork
 * being drawn, the museum refusing, an address that does not exist, and a
 * screen that threw. They are the same panel and now they are one component.
 *
 * `role` is what tells assistive technology that the panel is a change of
 * state rather than part of the page: `status` for something under way,
 * `alert` for something that went wrong. A panel that is simply the content of
 * its screen — the "not found" page — takes neither.
 *
 * Its heading is the `h1` of the screen: in all four cases the panel *is* the
 * screen, and a screen has one first-level heading.
 */
export function NoticePanel({
  title,
  lead,
  action,
  role,
  isBusy = false,
  className,
}: {
  title: string;
  lead: string;
  /** The one way out, when there is one. */
  action?: ReactNode;
  role?: 'status' | 'alert';
  /** True while the screen is waiting for something to finish. */
  isBusy?: boolean;
  className?: string;
}) {
  const titleId = useId();

  return (
    <section
      className={cn(
        'notice-panel flex flex-col items-start gap-4 rounded-card bg-surface p-6 desktop:p-10',
        className,
      )}
      aria-labelledby={titleId}
      aria-busy={isBusy ? true : undefined}
      role={role}
    >
      <h1 id={titleId} className="notice-panel__title text-hero">
        {title}
      </h1>
      <p className="notice-panel__lead text-lead text-text-muted">{lead}</p>
      {action}
    </section>
  );
}
