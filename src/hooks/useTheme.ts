import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from '@/hooks/ThemeContext';

export function useTheme(): ThemeContextValue {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error('useTheme must be called inside a ThemeProvider.');
  }

  return theme;
}
