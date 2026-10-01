# Changelog

All notable changes to `@ascentsparksoftware/react-image-editor`.

## 1.1.0-syxtar.4 — 2026-10-01

- Normalized raster output to the exact integer dimensions declared by the
  project, avoiding Fabric's occasional one-pixel export rounding.

## 1.1.0-syxtar.3 — 2026-10-01

- Added editable host projects, separate draft/panel save callbacks, dirty state,
  pointer-centred wheel zoom, and exact intrinsic-size image-bound exports.

## 1.1.0-syxtar.2 — 2026-10-01

- Added `exportBounds="image"` to preserve the base image pixel dimensions and
  exclude transparent canvas padding from uncropped exports.

## 1.1.0-syxtar.1 — 2026-10-01

- Added text outline, shadow, skew, flip, and blend-mode controls.
- Added host-managed save labels and a configurable default font.
- Added transparent shape stroke selection.
- Raised lossless export capacity to 50 megapixels and removed silent import downscaling.

## 1.1.0 — 2026-08-04

### Fixed — cropped exports were silently downsampled to screen resolution

**Every consumer that cropped a photo got a screen-sized export.** The crop region
lives in scene coordinates, and the base image is scaled down to fit the canvas on
screen, so a committed crop rasterised at whatever size the host's dialog happened
to be. A 2400×2400 photo cropped 1:1 in a 640px modal exported at ~230×230. Nothing
in the UI or the API said the resolution had been thrown away, and the loss is
permanent once the blob is stored.

Cropped exports now carry the source image's real pixels. If you crop, expect
larger blobs than before — that is the fix. Use `exportTarget` (below) if you want
a specific, smaller size.

Found in the Angular sibling of this engine (reported by the Hiero CMS team) and
present here identically.

### Fixed — exports were wrong while the canvas was zoomed or panned

Fabric treats the crop rectangle handed to `toDataURL()` as viewport-space, so a
zoomed or panned canvas sampled the wrong area at the wrong scale. The engine now
renders the export at an identity viewport, as the redaction sampler already did.

### Added — `exportTarget`, and real dimensions on aspect options

```tsx
// An exact pixel size for every crop in this editor
<ImageEditor exportTarget={{ width: 1000, height: 1000 }} />

// …or per aspect option — the selected chip's dimensions win while it is selected
<ImageEditor aspectRatios={[aspectOption(1200, 630), aspectOption(1000, 1000)]} />
```

- `AspExportTarget` — new exported type.
- `AspAspectOption` gains optional `width`/`height`; `aspectOption(w, h, label)` now
  keeps them instead of collapsing to `{ label, ratio }`. Additive; hand-built
  `{ label, ratio }` options keep working.
- `EditorEngine.setExportTarget()` / `getExportTarget()` for headless hosts.
- Exports are capped at the source's real resolution (never upscaled) and at a
  4096×4096 bitmap so low-end devices can allocate them.

### Added — custom aspect chips in `basic` mode

`aspectRatios` was documented as "shown after the presets" but the basic (profile
photo) layout only rendered the built-in presets, so a host could not offer a
CMS-sized target in the very mode the export bug hit hardest.

### Changed

- `outputSize()` now reports the delivered export size rather than the crop region
  in scene units, so the PDF page size matches the image it contains.
- The Playwright suite asserts export resolution on decoded blobs, via a `/e2e`
  harness that can generate a source image of a given size.
- Removed a dead private method that kept `tsc --noEmit` from passing.

### Known issue (unchanged)

`svg` export still serialises the whole canvas and ignores the crop region. Tracked
separately.
