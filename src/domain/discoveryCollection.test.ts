import { describe, expect, it } from 'vitest';
import {
  DISCOVERY_COLLECTION,
  DISCOVERY_COLLECTION_NAME,
  DISCOVERY_DEPARTMENT_ID,
} from './discoveryCollection';

describe('the discovery collection', () => {
  it('is European Paintings, department 11 of the museum', () => {
    expect(DISCOVERY_DEPARTMENT_ID).toBe(11);
    expect(DISCOVERY_COLLECTION_NAME).toBe('European Paintings');
  });

  it('is asked for as that one department, so the draw and the gallery count the same list', () => {
    expect(DISCOVERY_COLLECTION).toEqual({ departmentIds: [DISCOVERY_DEPARTMENT_ID] });
  });
});
