import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DatePill } from './DatePill';

describe('DatePill', () => {
  it('keeps the year on one line', () => {
    render(<DatePill>ca. 1831</DatePill>);

    expect(screen.getByText('ca. 1831')).toHaveClass('whitespace-nowrap');
  });
});
