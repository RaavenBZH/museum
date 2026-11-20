/**
 * The first check of anything read from outside — a museum payload, an entry
 * the browser kept: is it a JSON object, whose fields can be looked at one by
 * one? The API layer and the domain both start there, so it is written once.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
