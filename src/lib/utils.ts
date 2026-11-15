import { createCn } from 'cn/config';

/**
 * The names of the type scale, as they appear in `text-*` utilities.
 *
 * They have to be declared: the merger knows Tailwind's own sizes, and
 * without this list it reads `text-caption-short` as a colour and drops it the
 * moment a component also sets `text-inverse-text`, which would leave the
 * element at the inherited size.
 *
 * Keep it in step with the `--text-*` tokens of `styles/design-tokens.css`.
 */
const TYPE_SCALE_NAMES = [
  'display',
  'hero',
  'artwork-title-xl',
  'artwork-title-l',
  'artwork-title-m',
  'artwork-title-s',
  'tile-title',
  'logo',
  'lead',
  'button',
  'caption-title',
  'caption-short',
  'caption-meta',
  'mono',
];

/**
 * Joins class names and resolves Tailwind conflicts, so a component's own
 * classes can be overridden by the `className` it is given.
 */
export const cn = createCn({
  extend: { classGroups: { 'font-size': [{ text: TYPE_SCALE_NAMES }] } },
});
