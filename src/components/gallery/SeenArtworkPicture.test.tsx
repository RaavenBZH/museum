import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { stubIntersectionObserver } from '@/test/intersectionObserverStub';
import { SeenArtworkPicture } from './SeenArtworkPicture';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SeenArtworkPicture', () => {
  it('asks for no picture while it is far from the screen', () => {
    stubIntersectionObserver();
    render(<SeenArtworkPicture src="https://images.example/starry.jpg" alt="The Starry Night" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('fetches the picture once it comes near the screen, and keeps it', () => {
    const viewport = stubIntersectionObserver();
    render(<SeenArtworkPicture src="https://images.example/starry.jpg" alt="The Starry Night" />);

    act(() => {
      viewport.scrollAllIntoView();
    });

    expect(screen.getByRole('img', { name: 'The Starry Night' })).toHaveAttribute(
      'src',
      'https://images.example/starry.jpg',
    );
    // Seen once is enough: it stops watching, so scrolling away keeps it.
    expect(viewport.watchedCount).toBe(0);
  });

  it('keeps its frame at its final size before the picture arrives', () => {
    stubIntersectionObserver();
    const { container } = render(
      <SeenArtworkPicture src={null} alt="" style={{ aspectRatio: 1.25 }} />,
    );

    // The browser writes the ratio back as "1.25 / 1".
    expect(
      parseFloat(container.querySelector<HTMLElement>('.seen-artwork-picture')?.style.aspectRatio ?? ''),
    ).toBe(1.25);
  });

  it('says in words that the museum has no picture, once it is in view', () => {
    const viewport = stubIntersectionObserver();
    render(<SeenArtworkPicture src={null} alt="Untitled" />);

    act(() => {
      viewport.scrollAllIntoView();
    });

    expect(screen.getByText('No image available')).toBeInTheDocument();
  });

  it('loads everything in a browser that cannot tell what is in view', () => {
    // jsdom itself has no IntersectionObserver, which is that browser.
    render(<SeenArtworkPicture src="https://images.example/starry.jpg" alt="The Starry Night" />);

    expect(screen.getByRole('img', { name: 'The Starry Night' })).toBeInTheDocument();
  });
});
