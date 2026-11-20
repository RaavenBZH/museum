import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MetMuseumRateLimitError } from '@/api/metMuseumErrors';
import { fetchDepartmentPeriodCount } from '@/api/metMuseumSearch';
import {
  COLLECTION_CENTURIES_MAX_AGE_MS,
  COLLECTION_CENTURIES_STORAGE_KEY,
  useCollectionCenturies,
} from './useCollectionCenturies';

vi.mock('@/api/metMuseumSearch', () => ({ fetchDepartmentPeriodCount: vi.fn() }));

const countMock = vi.mocked(fetchDepartmentPeriodCount);

const KEPT_COUNTS = {
  1200: 6,
  1300: 60,
  1400: 202,
  1500: 286,
  1600: 472,
  1700: 425,
  1800: 950,
  1900: 61,
};

function keepCounts(countedAt: number) {
  localStorage.setItem(
    COLLECTION_CENTURIES_STORAGE_KEY,
    JSON.stringify({ counts: KEPT_COUNTS, countedAt }),
  );
}

function CenturiesProbe() {
  const { counts, error, retry } = useCollectionCenturies();

  return (
    <div>
      <p>1800s: {counts === null ? 'unknown' : counts[1800]}</p>
      <p>error: {error ?? 'none'}</p>
      <button type="button" onClick={retry}>
        retry
      </button>
    </div>
  );
}

describe('useCollectionCenturies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    countMock.mockImplementation(async (_departmentId, span) =>
      span.beginYear === 1800 ? 960 : 10,
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('counts the discovery collection century by century as soon as it mounts', async () => {
    render(<CenturiesProbe />);

    expect(await screen.findByText('1800s: 960')).toBeInTheDocument();
    expect(countMock).toHaveBeenCalledTimes(8);
    expect(countMock).toHaveBeenCalledWith(
      11,
      { beginYear: 1800, endYear: 1899 },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('keeps the counts for the next visit', async () => {
    render(<CenturiesProbe />);

    await screen.findByText('1800s: 960');

    const kept = JSON.parse(localStorage.getItem(COLLECTION_CENTURIES_STORAGE_KEY) ?? '{}');

    expect(kept.counts[1800]).toBe(960);
    expect(typeof kept.countedAt).toBe('number');
  });

  it('shows counts kept within the day at once, and asks the museum nothing', () => {
    keepCounts(Date.now() - 60 * 1000);

    render(<CenturiesProbe />);

    expect(screen.getByText('1800s: 950')).toBeInTheDocument();
    expect(countMock).not.toHaveBeenCalled();
  });

  it('shows older counts at once, and counts again behind them', async () => {
    keepCounts(Date.now() - COLLECTION_CENTURIES_MAX_AGE_MS - 1);

    render(<CenturiesProbe />);

    expect(screen.getByText('1800s: 950')).toBeInTheDocument();
    expect(await screen.findByText('1800s: 960')).toBeInTheDocument();
  });

  it('keeps older counts on screen rather than an error, when the museum refuses', async () => {
    keepCounts(Date.now() - COLLECTION_CENTURIES_MAX_AGE_MS - 1);
    countMock.mockRejectedValue(new MetMuseumRateLimitError('any-url'));

    render(<CenturiesProbe />);

    // Let the refusal land.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(screen.getByText('1800s: 950')).toBeInTheDocument();
    expect(screen.getByText('error: none')).toBeInTheDocument();
  });

  it('reports a refusal when it has nothing to show, and counts again on demand', async () => {
    const user = userEvent.setup();

    countMock.mockRejectedValueOnce(new MetMuseumRateLimitError('any-url'));
    render(<CenturiesProbe />);

    expect(await screen.findByText(/error: The museum is refusing calls/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'retry' }));

    expect(await screen.findByText('1800s: 960')).toBeInTheDocument();
  });

  it('ignores kept counts that do not have the right shape', () => {
    localStorage.setItem(COLLECTION_CENTURIES_STORAGE_KEY, JSON.stringify({ counts: { 1800: 'x' } }));
    countMock.mockReturnValue(new Promise(() => {}));

    render(<CenturiesProbe />);

    expect(screen.getByText('1800s: unknown')).toBeInTheDocument();
    expect(countMock).toHaveBeenCalled();
  });

  it('abandons the count when the screen goes away before it lands', () => {
    countMock.mockReturnValue(new Promise(() => {}));
    const { unmount } = render(<CenturiesProbe />);
    const signal = countMock.mock.calls[0][2]?.signal;

    unmount();

    expect(signal?.aborted).toBe(true);
  });
});
