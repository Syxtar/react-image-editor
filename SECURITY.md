# Security Policy

## Reporting a vulnerability

**Do not open a public issue for security problems.** Report privately so a fix can ship before
details are public:

- Preferred: GitHub's **private vulnerability reporting** — repo **Security → Report a vulnerability**
  (Settings → Code security → Private vulnerability reporting must be enabled).
- Or email **support@ascentspark.com** with steps to reproduce, affected version(s), and impact.

We aim to acknowledge within **2 business days** and to provide a remediation timeline after triage.
Please give us a reasonable window to release a fix before any public disclosure.

## Supported versions

Security fixes are provided for the latest release of each supported major line:

| Version | React | Supported |
|---------|-------|-----------|
| `1.x`   | 19    | ✅ |

## Scope & trust boundary

`@ascentsparksoftware/react-image-editor` is a client-side library; runtime security ultimately
depends on how the consuming app uses it.

- **Untrusted images / SVGs.** The editor loads consumer-supplied image and SVG data onto an HTML
  canvas. SVGs are rasterized through a sandboxed `<img>` element (scripts in SVG do **not** execute),
  but you should still treat user-uploaded files as untrusted: validate type and size at your upload
  boundary, and serve user content from a separate origin where feasible. Exported blobs/PDFs reflect
  exactly what was drawn — sanitize any text overlaid from untrusted sources in your own app.
- **Optional AI background removal / HEIC decode.** These features activate only when the consuming
  app passes a loader (e.g. one that lazy-imports `@imgly/background-removal` or `heic2any`). Those
  packages are the consumer's dependencies, fetched and executed in the consumer's bundle — pin or
  self-host their runtime assets (ONNX models) if your threat model requires it. Without a loader,
  the corresponding tools are simply unavailable.
- **CSP.** The library is compatible with a nonce-based CSP without `unsafe-eval`: it contains no
  `eval` / `new Function` paths and injects no inline `<style>` elements (theming uses CSS custom
  properties set through the CSSOM).

## What is not a vulnerability

- Issues requiring a malicious local environment or a compromised build toolchain.
- Advisories in **devDependencies / build tooling** that never ship to consumers. Runtime deps that
  ship are limited to the package's declared `dependencies` / `peerDependencies`.
