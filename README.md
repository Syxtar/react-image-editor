# React Image Editor

**@ascentsparksoftware/react-image-editor** — a standalone, themeable React 19 image editor built
on Fabric.js v7. Free and open-source (MIT). The React sibling of
[@ascentsparksoftware/angular-image-editor](https://github.com/ascentspark/angular-image-editor),
with exact feature parity.

> Full documentation lives in [`packages/react-image-editor/README.md`](packages/react-image-editor/README.md)
> and the interactive demo site (`apps/demo`).

## Workspace

| Path | What it is |
|------|------------|
| `packages/react-image-editor/` | The publishable library |
| `apps/demo/` | Docs/demo site (Vite) |
| `e2e/` | Playwright end-to-end + visual smoke tests |

```bash
npm install
npm run dev -w demo   # demo at http://localhost:5173
npm test              # unit tests
npm run e2e           # Playwright
```

See [CONTRIBUTING.md](CONTRIBUTING.md).
