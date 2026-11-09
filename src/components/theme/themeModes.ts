/**
 * The two modes of the design system, plus the implicit third choice of
 * following the operating system.
 */
export const THEME_MODES = ['system', 'sand', 'cocoa'] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

/** The mode actually painted on screen once `system` has been resolved. */
export type ResolvedThemeMode = Exclude<ThemeMode, 'system'>;

export const THEME_STORAGE_KEY = 'museum:theme-mode';

export const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

/** Human-readable name of a mode, used in the mode switch. */
export const THEME_MODE_LABELS: Record<ResolvedThemeMode, string> = {
  sand: 'Sand',
  cocoa: 'Cocoa',
};

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value);
}
