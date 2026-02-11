# kiro-wiz TUI Enhancement Plan

## Overview

Transform the kiro-wiz TUI from a functional but plain interface into a polished, branded terminal experience with cohesive theming, intuitive navigation, persistent help, and a distinctive visual identity.

---

## 1. Purple Gradient Theme

Replace the current green/gray palette with a purple gradient color system.

### Design Tokens (`src/tui/theme.ts`)

```ts
export const theme = {
  // Purple gradient spectrum
  primary:    '#B388FF', // Light purple — headings, active borders
  secondary:  '#7C4DFF', // Mid purple — selected items, accents
  accent:     '#E040FB', // Magenta-pink — highlights, confirmations
  dim:        '#9575CD', // Muted purple — descriptions, secondary text
  surface:    '#1A1028', // Dark purple-black — panel backgrounds
  surfaceAlt: '#2D1B4E', // Slightly lighter — alternate rows, hover bg
  border:     '#4A2D7A', // Border default
  borderFocus:'#B388FF', // Border when focused
  text:       '#E8DEF8', // Primary text
  textMuted:  '#8E7AAF', // Muted/help text
  success:    '#69F0AE', // Green — success states
  error:      '#FF5252', // Red — errors
  warning:    '#FFD740', // Yellow — warnings, skipped items
}
```

### Implementation Steps

1. Create `src/tui/theme.ts` exporting the token object
2. Replace all hardcoded color strings across screens with `theme.*` references
3. Update `<select>` components: `selectedBackgroundColor={theme.surfaceAlt}`, `selectedTextColor={theme.primary}`
4. Update all `borderColor` props to use `theme.border` / `theme.borderFocus`
5. Update `<scrollbox>` `rootOptions.backgroundColor` to `theme.surface`

### Files to Modify

- All `src/tui/screens/*.tsx`
- `src/tui/components/Spinner.tsx`

---

## 2. Ghost Wizard ASCII Logo

Add a branded ASCII art ghost wizard displayed on the main menu splash.

### Design

```
     ╭─────╮
    ╭│ ◉ ◉ │╮
    ││  ▽  ││
    ╰│     │╯
     │ ░░░ │
     │░░░░░│
     ╰┬─┬─┬╯
      ╰ ╰ ╰
```

Alternative using `<ascii-font>` for the title text below the logo.

### Implementation

1. Create `src/tui/components/Logo.tsx` — renders the ghost wizard art + "kiro-wiz" title
2. Use `<text>` with purple gradient coloring per line (top lines lighter, bottom lines darker)
3. Below the art, render "kiro-wiz" via `<ascii-font font="tiny">` if available, or styled `<text>` with bold
4. Add a tagline: `<text fg={theme.dim}>Kiro Ecosystem Wizard</text>`
5. Replace the current header box in `MainMenu.tsx` with `<Logo />`

### Layout

```
┌──────────────────────────────────────┐
│         [Ghost Wizard Art]           │
│           kiro-wiz                   │
│     Kiro Ecosystem Wizard            │
│                                      │
│  > Scaffold    Create a new tool     │
│    Audit       Check best practices  │
│    Sync KB     Update knowledge base │
│    ...                               │
│                                      │
│  ↑↓ navigate  Enter select  ? help  │
└──────────────────────────────────────┘
```

---

## 3. Keyboard Shortcuts — Left/Right Navigation

Add left arrow as "back" and right arrow / Enter as "forward/select" across all screens.

### Current State

- `ESC` → back to menu (global in App.tsx)
- `Enter` → select/confirm (per-screen)
- `↑↓` → navigate lists

### Proposed Additions

| Key       | Action                       | Context                |
| --------- | ---------------------------- | ---------------------- |
| `←` / `h` | Go back (same as ESC)        | Any non-menu screen    |
| `→` / `l` | Select/enter (same as Enter) | Menu items, list items |
| `?`       | Toggle help overlay          | Global                 |
| `Ctrl+C`  | Quit                         | Global                 |
| `1-9`     | Jump to menu item by number  | Main menu only         |

### Implementation

1. In `App.tsx` `useKeyboard`: add `left` as alias for `escape` back navigation
2. In `MainMenu.tsx`: add `right` key handler that triggers selection of current item
3. In `MainMenu.tsx`: add number key handlers (`1`-`8`) for direct menu item jump
4. Add `Ctrl+C` global quit handler in `App.tsx`

### Code Pattern

```tsx
// App.tsx
useKeyboard((key) => {
  if ((key.name === 'escape' || key.name === 'left') && screen !== 'menu') {
    setScreen('menu');
  }
  if (key.ctrl && key.name === 'q') {
    renderer.destroy();
  }
});
```

---

## 4. Persistent Help Bar (Footer)

Add a persistent footer bar visible on every screen showing context-sensitive keyboard shortcuts.

### Design

