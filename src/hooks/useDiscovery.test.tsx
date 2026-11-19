import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildArtwork } from '@/test/artworkFixture';
import { DiscoveryContext, type DiscoveryContextValue } from './DiscoveryContext';
import { useDiscovery } from './useDiscovery';

function DiscoveryReader() {
  const { artwork } = useDiscovery();

  return <p>{artwork === null ? 'none' : artwork.title}</p>;
}

const run: DiscoveryContextValue = {
  hasStarted: true,
  artwork: buildArtwork(),
  isDrawing: false,
  isAwaitingNext: false,
  nextImageUrl: null,
  seen: [],
  error: null,
  openFailure: null,
  start: vi.fn(),
  next: vi.fn(),
  retry: vi.fn(),
  open: vi.fn(),
};

describe('useDiscovery', () => {
  it('reads the run of the provider above it', () => {
    render(
      <DiscoveryContext.Provider value={run}>
        <DiscoveryReader />
      </DiscoveryContext.Provider>,
    );

    expect(screen.getByText('Wheat Field with Cypresses')).toBeInTheDocument();
  });

  describe('outside a provider', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('throws at the first render rather than showing a screen with no run', () => {
      expect(() => render(<DiscoveryReader />)).toThrow(
        'useDiscovery must be called inside a DiscoveryProvider.',
      );
    });
  });
});
