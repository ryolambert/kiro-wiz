import { theme } from '../theme.js';

const LOGO_LINES = [
  '     ╭─────╮     ',
  '    ╭│ ◉ ◉ │╮    ',
  '    ││  ▽  ││    ',
  '    ╰│     │╯    ',
  '     │ ░░░ │     ',
  '     │░░░░░│     ',
  '     ╰┬─┬─┬╯     ',
  '      ╰ ╰ ╰      ',
];

const GRADIENT = [
  '#E8DEF8',
  '#D0BCFF',
  '#B388FF',
  '#B388FF',
  '#9575CD',
  '#7C4DFF',
  '#7C4DFF',
  '#4A2D7A',
];

export function Logo() {
  return (
    <box flexDirection="column" alignItems="center" marginBottom={1}>
      {LOGO_LINES.map((line, i) => (
        <text key={i} fg={GRADIENT[i]}>{line}</text>
      ))}
      <text fg={theme.primary}>
        <strong>⚡ kiro-wiz</strong>
      </text>
      <text fg={theme.dim}>Kiro Ecosystem Wizard</text>
    </box>
  );
}
