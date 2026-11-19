import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchObject } from '@/api/metMuseumObjects';
import { DISCOVERY_COLLECTION } from '@/domain/discoveryCollection';
import { buildObjectResource } from '@/test/artworkFixture';
import { fetchDiscoveryArtwork } from './fetchDiscoveryArtwork';

vi.mock('@/api/metMuseumObjects', () => ({ fetchObject: vi.fn() }));

const fetchObjectMock = vi.mocked(fetchObject);

describe('fetchDiscoveryArtwork', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads the artwork within the collection Discover draws from', async () => {
    fetchObjectMock.mockResolvedValue(buildObjectResource());
    const signal = new AbortController().signal;

    const artwork = await fetchDiscoveryArtwork(437984, { signal });

    expect(artwork?.title).toBe('Wheat Field with Cypresses');
    expect(fetchObjectMock).toHaveBeenCalledWith(437984, { signal, within: DISCOVERY_COLLECTION });
  });

  it('answers with nothing for an artwork the museum serves no picture for', async () => {
    fetchObjectMock.mockResolvedValue(
      buildObjectResource({ primaryImage: '', primaryImageSmall: '' }),
    );

    await expect(fetchDiscoveryArtwork(437984)).resolves.toBeNull();
  });

  it('passes the refusal of the museum on, for the run to word it', async () => {
    const refusal = new Error('refused');

    fetchObjectMock.mockRejectedValue(refusal);

    await expect(fetchDiscoveryArtwork(437984)).rejects.toBe(refusal);
  });
});
