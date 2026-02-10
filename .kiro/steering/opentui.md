---
inclusion: fileMatch
fileMatchPattern: ["*.js", "*.jsx", "*.ts", "*.tsx"]
---
# OpenTUI Docs

## Overview
This doc is a comprehensive doc on how to setup an opentui terminal ui.

## Info

OpenTUI is a TypeScript library for building terminal user interfaces (TUIs). It provides a component-based architecture with flexible layout capabilities powered by the Yoga layout engine, allowing you to create complex console applications with familiar patterns from React and SolidJS. The library is designed to be the foundational TUI framework for projects like opencode and terminaldotshop.

The monorepo contains three main packages: `@opentui/core` which provides an imperative API and all primitives, `@opentui/solid` which offers a SolidJS reconciler, and `@opentui/react` which provides a React reconciler. The core library handles terminal output, input events, and rendering loops while the framework integrations allow declarative UI development with reactive state management.

## Installation

Install OpenTUI with bun or npm.

```bash
# Quick start with create-tui
bun create tui

# Manual installation for core
bun install @opentui/core

# For React
bun install @opentui/react @opentui/core react

# For SolidJS
bun install @opentui/solid @opentui/core solid-js
```

## createCliRenderer

Creates and configures the main CLI renderer instance that manages terminal output, handles input events, and orchestrates the rendering loop.

```typescript
import { createCliRenderer, ConsolePosition, type CliRendererConfig } from "@opentui/core"

const config: CliRendererConfig = {
  exitOnCtrlC: true,
  targetFps: 30,
  maxFps: 60,
  useMouse: true,
  useAlternateScreen: true,
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 30,
    colorInfo: "#00FFFF",
    colorWarn: "#FFFF00",
    colorError: "#FF0000",
  },
  backgroundColor: "#000000",
}

const renderer = await createCliRenderer(config)

// Access terminal dimensions
console.log(`Terminal size: ${renderer.width}x${renderer.height}`)

// Handle resize events
renderer.on("resize", (width, height) => {
  console.log(`Resized to ${width}x${height}`)
})

// Toggle debug overlay
renderer.toggleDebugOverlay()

// Set terminal title
renderer.setTerminalTitle("My TUI App")

// Clean up
renderer.destroy()
```

## TextRenderable

Display styled text content with support for colors, attributes, and text selection.

```typescript
import { createCliRenderer, TextRenderable, TextAttributes, t, bold, underline, fg } from "@opentui/core"

const renderer = await createCliRenderer()

// Basic text with styling
const plainText = new TextRenderable(renderer, {
  id: "plain-text",
  content: "Important Message",
  fg: "#FFFF00",
  attributes: TextAttributes.BOLD | TextAttributes.UNDERLINE,
  position: "absolute",
  left: 5,
  top: 2,
})

// Rich styled text using template literals
const styledText = new TextRenderable(renderer, {
  id: "styled-text",
  content: t`${bold("Bold Text")} ${fg("#FF0000")(underline("Red Underlined"))}`,
  position: "absolute",
  left: 5,
  top: 4,
})

renderer.root.add(plainText)
renderer.root.add(styledText)
```

## BoxRenderable

A container component with borders, background colors, and layout capabilities using Yoga flexbox.

```typescript
import { createCliRenderer, BoxRenderable, TextRenderable } from "@opentui/core"

const renderer = await createCliRenderer()

const panel = new BoxRenderable(renderer, {
  id: "panel",
  width: 40,
  height: 12,
  backgroundColor: "#333366",
  border: true,
  borderStyle: "double",
  borderColor: "#FFFFFF",
  title: "Settings Panel",
  titleAlignment: "center",
  padding: 2,
  flexDirection: "column",
  gap: 1,
})

const content = new TextRenderable(renderer, {
  id: "content",
  content: "Panel content goes here",
})

panel.add(content)
renderer.root.add(panel)
```

## InputRenderable

Text input field with cursor support, placeholder text, and focus states for user interaction.

```typescript
import { createCliRenderer, InputRenderable, InputRenderableEvents, BoxRenderable } from "@opentui/core"

const renderer = await createCliRenderer()

const container = new BoxRenderable(renderer, {
  id: "form",
  border: true,
  title: "Enter your name",
  width: 40,
  height: 5,
  padding: 1,
})

const nameInput = new InputRenderable(renderer, {
  id: "name-input",
  width: 35,
  placeholder: "Type your name here...",
  textColor: "#FFFFFF",
  cursorColor: "#00FF00",
  focusedBackgroundColor: "#1a1a1a",
})

nameInput.on(InputRenderableEvents.CHANGE, (value) => {
  console.log("Input submitted:", value)
})

container.add(nameInput)
renderer.root.add(container)
nameInput.focus()
```

