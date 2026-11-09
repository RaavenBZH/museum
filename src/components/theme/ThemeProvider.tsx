import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext, type ThemeContextValue } from './ThemeContext';
import { isThemeMode, PREFERS_DARK_QUERY, THEME_STORAGE_KEY, type ThemeMode } from './themeModes';

function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);

    return isThemeMode(stored) ? stored : 'system';
  } catch {
    // Storage can be unavailable (private browsing, blocked site data); the
    // system preference is a safe fallback.
    return 'system';
  }
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
    // No attribute means "follow the system", which the stylesheet handles.
    if (mode === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', mode);
    }
  }, [mode]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setStoredMode(nextMode);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch {
      // The mode still applies for this session even if it cannot be saved.
    }
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
