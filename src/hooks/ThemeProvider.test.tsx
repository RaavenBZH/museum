import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { THEME_STORAGE_KEY } from '@/domain/themeModes';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';

/**
 * Reads the mode the way the shell does, and offers the two choices the switch
 * offers. The switch itself is not involved: it holds no state, so what is
 * being tested here is the provider under it.
 */
function ThemeProbe() {
  const { mode, resolvedMode, setMode } = useTheme();

  return (
    <div>
      <p>
        {mode} · {resolvedMode}
      </p>
      <button type="button" onClick={() => setMode('cocoa')}>
        Cocoa mode
      </button>
      <button type="button" onClick={() => setMode('sand')}>
        Sand mode
      </button>
    </div>
  );
}

function renderThemeProbe() {
  return render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>,
  );
}

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('ThemeProvider', () => {
  it('follows the system preference until a mode is chosen', () => {
    renderThemeProbe();

    expect(document.documentElement).not.toHaveAttribute('data-theme');
    expect(screen.getByText('system · sand')).toBeInTheDocument();
  });

  it('pins the chosen mode and remembers the choice', async () => {
    const user = userEvent.setup();
    renderThemeProbe();

    await user.click(screen.getByRole('button', { name: 'Cocoa mode' }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'cocoa');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('cocoa');

    await user.click(screen.getByRole('button', { name: 'Sand mode' }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'sand');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('sand');
  });

  it('restores the mode saved by a previous visit', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'cocoa');

    renderThemeProbe();

    expect(document.documentElement).toHaveAttribute('data-theme', 'cocoa');
  });

  it('takes its attribute off <html> again when it goes away', async () => {
    const user = userEvent.setup();
    const { unmount } = renderThemeProbe();

    await user.click(screen.getByRole('button', { name: 'Cocoa mode' }));
    unmount();

    // <html> is outside React's tree: a mode left behind there would outlive
    // the provider that chose it.
    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });
});
