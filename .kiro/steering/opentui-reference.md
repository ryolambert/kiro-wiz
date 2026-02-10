---
inclusion: fileMatch
fileMatchPattern: ["*.js", "*.jsx", "*.ts", "*.tsx"]
---

# OpenTUI React Reference

OpenTUI is a TypeScript TUI framework using Yoga flexbox layout. This project uses `@opentui/core` + `@opentui/react`.

## Setup

```bash
bun add @opentui/core @opentui/react react
```

```tsx
// index.tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { App } from "./App"

const renderer = await createCliRenderer({ exitOnCtrlC: true, targetFps: 30 })
createRoot(renderer).render(<App />)
```

```json
// tsconfig.json (required)
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@opentui/react",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ESNext",
    "strict": true
  }
}
```

## React Hooks

### useKeyboard(handler, options?)

```tsx
import { useKeyboard } from "@opentui/react"

useKeyboard((key) => {
  // key.name: "escape" | "return" | "tab" | "space" | "up" | "down" | "left" | "right" | "backspace" | "f1"-"f12" | letter
  // key.ctrl, key.shift, key.meta (alt), key.option
  if (key.name === "escape") process.exit(0)
  if (key.ctrl && key.name === "s") save()
})

// With key release events:
useKeyboard((event) => {
  if (event.eventType === "release") console.log("Released:", event.name)
}, { release: true })
```

### useRenderer()

```tsx
import { useRenderer } from "@opentui/react"

const renderer = useRenderer()
renderer.console.toggle()  // Debug console
renderer.destroy()          // Clean exit
// renderer.width, renderer.height — terminal dimensions
```

### useTerminalDimensions()

```tsx
import { useTerminalDimensions } from "@opentui/react"

const { width, height } = useTerminalDimensions() // Reactive, auto-updates on resize
```

### useOnResize(callback)

```tsx
import { useOnResize } from "@opentui/react"

useOnResize((width, height) => {
  console.log(`Resized to ${width}x${height}`)
})
```

### useTimeline(options?)

```tsx
import { useTimeline } from "@opentui/react"
import { useEffect, useState } from "react"

const [width, setWidth] = useState(0)
const timeline = useTimeline({ duration: 2000, loop: false })

useEffect(() => {
  timeline.add({ width }, {
    width: 50,
    duration: 2000,
    ease: "linear", // "linear" | "easeInOutQuad" | "easeInCubic" | etc.
    onUpdate: (anim) => setWidth(anim.targets[0].width),
  })
}, [])
```

## JSX Components

### `<box>` — Container with layout

```tsx
<box style={{
  flexDirection: "column",  // "row" | "column" | "row-reverse" | "column-reverse"
  flexGrow: 1,
  flexShrink: 0,
  justifyContent: "center", // "flex-start" | "flex-end" | "center" | "space-between" | "space-around"
  alignItems: "center",     // "flex-start" | "flex-end" | "center" | "stretch"
  width: 40,                // number | "100%" | "50%"
  height: 10,
  padding: 2,
  paddingTop: 1,
  margin: 1,
  gap: 1,
  border: true,
  borderStyle: "single",    // "single" | "double" | "rounded" | "heavy"
  borderColor: "#FFFFFF",
  backgroundColor: "#1a1a1a",
}}>
  <text>Content</text>
</box>

// Title on border:
<box title="Settings" style={{ border: true, borderStyle: "rounded" }}>

// Selective borders:
<box borderStyle="single" border={["bottom"]}>

// Direct props also work:
<box flexDirection="column" padding={2} border>
```

### `<text>` — Display text

```tsx
<text>Simple text</text>
<text fg="#00FF00" bg="#000000">Colored text</text>
<text attributes={TextAttributes.BOLD | TextAttributes.UNDERLINE}>Styled</text>

// Rich text children:
<text>
  <strong>Bold</strong>, <em>Italic</em>, <u>Underlined</u>
  <span fg="red">Red</span> and <span fg="blue">Blue</span>
</text>
```

TextAttributes: `BOLD`, `DIM`, `ITALIC`, `UNDERLINE`, `BLINK`, `REVERSE`, `STRIKETHROUGH`, `NONE`. Combine with `|`.

### `<input>` — Text input

```tsx
<input
  placeholder="Type here..."
  focused={true}
  onInput={(value) => setValue(value)}
  onSubmit={(value) => console.log("Submitted:", value)}
  style={{ focusedBackgroundColor: "#1a1a1a" }}
/>
```

### `<textarea>` — Multi-line editor

```tsx
import type { TextareaRenderable } from "@opentui/core"
const textareaRef = useRef<TextareaRenderable>(null)

<textarea ref={textareaRef} placeholder="Type here..." focused />
// Access: textareaRef.current?.plainText
```

