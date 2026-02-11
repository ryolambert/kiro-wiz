import { theme } from '../theme.js';

export interface HelpHint {
  keys: string;
  action: string;
}

export function HelpBar({ hints }: { hints: HelpHint[] }) {
  return (
    <box
      borderStyle="single"
      border={['top']}
      borderColor={theme.border}
      flexDirection="row"
      justifyContent="center"
      gap={2}
      height={2}
      backgroundColor={theme.surface}
    >
      {hints.map(({ keys, action }) => (
        <text key={keys}>
          <span fg={theme.primary}>{keys}</span>
          <span fg={theme.textMuted}> {action}</span>
        </text>
      ))}
    </box>
  );
}
