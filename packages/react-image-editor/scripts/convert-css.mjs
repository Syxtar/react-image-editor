#!/usr/bin/env node
/**
 * Convert the Angular library's per-component (view-encapsulated) CSS into
 * root-class-scoped CSS for the React package.
 *
 * Angular's emulated view encapsulation guarantees a component's rules never
 * leak into a sibling component. The React equivalent: every selector is
 * scoped under the component's root class (`:host` becomes the root class
 * itself; everything else gets it prepended as an ancestor). `@keyframes`
 * bodies and at-rule preludes pass through untouched; rules inside `@media`
 * are scoped like top-level ones.
 *
 * Usage: node scripts/convert-css.mjs <src.css> <rootClass> <dest.css>
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [src, rootClass, dest] = process.argv.slice(2);
if (!src || !rootClass || !dest) {
  console.error('usage: convert-css.mjs <src.css> <rootClass> <dest.css>');
  process.exit(1);
}

const css = readFileSync(src, 'utf8');

/** Rewrite one selector of a comma-separated selector list. */
function scopeSelector(selector, root) {
  const s = selector.trim();
  if (s === ':host') {
    return `.${root}`;
  }
  if (s.startsWith(':host ')) {
    return `.${root} ${s.slice(':host '.length)}`;
  }
  return `.${root} ${s}`;
}

let out = '';
let buffer = '';
let depth = 0; // nesting depth of `{`
let keyframesDepth = -1; // depth at which an @keyframes block was opened

for (let i = 0; i < css.length; i++) {
  const ch = css[i];
  if (ch === '{') {
    const prelude = buffer;
    const trimmed = prelude.trim();
    const inKeyframes = keyframesDepth !== -1 && depth > keyframesDepth;
    if (trimmed.startsWith('@')) {
      // At-rule prelude (@media, @supports, @keyframes…): emit as-is.
      if (trimmed.startsWith('@keyframes')) {
        keyframesDepth = depth;
      }
      out += prelude + '{';
    } else if (inKeyframes || trimmed === '') {
      // Keyframe steps (from/to/%): emit as-is.
      out += prelude + '{';
    } else {
      // Emit comments ahead of the rule, then scope the comment-free selector
      // list (a comma inside a comment must not split the selector).
      const comments = trimmed.match(/\/\*[\s\S]*?\*\//g) ?? [];
      const selectorOnly = trimmed.replace(/\/\*[\s\S]*?\*\//g, ' ').trim();
      const leading = prelude.match(/^\s*/)?.[0] ?? '';
      const scoped = selectorOnly
        .split(',')
        .map((sel) => scopeSelector(sel, rootClass))
        .join(',\n');
      out += leading + comments.map((c) => c + '\n').join('') + scoped + ' {';
    }
    buffer = '';
    depth++;
  } else if (ch === '}') {
    depth--;
    if (keyframesDepth !== -1 && depth === keyframesDepth) {
      keyframesDepth = -1;
    }
    out += buffer + '}';
    buffer = '';
  } else {
    buffer += ch;
  }
}
out += buffer;

writeFileSync(dest, out);
console.log(`${src} -> ${dest} (scoped under .${rootClass})`);
