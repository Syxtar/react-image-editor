import { type ReactElement } from 'react';

export interface AspColorFieldProps {
  /** Preset swatches. `'transparent'` renders a checker swatch. */
  readonly colors: readonly string[];
  /** Currently selected color. */
  readonly value?: string;
  readonly onColorChange: (color: string) => void;
}

/**
 * A color chooser: preset swatches plus a custom-color control (the native OS
 * picker). Used everywhere a color is set — draw, shapes (stroke + fill), text,
 * arrows, frame, background. Emits the chosen color string on selection.
 */
export function AspColorField({ colors, value = '', onColorChange }: AspColorFieldProps): ReactElement {
  /** A valid `#rrggbb` for the native picker (falls back to black for non-hex values). */
  const pickerValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000';

  return (
    <div className="asp-color-field">
      <div className="asp-cf">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            className={[
              'asp-cf__swatch',
              value === color ? 'asp-cf__swatch--active' : '',
              color === '#ffffff' ? 'asp-cf__swatch--white' : '',
              color === 'transparent' ? 'asp-cf__swatch--transparent' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={color === 'transparent' ? undefined : { background: color }}
            aria-label={color === 'transparent' ? 'Transparent' : `Color ${color}`}
            title={color === 'transparent' ? 'Transparent' : color}
            aria-pressed={value === color}
            onClick={() => onColorChange(color)}
          ></button>
        ))}
        <label className="asp-cf__custom" title="Custom color">
          <input
            type="color"
            value={pickerValue}
            onChange={(event) => onColorChange(event.currentTarget.value)}
            aria-label="Custom color"
          />
        </label>
      </div>
    </div>
  );
}
