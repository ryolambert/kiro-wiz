import type { HelpHint } from './HelpBar.js';
import { HelpBar } from './HelpBar.js';

interface Props {
  hints: HelpHint[];
  children: React.ReactNode;
}

export function Layout({ hints, children }: Props) {
  return (
    <box flexDirection="column" flexGrow={1}>
      <box flexGrow={1}>{children}</box>
      <HelpBar hints={hints} />
    </box>
  );
}
