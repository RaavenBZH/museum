import { Button } from '@/components/ui/Button';
import { THEME_MODE_LABELS } from './themeModes';
import { useTheme } from './useTheme';

/**
 * Switches between the two modes. It is labelled with words rather than an
 * icon, because the design system allows no icon other than its two arrows.
 */
export function ThemeToggleButton() {
  const { resolvedMode, setMode } = useTheme();
  const nextMode = resolvedMode === 'sand' ? 'cocoa' : 'sand';

  return (
    <Button
      variant="secondary"
      className="theme-toggle-button"
      aria-label={`Switch to ${THEME_MODE_LABELS[nextMode]} mode`}
      onClick={() => setMode(nextMode)}
    >
      {THEME_MODE_LABELS[nextMode]}
    </Button>
  );
}
