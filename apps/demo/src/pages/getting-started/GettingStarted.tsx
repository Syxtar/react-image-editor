import { useState, type ReactElement } from 'react';
import { ImageEditor, type AspMode } from '@ascentsparksoftware/react-image-editor';

import { DocExample, type ExampleSource } from '../../shared/DocExample';
import { DocPage, type PageSection } from '../../shared/DocPage';
import { useFaqLd } from '../../shared/seo';
import { type FaqItem } from '../../shared/structured-data';
import './GettingStarted.scss';

const MODES: readonly AspMode[] = ['viewer', 'basic', 'advanced', 'full'];

const SECTIONS: PageSection[] = [
  { id: 'install', label: 'Installation' },
  { id: 'quick-start', label: 'Quick start' },
  { id: 'modes', label: 'Modes' },
];

const INSTALL_SOURCES: ExampleSource[] = [
  {
    label: 'npm',
    lang: 'bash',
    code: `npm i @ascentsparksoftware/react-image-editor fabric

# optional — AI background tools
npm i @imgly/background-removal onnxruntime-web
# optional — HEIC / HEIF import
npm i heic2any`,
  },
  {
    label: 'main.tsx',
    lang: 'tsx',
    code: `// Once, at your app entry — the editor's bundled stylesheet.
import '@ascentsparksoftware/react-image-editor/styles.css';`,
  },
];

const QUICK_START_SOURCES: ExampleSource[] = [
  {
    label: 'TSX',
    lang: 'tsx',
    code: `import { ImageEditor } from '@ascentsparksoftware/react-image-editor';
import '@ascentsparksoftware/react-image-editor/styles.css';

export function PhotoPage() {
  const onSaved = (blob: Blob): void => {
    // upload or preview the edited image
  };

  return <ImageEditor mode="advanced" height="520px" onSaved={onSaved} />;
}`,
  },
  {
    label: 'Host CSS',
    lang: 'scss',
    code: `/* Or size a wrapper element instead of the height prop */
.photo-editor { height: 640px; }`,
  },
];

const MODE_SOURCES: ExampleSource[] = [
  {
    label: 'TSX',
    lang: 'tsx',
    code: `<ImageEditor mode="viewer" src={url} />
<ImageEditor mode="basic" src={url} />
<ImageEditor mode="advanced" src={url} />
<ImageEditor mode="full" src={url} />`,
  },
];

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    q: 'Is the React Image Editor free?',
    a: 'Yes. It is free and open-source under the MIT license, built on Fabric.js v7 (also MIT). No license keys, no telemetry, no per-seat pricing.',
  },
  {
    q: 'Does it need a backend?',
    a: 'No. The editor runs entirely in the browser. It emits the edited image as a Blob via the onSaved callback; you decide whether to upload it, preview it, or store it.',
  },
  {
    q: 'Which React version does it support?',
    a: 'React 19. The component is a single self-contained function component, StrictMode-safe, with react and react-dom ^19 as peer dependencies.',
  },
  {
    q: 'Does it support HEIC images?',
    a: 'Yes, with the optional heic2any dependency installed and passed via the heicDecoderLoader prop. HEIC/HEIF files are decoded (and EXIF-oriented) on import; large JPEGs are downscaled automatically.',
  },
  {
    q: 'Can it export PDF and SVG?',
    a: 'Yes. Export formats include PNG, JPEG, WEBP, SVG (with the used web fonts embedded), PDF (via a lazily-loaded jsPDF), and a re-editable JSON scene.',
  },
];

export default function GettingStarted(): ReactElement {
  useFaqLd(FAQ_ITEMS);
  const [mode, setMode] = useState<AspMode>('advanced');
  const [result, setResult] = useState('');

  const onSaved = (blob: Blob): void => {
    setResult(`saved ${blob.type} — ${blob.size} bytes`);
  };

  return (
    <DocPage
      heading="Getting started"
      lead="Install the package, drop the component into your JSX, and pick a mode. The editor is a single self-contained React 19 function component — StrictMode-safe, no providers, no context setup."
      sections={SECTIONS}
    >
      <DocExample
        anchor="install"
        title="Installation"
        description="The library ships ESM only. Fabric.js is a runtime dependency you install alongside it; React is a peer dependency. Import the bundled stylesheet once at your app entry."
        sources={INSTALL_SOURCES}
      >
        <p className="prose">
          Optional add-ons, only if you use the matching feature:{' '}
          <code>@imgly/background-removal</code> + <code>onnxruntime-web</code> for the AI
          background tools, and <code>heic2any</code> for HEIC/HEIF import. Without them those
          features simply don&rsquo;t appear.
        </p>
      </DocExample>

      <DocExample
        anchor="quick-start"
        title="Quick start"
        description="Import ImageEditor, give it a size, and listen for the saved Blob. That's the whole integration."
        sources={QUICK_START_SOURCES}
      >
        <ImageEditor mode="advanced" height="520px" onSaved={onSaved} />
        {result && <p className="note">{result}</p>}
      </DocExample>

      <DocExample
        anchor="modes"
        title="Modes"
        description="One prop switches the whole experience: viewer (read-only), basic (compact card / modal), advanced (full workspace, curated tools) and full (every tool + filter)."
        sources={MODE_SOURCES}
      >
        <div className="seg">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              className={mode === m ? 'seg--on' : undefined}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
        <ImageEditor mode={mode} height="520px" />
      </DocExample>
    </DocPage>
  );
}
