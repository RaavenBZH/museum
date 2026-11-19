import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MetMuseumRateLimitError } from '@/api/metMuseumErrors';
import { fetchObjectIds } from '@/api/metMuseumObjects';
import { DISCOVERY_COLLECTION } from '@/domain/discoveryCollection';
import {
  COLLECTION_SIZE_STORAGE_KEY,
  useDiscoveryCollectionSize,
} from './useDiscoveryCollectionSize';

vi.mock('@/api/metMuseumObjects', () => ({ fetchObjectIds: vi.fn() }));

const idsMock = vi.mocked(fetchObjectIds);

function SizeProbe() {
  const { collectionSize, error, retry } = useDiscoveryCollectionSize();

  return (
    <div>
      <p>size: {collectionSize ?? 'unknown'}</p>
      <p>error: {error ?? 'none'}</p>
      <button type="button" onClick={retry}>
        retry
      </button>
    </div>
  );
}

describe('useDiscoveryCollectionSize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    idsMock.mockResolvedValue({ total: 2650, objectIDs: [] });
  });

  it('counts the very collection the draw picks from', async () => {
    render(<SizeProbe />);

    expect(await screen.findByText('size: 2650')).toBeInTheDocument();
    expect(idsMock).toHaveBeenCalledWith(DISCOVERY_COLLECTION, expect.anything());
  });

  it('reports a refusal in one sentence, and reads again on demand', async () => {
    const user = userEvent.setup();

    idsMock.mockRejectedValueOnce(new MetMuseumRateLimitError('any-url'));
    render(<SizeProbe />);

    expect(await screen.findByText(/error: The museum is refusing calls/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'retry' }));

    expect(await screen.findByText('size: 2650')).toBeInTheDocument();
    expect(screen.getByText('error: none')).toBeInTheDocument();
  });

  it('abandons the read when the screen goes away', () => {
    const { unmount } = render(<SizeProbe />);
    const [, options] = idsMock.mock.calls[0];

    unmount();

    expect(options?.signal?.aborted).toBe(true);
  });

  it('states the last size known at once, before the museum has answered', () => {
    localStorage.setItem(COLLECTION_SIZE_STORAGE_KEY, '2650');
    idsMock.mockReturnValue(new Promise(() => {}));

    render(<SizeProbe />);

    expect(screen.getByText('size: 2650')).toBeInTheDocument();
  });

  it('keeps the size it has, rather than an error, when the museum fails', async () => {
    localStorage.setItem(COLLECTION_SIZE_STORAGE_KEY, '2650');
    idsMock.mockRejectedValue(new MetMuseumRateLimitError('any-url'));

    render(<SizeProbe />);

    // Let the refusal land.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.getByText('size: 2650')).toBeInTheDocument();
    expect(screen.getByText('error: none')).toBeInTheDocument();
  });

  it('keeps the size the museum answered, for the next visit', async () => {
    idsMock.mockResolvedValue({ total: 2651, objectIDs: [] });

    render(<SizeProbe />);

    expect(await screen.findByText('size: 2651')).toBeInTheDocument();
    expect(localStorage.getItem(COLLECTION_SIZE_STORAGE_KEY)).toBe('2651');
  });
});
