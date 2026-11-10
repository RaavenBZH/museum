import type { ComponentPropsWithoutRef } from 'react';
import { ArrowRightIcon } from '@/components/icons/ArrowRightIcon';
import { cn } from '@/lib/utils';

/**
 * The four button variants of the design system. They share one shell and
 * differ only by surface, weight, horizontal padding and arrow.
 *
 * `inverse` takes the text colour of an inverted block as its background and
 * its background as its text, so it is only ever used inside one.
 *
 * `text` has no surface at all. It is the quietest of the four, for an action
 * that must stay reachable without competing with anything: it keeps the
 * shell, so it has the same height and the same focus ring as the others, and
 * it is the only one that gains a surface on hover rather than deepening the
 * one it has.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'inverse' | 'text';

/**
 * Shell shared by every variant: 56 px tall, pill, label centred.
 *
 * It is a `group`, so the arrow inside it can answer the hover of the whole
 * button rather than of itself; and it transitions its colours, so the change
 * of surface reads as the same button changing state and not as a new one.
 */
const BUTTON_SHELL =
  'button group inline-flex min-h-14 items-center justify-center gap-2.5 rounded-pill text-button transition-colors';

const BUTTON_VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'button--primary bg-accent px-7 font-semibold text-on-accent hover:bg-accent-hover',
  secondary:
    'button--secondary bg-surface-muted px-6 font-medium text-text hover:bg-surface-muted-hover',
  inverse:
    'button--inverse bg-inverse-text px-7 font-semibold text-inverse-bg hover:bg-inverse-text-hover',
  text: 'button--text px-4 font-medium text-text hover:bg-surface-muted',
};

/**
 * The arrow marks a step forward, which is what the two strong variants mean.
 * The quiet variants are side roads and stay bare.
 */
function carriesArrow(variant: ButtonVariant): boolean {
  return variant === 'primary' || variant === 'inverse';
}

type ButtonProps = ComponentPropsWithoutRef<'button'> & { variant: ButtonVariant };

/**
 * A button that acts on the current page. Something that takes the visitor
 * elsewhere is a `ButtonLink`, never a button with a click handler.
 */
export function Button({ variant, className, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(BUTTON_SHELL, BUTTON_VARIANT_CLASS[variant], className)}
      {...props}
    >
      {children}
      {carriesArrow(variant) ? <ArrowRightIcon /> : null}
    </button>
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<'a'> & { variant: ButtonVariant };

/**
 * A link wearing the button shell. It is a real anchor, so it keeps its
 * keyboard behaviour, its context menu and its middle click.
 */
export function ButtonLink({ variant, className, children, ...props }: ButtonLinkProps) {
  return (
    <a
      className={cn(BUTTON_SHELL, 'button-link', BUTTON_VARIANT_CLASS[variant], 'no-underline', className)}
      {...props}
    >
      {children}
      {carriesArrow(variant) ? <ArrowRightIcon /> : null}
    </a>
  );
}
