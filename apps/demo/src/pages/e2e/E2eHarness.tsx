import { useCallback, useState, type ReactElement } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  ImageEditor,
  openImageEditorDialog,
  type AspEditorError,
  type AspMode,
} from '@ascentsparksoftware/react-image-editor';

const MODES: readonly AspMode[] = ['viewer', 'basic', 'advanced', 'full'];

/**
 * Hidden deterministic surface for the Playwright suite (not in the nav).
 * `/e2e?mode=advanced&theme=dark&aspect=1:1` renders one editor full-width with
 * the requested mode/theme, plus instrumentation readouts the tests assert on.
 */
export default function E2eHarness(): ReactElement {
  const [params] = useSearchParams();
  const modeParam = params.get('mode');
  const mode: AspMode = MODES.includes(modeParam as AspMode) ? (modeParam as AspMode) : 'advanced';
  const themeMode = params.get('theme') === 'dark' ? 'dark' : 'light';
  const initialAspect = params.get('aspect') === '1:1' ? '1:1' : null;

  const [loaded, setLoaded] = useState(0);
  const [savedBytes, setSavedBytes] = useState<number | null>(null);
  const [savedType, setSavedType] = useState('');
  const [exportedBytes, setExportedBytes] = useState<number | null>(null);
  const [canceled, setCanceled] = useState(0);
  const [lastError, setLastError] = useState('');
  const [dialogResult, setDialogResult] = useState('');

  const onSaved = useCallback((blob: Blob) => {
    setSavedBytes(blob.size);
    setSavedType(blob.type);
  }, []);
  const onExported = useCallback((blob: Blob) => setExportedBytes(blob.size), []);
  const onImageLoaded = useCallback(() => setLoaded((n) => n + 1), []);
  const onCanceled = useCallback(() => setCanceled((n) => n + 1), []);
  const onError = useCallback((e: AspEditorError) => setLastError(e.code), []);

  const openDialog = async (): Promise<void> => {
    const blob = await openImageEditorDialog({
      heading: 'Update profile photo',
      aspectPresets: ['1:1', '4:3', 'free'],
      initialAspect: '1:1',
      themeMode,
    });
    setDialogResult(blob ? `blob:${blob.size}` : 'null');
  };

  return (
    <div data-testid="e2e-harness" style={{ padding: 16 }}>
      <div style={{ height: 640 }}>
        <ImageEditor
          mode={mode}
          themeMode={themeMode}
          baseColor={themeMode === 'dark' ? '#10151d' : '#f4f6f9'}
          accentColor="#1f6feb"
          initialAspect={initialAspect}
          exportFormats={['png', 'jpeg', 'webp', 'svg', 'json', 'pdf']}
          onSaved={onSaved}
          onExported={onExported}
          onImageLoaded={onImageLoaded}
          onCanceled={onCanceled}
          onError={onError}
        />
      </div>
      <dl style={{ fontFamily: 'monospace', fontSize: 12 }}>
        <dt>loaded</dt>
        <dd data-testid="stat-loaded">{loaded}</dd>
        <dt>saved</dt>
        <dd data-testid="stat-saved">{savedBytes === null ? '-' : `${savedType}:${savedBytes}`}</dd>
        <dt>exported</dt>
        <dd data-testid="stat-exported">{exportedBytes ?? '-'}</dd>
        <dt>canceled</dt>
        <dd data-testid="stat-canceled">{canceled}</dd>
        <dt>error</dt>
        <dd data-testid="stat-error">{lastError || '-'}</dd>
        <dt>dialog</dt>
        <dd data-testid="stat-dialog">{dialogResult || '-'}</dd>
      </dl>
      <button type="button" data-testid="open-dialog" onClick={() => void openDialog()}>
        Open editor dialog
      </button>
    </div>
  );
}
