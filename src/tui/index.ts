import { createCliRenderer } from '@opentui/core';
import { createRoot } from '@opentui/react';
import { createElement } from 'react';

export async function launch(): Promise<void> {
  const renderer = await createCliRenderer({ exitOnCtrlC: true });
  const { App } = await import('./App.js');
  createRoot(renderer).render(createElement(App));
}
