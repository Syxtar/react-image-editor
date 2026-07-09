import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AspIcon } from './AspIcon';

describe('AspIcon', () => {
  it('renders an svg with the icon paths for a known name', () => {
    const { container } = render(<AspIcon name="crop" size={22} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('width')).toBe('22');
    expect(svg?.innerHTML).toContain('path');
  });

  it('accepts a lucide: prefixed name', () => {
    const { container } = render(<AspIcon name="lucide:rotate-cw" />);
    const svg = container.querySelector('svg');
    expect(svg?.innerHTML.length).toBeGreaterThan(0);
  });

  it('renders an empty svg for an unknown name without throwing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { container } = render(<AspIcon name="definitely-not-an-icon" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.innerHTML.trim()).toBe('');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
