import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MetMuseumRateLimitError } from '@/api/metMuseumErrors';
import { fetchDepartmentPeriodCount } from '@/api/metMuseumSearch';
import { useCollectionCenturies } from './useCollectionCenturies';

vi.mock('@/api/metMuseumSearch', () => ({ fetchDepartmentPeriodCount: vi.fn() }));

const countMock = vi.mocked(fetchDepartmentPeriodCount);

function CenturiesProbe({ enabled }: { enabled: boolean }) {
  const { counts, error, retry } = useCollectionCenturies(enabled);

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
    countMock.mockImplementation(async (_departmentId, span) =>
      span.beginYear === 1800 ? 960 : 10,
    );
  });

  it('asks the museum nothing while the section is folded', () => {
    render(<CenturiesProbe enabled={false} />);

    expect(countMock).not.toHaveBeenCalled();
    expect(screen.getByText('1800s: unknown')).toBeInTheDocument();
  });

  it('counts the discovery collection century by century once unfolded', async () => {
    render(<CenturiesProbe enabled />);

    expect(await screen.findByText('1800s: 960')).toBeInTheDocument();
    expect(countMock).toHaveBeenCalledTimes(8);
    expect(countMock).toHaveBeenCalledWith(
      11,
      { beginYear: 1800, endYear: 1899 },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('reports a refusal in one sentence, and counts again on demand', async () => {
    const user = userEvent.setup();

    countMock.mockRejectedValueOnce(new MetMuseumRateLimitError('any-url'));
    render(<CenturiesProbe enabled />);

    expect(await screen.findByText(/error: The museum is refusing calls/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'retry' }));

    expect(await screen.findByText('1800s: 960')).toBeInTheDocument();
  });

  it('abandons the count when the section is folded again before it lands', () => {
    countMock.mockReturnValue(new Promise(() => {}));
    const { rerender } = render(<CenturiesProbe enabled />);
    const signal = countMock.mock.calls[0][2]?.signal;

    rerender(<CenturiesProbe enabled={false} />);

    expect(signal?.aborted).toBe(true);
  });
});
