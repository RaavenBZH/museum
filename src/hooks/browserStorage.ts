/**
 * The one guarded way the application reads and writes the browser's local
 * storage.
 *
 * Storage is a convenience and never a requirement: it can be unavailable — a
 * private window, blocked site data — or full, and every access is then a
 * thrown error. Five things are kept there (the artworks seen, the size of the
 * collection, its counts by century, the gallery layout, the colour mode), and
 * each would otherwise
 * wrap its own access in the same `try`; here it is written once. A failed
 * read is "nothing kept", and a failed write is simply not kept.
 */
export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Full or blocked: what was asked for still applies until the page goes.
  }
}
