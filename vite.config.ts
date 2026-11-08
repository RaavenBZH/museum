import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

// Bind-mounted files do not emit reliable filesystem events on macOS and
// Windows, so the container sets this flag to make the watcher poll instead.
const usesPollingWatcher = process.env.VITE_WATCH_POLLING === 'true';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Listen on every interface so that the port is reachable from outside the
    // container. Harmless when running on the host.
    host: true,
    port: 5173,
    watch: usesPollingWatcher ? { usePolling: true } : undefined,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTestingLibrary.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
