import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';

/**
 * The museum, played from files: every call the application makes to the
 * collection API or to its image server is answered here, from responses
 * recorded from the real API on 2026-11-20, so the journey never depends on
 * the museum being up, fast or willing.
 *
 * Department 11 is cut down to three paintings, which is enough for a first
 * artwork, one held behind it and one more after it.
 */
const FIXTURES = fileURLToPath(new URL('./fixtures/', import.meta.url));

function fixture(name: string): Buffer {
  return readFileSync(`${FIXTURES}${name}`);
}

/** The counts by century the museum's search gave for department 11. */
const CENTURY_COUNTS: Record<string, number> = {
  '1200': 6,
  '1300': 60,
  '1400': 202,
  '1500': 286,
  '1600': 472,
  '1700': 425,
  '1800': 960,
  '1900': 61,
};

const FIXTURE_OBJECT_IDS = [436105, 435809, 436535] as const;

/** Each recorded painting's title and medium, read from its own response. */
const FIXTURE_OBJECTS = FIXTURE_OBJECT_IDS.map((objectId) => {
  const { title, medium } = JSON.parse(fixture(`object-${objectId}.json`).toString()) as {
    title: string;
    medium: string;
  };

  return { title, medium };
});

export const FIXTURE_TITLES = FIXTURE_OBJECTS.map((object) => object.title);

/** The medium the museum records for the painting of that title. */
export function fixtureMedium(title: string): string | undefined {
  return FIXTURE_OBJECTS.find((object) => object.title === title)?.medium;
}

export async function playTheMuseum(page: Page): Promise<void> {
  await page.route('https://collectionapi.metmuseum.org/**', async (route) => {
    const url = new URL(route.request().url());
    const objectId = /\/v1\/objects\/(\d+)$/.exec(url.pathname)?.[1];

    if (url.pathname.endsWith('/v1/objects') && url.searchParams.get('departmentIds') === '11') {
      await route.fulfill({ contentType: 'application/json', body: fixture('department-11-objects.json') });
    } else if (objectId !== undefined) {
      await route.fulfill({ contentType: 'application/json', body: fixture(`object-${objectId}.json`) });
    } else if (url.pathname.endsWith('/v1.1/search')) {
      const total = CENTURY_COUNTS[url.searchParams.get('dateBegin') ?? ''] ?? 0;

      await route.fulfill({ contentType: 'application/json', json: { total, objectIDs: [] } });
    } else {
      await route.fulfill({ status: 404, json: { message: 'Not in the fixtures' } });
    }
  });

  await page.route('https://images.metmuseum.org/**', (route) =>
    route.fulfill({ contentType: 'image/png', body: fixture('artwork.png') }),
  );
}
