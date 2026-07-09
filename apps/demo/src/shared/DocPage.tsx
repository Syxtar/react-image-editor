import { type ReactElement, type ReactNode } from 'react';

/** One entry in a page's "on this page" anchor list. */
export interface PageSection {
  id: string;
  label: string;
}

export interface DocPageProps {
  readonly heading: string;
  readonly lead?: string;
  readonly sections?: readonly PageSection[];
  readonly children?: ReactNode;
}

/**
 * Shared chrome for a documentation page: the single `<h1>`, a lead paragraph, an
 * "on this page" anchor list, and the page's doc-example blocks. Keeps every
 * section page visually consistent.
 */
export function DocPage({ heading, lead = '', sections = [], children }: DocPageProps): ReactElement {
  return (
    <div className="dp">
      <header className="dp__head">
        <h1 className="dp__title">{heading}</h1>
        <p className="dp__lead">{lead}</p>
      </header>

      {sections.length > 0 && (
        <nav className="dp__toc" aria-label="On this page">
          <span className="dp__toc-label">On this page</span>
          <ul>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="dp__body">{children}</div>
    </div>
  );
}
