import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { EditorEngine } from '@ascentsparksoftware/react-image-editor';

import './engine-harness.scss';

/** A self-contained sample image (gradient + shapes) as a same-origin data URL. */
function sampleImage(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 600, 400);
    grad.addColorStop(0, '#0ea5e9');
    grad.addColorStop(0.5, '#2563eb');
    grad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 400);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(180, 150, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,200,0,0.9)';
    ctx.fillRect(330, 220, 180, 120);
  }
  return canvas.toDataURL('image/png');
}

/**
 * Verification harness — exercises the EditorEngine directly (headless: no
 * `<ImageEditor>` chrome) so its Fabric integration can be eyeballed via
 * screenshots. This lives only in the demo.
 */
export function EngineHarness(): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<EditorEngine | null>(null);

  const [status, setStatus] = useState('initializing…');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const refresh = useCallback((message: string): void => {
    setStatus(message);
    setCanUndo(engineRef.current?.canUndo ?? false);
    setCanRedo(engineRef.current?.canRedo ?? false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    // StrictMode-safe: if the effect is torn down while `create` is still in
    // flight, destroy the freshly created engine instead of publishing it.
    let disposed = false;
    let engine: EditorEngine | null = null;

    void (async (): Promise<void> => {
      const created = await EditorEngine.create(canvas, { width: 520, height: 360 });
      if (disposed) {
        void created.destroy();
        return;
      }
      engine = created;
      engineRef.current = created;
      await created.loadImage(sampleImage());
      if (!disposed) {
        refresh('loaded sample image');
      }
    })();

    return () => {
      disposed = true;
      engineRef.current = null;
      if (engine) {
        void engine.destroy();
      }
    };
  }, [refresh]);

  const rotate = (): void => {
    engineRef.current?.rotateBy(90);
    refresh('rotated 90°');
  };
  const flip = (): void => {
    engineRef.current?.flip('h');
    refresh('flipped horizontally');
  };
  const zoom = (delta: number): void => {
    engineRef.current?.zoomBy(delta);
    refresh(`zoom ${engineRef.current?.zoom}%`);
  };
  const grayscale = (): void => {
    engineRef.current?.toggleLook('grayscale');
    refresh('toggled B&W');
  };
  const sepia = (): void => {
    engineRef.current?.toggleLook('sepia');
    refresh('toggled sepia');
  };
  const brighten = (): void => {
    engineRef.current?.setAdjustments({ brightness: 30 }, true);
    refresh('brightness +30');
  };
  const crop = (): void => {
    engineRef.current?.applyCrop('1:1');
    refresh('cropped 1:1');
  };
  const addText = (): void => {
    engineRef.current?.addText('Sample', { color: '#f1416c', fontSize: 36 });
    refresh('added text');
  };
  const addRect = (): void => {
    engineRef.current?.addShape('rect', { color: '#1f6feb', strokeWidth: 4 });
    refresh('added rect');
  };
  const undo = async (): Promise<void> => {
    await engineRef.current?.undo();
    refresh('undo');
  };
  const redo = async (): Promise<void> => {
    await engineRef.current?.redo();
    refresh('redo');
  };
  const reset = async (): Promise<void> => {
    await engineRef.current?.reset();
    refresh('reset');
  };
  const exportPng = async (): Promise<void> => {
    const blob = await engineRef.current?.exportImage('png', 90, ['png', 'jpeg', 'webp']);
    refresh(`exported PNG (${blob ? blob.size : 0} bytes)`);
  };

  return (
    <div className="harness">
      <div className="toolbar">
        <button type="button" onClick={rotate}>
          Rotate 90°
        </button>
        <button type="button" onClick={flip}>
          Flip H
        </button>
        <button type="button" onClick={() => zoom(25)}>
          Zoom +
        </button>
        <button type="button" onClick={() => zoom(-25)}>
          Zoom −
        </button>
        <button type="button" onClick={grayscale}>
          B&W
        </button>
        <button type="button" onClick={sepia}>
          Sepia
        </button>
        <button type="button" onClick={brighten}>
          Brighten
        </button>
        <button type="button" onClick={crop}>
          Crop 1:1
        </button>
        <button type="button" onClick={addText}>
          Add text
        </button>
        <button type="button" onClick={addRect}>
          Add rect
        </button>
        <button type="button" onClick={() => void undo()} disabled={!canUndo}>
          Undo
        </button>
        <button type="button" onClick={() => void redo()} disabled={!canRedo}>
          Redo
        </button>
        <button type="button" onClick={() => void reset()}>
          Reset
        </button>
        <button type="button" onClick={() => void exportPng()}>
          Export PNG
        </button>
      </div>
      <div className="stage">
        <canvas ref={canvasRef} />
      </div>
      <p className="status">{status}</p>
    </div>
  );
}
