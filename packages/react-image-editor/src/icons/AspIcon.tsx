import { type ReactElement } from 'react';

import { LUCIDE_ICONS } from './lucide-icons';

export interface AspIconProps {
  /** Lucide icon name, with or without a `lucide:` prefix. */
  readonly name: string;
  /** Rendered width/height in px. */
  readonly size?: number;
}

/**
 * Renders one of the baked-in Lucide icons as an inline SVG.
 *
 * The icon name may be given bare (`'crop'`) or prefixed (`'lucide:crop'`, as the
 * tool registry stores it). The inner markup comes only from {@link LUCIDE_ICONS}
 * — a closed set of trusted constants, never user input — so rendering it via
 * `dangerouslySetInnerHTML` is safe. Unknown names render nothing (and warn in
 * dev) rather than throwing.
 */
export function AspIcon({ name, size = 20 }: AspIconProps): ReactElement {
  const key = name.replace(/^lucide:/, '');
  const markup = LUCIDE_ICONS[key];
  if (markup === undefined) {
    console.warn(`[asp-image-editor] unknown icon: "${key}"`);
  }
  return (
    <span className="asp-icon">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        dangerouslySetInnerHTML={{ __html: markup ?? '' }}
      />
    </span>
  );
}
