import { type ReactElement } from 'react';
import { ImageEditor, type AspTool } from '@ascentsparksoftware/react-image-editor';

import { DocExample, type ExampleSource } from '../../shared/DocExample';
import { DocPage, type PageSection } from '../../shared/DocPage';

interface ToolDemo {
  anchor: string;
  title: string;
  description: string;
  tools: AspTool[];
}

const DEMOS: ToolDemo[] = [
  {
    anchor: 'crop',
    title: 'Crop',
    description:
      'An interactive, non-destructive crop frame — drag the handles and reposition it (rule-of-thirds, dimmed surroundings), pick an aspect, then Apply. It sets the output region that drives export; in basic mode you position the frame to choose which part of an off-ratio image is kept.',
    tools: ['crop', 'rotate'],
  },
  {
    anchor: 'adjust-filters',
    title: 'Adjust & filters',
    description:
      'Fine-tune brightness, contrast, saturation, vibrance, hue and blur, or apply filter looks (B&W, sepia, invert, sharpen, tint). Sliders preview live and commit on release.',
    tools: ['adjust', 'filters'],
  },
  {
    anchor: 'draw',
    title: 'Draw',
    description:
      'Freehand pen, a genuinely translucent highlighter, and an eraser — each with color and thickness controls. The highlighter composites correctly over everything beneath it.',
    tools: ['pen', 'highlighter', 'eraser'],
  },
  {
    anchor: 'text',
    title: 'Text & web fonts',
    description:
      'Click to drop an editable text box. Choose from a curated Google-font list or search any Google font by name; bold/italic/underline, alignment, color and size are all live.',
    tools: ['text'],
  },
  {
    anchor: 'shapes',
    title: 'Shapes',
    description:
      'Rectangle (sharp through any corner radius up to a pill), ellipse, triangle, polygon, star, line and arrow. Stroke, fill and the corner radius reflect from the selected shape.',
    tools: ['shapes'],
  },
  {
    anchor: 'redact',
    title: 'Redact',
    description:
      'Freehand redaction that bakes the composited pixels under the region — solid, blur or pixelate — concealing everything beneath, not just the base image. Click to place, then Apply.',
    tools: ['redact'],
  },
  {
    anchor: 'magic-wand',
    title: 'Magic wand',
    description:
      'Click a flat color region to erase it to transparency, with a tolerance slider. Pure flood-fill — no dependencies, works everywhere.',
    tools: ['magicwand'],
  },
  {
    anchor: 'ai',
    title: 'AI background tools',
    description:
      'Remove background and Cut out subject run an ONNX model in the browser — no image data leaves the page, no API key. They lazy-load the optional @imgly/background-removal dependency via the backgroundRemovalLoader prop and show a progress bar while the model fetches.',
    tools: ['removebg', 'selectsubject'],
  },
  {
    anchor: 'background-frames',
    title: 'Background & frames',
    description:
      'Set a background color or gradient (it composites under transparent areas) and add a frame — none, mat, line, inset, hook or bead — with a frame color.',
    tools: ['background', 'frame'],
  },
];

const SECTIONS: PageSection[] = DEMOS.map((d) => ({ id: d.anchor, label: d.title }));

function sourceFor(t: ToolDemo): ExampleSource[] {
  const list = `[${t.tools.map((x) => `'${x}'`).join(', ')}]`;
  return [
    {
      label: 'TSX',
      lang: 'tsx',
      code: `<ImageEditor mode="advanced" tools={${list}} height="480px" />`,
    },
  ];
}

export default function EditingTools(): ReactElement {
  return (
    <DocPage
      heading="Editing tools"
      lead="Every editing tool, each shown with its rail isolated via the tools prop. Load an image with the Image button, then try the tool. In your app you typically keep the full rail for a mode."
      sections={SECTIONS}
    >
      {DEMOS.map((t) => (
        <DocExample
          key={t.anchor}
          anchor={t.anchor}
          title={t.title}
          description={t.description}
          sources={sourceFor(t)}
        >
          <ImageEditor mode="advanced" tools={t.tools} height="480px" />
        </DocExample>
      ))}
    </DocPage>
  );
}
