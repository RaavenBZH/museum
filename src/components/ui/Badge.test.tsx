import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('states the highlight in words rather than by the accent alone', () => {
    render(<Badge highlight="New">Discovery mode</Badge>);

    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Discovery mode')).toBeInTheDocument();
  });
});
