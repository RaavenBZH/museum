import type { ObjectIdsQuery } from '@/api/metMuseumEndpoints';

/**
 * The collection Discover draws from, and that My Gallery measures a visitor's
 * progress against: department 11 of the museum, European Paintings.
 *
 * It is the collection discovery starts in: 2 724 works with an image, almost
 * all of them photographed and dated, which is what a screen built on one
 * large picture needs. Its identity lives here, apart from the draw, because
 * two screens name it and only one of them draws.
 */
export const DISCOVERY_DEPARTMENT_ID = 11;

/** How the museum names department 11. */
export const DISCOVERY_COLLECTION_NAME = 'European Paintings';

/** What it holds, in the words of the museum's own presentation of it. */
export const DISCOVERY_COLLECTION_DESCRIPTION =
  'Paintings from the thirteenth to the early twentieth century.';

/** The query the draw reads its identifiers from, and My Gallery counts. */
export const DISCOVERY_COLLECTION: ObjectIdsQuery = { departmentIds: [DISCOVERY_DEPARTMENT_ID] };
