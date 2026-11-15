import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { HeadlineBlock } from './HeadlineBlock';

describe('HeadlineBlock', () => {
  it('carries the page headline, over two lines', () => {
    render(
      <HeadlineBlock
        firstLine="Learn the collection."
        secondLine="One artwork at a time."
        lead="Discover the Metropolitan Museum of Art collection one artwork at a time."
      />,
    );

    const headline = screen.getByRole('heading', { level: 1 });

    expect(headline).toHaveTextContent('Learn the collection.');
    expect(headline).toHaveTextContent('One artwork at a time.');
  });

  it('leaves the badge and the actions out when it has none', () => {
    const { container } = render(
      <HeadlineBlock firstLine="Learn the collection." secondLine="One artwork at a time." lead="" />,
    );

    expect(container.querySelector('.headline-block__badge')).not.toBeInTheDocument();
    expect(container.querySelector('.headline-block__actions')).not.toBeInTheDocument();
  });

  it('holds the badge and the actions it is given', () => {
    render(
      <HeadlineBlock
        firstLine="Learn the collection."
        secondLine="One artwork at a time."
        lead=""
        badge={<Badge highlight="New">My Gallery</Badge>}
        actions={
          <ButtonLink variant="primary" href="/discover">
            Discover
          </ButtonLink>
        }
      />,
    );

    expect(screen.getByText('My Gallery')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Discover' })).toBeInTheDocument();
  });
});
