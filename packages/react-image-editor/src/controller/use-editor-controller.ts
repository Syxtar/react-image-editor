import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import { resolveFilters, resolveTools } from '../registry/resolve-tools';
import { type AspExportFormat, type AspFilter, type AspMode, type AspTool } from '../types/editor.types';
import { type FontOption } from '../fonts/fonts';
import {
  EditorController,
  initialEditorUiState,
  type EditorControllerProps,
  type EditorUiState,
} from './editor-controller';

/** Server snapshot: a stable initial state so SSR/prerender never touches the engine. */
const SERVER_SNAPSHOT: EditorUiState = initialEditorUiState();

/**
 * Latest reactive inputs per controller. Module-scoped (not a ref) so the
 * controller's deferred, call-time reads live entirely outside React's render
 * data flow; entries are GC'd with their controller.
 */
const LATEST_PROPS = new WeakMap<EditorController, EditorControllerProps>();

export interface UseEditorControllerOptions extends EditorControllerProps {
  readonly src: string | Blob | null;
  readonly tools: readonly AspTool[] | null;
  readonly disabledTools: readonly AspTool[];
  readonly filters: readonly AspFilter[] | 'all' | null;
  readonly exportQuality: number;
}

export interface EditorBinding {
  readonly controller: EditorController;
  readonly state: EditorUiState;
  readonly resolvedToolKeys: readonly AspTool[];
  readonly resolvedFilters: readonly AspFilter[];
  readonly allFonts: readonly FontOption[];
  readonly setCanvasEl: (el: HTMLCanvasElement | null) => void;
  readonly setStageEl: (el: HTMLElement | null) => void;
}

/**
 * Wires an {@link EditorController} into React: one controller per component
 * instance (in a ref — the Fabric engine never enters render state), state via
 * `useSyncExternalStore`, and effects for engine binding, theming, tool-mode
 * sessions and document-level listeners. All effects are idempotent so React
 * StrictMode's double mount/unmount cycle is safe.
 */
