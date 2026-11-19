import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GALLERY_LAYOUT_STORAGE_KEY, useGalleryLayout } from './useGalleryLayout';

function LayoutProbe() {
  const [layout, setLayout] = useGalleryLayout();

  return (
    <div>
      <p>layout: {layout}</p>
      <button type="button" onClick={() => setLayout('list')}>
        list
      </button>
    </div>
  );
}

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('useGalleryLayout', () => {
  it('opens on the grid for a visitor who has not chosen', () => {
    render(<LayoutProbe />);

    expect(screen.getByText('layout: grid')).toBeInTheDocument();
  });

  it('keeps the layout chosen, for the next time the gallery opens', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<LayoutProbe />);

    await user.click(screen.getByRole('button', { name: 'list' }));
    expect(localStorage.getItem(GALLERY_LAYOUT_STORAGE_KEY)).toBe('list');

    // Leaving for Discover unmounts the gallery; coming back mounts a new one.
    unmount();
    render(<LayoutProbe />);

    expect(screen.getByText('layout: list')).toBeInTheDocument();
  });

  it('opens on the grid when storage holds something that is not a layout', () => {
    localStorage.setItem(GALLERY_LAYOUT_STORAGE_KEY, 'table');
    render(<LayoutProbe />);

    expect(screen.getByText('layout: grid')).toBeInTheDocument();
  });

  it('still switches when the browser refuses to store the choice', async () => {
    const user = userEvent.setup();

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });
    render(<LayoutProbe />);
    await user.click(screen.getByRole('button', { name: 'list' }));

    expect(screen.getByText('layout: list')).toBeInTheDocument();
  });
});