### `<select>` — Dropdown selection

```tsx
import type { SelectOption } from "@opentui/core"

const options: SelectOption[] = [
  { name: "Option 1", description: "Description", value: "opt1" },
  { name: "Option 2", description: "Description", value: "opt2" },
]

<select
  options={options}
  focused={true}
  style={{ height: 10 }}
  onChange={(index, option) => console.log("Selected:", option)}
/>
```

### `<scrollbox>` — Scrollable container

```tsx
<scrollbox
  focused
  style={{
    rootOptions: { backgroundColor: "#1a1b26" },
    scrollbarOptions: {
      showArrows: true,
      trackOptions: { foregroundColor: "#7aa2f7", backgroundColor: "#414868" },
    },
  }}
>
  {items.map((item, i) => (
    <box key={i} style={{ padding: 1 }}>
      <text>{item}</text>
    </box>
  ))}
</scrollbox>
```

### `<code>` — Syntax-highlighted code

```tsx
import { RGBA, SyntaxStyle } from "@opentui/core"

const syntaxStyle = SyntaxStyle.fromStyles({
  keyword: { fg: RGBA.fromHex("#FF7B72"), bold: true },
  string: { fg: RGBA.fromHex("#A5D6FF") },
  comment: { fg: RGBA.fromHex("#8B949E"), italic: true },
  number: { fg: RGBA.fromHex("#79C0FF") },
  function: { fg: RGBA.fromHex("#D2A8FF") },
  default: { fg: RGBA.fromHex("#E6EDF3") },
})

<code content={sourceCode} filetype="typescript" syntaxStyle={syntaxStyle} />
```

### `<ascii-font>` — ASCII art text

```tsx
<ascii-font text="TITLE" font="tiny" />
// Fonts: "tiny" | "block" | "slick" | "shade"
```

### `<line-number>` — Code with line numbers

```tsx
<line-number fg="#6b7280" bg="#161b22" minWidth={3} paddingRight={1} showLineNumbers>
  <code content={code} filetype="typescript" syntaxStyle={syntaxStyle} />
</line-number>
```

## Core API (Imperative)

Use when you need direct control outside React components.

### createCliRenderer

```typescript
import { createCliRenderer, ConsolePosition } from "@opentui/core"

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 30,
  useMouse: true,
  backgroundColor: "#000000",
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 30,
  },
})

// Events
renderer.on("resize", (w, h) => console.log(`${w}x${h}`))
renderer.on("destroy", () => console.log("Destroyed"))

// Lifecycle
renderer.start()    // Continuous rendering (for animations)
renderer.stop()
renderer.destroy()  // ALWAYS call before exit
```

### Keyboard (imperative)

```typescript
renderer.keyInput.on("keypress", (key: KeyEvent) => {
  console.log(key.name, key.ctrl, key.shift, key.meta)
})
renderer.keyInput.on("paste", (event) => console.log(event.text))
```

### Colors

```typescript
import { RGBA, parseColor } from "@opentui/core"

RGBA.fromHex("#FF0000")
RGBA.fromInts(255, 0, 0, 255)       // 0-255
RGBA.fromValues(1.0, 0.0, 0.0, 1.0) // 0.0-1.0
parseColor("red")                     // CSS names, hex, "transparent"
```

## Extending Components

Register custom renderables as JSX elements:

```tsx
import { BoxRenderable, OptimizedBuffer, RGBA, type BoxOptions, type RenderContext } from "@opentui/core"
import { extend } from "@opentui/react"

class ButtonRenderable extends BoxRenderable {
  private _label = "Button"
  constructor(ctx: RenderContext, options: BoxOptions & { label?: string }) {
    super(ctx, { border: true, borderStyle: "single", minHeight: 3, ...options })
    if (options.label) this._label = options.label
  }
  protected renderSelf(buffer: OptimizedBuffer): void {
    super.renderSelf(buffer)
    const cx = this.x + Math.floor(this.width / 2 - this._label.length / 2)
    const cy = this.y + Math.floor(this.height / 2)
    buffer.drawText(this._label, cx, cy, RGBA.fromInts(255, 255, 255, 255))
  }
  set label(v: string) { this._label = v; this.requestRender() }
}

declare module "@opentui/react" {
  interface OpenTUIComponents { consoleButton: typeof ButtonRenderable }
}
extend({ consoleButton: ButtonRenderable })

// Usage:
<consoleButton label="Click me!" style={{ backgroundColor: "blue" }} />
```

## DevTools

```bash
bun add --dev react-devtools-core@7
npx react-devtools@7        # Terminal 1
DEV=true bun run your-app.ts # Terminal 2
```