export function useEditorController(options: UseEditorControllerOptions): EditorBinding {
  const {
    src,
    mode,
    tools,
    disabledTools,
    filters,
    exportQuality,
    exportFormats,
    exportBounds,
    wheelZoom,
    exportTarget,
    fonts,
    defaultFont,
    backgroundRemovalLoader,
  } = options;

  // One controller per component instance; lazily created, identity stable for
  // the component's lifetime. The controller reads its reactive inputs at call
  // time from LATEST_PROPS (a module-scoped registry outside React's render
  // data flow), refreshed every commit below — so handlers and queued engine
  // ops never see stale inputs.
  const [controller] = useState(() => {
    const created: EditorController = new EditorController(() => {
      const props = LATEST_PROPS.get(created);
      if (!props) {
        throw new Error('[asp-image-editor] controller props read before initialization');
      }
      return props;
    });
    LATEST_PROPS.set(created, toControllerProps(options));
    return created;
  });

  useEffect(() => {
    LATEST_PROPS.set(controller, toControllerProps(options));
  });

  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    () => SERVER_SNAPSHOT,
  );

  // Canvas/stage/ruler elements arrive via callback refs held in React state:
  // the layouts swap the canvas element (mode change), and effects must re-run
  // when the concrete element instance changes.
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);
  const [stageEl, setStageEl] = useState<HTMLElement | null>(null);

  // ---- resolved configuration ------------------------------------------------
  const disabledKey = disabledTools.join(',');
  const toolsKey = tools === null ? 'null' : tools.join(',');
  const resolvedToolKeys = useMemo<readonly AspTool[]>(() => {
    // The AI cut-out tools only work when a background-removal loader is wired,
    // so hide them otherwise — the flood-fill Magic wand needs no dependency and stays.
    const disabled = backgroundRemovalLoader
      ? [...disabledTools]
      : [...disabledTools, 'removebg' as AspTool, 'selectsubject' as AspTool];
    return resolveTools(mode, tools === null ? null : [...tools], disabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by content, not array identity
  }, [mode, toolsKey, disabledKey, backgroundRemovalLoader]);

  const filtersKey = filters === null ? 'null' : filters === 'all' ? 'all' : filters.join(',');
  const resolvedFilters = useMemo<readonly AspFilter[]>(
    () => resolveFilters(mode, filters === null || filters === 'all' ? filters : [...filters]),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by content, not array identity
    [mode, filtersKey],
  );

  /** Host-provided fonts plus custom fonts added at runtime. */
  const allFonts = useMemo<readonly FontOption[]>(() => {
    const extra = state.customFonts.filter((c) => !fonts.some((b) => b.value === c.value));
    return [...fonts, ...extra];
  }, [fonts, state.customFonts]);

  // ---- engine bind + source load -------------------------------------------------
  useEffect(() => {
    if (canvasEl && stageEl) {
      controller.requestBind(canvasEl, stageEl, src);
    }
  }, [controller, canvasEl, stageEl, src]);

  // Destroy on unmount only (StrictMode: destroy → effects re-run → rebind).
  useEffect(() => {
    return () => controller.destroy();
  }, [controller]);

  // ---- keep the active tool valid as the resolved set changes ---------------------
  useEffect(() => {
    controller.ensureActiveTool(resolvedToolKeys);
  }, [controller, resolvedToolKeys]);

  // ---- sync export defaults from inputs -------------------------------------------
  const formatsKey = exportFormats.join(',');
  useEffect(() => {
    controller.syncExportDefaults(exportQuality, exportFormats);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by content, not array identity
  }, [controller, exportQuality, formatsKey]);

  useEffect(() => {
    controller.setDefaultFont(defaultFont);
  }, [controller, defaultFont]);

  // ---- a cropped export renders at this pixel size --------------------------------
  useEffect(() => {
    controller.syncExportTarget();
  }, [controller, state.engineReady, exportTarget?.width, exportTarget?.height]);

  useEffect(() => {
    controller.syncExportBounds();
  }, [controller, state.engineReady, exportBounds]);

  useEffect(() => {
    controller.syncWheelZoom();
  }, [controller, state.engineReady, wheelZoom]);

  // ---- free-draw / text / magic follow the active tool + brush settings -----------
  useEffect(() => {
    controller.applyToolModes();
  }, [
    controller,
    state.engineReady,
    state.activeTool,
    state.annotationColor,
    state.annotationWidth,
  ]);

  // ---- crop + redact sessions track the active tool -------------------------------
  useEffect(() => {
    controller.syncCropSession();
  }, [controller, state.engineReady, state.activeTool]);

  useEffect(() => {
    controller.syncRedactSession();
  }, [controller, state.engineReady, state.activeTool]);

  // ---- document-level keyboard + paste (scoped by pointer-inside) -------------------
  useEffect(() => {
    const onKeydown = (event: KeyboardEvent): void => controller.handleKeydown(event);
    const onKeyup = (event: KeyboardEvent): void => controller.handleKeyup(event);
    const onPaste = (event: ClipboardEvent): void => controller.handlePaste(event);
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('keyup', onKeyup);
    document.addEventListener('paste', onPaste);
    return () => {
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('keyup', onKeyup);
      document.removeEventListener('paste', onPaste);
    };
  }, [controller]);

  return {
    controller,
    state,
    resolvedToolKeys,
    resolvedFilters,
    allFonts,
    setCanvasEl,
    setStageEl,
  };
}

function toControllerProps(options: UseEditorControllerOptions): EditorControllerProps {
  return {
    mode: options.mode,
    initialAspect: options.initialAspect,
    aspectPresets: options.aspectPresets,
    exportFormats: options.exportFormats,
    exportBounds: options.exportBounds,
    initialProject: options.initialProject,
    wheelZoom: options.wheelZoom,
    exportTarget: options.exportTarget,
    keyboardEnabled: options.keyboardEnabled,
    fonts: options.fonts,
    defaultFont: options.defaultFont,
    backgroundRemovalLoader: options.backgroundRemovalLoader,
    heicDecoderLoader: options.heicDecoderLoader,
    onSaved: options.onSaved,
    onDraftSaved: options.onDraftSaved,
    onChanged: options.onChanged,
    onCanceled: options.onCanceled,
    onImageLoaded: options.onImageLoaded,
    onExported: options.onExported,
    onError: options.onError,
  };
}

export type { AspMode, AspExportFormat };
