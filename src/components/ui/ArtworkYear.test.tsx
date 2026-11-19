import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArtworkYear } from './ArtworkYear';

describe('ArtworkYear', () => {
  it('keeps the year on one line', () => {
    render(<ArtworkYear>ca. 1831</ArtworkYear>);

    expect(screen.getByText('ca. 1831')).toHaveClass('whitespace-nowrap');
  });
});
