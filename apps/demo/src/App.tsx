import { lazy, Suspense, useEffect, useState, type ReactElement } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';

import { NAV } from './nav';
import { useSeo, type RouteMeta } from './shared/seo';

const Playground = lazy(() => import('./pages/playground/Playground'));
const GettingStarted = lazy(() => import('./pages/getting-started/GettingStarted'));
const Configuration = lazy(() => import('./pages/configuration/Configuration'));
const EditingTools = lazy(() => import('./pages/editing-tools/EditingTools'));
const Workflow = lazy(() => import('./pages/workflow/Workflow'));
const ExportPage = lazy(() => import('./pages/export/ExportPage'));
const Reference = lazy(() => import('./pages/reference/Reference'));
// Hidden deterministic surface for the Playwright suite (not in the nav).
const E2eHarness = lazy(() => import('./pages/e2e/E2eHarness'));

/** Per-route title + meta description (the React counterpart of the Angular route data). */
const ROUTE_META: Readonly<Record<string, RouteMeta>> = {
  '': {
    title: 'React Image Editor — themeable, Fabric.js v7 (free, open-source)',
    description:
      'Interactive playground for @ascentsparksoftware/react-image-editor: a standalone, ' +
      'themeable React 19 image editor on Fabric.js v7. Crop, filters, draw, text, redact, ' +
      'layers, AI background removal, and PNG/JPEG/WEBP/SVG/PDF export.',
  },
  'getting-started': {
    title: 'Getting started — React Image Editor',
    description:
      'Install @ascentsparksoftware/react-image-editor, use the ImageEditor component, and ' +
      'choose a mode (viewer, basic, advanced, full). Free, React 19, Fabric.js v7.',
  },
  configuration: {
    title: 'Configuration — tools, filters, theming & sizing',
    description:
      'Configure the React Image Editor: choose tools and filters, theme the whole UI from ' +
      'three colors with guaranteed AA contrast, and control the canvas size responsively.',
  },
  'editing-tools': {
    title: 'Editing tools — crop, draw, text, shapes, AI & more',
    description:
      'Every editing tool of the React Image Editor: interactive crop, adjust & filters, draw, ' +
      'text with web fonts, shapes, redact, magic wand, in-browser AI background removal, background & frames.',
  },
  workflow: {
    title: 'Canvas & workflow — layers, guides, artboard, import',
    description:
      'Layers, rulers/guides/snapping, artboard output size, re-editable templates, robust ' +
      'large-image and HEIC import, and keyboard shortcuts in the React Image Editor.',
  },
  export: {
    title: 'Export — PNG, JPEG, WEBP, SVG (fonts), PDF, JSON',
    description:
      'Export from the React Image Editor to PNG, JPEG, WEBP, font-embedded SVG, PDF, or a ' +
      're-editable JSON scene, with quality control and exact-pixel artboard/crop export.',
  },
  reference: {
    title: 'Integration & API reference — React Image Editor',
    description:
      'Modal dialog, headless EditorEngine, events, the full ImageEditor props API, ' +
      'accessibility and security notes for @ascentsparksoftware/react-image-editor.',
  },
};

/**
 * The docs-site shell: a branded header (with a light/dark toggle), a grouped
 * sidebar navigation, and the routed page outlet. The interactive editor and all
 * documentation live in the routed pages.
 */
export function App(): ReactElement {
  useSeo(ROUTE_META);
  const [dark, setDark] = useState(() => localStorage.getItem('aie-docs-theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('aie-docs-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="demo-root">
      <header className="hdr">
        <div className="hdr__brand">
          <NavLink to="/" className="hdr__logo" aria-label="React Image Editor home">
            <img src="/image-editor-logo.png" alt="React Image Editor" />
          </NavLink>
          <span className="hdr__tagline">
            for React 19 · built on{' '}
            <a href="https://fabricjs.com" target="_blank" rel="noopener noreferrer">
              Fabric.js v7
            </a>
          </span>
        </div>

        <div className="hdr__meta">
          <a
            href="https://github.com/ascentspark/react-image-editor"
            target="_blank"
            rel="noopener noreferrer"
            className="hdr__link"
          >
            GitHub
          </a>
          <a
            href="https://ascentspark.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hdr__maintainer"
            aria-label="Ascentspark"
          >
            <img src="/asc-logo-full.svg" alt="Ascentspark" className="hdr__asc" />
          </a>
          <button type="button" className="hdr__dark" onClick={() => setDark((v) => !v)}>
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          {NAV.map((group) => (
            <nav key={group.title} className="navgroup">
              <h3 className="navgroup__title">{group.title}</h3>
              <ul className="navgroup__list">
                {group.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={`/${item.path}`}
                      end={item.path === ''}
                      className={({ isActive }) => (isActive ? 'navlink navlink--active' : 'navlink')}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </aside>

        <main className="main">
          <Suspense fallback={<div className="ed-skel">Loading…</div>}>
            <Routes>
              <Route path="/" element={<Playground />} />
              <Route path="/getting-started" element={<GettingStarted />} />
              <Route path="/configuration" element={<Configuration />} />
              <Route path="/editing-tools" element={<EditingTools />} />
              <Route path="/workflow" element={<Workflow />} />
              <Route path="/export" element={<ExportPage />} />
              <Route path="/reference" element={<Reference />} />
              <Route path="/e2e" element={<E2eHarness />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      <footer className="footer">
        <a
          href="https://ascentspark.com"
          target="_blank"
          rel="noopener noreferrer"
          className="footer__brand"
        >
          <span className="footer__label">Open Source project by</span>
          <img src="/asc-logo-full.svg" alt="Ascentspark" className="footer__logo" />
        </a>
      </footer>
    </div>
  );
}
