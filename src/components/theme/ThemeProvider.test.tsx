import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeModeSwitch } from './ThemeModeSwitch';
import { ThemeProvider } from './ThemeProvider';
import { THEME_STORAGE_KEY } from './themeModes';

function renderThemeSwitch() {
  return render(
    <ThemeProvider>
      <ThemeModeSwitch />
    </ThemeProvider>,
  );
}

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('ThemeProvider', () => {
  it('follows the system preference until a mode is chosen', () => {
    renderThemeSwitch();

    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });

  it('pins the chosen mode and remembers the choice', async () => {
    const user = userEvent.setup();
    renderThemeSwitch();

    await user.click(screen.getByRole('button', { name: 'Cocoa mode' }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'cocoa');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('cocoa');

    await user.click(screen.getByRole('button', { name: 'Sand mode' }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'sand');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('sand');
  });

  it('restores the mode saved by a previous visit', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'cocoa');

    renderThemeSwitch();

    expect(document.documentElement).toHaveAttribute('data-theme', 'cocoa');
  });
});
