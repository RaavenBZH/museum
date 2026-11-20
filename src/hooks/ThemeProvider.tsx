import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  isThemeMode,
  PREFERS_DARK_QUERY,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from '@/domain/themeModes';
import { readStorage, writeStorage } from '@/hooks/browserStorage';
import { ThemeContext, type ThemeContextValue } from '@/hooks/ThemeContext';

/** The mode kept by an earlier visit; without one, the system preference. */
function readStoredMode(): ThemeMode {
  const stored = readStorage(THEME_STORAGE_KEY);

  return isThemeMode(stored) ? stored : 'system';
}

/**
 * Owns the Sand / Cocoa mode: resolves it, writes `data-theme` on <html> so
 * the token overrides in `design-tokens.css` apply, and remembers the choice.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setStoredMode] = useState<ThemeMode>(readStoredMode);
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia(PREFERS_DARK_QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(PREFERS_DARK_QUERY);
    const handlePreferenceChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };

    query.addEventListener('change', handlePreferenceChange);

    return () => query.removeEventListener('change', handlePreferenceChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    // <html> is outside React's tree, so what this effect writes there has to
    // be undone by hand: an unmounted provider that left `data-theme` behind
    // would pin a mode nobody chose on whatever mounts next.
    const previousMode = root.getAttribute('data-theme');

    // No attribute means "follow the system", which the stylesheet handles.
    if (mode === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', mode);
    }

    return () => {
      if (previousMode === null) {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', previousMode);
      }
    };
  }, [mode]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setStoredMode(nextMode);
    writeStorage(THEME_STORAGE_KEY, nextMode);
  }, []);

  const theme = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolvedMode: mode === 'system' ? (systemPrefersDark ? 'cocoa' : 'sand') : mode,
      setMode,
    }),
    [mode, systemPrefersDark, setMode],
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
