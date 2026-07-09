import { type ReactElement } from 'react';
import { Route, Routes } from 'react-router-dom';

/** Placeholder shell — the real docs-site shell lands with the demo task. */
export function App(): ReactElement {
  return (
    <Routes>
      <Route path="/" element={<main>React Image Editor demo — under construction</main>} />
    </Routes>
  );
}
