import { useState, type ReactElement, type ReactNode } from 'react';

/** A single source snippet shown in the example's code panel. */
export interface ExampleSource {
  label: string;
  code: string;
  lang?: 'tsx' | 'ts' | 'html' | 'bash' | 'scss' | 'css';
}

export interface DocExampleProps {
  readonly title: string;
  readonly description?: string;
  readonly sources?: readonly ExampleSource[];
  readonly docsUrl?: string;
  /** Sets the section id for the page's "on this page" links. */
  readonly anchor?: string;
  readonly children?: ReactNode;
}

/**
 * Reusable doc example: a titled section with a live demo (children) and a
 * tabbed, copy-to-clipboard source panel, so the result and its exact source
 * sit together.
 */
export function DocExample({
  title,
  description = '',
  sources = [],
  docsUrl = '',
  anchor = '',
  children,
}: DocExampleProps): ReactElement {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const current = sources[active] ?? { label: '', code: '', lang: undefined };

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(current.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. non-secure context). Ignore silently.
    }
  };

  return (
    <section className="ex" id={anchor || undefined}>
      <header className="ex__head">
        <div className="ex__titlerow">
          <h2 className="ex__title">{title}</h2>
          {docsUrl && (
            <a className="ex__docs" href={docsUrl} target="_blank" rel="noopener noreferrer">
              Docs ↗
            </a>
          )}
        </div>
        {description && <p className="ex__desc">{description}</p>}
      </header>

      <div className="ex__live">{children}</div>

      {sources.length > 0 && (
        <div className="ex__code">
          <div className="ex__tabs" role="tablist">
            {sources.map((s, i) => (
              <button
                key={s.label}
                type="button"
                role="tab"
                className={active === i ? 'ex__tab ex__tab--active' : 'ex__tab'}
                aria-selected={active === i}
                onClick={() => setActive(i)}
              >
                {s.label}
              </button>
            ))}
            <button type="button" className="ex__copy" onClick={() => void copy()}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="ex__pre">
            <code data-lang={current.lang}>{current.code}</code>
          </pre>
        </div>
      )}
    </section>
  );
}
