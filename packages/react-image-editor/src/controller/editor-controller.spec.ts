import { describe, expect, it, vi } from 'vitest';

import { EditorController, initialEditorUiState, isTypingTarget, type EditorControllerProps } from './editor-controller';

function makeController(overrides: Partial<EditorControllerProps> = {}): EditorController {
  return new EditorController(() => ({
    mode: 'advanced',
    initialAspect: null,
    aspectPresets: ['free', '1:1', '4:3', '16:9'],
    exportFormats: ['png', 'jpeg', 'webp'],
    keyboardEnabled: true,
    fonts: [],
    backgroundRemovalLoader: null,
    heicDecoderLoader: null,
    ...overrides,
  }));
}

describe('EditorController store contract', () => {
  it('starts from the documented initial state', () => {
    const controller = makeController();
    expect(controller.getSnapshot()).toEqual(initialEditorUiState());
  });

  it('notifies subscribers with a NEW snapshot object on change', () => {
    const controller = makeController();
    const before = controller.getSnapshot();
    const listener = vi.fn();
    controller.subscribe(listener);
    controller.selectTool('pen');
    expect(listener).toHaveBeenCalledOnce();
    const after = controller.getSnapshot();
    expect(after).not.toBe(before);
    expect(after.activeTool).toBe('pen');
  });

  it('stops notifying after unsubscribe', () => {
    const controller = makeController();
    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener);
    unsubscribe();
    controller.selectTool('text');
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('selectTool', () => {
  it('remembers the picked member for its toolbar group (flyout slot icon)', () => {
    const controller = makeController();
    controller.selectTool('highlighter');
    const { activeMembers, activeTool } = controller.getSnapshot();
    expect(activeTool).toBe('highlighter');
    // highlighter belongs to the draw group; the group remembers it.
    expect(Object.values(activeMembers)).toContain('highlighter');
  });
});

describe('ensureActiveTool', () => {
  it('defaults to adjust when available', () => {
    const controller = makeController();
    controller.ensureActiveTool(['crop', 'adjust', 'pen']);
    expect(controller.getSnapshot().activeTool).toBe('adjust');
  });

  it('falls back to the first resolved tool without adjust', () => {
    const controller = makeController();
    controller.ensureActiveTool(['crop', 'pen']);
    expect(controller.getSnapshot().activeTool).toBe('crop');
  });

  it('clears the tool when the resolved set is empty', () => {
    const controller = makeController();
    controller.ensureActiveTool(['crop']);
    controller.ensureActiveTool([]);
    expect(controller.getSnapshot().activeTool).toBeNull();
  });

  it('keeps a still-valid current tool', () => {
    const controller = makeController();
    controller.selectTool('pen');
    controller.ensureActiveTool(['pen', 'adjust']);
    expect(controller.getSnapshot().activeTool).toBe('pen');
  });
});

describe('syncExportDefaults', () => {
  it('applies the quality and keeps a still-offered format', () => {
    const controller = makeController();
    controller.setExportFormat('jpeg');
    controller.syncExportDefaults(70, ['png', 'jpeg']);
    const state = controller.getSnapshot();
    expect(state.exportQ).toBe(70);
    expect(state.exportFormat).toBe('jpeg');
  });

  it('falls back to the first format when the current one is not offered', () => {
    const controller = makeController();
    controller.setExportFormat('png');
    controller.syncExportDefaults(90, ['webp', 'svg']);
    expect(controller.getSnapshot().exportFormat).toBe('webp');
  });
});

describe('selectLook (single-select toggle, engine absent)', () => {
  it('selects, toggles off on re-select, and swaps between looks', () => {
    const controller = makeController();
    controller.selectLook('sepia');
    expect(controller.getSnapshot().activeLook).toBe('sepia');
    controller.selectLook('sepia');
    expect(controller.getSnapshot().activeLook).toBeNull();
    controller.selectLook('sepia');
    controller.selectLook('grayscale');
    expect(controller.getSnapshot().activeLook).toBe('grayscale');
    controller.selectLook(null);
    expect(controller.getSnapshot().activeLook).toBeNull();
  });
});

describe('adjustments', () => {
  it('onAdjustInput patches the single key without touching siblings', () => {
    const controller = makeController();
    const before = controller.getSnapshot().adjustments;
    controller.onAdjustInput({ key: 'brightness', value: 40 });
    const after = controller.getSnapshot().adjustments;
    expect(after['brightness']).toBe(40);
    expect(after['contrast']).toBe(before['contrast']);
  });
});

describe('error toast (engine init fails in jsdom — no canvas 2D context)', () => {
  /** Drive the real public failure path: binding in jsdom cannot create a Fabric canvas. */
  async function bindAndFail(controller: EditorController): Promise<void> {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const canvas = document.createElement('canvas');
    const stage = document.createElement('div');
    document.body.append(stage);
    stage.append(canvas);
    controller.requestBind(canvas, stage, null);
    await controller.whenIdle();
    warn.mockRestore();
  }

  it('surfaces engine-init-failed as a toast, reports onError, and dismisses', async () => {
    const onError = vi.fn();
    const controller = makeController({ onError });
    await bindAndFail(controller);
    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0].code).toBe('engine-init-failed');
    expect(controller.getSnapshot().errorToast).not.toBeNull();
    controller.dismissErrorToast();
    expect(controller.getSnapshot().errorToast).toBeNull();
  });

  it('auto-clears the toast after 6s', async () => {
    const controller = makeController();
    await bindAndFail(controller);
    expect(controller.getSnapshot().errorToast).not.toBeNull();
    vi.useFakeTimers();
    try {
      // The 6s timer was scheduled with real timers; surface a fresh toast under
      // fake timers via another failing bind to a NEW canvas.
      await bindAndFail(controller);
      vi.advanceTimersByTime(6001);
      expect(controller.getSnapshot().errorToast).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('isTypingTarget', () => {
  it('yields for form fields and contenteditable, not for buttons', () => {
    const input = document.createElement('input');
    const textarea = document.createElement('textarea');
    const select = document.createElement('select');
    const button = document.createElement('button');
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    document.body.append(input, textarea, select, button, editable);
    expect(isTypingTarget(input)).toBe(true);
    expect(isTypingTarget(textarea)).toBe(true);
    expect(isTypingTarget(select)).toBe(true);
    expect(isTypingTarget(button)).toBe(false);
    expect(isTypingTarget(editable)).toBe(true);
    expect(isTypingTarget(null)).toBe(false);
  });
});

describe('redact + magic panel state', () => {
  it('setRedactMode / onMagicTolerance update the snapshot', () => {
    const controller = makeController();
    controller.setRedactMode('blur');
    controller.onMagicTolerance(64);
    const state = controller.getSnapshot();
    expect(state.redactMode).toBe('blur');
    expect(state.magicTolerance).toBe(64);
  });
});
