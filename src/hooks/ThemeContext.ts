import { createContext } from 'react';
import type { ResolvedThemeMode, ThemeMode } from '@/domain/themeModes';

export interface ThemeContextValue {
  /** What the visitor chose, which may be `system`. */
  mode: ThemeMode;
  /** The mode currently on screen, `system` already resolved. */
  resolvedMode: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
