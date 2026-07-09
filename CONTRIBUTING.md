# Contributing

Thanks for your interest in improving **@ascentsparksoftware/react-image-editor**. This document
covers how to file issues, set up the project, and open a pull request.

## Filing issues

- **Bugs** → open a [Bug report](https://github.com/ascentspark/react-image-editor/issues/new/choose).
  A **minimal reproduction is required** — a StackBlitz, a small repo, or an exact sequence of steps.
  "It doesn't work" without a repro will be closed.
- **Features** → open a Feature request and **discuss the API first**. For a UI library the public
  surface (component props/callbacks, engine methods, tool/filter registry) is a semver contract;
  agreeing on the shape before code saves everyone a rewrite.
- **Security** → **do not** open a public issue. Follow [`SECURITY.md`](SECURITY.md).

## Project layout

This is an npm-workspaces monorepo:

| Path | What it is |
|------|------------|
| `packages/react-image-editor/` | The publishable library |
| `apps/demo/` | The docs/demo site (Vite) used for manual/visual testing |
| `e2e/` | Playwright end-to-end + visual smoke tests against the demo |

## Setup & commands

```bash
npm install                                  # install deps (workspace root)
npm run build -w @ascentsparksoftware/react-image-editor   # build the library
npm run dev -w demo                          # run the demo at http://localhost:5173
npm test                                     # run the library's unit tests (Vitest)
npm run lint                                 # lint everything
npm run e2e                                  # Playwright e2e (builds + serves the demo)
```

Run a single test with:

```bash
npm test -- -t "name of the test"
```

## Coding conventions

- **No `any`, no `@ts-ignore` / `@ts-expect-error`.** ESLint enforces this and the build will fail.
  Use real types, generics, or `unknown` + narrowing at boundaries.
- **Client-only, but import-safe on the server.** The package ships `"use client"`, and consumers
  load it via `next/dynamic(..., { ssr: false })` — but Next.js still *imports* the module on the
  server. Never touch `window`/`document`/canvas at module scope; DOM work belongs in effects,
  handlers, or `EditorEngine.create`.
- **StrictMode-safe effects.** Engine init/dispose must be idempotent — create in the effect,
  dispose in its cleanup, no leaked listeners. Dev StrictMode mounts everything twice.
- **React Compiler-safe state.** The Fabric engine and the `EditorController` live in refs; UI
  state is exposed through `useSyncExternalStore` snapshots. Never expose a mutated stable object
  to render.
- **Fabric.js is lazy-loaded.** Don't add top-level `import 'fabric'` to anything that ships in the
  initial bundle — load it through the engine's existing lazy path so consumers who never open the
  editor don't pay for it.
- **Theming is 3 props.** The `--asp-*` palette is derived from accent/surface/mode via the OKLCH
  theme pipeline; don't hard-code colors in component CSS — use the tokens.
- **Heavy/optional features stay out of the import graph.** AI background removal and HEIC decode
  are consumer-provided loaders (props), never dependencies of this package.
- Match the style of the surrounding code; keep files focused (one clear responsibility).

## Pull requests

Before opening a PR, make sure:

- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] `npm run build -w @ascentsparksoftware/react-image-editor` succeeds
- [ ] New behavior has tests
- [ ] Public API changes are reflected in `src/index.ts` and the `README.md`
- [ ] No `any` / `@ts-ignore`; no top-level Fabric import in the initial bundle

Keep PRs focused — one logical change per PR. Reference the issue it closes (`Closes #123`).

## Release lines

The package version is decoupled from framework majors: `main` tracks the current React peer range
(`react@^19`). If a future React major needs a breaking peer bump, it gets a new package major on
`main`, and the previous major moves to a long-lived `N.x` maintenance branch — same discipline as
the Angular sibling package (`@ascentsparksoftware/angular-image-editor`).

## Releasing (maintainers)

The library is published to npm with **provenance via OIDC trusted publishing** — no npm token is
stored anywhere. Publishing is handled by the **Release** GitHub Actions workflow
(`.github/workflows/release.yml`).

To cut a release:

1. On the line's branch (`main` or `N.x`), bump `version` in
   `packages/react-image-editor/package.json`.
2. Commit and push. CI (`ci.yml`) runs build + tests on the push.
3. Once CI is green, run the workflow from that branch: **Actions → Release → Run workflow**, or
   `gh workflow run release.yml --ref <branch>`.

The workflow derives the npm dist-tag from the branch (`main → latest`, `N.x → vN`), builds the
library, bundles the README + `LICENSE`, publishes with `--provenance --access public --tag <tag>`,
and then tags the commit and cuts a matching GitHub Release. It refuses to run from any branch that
is not `main` or `N.x`, verifies the version major matches the line, and fails fast if the version
already exists on npm.

> One-time setup: npm must list this repo + the `release.yml` workflow as a **Trusted Publisher**
> for the package (npmjs.com → package → Settings → Trusted Publisher → GitHub Actions). No
> `NPM_TOKEN` secret is needed.
