import { describe, expect, it, vi } from 'vitest';
import { fetchObject, fetchObjectIds } from '@/api/metMuseumObjects';
import { buildObjectResource } from '@/test/artworkFixture';
import { DISCOVERY_DEPARTMENT_ID } from '@/domain/discoveryCollection';
import { MAX_DRAW_ATTEMPTS, drawRandomArtwork } from './drawRandomArtwork';

vi.mock('@/api/metMuseumObjects', () => ({
  fetchObjectIds: vi.fn(),
  fetchObject: vi.fn(),
}));

const fetchObjectIdsMock = vi.mocked(fetchObjectIds);
const fetchObjectMock = vi.mocked(fetchObject);

const collection = { departmentIds: [DISCOVERY_DEPARTMENT_ID] };

describe('drawRandomArtwork', () => {
  it('reads the collection, draws one identifier and returns the model of it', async () => {
    fetchObjectIdsMock.mockResolvedValue({ total: 1, objectIDs: [437984] });
    fetchObjectMock.mockResolvedValue(buildObjectResource());

    const artwork = await drawRandomArtwork({ excludedIds: [] });

    expect(fetchObjectIdsMock).toHaveBeenCalledWith(collection, { signal: undefined });
    expect(fetchObjectMock).toHaveBeenCalledWith(437984, {
      signal: undefined,
      within: collection,
    });
    expect(artwork?.title).toBe('Wheat Field with Cypresses');
  });

  it('draws outside what it is told to avoid', async () => {
    fetchObjectIdsMock.mockResolvedValue({ total: 3, objectIDs: [1, 2, 437984] });
    fetchObjectMock.mockResolvedValue(buildObjectResource());

    await drawRandomArtwork({ excludedIds: [1, 2] });

    expect(fetchObjectMock).toHaveBeenCalledWith(437984, expect.anything());
  });

  it('passes the caller signal to both calls, so a draw can be abandoned', async () => {
    const { signal } = new AbortController();

    fetchObjectIdsMock.mockResolvedValue({ total: 1, objectIDs: [437984] });
    fetchObjectMock.mockResolvedValue(buildObjectResource());

    await drawRandomArtwork({ excludedIds: [], signal });

    expect(fetchObjectIdsMock).toHaveBeenCalledWith(collection, { signal });
    expect(fetchObjectMock).toHaveBeenCalledWith(437984, { signal, within: collection });
  });

  it('draws again when the museum has never photographed the work it drew', async () => {
    const imageless = buildObjectResource({
      objectID: 437107,
      title: 'Landscape: The Parc Monceau',
      primaryImage: '',
      primaryImageSmall: '',
    });

    fetchObjectIdsMock.mockResolvedValue({ total: 2, objectIDs: [437107, 437984] });
    fetchObjectMock.mockResolvedValueOnce(imageless).mockResolvedValueOnce(buildObjectResource());

    const artwork = await drawRandomArtwork({ excludedIds: [] });

    // The screen is built on one large picture, so a work without one is not
    // shown: it is drawn again instead.
    expect(artwork?.imageUrl).not.toBeNull();
    expect(fetchObjectMock).toHaveBeenCalledTimes(2);
  });

  it('stops rather than reading a work it has already rejected', async () => {
    fetchObjectIdsMock.mockResolvedValue({ total: 3, objectIDs: [1, 2, 3] });
    fetchObjectMock.mockImplementation(async (objectID: number) =>
      buildObjectResource({ objectID, primaryImage: '', primaryImageSmall: '' }),
    );

    await expect(drawRandomArtwork({ excludedIds: [] })).resolves.toBeNull();

    const drawnIds = fetchObjectMock.mock.calls.map(([objectID]) => objectID);

    // Three works, none with a picture: each is read once and the draw stops,
    // instead of starting a fresh round over the same three.
    expect(drawnIds).toHaveLength(3);
    expect(new Set(drawnIds).size).toBe(3);
  });

  it('gives up rather than reading the whole department for a picture', async () => {
    fetchObjectIdsMock.mockResolvedValue({
      total: 50,
      objectIDs: Array.from({ length: 50 }, (_, index) => index + 1),
    });
    fetchObjectMock.mockImplementation(async (objectID: number) =>
      buildObjectResource({ objectID, primaryImage: '', primaryImageSmall: '' }),
    );

    await expect(drawRandomArtwork({ excludedIds: [] })).resolves.toBeNull();
    expect(fetchObjectMock).toHaveBeenCalledTimes(MAX_DRAW_ATTEMPTS);
  });

  it('draws nothing from an empty collection, and asks the museum for nothing', async () => {
    fetchObjectIdsMock.mockResolvedValue({ total: 0, objectIDs: [] });

    await expect(drawRandomArtwork({ excludedIds: [] })).resolves.toBeNull();
    expect(fetchObjectMock).not.toHaveBeenCalled();
  });
});
