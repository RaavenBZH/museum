import { expect, test } from '@playwright/test';
import { FIXTURE_TITLES, fixtureMedium, playTheMuseum } from './collectionApiMock.ts';

/** One of the three paintings the fixtures hold, as the h1 of Discover reads it. */
const anyFixtureTitle = new RegExp(`^(${FIXTURE_TITLES.join('|')})$`);

test.beforeEach(async ({ page }) => {
  await playTheMuseum(page);
});

test('discovers two artworks, finds them in My Gallery, and opens one again', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Discover art\./);

  // Home → Discover, through the bar.
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Discover' })
    .click();

  const title = page.getByRole('heading', { level: 1 });

  await expect(title).toHaveText(anyFixtureTitle);
  const first = await title.textContent();

  // The record is the museum's own, picture included.
  await expect(page.getByRole('heading', { name: 'The essentials' })).toBeVisible();
  await expect(page.getByRole('img', { name: new RegExp(first ?? '') })).toBeVisible();

  // The way to the next artwork opens after the three seconds given to look.
  const next = page.getByRole('button', { name: 'Discover another' });

  await expect(next).toHaveAttribute('aria-disabled', 'false', { timeout: 6000 });
  await next.click();
  await expect(title).toHaveText(anyFixtureTitle);
  await expect(title).not.toHaveText(first ?? '');
  const second = await title.textContent();

  // Discover → My Gallery: both artworks are kept, and counted against the collection.
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'My Gallery' })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('You have seen 2 artworks.');
  await expect(page.getByText('Out of the 3 in European Paintings.')).toBeVisible();
  await expect(page.getByRole('img', { name: /artworks of European Paintings seen/ })).toBeVisible();

  // The list layout, then the last artwork seen opens again on Discover.
  await page.getByRole('button', { name: 'List' }).click();
  await expect(page.getByRole('figure')).toHaveCount(0);
  await page.getByRole('link', { name: new RegExp(`^${second},`) }).click();

  await expect(page).toHaveURL(/\/discover\/\d+$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(second ?? '');
});

test('unfolds the charts of My Gallery, counted by century and by medium', async ({ page }) => {
  await page.goto('/discover');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(anyFixtureTitle);
  const seen = (await page.getByRole('heading', { level: 1 }).textContent()) ?? '';

  await page.goto('/gallery');
  await page.getByRole('button', { name: 'More about my gallery' }).click();

  await expect(page.getByRole('heading', { name: 'By century' })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Your artworks by century' })).toBeAttached();
  await expect(page.getByRole('heading', { name: 'By medium' })).toBeVisible();
  // The draw is random, so the medium expected is the one the museum records
  // for the artwork that came up, counted once in the legend.
  await expect(
    page.getByRole('listitem').filter({ hasText: `${fixtureMedium(seen) ?? ''}1` }),
  ).toBeVisible();
});

test('answers an address that names no artwork with a way back, never a blank page', async ({ page }) => {
  await page.goto('/discover/not-a-number');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This address names no artwork');
  await page.getByRole('link', { name: 'Back to My Gallery' }).click();
  await expect(page).toHaveURL(/\/gallery$/);
});
