import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

function Failing(): never {
  throw new Error('useDiscovery must be called inside a DiscoveryProvider.');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React reports every caught error on the console; the test expects it.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows what it is given, as long as nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>The artwork</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('The artwork')).toBeInTheDocument();
  });

  it('keeps a screen on the page when its tree throws', () => {
    render(
      <ErrorBoundary>
        <Failing />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('This screen stopped working.');
  });

  it('offers a real page load, which is the only way out of a failed tree', () => {
    render(
      <ErrorBoundary>
        <Failing />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('link', { name: 'Reload the application' })).toHaveAttribute(
      'href',
      '/',
    );
  });
});
