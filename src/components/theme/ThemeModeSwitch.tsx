import type { ComponentType } from 'react';
import { MoonIcon } from '@/components/icons/MoonIcon';
import { SunIcon } from '@/components/icons/SunIcon';
import { THEME_MODE_LABELS, type ResolvedThemeMode } from '@/domain/themeModes';
import { cn } from '@/lib/utils';

/**
 * The two sides of the switch, day then night, in the order they are read.
 */
const THEME_MODE_OPTIONS: readonly { mode: ResolvedThemeMode; Icon: ComponentType }[] = [
  { mode: 'sand', Icon: SunIcon },
  { mode: 'cocoa', Icon: MoonIcon },
];

/**
 * The day / night switch: the sun and the crescent side by side in one pill,
 * the mode on screen wearing the inverted pill.
 *
 * It is two buttons rather than one checkbox, because each side names a
 * destination the reader can aim at directly — pressing the sun always gives
 * Sand, whatever the mode was — and because that is what makes the choice
 * readable before it is made. The state is carried by `aria-pressed` as well
 * as by the inverted pill, so it does not rest on colour alone.
 *
 * Choosing a side pins the mode: the switch is how a reader leaves the
 * operating system preference behind, so `resolvedMode` is what it marks and
 * the implicit `system` mode has no side of its own.
 *
 * Each button is 44 x 44 px, the smallest touch target the system allows, and
 * the icons inside are labelled by the buttons.
 *
 * It owns no state and reads no context: the mode on screen comes in as a
 * prop and the choice goes back out as a call, so the switch can be rendered
 * and tested anywhere, and the mode keeps one owner — `ThemeProvider`.
 */
export function ThemeModeSwitch({
  resolvedMode,
  onModeChange,
  className,
}: {
  /** The mode currently painted, `system` already resolved. */
  resolvedMode: ResolvedThemeMode;
  /** Called with the side that was pressed, which pins that mode. */
  onModeChange: (mode: ResolvedThemeMode) => void;
  className?: string;
}) {

  return (
    <div
      className={cn('theme-mode-switch inline-flex gap-1 rounded-pill bg-surface p-1', className)}
      role="group"
      aria-label="Display mode"
    >
      {THEME_MODE_OPTIONS.map(({ mode, Icon }) => {
        const isCurrent = mode === resolvedMode;

        return (
          <button
            key={mode}
            type="button"
            className={cn(
              'theme-mode-switch__option inline-flex size-11 items-center justify-center rounded-pill transition-colors',
              isCurrent
                ? 'theme-mode-switch__option--current bg-inverse-bg text-inverse-text'
                : 'text-text hover:bg-surface-muted',
            )}
            aria-label={`${THEME_MODE_LABELS[mode]} mode`}
            aria-pressed={isCurrent}
            onClick={() => onModeChange(mode)}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
