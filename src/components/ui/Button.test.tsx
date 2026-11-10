import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, ButtonLink } from './Button';

describe('Button', () => {
  it('does not submit the form it may sit in', () => {
    render(<Button variant="primary">Discover</Button>);

    expect(screen.getByRole('button', { name: 'Discover' })).toHaveAttribute('type', 'button');
  });

  it('follows its label with the arrow on the two strong variants only', () => {
    const { container, rerender } = render(<Button variant="primary">Discover</Button>);

    expect(container.querySelector('.arrow-right-icon')).toBeInTheDocument();

    rerender(<Button variant="inverse">Discover</Button>);

    expect(container.querySelector('.arrow-right-icon')).toBeInTheDocument();

    rerender(<Button variant="secondary">Cocoa</Button>);

    expect(container.querySelector('.arrow-right-icon')).not.toBeInTheDocument();

    rerender(<Button variant="text">Settings</Button>);

    expect(container.querySelector('.arrow-right-icon')).not.toBeInTheDocument();
  });

  it('gives the text variant no surface at rest, only one on hover', () => {
    render(<Button variant="text">Settings</Button>);

    const button = screen.getByRole('button', { name: 'Settings' });
    const classes = button.className.split(/\s+/);

    expect(button).toHaveClass('button--text');
    expect(classes.filter((name) => name.startsWith('bg-'))).toEqual([]);
    expect(classes).toContain('hover:bg-surface-muted');
  });

  it('hides the arrow from assistive technology, since the label names the action', () => {
    const { container } = render(<Button variant="inverse">Discover</Button>);

    expect(container.querySelector('.arrow-right-icon')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('ButtonLink', () => {
  it('is a real link, so it keeps the behaviour of one', () => {
    render(
      <ButtonLink variant="primary" href="/discover">
        Discover
      </ButtonLink>,
    );

    expect(screen.getByRole('link', { name: 'Discover' })).toHaveAttribute('href', '/discover');
  });
});
