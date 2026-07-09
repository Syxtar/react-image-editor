import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { faqPageLd, SITE_ORIGIN, softwareApplicationLd, webPageLd, type FaqItem } from './structured-data';

const DEFAULT_DESCRIPTION =
  'A standalone, themeable React 19 image editor built on Fabric.js v7: crop, filters, draw, ' +
  'text, redact, layers, AI background removal, and PNG/JPEG/WEBP/SVG/PDF export. Free and open-source.';

/** Per-route SEO metadata, keyed by path (no leading slash). */
export interface RouteMeta {
  readonly title: string;
  readonly description: string;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonical(url: string): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function setJsonLd(id: string, data: unknown): void {
  let script = document.head.querySelector<HTMLScriptElement>(`script[data-ld="${id}"]`);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-ld', id);
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function clearJsonLd(id: string): void {
  document.head.querySelector(`script[data-ld="${id}"]`)?.remove();
}

/**
 * Keeps the document title, description, canonical link, Open Graph / Twitter
 * tags and JSON-LD structured data in sync with the active route — the React
 * counterpart of the Angular demo's SeoService.
 */
export function useSeo(routeMeta: Readonly<Record<string, RouteMeta>>): void {
  const { pathname } = useLocation();

  // Sitewide SoftwareApplication structured data (set once).
  useEffect(() => {
    setJsonLd('app', softwareApplicationLd());
  }, []);

  useEffect(() => {
    const key = pathname.replace(/^\//, '').split(/[?#]/)[0];
    const meta = routeMeta[key];
    const description = meta?.description ?? DEFAULT_DESCRIPTION;
    const pageTitle =
      meta?.title ?? 'React Image Editor — themeable, Fabric.js v7 (free, open-source)';
    const url = SITE_ORIGIN + (pathname === '/' ? '' : pathname);

    // A page that sets FAQ data does so after navigation; clear the previous page's.
    clearJsonLd('faq');

    document.title = pageTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', pageTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('name', 'twitter:title', pageTitle);
    upsertMeta('name', 'twitter:description', description);
    setCanonical(url);
    setJsonLd('page', webPageLd(pageTitle, description, pathname));
  }, [pathname, routeMeta]);
}

/** Set FAQ structured data for the current page (call from the page component). */
export function useFaqLd(items: readonly FaqItem[]): void {
  useEffect(() => {
    setJsonLd('faq', faqPageLd([...items]));
    return () => clearJsonLd('faq');
  }, [items]);
}