## SelectRenderable

A list selection component for choosing from multiple options with keyboard navigation.

```typescript
import { createCliRenderer, SelectRenderable, SelectRenderableEvents } from "@opentui/core"

const renderer = await createCliRenderer()

const menu = new SelectRenderable(renderer, {
  id: "menu",
  width: 35,
  height: 10,
  options: [
    { name: "New File", description: "Create a new file", value: "new" },
    { name: "Open File", description: "Open an existing file", value: "open" },
    { name: "Save", description: "Save current file", value: "save" },
    { name: "Settings", description: "Configure preferences", value: "settings" },
    { name: "Exit", description: "Exit the application", value: "exit" },
  ],
  selectedColor: "#00FF00",
  descriptionColor: "#888888",
})

menu.on(SelectRenderableEvents.ITEM_SELECTED, (index, option) => {
  console.log(`Selected: ${option.name} (value: ${option.value})`)
})

renderer.root.add(menu)
menu.focus()
```

## ScrollBoxRenderable

A scrollable container for displaying large amounts of content with keyboard and mouse scroll support.

```typescript
import { createCliRenderer, ScrollBoxRenderable, TextRenderable } from "@opentui/core"

const renderer = await createCliRenderer()

const scrollbox = new ScrollBoxRenderable(renderer, {
  id: "scrollbox",
  width: 50,
  height: 15,
  border: true,
  stickyScroll: true,
  stickyStart: "bottom",
  scrollbarOptions: {
    visible: true,
    showArrows: true,
    trackOptions: {
      foregroundColor: "#7aa2f7",
      backgroundColor: "#414868",
    },
  },
})

// Add many items
for (let i = 0; i < 100; i++) {
  const item = new TextRenderable(renderer, {
    id: `item-${i}`,
    content: `Line ${i + 1}: This is scrollable content`,
  })
  scrollbox.content.add(item)
}

renderer.root.add(scrollbox)
scrollbox.focus()
```

## CodeRenderable

Code block with syntax highlighting using tree-sitter for multiple language support.

```typescript
import { createCliRenderer, CodeRenderable, SyntaxStyle, RGBA, BoxRenderable } from "@opentui/core"

const renderer = await createCliRenderer()

const syntaxStyle = SyntaxStyle.fromStyles({
  keyword: { fg: RGBA.fromHex("#ff6b6b"), bold: true },
  string: { fg: RGBA.fromHex("#51cf66") },
  comment: { fg: RGBA.fromHex("#868e96"), italic: true },
  number: { fg: RGBA.fromHex("#ffd43b") },
  function: { fg: RGBA.fromHex("#74c0fc") },
  default: { fg: RGBA.fromHex("#ffffff") },
})

const codeContent = `function fibonacci(n: number): number {
  // Base case
  if (n <= 1) return n

  // Recursive calculation
  return fibonacci(n - 1) + fibonacci(n - 2)
}

console.log(fibonacci(10)) // Output: 55`

const container = new BoxRenderable(renderer, {
  id: "code-container",
  border: true,
  title: "Code Example",
  padding: 1,
})

const code = new CodeRenderable(renderer, {
  id: "code",
  content: codeContent,
  filetype: "typescript",
  syntaxStyle,
})

container.add(code)
renderer.root.add(container)
```

## Keyboard Event Handling

Handle keyboard input with the KeyHandler event emitter for interactive applications.

```typescript
import { createCliRenderer, type KeyEvent } from "@opentui/core"

const renderer = await createCliRenderer({ exitOnCtrlC: false })

const keyHandler = renderer.keyInput

keyHandler.on("keypress", (key: KeyEvent) => {
  console.log(`Key: ${key.name}, Ctrl: ${key.ctrl}, Shift: ${key.shift}, Alt: ${key.meta}`)

  if (key.name === "escape") {
    renderer.destroy()
    process.exit(0)
  }

  if (key.ctrl && key.name === "c") {
    console.log("Ctrl+C pressed - exiting...")
    renderer.destroy()
    process.exit(0)
  }

  if (key.name === "up") {
    console.log("Navigate up")
  } else if (key.name === "down") {
    console.log("Navigate down")
  } else if (key.name === "return") {
    console.log("Enter pressed - confirm selection")
  }
})

keyHandler.on("paste", (event) => {
  console.log("Pasted text:", event.text)
})
```

## RGBA Colors

Consistent color representation with multiple input formats and alpha blending support.

```typescript
import { RGBA, parseColor } from "@opentui/core"

