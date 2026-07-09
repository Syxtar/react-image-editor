import { type ReactElement } from 'react';
import { ImageEditor } from '@ascentsparksoftware/react-image-editor';

import { DocExample, type ExampleSource } from '../../shared/DocExample';
import { DocPage, type PageSection } from '../../shared/DocPage';

const SECTIONS: PageSection[] = [
  { id: 'layers', label: 'Layers' },
  { id: 'guides', label: 'Guides & snapping' },
  { id: 'artboard', label: 'Artboard' },
  { id: 'templates', label: 'Templates' },
  { id: 'import', label: 'Import' },
  { id: 'keyboard', label: 'Keyboard' },
];

const FULL_SOURCE: ExampleSource[] = [
  { label: 'TSX', lang: 'tsx', code: `<ImageEditor mode="full" height="520px" />` },
];

const TEMPLATE_SOURCE: ExampleSource[] = [
  {
    label: 'TS',
    lang: 'ts',
    code: `// Headless save / load of a re-editable scene
const json = engine.exportScene();
// ...later
await engine.loadScene(json);`,
  },
];

interface ShortcutRow {
  keys: ReactElement;
  action: string;
}

const SHORTCUTS: readonly ShortcutRow[] = [
  { keys: <code>Ctrl/Cmd + Z</code>, action: 'Undo' },
  {
    keys: (
      <>
        <code>Ctrl/Cmd + Shift + Z</code> / <code>Ctrl + Y</code>
      </>
    ),
    action: 'Redo',
  },
  { keys: <code>Delete / Backspace</code>, action: 'Remove selection' },
  { keys: <code>Ctrl/Cmd + C / V / D</code>, action: 'Copy / paste / duplicate' },
  { keys: <code>Ctrl/Cmd + A</code>, action: 'Select all' },
  { keys: <code>Esc</code>, action: 'Deselect (or cancel the basic modal)' },
  {
    keys: (
      <>
        <code>Space</code> (hold)
      </>
    ),
    action: 'Pan',
  },
];

export default function Workflow(): ReactElement {
  return (
    <DocPage
      heading="Canvas & workflow"
      lead="Everything around the pixels: a layer stack, measurement guides, a fixed output artboard, re-editable templates, robust import, and keyboard shortcuts."
      sections={SECTIONS}
    >
      <DocExample
        anchor="layers"
        title="Layers"
        description="A persistent layers panel: drag to reorder z-order, lock, show/hide, set opacity, rename inline, and group/ungroup, align, duplicate or delete the selection. Available regardless of the active tool."
        sources={FULL_SOURCE}
      >
        <ImageEditor mode="full" height="520px" />
      </DocExample>

      <DocExample
        anchor="guides"
        title="Rulers, guides & snapping"
        description="Toggle rulers, drag guides off them, and the magnet enables edge/center snapping with alignment guides while you move objects. Guides are draggable, snap targets, and part of undo/redo."
        sources={FULL_SOURCE}
      >
        <ImageEditor mode="full" height="520px" />
      </DocExample>

      <DocExample
        anchor="artboard"
        title="Artboard & output size"
        description="Pick an output-size preset or a custom W×H. Content outside the artboard is dimmed and excluded from export, which renders at exactly the artboard's pixel dimensions."
        sources={FULL_SOURCE}
      >
        <ImageEditor mode="full" height="520px" />
      </DocExample>

      <DocExample
        anchor="templates"
        title="Templates (save / load)"
        description="The Image menu's Save / Load round-trips the whole scene as JSON via the engine's exportScene / loadScene, so a layout is re-editable later."
        sources={TEMPLATE_SOURCE}
      >
        <p className="prose">
          For headless control, call the engine directly — see{' '}
          <a href="/reference#engine">Headless engine</a>.
        </p>
      </DocExample>

      <DocExample
        anchor="import"
        title="Import — large images & HEIC"
        description="Imports are decoded with createImageBitmap: EXIF orientation is applied, very large JPEGs are downscaled, and HEIC/HEIF is converted via the optional heic2any decoder."
      >
        <p className="prose">
          An undecodable or oversized file surfaces a transient error toast and an{' '}
          <code>onError</code> callback instead of silently doing nothing.
        </p>
        <p className="note">
          HEIC/HEIF import needs the optional <code>heic2any</code> dependency (passed via{' '}
          <code>heicDecoderLoader</code>). Without it, those files report a clear error; every other
          format works unaffected.
        </p>
      </DocExample>

      <DocExample
        anchor="keyboard"
        title="Keyboard shortcuts"
        description="Active while the pointer is over the editor and you are not typing in a field. Disable with keyboardEnabled={false}."
      >
        <table className="api-table">
          <thead>
            <tr>
              <th>Keys</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {SHORTCUTS.map((s) => (
              <tr key={s.action}>
                <td>{s.keys}</td>
                <td>{s.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DocExample>
    </DocPage>
  );
}
