import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'tsup';

/**
 * Library build: single ESM entry with types, `"use client"` banner (the whole
 * package is a client component set for Next.js/RSC consumers), and the
 * component stylesheet concatenated to dist/styles.css.
 */
export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  banner: { js: '"use client";' },
  external: ['react', 'react-dom', 'react/jsx-runtime', 'fabric', 'jsondiffpatch', 'jspdf'],
  onSuccess: async () => {
    // Assemble dist/styles.css from src/styles/*.css in a stable order.
    const stylesDir = join(import.meta.dirname, 'src/styles');
    const order = readFileSync(join(stylesDir, 'order.txt'), 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const seen = new Set(order);
    for (const file of readdirSync(stylesDir).sort()) {
      if (file.endsWith('.css') && !seen.has(file)) {
        order.push(file);
      }
    }
    const css = order.map((file) => readFileSync(join(stylesDir, file), 'utf8')).join('\n');
    mkdirSync(join(import.meta.dirname, 'dist'), { recursive: true });
    writeFileSync(join(import.meta.dirname, 'dist/styles.css'), css);
    copyFileSync(join(import.meta.dirname, '../../LICENSE'), join(import.meta.dirname, 'LICENSE'));
  },
});
