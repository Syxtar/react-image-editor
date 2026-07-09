<!-- Thanks for contributing! Keep PRs focused — one logical change per PR. -->

## Summary

<!-- What does this change and why? -->

Closes #

## Type of change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (public API / behavior)
- [ ] Docs / tooling only

## Checklist

- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] `npm run build -w @ascentsparksoftware/react-image-editor` succeeds
- [ ] Tests added/updated for the change
- [ ] Public API + `README.md` updated (if the surface changed)
- [ ] No `any` / `@ts-ignore`; Fabric.js stays lazy-loaded (no top-level import in the initial bundle)
- [ ] Theming uses `--asp-*` tokens (no hard-coded colors)