// Create colors from different formats
const redFromInts = RGBA.fromInts(255, 0, 0, 255)
const blueFromValues = RGBA.fromValues(0.0, 0.0, 1.0, 1.0)
const greenFromHex = RGBA.fromHex("#00FF00")
const transparentWhite = RGBA.fromValues(1.0, 1.0, 1.0, 0.5)

// Parse color strings
const parsed = parseColor("#FF5500")
const namedColor = parseColor("blue")
const transparent = parseColor("transparent")

// Convert back to different formats
console.log(redFromInts.toHex()) // "#FF0000FF"
console.log(blueFromValues.toInts()) // [0, 0, 255, 255]
```

## Timeline Animation

Create smooth animations using the Timeline system with easing functions.

```typescript
import { createCliRenderer, BoxRenderable, Timeline, engine } from "@opentui/core"

const renderer = await createCliRenderer()
engine.attach(renderer)

const box = new BoxRenderable(renderer, {
  id: "animated-box",
  width: 10,
  height: 5,
  backgroundColor: "#6a5acd",
  position: "absolute",
  left: 0,
  top: 5,
})

renderer.root.add(box)

const timeline = new Timeline({
  duration: 2000,
  loop: true,
  autoplay: true,
})

const animState = { x: 0 }

timeline.add(
  animState,
  {
    x: 50,
    duration: 2000,
    ease: "easeInOutQuad",
    onUpdate: (animation) => {
      box.left = Math.round(animation.targets[0].x)
    },
  },
  0
)

engine.register(timeline)
renderer.start()
```

## VNode Declarative API

Build UIs declaratively using VNodes without a framework reconciler.

```typescript
import { createCliRenderer, Box, Text, Input, delegate, instantiate } from "@opentui/core"

const renderer = await createCliRenderer()

// Create a labeled input component using VNodes
function LabeledInput(props: { id: string; label: string; placeholder: string }) {
  return delegate(
    { focus: `${props.id}-input` },
    Box(
      { flexDirection: "row", gap: 1 },
      Text({ content: props.label }),
      Input({
        id: `${props.id}-input`,
        placeholder: props.placeholder,
        width: 20,
        backgroundColor: "white",
        textColor: "black",
      })
    )
  )
}

// Create a button component
function Button(props: { content: string; onClick: () => void }) {
  return Box(
    { border: true, backgroundColor: "gray", onMouseDown: props.onClick },
    Text({ content: props.content })
  )
}

// Compose the login form
const usernameInput = LabeledInput({ id: "username", label: "Username:", placeholder: "Enter username..." })
usernameInput.focus()

const loginForm = Box(
  { width: 40, padding: 2, border: true, flexDirection: "column", gap: 1 },
  usernameInput,
  LabeledInput({ id: "password", label: "Password:", placeholder: "Enter password..." }),
  Box(
    { flexDirection: "row", gap: 2 },
    Button({ content: "Login", onClick: () => console.log("Login clicked") }),
    Button({ content: "Cancel", onClick: () => console.log("Cancel clicked") })
  )
)

renderer.root.add(loginForm)
```

## React Integration

Build terminal UIs with React components and hooks using the @opentui/react package.

```tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot, useKeyboard, useRenderer, useTerminalDimensions, useTimeline } from "@opentui/react"
import { useState, useEffect } from "react"

