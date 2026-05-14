import { defineConfig } from 'tsup';

/**
 * tsup build configuration for the NPO Template Express backend.
 *
 * Used by the production Docker build (server/Dockerfile):
 *   yarn workspace npo-server-template run bundle
 *
 * Key decisions
 * ─────────────
 * format: esm
 *   Matches "type": "module" in package.json.  Node 20 supports ESM natively.
 *
 * splitting: false
 *   Keeps a single output file per entry point (dist/server.js) so the
 *   Dockerfile CMD can reference a predictable path.
 *
 * tsconfig: "tsconfig.json"
 *   Explicitly loads the server tsconfig so tsup/esbuild resolves any path
 *   aliases (e.g. @/routes/*, @/common/*, @/db/*) the same way vitest does.
 *
 * external: []  (default — bundle everything except node_modules)
 *   npm packages remain external; all local imports are inlined.  The runtime
 *   image therefore still needs node_modules/ (copied in the Dockerfile).
 */
export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  outDir: 'dist',
  splitting: false,
  clean: true,
  tsconfig: 'tsconfig.json',
});
