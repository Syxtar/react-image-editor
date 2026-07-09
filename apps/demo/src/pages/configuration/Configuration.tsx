import { useState, type ChangeEvent, type ReactElement } from 'react';
import { ImageEditor, type AspThemeMode } from '@ascentsparksoftware/react-image-editor';

import { DocExample, type ExampleSource } from '../../shared/DocExample';
import { DocPage, type PageSection } from '../../shared/DocPage';
import './Configuration.scss';

const SECTIONS: PageSection[] = [
  { id: 'tools', label: 'Tools & filters' },
  { id: 'theming', label: 'Theming' },
  { id: 'sizing', label: 'Canvas size' },
];

const TOOL_SOURCES: ExampleSource[] = [
  {
    label: 'TSX',
    lang: 'tsx',
    code: `{/* 1. mode default, minus filters and sticker */}
<ImageEditor mode="advanced" disabledTools={['filters', 'sticker']} />

{/* 2. a bespoke rail (order preserved) */}
<ImageEditor tools={['crop', 'rotate', 'text', 'shapes']} />

{/* filters: explicit list, 'all', or null for the mode default */}
<ImageEditor mode="advanced" filters={['brightness', 'contrast', 'grayscale']} />
<ImageEditor mode="advanced" filters="all" />`,
  },
];

const THEME_SOURCES: ExampleSource[] = [
  {
    label: 'TSX',
    lang: 'tsx',
    code: `<ImageEditor
  baseColor="#f4f6f9"
  accentColor="#1f6feb"
  themeMode="light"
/>`,
  },
  {
    label: 'Override',
    lang: 'scss',
    code: `.asp-image-editor {
  --asp-radius-md: 12px;
  --asp-accent: #ff5a5f;
}`,
  },
];

const SIZE_SOURCES: ExampleSource[] = [
  {
    label: 'TSX',
    lang: 'tsx',
    code: `{/* px | % | vh | calc() — a per-mode minimum is always enforced */}
<ImageEditor width="100%" height="70vh" />
<ImageEditor height="calc(100vh - 120px)" />`,
  },
];

export default function Configuration(): ReactElement {
  const [base, setBase] = useState('#f4f6f9');
  const [accent, setAccent] = useState('#1f6feb');
  const [mode, setMode] = useState<AspThemeMode>('light');

  const onBase = (e: ChangeEvent<HTMLInputElement>): void => setBase(e.target.value);
  const onAccent = (e: ChangeEvent<HTMLInputElement>): void => setAccent(e.target.value);
  const toggleMode = (): void => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  return (
    <DocPage
      heading="Configuration"
      lead="Shape the editor with props: choose which tools and filters appear, theme the whole UI from three colors, and control the canvas size — all without forking the component."
      sections={SECTIONS}
    >
      <DocExample
        anchor="tools"
        title="Tools & filters"
        description="Resolution order, easiest to most precise: mode sets the default set, tools (if given) replaces it as an explicit allowlist in your order, then disabledTools is subtracted."
        sources={TOOL_SOURCES}
      >
        <ImageEditor mode="advanced" tools={['crop', 'rotate', 'text', 'shapes']} height="480px" />
        <p className="prose">
          Filters follow the same idea via <code>filters</code>: an explicit{' '}
          <code>AspFilter[]</code>, the literal <code>'all'</code> (every Fabric filter), or{' '}
          <code>null</code> for the mode default.
        </p>
      </DocExample>

      <DocExample
        anchor="theming"
        title="Theming"
        description="Three props derive the entire UI palette at runtime, with guaranteed WCAG AA text contrast. Set them to match your brand in light or dark — no extra config."
        sources={THEME_SOURCES}
      >
        <div className="ctl">
          <label>
            Base <input type="color" value={base} onChange={onBase} />
          </label>
          <label>
            Accent <input type="color" value={accent} onChange={onAccent} />
          </label>
          <button type="button" onClick={toggleMode}>
            {mode}
          </button>
        </div>
        <ImageEditor
          mode="advanced"
          baseColor={base}
          accentColor={accent}
          themeMode={mode}
          height="480px"
        />
        <p className="prose">
          The derived values are scoped CSS custom properties on the editor root. Override any
          single token in your own CSS — e.g. set <code>--asp-radius-md</code> or{' '}
          <code>--asp-accent</code> on the <code>.asp-image-editor</code> selector. See the override
          tab for the exact syntax.
        </p>
      </DocExample>

      <DocExample
        anchor="sizing"
        title="Canvas size & responsive"
        description="width and height accept px, %, vh or any CSS length / calc(). A per-mode minimum is always enforced so the toolbars never collapse, and the editor adapts to its own width via container queries."
        sources={SIZE_SOURCES}
      >
        <ImageEditor mode="advanced" width="100%" height="70vh" />
      </DocExample>
    </DocPage>
  );
}
