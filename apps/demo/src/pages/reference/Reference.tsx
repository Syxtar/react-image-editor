import { useState, type ReactElement } from 'react';
import { openImageEditorDialog } from '@ascentsparksoftware/react-image-editor';

import { DocExample, type ExampleSource } from '../../shared/DocExample';
import { DocPage, type PageSection } from '../../shared/DocPage';
import './Reference.scss';

const SECTIONS: PageSection[] = [
  { id: 'dialog', label: 'Modal dialog' },
  { id: 'engine', label: 'Headless engine' },
  { id: 'events', label: 'Events' },
  { id: 'api', label: 'API reference' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'security', label: 'Security' },
];

const DIALOG_SOURCES: ExampleSource[] = [
  {
    label: 'TS',
    lang: 'ts',
    code: `import { openImageEditorDialog } from '@ascentsparksoftware/react-image-editor';

async function edit(src: string): Promise<void> {
  const blob = await openImageEditorDialog({
    src,
    heading: 'Update profile photo',
    aspectPresets: ['1:1', '4:3', 'free'],
  });
  if (blob) { /* user saved — upload blob */ }
}`,
  },
];

const ENGINE_SOURCES: ExampleSource[] = [
  {
    label: 'TS',
    lang: 'ts',
    code: `import { EditorEngine, deriveTheme } from '@ascentsparksoftware/react-image-editor';

// derive the full --asp-* token map from three inputs
const tokens = deriveTheme('#f4f6f9', '#1f6feb', 'light');`,
  },
];

interface EventRow {
  callback: string;
  payload: string;
  fires: string;
}

const EVENTS: readonly EventRow[] = [
  { callback: 'onSaved', payload: 'Blob', fires: 'Export / Save' },
  { callback: 'onCanceled', payload: 'void', fires: 'Basic-mode Cancel' },
  { callback: 'onImageLoaded', payload: 'void', fires: 'An image finished loading' },
  { callback: 'onExported', payload: 'Blob', fires: 'Export download produced a Blob' },
  { callback: 'onError', payload: 'AspEditorError', fires: 'Recoverable load/export/init error' },
];

interface PropRow {
  prop: string;
  type: string;
  def: string;
}

const PROPS: readonly PropRow[] = [
  { prop: 'src', type: 'string | Blob | null', def: 'null' },
  { prop: 'mode', type: 'AspMode', def: "'advanced'" },
  { prop: 'width / height', type: 'AspSize | null', def: 'null' },
  { prop: 'tools', type: 'AspTool[] | null', def: 'null' },
  { prop: 'disabledTools', type: 'AspTool[]', def: '[]' },
  { prop: 'filters', type: "AspFilter[] | 'all' | null", def: 'null' },
  { prop: 'aspectPresets', type: 'AspAspectPreset[]', def: "['free','1:1','4:3','16:9']" },
  { prop: 'aspectRatios', type: 'AspAspectOption[]', def: '[]' },
  { prop: 'exportFormats', type: 'AspExportFormat[]', def: "['png','jpeg','webp']" },
  { prop: 'exportQuality', type: 'number', def: '90' },
  { prop: 'exportTarget', type: 'AspExportTarget | null', def: 'null' },
  { prop: 'heading', type: 'string', def: "'Edit image'" },
  { prop: 'showHistory', type: 'boolean', def: 'true' },
  { prop: 'keyboardEnabled', type: 'boolean', def: 'true' },
  { prop: 'fonts', type: 'FontOption[]', def: 'DEFAULT_FONTS' },
  { prop: 'baseColor', type: 'string', def: "'#f4f6f9'" },
  { prop: 'accentColor', type: 'string', def: "'#1f6feb'" },
  { prop: 'themeMode', type: "'light' | 'dark'", def: "'light'" },
];

export default function Reference(): ReactElement {
  const [result, setResult] = useState('');

  const edit = async (): Promise<void> => {
    const blob = await openImageEditorDialog({
      heading: 'Update profile photo',
      aspectPresets: ['1:1', '4:3', 'free'],
    });
    setResult(blob ? `saved ${blob.type} — ${blob.size} bytes` : 'canceled');
  };

  return (
    <DocPage
      heading="Integration & API"
      lead="Use the editor as a modal, drive it headlessly, listen to its events, and reference the full props/callback surface."
      sections={SECTIONS}
    >
      <DocExample
        anchor="dialog"
        title="Modal dialog"
        description="For avatar / quick-edit flows, call openImageEditorDialog and await a Blob (or null on cancel). Opens the basic editor as a modal."
        sources={DIALOG_SOURCES}
      >
        <button type="button" className="brandbtn" onClick={() => void edit()}>
          Edit a photo…
        </button>
        {result && <p className="note">{result}</p>}
      </DocExample>

      <DocExample
        anchor="engine"
        title="Headless engine"
        description="The Fabric-backed EditorEngine and the pure helpers are exported for headless or advanced use — scene save/load, layers, guides, artboard, and the AI/magic operations directly."
        sources={ENGINE_SOURCES}
      >
        <p className="prose">
          Also exported: <code>resolveTools</code>, <code>resolveFilters</code>,{' '}
          <code>deriveTheme</code>, <code>applyTheme</code>, <code>EditHistory</code> and{' '}
          <code>DeltaHistory</code>.
        </p>
      </DocExample>

      <DocExample anchor="events" title="Events" description="Callbacks you can pass to the component.">
        <table className="api-table">
          <thead>
            <tr>
              <th>Callback</th>
              <th>Payload</th>
              <th>Fires</th>
            </tr>
          </thead>
          <tbody>
            {EVENTS.map((e) => (
              <tr key={e.callback}>
                <td>
                  <code>{e.callback}</code>
                </td>
                <td>
                  <code>{e.payload}</code>
                </td>
                <td>{e.fires}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DocExample>

      <DocExample anchor="api" title="API reference" description="The ImageEditor component props.">
        <table className="api-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            {PROPS.map((p) => (
              <tr key={p.prop}>
                <td>
                  <code>{p.prop}</code>
                </td>
                <td>
                  <code>{p.type}</code>
                </td>
                <td>
                  <code>{p.def}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DocExample>

      <DocExample
        anchor="accessibility"
        title="Accessibility"
        description="WCAG AA color contrast (derivation-guaranteed), keyboard-operable controls, :focus-visible rings, prefers-reduced-motion honored, and Trusted-Types-safe icon rendering."
      />

      <DocExample
        anchor="security"
        title="Security"
        description="The editor renders consumer-supplied images and SVGs onto a canvas; SVGs are rasterized through a sandboxed <img>, so scripts inside an SVG do not execute. Validate uploads at your boundary; the optional AI model is fetched at runtime but no image data leaves the browser."
      >
        <p className="prose">
          Full policy and private reporting:{' '}
          <a
            href="https://github.com/ascentspark/react-image-editor/blob/main/SECURITY.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            SECURITY.md
          </a>
          .
        </p>
      </DocExample>
    </DocPage>
  );
}