```
─────────────────────────────────────────────
 ←/ESC back  ↑↓ navigate  Enter select  ? help  Ctrl+C quit
```

### Implementation

1. Create `src/tui/components/HelpBar.tsx`
   - Accepts `hints: Array<{ keys: string; action: string }>` prop
   - Renders a single-line box at the bottom with `border={["top"]}` and `position="absolute"` bottom
2. Create `src/tui/components/Layout.tsx` — wraps every screen with header + content + HelpBar
   - Header: Logo or screen title (compact mode on sub-screens)
   - Content: `flexGrow={1}` area for screen content
   - Footer: `<HelpBar />` with context-sensitive hints
3. Each screen exports its own `HELP_HINTS` array
4. `App.tsx` wraps the screen switch in `<Layout>` and passes screen-specific hints

### Help Hints Per Screen

```ts
// MainMenu
[{ keys: '↑↓', action: 'navigate' }, { keys: 'Enter/→', action: 'select' }, { keys: '1-8', action: 'jump' }, { keys: '?', action: 'help' }, { keys: 'Ctrl+C', action: 'quit' }]

// Sub-screens (default)
[{ keys: '←/ESC', action: 'back' }, { keys: '↑↓', action: 'scroll' }, { keys: 'Enter', action: 'confirm' }, { keys: '?', action: 'help' }]

// Input steps
[{ keys: '←/ESC', action: 'back' }, { keys: 'Enter', action: 'submit' }, { keys: 'Tab', action: 'next field' }]
```

### Component

```tsx
export function HelpBar({ hints }: { hints: Array<{ keys: string; action: string }> }) {
  return (
    <box
      position="absolute"
      bottom={0}
      width="100%"
      height={1}
      borderStyle="single"
      border={['top']}
      borderColor={theme.border}
      flexDirection="row"
      justifyContent="center"
      gap={2}
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
```

---

## 5. Toast / Hover Descriptions

Add contextual descriptions that appear when hovering over or selecting menu items.

### Approach

Since terminal UIs don't have true hover, use the `<select>` component's built-in `description` field (already present) and enhance it with a dedicated description panel below the menu.

### Implementation

1. Track the currently highlighted index in `MainMenu.tsx` via `onIndexChange`
2. Render a description box below the select that shows the full description of the highlighted item
3. Style with `theme.surfaceAlt` background and `theme.dim` text
4. For sub-screens with multi-step wizards, add a step indicator: `Step 2/5 — Enter name`

### Description Panel

```tsx
const [hoveredIndex, setHoveredIndex] = useState(0);

<box
  style={{
    border: true,
    borderStyle: 'rounded',
    borderColor: theme.border,
    padding: 1,
    marginTop: 1,
    backgroundColor: theme.surfaceAlt,
  }}
>
  <text fg={theme.dim}>
    {MENU_OPTIONS[hoveredIndex]?.description}
  </text>
</box>
```

### Extended Descriptions

Add a `longDescription` field to menu options for the detail panel:

```ts
const MENU_OPTIONS = [
  {
    name: '🔧  Scaffold',
    description: 'Create a new Kiro tool',
    longDescription: 'Generate scaffolding for hooks, steering docs, skills, powers, MCP servers, agents, and more. Walks you through type selection, naming, and installs to your workspace.',
    value: 'scaffold',
  },
  // ...
];
```

---

## 6. Implementation Order

| Phase | Items                                         | Effort                                   |
| ----- | --------------------------------------------- | ---------------------------------------- |
| 1     | Theme tokens + apply to all screens           | Small — create file, find/replace colors |
| 2     | HelpBar + Layout wrapper                      | Small — two new components, wrap App     |
| 3     | Keyboard shortcuts (←/→, number keys, Ctrl+C) | Small — add handlers in App + MainMenu   |
| 4     | Ghost wizard logo                             | Small — one component, swap in MainMenu  |
| 5     | Description panel / toast                     | Small — track index, render panel        |

Each phase is independent and can be done in any order. Phase 1 (theme) is recommended first since all other phases reference theme tokens.

---

## 7. File Summary

### New Files

| File                             | Purpose                          |
| -------------------------------- | -------------------------------- |
| `src/tui/theme.ts`               | Centralized color tokens         |
| `src/tui/components/Logo.tsx`    | Ghost wizard ASCII art + title   |
| `src/tui/components/HelpBar.tsx` | Persistent keyboard hints footer |
| `src/tui/components/Layout.tsx`  | Header/content/footer wrapper    |

### Modified Files

| File                             | Changes                                     |
| -------------------------------- | ------------------------------------------- |
| `src/tui/App.tsx`                | Wrap in Layout, add ←/Ctrl+C handlers       |
| `src/tui/screens/MainMenu.tsx`   | Logo, description panel, number keys, → key |
| `src/tui/screens/*.tsx`          | Replace hardcoded colors with theme tokens  |
| `src/tui/components/Spinner.tsx` | Use theme.primary for default color         |
