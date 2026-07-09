import {
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from 'react';

import { type LayerInfo } from '../engine/editor-engine';
import { AspIcon } from '../icons/AspIcon';

export type AlignMode = 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom';

export interface LayerOpacityChange {
  readonly id: string;
  readonly value: number;
}

/** A layer click, carrying whether a modifier (shift/cmd/ctrl) was held. */
export interface LayerSelectEvent {
  readonly id: string;
  readonly additive: boolean;
}

/** A layer rename request. */
export interface LayerRenameEvent {
  readonly id: string;
  readonly name: string;
}

export interface AspLayerListProps {
  readonly layers: readonly LayerInfo[];
  readonly onSelectLayer: (event: LayerSelectEvent) => void;
  readonly onToggleLock: (id: string) => void;
  readonly onToggleVisible: (id: string) => void;
  readonly onMoveUp: (id: string) => void;
  readonly onMoveDown: (id: string) => void;
  readonly onRemoveLayer?: (id: string) => void;
  readonly onGroupSelection: () => void;
  readonly onUngroupSelection: () => void;
  readonly onDuplicateSelection: () => void;
  readonly onDeleteSelection: () => void;
  readonly onAlignSelection: (mode: AlignMode) => void;
  readonly onOpacityInput: (change: LayerOpacityChange) => void;
  readonly onOpacityCommit: (change: LayerOpacityChange) => void;
  /** New front-to-back order of layer ids after a drag-and-drop reorder. */
  readonly onReorderLayers: (orderedIds: readonly string[]) => void;
  readonly onRenameLayer: (event: LayerRenameEvent) => void;
}

/**
 * The persistent Layers panel: the object z-stack plus the object-ops that act on
 * the current selection (group/ungroup/align/duplicate/delete + opacity). Lives
 * in the right column below the tool Options, available regardless of the active
 * tool — locking a layer makes clicks pass through, fixing overlap mis-selection.
 *
 * Rows support shift/cmd/ctrl-click multi-select, drag-and-drop reordering, and
 * double-click to rename. Presentational; the container owns the engine.
 */
export function AspLayerList({
  layers,
  onSelectLayer,
  onToggleLock,
  onToggleVisible,
  onMoveUp,
  onMoveDown,
  onGroupSelection,
  onUngroupSelection,
  onDuplicateSelection,
  onDeleteSelection,
  onAlignSelection,
  onOpacityInput,
  onOpacityCommit,
  onReorderLayers,
  onRenameLayer,
}: AspLayerListProps): ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [alignOpen, setAlignOpen] = useState(false);

  // drag-and-drop reorder state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  /** Whether the drop indicator sits above (vs below) the hovered row. */
  const [dropAbove, setDropAbove] = useState(true);

  // inline rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const selected = layers.find((l) => l.selected);
  const hasSelection = selected !== undefined;
  const opacityPct = Math.round((selected?.opacity ?? 1) * 100);

  const emitAlign = (mode: AlignMode): void => {
    onAlignSelection(mode);
    setAlignOpen(false);
  };

  const onSelect = (id: string, event: MouseEvent<HTMLButtonElement>): void => {
    const additive = event.shiftKey || event.metaKey || event.ctrlKey;
    onSelectLayer({ id, additive });
  };

  const handleOpacityInput = (event: FormEvent<HTMLInputElement>): void => {
    if (selected) {
      onOpacityInput({ id: selected.id, value: Number(event.currentTarget.value) / 100 });
    }
  };

  const commitOpacity = (value: string): void => {
    if (selected) {
      onOpacityCommit({ id: selected.id, value: Number(value) / 100 });
    }
  };

  // ---- drag-and-drop reordering -------------------------------------------

  const clearDragState = (): void => {
    setDraggingId(null);
    setDropTargetId(null);
  };

  const onDragStart = (id: string, event: DragEvent<HTMLDivElement>): void => {
    // Don't start a row drag from the action buttons (lock/show/move/etc).
    if ((event.target as HTMLElement).closest('.asp-layers__actions')) {
      event.preventDefault();
      return;
    }
    setDraggingId(id);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      // Firefox requires data to be set for a drag to begin.
      event.dataTransfer.setData('text/plain', id);
    }
  };

  const onDragOver = (id: string, event: DragEvent<HTMLDivElement>): void => {
    if (draggingId === null || draggingId === id) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    const rect = event.currentTarget.getBoundingClientRect();
    setDropAbove(event.clientY - rect.top < rect.height / 2);
    setDropTargetId(id);
  };

  const onDrop = (id: string, event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (draggingId === null || draggingId === id) {
      clearDragState();
      return;
    }
    const order = layers.map((l) => l.id).filter((layerId) => layerId !== draggingId);
    const targetIndex = order.indexOf(id);
    const insertAt = dropAbove ? targetIndex : targetIndex + 1;
    order.splice(insertAt, 0, draggingId);
    onReorderLayers(order);
    clearDragState();
  };

  // ---- inline rename -------------------------------------------------------

  const startRename = (layer: LayerInfo): void => {
    setEditingId(layer.id);
    setEditValue(layer.label);
    // Focus + select the input once it has rendered.
    queueMicrotask(() => {
      const input = hostRef.current?.querySelector<HTMLInputElement>('.asp-layers__rename-input');
      input?.focus();
      input?.select();
    });
  };

  const commitRename = (layer: LayerInfo): void => {
    if (editingId !== layer.id) {
      return;
    }
    const name = editValue.trim();
    setEditingId(null);
    if (name !== '' && name !== layer.label) {
      onRenameLayer({ id: layer.id, name });
    }
  };

  const onRenameKeydown = (layer: LayerInfo, event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      commitRename(layer);
    } else if (event.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <div className="asp-layer-list" ref={hostRef}>
      <button
        type="button"
        className="asp-layers__head"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((v) => !v)}
      >
        <span className="asp-layers__title">Layers</span>
        <AspIcon name={collapsed ? 'chevron-up' : 'chevron-down'} size={15} />
      </button>

      {!collapsed && (
        <>
          {/* object-ops act on the current selection */}
          <div className="asp-layers__ops">
            <div className="asp-layers__opsrow">
              <button
                type="button"
                className="asp-layers__op"
                title="Group"
                aria-label="Group selection"
                disabled={!hasSelection}
                onClick={() => onGroupSelection()}
              >
                <AspIcon name="group" size={15} />
              </button>
              <button
                type="button"
                className="asp-layers__op"
                title="Ungroup"
                aria-label="Ungroup"
                disabled={!hasSelection}
                onClick={() => onUngroupSelection()}
              >
                <AspIcon name="layers" size={15} />
              </button>
              <div className="asp-layers__align">
                <button
                  type="button"
                  className="asp-layers__op"
                  title="Align"
                  aria-label="Align"
                  aria-expanded={alignOpen}
                  disabled={!hasSelection}
                  onClick={() => setAlignOpen((v) => !v)}
                >
                  <AspIcon name="align-horizontal-distribute-center" size={15} />
                </button>
                {alignOpen && (
                  <>
                    <button
                      type="button"
                      className="asp-layers__scrim"
                      aria-label="Close"
                      onClick={() => setAlignOpen(false)}
                    ></button>
                    <div className="asp-layers__alignmenu" role="menu">
                      <button type="button" role="menuitem" onClick={() => emitAlign('left')}>
                        Left
                      </button>
                      <button type="button" role="menuitem" onClick={() => emitAlign('center-h')}>
                        Center
                      </button>
                      <button type="button" role="menuitem" onClick={() => emitAlign('right')}>
                        Right
                      </button>
                      <button type="button" role="menuitem" onClick={() => emitAlign('top')}>
                        Top
                      </button>
                      <button type="button" role="menuitem" onClick={() => emitAlign('center-v')}>
                        Middle
                      </button>
                      <button type="button" role="menuitem" onClick={() => emitAlign('bottom')}>
                        Bottom
                      </button>
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                className="asp-layers__op"
                title="Duplicate"
                aria-label="Duplicate"
                disabled={!hasSelection}
                onClick={() => onDuplicateSelection()}
              >
                <AspIcon name="copy" size={15} />
              </button>
              <button
                type="button"
                className="asp-layers__op asp-layers__op--danger"
                title="Delete"
                aria-label="Delete"
                disabled={!hasSelection}
                onClick={() => onDeleteSelection()}
              >
                <AspIcon name="trash-2" size={15} />
              </button>
            </div>

            <div className="asp-layers__opacity">
              <span className="asp-layers__opacity-label">Opacity</span>
              <input
                type="range"
                className="asp-range"
                min={0}
                max={100}
                value={opacityPct}
                disabled={!hasSelection}
                onChange={handleOpacityInput}
                onPointerUp={(event) => commitOpacity(event.currentTarget.value)}
                onBlur={(event) => commitOpacity(event.currentTarget.value)}
                aria-label="Layer opacity"
              />
              <span className="asp-layers__opacity-value">{opacityPct}</span>
            </div>
          </div>

          <div className="asp-layers__scroll">
            {layers.map((layer) => (
              <div
                key={layer.id}
                className={[
                  'asp-layers__row',
                  layer.selected ? 'asp-layers__row--selected' : '',
                  draggingId === layer.id ? 'asp-layers__row--dragging' : '',
                  dropTargetId === layer.id && dropAbove ? 'asp-layers__row--drop-above' : '',
                  dropTargetId === layer.id && !dropAbove ? 'asp-layers__row--drop-below' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                draggable={editingId !== layer.id}
                onDragStart={(event) => onDragStart(layer.id, event)}
                onDragOver={(event) => onDragOver(layer.id, event)}
                onDrop={(event) => onDrop(layer.id, event)}
                onDragEnd={clearDragState}
              >
                <span className="asp-layers__grip" aria-hidden="true" title="Drag to reorder">
                  <AspIcon name="grip-vertical" size={14} />
                </span>
                {editingId === layer.id ? (
                  <input
                    className="asp-layers__rename-input"
                    type="text"
                    value={editValue}
                    onChange={(event) => setEditValue(event.currentTarget.value)}
                    onKeyDown={(event) => onRenameKeydown(layer, event)}
                    onBlur={() => commitRename(layer)}
                    aria-label="Layer name"
                  />
                ) : (
                  <button
                    type="button"
                    className="asp-layers__name"
                    disabled={layer.locked}
                    onClick={(event) => onSelect(layer.id, event)}
                    onDoubleClick={() => startRename(layer)}
                    aria-pressed={layer.selected}
                    title="Click to select · double-click to rename"
                  >
                    {layer.label}
                  </button>
                )}
                <div className="asp-layers__actions">
                  <button
                    type="button"
                    className="asp-layers__btn"
                    title={layer.visible ? 'Hide' : 'Show'}
                    aria-label={layer.visible ? 'Hide layer' : 'Show layer'}
                    onClick={() => onToggleVisible(layer.id)}
                  >
                    <AspIcon name={layer.visible ? 'eye' : 'eye-off'} size={15} />
                  </button>
                  <button
                    type="button"
                    className={
                      layer.locked ? 'asp-layers__btn asp-layers__btn--on' : 'asp-layers__btn'
                    }
                    title={layer.locked ? 'Unlock' : 'Lock'}
                    aria-label={layer.locked ? 'Unlock layer' : 'Lock layer'}
                    onClick={() => onToggleLock(layer.id)}
                  >
                    <AspIcon name={layer.locked ? 'lock' : 'lock-open'} size={15} />
                  </button>
                  <button
                    type="button"
                    className="asp-layers__btn"
                    title="Bring forward"
                    aria-label="Bring forward"
                    onClick={() => onMoveUp(layer.id)}
                  >
                    <AspIcon name="chevron-up" size={15} />
                  </button>
                  <button
                    type="button"
                    className="asp-layers__btn"
                    title="Send backward"
                    aria-label="Send backward"
                    onClick={() => onMoveDown(layer.id)}
                  >
                    <AspIcon name="chevron-down" size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
