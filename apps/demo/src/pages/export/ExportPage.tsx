import { useState, type ReactElement } from 'react';
import { ImageEditor } from '@ascentsparksoftware/react-image-editor';

import { DocExample, type ExampleSource } from '../../shared/DocExample';
import { DocPage, type PageSection } from '../../shared/DocPage';

const SECTIONS: PageSection[] = [
  { id: 'formats', label: 'Formats & quality' },
  { id: 'resolution', label: 'Export resolution' },
  { id: 'svg', label: 'SVG fonts' },
  { id: 'pdf', label: 'PDF' },
  { id: 'json', label: 'JSON & exact-pixel' },
];

const RESOLUTION_SOURCES: ExampleSource[] = [
  {
    label: 'TSX',
    lang: 'tsx',
    code: `import { aspectOption } from '@ascentsparksoftware/react-image-editor';

// An exact pixel size for every crop…
<ImageEditor exportTarget={{ width: 1000, height: 1000 }} />

// …or let the selected aspect chip decide — each option carries real dimensions.
<ImageEditor
  aspectRatios={[aspectOption(1200, 630, 'Social'), aspectOption(1000, 1000, 'Avatar')]}
/>`,
  },
];

const FORMAT_SOURCES: ExampleSource[] = [
  {
    label: 'TSX',
    lang: 'tsx',
    code: `<ImageEditor
  exportFormats={['png', 'jpeg', 'webp', 'svg', 'pdf', 'json']}
  exportQuality={90}
  onExported={onExported}
/>`,
  },
  {
    label: 'TS',
    lang: 'ts',
    code: `const onExported = (blob: Blob): void => {
  // download it, upload it, or preview it
  console.log(blob.type, blob.size);
};`,
  },
];

const SVG_SOURCES: ExampleSource[] = [
  { label: 'TSX', lang: 'tsx', code: `<ImageEditor exportFormats={['png', 'svg']} />` },
];

const PDF_SOURCES: ExampleSource[] = [
  { label: 'TSX', lang: 'tsx', code: `<ImageEditor exportFormats={['png', 'pdf']} />` },
];

const JSON_SOURCES: ExampleSource[] = [
  { label: 'TSX', lang: 'tsx', code: `<ImageEditor exportFormats={['png', 'json']} />` },
];

export default function ExportPage(): ReactElement {
  const [result, setResult] = useState('');

  const onExported = (blob: Blob): void => {
    setResult(`exported ${blob.type} — ${blob.size} bytes`);
  };

  return (
    <DocPage
      heading="Export"
      lead="Choose which formats the Export menu offers, and the editor produces the corresponding Blob. PNG, JPEG, WEBP, a font-embedded SVG, a PDF, or a re-editable JSON scene."
      sections={SECTIONS}
    >
      <DocExample
        anchor="formats"
        title="Formats & quality"
        description="exportFormats lists the offered formats; exportQuality (10–100) sets raster quality. The Export menu downloads the result and emits it via onExported / onSaved."
        sources={FORMAT_SOURCES}
      >
        <ImageEditor
          mode="advanced"
          exportFormats={['png', 'jpeg', 'webp', 'svg', 'pdf', 'json']}
          exportQuality={90}
          height="500px"
          onExported={onExported}
        />
        {result && <p className="note">{result}</p>}
      </DocExample>

      <DocExample
        anchor="resolution"
        title="Export resolution"
        description="A cropped export carries the source image's real pixels, never the on-screen size of the crop frame. Set exportTarget for an exact size, or give an aspect option real dimensions so the selected chip decides. Either way the export is capped at the source's own resolution — the editor never upscales."
        sources={RESOLUTION_SOURCES}
      >
        <p className="prose">
          Without a target, a crop exports at full source fidelity. With one, it is exactly that
          size unless the photo does not hold that many pixels.
        </p>
      </DocExample>

      <DocExample
        anchor="svg"
        title="SVG with embedded fonts"
        description="SVG export inlines the web fonts used by text as base64 @font-face rules, so the file renders the true typeface in any viewer — self-contained, with text kept as real, selectable text."
        sources={SVG_SOURCES}
      >
        <p className="prose">
          Add <code>'svg'</code> to <code>exportFormats</code> and export — the downloaded{' '}
          <code>.svg</code> carries the font data, no network needed to render it correctly.
        </p>
      </DocExample>

      <DocExample
        anchor="pdf"
        title="PDF"
        description="PDF export lazily loads jsPDF and produces a single-page document sized to the artboard (or crop region) — handy for printable proofs."
        sources={PDF_SOURCES}
      />

      <DocExample
        anchor="json"
        title="JSON scene & exact-pixel export"
        description="The json format serializes the full re-editable scene. With an artboard or crop region set, raster/PDF export render at exactly that pixel size — the same machinery the crop tool uses."
        sources={JSON_SOURCES}
      />
    </DocPage>
  );
}
