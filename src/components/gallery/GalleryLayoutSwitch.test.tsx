import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GalleryLayoutSwitch } from './GalleryLayoutSwitch';

describe('GalleryLayoutSwitch', () => {
  it('offers both layouts, each named in words', () => {
    render(<GalleryLayoutSwitch layout="grid" onLayoutChange={() => {}} />);

    expect(screen.getByRole('group', { name: 'Layout' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Grid' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'List' })).toBeInTheDocument();
  });

  it('marks the layout in use with more than a colour', () => {
    render(<GalleryLayoutSwitch layout="list" onLayoutChange={() => {}} />);

    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('hands back the layout that was pressed', async () => {
    const user = userEvent.setup();
    const onLayoutChange = vi.fn();

    render(<GalleryLayoutSwitch layout="grid" onLayoutChange={onLayoutChange} />);
    await user.click(screen.getByRole('button', { name: 'List' }));

    expect(onLayoutChange).toHaveBeenCalledWith('list');
  });
});
