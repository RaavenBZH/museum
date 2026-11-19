import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';

function ThemeReader() {
  const { mode, resolvedMode } = useTheme();

  return (
    <p>
      {mode} · {resolvedMode}
    </p>
  );
}

describe('useTheme', () => {
  it('reads the mode of the provider above it', () => {
    render(
      <ThemeProvider>
        <ThemeReader />
      </ThemeProvider>,
    );

    expect(screen.getByText('system · sand')).toBeInTheDocument();
  });

  it('says what is missing when it is called outside a provider', () => {
    // A context with no provider would otherwise hand out a half-state and
    // fail somewhere else; the boundary catches this and names the cause.
    expect(() => render(<ThemeReader />)).toThrow('useTheme must be called inside a ThemeProvider.');
  });
});