function App() {
  const [count, setCount] = useState(0)
  const [focused, setFocused] = useState<"input1" | "input2">("input1")
  const { width, height } = useTerminalDimensions()
  const renderer = useRenderer()

  useKeyboard((key) => {
    if (key.name === "tab") {
      setFocused((prev) => (prev === "input1" ? "input2" : "input1"))
    }
    if (key.name === "escape") {
      renderer.destroy()
    }
  })

  useEffect(() => {
    const timer = setInterval(() => setCount((c) => c + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <box style={{ flexDirection: "column", padding: 2, gap: 1 }}>
      <text fg="#00FF00">Terminal: {width}x{height}</text>
      <text>Counter: {count}</text>

      <box title="Username" style={{ border: true, height: 3 }}>
        <input placeholder="Enter username..." focused={focused === "input1"} />
      </box>

      <box title="Password" style={{ border: true, height: 3 }}>
        <input placeholder="Enter password..." focused={focused === "input2"} />
      </box>

      <text fg="#888888">Press TAB to switch focus, ESC to exit</text>
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
```

## SolidJS Integration

Build reactive terminal UIs with SolidJS using the @opentui/solid package.

```tsx
import { render, useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/solid"
import { createSignal, For, Show, onMount } from "solid-js"

function App() {
  const [items, setItems] = createSignal(["Item 1", "Item 2", "Item 3"])
  const [selectedIndex, setSelectedIndex] = createSignal(0)
  const [inputValue, setInputValue] = createSignal("")
  const dimensions = useTerminalDimensions()
  const renderer = useRenderer()

  useKeyboard((key) => {
    if (key.name === "up") {
      setSelectedIndex((i) => Math.max(0, i - 1))
    } else if (key.name === "down") {
      setSelectedIndex((i) => Math.min(items().length - 1, i + 1))
    } else if (key.name === "escape") {
      renderer.destroy()
    }
  })

  const addItem = () => {
    if (inputValue().trim()) {
      setItems([...items(), inputValue()])
      setInputValue("")
    }
  }

  return (
    <box flexDirection="column" padding={2} gap={1}>
      <text>
        <span style={{ fg: "#00ff00" }}>Terminal:</span> {dimensions().width}x{dimensions().height}
      </text>

      <box border={true} title="Items" height={10} flexDirection="column">
        <For each={items()}>
          {(item, index) => (
            <text fg={index() === selectedIndex() ? "#00ff00" : "#ffffff"}>
              {index() === selectedIndex() ? "> " : "  "}{item}
            </text>
          )}
        </For>
      </box>

      <box flexDirection="row" gap={1}>
        <input
          placeholder="New item..."
          value={inputValue()}
          onInput={setInputValue}
          onSubmit={addItem}
          focused={true}
        />
      </box>

      <text fg="#666666">Use UP/DOWN arrows, ESC to exit</text>
    </box>
  )
}

render(App, { targetFps: 30 })
```

## Extending Components

Create custom components by extending OpenTUI's base renderables.

```tsx
import { BoxRenderable, OptimizedBuffer, RGBA, type BoxOptions, type RenderContext } from "@opentui/core"
import { createRoot, extend } from "@opentui/react"

// Custom button component
class ButtonRenderable extends BoxRenderable {
  private _label: string = "Button"
  private _hovered: boolean = false

  constructor(ctx: RenderContext, options: BoxOptions & { label?: string }) {
    super(ctx, {
      border: true,
      borderStyle: "single",
      minHeight: 3,
      ...options,
    })
    if (options.label) this._label = options.label
  }

  protected renderSelf(buffer: OptimizedBuffer): void {
    super.renderSelf(buffer)
    const centerX = this.x + Math.floor(this.width / 2 - this._label.length / 2)
    const centerY = this.y + Math.floor(this.height / 2)
    const color = this._hovered ? RGBA.fromHex("#00FF00") : RGBA.fromHex("#FFFFFF")
    buffer.drawText(this._label, centerX, centerY, color)
  }

  set label(value: string) {
    this._label = value
    this.requestRender()
  }
}

// Register component for React/Solid
declare module "@opentui/react" {
  interface OpenTUIComponents {
    consoleButton: typeof ButtonRenderable
  }
}

extend({ consoleButton: ButtonRenderable })

// Use in JSX
function App() {
  return (
    <box flexDirection="row" gap={2}>
      <consoleButton label="Save" style={{ backgroundColor: "#2563eb" }} />
      <consoleButton label="Cancel" style={{ backgroundColor: "#dc2626" }} />
    </box>
  )
}
```

## Console Overlay

Built-in console overlay that captures console output for debugging TUI applications.

```typescript
import { createCliRenderer, ConsolePosition } from "@opentui/core"

const renderer = await createCliRenderer({
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 40,
    colorInfo: "#00FFFF",
    colorWarn: "#FFFF00",
    colorError: "#FF0000",
    maxStoredLogs: 1000,
  },
})

// All console output is captured
console.log("Info message")
console.warn("Warning message")
console.error("Error message")
console.debug("Debug message")

// Toggle console visibility
renderer.console.toggle()

// Show/hide programmatically
renderer.console.show()
renderer.console.hide()

// Focus console for keyboard scrolling
renderer.console.focus()
```

## Summary

OpenTUI provides a comprehensive toolkit for building terminal user interfaces in TypeScript. The core package offers imperative APIs for direct control over renderables like Text, Box, Input, Select, ScrollBox, and Code components, all powered by the Yoga layout engine for flexible CSS-like positioning. The library includes robust keyboard and mouse handling, color management with RGBA, timeline-based animations, and a built-in debug console overlay.

For declarative development, OpenTUI integrates seamlessly with React and SolidJS through dedicated reconciler packages. Both frameworks support the same component set with familiar patterns like hooks for keyboard handling (`useKeyboard`), terminal dimensions (`useTerminalDimensions`), and animations (`useTimeline`). The extensible architecture allows creating custom renderables that work across all integration modes, making OpenTUI suitable for everything from simple interactive scripts to complex terminal applications like code editors and chat interfaces.
