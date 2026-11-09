import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

describe('App', () => {
  it('renders the headline as the page title', () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Learn the collection.');
  });
});
