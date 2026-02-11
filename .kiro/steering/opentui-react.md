---
inclusion: fileMatch
fileMatchPattern: ["*.js", "*.jsx", "*.ts", "*.tsx"]
---
# OpenTUI React Docs

## Overview
This doc is a comprehensive doc specifically for setting up a

### Basic React App with OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/react.mdx

A minimal React application that renders 'Hello, world!' to the terminal using OpenTUI's React bindings. It demonstrates the core setup for creating a TUI with React.

```tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"

function App() {
  return <text>Hello, world!</text>
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
```

--------------------------------

### Counter with Timer Example (React)

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

A simple counter component that increments a value every second using React's `useState` and `useEffect` hooks. It demonstrates basic state management and timer functionality within the OpenTUI React environment.

```tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { useEffect, useState } from "react"

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <box title="Counter" style={{ padding: 2 }}>
      <text fg="#00FF00">{`Count: ${count}`}</text>
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)

```

--------------------------------

### useKeyboard(handler, options?)

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

A hook for handling keyboard input within your OpenTUI React application.

```APIDOC
## useKeyboard(handler, options?)

### Description
Handles keyboard input events.

### Method
`useKeyboard`

### Parameters
#### Path Parameters
- None

#### Query Parameters
- None

#### Request Body
- **handler** (`function`) - Callback function to handle key presses.
- **options** (`object`, optional) - Configuration options for keyboard input.
```

--------------------------------

### Create React Root Renderer

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/react.mdx

Demonstrates how to create a React root renderer for OpenTUI. This function is essential for mounting your React application into the terminal environment.

```tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
```

--------------------------------

### render(element, config?)

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

Renders a React element to the terminal. This function is deprecated in favor of `createRoot`.

```APIDOC
## render(element, config?)

### Description
Renders a React element to the terminal. This function is deprecated in favor of `createRoot`.

### Method
`render`

### Endpoint
N/A (Deprecated function)

### Parameters
#### Path Parameters
- None

#### Query Parameters
- None

#### Request Body
- **element** (`ReactElement`) - The React element to render.
- **config** (`object`, optional) - Configuration options for rendering.
```

--------------------------------

### Display Styled Text with OpenTUI React

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

This example showcases how to render styled text within a terminal application using OpenTUI React. It demonstrates various text styles including bold, underline, and foreground color changes using HTML-like tags within the `<text>` component. Dependencies include `@opentui/core` and `@opentui/react`.

```tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"

function App() {
  return (
    <>
      <text>Simple text</text>
      <text>
        <strong>Bold text</strong>
      </text>
      <text>
        <u>Underlined text</u>
      </text>
      <text>
        <span fg="red">Red text</span>
      </text>
      <text>
        <span fg="blue">Blue text</span>
      </text>
      <text>
        <strong fg="red">Bold red text</strong>
      </text>
      <text>
        <strong>Bold</strong> and <span fg="blue">blue</span> combined
      </text>
    </>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)

```

--------------------------------

### Login Form Example (React)

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

A functional login form component built with OpenTUI's React bindings. It includes input fields for username and password, handles keyboard navigation using 'tab', and provides status feedback (idle, success, error).

```tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot, useKeyboard } from "@opentui/react"
import { useCallback, useState } from "react"

function App() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [focused, setFocused] = useState<"username" | "password">("username")
  const [status, setStatus] = useState("idle")

  useKeyboard((key) => {
    if (key.name === "tab") {
      setFocused((prev) => (prev === "username" ? "password" : "username"))
    }
  })

  const handleSubmit = useCallback(() => {
    if (username === "admin" && password === "secret") {
      setStatus("success")
    } else {
      setStatus("error")
    }
  }, [username, password])

  return (
    <box style={{ border: true, padding: 2, flexDirection: "column", gap: 1 }}>
      <text fg="#FFFF00">Login Form</text>

      <box title="Username" style={{ border: true, width: 40, height: 3 }}>
        <input
          placeholder="Enter username..."
          onInput={setUsername}
          onSubmit={handleSubmit}
          focused={focused === "username"}
        />
      </box>

      <box title="Password" style={{ border: true, width: 40, height: 3 }}>
        <input
          placeholder="Enter password..."
          onInput={setPassword}
          onSubmit={handleSubmit}
          focused={focused === "password"}
        />
      </box>

      <text
        style={{
          fg: status === "success" ? "green" : status === "error" ? "red" : "#999",
        }}
      >
        {status.toUpperCase()}
      </text>
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)

```

--------------------------------

### Line Number Component with Highlights and Diagnostics (React)

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

Renders code with line numbers, supports adding custom colors for diff highlights (added lines), and diagnostic indicators (warnings). It utilizes React hooks and OpenTUI's core components for rendering.

```tsx
import type { LineNumberRenderable } from "@opentui/core"
import { RGBA, SyntaxStyle } from "@opentui/core"
import { useEffect, useRef } from "react"

function App() {
  const lineNumberRef = useRef<LineNumberRenderable>(null)

  const syntaxStyle = SyntaxStyle.fromStyles({
    keyword: { fg: RGBA.fromHex("#C792EA") },
    string: { fg: RGBA.fromHex("#C3E88D") },
    number: { fg: RGBA.fromHex("#F78C6C") },
    default: { fg: RGBA.fromHex("#A6ACCD") },
  })

  const codeContent = `function fibonacci(n: number): number {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

console.log(fibonacci(10))`

  useEffect(() => {
    // Add diff highlight - line was added
    lineNumberRef.current?.setLineColor(1, "#1a4d1a")
    lineNumberRef.current?.setLineSign(1, { after: " +", afterColor: "#22c55e" })

    // Add diagnostic indicator
    lineNumberRef.current?.setLineSign(4, { before: "⚠️", beforeColor: "#f59e0b" })
  }, [])

  return (
    <box style={{ border: true, flexGrow: 1 }}>
      <line-number
        ref={lineNumberRef}
        fg="#6b7280"
        bg="#161b22"
        minWidth={3}
        paddingRight={1}
        showLineNumbers={true}
        width="100%"
        height="100%"
      >
        <code content={codeContent} filetype="typescript" syntaxStyle={syntaxStyle} width="100%" height="100%" />
      </line-number>
    </box>
  )
}

```

--------------------------------

### Install OpenTUI React CLI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/react.mdx

Installs the OpenTUI React template using the 'bun create tui' command. This is the quickest way to start a new React-based terminal UI project.

```bash
bun create tui --template react
```

--------------------------------

### Display Text with Text Component (React)

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

The Text component is used to render text content within an OpenTUI application. It supports simple text, rich text with child elements like `span`, and text modifiers such as bold, italic, and underline. This component is fundamental for displaying any textual information.

```tsx
function App() {
  return (
    <box>
      {/* Simple text */}
      <text>Hello World</text>

      {/* Rich text with children */}
      <text>
        <span fg="red">Red Text</span>
      </text>

      {/* Text modifiers */}
      <text>
        <strong>Bold</strong>, <em>Italic</em>, and <u>Underlined</u>
      </text>
    </box>
  )
}
```

--------------------------------

### Create Layouts with Box Component (React)

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

The Box component serves as a container for other UI elements, providing layout and styling capabilities. It supports features like borders, titles, padding, margins, and flexbox-based alignment. This component is essential for structuring the user interface.

```tsx
function App() {
  return (
    <box flexDirection="column">
      {/* Basic box */}
      <box border>
        <text>Simple box</text>
      </box>

      {/* Box with title and styling */}
      <box title="Settings" border borderStyle="double" padding={2} backgroundColor="blue">
        <text>Box content</text>
      </box>

      {/* Styled box */}
      <box
        style={{
          border: true,
          width: 40,
          height: 10,
          margin: 1,
          alignItems: "center",
          justifyContent: "center",
        }}>
        <text>Centered content</text>
      </box>
    </box>
  )
}
```

--------------------------------

### Handle Keyboard Events with useKeyboard Hook

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/react.mdx

Shows how to use the `useKeyboard` hook to capture and handle keyboard input within a React component. The example demonstrates exiting the application when the 'escape' key is pressed.

```tsx
import { useKeyboard } from "@opentui/react"

function App() {
  useKeyboard((key) => {
    if (key.name === "escape") {
      process.exit(0)
    }
  })

  return <text>Press ESC to exit</text>
}
```

--------------------------------

### useRenderer()

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

A React hook that provides access to the OpenTUI renderer instance within your functional components.

```APIDOC
## useRenderer()

### Description
Access the OpenTUI renderer instance.

### Method
`useRenderer`

### Parameters
- None

### Request Example
```tsx
import { useRenderer } from "@opentui/react"
import { useEffect } from "react"

function App() {
  const renderer = useRenderer()

  useEffect(() => {
    renderer.console.show()
    console.log("Hello, from the console!")
  }, [])

  return <box />
}
```

### Response
#### Success Response (200)
- **renderer** (`CliRenderer`) - The OpenTUI CLI renderer instance.
```

--------------------------------

### Create a Login Form with OpenTUI React

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/react.mdx

This example demonstrates how to create a functional login form using OpenTUI React. It utilizes state management for username, password, and focus, along with keyboard event handling for navigation and submission. The form provides visual feedback on the login status.

```tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot, useKeyboard } from "@opentui/react"
import { useCallback, useState } from "react"

function App() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [focused, setFocused] = useState<"username" | "password">("username")
  const [status, setStatus] = useState("idle")

  useKeyboard((key) => {
    if (key.name === "tab") {
      setFocused((prev) => (prev === "username" ? "password" : "username"))
    }
  })

  const handleSubmit = useCallback(() => {
    if (username === "admin" && password === "secret") {
      setStatus("success")
    } else {
      setStatus("error")
    }
  }, [username, password])

  return (
    <box style={{ border: true, padding: 2, flexDirection: "column", gap: 1 }}>
      <text fg="#FFFF00">Login Form</text>

      <box title="Username" style={{ border: true, width: 40, height: 3 }}>
        <input
          placeholder="Enter username..."
          onInput={setUsername}
          onSubmit={handleSubmit}
          focused={focused === "username"}
        />
      </box>

      <box title="Password" style={{ border: true, width: 40, height: 3 }}>
        <input
          placeholder="Enter password..."
          onInput={setPassword}
          onSubmit={handleSubmit}
          focused={focused === "password"}
        />
      </box>

      <text fg={status === "success" ? "green" : status === "error" ? "red" : "#999"}>{status.toUpperCase()}</text>
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
```

--------------------------------

### createRoot(renderer)

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

Creates a root for rendering a React tree with the given CLI renderer. This is the primary method for initializing your OpenTUI React application.

```APIDOC
## createRoot(renderer)

### Description
Creates a root for rendering a React tree with the given CLI renderer.

### Method
`createRoot`

### Parameters
#### Path Parameters
- None

#### Query Parameters
- None

#### Request Body
- None

### Request Example
```tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"

const renderer = await createCliRenderer({
  // Optional renderer configuration
  exitOnCtrlC: false,
})
createRoot(renderer).render(<App />)
```

### Response
#### Success Response (200)
- **rendererInstance** (`object`) - An object with a `render` method.

#### Response Example
```json
{
  "render": "function"
}
```
```

--------------------------------

### Integrate React DevTools with OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/react.mdx

This section outlines the steps to integrate React DevTools with an OpenTUI application for debugging purposes. It involves installing the `react-devtools-core` package, starting the DevTools server, and running the application with the `DEV=true` flag.

```bash
bun add --dev react-devtools-core@7
```

```bash
npx react-devtools@7
```

```bash
DEV=true bun run your-app.ts
```

--------------------------------

### Styling Components with Props and Style Prop

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/react.mdx

Illustrates two methods for styling OpenTUI React components: directly using props like `backgroundColor` and `padding`, or using the `style` prop with a CSS-like object.

```tsx
// Direct props
<box backgroundColor="blue" padding={2}>
  <text>Hello</text>
</box>

// Style prop
<box style={{ backgroundColor: "blue", padding: 2 }}>
  <text>Hello</text>
</box>
```

--------------------------------

### useTimeline(options?)

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

A hook for managing time-based animations or sequences within your OpenTUI React application.

```APIDOC
## useTimeline(options?)

### Description
Manages time-based animations or sequences.

### Method
`useTimeline`

### Parameters
#### Path Parameters
- None

#### Query Parameters
- None

#### Request Body
- **options** (`object`, optional) - Configuration options for the timeline.
```

--------------------------------

### Install OpenTUI React Manually

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/react.mdx

Manually installs the necessary OpenTUI React and core packages using bun. This is an alternative to using the create-tui command for existing projects.

```bash
bun install @opentui/react @opentui/core react
```

--------------------------------

### Select Component: Create a dropdown selection menu

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

The Select component renders a dropdown menu for choosing an option from a predefined list. Each option can have a name, description, and value. The component handles selection changes via the `onChange` prop, which provides the index and the selected option object. It supports focus and scroll indicators.

```tsx
import type { SelectOption } from "@opentui/core"
import { useState } from "react"

function App() {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const options: SelectOption[] = [
    { name: "Option 1", description: "Option 1 description", value: "opt1" },
    { name: "Option 2", description: "Option 2 description", value: "opt2" },
    { name: "Option 3", description: "Option 3 description", value: "opt3" },
  ]

  return (
    <box style={{ border: true, height: 24 }}>
      <select
        style={{ height: 22 }}
        options={options}
        focused={true}
        onChange={(index, option) => {
          setSelectedIndex(index)
          console.log("Selected:", option)
        }}
      />
    </box>
  )
}
```

--------------------------------

### Text Component

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

Displays text with rich formatting capabilities, including basic text, styled text with children, and text modifiers like bold, italic, and underline.

```APIDOC
## Text Component

### Description
Display text with rich formatting.

### Method
`<text>`

### Parameters
None

### Request Example
```tsx
function App() {
  return (
    <box>
      {/* Simple text */}
      <text>Hello World</text>

      {/* Rich text with children */}
      <text>
        <span fg="red">Red Text</span>
      </text>

      {/* Text modifiers */}
      <text>
        <strong>Bold</strong>, <em>Italic</em>, and <u>Underlined</u>
      </text>
    </box>
  )
}
```

### Response
None

#### Success Response (200)
None

#### Response Example
None
```

--------------------------------

### Box Component

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

A container component with support for borders, layout, styling, titles, and padding. It can be used to structure the UI and group other components.

```APIDOC
## Box Component

### Description
Container with borders and layout capabilities.

### Method
`<box>`

### Parameters
None

### Request Example
```tsx
function App() {
  return (
    <box flexDirection="column">
      {/* Basic box */}
      <box border>
        <text>Simple box</text>
      </box>

      {/* Box with title and styling */}
      <box title="Settings" border borderStyle="double" padding={2} backgroundColor="blue">
        <text>Box content</text>
      </box>

      {/* Styled box */}
      <box
        style={{
          border: true,
          width: 40,
          height: 10,
          margin: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <text>Centered content</text>
      </box>
    </box>
  )
}
```

### Response
None

#### Success Response (200)
None

#### Response Example
None
```

--------------------------------

### Handle Keyboard Events with useKeyboard Hook (React)

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

The useKeyboard hook allows components to handle keyboard input events. It accepts a handler function that receives KeyEvent objects and an optional options object to configure event types. By default, it only captures key press events, but setting `release: true` in options will also include key release events.

```tsx
import { useKeyboard } from "@opentui/react"

function App() {
  useKeyboard((key) => {
    if (key.name === "escape") {
      process.exit(0)
    }
  })

  return <text>Press ESC to exit</text>
}
```

```tsx
import { useKeyboard } from "@opentui/react"
import { useState } from "react"

function App() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())

  useKeyboard(
    (event) => {
      setPressedKeys((keys) => {
        const newKeys = new Set(keys)
        if (event.eventType === "release") {
          newKeys.delete(event.name)
        } else {
          newKeys.add(event.name)
        }
        return newKeys
      })
    },
    { release: true },
  )

  return (
    <box>
      <text>Currently pressed: {Array.from(pressedKeys).join(", ") || "none"}</text>
    </box>
  )
}
```

--------------------------------

### Install React DevTools for OpenTUI Debugging

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

This section provides instructions on how to set up and use React DevTools with OpenTUI applications for debugging. It involves installing the `react-devtools-core` package and running the application with the `DEV=true` environment variable. This enables real-time inspection and modification of component props directly in the terminal UI.

```bash
bun add --dev react-devtools-core@7

```

```bash
npx react-devtools@7

```

```bash
DEV=true bun run your-app.ts

```

--------------------------------

### Handle Terminal Resizes with useOnResize Hook (React)

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

The useOnResize hook provides a callback function that is executed whenever the terminal window is resized. This is useful for dynamically adjusting UI elements or re-rendering content based on new dimensions. It requires importing `useOnResize` and potentially `useRenderer` from `@opentui/react`.

```tsx
import { useOnResize, useRenderer } from "@opentui/react"
import { useEffect } from "react"

function App() {
  const renderer = useRenderer()

  useEffect(() => {
    renderer.console.show()
  }, [renderer])

  useOnResize((width, height) => {
    console.log(`Terminal resized to ${width}x${height}`)
  })

  return <text>Resize-aware component</text>
}
```

--------------------------------

### Animate System Monitor Stats with OpenTUI React

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

This snippet demonstrates how to create an animated system monitor using OpenTUI React. It utilizes the `useTimeline` hook for animations and displays CPU, memory, network, and disk usage with progress bars. Dependencies include `@opentui/core` and `@opentui/react`.

```tsx
import { createCliRenderer, TextAttributes } from "@opentui/core"
import { createRoot, useTimeline } from "@opentui/react"
import { useEffect, useState } from "react"

type Stats = {
  cpu: number
  memory: number
  network: number
  disk: number
}

export const App = () => {
  const [stats, setAnimatedStats] = useState<Stats>({
    cpu: 0,
    memory: 0,
    network: 0,
    disk: 0,
  })

  const timeline = useTimeline({
    duration: 3000,
    loop: false,
  })

  useEffect(() => {
    timeline.add(
      stats,
      {
        cpu: 85,
        memory: 70,
        network: 95,
        disk: 60,
        duration: 3000,
        ease: "linear",
        onUpdate: (values) => {
          setAnimatedStats({ ...values.targets[0] })
        },
      },
      0,
    )
  }, [])

  const statsMap = [
    { name: "CPU", key: "cpu", color: "#6a5acd" },
    { name: "Memory", key: "memory", color: "#4682b4" },
    { name: "Network", key: "network", color: "#20b2aa" },
    { name: "Disk", key: "disk", color: "#daa520" },
  ]

  return (
    <box
      title="System Monitor"
      style={{
        margin: 1,
        padding: 1,
        border: true,
        marginLeft: 2,
        marginRight: 2,
        borderStyle: "single",
        borderColor: "#4a4a4a",
      }}
    >
      {statsMap.map((stat) => (
        <box key={stat.key}>
          <box flexDirection="row" justifyContent="space-between">
            <text>{stat.name}</text>
            <text attributes={TextAttributes.DIM}>{Math.round(stats[stat.key as keyof Stats])}%</text>
          </box>
          <box style={{ backgroundColor: "#333333" }}>
            <box style={{ width: `${stats[stat.key as keyof Stats]}%`, height: 1, backgroundColor: stat.color }} />
          </box>
        </box>
      ))}
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)

```

--------------------------------

### Input Component: Create a text input field with event handling

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

The Input component provides a single-line text input field. It supports features like placeholders, focus management, and event handling for input changes (`onInput`) and submission (`onSubmit`). The `onInput` event updates a state variable with the current input value.

```tsx
import { useState } from "react"

function App() {
  const [value, setValue] = useState("")

  return (
    <box title="Enter your name" style={{ border: true, height: 3 }}>
      <input
        placeholder="Type here..."
        focused
        onInput={setValue}
        onSubmit={(value) => console.log("Submitted:", value)}
      />
    </box>
  )
}
```

--------------------------------

### TypeScript Configuration for OpenTUI React

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/react.mdx

Example tsconfig.json configuration for OpenTUI React projects. It specifies necessary compiler options like JSX handling and module resolution for a seamless development experience.

```json
{
  "compilerOptions": {
    "lib": ["ESNext", "DOM"],
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "jsxImportSource": "@opentui/react",
    "strict": true,
    "skipLibCheck": true
  }
}
```

--------------------------------

### useOnResize(callback)

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

A hook that registers a callback function to be executed when the terminal is resized.

```APIDOC
## useOnResize(callback)

### Description
Registers a callback to be executed when the terminal is resized.

### Method
`useOnResize`

### Parameters
#### Path Parameters
- None

#### Query Parameters
- None

#### Request Body
- **callback** (`function`) - The function to call on resize.
```

--------------------------------

### OpenTUI React Hooks

Source: https://context7.com/anomalyco/opentui/llms.txt

Details the various React hooks provided by OpenTUI for common terminal interactions. This includes accessing the renderer, getting terminal dimensions, handling keyboard and key release events, responding to resize events, and managing animation timelines.

```tsx
import {
  useKeyboard,
  useRenderer,
  useResize,
  useTerminalDimensions,
  useTimeline,
} from "@opentui/react"

const MyComponent = () => {
  // Access the renderer instance
  const renderer = useRenderer()

  // Get terminal dimensions (reactive)
  const { width, height } = useTerminalDimensions()

  // Handle keyboard events
  useKeyboard((key) => {
    if (key.name === "q") {
      renderer?.destroy()
    }
  })

  // Handle key release events too
  useKeyboard(
    (key) => {
      if (key.eventType === "release") {
        console.log("Key released:", key.name)
      }
    },
    { release: true }
  )

  // Listen for resize events
  useResize((newWidth, newHeight) => {
    console.log(`Resized to ${newWidth}x${newHeight}`)
  })

  // Animation timeline
  const timeline = useTimeline({ duration: 2000, loop: true })

  return (
    <box style={{ width: "100%", height: "100%" }}>
      <text content={`Terminal: ${width}x${height}`} />
      <text content={`Animation: ${timeline.progress.toFixed(2)}`} />
    </box>
  )
}
```

--------------------------------

### Handle Terminal Resize Events with useOnResize

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/react.mdx

Demonstrates the `useOnResize` hook for responding to terminal resize events. The provided callback function receives the new width and height of the terminal, enabling responsive UI adjustments.

```tsx
import { useOnResize } from "@opentui/react"

function App() {
  useOnResize((width, height) => {
    console.log(`Resized to ${width}x${height}`)
  })

  return <text>Resize-aware component</text>
}
```

--------------------------------

### Use OpenTUI Renderer Hook

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/react.mdx

Example of using the `useRenderer` hook in a React component to access the OpenTUI renderer instance. This allows direct interaction with the terminal rendering capabilities within your component.

```tsx
import { useRenderer } from "@opentui/react"
import { useEffect } from "react"

function App() {
  const renderer = useRenderer()

  useEffect(() => {
    renderer.console.show()
    console.log("Hello from console!")
  }, [])

  return <box />
}
```

--------------------------------

### Code Component: Display syntax-highlighted code snippets

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

The Code component is used to display code snippets with syntax highlighting. It accepts the code content, file type for language-specific highlighting, and a custom `syntaxStyle` object to define the colors and styles for different code elements like keywords, strings, and comments.

```tsx
import { RGBA, SyntaxStyle } from "@opentui/core"

const syntaxStyle = SyntaxStyle.fromStyles({
  keyword: { fg: RGBA.fromHex("#ff6b6b"), bold: true }, // red, bold
  string: { fg: RGBA.fromHex("#51cf66") }, // green
  comment: { fg: RGBA.fromHex("#868e96"), italic: true }, // gray, italic
  number: { fg: RGBA.fromHex("#ffd43b") }, // yellow
  default: { fg: RGBA.fromHex("#ffffff") }, // white
})

const codeExample = `function hello() {
  // This is a comment

  const message = "Hello, world!"
  const count = 42

  return message + " " + count
}`

function App() {
  return (
    <box style={{ border: true, flexGrow: 1 }}>
      <code content={codeExample} filetype="javascript" syntaxStyle={syntaxStyle} />
    </box>
  )
}
```

--------------------------------

### Create and Manage Animations with useTimeline

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/react.mdx

Example of using the `useTimeline` hook to create and manage animations within a React TUI. It shows how to define animation properties, durations, easing, and update callbacks.

```tsx
import { useTimeline } from "@opentui/react"
import { useEffect, useState } from "react"

function App() {
  const [width, setWidth] = useState(0)

  const timeline = useTimeline({
    duration: 2000,
    loop: false,
  })

  useEffect(() => {
    timeline.add(
      { width },
      {
        width: 50,
        duration: 2000,
        ease: "linear",
        onUpdate: (animation) => {
          setWidth(animation.targets[0].width)
        },
      },
    )
  }, [])

  return <box style={{ width, backgroundColor: "#6a5acd" }} />
}
```

--------------------------------

### useTerminalDimensions()

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

A hook that returns the current dimensions (width and height) of the terminal.

```APIDOC
## useTerminalDimensions()

### Description
Returns the current dimensions of the terminal.

### Method
`useTerminalDimensions`

### Parameters
- None

### Response
#### Success Response (200)
- **dimensions** (`object`) - An object containing `width` and `height` properties.
  - **width** (`number`) - The current width of the terminal.
  - **height** (`number`) - The current height of the terminal.
```

--------------------------------

### Extend OpenTUI React Components with Custom Renderable Class (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/docs/EXTEND.md

This snippet demonstrates how to define a custom renderable component, `ConsoleButton`, extending `BoxRenderable`. It initializes custom properties, overrides the rendering logic to display text, and then extends the OpenTUI component catalogue with this new component for use in JSX. Full TypeScript support is achieved through module augmentation.

```tsx
import { BoxRenderable, OptimizedBuffer, RGBA, type BoxOptions, type RenderContext } from "@opentui/core"
import { extend, render } from "@opentui/react"

class ConsoleButton extends BoxRenderable {
  public label: string = "Button"

  constructor(ctx: RenderContext, options: BoxOptions & { label: string }) {
    super(ctx, options)
    // Custom initialization

    this.height = 3
    this.width = 24
  }

  protected renderSelf(buffer: OptimizedBuffer): void {
    super.renderSelf(buffer)

    const centerX = this.x + Math.floor(this.width / 2 - this.label.length / 2)
    const centerY = this.y + Math.floor(this.height / 2)

    buffer.drawText(this.label, centerX, centerY, RGBA.fromInts(255, 255, 255, 255))
  }
}

declare module "@opentui/react" {
  interface OpenTUIComponents {
    consoleButton: typeof ConsoleButton
  }
}

// Extend components
extend({
  consoleButton: ConsoleButton,
})

// Now you can use them in JSX
function App() {
  return <consoleButton label="Click me!" />
}

```

--------------------------------

### Textarea Component: Implement a multi-line text editor

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

The Textarea component enables multi-line text input, functioning as an interactive editor. It integrates with keyboard events to capture input and allows retrieval of the plain text content via a ref. The component also utilizes hooks for keyboard input and rendering management.

```tsx
import type { TextareaRenderable } from "@opentui/core"
import { useKeyboard, useRenderer } from "@opentui/react"
import { useEffect, useRef } from "react"

function App() {
  const renderer = useRenderer()
  const textareaRef = useRef<TextareaRenderable>(null)

  useEffect(() => {
    renderer.console.show()
  }, [renderer])

  useKeyboard((key) => {
    if (key.name === "return") {
      console.log(textareaRef.current?.plainText)
    }
  })

  return (
    <box title="Interactive Editor" style={{ border: true, flexGrow: 1 }}>
      <textarea ref={textareaRef} placeholder="Type here..." focused />
    </box>
  )
}
```

--------------------------------

### Accessing OpenTUI Renderer Instance with useRenderer Hook

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

Demonstrates the usage of the `useRenderer` hook within a React component to gain access to the OpenTUI renderer instance. This allows direct interaction with the renderer, such as controlling console visibility or logging messages.

```tsx
import { useRenderer } from "@opentui/react"

function App() {
  const renderer = useRenderer()

  useEffect(() => {
    renderer.console.show()
    console.log("Hello, from the console!")
  }, [])

  return <box />
}
```

--------------------------------

### Initializing OpenTUI CLI Renderer

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

Shows how to create an OpenTUI CLI renderer instance, optionally configuring it with parameters like `exitOnCtrlC`. This renderer is then used with `createRoot` to render React components in the terminal.

```tsx
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"

const renderer = await createCliRenderer({
  // Optional renderer configuration
  exitOnCtrlC: false,
})
createRoot(renderer).render(<App />)
```

--------------------------------

### ASCII Font Component: Display text with different ASCII art fonts

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

The ASCII Font component renders text using various predefined ASCII art font styles. It allows users to select a font from a list, dynamically changing the appearance of the displayed text. This component is useful for creating stylized text elements in a terminal UI.

```tsx
import { useState } from "react"

function App() {
  const text = "ASCII"
  const [font, setFont] = useState<"block" | "shade" | "slick" | "tiny">("tiny")

  return (
    <box style={{ border: true, paddingLeft: 1, paddingRight: 1 }}>
      <box
        style={{
          height: 8,
          border: true,
          marginBottom: 1,
        }}
      >
        <select
          focused
          onChange={(_, option) => setFont(option?.value)}
          showScrollIndicator
          options={[
            {
              name: "Tiny",
              description: "Tiny font",
              value: "tiny",
            },
            {
              name: "Block",
              description: "Block font",
              value: "block",
            },
            {
              name: "Slick",
              description: "Slick font",
              value: "slick",
            },
            {
              name: "Shade",
              description: "Shade font",
              value: "shade",
            },
          ]}
          style={{ flexGrow: 1 }}
        />
      </box>

      <ascii-font text={text} font={font} />
    </box>
  )
}
```

--------------------------------

### Extend OpenTUI Components for Custom UI Elements

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

This snippet illustrates how to extend OpenTUI's base renderables to create custom components, such as a 'Button'. It defines a `ButtonRenderable` class that inherits from `BoxRenderable` and adds custom rendering logic for a label. The example also shows how to register and use this custom component within JSX. Dependencies include `@opentui/core` and `@opentui/react`.

```tsx
import {
  BoxRenderable,
  createCliRenderer,
  OptimizedBuffer,
  RGBA,
  type BoxOptions,
  type RenderContext,
} from "@opentui/core"
import { createRoot, extend } from "@opentui/react"

// Create custom component class
class ButtonRenderable extends BoxRenderable {
  private _label: string = "Button"

  constructor(ctx: RenderContext, options: BoxOptions & { label?: string }) {
    super(ctx, {
      border: true,
      borderStyle: "single",
      minHeight: 3,
      ...options,
    })

    if (options.label) {
      this._label = options.label
    }
  }

  protected renderSelf(buffer: OptimizedBuffer): void {
    super.renderSelf(buffer)

    const centerX = this.x + Math.floor(this.width / 2 - this._label.length / 2)
    const centerY = this.y + Math.floor(this.height / 2)

    buffer.drawText(this._label, centerX, centerY, RGBA.fromInts(255, 255, 255, 255))
  }

  set label(value: string) {
    this._label = value
    this.requestRender()
  }
}

// Add TypeScript support
declare module "@opentui/react" {
  interface OpenTUIComponents {
    consoleButton: typeof ButtonRenderable
  }
}

// Register the component
extend({ consoleButton: ButtonRenderable })

// Use in JSX
function App() {
  return (
    <box>
      <consoleButton label="Click me!" style={{ backgroundColor: "blue" }} />
      <consoleButton label="Another button" style={{ backgroundColor: "green" }} />
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)

```

--------------------------------

### Get Terminal Dimensions with useTerminalDimensions Hook (React)

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

The useTerminalDimensions hook returns the current width and height of the terminal. It automatically updates these values when the terminal is resized, making it easy to create responsive layouts. The hook returns an object with `width` and `height` properties.

```tsx
import { useTerminalDimensions } from "@opentui/react"

function App() {
  const { width, height } = useTerminalDimensions()

  return (
    <box>
      <text>
        Terminal dimensions: {width}x{height}
      </text>
      <box style={{ width: Math.floor(width / 2), height: Math.floor(height / 3) }}>
        <text>Half-width, third-height box</text>
      </box>
    </box>
  )
}
```

--------------------------------

### Handle Keyboard Release Events

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/react.mdx

An advanced usage of the `useKeyboard` hook to specifically handle key release events. This allows for more granular control over user input, differentiating between key presses and releases.

```tsx
useKeyboard(
  (event) => {
    if (event.eventType === "release") {
      console.log("Key released:", event.name)
    } else {
      console.log("Key pressed:", event.name)
    }
  },
  { release: true },
)
```

--------------------------------

### React Integration with OpenTUI createRoot

Source: https://context7.com/anomalyco/opentui/llms.txt

Illustrates integrating React components into terminal UIs using OpenTUI's `createRoot` API. This example demonstrates using hooks like `useKeyboard` and `useRenderer`, managing state, and rendering basic UI elements with styling and input handling.

```tsx
import { createCliRenderer, TextAttributes } from "@opentui/core"
import { createRoot, useKeyboard, useRenderer } from "@opentui/react"
import { useState, useCallback } from "react"

const App = () => {
  const renderer = useRenderer()
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState("idle")

  useKeyboard((key) => {
    if (key.name === "space") {
      setCount((c) => c + 1)
    }
    if (key.ctrl && key.name === "k") {
      renderer?.console.toggle()
    }
    if (key.ctrl && key.name === "c") {
      renderer?.destroy()
    }
  })

  return (
    <box style={{ padding: 2, flexDirection: "column", gap: 1 }}>
      <text
        content="React + OpenTUI Demo"
        style={{ fg: "#00FF00", attributes: TextAttributes.BOLD }}
      />
      <text content={`Count: ${count}`} style={{ fg: "#FFFF00" }} />
      <text content="Press SPACE to increment" style={{ fg: "#888888" }} />

      <box
        title="Input"
        style={{ border: true, width: 40, height: 3, marginTop: 1 }}
      >
        <input
          placeholder="Type something..."
          onInput={(value) => console.log("Input:", value)}
          onSubmit={(value) => setStatus(`Submitted: ${value}`)}
          focused={true}
          style={{ focusedBackgroundColor: "#1a1a1a" }}
        />
      </box>

      <text content={status} style={{ fg: "#00AAFF" }} />
    </box>
  )
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
```

--------------------------------

### Manage Animations with useTimeline Hook (React)

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

The useTimeline hook facilitates the creation and management of animations within OpenTUI applications. It automatically handles the registration and unregistration of timelines with the animation engine. The hook accepts an optional `TimelineOptions` object for configuration and returns a `Timeline` instance with methods to control playback.

```tsx
import { useTimeline } from "@opentui/react"
import { useEffect, useState } from "react"

function App() {
  const [width, setWidth] = useState(0)

  const timeline = useTimeline({
    duration: 2000,
    loop: false,
  })

  useEffect(() => {
    timeline.add(
      {
        width,
      },
      {
        width: 50,
        duration: 2000,
        ease: "linear",
        onUpdate: (animation) => {
          setWidth(animation.targets[0].width)
        },
      },
    )
  }, [])

  return <box style={{ width, backgroundColor: "#6a5acd" }} />
}
```

--------------------------------

### Scrollbox Component: Create a scrollable box with custom styling

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

The Scrollbox component allows for creating scrollable containers. It accepts various style options to customize the appearance of the root, wrapper, viewport, content, and scrollbar. The scrollbar can be configured to show arrows and customize track colors.

```tsx
function App() {
  return (
    <scrollbox
      style={{
        rootOptions: {
          backgroundColor: "#24283b",
        },
        wrapperOptions: {
          backgroundColor: "#1f2335",
        },
        viewportOptions: {
          backgroundColor: "#1a1b26",
        },
        contentOptions: {
          backgroundColor: "#16161e",
        },
        scrollbarOptions: {
          showArrows: true,
          trackOptions: {
            foregroundColor: "#7aa2f7",
            backgroundColor: "#414868",
          },
        },
      }}
      focused
    >
      {Array.from({ length: 1000 }).map((_, i) => (
        <box
          key={i}
          style={{ width: "100%", padding: 1, marginBottom: 1, backgroundColor: i % 2 === 0 ? "#292e42" : "#2f3449" }}
        >
          <text content={`Box ${i}`} />
        </box>
      ))}
    </scrollbox>
  )
}
```

--------------------------------

### Get Reactive Terminal Dimensions with useTerminalDimensions

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/react.mdx

Utilizes the `useTerminalDimensions` hook to get the current terminal width and height. This hook provides reactive updates, so your component automatically re-renders when the terminal size changes.

```tsx
import { useTerminalDimensions } from "@opentui/react"

function App() {
  const { width, height } = useTerminalDimensions()

  return (
    <text>
      Terminal: {width}x{height}
    </text>
  )
}
```

--------------------------------

### Extend React Components with Custom Renderables

Source: https://context7.com/anomalyco/opentui/llms.txt

This snippet demonstrates how to extend the OpenTUI component catalogue by creating a custom renderable component in React. It shows the process of defining a new class that extends `Renderable`, implementing custom initialization and rendering logic, and then registering this new component using the `extend` function for use within JSX.

```tsx
import { Renderable, type RenderContext, type RenderableOptions } from "@opentui/core"
import { extend } from "@opentui/react"

// Create a custom renderable
class CustomButtonRenderable extends Renderable {
  constructor(ctx: RenderContext, options: RenderableOptions) {
    super(ctx, options)
    // Custom initialization
  }

  protected renderSelf(buffer: any, deltaTime: number): void {
    // Custom rendering logic
  }
}

// Register custom components
extend({
  "custom-button": CustomButtonRenderable,
})

// Use in JSX (after extending)
const App = () => (
  <box>
    <custom-button id="my-button" width={20} height={3} />
  </box>
)
```

--------------------------------

### Extend OpenTUI Components with Custom Renderables

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/react.mdx

This example shows how to extend OpenTUI with custom renderable components, allowing them to be used as JSX elements. It defines a `ConsoleButtonRenderable` class that inherits from `BoxRenderable` and registers it using the `extend` function. This enables the creation of custom UI elements within the OpenTUI framework.

```tsx
import { BoxRenderable, createCliRenderer, type BoxOptions, type RenderContext } from "@opentui/core"
import { createRoot, extend } from "@opentui/react"

class ConsoleButtonRenderable extends BoxRenderable {
  private _label: string = "Button"

  constructor(ctx: RenderContext, options: BoxOptions & { label?: string }) {
    super(ctx, options)
    if (options.label) this._label = options.label
    this.borderStyle = "single"
    this.padding = 2
  }

  get label(): string {
    return this._label
  }

  set label(value: string) {
    this._label = value
    this.requestRender()
  }
}

// Add TypeScript support
declare module "@opentui/react" {
  interface OpenTUIComponents {
    consoleButton: typeof ConsoleButtonRenderable
  }
}

// Register the component
extend({ consoleButton: ConsoleButtonRenderable })

// Use in JSX
function App() {
  return <consoleButton label="Click me!" style={{ border: true, backgroundColor: "green" }} />
}

const renderer = await createCliRenderer()
createRoot(renderer).render(<App />)
```

--------------------------------

### useTimeline Hook

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/README.md

Creates and manages animations using OpenTUI's timeline system. This hook automatically registers and unregisters the timeline with the animation engine.

```APIDOC
## useTimeline(options?)

### Description
Create and manage animations using OpenTUI's timeline system. This hook automatically registers and unregisters the timeline with the animation engine.

### Method
`useTimeline`

### Parameters
#### Path Parameters
None

#### Query Parameters
None

#### Request Body
None

### Parameters
- **options?** (object) - Optional `TimelineOptions` object with properties:
  - **duration?** (number) - Animation duration in milliseconds (default: 1000).
  - **loop?** (boolean) - Whether the timeline should loop (default: false).
  - **autoplay?** (boolean) - Whether to automatically start the timeline (default: true).
  - **onComplete?** (function) - Callback when timeline completes.
  - **onPause?** (function) - Callback when timeline is paused.

### Request Example
```tsx
import { useTimeline } from "@opentui/react"
import { useEffect, useState } from "react"

function App() {
  const [width, setWidth] = useState(0)

  const timeline = useTimeline({
    duration: 2000,
    loop: false,
  })

  useEffect(() => {
    timeline.add(
      {
        width,
      },
      {
        width: 50,
        duration: 2000,
        ease: "linear",
        onUpdate: (animation) => {
          setWidth(animation.targets[0].width)
        },
      },
    )
  }, [])

  return <box style={{ width, backgroundColor: "#6a5acd" }} />
}
```

### Response
#### Success Response (200)
- **Timeline instance** - An object with methods:
  - `add(target, properties, startTime)`: Add animation to timeline.
  - `play()`: Start the timeline.
  - `pause()`: Pause the timeline.
  - `restart()`: Restart the timeline from beginning.

#### Response Example
```json
{
  "add": "function",
  "play": "function",
  "pause": "function",
  "restart": "function"
}
```
```

--------------------------------

### TypeScript Module Augmentation for OpenTUI Components

Source: https://github.com/anomalyco/opentui/blob/main/packages/react/docs/EXTEND.md

This snippet illustrates how to augment the `OpenTUIComponents` interface in TypeScript to include custom components. This allows for type safety and autocompletion when using extended components in JSX. It's a prerequisite for full TypeScript support when using the `extend` function.

```tsx
// In your component file or declaration file
declare module "@opentui/react" {
  interface OpenTUIComponents {
    consoleButton: typeof ConsoleButton
  }
}

// Then extend and use with full type safety
extend({
  consoleButton: ConsoleButton,
})

// TypeScript will now know about these components
<consoleButton label="Typed!" />

```

--------------------------------

### Install OpenTUI Core and Bindings

Source: https://context7.com/anomalyco/opentui/llms.txt

Installs the core OpenTUI library and optional framework bindings for React and SolidJS using the bun package manager.

```bash
# Install core library
bun install @opentui/core

# Install React bindings (optional)
bun install @opentui/react

# Install SolidJS bindings (optional)
bun install @opentui/solid
```

--------------------------------

### Create and manage animations with useTimeline hook

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

The `useTimeline` hook from `@opentui/solid` allows for the creation and management of animations within a SolidJS application. It accepts an options object for duration and looping, and provides methods to add animation sequences. The `onUpdate` callback can be used to react to animation progress.

```tsx
import { useTimeline } from "@opentui/solid"
import { createSignal, onMount } from "solid-js"

const App = () => {
  const [width, setWidth] = createSignal(0)

  const timeline = useTimeline({
    duration: 2000,
    loop: false,
  })

  onMount(() => {
    timeline.add(
      { width: width() },
      {
        width: 50,
        duration: 2000,
        ease: "linear",
        onUpdate: (animation) => {
          setWidth(animation.targets[0].width)
        },
      },
    )
  })

  return <box style={{ width: width(), backgroundColor: "#6a5acd" }} />
}
```

--------------------------------

### Basic Select Usage with Renderable API (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/select.mdx

Demonstrates how to create and configure a Select component using the Renderable API in TypeScript. It initializes a renderer, creates a SelectRenderable instance with options, attaches an event listener for item selection, and focuses the component.

```typescript
import { SelectRenderable, SelectRenderableEvents, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const menu = new SelectRenderable(renderer, {
  id: "menu",
  width: 30,
  height: 8,
  options: [
    { name: "New File", description: "Create a new file" },
    { name: "Open File", description: "Open an existing file" },
    { name: "Save", description: "Save current file" },
    { name: "Exit", description: "Exit the application" },
  ],
})

menu.on(SelectRenderableEvents.ITEM_SELECTED, (index, option) => {
  console.log("Selected:", option.name)
})

menu.focus()
renderer.root.add(menu)
```

--------------------------------

### Render TabSelect Component (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/tab-select.mdx

Demonstrates how to create and render a TabSelect component using the Renderable API. It initializes a renderer, defines tabs with names and descriptions, and attaches an event listener for item selection. The component is then focused and added to the renderer's root.

```typescript
import { TabSelectRenderable, TabSelectRenderableEvents, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const tabs = new TabSelectRenderable(renderer, {
  id: "tabs",
  width: 60,
  options: [
    { name: "Home", description: "Dashboard and overview" },
    { name: "Files", description: "File management" },
    { name: "Settings", description: "Application settings" },
  ],
  tabWidth: 20,
})

tabs.on(TabSelectRenderableEvents.ITEM_SELECTED, (index, option) => {
  console.log("Tab selected:", option.name)
})

tabs.focus()
renderer.root.add(tabs)
```

--------------------------------

### Render Code with Tree-sitter - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/code.mdx

Renders syntax-highlighted code using the CodeRenderable API. It requires a renderer instance, content, filetype, and an optional syntax style. The width and height define the component's dimensions.

```typescript
import { CodeRenderable, createCliRenderer, SyntaxStyle, RGBA } from "@opentui/core"

const renderer = await createCliRenderer()

const syntaxStyle = SyntaxStyle.fromStyles({
  keyword: { fg: RGBA.fromHex("#FF7B72"), bold: true },
  string: { fg: RGBA.fromHex("#A5D6FF") },
  comment: { fg: RGBA.fromHex("#8B949E"), italic: true },
  number: { fg: RGBA.fromHex("#79C0FF") },
  function: { fg: RGBA.fromHex("#D2A8FF") },
  default: { fg: RGBA.fromHex("#E6EDF3") },
})

const code = new CodeRenderable(renderer, {
  id: "code",
  content: `function hello() {
  // This is a comment
  const message = "Hello, world!"
  return message
}`,
  filetype: "javascript",
  syntaxStyle,
  width: 50,
  height: 10,
})

renderer.root.add(code)
```

--------------------------------

### Render Input Field using Renderable API - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/input.mdx

Demonstrates how to create and render an input field using the InputRenderable API from OpenTUI. It includes setting an ID, width, placeholder, and handling the change event. The input is then focused and added to the renderer's root.

```typescript
import { InputRenderable, InputRenderableEvents, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const input = new InputRenderable(renderer, {
  id: "name-input",
  width: 25,
  placeholder: "Enter your name...",
})

input.on(InputRenderableEvents.CHANGE, (value) => {
  console.log("Input value:", value)
})

input.focus()
renderer.root.add(input)
```

--------------------------------

### Render OpenTUI Component with Solid.js

Source: https://github.com/anomalyco/opentui/blob/main/packages/solid/README.md

Demonstrates the basic usage of the `render` function from OpenTUI's Solid.js integration to render a simple 'Hello, World!' text component. This is the fundamental step for displaying UI elements in the terminal using OpenTUI and Solid.js.

```tsx
import { render } from "@opentui/solid"

render(() => <text>Hello, World!</text>)
```

--------------------------------

### API: Render OpenTUI Component Tree

Source: https://github.com/anomalyco/opentui/blob/main/packages/solid/README.md

Illustrates the usage of the `render` function from `@opentui/solid`. This function takes a Solid component tree (as a function returning a JSX element) and renders it into a CLI using a specified or default renderer.

```tsx
import { render } from "@opentui/solid"

render(() => <App />)
```

--------------------------------

### Render children into a different mount point with Portal component

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

The `Portal` component from `@opentui/solid` enables rendering its children into a specified mount point, which is particularly useful for modals and overlays. It requires a `mount` prop, typically obtained from `useRenderer()`, to define where the portal's content should be attached.

```tsx
import { Portal, useRenderer } from "@opentui/solid"

const App = () => {
  const renderer = useRenderer()

  return (
    <box>
      <text>Main content</text>
      <Portal mount={renderer.root}>
        <box border>Overlay</box>
      </Portal>
    </box>
  )
}
```

--------------------------------

### Imperative Login Form with TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/renderables-vs-constructs.md

Builds a login form by imperatively creating and composing Box, Text, and Input Renderables. State and behavior are managed directly on instances. Focus management requires explicit targeting of child renderables.

```typescript
import { BoxRenderable, TextRenderable, InputRenderable, createCliRenderer, type RenderContext } from "@opentui/core"

const renderer = await createCliRenderer()

const loginForm = new BoxRenderable(renderer, {
  id: "login-form",
  width: 20,
  height: 10,
  padding: 1,
})

// Compose renderables to a single renderable.
// Needs a RendererContext at creation time.
function createLabeledInput(renderer: RenderContext, props: { label: string; placeholder: string; id: string }) {
  const labeledInput = new BoxRenderable(renderer, {
    id: `${props.id}-labeled-input`,
    flexDirection: "row",
    backgroundColor: "gray",
  })

  labeledInput.add(
    new TextRenderable(renderer, {
      id: `${props.id}-label`,
      content: props.label + " ",
    }),
  )
  labeledInput.add(
    new InputRenderable(renderer, {
      id: `${props.id}-input`,
      placeholder: props.placeholder,
      backgroundColor: "white",
      textColor: "black",
      cursorColor: "blue",
      focusedBackgroundColor: "orange",
      width: 20,
    }),
  )

  return labeledInput
}

const labeledUsername = createLabeledInput(renderer, {
  id: "username",
  label: "Username:",
  placeholder: "Enter your username...",
})
loginForm.add(labeledUsername)

// Now it becomse difficult to focus. because it is in a container.
// This does not work:
labeledUsername.focus()

// Needs to be:
labeledUsername.getRenderable("username-input")?.focus()

const labeledPassword = createLabeledInput(renderer, {
  id: "password",
  label: "Password:",
  placeholder: "Enter your password...",
})
loginForm.add(labeledPassword)

// Compose a button component
function createButton(props: { content: string; onClick: () => void; id: string }) {
  const box = new BoxRenderable(renderer, {
    id: `${props.id}-button`,
    border: true,
    backgroundColor: "gray",
    onMouseDown: props.onClick,
  })
  const text = new TextRenderable(renderer, {
    id: `${props.id}-button-text`,
    content: props.content,
    selectable: false,
  })
  box.add(text)
  return box
}

const buttons = new BoxRenderable(renderer, {
  id: "buttons",
  flexDirection: "row",
  padding: 1,
  width: 20,
})
buttons.add(createButton({ id: "register", content: "Register", onClick: () => {} }))
buttons.add(createButton({ id: "login", content: "Login", onClick: () => {} }))
loginForm.add(buttons)

renderer.root.add(loginForm)

```

--------------------------------

### Create Box with Renderable API - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/box.mdx

Demonstrates how to create a Box component using the Renderable API in TypeScript. This method involves instantiating BoxRenderable and adding it to the renderer's root. It's suitable for dynamic UI updates.

```typescript
import { BoxRenderable, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const panel = new BoxRenderable(renderer, {
  id: "panel",
  width: 30,
  height: 10,
  backgroundColor: "#333366",
  borderStyle: "double",
  borderColor: "#FFFFFF",
})

renderer.root.add(panel)
```

--------------------------------

### API: Dynamic Component Rendering

Source: https://github.com/anomalyco/opentui/blob/main/packages/solid/README.md

Demonstrates the `Dynamic` component from `@opentui/solid`, which enables the dynamic rendering of arbitrary intrinsic elements or components. This is useful for scenarios where the component type needs to be determined at runtime, such as switching between an input and a textarea.

```tsx
import { Dynamic } from "@opentui/solid"
;<Dynamic component={isMultiline() ? "textarea" : "input"} />
```

--------------------------------

### Handling Selection Changed Event (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/select.mdx

Demonstrates how to handle the `SELECTION_CHANGED` event for the Select component in TypeScript. This event is triggered whenever the currently highlighted item changes, allowing for real-time updates or previews based on the highlighted option.

```typescript
menu.on(SelectRenderableEvents.SELECTION_CHANGED, (index: number, option: SelectOption) => {
  console.log(`Highlighted: ${option.name}`)
  // Update a preview pane, for example
})
```

--------------------------------

### Dynamically render intrinsic elements or components with Dynamic

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

The `Dynamic` component from `@opentui/solid` facilitates the dynamic rendering of arbitrary intrinsic elements or components. By passing a component or element type to the `component` prop, developers can conditionally render different UI structures based on application state.

```tsx
import { Dynamic } from "@opentui/solid"
import { createSignal } from "solid-js"

const App = () => {
  const [isMultiline, setIsMultiline] = createSignal(false)

  return <Dynamic component={isMultiline() ? "textarea" : "input"} />
}
```

--------------------------------

### Implement Buffered Rendering for Complex Content

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables.mdx

Utilize buffered rendering by setting `buffered: true` to render complex content offscreen first. The `renderAfter` hook allows direct drawing to the buffer.

```typescript
import { RGBA } from "@opentui/core"

const complex = new BoxRenderable(renderer, {
  id: "complex",
  buffered: true, // Render to offscreen buffer first
  renderAfter: (buffer) => {
    // Draw directly to the buffer (or offscreen buffer if buffered=true)
    buffer.fillRect(0, 0, 10, 5, RGBA.fromHex("#FF0000"))
  },
})
```

--------------------------------

### Styling the Select Component (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/select.mdx

Provides an example of how to apply custom styling to the Select component using various color properties in TypeScript. This allows for visual customization of the component's background, text, and selected item appearances.

```typescript
const styledMenu = new SelectRenderable(renderer, {
  id: "styled-menu",
  width: 40,
  height: 10,
  options: [...],
  backgroundColor: "#1a1a1a",
  selectedBackgroundColor: "#333366",
  selectedTextColor: "#FFFFFF",
  textColor: "#AAAAAA",
  descriptionColor: "#666666",
})
```

--------------------------------

### Render Solid.js Component Tree with OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

Demonstrates two ways to use the `render` function from OpenTUI's Solid.js bindings: a simple usage with a component function and a more advanced usage with custom renderer configuration, including `targetFps` and `exitOnCtrlC` options.

```tsx
import { render } from "@opentui/solid"

// Simple usage
render(() => <App />)

// With renderer config
render(() => <App />, {
  targetFps: 30,
  exitOnCtrlC: false,
})
```

--------------------------------

### Enable Live Rendering with `onUpdate`

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables.mdx

Implement dynamic animations and updates by extending the `Renderable` class and overriding the `onUpdate` method. This method is called each frame to update animation states.

```typescript
class AnimatedBox extends BoxRenderable {
  onUpdate(deltaTime) {
    // Update animation state
    this.translateX += 1
  }
}

const box = new AnimatedBox(renderer, {
  id: "anim-box",
  live: true, // Enable continuous rendering
})
```

--------------------------------

### Handling Item Selected Event (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/select.mdx

Shows how to subscribe to the `ITEM_SELECTED` event of the Select component in TypeScript. This event fires when a user confirms their selection by pressing Enter, providing the index and the selected option object.

```typescript
import { SelectRenderableEvents } from "@opentui/core"

menu.on(SelectRenderableEvents.ITEM_SELECTED, (index: number, option: SelectOption) => {
  console.log(`Selected index ${index}: ${option.name}`)
})
```

--------------------------------

### Enable Streaming Mode for Code - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/code.mdx

Enables streaming mode for the CodeRenderable component, optimizing for incremental content updates, such as output from LLMs. Set the `streaming` option to `true` and append content to the `code.content` property.

```typescript
const code = new CodeRenderable(renderer, {
  id: "streaming-code",
  content: "",
  filetype: "typescript",
  syntaxStyle,
  streaming: true, // Enable streaming mode
})

// Later, append content
code.content += "const x = 1\n"
code.content += "const y = 2\n"
```

--------------------------------

### Basic Select Usage with Construct API (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/select.mdx

Illustrates the creation of a Select component using the Construct API in TypeScript. This method provides a more concise way to instantiate the component with essential properties like dimensions and options, followed by focusing and adding it to the renderer.

```typescript
import { Select, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const menu = Select({
  width: 30,
  height: 8,
  options: [
    { name: "Option 1", description: "First option" },
    { name: "Option 2", description: "Second option" },
    { name: "Option 3", description: "Third option" },
  ],
})

menu.focus()
renderer.root.add(menu)
```

--------------------------------

### Handle Input Event - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/input.mdx

Demonstrates how to listen for the `INPUT` event, which fires on every keystroke. This is useful for real-time feedback or validation as the user types.

```typescript
import { InputRenderableEvents } from "@opentui/core"

input.on(InputRenderableEvents.INPUT, (value: string) => {
  console.log("Current value:", value)
})
```

--------------------------------

### Create a Basic Solid.js OpenTUI App

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

A minimal Solid.js application that renders 'Hello, World!' to the terminal using OpenTUI's `render` function and a simple `<text>` component. This demonstrates the basic structure of an OpenTUI Solid.js application.

```tsx
import { render } from "@opentui/solid"

const App = () => <text>Hello, World!</text>

render(App)
```

--------------------------------

### Handle Selection Changed Event (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/tab-select.mdx

Demonstrates how to listen for the `SELECTION_CHANGED` event, which fires whenever the currently highlighted tab changes. The event provides the index and the option of the new highlighted tab, useful for previewing or updating UI elements.

```typescript
import { TabSelectRenderableEvents, type TabSelectOption } from "@opentui/core"

tabs.on(TabSelectRenderableEvents.SELECTION_CHANGED, (index: number, option: TabSelectOption) => {
  console.log(`Hovering: ${option.name}`)
})
```

--------------------------------

### Render ScrollBox with Renderable API

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/scrollbox.mdx

Demonstrates how to create and populate a ScrollBox using the Renderable API in OpenTUI. It initializes a ScrollBox and adds multiple BoxRenderable elements as its content.

```typescript
import { ScrollBoxRenderable, TextRenderable, BoxRenderable, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const scrollbox = new ScrollBoxRenderable(renderer, {
  id: "scrollbox",
  width: 40,
  height: 20,
})

// Add content to the scrollbox
for (let i = 0; i < 100; i++) {
  scrollbox.add(
    new BoxRenderable(renderer, {
      id: `item-${i}`,
      width: "100%",
      height: 2,
      backgroundColor: i % 2 === 0 ? "#292e42" : "#2f3449",
    }),
  )
}

renderer.root.add(scrollbox)
```

--------------------------------

### Implement Text Input with OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/getting-started.md

Demonstrates how to use `InputRenderable` for creating text input fields. The example shows setting width, placeholder text, focused background color, position, and how to listen for the `CHANGE` event, which is triggered on return/enter.

```typescript
import { InputRenderable, InputRenderableEvents } from "@opentui/core"

const nameInput = new InputRenderable(renderer, {
  id: "name-input",
  width: 25,
  placeholder: "Enter your name...",
  focusedBackgroundColor: "#1a1a1a",
  position: "absolute",
  left: 10,
  top: 8,
})

// The change event is currently emitted when pressing return or enter. (this will be fixed in the future)
nameInput.on(InputRenderableEvents.CHANGE, (value) => {
  console.log("Input changed:", value)
})
nameInput.focus()
```

--------------------------------

### Layout System with Yoga in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/getting-started.md

Illustrates the use of GroupRenderable and BoxRenderable for creating responsive layouts using CSS Flexbox-like properties. Dependencies include 'GroupRenderable' and 'BoxRenderable' from '@opentui/core'.

```typescript
import { GroupRenderable, BoxRenderable } from "@opentui/core"

const container = new GroupRenderable(renderer, {
  id: "container",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  height: 10,
})

const leftPanel = new BoxRenderable(renderer, {
  id: "left",
  flexGrow: 1,
  height: 10,
  backgroundColor: "#444",
})

const rightPanel = new BoxRenderable(renderer, {
  id: "right",
  width: 20,
  height: 10,
  backgroundColor: "#666",
})

container.add(leftPanel)
container.add(rightPanel)
```

--------------------------------

### API: Test Rendering OpenTUI Components

Source: https://github.com/anomalyco/opentui/blob/main/packages/solid/README.md

Demonstrates the `testRender` function from `@opentui/solid`, which is used for creating a test renderer. This is helpful for snapshot testing and simulating interactions with your OpenTUI Solid.js components in a controlled environment.

```tsx
import { testRender } from "@opentui/solid"

const testSetup = await testRender(() => <App />, { width: 40, height: 10 })
```

--------------------------------

### Add Line Numbers to Code Rendering in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/code.mdx

Demonstrates how to use `LineNumberRenderable` in conjunction with `CodeRenderable` to display code with line numbers. It involves creating a `CodeRenderable` instance for the source code and then a `LineNumberRenderable` instance targeting the code. Both are then wrapped in a `ScrollBoxRenderable` for scrolling functionality. Dependencies include core OpenTUI components.

```typescript
import { CodeRenderable, LineNumberRenderable, ScrollBoxRenderable } from "@opentui/core"

const code = new CodeRenderable(renderer, {
  id: "code",
  content: sourceCode,
  filetype: "typescript",
  syntaxStyle,
  width: "100%",
})

const lineNumbers = new LineNumberRenderable(renderer, {
  id: "code-with-lines",
  target: code,
  minWidth: 3,
  paddingRight: 1,
  fg: "#6b7280",
  bg: "#161b22",
  width: "100%",
})

// Wrap in ScrollBox for scrolling
const scrollbox = new ScrollBoxRenderable(renderer, {
  id: "scrollbox",
  width: 60,
  height: 20,
})
scrollbox.add(lineNumbers)
```

--------------------------------

### Handle Change Event - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/input.mdx

Shows how to use the `CHANGE` event, which triggers when the input loses focus or Enter is pressed, and only if the value has changed since gaining focus. This is suitable for committing user input.

```typescript
input.on(InputRenderableEvents.CHANGE, (value: string) => {
  console.log("Value committed:", value)
})
```

--------------------------------

### Add Components to Renderer Root

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderer.mdx

Demonstrates how to add renderable components, such as Boxes and Texts, to the root of the OpenTUI renderer's component tree. The root renderable automatically adjusts to terminal size changes, ensuring content is always displayed correctly. Components are added using the `add` method.

```typescript
import { Box, Text } from "@opentui/core"

// Add components to the root
renderer.root.add(Box({ width: 40, height: 10, borderStyle: "rounded" }, Text({ content: "Hello, OpenTUI!" })))
```

--------------------------------

### Create a Select List Component with OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/getting-started.md

Shows how to implement a `SelectRenderable` component for list selection. This example includes defining options with names and descriptions, setting dimensions, and handling the `ITEM_SELECTED` event to capture user choices.

```typescript
import { SelectRenderable, SelectRenderableEvents } from "@opentui/core"

const menu = new SelectRenderable(renderer, {
  id: "menu",
  width: 30,
  height: 8,
  options: [
    { name: "New File", description: "Create a new file" },
    { name: "Open File", description: "Open an existing file" },
    { name: "Save", description: "Save current file" },
    { name: "Exit", description: "Exit the application" },
  ],
  position: "absolute",
  left: 5,
  top: 3,
})

menu.on(SelectRenderableEvents.ITEM_SELECTED, (index, option) => {
  console.log("Selected:", option.name)
})
menu.focus()
```

--------------------------------

### Create a Box Component with OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/getting-started.md

Illustrates the creation of a `BoxRenderable` component, used for creating containers with borders and background colors. This example demonstrates setting dimensions, background and border colors, title, and positioning.

```typescript
import { BoxRenderable } from "@opentui/core"

const panel = new BoxRenderable(renderer, {
  id: "panel",
  width: 30,
  height: 10,
  backgroundColor: "#333366",
  borderStyle: "double",
  borderColor: "#FFFFFF",
  title: "Settings Panel",
  titleAlignment: "center",
  position: "absolute",
  left: 10,
  top: 5,
})
```

--------------------------------

### Display Syntax-Highlighted Code with CodeRenderable

Source: https://context7.com/anomalyco/opentui/llms.txt

Shows how to display syntax-highlighted code within the terminal using the CodeRenderable component. This example initializes a renderer, creates a CodeRenderable instance with code content, specifies the language for highlighting, and sets dimensions and position. Line numbers can also be optionally displayed.

```typescript
import { createCliRenderer, CodeRenderable } from "@opentui/core"

const renderer = await createCliRenderer()

const codeBlock = new CodeRenderable(renderer, {
  id: "code-example",
  code: `function greet(name: string): string {
  return `Hello, ${name}!`
}

const message = greet("World")
console.log(message)`,
  language: "typescript",
  width: 50,
  height: 10,
  position: "absolute",
  left: 5,
  top: 3,
  showLineNumbers: true,
})

renderer.root.add(codeBlock)

```

--------------------------------

### Enable Text Selection for Code - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/code.mdx

Enables text selection functionality for the CodeRenderable component, allowing users to copy code. Configure `selectable` to `true` and specify `selectionBg` and `selectionFg` for the selection's background and foreground colors.

```typescript
const code = new CodeRenderable(renderer, {
  id: "code",
  content: sourceCode,
  filetype: "typescript",
  syntaxStyle,
  selectable: true,
  selectionBg: "#264F78",
  selectionFg: "#FFFFFF",
})
```

--------------------------------

### Style Input Field with Focus States - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/input.mdx

Illustrates how to customize the appearance of an input field, including background and text colors, for both focused and unfocused states. This allows for clear visual feedback when the input is active.

```typescript
const input = new InputRenderable(renderer, {
  id: "styled-input",
  width: 30,
  placeholder: "Type here...",
  backgroundColor: "#1a1a1a",
  focusedBackgroundColor: "#2a2a2a",
  textColor: "#FFFFFF",
  cursorColor: "#00FF00",
})
```

--------------------------------

### Create a Test Renderer for Solid.js OpenTUI Apps

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

Shows how to use the `testRender` function to create a test renderer for Solid.js components. This is useful for snapshot testing and interaction tests, allowing you to specify dimensions like width and height.

```tsx
import { testRender } from "@opentui/solid"

const testSetup = await testRender(() => <App />, { width: 40, height: 10 })
```

--------------------------------

### Applying Colors and Text Attributes in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/colors.mdx

Shows how to create a `TextRenderable` object with specific foreground (`fg`) and background (`bg`) colors, along with text formatting attributes like bold and underline. Colors can be specified using RGBA objects.

```typescript
import { TextRenderable, TextAttributes, RGBA } from "@opentui/core"

const styledText = new TextRenderable(renderer, {
  id: "styled",
  content: "Important",
  fg: RGBA.fromHex("#FFFF00"),
  bg: RGBA.fromHex("#333333"),
  attributes: TextAttributes.BOLD | TextAttributes.UNDERLINE,
})
```

--------------------------------

### Extend OpenTUI Solid.js with Custom Components

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

Illustrates how to register custom renderables as JSX intrinsic elements using the `extend` function. This allows you to create and use your own reusable UI components within OpenTUI Solid.js applications.

```tsx
import { extend } from "@opentui/solid"

extend({ custom_box: CustomBoxRenderable })
```

--------------------------------

### Create a Login Form with Labeled Inputs - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/input.mdx

Demonstrates building a simple login form using OpenTUI components. It defines a reusable `LabeledInput` component and arranges username and password inputs within a bordered box. The username input is focused initially.

```typescript
import { Box, Text, Input, delegate, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

function LabeledInput(props: { id: string; label: string; placeholder: string }) {
  return delegate(
    { focus: `${props.id}-input` },
    Box(
      { flexDirection: "row", marginBottom: 1 },
      Text({ content: props.label.padEnd(12), fg: "#888888" }),
      Input({
        id: `${props.id}-input`,
        placeholder: props.placeholder,
        width: 20,
        backgroundColor: "#222",
        focusedBackgroundColor: "#333",
        textColor: "#FFF",
        cursorColor: "#0F0",
      }),
    ),
  )
}

const usernameInput = LabeledInput({
  id: "username",
  label: "Username:",
  placeholder: "Enter username",
})

const passwordInput = LabeledInput({
  id: "password",
  label: "Password:",
  placeholder: "Enter password",
})

const form = Box(
  {
    width: 40,
    borderStyle: "rounded",
    title: "Login",
    padding: 1,
  },
  usernameInput,
  passwordInput,
)

// Focus the username input
usernameInput.focus()

renderer.root.add(form)
```

--------------------------------

### Implement a counter with keyboard input handling

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

This example showcases a simple counter application built with OpenTUI and SolidJS. It utilizes the `render` function to display the UI and `useKeyboard` hook to capture keyboard events. Pressing the 'up' or 'down' arrow keys increments or decrements the counter, while 'escape' exits the application.

```tsx
import { render, useKeyboard } from "@opentui/solid"
import { createSignal } from "solid-js"

const App = () => {
  const [count, setCount] = createSignal(0)

  useKeyboard((key) => {
    if (key.name === "up") setCount((c) => c + 1)
    if (key.name === "down") setCount((c) => c - 1)
    if (key.name === "escape") process.exit(0)
  })

  return (
    <box border padding={2}>
      <text>Count: {count()}</text>
      <text fg="#888">Up/Down to change, ESC to exit</text>
    </box>
  )
}

render(App)
```

--------------------------------

### Create and Render TextRenderable in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/README.md

Demonstrates how to create a basic CLI renderer and a `TextRenderable` object using the OpenTUI Core library in TypeScript. The `TextRenderable` is added to the renderer's root for display.

```typescript
import { createCliRenderer, TextRenderable } from "@opentui/core"

const renderer = await createCliRenderer()

const obj = new TextRenderable(renderer, { id: "my-obj", content: "Hello, world!" })

renderer.root.add(obj)
```

--------------------------------

### Declarative Login Form with TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/renderables-vs-constructs.md

Constructs a login form using a declarative VNode graph with functional components. The `delegate` function is used to route API calls like `focus` to specific descendant nodes during instantiation.

```typescript
import { Text, Input, Box, createCliRenderer, delegate, instantiate } from "@opentui/core"

const renderer = await createCliRenderer()

function LabeledInput(props: { id: string; label: string; placeholder: string }) {
  return delegate(
    {
      focus: `${props.id}-input`,
    },
    Box(
      { flexDirection: "row" },
      Text({ content: props.label + " " }),
      Input({
        id: `${props.id}-input`,
        placeholder: props.placeholder,
        width: 20,
        backgroundColor: "white",
        textColor: "black",
        cursorColor: "blue",
        focusedBackgroundColor: "orange",
      }),
    ),
  )
}

function Button(props: { id: string; content: string; onClick: () => void }) {
  return Box(
    {
      border: true,
      backgroundColor: "gray",
      onMouseDown: props.onClick,
    },
    Text({ content: props.content, selectable: false }),
  )
}

const usernameInput = LabeledInput({ id: "username", label: "Username:", placeholder: "Enter your username..." })
usernameInput.focus()

const loginForm = Box(
  { width: 20, height: 10, padding: 1 },
  usernameInput,
  LabeledInput({ id: "password", label: "Password:", placeholder: "Enter your password..." }),
  Box(
    { flexDirection: "row", padding: 1, width: 20 },
    Button({ id: "login", content: "Login", onClick: () => {} }),
    Button({ id: "register", content: "Register", onClick: () => {} }),
  ),
)

renderer.root.add(loginForm)

```

--------------------------------

### Display Styled Text with TextRenderable (TypeScript)

Source: https://context7.com/anomalyco/opentui/llms.txt

Demonstrates using `TextRenderable` from `@opentui/core` to display styled text in the terminal. Supports basic styling like foreground/background colors and attributes (bold, italic, underline), as well as complex styling using template literals and helper functions.

```typescript
import {
  createCliRenderer,
  TextRenderable,
  TextAttributes,
  t,
  bold,
  italic,
  underline,
  fg,
  bg,
} from "@opentui/core"

const renderer = await createCliRenderer()

// Basic text with styling
const plainText = new TextRenderable(renderer, {
  id: "plain-text",
  content: "Important Message",
  fg: "#FFFF00",
  bg: "#333333",
  attributes: TextAttributes.BOLD | TextAttributes.UNDERLINE,
  position: "absolute",
  left: 5,
  top: 2,
})

renderer.root.add(plainText)

// Using template literal for complex styled text
const styledText = new TextRenderable(renderer, {
  id: "styled-text",
  content: t`${bold("Bold")} ${italic("Italic")} ${fg("#FF0000")(underline("Red Underlined"))} ${bg("#0000FF")("Blue BG")}`,
  position: "absolute",
  left: 5,
  top: 4,
})

renderer.root.add(styledText)
```

--------------------------------

### Create TabSelect Component (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/tab-select.mdx

Illustrates the creation of a TabSelect component using the construct API. This method is a more direct way to instantiate the component, defining its dimensions and options. The component is then focused and added to the renderer's root.

```typescript
import { TabSelect, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const tabs = TabSelect({
  width: 60,
  tabWidth: 15,
  options: [
    { name: "Tab 1", description: "First tab" },
    { name: "Tab 2", description: "Second tab" },
    { name: "Tab 3", description: "Third tab" },
  ],
})

tabs.focus()
renderer.root.add(tabs)
```

--------------------------------

### Handle Item Selected Event (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/tab-select.mdx

Shows how to subscribe to the `ITEM_SELECTED` event for the TabSelect component. This event is triggered when the user presses 'Enter' on a tab. The handler receives the index and the selected option, allowing for actions like switching to a corresponding panel.

```typescript
import { TabSelectRenderableEvents, type TabSelectOption } from "@opentui/core"

tabs.on(TabSelectRenderableEvents.ITEM_SELECTED, (index: number, option: TabSelectOption) => {
  console.log(`Selected tab ${index}: ${option.name}`)
  // Switch to the corresponding panel
})
```

--------------------------------

### Example Card Component - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/box.mdx

Presents a reusable Card component built with OpenTUI's Box and Text components in TypeScript. This example showcases how to combine Box properties with text formatting for creating structured content cards.

```typescript
import { Box, Text, t, bold, fg } from "@opentui/core"

function Card(props: { title: string; description: string }) {
  return Box(
    {
      width: 40,
      borderStyle: "rounded",
      borderColor: "#666",
      padding: 1,
      margin: 1,
    },
    Text({
      content: t`${bold(fg("#00FFFF")(props.title))}`,
    }),
    Text({
      content: props.description,
      fg: "#AAAAAA",
    }),
  )
}

renderer.root.add(
  Box(
    { flexDirection: "row", flexWrap: "wrap" },
    Card({ title: "Feature 1", description: "Description of feature 1" }),
    Card({ title: "Feature 2", description: "Description of feature 2" }),
    Card({ title: "Feature 3", description: "Description of feature 3" }),
  ),
)
```

--------------------------------

### Define Markdown Syntax Styles in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/code.mdx

Illustrates how to define custom `SyntaxStyle` objects for rendering markdown content with specific formatting. This involves creating a `SyntaxStyle` instance and mapping markdown element selectors (e.g., `markup.heading`, `markup.bold`) to style properties like foreground color, bold, and underline. This allows for customized visual representation of markdown elements.

```typescript
const markdownStyle = SyntaxStyle.fromStyles({
  "markup.heading": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.heading.1": { fg: RGBA.fromHex("#00FF88"), bold: true, underline: true },
  "markup.heading.2": { fg: RGBA.fromHex("#00D7FF"), bold: true },
  "markup.bold": { fg: RGBA.fromHex("#F0F6FC"), bold: true },
  "markup.strong": { fg: RGBA.fromHex("#F0F6FC"), bold: true },
  "markup.italic": { fg: RGBA.fromHex("#F0F6FC"), italic: true },
  "markup.list": { fg: RGBA.fromHex("#FF7B72") },
  "markup.quote": { fg: RGBA.fromHex("#8B949E"), italic: true },
  "markup.raw": { fg: RGBA.fromHex("#A5D6FF") },
  "markup.raw.block": { fg: RGBA.fromHex("#A5D6FF") },
  "markup.link": { fg: RGBA.fromHex("#58A6FF"), underline: true },
  "markup.link.url": { fg: RGBA.fromHex("#58A6FF"), underline: true },
  default: { fg: RGBA.fromHex("#E6EDF3") },
})
```

--------------------------------

### Using Color Strings and RGBA Objects in OpenTUI Components (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/colors.mdx

Demonstrates how OpenTUI components like `Text` and `Box` can accept color values as hex strings, CSS color names, or RGBA objects. This provides flexibility in defining component appearances.

```typescript
import { Text, Box } from "@opentui/core"

// Using hex strings
Text({ content: "Hello", fg: "#00FF00" })

// Using CSS color names
Box({ backgroundColor: "red", borderColor: "white" })

// Using RGBA objects
const customColor = RGBA.fromInts(100, 150, 200, 255)
Text({ content: "Custom", fg: customColor })

// Transparent
Box({ backgroundColor: "transparent" })
```

--------------------------------

### Render Text Content with OpenTUI Core

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/text.mdx

Demonstrates how to render basic text content using the TextRenderable API in OpenTUI. It requires the createCliRenderer function and initializes a TextRenderable object with content and foreground color.

```typescript
import { TextRenderable, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const text = new TextRenderable(renderer, {
  id: "greeting",
  content: "Hello, OpenTUI!",
  fg: "#00FF00",
})

renderer.root.add(text)
```

--------------------------------

### Composing with Children in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/constructs.mdx

This code snippet demonstrates how to create custom constructs that accept and pass through children. It defines a `Card` component that takes a title and children, arranging them within a bordered box. This allows for flexible composition of UI elements.

```typescript
function Card(props: { title: string }, ...children: VChild[]) {
  return Box(
    { border: true, padding: 1, flexDirection: "column" },
    Text({ content: props.title, fg: "#FFFF00" }),
    Box({ flexDirection: "column" }, ...children),
  )
}

renderer.root.add(Card({ title: "User Info" }, Text({ content: "Name: Alice" }), Text({ content: "Role: Admin" })))
```

--------------------------------

### Create UI with Renderables in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables-vs-constructs.mdx

This code demonstrates building a login form using OpenTUI's Renderable API. It creates and composes UI elements like boxes, text, and input fields. The example showcases direct instance manipulation and manual navigation for nested components.

```typescript
import { BoxRenderable, TextRenderable, InputRenderable, createCliRenderer, type RenderContext } from "@opentui/core"

const renderer = await createCliRenderer()

const loginForm = new BoxRenderable(renderer, {
  id: "login-form",
  width: 40,
  height: 10,
  padding: 1,
})

// Compose multiple renderables into one
function createLabeledInput(renderer: RenderContext, props: { label: string; placeholder: string; id: string }) {
  const container = new BoxRenderable(renderer, {
    id: `${props.id}-container`,
    flexDirection: "row",
  })

  container.add(
    new TextRenderable(renderer, {
      id: `${props.id}-label`,
      content: props.label + " ",
    }),
  )

  container.add(
    new InputRenderable(renderer, {
      id: `${props.id}-input`,
      placeholder: props.placeholder,
      width: 20,
    }),
  )

  return container
}

const username = createLabeledInput(renderer, {
  id: "username",
  label: "Username:",
  placeholder: "Enter username...",
})
loginForm.add(username)

// You must navigate to the nested component to focus it
username.getRenderable("username-input")?.focus()

renderer.root.add(loginForm)
```

--------------------------------

### Handle Enter Event - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/input.mdx

Explains how to capture the `ENTER` event, which is specifically fired when the user presses the Enter key. This is useful for form submissions or triggering actions upon confirmation.

```typescript
input.on(InputRenderableEvents.ENTER, (value: string) => {
  console.log("Submitted value:", value)
})
```

--------------------------------

### Handle Keyboard Input with OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/getting-started.md

Demonstrates how to use `renderer.keyInput` to capture and process key press events. It shows how to access key details like name, sequence, and modifier keys (Ctrl, Shift, Alt, Option), and includes examples for checking specific key combinations.

```typescript
import { type KeyEvent } from "@opentui/core"

const keyHandler = renderer.keyInput

keyHandler.on("keypress", (key: KeyEvent) => {
  console.log("Key name:", key.name)
  console.log("Sequence:", key.sequence)
  console.log("Ctrl pressed:", key.ctrl)
  console.log("Shift pressed:", key.shift)
  console.log("Alt pressed:", key.meta)
  console.log("Option pressed:", key.option)

  if (key.name === "escape") {
    console.log("Escape pressed!")
  } else if (key.ctrl && key.name === "c") {
    console.log("Ctrl+C pressed!")
  } else if (key.shift && key.name === "f1") {
    console.log("Shift+F1 pressed!")
  }
})
```

--------------------------------

### Control Layering Order with `zIndex`

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables.mdx

Determine the rendering order of overlapping elements using the `zIndex` property. Higher `zIndex` values ensure an element renders on top of elements with lower values.

```typescript
const overlay = new BoxRenderable(renderer, {
  id: "overlay",
  position: "absolute",
  zIndex: 100, // Higher values render on top
})
```

--------------------------------

### Create and Add Constructs to Renderable (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/constructs.mdx

This snippet shows how to create a BoxRenderable directly and then add Text and Input constructs to it. It requires importing BoxRenderable, Text, and Input from '@opentui/core'. The output is a UI element with a title and an input field.

```typescript
import { BoxRenderable, Text, Input } from "@opentui/core"

// Create a renderable directly
const container = new BoxRenderable(renderer, {
  id: "container",
  flexDirection: "column",
})

// Add constructs to it
container.add(Text({ content: "Title" }), Input({ placeholder: "Type here..." }))

renderer.root.add(container)
```

--------------------------------

### API: Using Portal for Overlays

Source: https://github.com/anomalyco/opentui/blob/main/packages/solid/README.md

Illustrates the use of the `Portal` component from `@opentui/solid`. Portals allow rendering children into a different mount node, which is particularly useful for implementing overlays and tooltips that need to appear above other UI elements.

```tsx
import { Portal } from "@opentui/solid"
;<Portal mount={renderer.root}>
  <box border>Overlay</box>
</Portal>
```

--------------------------------

### Handle OpenTUI Renderer Events

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderer.mdx

Shows how to subscribe to and handle events emitted by the OpenTUI CliRenderer. This includes listening for terminal resize events, notifications when the renderer is destroyed, and callbacks for text selection completion. Event listeners are set up using the `on` method.

```typescript
// Terminal resized
renderer.on("resize", (width, height) => {
  console.log(`Terminal size: ${width}x${height}`)
})

// Renderer destroyed
renderer.on("destroy", () => {
  console.log("Renderer destroyed")
})

// Text selection completed
renderer.on("selection", (selection) => {
  console.log("Selected text:", selection.getSelectedText())
})
```

--------------------------------

### Mixing Renderables and Constructs in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables-vs-constructs.mdx

This code demonstrates how to combine Renderables and Constructs within the same OpenTUI application. It creates a Renderable container and adds Constructs to it, showcasing the flexibility of mixing both approaches.

```typescript
import { BoxRenderable, Text, Input } from "@opentui/core"

// Create a renderable container
const container = new BoxRenderable(renderer, {
  id: "container",
  flexDirection: "column",
})

// Add constructs to it
container.add(Text({ content: "Title" }), Input({ placeholder: "Type here..." }))

renderer.root.add(container)
```

--------------------------------

### Handle Text Selection Events in Solid.js

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

Demonstrates using the `useSelectionHandler` hook to manage text selection events within a Solid.js OpenTUI application. The callback receives a selection object containing details about the selected text.

```tsx
import { useSelectionHandler } from "@opentui/solid"

const App = () => {
  useSelectionHandler((selection) => {
    console.log("Selected:", selection)
  })

  return <text selectable>Select me!</text>
}
```

--------------------------------

### Create Tabbed Interface with OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/tab-select.mdx

Demonstrates the creation of a tabbed interface using OpenTUI components like Box, Text, and TabSelect. It sets up content panels, a tab container, and handles tab selection events to switch between panels. This requires the '@opentui/core' package.

```typescript
import { Box, Text, TabSelect, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

// Create content panels
const panels = {
  home: Box({ padding: 1 }, Text({ content: "Home content here" })),
  files: Box({ padding: 1 }, Text({ content: "File browser here" })),
  settings: Box({ padding: 1 }, Text({ content: "Settings form here" })),
}

// Create the tabbed container
const container = Box({
  width: 60,
  height: 20,
  borderStyle: "rounded",
})

const tabs = TabSelect({
  width: 60,
  tabWidth: 20,
  options: [
    { name: "Home", description: "Dashboard" },
    { name: "Files", description: "Browse files" },
    { name: "Settings", description: "Preferences" },
  ],
})

// Content area
let currentPanel = panels.home
const contentArea = Box({
  flexGrow: 1,
  padding: 1,
})
contentArea.add(currentPanel)

// Handle tab changes
tabs.on("itemSelected", (index, option) => {
  // Remove current panel
  if (currentPanel) {
    contentArea.remove(currentPanel.id)
  }
  // Add new panel based on selection
  switch (option.name) {
    case "Home":
      currentPanel = panels.home
      break
    case "Files":
      currentPanel = panels.files
      break
    case "Settings":
      currentPanel = panels.settings
      break
  }
  contentArea.add(currentPanel)
})

container.add(tabs)
container.add(contentArea)

tabs.focus()
renderer.root.add(container)
```

--------------------------------

### Timeline Animation with OpenTUI Core

Source: https://context7.com/anomalyco/opentui/llms.txt

This TypeScript example demonstrates creating animations in the terminal using the `Timeline` utility from `@opentui/core`. It sets up a renderer, adds a `BoxRenderable`, and then uses a `Timeline` instance to animate the box's position and background color over time. The `onUpdate` callback is crucial for defining the animation logic based on the timeline's progress.

```typescript
import { createCliRenderer, BoxRenderable, Timeline, engine } from "@opentui/core"

const renderer = await createCliRenderer()
engine.attach(renderer)

const box = new BoxRenderable(renderer, {
  id: "animated-box",
  width: 10,
  height: 5,
  backgroundColor: "#FF5500",
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

timeline.onUpdate((progress) => {
  // Animate left position from 0 to 50
  box.left = Math.floor(progress * 50)

  // Animate color
  const r = Math.floor(255 * progress)
  const g = Math.floor(255 * (1 - progress))
  box.backgroundColor = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}00`
})

engine.register(timeline)
timeline.play()

```

--------------------------------

### Compose TUI Components with OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/getting-started.mdx

Demonstrates composing TUI components in OpenTUI by creating a bordered panel with nested Text components. It utilizes Box and Text factory functions for layout and content.

```typescript
import { createCliRenderer, Box, Text } from "@opentui/core"

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
})

renderer.root.add(
  Box(
    { borderStyle: "rounded", padding: 1, flexDirection: "column", gap: 1 },
    Text({ content: "Welcome", fg: "#FFFF00" }),
    Text({ content: "Press Ctrl+C to exit" }),
  ),
)
```

--------------------------------

### Basic Flexbox Layout with BoxRenderable

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/layout.mdx

Demonstrates creating a basic responsive layout using BoxRenderable components and flexbox properties. It sets up a container with two panels, one growing and one with a fixed width.

```typescript
import { BoxRenderable, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const container = new BoxRenderable(renderer, {
  id: "container",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  height: 10,
})

const leftPanel = new BoxRenderable(renderer, {
  id: "left",
  flexGrow: 1,
  height: 10,
  backgroundColor: "#444",
})

const rightPanel = new BoxRenderable(renderer, {
  id: "right",
  width: 20,
  height: 10,
  backgroundColor: "#666",
})

container.add(leftPanel)
container.add(rightPanel)
renderer.root.add(container)
```

--------------------------------

### Responsive Layout on Resize

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/layout.mdx

Illustrates how to dynamically update the layout in response to terminal resize events. This example changes the flex direction based on the terminal width.

```typescript
const renderer = await createCliRenderer()

renderer.on("resize", (width, height) => {
  // Update layout based on new dimensions
  if (width < 80) {
    container.flexDirection = "column"
  } else {
    container.flexDirection = "row"
  }
})
```

--------------------------------

### Box Mouse Event Handling - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/box.mdx

Explains how to handle mouse events like click, hover, and mouse out for a Box component using TypeScript. This allows for interactive UI elements where user interaction triggers specific actions or style changes.

```typescript
const button = new BoxRenderable(renderer, {
  id: "button",
  width: 12,
  height: 3,
  border: true,
  backgroundColor: "#444",
  onMouseDown: () => {
    console.log("Button clicked!")
  },
  onMouseOver: () => {
    button.backgroundColor = "#666"
  },
  onMouseOut: () => {
    button.backgroundColor = "#444"
  },
})
```

--------------------------------

### Implement Tab Selection with OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/getting-started.md

Demonstrates the `TabSelectRenderable` component for creating horizontal tab-based navigation. The example shows how to define tabs with names and descriptions, set tab width, and listen for the `ITEM_SELECTED` event.

```typescript
import { TabSelectRenderable, TabSelectRenderableEvents } from "@opentui/core"

const tabs = new TabSelectRenderable(renderer, {
  id: "tabs",
  width: 60,
  options: [
    { name: "Home", description: "Dashboard and overview" },
    { name: "Files", description: "File management" },
    { name: "Settings", description: "Application settings" },
  ],
  tabWidth: 20,
  position: "absolute",
  left: 2,
  top: 1,
})

tabs.on(TabSelectRenderableEvents.ITEM_SELECTED, (index, option) => {
  console.log("Selected:", option.name)
})

tabs.focus()
```

--------------------------------

### FrameBuffer Rendering in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/getting-started.md

Demonstrates how to use the FrameBufferRenderable for custom graphics and drawing text with RGBA colors. Requires 'FrameBufferRenderable' and 'RGBA' from '@opentui/core'.

```typescript
import { FrameBufferRenderable, RGBA } from "@opentui/core"

const canvas = new FrameBufferRenderable(renderer, {
  id: "canvas",
  width: 50,
  height: 20,
  position: "absolute",
  left: 5,
  top: 5,
})

// Custom rendering in the frame buffer
canvas.frameBuffer.fillRect(10, 5, 20, 8, RGBA.fromHex("#FF0000"))
canvas.frameBuffer.drawText("Custom Graphics", 12, 7, RGBA.fromHex("#FFFFFF"))
```

--------------------------------

### Update ASCII Font Text Dynamically

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/ascii-font.mdx

Dynamically updates the text content of an `ASCIIFontRenderable` component. This example uses `setInterval` to increment a counter and update the displayed text every second, suitable for real-time information.

```typescript
const counter = new ASCIIFontRenderable(renderer, {
  id: "counter",
  text: "0",
  font: "block",
  color: RGBA.fromHex("#FF0000"),
})

let count = 0
setInterval(() => {
  count++
  counter.text = count.toString()
}, 1000)
```

--------------------------------

### Handle Keyboard Events on OpenTUI Renderables

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables.mdx

Describes how to capture keyboard input for focusable renderables, including handling specific key presses like 'escape' and managing pasted text.

```typescript
const input = new InputRenderable(renderer, {
  id: "input",
  onKeyDown: (key) => {
    if (key.name === "escape") {
      input.blur()
    }
  },
  onPaste: (event) => {
    console.log("Pasted:", event.text)
  },
})
```

--------------------------------

### API: Extend OpenTUI Components with Custom Renderables

Source: https://github.com/anomalyco/opentui/blob/main/packages/solid/README.md

Shows how to use the `extend` function from `@opentui/solid` to register custom renderables as intrinsic JSX elements. This allows you to create and use your own custom UI components within your OpenTUI Solid.js applications.

```tsx
import { extend } from "@opentui/solid"

extend({ customBox: CustomBoxRenderable })
```

--------------------------------

### Use Constructs Containing Renderables (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/constructs.mdx

This example demonstrates using a construct (Box) that can contain other constructs and regular renderables. It shows how to embed a CustomRenderable within a Box construct, alongside Text constructs. This approach allows for more complex UI compositions.

```typescript
const customRenderable = new CustomRenderable(renderer, { id: "custom" })

renderer.root.add(
  Box(
    { padding: 1 },
    Text({ content: "Header" }),
    customRenderable, // Regular renderable mixed in
    Text({ content: "Footer" }),
  ),
)
```

--------------------------------

### Creating Custom Constructs in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/constructs.mdx

This code snippet shows how to create custom, reusable UI components using constructs in TypeScript. It defines a `LabeledInput` function that combines a label and an input field within a box, demonstrating how to encapsulate and reuse UI elements.

```typescript
function LabeledInput(props: { label: string; placeholder: string }) {
  return Box(
    { flexDirection: "row", gap: 1 },
    Text({ content: props.label }),
    Input({ placeholder: props.placeholder, width: 20 }),
  )
}

renderer.root.add(
  Box(
    { flexDirection: "column", padding: 1 },
    LabeledInput({ label: "Name:", placeholder: "Enter name..." }),
    LabeledInput({ label: "Email:", placeholder: "Enter email..." }),
  ),
)
```

--------------------------------

### Implement Tab Navigation Between Inputs - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/input.mdx

Shows how to enable tab navigation between multiple input fields. It listens for the 'tab' key press and cycles the focus through an array of input components.

```typescript
const inputs = [usernameInput, passwordInput]
let focusIndex = 0

renderer.keyInput.on("keypress", (key) => {
  if (key.name === "tab") {
    focusIndex = (focusIndex + 1) % inputs.length
    inputs[focusIndex].focus()
  }
})
```

--------------------------------

### SolidJS Hooks for OpenTUI Functionality

Source: https://context7.com/anomalyco/opentui/llms.txt

This snippet showcases the reactive hooks provided by `@opentui/solid` for common terminal UI functionalities. It demonstrates using `useKeyboard` for key press and release events, `usePaste` for handling pasted text, `useSelectionHandler` for tracking text selections, `useTerminalDimensions` for viewport size, `onResize` for dimension change callbacks, and `useTimeline` for managing animations.

```tsx
import {
  useRenderer,
  useKeyboard,
  usePaste,
  useTerminalDimensions,
  useSelectionHandler,
  useTimeline,
  onResize,
} from "@opentui/solid"
import { createSignal } from "solid-js"

const MyComponent = () => {
  const renderer = useRenderer()
  const dimensions = useTerminalDimensions()
  const [selection, setSelection] = createSignal("")

  // Keyboard events
  useKeyboard((key) => {
    console.log("Key:", key.name)
  })

  // With release events
  useKeyboard(
    (key) => {
      if (key.eventType === "release") {
        console.log("Released:", key.name)
      }
    },
    { release: true }
  )

  // Paste events
  usePaste((event) => {
    console.log("Pasted:", event.text)
  })

  // Selection changes
  useSelectionHandler((sel) => {
    setSelection(sel.getText())
  })

  // Resize callback
  onResize((width, height) => {
    console.log(`New size: ${width}x${height}`)
  })

  // Animation timeline
  const timeline = useTimeline({
    duration: 1000,
    loop: true,
    autoplay: true,
  })

  return (
    <box flexDirection="column">
      <text content={`Size: ${dimensions().width}x${dimensions().height}`} />
      <text content={`Timeline: ${timeline.progress.toFixed(2)}`} />
      <text content={`Selection: ${selection()}`} />
    </box>
  )
}

```

--------------------------------

### Simple Game Canvas Example (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/frame-buffer.mdx

A comprehensive example demonstrating a basic game loop using FrameBufferRenderable. It includes clearing the canvas, drawing borders, a player character, and score. Input handling for player movement is also shown, updating the display on key presses.

```typescript
import { FrameBufferRenderable, RGBA, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const gameCanvas = new FrameBufferRenderable(renderer, {
  id: "game",
  width: 40,
  height: 20,
  position: "absolute",
  left: 5,
  top: 2,
})

// Game state
let playerX = 20
let playerY = 10

function render() {
  const fb = gameCanvas.frameBuffer
  const BG = RGBA.fromHex("#111111")

  // Clear the canvas
  fb.fillRect(0, 0, 40, 20, BG)

  // Draw border
  for (let x = 0; x < 40; x++) {
    fb.setCell(x, 0, "-", RGBA.fromHex("#444444"), BG)
    fb.setCell(x, 19, "-", RGBA.fromHex("#444444"), BG)
  }
  for (let y = 0; y < 20; y++) {
    fb.setCell(0, y, "|", RGBA.fromHex("#444444"), BG)
    fb.setCell(39, y, "|", RGBA.fromHex("#444444"), BG)
  }

  // Draw player
  fb.setCell(playerX, playerY, "@", RGBA.fromHex("#00FF00"), BG)

  // Draw score
  fb.drawText("Score: 0", 2, 0, RGBA.fromHex("#FFFF00"))
}

// Handle input
renderer.keyInput.on("keypress", (key) => {
  switch (key.name) {
    case "up":
      playerY = Math.max(1, playerY - 1)
      break
    case "down":
      playerY = Math.min(18, playerY + 1)
      break
    case "left":
      playerX = Math.max(1, playerX - 1)
      break
    case "right":
      playerX = Math.min(38, playerX + 1)
      break
  }
  render()
})

render()
renderer.root.add(gameCanvas)
```

--------------------------------

### Apply Yoga Layout Properties to OpenTUI Renderables

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables.mdx

Demonstrates the use of Yoga flexbox properties for sizing, positioning, and alignment of renderables. This allows for flexible and responsive UI design within the terminal.

```typescript
const panel = new BoxRenderable(renderer, {
  id: "panel",

  // Sizing
  width: 40,
  height: "50%",
  minWidth: 20,
  maxHeight: 30,

  // Flex behavior
  flexGrow: 1,
  flexShrink: 0,
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-start",

  // Positioning
  position: "absolute",
  left: 10,
  top: 5,

  // Spacing
  padding: 2,
  paddingTop: 1,
  margin: 1,
})
```

--------------------------------

### Programmatic Control of OpenTUI Menu

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/select.mdx

This example illustrates how to programmatically control the state and behavior of an OpenTUI menu component. It covers getting selection details, setting selection, navigation, updating options, and toggling display properties.

```typescript
// Get current selection index
const currentIndex = menu.getSelectedIndex()

// Get currently selected option
const option = menu.getSelectedOption()

// Set selection programmatically
menu.setSelectedIndex(2)

// Navigate programmatically
menu.moveUp() // Move up one item
menu.moveDown() // Move down one item
menu.moveUp(3) // Move up multiple items
menu.selectCurrent() // Trigger selection of current item

// Update options dynamically
menu.options = [
  { name: "New Option 1", description: "First" },
  { name: "New Option 2", description: "Second" },
]

// Toggle display options
menu.showDescription = false
menu.showScrollIndicator = true
menu.wrapSelection = true
```

--------------------------------

### Create Layout Container with BoxRenderable (TypeScript)

Source: https://context7.com/anomalyco/opentui/llms.txt

Illustrates creating a container component using `BoxRenderable` from `@opentui/core`. This component supports borders, background colors, titles, and layout properties like padding and flex direction, enabling the creation of structured panels and frames.

```typescript
import { createCliRenderer, BoxRenderable, TextRenderable } from "@opentui/core"

const renderer = await createCliRenderer()

const panel = new BoxRenderable(renderer, {
  id: "settings-panel",
  width: 40,
  height: 12,
  backgroundColor: "#2d2d44",
  borderStyle: "double",  // "single", "double", "rounded", "bold", "none"
  borderColor: "#FFFFFF",
  title: "Settings Panel",
  titleAlignment: "center",  // "left", "center", "right"
  position: "absolute",
  left: 10,
  top: 3,
  padding: 1,
  flexDirection: "column",
  gap: 1,
})

const label = new TextRenderable(renderer, {
  id: "label",
  content: "Welcome to the settings panel!",
  fg: "#AAAAAA",
})

panel.add(label)
renderer.root.add(panel)
```

--------------------------------

### Accessing ScrollBox Internal Components (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/scrollbox.mdx

This snippet demonstrates how to access the internal components of a ScrollBox instance in TypeScript. These components include the wrapper, viewport, content, and scrollbars, allowing for advanced manipulation and customization of the scrollable area.

```typescript
const scrollbox = /* get your scrollbox instance */;

const wrapper = scrollbox.wrapper; // BoxRenderable - outer wrapper
const viewport = scrollbox.viewport; // BoxRenderable - visible area
const content = scrollbox.content; // ContentRenderable - holds children
const horizontalScrollBar = scrollbox.horizontalScrollBar; // ScrollBarRenderable
const verticalScrollBar = scrollbox.verticalScrollBar; // ScrollBarRenderable
```

--------------------------------

### Basic OpenTUI Setup with Renderables and Constructs

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/getting-started.md

Demonstrates the basic setup of an OpenTUI application using both raw Renderables and Constructs (components). It shows how to create a CliRenderer and add text elements to the root renderable tree.

```typescript
import { createCliRenderer, TextRenderable, Text } from "@opentui/core"

const renderer = await createCliRenderer()

// Raw Renderable
const greeting = new TextRenderable(renderer, {
  id: "greeting",
  content: "Hello, OpenTUI!",
  fg: "#00FF00",
  position: "absolute",
  left: 10,
  top: 5,
})

renderer.root.add(greeting)

// Construct/Component (VNode)
const greeting2 = Text({
  content: "Hello, OpenTUI!",
  fg: "#00FF00",
  position: "absolute",
  left: 10,
  top: 5,
})

renderer.root.add(greeting)
```

--------------------------------

### Handle Terminal Resize Events in Solid.js

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

Demonstrates using the `onResize` function to register a callback that handles terminal resize events within a Solid.js OpenTUI application. The callback receives the new width and height of the terminal.

```tsx
import { onResize } from "@opentui/solid"

const App = () => {
  onResize((width, height) => {
    console.log(`Resized to ${width}x${height}`)
  })

  return <text>Resize-aware component</text>
}
```

--------------------------------

### Using delegate() function in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables-vs-constructs.mdx

This code demonstrates the usage of the `delegate()` function in OpenTUI. It shows how to route method calls from a parent component to a specific child component, making it easier to manage focus and other interactions within nested UI structures.

```typescript
function Button(props: { id: string; label: string; onClick: () => void }) {
  return delegate(
    {
      focus: `${props.id}-box`, // Route focus() to the box
    },
    Box(
      {
        id: `${props.id}-box`,
        border: true,
        onMouseDown: props.onClick,
      },
      Text({ content: props.label }),
    ),
  )
}

const button = Button({ id: "submit", label: "Submit", onClick: handleSubmit })
button.focus() // Focuses the inner Box
```

--------------------------------

### Create a Status Bar with OpenTUI Components

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/text.mdx

An example of creating a status bar at the bottom of the screen using OpenTUI's Box and Text components. It utilizes absolute positioning, flexbox properties, and template literals for styled content.

```typescript
import { Text, Box, t, bold, fg } from "@opentui/core"

const statusBar = Box(
  {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 1,
    backgroundColor: "#333333",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 1,
    paddingRight: 1,
  },
  Text({
    content: t`${bold("myfile.ts")} - ${fg("#888888")("TypeScript")}`,
  }),
  Text({
    content: t`Ln ${fg("#00FF00")("42")}, Col ${fg("#00FF00")("15")}`,
  }),
)

renderer.root.add(statusBar)
```

--------------------------------

### Create Selectable List with Keyboard Navigation (TypeScript)

Source: https://context7.com/anomalyco/opentui/llms.txt

Provides a list selection component allowing users to choose from predefined options using keyboard navigation. It emits events for hover changes and item selection.

```typescript
import {
  createCliRenderer,
  SelectRenderable,
  SelectRenderableEvents,
} from "@opentui/core"

const renderer = await createCliRenderer()

const menu = new SelectRenderable(renderer, {
  id: "main-menu",
  width: 35,
  height: 10,
  options: [
    { name: "New File", description: "Create a new file" },
    { name: "Open File", description: "Open an existing file" },
    { name: "Save", description: "Save current file" },
    { name: "Settings", description: "Open settings" },
    { name: "Exit", description: "Exit the application" },
  ],
  position: "absolute",
  left: 5,
  top: 3,
  selectedFg: "#000000",
  selectedBg: "#00AAFF",
})

// Listen for selection changes
menu.on(SelectRenderableEvents.INDEX_CHANGED, (index: number) => {
  console.log("Hovering index:", index)
})

// Listen for item selection (Enter key)
menu.on(SelectRenderableEvents.ITEM_SELECTED, (index: number, option: { name: string }) => {
  console.log("Selected:", option.name)
})

renderer.root.add(menu)
menu.focus()  // Navigate with up/down/j/k, select with Enter
```

--------------------------------

### Get and Set Input Value - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/input.mdx

Provides examples for retrieving the current text value of an input field using the `.value` property and for programmatically setting the input's value.

```typescript
const currentValue = input.value

input.value = "New value"
```

--------------------------------

### Use CodeRenderable with Tree-Sitter Client (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/tree-sitter.md

Demonstrates how the `CodeRenderable` component automatically utilizes the initialized Tree-Sitter client for syntax highlighting when provided with code content and file type.

```typescript
import { CodeRenderable, getTreeSitterClient } from "@opentui/core"

// Initialize the client with custom parsers
const client = getTreeSitterClient()
await client.initialize()

// Create a code renderable
const codeBlock = new CodeRenderable("code-1", {
  content: 'def hello():\n    print("world")',
  filetype: "python",
  width: 40,
  height: 10,
})

// The CodeRenderable will automatically use the Tree-Sitter client
// to highlight the code
```

--------------------------------

### Apply Translation for Visual Offset

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables.mdx

Offset a renderable from its layout position using `translateX` and `translateY`. This is useful for effects like scrolling or animations without altering the layout calculation.

```typescript
// Offset by pixels
renderable.translateX = 10
renderable.translateY = -5
```

--------------------------------

### Construct Code Component with Tree-sitter - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/code.mdx

Constructs a Code component within a Box layout using the Construct API. This method requires a renderer, a Box component for layout, and the Code component itself, specifying content, filetype, and syntax style.

```typescript
import { Code, Box, createCliRenderer, SyntaxStyle, RGBA } from "@opentui/core"

const renderer = await createCliRenderer()

const syntaxStyle = SyntaxStyle.fromStyles({
  keyword: { fg: RGBA.fromHex("#FF7B72"), bold: true },
  string: { fg: RGBA.fromHex("#A5D6FF") },
  default: { fg: RGBA.fromHex("#E6EDF3") },
})

renderer.root.add(
  Box(
    { border: true, width: 50, height: 10 },
    Code({
      content: 'const x = "hello"',
      filetype: "javascript",
      syntaxStyle,
    }),
  ),
)
```

--------------------------------

### Control Cursor Position and Style with TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderer.mdx

Demonstrates how to control the cursor's position, visibility, style (e.g., blinking block, steady underline), and color using the OpenTUI renderer. This functionality is essential for precise text placement and visual feedback in terminal applications.

```typescript
renderer.setCursorPosition(10, 5, true)

renderer.setCursorStyle("block", true) // Blinking block
renderer.setCursorStyle("underline", false) // Steady underline
renderer.setCursorStyle("line", true) // Blinking line

renderer.setCursorColor(RGBA.fromHex("#FF0000"))
```

--------------------------------

### Create File Menu with OpenTUI Select

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/select.mdx

This snippet demonstrates how to create a file selection menu using the Select component from OpenTUI. It includes options for file operations and exiting the application. The menu is then rendered within a bordered panel.

```typescript
import { Box, Select, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const fileMenu = Select({
  width: 25,
  height: 12,
  options: [
    { name: "New", description: "Create new file (Ctrl+N)" },
    { name: "Open...", description: "Open file (Ctrl+O)" },
    { name: "Save", description: "Save file (Ctrl+S)" },
    { name: "Save As...", description: "Save with new name" },
    { name: "---", description: "" }, // Separator (visual only)
    { name: "Exit", description: "Quit application (Ctrl+C)" },
  ],
})

const menuPanel = Box(
  {
    borderStyle: "single",
    borderColor: "#666",
  },
  fileMenu,
)

fileMenu.focus()
renderer.root.add(menuPanel)
```

--------------------------------

### Create UI with Constructs in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables-vs-constructs.mdx

This code demonstrates building a login form using OpenTUI's Construct API. It uses functional constructs to define UI elements and their layout. The example showcases a declarative approach and the use of the `delegate()` function for routing method calls.

```typescript
import { Text, Input, Box, createCliRenderer, delegate } from "@opentui/core"

const renderer = await createCliRenderer()

function LabeledInput(props: { id: string; label: string; placeholder: string }) {
  return delegate(
    { focus: `${props.id}-input` },
    Box(
      { flexDirection: "row" },
      Text({ content: props.label + " " }),
      Input({
        id: `${props.id}-input`,
        placeholder: props.placeholder,
        width: 20,
      }),
    ),
  )
}

const usernameInput = LabeledInput({
  id: "username",
  label: "Username:",
  placeholder: "Enter username...",
})

// delegate() automatically routes focus to the nested input
usernameInput.focus()

const loginForm = Box(
  { width: 40, height: 10, padding: 1 },
  usernameInput,
  LabeledInput({
    id: "password",
    label: "Password:",
    placeholder: "Enter password...",
  }),
)

renderer.root.add(loginForm)
```

--------------------------------

### Create Test Renderer for Headless Rendering (TypeScript)

Source: https://context7.com/anomalyco/opentui/llms.txt

Demonstrates how to use `createTestRenderer` from `@opentui/core/testing` to set up a headless rendering environment for testing TUI components. It covers adding renderables, capturing output, simulating keypresses, and cleaning up the renderer.

```typescript
import { createTestRenderer } from "@opentui/core/testing"
import { TextRenderable, BoxRenderable } from "@opentui/core"

const testSetup = await createTestRenderer({
  width: 80,
  height: 24,
})

const { renderer, getOutput, simulateKeypress } = testSetup

// Add components
const text = new TextRenderable(renderer, {
  id: "test-text",
  content: "Hello, Test!",
})
renderer.root.add(text)

// Get rendered output as string
const output = getOutput()
console.log(output)

// Simulate keyboard input
simulateKeypress({ name: "enter", ctrl: false, shift: false })

// Cleanup
renderer.destroy()
```

--------------------------------

### Focus Components for Keyboard Input in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/keyboard.mdx

This code illustrates how to manage keyboard input focus for UI components in OpenTUI. It shows how to create an `InputRenderable` component, focus it to receive events, and how to use the `Input` construct for a similar purpose, ensuring events are routed correctly.

```typescript
import { InputRenderable } from "@opentui/core"

const input = new InputRenderable(renderer, {
  id: "my-input",
  placeholder: "Type here...",
})

// Focus the input to receive key events
input.focus()

// Or with constructs
import { Input } from "@opentui/core"

const inputNode = Input({ placeholder: "Type here..." })
inputNode.focus() // Queued for when instantiated

renderer.root.add(inputNode)
```

--------------------------------

### Display Styled Text with OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/getting-started.md

Shows how to create and display styled text using `TextRenderable`. It covers setting basic text content, foreground color, and attributes like bold and underline, both directly and using the `t` template literal for more complex styling.

```typescript
import { TextRenderable, TextAttributes, t, bold, underline, fg } from "@opentui/core"

const plainText = new TextRenderable(renderer, {
  id: "plain-text",
  content: "Important Message",
  fg: "#FFFF00",
  attributes: TextAttributes.BOLD | TextAttributes.UNDERLINE, // bitwise OR to combine attributes
  position: "absolute",
  left: 5,
  top: 2,
})

// You can also use the `t` template literal to create more complex styled text:
const styledTextRenderable = new TextRenderable(renderer, {
  id: "styled-text",
  content: t`${bold("Important Message")} ${fg("#FF0000")(underline("Important Message"))}`,
  position: "absolute",
  left: 5,
  top: 3,
})
```

--------------------------------

### Set Renderable Opacity for Transparency

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables.mdx

Control the transparency of a renderable element and its children using the `opacity` property. Values range from 0 (fully transparent) to 1 (fully opaque).

```typescript
panel.opacity = 0.5 // 50% transparent
```

--------------------------------

### Handle Mouse Events on OpenTUI Renderables

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables.mdx

Details how to attach event listeners for mouse interactions such as clicks, hovers, and drags to renderables. It also mentions event propagation control.

```typescript
const button = new BoxRenderable(renderer, {
  id: "button",
  border: true,
  onMouseDown: (event) => {
    console.log("Clicked at", event.x, event.y)
  },
  onMouseOver: (event) => {
    button.borderColor = "#FFFF00"
  },
  onMouseOut: (event) => {
    button.borderColor = "#FFFFFF"
  },
})
```

--------------------------------

### Programmatically Control Tabs with OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/tab-select.mdx

Shows how to programmatically interact with the TabSelect component in OpenTUI. This includes getting the currently selected tab index, setting a specific tab index, and dynamically updating the available tabs. These operations are performed on an existing TabSelect instance.

```typescript
// Get current tab index
const currentIndex = tabs.getSelectedIndex()

// Set tab programmatically
tabs.setSelectedIndex(1)

// Update tabs dynamically
tabs.setOptions([
  { name: "New Tab 1", description: "Updated" },
  { name: "New Tab 2", description: "Also updated" },
])
```

--------------------------------

### Create a Scrollable Text Container with ScrollBoxRenderable

Source: https://context7.com/anomalyco/opentui/llms.txt

Demonstrates how to create a scrollable container for text content that exceeds the visible area. It involves initializing a renderer, creating a ScrollBoxRenderable with specified dimensions and styling, adding multiple TextRenderable elements to it, and finally adding the scroll box to the root and enabling focus for scrolling.

```typescript
import {
  createCliRenderer,
  ScrollBoxRenderable,
  TextRenderable,
} from "@opentui/core"

const renderer = await createCliRenderer()

const scrollBox = new ScrollBoxRenderable(renderer, {
  id: "log-viewer",
  width: 50,
  height: 15,
  borderStyle: "single",
  borderColor: "#666666",
  position: "absolute",
  left: 5,
  top: 3,
})

// Add multiple lines of content
for (let i = 0; i < 50; i++) {
  const line = new TextRenderable(renderer, {
    id: `line-${i}`,
    content: `Log entry ${i + 1}: Some log message here`,
    fg: i % 2 === 0 ? "#AAAAAA" : "#888888",
  })
  scrollBox.add(line)
}

renderer.root.add(scrollBox)
scrollBox.focus()  // Enable keyboard scrolling

```

--------------------------------

### Create and Add TextRenderable in OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables.mdx

Demonstrates how to create a basic TextRenderable with specific content and styling, and then add it to the renderer's root. This is a fundamental step for displaying text in an OpenTUI application.

```typescript
import { createCliRenderer, TextRenderable, BoxRenderable } from "@opentui/core"

const renderer = await createCliRenderer()

const greeting = new TextRenderable(renderer, {
  id: "greeting",
  content: "Hello, OpenTUI!",
  fg: "#00FF00",
})

renderer.root.add(greeting)
```

--------------------------------

### Create Box with Construct API - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/box.mdx

Illustrates creating a Box component using the Construct API in TypeScript. This approach uses a factory function `Box()` and is often more concise for static UI structures. It allows nesting other components within the Box.

```typescript
import { Box, Text, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

renderer.root.add(
  Box(
    {
      width: 30,
      height: 10,
      backgroundColor: "#333366",
      borderStyle: "rounded",
    },
    Text({ content: "Inside the box!" }),
  ),
)
```

--------------------------------

### Apply Inline Styles using Template Literals in OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/text.mdx

Provides examples of using the `t` template literal with various style functions in OpenTUI, including basic attributes (bold, italic), colors (foreground, background), and combinations thereof.

```typescript
import { t, bold, dim, italic, underline, blink, reverse, strikethrough, fg, bg } from "@opentui/core"

// Basic attributes
t`${bold("bold text")}`
t`${italic("italic text")}`
t`${underline("underlined")}`
t`${strikethrough("deleted")}`

// Colors
t`${fg("#FF0000")("red text")}`
t`${bg("#0000FF")("blue background")}`

// Combining styles
t`${bold(fg("#FFFF00")("bold yellow"))}`
```

--------------------------------

### Manage Focus for InputRenderable in OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables.mdx

Explains how to manage keyboard focus for interactive renderables like InputRenderable. It covers programmatically setting focus, blurring, checking focus state, and listening for focus change events.

```typescript
const input = new InputRenderable(renderer, {
  id: "username",
  placeholder: "Enter username...",
})

renderer.root.add(input)

// Give focus to the input
input.focus()

// Remove focus
input.blur()

// Check focus state
console.log(input.focused) // true
```

```typescript
import { RenderableEvents } from "@opentui/core"

input.on(RenderableEvents.FOCUSED, () => {
  console.log("Input focused")
})

input.on(RenderableEvents.BLURRED, () => {
  console.log("Input blurred")
})
```

--------------------------------

### Create ScrollBox with Construct API

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/scrollbox.mdx

Illustrates the creation of a ScrollBox component using the Construct API in OpenTUI. This method allows for a more declarative approach to building UI elements.

```typescript
import { ScrollBox, Box, Text, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

renderer.root.add(
  ScrollBox(
    {
      width: 40,
      height: 20,
    },
    ...Array.from({ length: 100 }, (_, i) =>
      Box(
        { width: "100%", padding: 1, backgroundColor: i % 2 === 0 ? "#292e42" : "#2f3449" },
        Text({ content: `Item ${i}` }),
      ),
    ),
  ),
)
```

--------------------------------

### Access OpenTUI Renderer Instance in Solid.js

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

Demonstrates using the `useRenderer` hook to gain access to the OpenTUI renderer instance within a Solid.js component. This allows direct interaction with the renderer, such as showing the console or logging messages.

```tsx
import { useRenderer } from "@opentui/solid"
import { onMount } from "solid-js"

const App = () => {
  const renderer = useRenderer()

  onMount(() => {
    renderer.console.show()
    console.log("Hello from console!")
  })

  return <box />
}
```

--------------------------------

### Control OpenTUI Render Loop

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderer.mdx

Provides examples for controlling the OpenTUI render loop. This includes starting and stopping continuous rendering, requesting and dropping 'live' mode for animations, and pausing or resuming the renderer. The default mode re-renders only when the component tree changes.

```typescript
// Automatic mode (default)
const renderer = await createCliRenderer()
renderer.root.add(Text({ content: "Static content" })) // Triggers render

// Continuous mode
renderer.start() // Start continuous rendering
renderer.stop() // Stop the render loop

// Live rendering
// Request live mode (increments internal counter)
renderer.requestLive()
// When animation completes, drop the request
renderer.dropLive()

// Pause and suspend
renderer.pause() // Pause rendering (can resume)
renderer.resume() // Resume from paused state

renderer.suspend() // Fully suspend (disables mouse, input, raw mode)
renderer.resume() // Resume from suspended state
```

--------------------------------

### Construct Input Field using Construct API - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/input.mdx

Shows how to create an input field using the Input construct from OpenTUI. This method is more concise for basic input creation. It sets a placeholder and width, then focuses the input and adds it to the renderer.

```typescript
import { Input, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const input = Input({
  placeholder: "Enter your name...",
  width: 25,
})

input.focus()
renderer.root.add(input)
```

--------------------------------

### Apply Text Attributes with OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/text.mdx

Illustrates how to combine multiple text attributes like BOLD and UNDERLINE using bitwise OR operations with the TextAttributes enum in OpenTUI. This allows for enhanced text styling.

```typescript
import { TextRenderable, TextAttributes } from "@opentui/core"

const styledText = new TextRenderable(renderer, {
  id: "styled",
  content: "Important Message",
  fg: "#FFFF00",
  attributes: TextAttributes.BOLD | TextAttributes.UNDERLINE,
})
```

--------------------------------

### Get Reactive Terminal Dimensions in Solid.js

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

Utilizes the `useTerminalDimensions` hook to obtain reactive terminal dimensions as a Solid.js signal. This allows components to automatically update when the terminal size changes.

```tsx
import { useTerminalDimensions } from "@opentui/solid"

const App = () => {
  const dimensions = useTerminalDimensions()

  return (
    <text>
      Terminal: {dimensions().width}x{dimensions().height}
    </text>
  )
}
```

--------------------------------

### SolidJS Integration with OpenTUI Render

Source: https://context7.com/anomalyco/opentui/llms.txt

This example shows how to integrate OpenTUI with SolidJS, leveraging reactive primitives to build terminal UIs. It utilizes hooks like `useKeyboard`, `useRenderer`, and `useTerminalDimensions` to manage user input, rendering, and terminal size. The code demonstrates creating a dynamic counter, handling keyboard events, displaying terminal dimensions, and implementing a basic input field.

```tsx
import { render } from "@opentui/solid"
import { useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/solid"
import { createSignal, onMount, onCleanup } from "solid-js"
import { ConsolePosition } from "@opentui/core"

const App = () => {
  const renderer = useRenderer()
  const dimensions = useTerminalDimensions()
  const [count, setCount] = createSignal(0)
  const [message, setMessage] = createSignal("")

  useKeyboard((key) => {
    if (key.name === "space") {
      setCount((c) => c + 1)
    }
    if (key.ctrl && key.name === "c") {
      renderer.destroy()
    }
  })

  onMount(() => {
    const interval = setInterval(() => {
      setCount((c) => c + 1)
    }, 1000)
    onCleanup(() => clearInterval(interval))
  })

  return (
    <box flexDirection="column" padding={2} gap={1}>
      <text
        content="SolidJS + OpenTUI"
        fg="#00FF00"
        attributes={1}  // BOLD
      />
      <text content={`Count: ${count()}`} fg="#FFFF00" />
      <text
        content={`Terminal: ${dimensions().width}x${dimensions().height}`}
        fg="#888888"
      />

      <box title="Input" border={true} width={40} height={3} marginTop={1}>
        <input
          placeholder="Type here..."
          onInput={(value) => setMessage(value)}
          onSubmit={(value) => console.log("Submitted:", value)}
          focused={true}
        />
      </box>

      <text content={`Message: ${message()}`} fg="#00AAFF" />
    </box>
  )
}

render(App, {
  targetFps: 30,
  exitOnCtrlC: false,
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 30,
  },
})
```

--------------------------------

### Box as Layout Container - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/box.mdx

Demonstrates using the Box component as a flex container in TypeScript. It illustrates properties like `flexDirection`, `justifyContent`, and `alignItems` to manage the layout of child elements within the box.

```typescript
const container = Box(
  {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "stretch",
    width: 50,
    height: 20,
    padding: 1,
    gap: 1,
  },
  Text({ content: "Header" }),
  Box({ flexGrow: 1, backgroundColor: "#222" }, Text({ content: "Content area" })),
  Text({ content: "Footer" }),
)
```

--------------------------------

### Render ASCII Text with Renderable API

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/ascii-font.mdx

Renders ASCII text using the `ASCIIFontRenderable` API. This method requires a renderer instance and accepts an options object for text, font, color, and positioning. It's useful for creating and managing ASCII text elements within the UI.

```typescript
import { ASCIIFontRenderable, RGBA, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const title = new ASCIIFontRenderable(renderer, {
  id: "title",
  text: "OPENTUI",
  font: "tiny",
  color: RGBA.fromInts(255, 255, 255, 255),
})

renderer.root.add(title)
```

--------------------------------

### Detect Function and Arrow Key Presses in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/keyboard.mdx

This code demonstrates how to handle presses of function keys (F1-F12) and arrow keys (up, down, left, right). It uses simple conditional checks for function keys and a switch statement for arrow keys, facilitating navigation and command execution.

```typescript
keyHandler.on("keypress", (key: KeyEvent) => {
  // F1-F12
  if (key.name === "f1") {
    showHelp()
  }

  if (key.name === "f5") {
    refresh()
  }
})

keyHandler.on("keypress", (key: KeyEvent) => {
  switch (key.name) {
    case "up":
      moveCursorUp()
      break
    case "down":
      moveCursorDown()
      break
    case "left":
      moveCursorLeft()
      break
    case "right":
      moveCursorRight()
      break
  }
})
```

--------------------------------

### Basic Usage of Constructs in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/constructs.mdx

This code snippet demonstrates the basic usage of constructs in TypeScript to create and add UI elements to the renderer. It imports necessary components from the OpenTUI core library and uses them to define the structure of the UI, including a box, text, and input field.

```typescript
import { createCliRenderer, Box, Text, Input } from "@opentui/core"

const renderer = await createCliRenderer()

renderer.root.add(
  Box(
    { width: 40, height: 10, borderStyle: "rounded", padding: 1 },
    Text({ content: "Welcome!" }),
    Input({ placeholder: "Enter your name..." }),
  ),
)
```

--------------------------------

### Draw Progress Bar in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/frame-buffer.mdx

Demonstrates how to draw a progress bar on a frame buffer using specified coordinates, dimensions, progress percentage, and colors. It utilizes `setCell` to render filled and empty portions of the bar.

```typescript
const EMPTY_BG = RGBA.fromHex("#222222")

function drawProgressBar(fb, x, y, width, progress, color) {
  const filled = Math.floor(width * progress)

  // Draw filled portion
  for (let i = 0; i < filled; i++) {
    fb.setCell(x + i, y, "█", color, EMPTY_BG)
  }

  // Draw empty portion
  for (let i = filled; i < width; i++) {
    fb.setCell(x + i, y, "░", RGBA.fromHex("#333333"), EMPTY_BG)
  }
}

// Usage
drawProgressBar(canvas.frameBuffer, 5, 10, 30, 0.75, RGBA.fromHex("#00FF00"))
```

--------------------------------

### Add Multiple Tree-Sitter Languages Programmatically (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/tree-sitter.md

Illustrates how to add support for multiple languages (Python, Rust, Go) by providing their configurations to `addDefaultParsers` before initializing the Tree-Sitter client.

```typescript
import { addDefaultParsers, getTreeSitterClient, SyntaxStyle } from "@opentui/core"

// Add support for multiple languages before initializing
addDefaultParsers([
  {
    filetype: "python",
    wasm: "https://github.com/tree-sitter/tree-sitter-python/releases/download/v0.23.6/tree-sitter-python.wasm",
    queries: {
      highlights: ["https://raw.githubusercontent.com/tree-sitter/tree-sitter-python/master/queries/highlights.scm"],
    },
  },
  {
    filetype: "rust",
    wasm: "https://github.com/tree-sitter/tree-sitter-rust/releases/download/v0.23.2/tree-sitter-rust.wasm",
    queries: {
      highlights: ["https://raw.githubusercontent.com/tree-sitter/tree-sitter-rust/master/queries/highlights.scm"],
    },
  },
  {
    filetype: "go",
    wasm: "https://github.com/tree-sitter/tree-sitter-go/releases/download/v0.23.4/tree-sitter-go.wasm",
    queries: {
      highlights: ["https://raw.githubusercontent.com/tree-sitter/tree-sitter-go/master/queries/highlights.scm"],
    },
  },
])

// Initialize the client
const client = getTreeSitterClient()
await client.initialize()

// Use with different languages
const syntaxStyle = new SyntaxStyle()

const pythonResult = await client.highlightOnce('def hello():\n    print("world")', "python")

const rustResult = await client.highlightOnce('fn main() {\n    println!("Hello");\n}', "rust")

const goResult = await client.highlightOnce('func main() {\n    fmt.Println("Hello")\n}', "go")
```

--------------------------------

### Define Custom Syntax Styles - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/code.mdx

Defines custom syntax highlighting styles using `SyntaxStyle.fromStyles()`. This allows granular control over the appearance of various code tokens like keywords, strings, comments, and functions, using RGBA color values and text attributes.

```typescript
import { SyntaxStyle, RGBA, parseColor } from "@opentui/core"

const syntaxStyle = SyntaxStyle.fromStyles({
  // Basic tokens
  keyword: { fg: RGBA.fromHex("#FF7B72"), bold: true },
  "keyword.import": { fg: RGBA.fromHex("#FF7B72"), bold: true },
  "keyword.operator": { fg: RGBA.fromHex("#FF7B72") },

  string: { fg: RGBA.fromHex("#A5D6FF") },
  comment: { fg: RGBA.fromHex("#8B949E"), italic: true },
  number: { fg: RGBA.fromHex("#79C0FF") },
  boolean: { fg: RGBA.fromHex("#79C0FF") },
  constant: { fg: RGBA.fromHex("#79C0FF") },

  // Functions and types
  function: { fg: RGBA.fromHex("#D2A8FF") },
  "function.call": { fg: RGBA.fromHex("#D2A8FF") },
  "function.method.call": { fg: RGBA.fromHex("#D2A8FF") },
  type: { fg: RGBA.fromHex("#FFA657") },
  constructor: { fg: RGBA.fromHex("#FFA657") },

  // Variables and properties
  variable: { fg: RGBA.fromHex("#E6EDF3") },
  "variable.member": { fg: RGBA.fromHex("#79C0FF") },
  property: { fg: RGBA.fromHex("#79C0FF") },

  // Operators and punctuation
  operator: { fg: RGBA.fromHex("#FF7B72") },
  punctuation: { fg: RGBA.fromHex("#F0F6FC") },
  "punctuation.bracket": { fg: RGBA.fromHex("#F0F6FC") },
  "punctuation.delimiter": { fg: RGBA.fromHex("#C9D1D9") },

  // Default fallback
  default: { fg: RGBA.fromHex("#E6EDF3") },
})
```

--------------------------------

### Create Text Input with Cursor and Focus States (TypeScript)

Source: https://context7.com/anomalyco/opentui/llms.txt

Implements a text input field with cursor support, placeholder text, and distinct visual styles for focused states. It listens for input changes and submission events.

```typescript
import {
  createCliRenderer,
  InputRenderable,
  InputRenderableEvents,
  BoxRenderable,
} from "@opentui/core"

const renderer = await createCliRenderer()

const container = new BoxRenderable(renderer, {
  id: "form",
  width: 50,
  height: 10,
  position: "absolute",
  left: 5,
  top: 2,
  flexDirection: "column",
  gap: 1,
})

const nameInput = new InputRenderable(renderer, {
  id: "name-input",
  width: 40,
  placeholder: "Enter your name...",
  focusedBackgroundColor: "#1a1a1a",
  focusedBorderColor: "#00AAFF",
})

// Listen for input changes
nameInput.on(InputRenderableEvents.CHANGE, (value: string) => {
  console.log("Input value:", value)
})

// Listen for submit (Enter key)
nameInput.on(InputRenderableEvents.SUBMIT, (value: string) => {
  console.log("Submitted:", value)
})

container.add(nameInput)
renderer.root.add(container)

// Focus the input to receive keyboard events
nameInput.focus()
```

--------------------------------

### Handle Basic Keypress Events in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/keyboard.mdx

This snippet demonstrates how to set up a listener for 'keypress' events using OpenTUI's `keyInput` EventEmitter. It logs various properties of the `KeyEvent` object, such as the key name, sequence, and modifier states (Ctrl, Shift, Alt, Option).

```typescript
import { createCliRenderer, type KeyEvent } from "@opentui/core"

const renderer = await createCliRenderer()
const keyHandler = renderer.keyInput

keyHandler.on("keypress", (key: KeyEvent) => {
  console.log("Key name:", key.name)
  console.log("Sequence:", key.sequence)
  console.log("Ctrl pressed:", key.ctrl)
  console.log("Shift pressed:", key.shift)
  console.log("Alt pressed:", key.meta)
  console.log("Option pressed:", key.option)
})
```

--------------------------------

### Manage Renderable Tree Structure in OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables.mdx

Illustrates how to build a hierarchical structure of renderables using `add()` and `remove()` methods. This allows for complex UI layouts by nesting elements like containers, titles, and bodies.

```typescript
const container = new BoxRenderable(renderer, {
  id: "container",
  flexDirection: "column",
  padding: 1,
})

const title = new TextRenderable(renderer, { id: "title", content: "My App" })
const body = new TextRenderable(renderer, { id: "body", content: "Content here" })

container.add(title)
container.add(body)

renderer.root.add(container)

// Later, remove a child
container.remove("body")
```

--------------------------------

### Optimize RGBA Object Creation in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/frame-buffer.mdx

Illustrates performance tips for OpenTUI, specifically focusing on reusing RGBA objects to minimize object creation within loops. It contrasts efficient constant creation with inefficient repeated `fromHex` calls.

```typescript
// Good: Create once, reuse
const RED = RGBA.fromHex("#FF0000")
const GREEN = RGBA.fromHex("#00FF00")
const BG = RGBA.fromHex("#000000")

for (let i = 0; i < 100; i++) {
  fb.setCell(i, 5, "*", RED, BG)
}

// Avoid: Creating new RGBA objects in loops
for (let i = 0; i < 100; i++) {
  fb.setCell(i, 5, "*", RGBA.fromHex("#FF0000"), RGBA.fromHex("#000000")) // Creates 200 objects
}
```

--------------------------------

### Create Horizontal Tab Selection Component (TypeScript)

Source: https://context7.com/anomalyco/opentui/llms.txt

Implements a horizontal tab-based selection component with descriptions for each tab and support for scrolling if options exceed available width. It emits an event when a tab is selected.

```typescript
import {
  createCliRenderer,
  TabSelectRenderable,
  TabSelectRenderableEvents,
} from "@opentui/core"

const renderer = await createCliRenderer()

const tabs = new TabSelectRenderable(renderer, {
  id: "navigation-tabs",
  width: 70,
  options: [
    { name: "Home", description: "Dashboard and overview" },
    { name: "Files", description: "File management" },
    { name: "Settings", description: "Application settings" },
    { name: "Help", description: "Documentation and support" },
  ],
  tabWidth: 15,
  position: "absolute",
  left: 2,
  top: 1,
})

tabs.on(TabSelectRenderableEvents.ITEM_SELECTED, (index: number, option: { name: string }) => {
  console.log("Tab selected:", option.name)
})

renderer.root.add(tabs)
tabs.focus()  // Navigate with left/right/[/], select with Enter
```

--------------------------------

### ScrollBox scrollBy Method

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/scrollbox.mdx

Demonstrates the usage of the `scrollBy` method on a ScrollBox instance to scroll content by a relative amount. It supports scrolling by lines, viewports, or specific x/y offsets.

```typescript
// Scroll down 5 lines
scrollbox.scrollBy(5)

// Scroll with both x and y
scrollbox.scrollBy({ x: 10, y: 5 })

// Scroll by viewport (page)
scrollbox.scrollBy(1, "viewport")
```

--------------------------------

### Create and Render FrameBuffer using Renderable API (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/frame-buffer.mdx

Demonstrates creating a FrameBufferRenderable instance and drawing basic shapes and text onto it using the Renderable API. It requires the 'createCliRenderer' and 'FrameBufferRenderable' from '@opentui/core'. The output is a visual representation on the CLI.

```typescript
import { FrameBufferRenderable, RGBA, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const canvas = new FrameBufferRenderable(renderer, {
  id: "canvas",
  width: 50,
  height: 20,
})

// Draw on the frame buffer
canvas.frameBuffer.fillRect(5, 2, 20, 10, RGBA.fromHex("#FF0000"))
canvas.frameBuffer.drawText("Hello!", 8, 6, RGBA.fromHex("#FFFFFF"))

renderer.root.add(canvas)
```

--------------------------------

### Parse Various Color Formats to RGBA in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/colors.mdx

Utilizes the `parseColor` utility function to convert different color representations, including hex strings, CSS color names, the string 'transparent', and existing RGBA objects, into a standardized RGBA object.

```typescript
import { parseColor } from "@opentui/core"

const color1 = parseColor("#FF0000") // Hex
const color2 = parseColor("blue") // CSS color name
const color3 = parseColor("transparent") // Transparent
const color4 = parseColor(RGBA.fromInts(255, 0, 0, 255)) // Pass-through
```

--------------------------------

### Enable Viewport Culling in ScrollBox

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/scrollbox.mdx

Activates viewport culling for a ScrollBox, optimizing performance by only rendering the children that are currently visible within the viewport. This is beneficial for handling large amounts of content.

```typescript
const scrollbox = new ScrollBoxRenderable(renderer, {
  id: "large-list",
  width: 40,
  height: 20,
  viewportCulling: true, // Only render visible items
})
```

--------------------------------

### Display ASCII Art Text with OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/getting-started.md

Shows how to use the `ASCIIFontRenderable` component to display text using various ASCII art fonts. This example sets the text content, font style, color using RGBA, and its position on the screen.

```typescript
import { ASCIIFontRenderable, RGBA } from "@opentui/core"

const title = new ASCIIFontRenderable(renderer, {
  id: "title",
  text: "OPENTUI",
  font: "tiny",
  color: RGBA.fromInts(255, 255, 255, 255),
  position: "absolute",
  left: 10,
  top: 2,
})
```

--------------------------------

### Display Text with ASCII Art Fonts (TypeScript)

Source: https://context7.com/anomalyco/opentui/llms.txt

Renders text using various ASCII art font styles. This component allows customization of text content, font type, color, and position.

```typescript
import { createCliRenderer, ASCIIFontRenderable, RGBA } from "@opentui/core"

const renderer = await createCliRenderer()

const title = new ASCIIFontRenderable(renderer, {
  id: "ascii-title",
  text: "OPENTUI",
  font: "tiny",  // Available: "tiny", "small", "standard", "big", etc.
  color: RGBA.fromHex("#00FF00"),
  position: "absolute",
  left: 5,
  top: 2,
})

renderer.root.add(title)
```

--------------------------------

### Enable Sticky Scroll in ScrollBox

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/scrollbox.mdx

Configures a ScrollBox to use sticky scrolling, ensuring that content remains pinned to a specified edge as new content is added. This is useful for real-time updates like logs or chats.

```typescript
const scrollbox = new ScrollBoxRenderable(renderer, {
  id: "logs",
  width: 60,
  height: 20,
  stickyScroll: true,
  stickyStart: "bottom", // New content will keep the view scrolled to bottom
})
```

--------------------------------

### Handle Keyboard Events in Solid.js OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

Shows how to use the `useKeyboard` hook to subscribe to keyboard events in a Solid.js OpenTUI application. The example demonstrates exiting the application when the 'escape' key is pressed and handling key release events.

```tsx
import { useKeyboard } from "@opentui/solid"

const App = () => {
  useKeyboard((key) => {
    if (key.name === "escape") {
      process.exit(0)
    }
  })

  return <text>Press ESC to exit</text>
}
```

```tsx
import { createSignal } from "solid-js"
import { useKeyboard } from "@opentui/solid"

const App = () => {
  const [pressedKeys, setPressedKeys] = createSignal(new Set<string>())

  useKeyboard(
    (event) => {
      setPressedKeys((keys) => {
        const newKeys = new Set(keys)
        if (event.eventType === "release") {
          newKeys.delete(event.name)
        } else {
          newKeys.add(event.name)
        }
        return newKeys
      })
    },
    { release: true },
  )

  return <text>Pressed: {Array.from(pressedKeys()).join(", ") || "none"}</text>
}
```

--------------------------------

### Box Titles and Alignment - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/box.mdx

Shows how to add a title to a Box component's border and control its alignment using TypeScript. The `title` property sets the text, and `titleAlignment` positions it within the border.

```typescript
const panel = new BoxRenderable(renderer, {
  id: "settings",
  width: 40,
  height: 15,
  borderStyle: "rounded",
  title: "Settings",
  titleAlignment: "center",
})

// Title alignment examples:
{
  titleAlignment: "left"
} // ┌─ Title ────────┐
{
  titleAlignment: "center"
} // ┌──── Title ─────┐
{
  titleAlignment: "right"
} // ┌────────── Title ┐
```

--------------------------------

### Combine Multiple Highlight Queries for TypeScript (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/tree-sitter.md

Demonstrates how to configure Tree-Sitter for TypeScript by combining multiple highlight query files. It specifies the base ECMAScript/JavaScript queries along with TypeScript-specific queries in the `highlights` array for `addDefaultParsers`.

```typescript
addDefaultParsers([
  {
    filetype: "typescript",
    wasm: "https://github.com/tree-sitter/tree-sitter-typescript/releases/download/v0.23.2/tree-sitter-typescript.wasm",
    queries: {
      highlights: [
        // Base ECMAScript/JavaScript queries
        "https://raw.githubusercontent.com/nvim-treesitter/nvim-treesitter/master/queries/ecma/highlights.scm",
        // TypeScript-specific queries
        "https://raw.githubusercontent.com/nvim-treesitter/nvim-treesitter/master/queries/typescript/highlights.scm",
      ],
    },
  },
])
```

--------------------------------

### Handle Paste Events in Solid.js OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

Shows how to use the `usePaste` hook to subscribe to paste events in a Solid.js OpenTUI application. The provided handler function receives an event object containing the pasted text.

```tsx
import { usePaste } from "@opentui/solid"

const App = () => {
  usePaste((event) => {
    console.log("Pasted:", event.text)
  })

  return <text>Paste something!</text>
}
```

--------------------------------

### Toggle and Configure Debug Overlay with TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderer.mdx

Illustrates how to toggle the debug overlay on and off, and how to configure its appearance and position. The debug overlay displays performance metrics like FPS and memory usage, which is useful for performance monitoring and debugging.

```typescript
renderer.toggleDebugOverlay()

import { DebugOverlayCorner } from "@opentui/core"

renderer.configureDebugOverlay({
  enabled: true,
  corner: DebugOverlayCorner.topRight,
})
```

--------------------------------

### Customize ScrollBox Sub-components

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/scrollbox.mdx

Allows for individual styling of the internal components within a ScrollBox, such as the root, wrapper, viewport, and content areas. This provides fine-grained control over the visual appearance of the scrollable container.

```typescript
const scrollbox = new ScrollBoxRenderable(renderer, {
  id: "custom-scroll",
  width: 40,
  height: 20,
  rootOptions: {
    backgroundColor: "#24283b",
  },
  wrapperOptions: {
    backgroundColor: "#1f2335",
  },
  viewportOptions: {
    backgroundColor: "#1a1b26",
  },
  contentOptions: {
    backgroundColor: "#16161e",
  },
})
```

--------------------------------

### Draw Text on FrameBuffer (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/frame-buffer.mdx

Explains the 'drawText' method for rendering strings onto the FrameBuffer. It takes the text content, starting position (x, y), foreground color, and optional background color and attributes. This is used for displaying labels, scores, or messages.

```typescript
canvas.frameBuffer.drawText(
  text, // String to draw
  x, // Starting X position
  y, // Y position
  fg, // Text color (RGBA)
  bg, // Background color (RGBA, optional)
  attributes, // Text attributes (optional, default: 0)
)

// Example
canvas.frameBuffer.drawText("Score: 100", 2, 1, RGBA.fromHex("#00FF00"))
```

--------------------------------

### Configure Text Selection in OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/text.mdx

Demonstrates how to enable or disable text selection for TextRenderable components in OpenTUI. The `selectable` property defaults to true and can be explicitly set to false.

```typescript
const selectableText = new TextRenderable(renderer, {
  id: "selectable",
  content: "Select me!",
  selectable: true, // Default is true
})

const nonSelectable = new TextRenderable(renderer, {
  id: "label",
  content: "Button Label",
  selectable: false, // Disable selection
})
```

--------------------------------

### Create Rich Text with Template Literals in OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/text.mdx

Demonstrates using the `t` template literal for inline styling within a single text element in OpenTUI. It supports combining various style functions like bold, underline, and foreground color.

```typescript
import { TextRenderable, t, bold, underline, fg, bg, italic } from "@opentui/core"

const richText = new TextRenderable(renderer, {
  id: "rich",
  content: t`${bold("Important:")} ${fg("#FF0000")(underline("Warning!"))} Normal text`,
})
```

--------------------------------

### Handle Modifier Key Combinations in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/keyboard.mdx

This snippet shows how to detect key combinations involving modifier keys like Ctrl, Shift, and Alt (Meta). It provides examples for Ctrl+C, Ctrl+S, Shift+F1, and Alt+Enter, enabling the implementation of shortcuts.

```typescript
keyHandler.on("keypress", (key: KeyEvent) => {
  // Ctrl+C
  if (key.ctrl && key.name === "c") {
    console.log("Ctrl+C pressed!")
  }

  // Ctrl+S
  if (key.ctrl && key.name === "s") {
    console.log("Save shortcut!")
  }

  // Shift+F1
  if (key.shift && key.name === "f1") {
    console.log("Shift+F1 pressed!")
  }

  // Alt+Enter
  if (key.meta && key.name === "return") {
    console.log("Alt+Enter pressed!")
  }
})
```

--------------------------------

### Using delegate() Function in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/constructs.mdx

This code snippet demonstrates the use of the `delegate()` function in TypeScript to forward method calls and property access to child components within a composite construct. It allows for creating components where interactions on the parent are routed to specific children.

```typescript
import { delegate, Box, Text, Input } from "@opentui/core"

function LabeledInput(props: { id: string; label: string; placeholder: string }) {
  return delegate(
    {
      focus: `${props.id}-input`, // Route focus() to the input
      value: `${props.id}-input`, // Route value property access
    },
    Box(
      { flexDirection: "row" },
      Text({ content: props.label }),
      Input({
        id: `${props.id}-input`,
        placeholder: props.placeholder,
        width: 20,
      }),
    ),
  )
}

const username = LabeledInput({ id: "username", label: "Username:", placeholder: "Enter username..." })

// This actually focuses the nested Input, not the outer Box
username.focus()

renderer.root.add(username)
```

--------------------------------

### Control Renderable Visibility with `visible` Property

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables.mdx

Manage the visibility of a renderable element. Setting `visible` to `false` hides the element and removes it from layout calculations, similar to CSS `display: none`.

```typescript
panel.visible = false

panel.visible = true
```

--------------------------------

### Create RGBA Colors from Hex Strings in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/colors.mdx

Illustrates creating RGBA color objects from hexadecimal color strings using `RGBA.fromHex`. It supports both shorthand (e.g., '#RGB') and full (e.g., '#RRGGBB') hex codes, as well as including an alpha channel (e.g., '#RRGGBBAA').

```typescript
const purple = RGBA.fromHex("#800080")
const withAlpha = RGBA.fromHex("#FF000080") // Semi-transparent red
```

--------------------------------

### Enable Concealment for Code - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/code.mdx

Controls the concealment of certain syntax elements, like markdown formatting characters, within the CodeRenderable component. Set the `conceal` option to `true` to hide these characters.

```typescript
const code = new CodeRenderable(renderer, {
  id: "markdown",
  content: "# Heading\n**bold** text",
  filetype: "markdown",
  syntaxStyle,
  conceal: true, // Hide formatting characters
})
```

--------------------------------

### Mock Keyboard Input Simulation

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/src/testing/README.md

Simulates keyboard input using a mock input handler. Supports typing text with optional delays, pressing single keys, pressing keys with modifiers (Ctrl, Shift, Meta), and using convenience methods for common keys.

```typescript
import { createMockKeys, KeyCodes } from "@opentui/core/testing"

const mockInput = createMockKeys(renderer)

// Type text
mockInput.typeText("hello world")
await mockInput.typeText("hello", 10) // 10ms delay between keys

// Press single keys
mockInput.pressKey("a")
mockInput.pressKey(KeyCodes.ENTER)

// Press keys with modifiers
mockInput.pressKey("a", { ctrl: true })
mockInput.pressKey("f", { meta: true })
mockInput.pressKey("z", { ctrl: true, shift: true })
mockInput.pressKey(KeyCodes.ARROW_LEFT, { meta: true })

// Press multiple keys
mockInput.pressKeys(["h", "e", "l", "l", "o"])
await mockInput.pressKeys(["a", "b"], 10) // with delay

// Convenience methods
mockInput.pressEnter()
mockInput.pressEnter({ meta: true })
mockInput.pressEscape()
mockInput.pressTab()
mockInput.pressBackspace()
mockInput.pressArrow("up" | "down" | "left" | "right")
mockInput.pressArrow("left", { meta: true })
mockInput.pressCtrlC()
mockInput.pasteBracketedText("paste content")
```

--------------------------------

### Enable Bidirectional Scrolling in ScrollBox

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/scrollbox.mdx

Sets up a ScrollBox to allow scrolling in both horizontal and vertical directions. By default, only vertical scrolling is enabled.

```typescript
const scrollbox = new ScrollBoxRenderable(renderer, {
  id: "canvas",
  width: 60,
  height: 30,
  scrollX: true,
  scrollY: true,
})
```

--------------------------------

### Configure TypeScript for Solid.js JSX

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

Sets up the `tsconfig.json` file to enable JSX compilation for Solid.js, specifying the JSX factory and import source. This is crucial for using JSX syntax in your Solid.js components.

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@opentui/solid"
  }
}
```

--------------------------------

### Alpha Blending with `setCellWithAlphaBlending` in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/colors.mdx

Explains how to achieve layered visual effects by drawing with transparency. The `setCellWithAlphaBlending` method on a `FrameBufferRenderable` allows combining a background cell color with a foreground cell color based on their alpha values.

```typescript
import { FrameBufferRenderable, RGBA } from "@opentui/core"

const canvas = new FrameBufferRenderable(renderer, {
  id: "canvas",
  width: 50,
  height: 20,
})

// Draw with alpha blending
const semiTransparent = RGBA.fromValues(1.0, 0.0, 0.0, 0.5)
const transparent = RGBA.fromInts(0, 0, 0, 0)
canvas.frameBuffer.setCellWithAlphaBlending(10, 5, " ", transparent, semiTransparent)
```

--------------------------------

### Construct Text Element with OpenTUI Core

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/text.mdx

Shows how to create a Text element using the Construct API in OpenTUI. This method is a more concise way to add text to the renderer's root, specifying content and foreground color.

```typescript
import { Text, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

renderer.root.add(
  Text({
    content: "Hello, OpenTUI!",
    fg: "#00FF00",
  }),
)
```

--------------------------------

### ScrollBox scrollTo Method

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/scrollbox.mdx

Shows how to use the `scrollTo` method to move the ScrollBox content to an absolute position. This allows for precise positioning, such as scrolling to the top or a specific coordinate.

```typescript
// Scroll to top
scrollbox.scrollTo(0)

// Scroll to specific position
scrollbox.scrollTo({ x: 0, y: 100 })
```

--------------------------------

### Finding Tree-Sitter Highlight Queries (TypeScript Example)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/tree-sitter.md

Provides URL patterns for locating Tree-Sitter highlight query files (`.scm`). It includes URLs for official parser repositories and a more comprehensive source from `nvim-treesitter`, showing how to construct these URLs for different languages.

```typescript
// Official queries:
const queryUrl = "https://raw.githubusercontent.com/tree-sitter/tree-sitter-{language}/master/queries/highlights.scm"

// Or from nvim-treesitter (often more comprehensive):
const nvimQueryUrl =
  "https://raw.githubusercontent.com/nvim-treesitter/nvim-treesitter/master/queries/{language}/highlights.scm"
```

--------------------------------

### Box Border Styles - TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/box.mdx

Provides examples of different border styles available for the Box component in TypeScript. These styles control the appearance of the box's outline, ranging from no border to heavy lines.

```typescript
// No border
{
  border: false
}

// Simple border (default style)
{
  border: true
}

// Specific border styles
{
  borderStyle: "single"
} // Single line: ┌─┐│└─┘
{
  borderStyle: "double"
} // Double line: ╔═╗║╚═╝
{
  borderStyle: "rounded"
} // Rounded corners: ╭─╮│╰─╯
{
  borderStyle: "heavy"
} // Heavy lines: ┏━┓┃┗━┛
```

--------------------------------

### Add Custom Input Handlers with TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderer.mdx

Shows how to add custom input handlers to the OpenTUI renderer. These handlers can intercept and process specific key sequences, allowing for custom keyboard shortcuts or command handling. Handlers can be appended or prepended to the processing chain.

```typescript
renderer.addInputHandler((sequence) => {
  if (sequence === "\x1b[A") {
    // Up arrow - handle and consume
    return true
  }
  return false // Let other handlers process
})
```

--------------------------------

### Simple Game Canvas Example

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/frame-buffer.mdx

A comprehensive example demonstrating how to use FrameBufferRenderable and its drawing methods to create a simple interactive game canvas with player movement and a border.

```APIDOC
## Simple Game Canvas Example

### Description

This example showcases a practical application of the FrameBuffer API by creating a basic game canvas. It includes rendering a game state, handling user input for player movement, and drawing game elements like borders and player characters.

### Method

N/A (Illustrative example using class instantiation and event handling)

### Endpoint

N/A

### Request Example

```typescript
import { FrameBufferRenderable, RGBA, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const gameCanvas = new FrameBufferRenderable(renderer, {
  id: "game",
  width: 40,
  height: 20,
  position: "absolute",
  left: 5,
  top: 2,
})

// Game state
let playerX = 20
let playerY = 10

function render() {
  const fb = gameCanvas.frameBuffer
  const BG = RGBA.fromHex("#111111")

  // Clear the canvas
  fb.fillRect(0, 0, 40, 20, BG)

  // Draw border
  for (let x = 0; x < 40; x++) {
    fb.setCell(x, 0, "-", RGBA.fromHex("#444444"), BG)
    fb.setCell(x, 19, "-", RGBA.fromHex("#444444"), BG)
  }
  for (let y = 0; y < 20; y++) {
    fb.setCell(0, y, "|", RGBA.fromHex("#444444"), BG)
    fb.setCell(39, y, "|", RGBA.fromHex("#444444"), BG)
  }

  // Draw player
  fb.setCell(playerX, playerY, "@", RGBA.fromHex("#00FF00"), BG)

  // Draw score
  fb.drawText("Score: 0", 2, 0, RGBA.fromHex("#FFFF00"))
}

// Handle input
renderer.keyInput.on("keypress", (key) => {
  switch (key.name) {
    case "up":
      playerY = Math.max(1, playerY - 1)
      break
    case "down":
      playerY = Math.min(18, playerY + 1)
      break
    case "left":
      playerX = Math.max(1, playerX - 1)
      break
    case "right":
      playerX = Math.min(38, playerX + 1)
      break
  }
  render()
})

render()
renderer.root.add(gameCanvas)
```

### Response

(This example does not return a specific API response, but rather renders a visual output to the console.)
```

--------------------------------

### Create Custom Graphics with Frame Buffer (TypeScript)

Source: https://context7.com/anomalyco/opentui/llms.txt

Provides a low-level rendering surface for creating custom graphics and complex visual effects. It exposes a frame buffer object for direct drawing operations like filling rectangles, drawing text, and setting individual cells.

```typescript
import { createCliRenderer, FrameBufferRenderable, RGBA } from "@opentui/core"

const renderer = await createCliRenderer()

const canvas = new FrameBufferRenderable(renderer, {
  id: "custom-canvas",
  width: 60,
  height: 20,
  position: "absolute",
  left: 5,
  top: 5,
})

// Access the frame buffer for custom drawing
const fb = canvas.frameBuffer

// Fill a rectangle
fb.fillRect(5, 2, 20, 8, RGBA.fromHex("#FF5500"))

// Draw text
fb.drawText("Custom Graphics!", 7, 5, RGBA.fromHex("#FFFFFF"))

// Draw individual cells
fb.setCell(30, 10, "X".codePointAt(0)!, RGBA.fromHex("#00FF00"), RGBA.fromHex("#000000"))

renderer.root.add(canvas)
```

--------------------------------

### Implement Mouse Interaction with Mouse Events

Source: https://context7.com/anomalyco/opentui/llms.txt

Demonstrates how to enable and handle mouse events for interactive UI elements in OpenTUI. This example configures the renderer to use mouse input, creates a BoxRenderable element, and attaches event handlers for mouse down, mouse up, mouse over, mouse out, and mouse scroll events. It logs coordinates on click and changes the button's appearance based on hover state.

```typescript
import { createCliRenderer, BoxRenderable, MouseButton } from "@opentui/core"

const renderer = await createCliRenderer({
  useMouse: true,
  enableMouseMovement: true,
})

const button = new BoxRenderable(renderer, {
  id: "clickable-button",
  width: 20,
  height: 3,
  backgroundColor: "#444488",
  borderStyle: "single",
  position: "absolute",
  left: 10,
  top: 5,
  onMouseDown: (event) => {
    if (event.button === MouseButton.LEFT) {
      console.log(`Clicked at (${event.x}, ${event.y})`)
      button.backgroundColor = "#6666AA"
    }
  },
  onMouseUp: (event) => {
    button.backgroundColor = "#444488"
  },
  onMouseOver: (event) => {
    button.borderColor = "#00AAFF"
  },
  onMouseOut: (event) => {
    button.borderColor = "#FFFFFF"
  },
  onMouseScroll: (event) => {
    console.log("Scroll:", event.scroll?.direction)
  },
})

renderer.root.add(button)

```

--------------------------------

### Flex Direction Options

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/layout.mdx

Illustrates the different options for setting the flex direction of child elements within a container. This controls whether items are laid out horizontally or vertically.

```typescript
// Vertical layout (default)
{
  flexDirection: "column"
}

// Horizontal layout
{
  flexDirection: "row"
}

// Reversed directions
{
  flexDirection: "row-reverse"
}
{
  flexDirection: "column-reverse"
}
```

--------------------------------

### Set Cell Content and Colors (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/frame-buffer.mdx

Illustrates the 'setCell' method for manipulating individual cells within a FrameBuffer. It allows specifying the character, foreground color, background color, and text attributes at a given (x, y) coordinate. This is a fundamental drawing operation.

```typescript
canvas.frameBuffer.setCell(
  x, // X position
  y, // Y position
  char, // Character to display
  fg, // Foreground color (RGBA)
  bg, // Background color (RGBA)
  attributes, // Text attributes (optional, default: 0)
)

// Example
canvas.frameBuffer.setCell(10, 5, "@", RGBA.fromHex("#FFFF00"), RGBA.fromHex("#000000"))
```

--------------------------------

### Customize Scrollbars in ScrollBox

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/scrollbox.mdx

Applies custom styling to the scrollbars of a ScrollBox, including options for showing arrows and customizing the track's foreground and background colors. Individual vertical and horizontal scrollbars can also be styled separately.

```typescript
const scrollbox = new ScrollBoxRenderable(renderer, {
  id: "styled-scroll",
  width: 40,
  height: 20,
  scrollbarOptions: {
    showArrows: true,
    trackOptions: {
      foregroundColor: "#7aa2f7",
      backgroundColor: "#414868",
    },
  },
  // Or customize vertical and horizontal separately
  verticalScrollbarOptions: {
    trackOptions: { backgroundColor: "#333" },
  },
  horizontalScrollbarOptions: {
    trackOptions: { backgroundColor: "#333" },
  },
})
```

--------------------------------

### Register Custom Tree-sitter Parsers (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/src/lib/tree-sitter/assets/README.md

Demonstrates how to use the generated parsers in an application by importing them and registering them with the OpenTUI Tree-sitter client. This allows the client to handle syntax highlighting for the specified languages.

```typescript
import { getTreeSitterClient } from "@opentui/core"
import { getParsers } from "./parsers"

const client = getTreeSitterClient()

// Register your custom parsers
for (const parser of getParsers()) {
  client.addFiletypeParser(parser)
}
```

--------------------------------

### Find Renderables by ID in OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables.mdx

Shows methods for locating specific renderables within the UI tree. It covers retrieving direct children by ID and recursively searching for descendants.

```typescript
// Get a direct child by ID
const title = container.getRenderable("title")

// Recursively search all descendants
const deepChild = container.findDescendantById("nested-input")

// Get all children
const children = container.getChildren()
```

--------------------------------

### Set Cell with Alpha Blending (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/frame-buffer.mdx

Demonstrates 'setCellWithAlphaBlending' for creating semi-transparent cell effects. This method is useful for layering graphics or creating fading elements. It requires RGBA values for both foreground and background, with alpha controlling transparency.

```typescript
const semiTransparent = RGBA.fromValues(1.0, 0.0, 0.0, 0.5)
const transparent = RGBA.fromValues(0, 0, 0, 0)
canvas.frameBuffer.setCellWithAlphaBlending(10, 5, " ", transparent, semiTransparent)
```

--------------------------------

### Create Welcome Screen with ASCII Font

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/ascii-font.mdx

Combines `Box`, `ASCIIFont`, and `Text` components to create a welcome screen layout. This example demonstrates centering content and using different text styles for titles and messages.

```typescript
import { Box, ASCIIFont, Text, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

const welcomeScreen = Box(
  {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  ASCIIFont({
    text: "OPENTUI",
    font: "huge",
    color: "#00FFFF",
  }),
  Text({
    content: "Terminal UI Framework",
    fg: "#888888",
  }),
  Text({
    content: "Press any key to continue...",
    fg: "#444444",
  }),
)

renderer.root.add(welcomeScreen)
```

--------------------------------

### Test Button Click with OpenTUI and Bun

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/src/testing/README.md

This snippet demonstrates how to test a button's onClick event handler using OpenTUI's testing utilities and the Bun test runner. It sets up a test renderer, adds a button component, simulates a mouse click on the button, and asserts that the onClick handler was called exactly once. Dependencies include `@opentui/core/testing` for the renderer and `bun:test` for testing capabilities.

```typescript
import { test, expect } from "bun:test"
import { createTestRenderer } from "@opentui/core/testing"

test("button click", async () => {
  const { renderer, mockMouse, renderOnce, captureCharFrame } = await createTestRenderer({ width: 80, height: 24 })

  const clicked = createSpy()
  const button = new Button("btn", { text: "Click me", onClick: clicked })

  renderer.add(button)
  await renderOnce()

  await mockMouse.click(10, 5)
  expect(clicked.callCount()).toBe(1)
})
```

--------------------------------

### Create CLI Renderer with Core API (TypeScript)

Source: https://context7.com/anomalyco/opentui/llms.txt

Initializes the main OpenTUI renderer instance using `createCliRenderer` from `@opentui/core`. This manages terminal output, input events, and the rendering loop. It supports configuring FPS, Ctrl+C exit behavior, mouse support, background color, and console overlay options.

```typescript
import { createCliRenderer, ConsolePosition } from "@opentui/core"

const renderer = await createCliRenderer({
  targetFps: 30,
  exitOnCtrlC: true,
  useMouse: true,
  backgroundColor: "#1a1a2e",
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 30,
    colorInfo: "#00FFFF",
    colorWarn: "#FFFF00",
    colorError: "#FF0000",
  },
  onDestroy: () => {
    console.log("Renderer destroyed")
  },
})

// Access renderer properties
console.log(`Terminal size: ${renderer.width}x${renderer.height}`)

// Toggle debug overlay
renderer.toggleDebugOverlay()

// Toggle console overlay
renderer.console.toggle()

// Start the render loop (optional - auto-renders on changes)
renderer.start()

// Cleanup when done
renderer.destroy()
```

--------------------------------

### Programmatically Update Tree-sitter Assets (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/src/lib/tree-sitter/assets/README.md

Imports and uses the `updateAssets` function from the OpenTUI core library to manage tree-sitter assets programmatically. This function allows specifying custom paths for configuration, asset storage, and output.

```typescript
import { updateAssets } from "@opentui/core/lib/tree-sitter/assets/update"

await updateAssets({
  configPath: "./my-parsers-config.json",
  assetsDir: "./src/tree-sitter/assets",
  outputPath: "./src/tree-sitter/parsers.ts",
})
```

--------------------------------

### Handle Keyboard Input Events with KeyEvent

Source: https://context7.com/anomalyco/opentui/llms.txt

Illustrates how to capture and process keyboard input events using OpenTUI's key input handler. This example sets up event listeners for 'keypress' and 'paste' events, logging details about the key pressed (name, sequence, modifiers) or the pasted text. It also shows how to manually handle Ctrl+C for exiting and toggling the console.

```typescript
import { createCliRenderer, type KeyEvent } from "@opentui/core"

const renderer = await createCliRenderer({
  exitOnCtrlC: false,  // Handle Ctrl+C manually
})

const keyHandler = renderer.keyInput

keyHandler.on("keypress", (key: KeyEvent) => {
  console.log("Key:", key.name)
  console.log("Sequence:", key.sequence)
  console.log("Modifiers:", {
    ctrl: key.ctrl,
    shift: key.shift,
    alt: key.meta,
    option: key.option,
  })

  // Handle specific key combinations
  if (key.ctrl && key.name === "c") {
    console.log("Ctrl+C pressed - exiting...")
    renderer.destroy()
  }

  if (key.name === "escape") {
    console.log("Escape pressed")
  }

  if (key.ctrl && key.name === "k") {
    renderer.console.toggle()
  }
})

// Handle paste events
keyHandler.on("paste", (event) => {
  console.log("Pasted text:", event.text)
})

```

--------------------------------

### Sizing Options

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/layout.mdx

Explains how to define the size of elements using fixed character counts, percentages of the parent container, and flex grow/shrink properties.

```typescript
{
  width: 30,   // Fixed width in characters
  height: 10,  // Fixed height in rows
}

{
  width: "100%",  // Full width of parent
  height: "50%",  // Half height of parent
}

{
  flexGrow: 1,    // Take up available space
  flexShrink: 0,  // Don't shrink below content size
  flexBasis: 100, // Initial size before flex adjustments
}
```

--------------------------------

### Finding Official Tree-Sitter Parsers (TypeScript Example)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/tree-sitter.md

Illustrates the standard URL pattern for official Tree-Sitter WASM parsers for various languages like Python, Rust, and Go. This helps in programmatically constructing download URLs for parsers.

```typescript
// Official parsers follow this pattern:
const parserUrl =
  "https://github.com/tree-sitter/tree-sitter-{language}/releases/download/v{version}/tree-sitter-{language}.wasm"

// Examples:
// Python: https://github.com/tree-sitter/tree-sitter-python/releases/download/v0.23.6/tree-sitter-python.wasm
// Rust: https://github.com/tree-sitter/tree-sitter-rust/releases/download/v0.23.2/tree-sitter-rust.wasm
// Go: https://github.com/tree-sitter/tree-sitter-go/releases/download/v0.23.4/tree-sitter-go.wasm
```

--------------------------------

### Destroy Renderables and Clean Up Resources

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables.mdx

Remove renderables from the UI tree and free associated resources. Use `renderable.destroy()` to remove a single renderable or `container.destroyRecursively()` to remove a container and all its children.

```typescript
// Remove from parent and free resources
renderable.destroy()

// Destroy self and all children
container.destroyRecursively()
```

--------------------------------

### Padding and Margin

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/layout.mdx

Demonstrates how to apply padding and margin to elements, both uniformly and for individual sides, to control spacing within and around the content.

```typescript
{
  // Uniform padding
  padding: 2,

  // Individual sides
  paddingTop: 1,
  paddingRight: 2,
  paddingBottom: 1,
  paddingLeft: 2,

  // Margin works the same way
  margin: 1,
  marginTop: 1,
  marginRight: 2,
  marginBottom: 1,
  marginLeft: 2,
}
```

--------------------------------

### Justify Content Options

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/layout.mdx

Shows the various ways to align child elements along the main axis of a flex container. This property distributes space between and around content items.

```typescript
{
  justifyContent: "flex-start"
} // Pack at start
{
  justifyContent: "flex-end"
} // Pack at end
{
  justifyContent: "center"
} // Center children
{
  justifyContent: "space-between"
} // Even spacing, no edge gaps
{
  justifyContent: "space-around"
} // Even spacing with edge gaps
{
  justifyContent: "space-evenly"
} // Truly even spacing
```

--------------------------------

### RGBA Color Utility with OpenTUI

Source: https://context7.com/anomalyco/opentui/llms.txt

Demonstrates creating and parsing RGBA colors using the RGBA class and parseColor function from OpenTUI's core library. It shows initialization from integers, normalized values, hex codes, and string names, as well as accessing color components.

```typescript
import { RGBA, parseColor } from "@opentui/core"

// Create colors from different formats
const redFromInts = RGBA.fromInts(255, 0, 0, 255)
const blueFromValues = RGBA.fromValues(0.0, 0.0, 1.0, 1.0)
const greenFromHex = RGBA.fromHex("#00FF00")
const transparent = RGBA.fromValues(1.0, 1.0, 1.0, 0.5)

// parseColor accepts multiple formats
const color1 = parseColor("#FF5500")
const color2 = parseColor("red")
const color3 = parseColor("transparent")
const color4 = parseColor(RGBA.fromHex("#AABBCC"))

// Access color components (normalized 0.0-1.0)
console.log(redFromInts.r, redFromInts.g, redFromInts.b, redFromInts.a)
```

--------------------------------

### Create RGBA Colors from Integers (0-255) in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/colors.mdx

Demonstrates creating RGBA color objects from integer values (0-255) for each color channel (red, green, blue, alpha) using the `RGBA.fromInts` method. This is useful for precise color definition.

```typescript
import { RGBA } from "@opentui/core"

const red = RGBA.fromInts(255, 0, 0, 255)
const semiTransparentBlue = RGBA.fromInts(0, 0, 255, 128)
```

--------------------------------

### Common RGBA Color Constants in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/colors.mdx

Provides examples of commonly used RGBA color constants, defined using the `RGBA.fromInts` method for clarity and convenience. These include basic colors like white, black, red, green, blue, and transparent.

```typescript
// Some examples of commonly used colors
const white = RGBA.fromInts(255, 255, 255, 255)
const black = RGBA.fromInts(0, 0, 0, 255)
const red = RGBA.fromInts(255, 0, 0, 255)
const green = RGBA.fromInts(0, 255, 0, 255)
const blue = RGBA.fromInts(0, 0, 255, 255)
const transparent = RGBA.fromInts(0, 0, 0, 0)
```

--------------------------------

### Create Test Renderer and Capture Output

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/src/testing/README.md

Sets up a test renderer for a terminal UI with specified dimensions. It allows rendering once and capturing the character frame output, as well as resizing the terminal.

```typescript
import { createTestRenderer } from "@opentui/core/testing"

const { renderer, mockInput, mockMouse, renderOnce, captureCharFrame, resize } = await createTestRenderer({
  width: 80,
  height: 24,
})

// Render once and capture output
await renderOnce()
const output = captureCharFrame()

// Resize terminal
resize(100, 30)
```

--------------------------------

### OpenTUI RGBA Color Representation and Parsing

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/getting-started.md

Illustrates how to use the RGBA class in OpenTUI for consistent color representation. It covers creating RGBA objects from integers, float values, and hex strings, and mentions the `parseColor` utility for flexible color input.

```typescript
import { RGBA } from "@opentui/core"

const redFromInts = RGBA.fromInts(255, 0, 0, 255) // RGB integers (0-255)
const blueFromValues = RGBA.fromValues(0.0, 0.0, 1.0, 1.0) // Float values (0.0-1.0)
const greenFromHex = RGBA.fromHex("#00FF00") // Hex strings
const transparent = RGBA.fromValues(1.0, 1.0, 1.0, 0.5) // Semi-transparent white

// The parseColor() utility function accepts both RGBA objects and color strings (hex, CSS color names, "transparent") for flexible color input throughout the API.
```

--------------------------------

### Add Per-Client Parsers with Tree-Sitter (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/tree-sitter.md

Adds a Rust parser to a specific Tree-Sitter client instance using `client.addFiletypeParser`. This is useful for varying language support across different application parts. It shows how to specify WASM and query file paths and then highlights Rust code.

```typescript
import { TreeSitterClient } from "@opentui/core"

const client = new TreeSitterClient({ dataPath: "./cache" })
await client.initialize()

// Add Rust parser to this specific client
client.addFiletypeParser({
  filetype: "rust",
  wasm: "https://github.com/tree-sitter/tree-sitter-rust/releases/download/v0.23.2/tree-sitter-rust.wasm",
  queries: {
    highlights: ["https://raw.githubusercontent.com/tree-sitter/tree-sitter-rust/master/queries/highlights.scm"],
  },
})

// Highlight Rust code
const rustCode = 'fn main() {\n    println!("Hello, world!");\n}'
const result = await client.highlightOnce(rustCode, "rust")
```

--------------------------------

### Detect Single Key Presses in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/keyboard.mdx

This code illustrates how to identify specific single key presses like 'escape', 'return' (Enter), and 'space' within the 'keypress' event handler. It's useful for implementing common single-key actions.

```typescript
keyHandler.on("keypress", (key: KeyEvent) => {
  if (key.name === "escape") {
    console.log("Escape pressed!")
  }

  if (key.name === "return") {
    console.log("Enter pressed!")
  }

  if (key.name === "space") {
    console.log("Space pressed!")
  }
})
```

--------------------------------

### Integrate Tree-Sitter Update Script Programmatically (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/tree-sitter.md

Demonstrates how to programmatically call the `updateAssets` function from `@opentui/core` within a build script to manage Tree-Sitter parser assets.

```typescript
import { updateAssets } from "@opentui/core"

await updateAssets({
  configPath: "./parsers-config.json",
  assetsDir: "./src/parsers",
  outputPath: "./src/parsers.ts",
})
```

--------------------------------

### Create a 'Hello World' TUI with OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/getting-started.mdx

A basic OpenTUI application that displays 'Hello, OpenTUI!' in green text. It requires the @opentui/core library and uses Bun to run.

```typescript
import { createCliRenderer, Text } from "@opentui/core"

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
})

renderer.root.add(
  Text({
    content: "Hello, OpenTUI!",
    fg: "#00FF00",
  }),
)
```

--------------------------------

### Handle Paste Events in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/keyboard.mdx

This snippet shows how to listen for 'paste' events, which are distinct from individual keypresses. It captures the entire pasted text via the `event.text` property, allowing for processing of multi-character input at once.

```typescript
import { type PasteEvent } from "@opentui/core"

keyHandler.on("paste", (event: PasteEvent) => {
  console.log("Pasted text:", event.text)
  // Insert text at cursor position
})
```

--------------------------------

### Build project with Solid plugin for Bun

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

This code snippet demonstrates how to use `Bun.build` with the `@opentui/solid/bun-plugin` to compile SolidJS applications for the terminal. It shows configuration for targeting the Bun runtime and outputting to a build directory. An additional example illustrates compiling to a standalone executable.

```ts
import solidPlugin from "@opentui/solid/bun-plugin"

await Bun.build({
  entrypoints: ["./index.tsx"],
  target: "bun",
  outdir: "./build",
  plugins: [solidPlugin],
})
```

```ts
await Bun.build({
  entrypoints: ["./index.tsx"],
  plugins: [solidPlugin],
  compile: {
    target: "bun-darwin-arm64",
    outfile: "./app-macos",
  },
})
```

--------------------------------

### Construct ASCII Text with Construct API

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/ascii-font.mdx

Constructs ASCII text elements using the `ASCIIFont` function. This is a more concise way to create ASCII text, directly adding it to the renderer's root. It accepts text, font, and color as parameters.

```typescript
import { ASCIIFont, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

renderer.root.add(
  ASCIIFont({
    text: "HELLO",
    font: "block",
    color: "#00FF00",
  }),
)
```

--------------------------------

### Utilize Yoga Layout System for Flexbox-like Layouts

Source: https://context7.com/anomalyco/opentui/llms.txt

Explains and demonstrates the use of the Yoga layout engine within OpenTUI for creating flexible, CSS Flexbox-like layouts. This example sets up a main container with row direction and space-between justification, then adds sidebar, content, and right panel components, each with specific sizing and styling properties, showcasing flexbox properties like `flexGrow` and `flexDirection`.

```typescript
import {
  createCliRenderer,
  BoxRenderable,
  TextRenderable,
} from "@opentui/core"

const renderer = await createCliRenderer()

// Create a flex container
const container = new BoxRenderable(renderer, {
  id: "main-container",
  width: "100%",
  height: "100%",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "stretch",
  padding: 1,
  gap: 2,
})

// Left sidebar
const sidebar = new BoxRenderable(renderer, {
  id: "sidebar",
  width: 25,
  backgroundColor: "#2d2d44",
  borderStyle: "single",
  flexDirection: "column",
  padding: 1,
})

// Main content area
const content = new BoxRenderable(renderer, {
  id: "content",
  flexGrow: 1,
  backgroundColor: "#1a1a2e",
  borderStyle: "single",
  flexDirection: "column",
  padding: 1,
})

// Right panel
const rightPanel = new BoxRenderable(renderer, {
  id: "right-panel",
  width: 20,
  backgroundColor: "#2d2d44",
  borderStyle: "single",
  flexDirection: "column",
  padding: 1,
})

container.add(sidebar)
container.add(content)
container.add(rightPanel)
renderer.root.add(container)

```

--------------------------------

### Create OpenTUI CliRenderer Instance

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderer.mdx

Creates an instance of the CliRenderer using an asynchronous factory function. This function initializes the native Zig rendering library, configures terminal settings like mouse and keyboard protocols, and sets up the alternate screen buffer. It accepts configuration options to customize behavior such as exiting on Ctrl+C and targeting a specific frames per second.

```typescript
import { createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 30,
})
```

--------------------------------

### Configure Automatic Exit on Ctrl+C in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/keyboard.mdx

This example demonstrates how to configure the OpenTUI renderer to automatically exit the application when Ctrl+C is pressed. It also shows how to disable this default behavior and implement custom cleanup logic before exiting manually.

```typescript
const renderer = await createCliRenderer({
  exitOnCtrlC: true, // Default behavior
})

// Or handle it manually
const renderer = await createCliRenderer({
  exitOnCtrlC: false,
})

renderer.keyInput.on("keypress", (key: KeyEvent) => {
  if (key.ctrl && key.name === "c") {
    // Custom cleanup before exit
    cleanup()
    process.exit(0)
  }
})
```

--------------------------------

### Create RGBA Colors from Float Values (0.0-1.0) in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/colors.mdx

Shows how to instantiate RGBA colors using normalized float values (0.0 to 1.0) for each channel with the `RGBA.fromValues` method. This format is used internally by the RGBA class.

```typescript
const green = RGBA.fromValues(0.0, 1.0, 0.0, 1.0)
const transparent = RGBA.fromValues(1.0, 1.0, 1.0, 0.5)
```

--------------------------------

### Run TypeScript Tests with Bun

Source: https://github.com/anomalyco/opentui/blob/main/AGENTS.md

Example of how to define and run a basic test case using Bun's built-in test framework. This test expects a simple equality assertion.

```typescript
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

--------------------------------

### Copy FrameBuffer Content (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/frame-buffer.mdx

Describes the 'drawFrameBuffer' method, which allows copying content from one FrameBuffer to another. It supports specifying source and destination coordinates and dimensions for flexible blitting operations. This is useful for compositing or reusing buffer content.

```typescript
canvas.frameBuffer.drawFrameBuffer(
  destX, // Destination X
  destY, // Destination Y
  sourceBuffer, // Source FrameBuffer (OptimizedBuffer)
  sourceX, // Source X offset (optional)
  sourceY, // Source Y offset (optional)
  sourceWidth, // Width to copy (optional)
  sourceHeight, // Height to copy (optional)
)
```

--------------------------------

### Declarative Layout with Box and Text

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/layout.mdx

Shows how to construct layouts using the declarative API with Box and Text components. This approach offers a more concise way to define UI structures.

```typescript
import { Box, Text } from "@opentui/core"

renderer.root.add(
  Box(
    {
      flexDirection: "row",
      width: "100%",
      height: 10,
    },
    Box(
      {
        flexGrow: 1,
        backgroundColor: "#333",
        padding: 1,
      },
      Text({ content: "Left Panel" }),
    ),
    Box(
      {
        width: 20,
        backgroundColor: "#555",
        padding: 1,
      },
      Text({ content: "Right Panel" }),
    ),
  ),
)
```

--------------------------------

### Cleanup Renderer Resources with TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderer.mdx

Provides an example of how to properly destroy the OpenTUI renderer. This is a crucial step to ensure the terminal state is restored to its original condition, mouse tracking is disabled, and all allocated resources are freed, preventing potential issues after the application exits.

```typescript
renderer.destroy()
```

--------------------------------

### Toggle OpenTUI Console Overlay Programmatically

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/console.mdx

Provides code examples for programmatically toggling the visibility and focus of the OpenTUI console overlay using the `toggle()` method on the renderer's console object.

```typescript
// Toggle visibility and focus
renderer.console.toggle()

// When open but not focused, toggle() focuses the console
// When focused, toggle() closes the console
```

--------------------------------

### Override Lifecycle Methods in Custom Renderables

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/renderables.mdx

Customize renderable behavior by overriding key lifecycle methods such as `onUpdate`, `onResize`, `onRemove`, and `renderSelf` in custom `Renderable` subclasses.

```typescript
class CustomRenderable extends Renderable {
  // Called each frame before rendering
  onUpdate(deltaTime: number) {
    // Update state, animations, etc.
  }

  // Called when dimensions change
  onResize(width: number, height: number) {
    // Respond to size changes
  }

  // Called when removed from parent
  onRemove() {
    // Cleanup
  }

  // Override for custom rendering
  renderSelf(buffer: OptimizedBuffer, deltaTime: number) {
    // Draw to buffer
  }
}
```

--------------------------------

### Create Color Effects with Layered ASCII Fonts

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/ascii-font.mdx

Achieves gradient-like effects by overlaying multiple `ASCIIFont` components with different colors and slight offsets. This technique creates a shadow or depth effect for the text.

```typescript
import { Box, ASCIIFont } from "@opentui/core"

const gradientTitle = Box(
  {},
  ASCIIFont({
    text: "HELLO",
    font: "block",
    color: "#FF0000",
  }),
  // Overlay with offset for shadow effect
  ASCIIFont({
    text: "HELLO",
    font: "block",
    color: "#880000",
    left: 1,
    top: 1,
  }),
)
```

--------------------------------

### Align Items Options

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/layout.mdx

Details the different options for aligning child elements along the cross axis of a flex container. This property controls how items are positioned perpendicular to the main axis.

```typescript
{
  alignItems: "flex-start"
} // Align to start
{
  alignItems: "flex-end"
} // Align to end
{
  alignItems: "center"
} // Center on cross axis
{
  alignItems: "stretch"
} // Stretch to fill (default)
{
  alignItems: "baseline"
} // Align baselines
```

--------------------------------

### Configure JSX for OpenTUI Solid.js

Source: https://github.com/anomalyco/opentui/blob/main/packages/solid/README.md

Sets up the tsconfig.json file to enable JSX compilation with Solid.js, specifying 'preserve' for JSX and '@opentui/solid' as the import source. This allows for the use of JSX syntax in your Solid.js components with OpenTUI.

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@opentui/solid"
  }
}
```

--------------------------------

### Resolve Filetypes from Paths and Extensions (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/tree-sitter.md

Provides utility functions `pathToFiletype` and `extToFiletype` from `@opentui/core` to automatically determine the language filetype from file paths or extensions.

```typescript
import { pathToFiletype, extToFiletype } from "@opentui/core"

// Get filetype from file path
const ft1 = pathToFiletype("src/main.rs") // "rust"
const ft2 = pathToFiletype("app.py") // "python"

// Get filetype from extension
const ft3 = extToFiletype("ts") // "typescript"
const ft4 = extToFiletype("js") // "javascript"
```

--------------------------------

### Mock Mouse Input Simulation

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/src/testing/README.md

Simulates mouse interactions within the terminal. Supports clicking (with buttons and modifiers), double-clicking, pressing/releasing buttons, moving the cursor, dragging, and scrolling. It also provides methods to get the current mouse position and pressed buttons.

```typescript
import { createMockMouse, MouseButtons } from "@opentui/core/testing"

const mockMouse = createMockMouse(renderer)

// Click
await mockMouse.click(x, y)
await mockMouse.click(x, y, MouseButtons.RIGHT)
await mockMouse.click(x, y, MouseButtons.LEFT, {
  modifiers: { ctrl: true, shift: true, alt: true },
  delayMs: 10,
})

// Double click
await mockMouse.doubleClick(x, y)

// Press and release
await mockMouse.pressDown(x, y, MouseButtons.MIDDLE)
await mockMouse.release(x, y, MouseButtons.MIDDLE)

// Move
await mockMouse.moveTo(x, y)
await mockMouse.moveTo(x, y, { modifiers: { shift: true } })

// Drag
await mockMouse.drag(startX, startY, endX, endY)
await mockMouse.drag(startX, startY, endX, endY, MouseButtons.RIGHT, {
  modifiers: { alt: true },
})

// Scroll
await mockMouse.scroll(x, y, "up" | "down" | "left" | "right")
await mockMouse.scroll(x, y, "up", { modifiers: { shift: true } })

// State
const pos = mockMouse.getCurrentPosition() // { x, y }
const buttons = mockMouse.getPressedButtons() // MouseButton[]
```

--------------------------------

### Create FrameBuffer using Construct API (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/frame-buffer.mdx

Shows how to create a FrameBuffer instance directly using the Construct API. This method is simpler for basic buffer creation without immediate rendering context. It requires 'createCliRenderer' and 'FrameBuffer' from '@opentui/core'.

```typescript
import { FrameBuffer, createCliRenderer } from "@opentui/core"

const renderer = await createCliRenderer()

renderer.root.add(
  FrameBuffer({
    width: 50,
    height: 20,
  }),
)
```

--------------------------------

### Add Global Parsers with Tree-Sitter (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/tree-sitter.md

Adds Python parsers globally using `addDefaultParsers` before initializing any Tree-Sitter clients. This ensures all clients support the specified languages. It demonstrates how to download a WASM file and highlight query from URLs and then highlights a Python code snippet.

```typescript
import { addDefaultParsers, getTreeSitterClient } from "@opentui/core"

// Add Python parser globally
addDefaultParsers([
  {
    filetype: "python",
    wasm: "https://github.com/tree-sitter/tree-sitter-python/releases/download/v0.23.6/tree-sitter-python.wasm",
    queries: {
      highlights: ["https://raw.githubusercontent.com/tree-sitter/tree-sitter-python/master/queries/highlights.scm"],
    },
  },
])

// Now all clients will have Python support
const client = getTreeSitterClient()
await client.initialize()

// Highlight Python code
const pythonCode = 'def hello():\n    print("world")'
const result = await client.highlightOnce(pythonCode, "python")
```

--------------------------------

### Fill Rectangular Area (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/frame-buffer.mdx

Details the 'fillRect' method for drawing solid rectangles on the FrameBuffer. It requires the top-left corner coordinates (x, y), dimensions (width, height), and the fill color. This is useful for backgrounds, borders, or solid shapes.

```typescript
canvas.frameBuffer.fillRect(
  x, // X position
  y, // Y position
  width, // Rectangle width
  height, // Rectangle height
  color, // Fill color (RGBA)
)

// Example: Draw a red rectangle
canvas.frameBuffer.fillRect(10, 5, 20, 8, RGBA.fromHex("#FF0000"))
```

--------------------------------

### Position Text Element Absolutely in OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/text.mdx

Shows how to position a TextRenderable element absolutely within the OpenTUI layout. This involves setting the `position` property to 'absolute' and defining `left` and `top` offsets.

```typescript
const text = new TextRenderable(renderer, {
  id: "positioned",
  content: "Absolute position",
  position: "absolute",
  left: 10,
  top: 5,
})
```

--------------------------------

### Run Tree-sitter Asset Update Script (Bash)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/src/lib/tree-sitter/assets/README.md

Executes the `update.ts` script to download and process tree-sitter assets. This can be run from the script's directory or the project root, with options for custom configuration and output paths.

```bash
# Run from this directory
bun update.ts

# Or from the project root
bun packages/core/src/lib/tree-sitter/assets/update.ts
```

```bash
# CLI usage with custom paths
bun update.ts \
  --config ./my-parsers-config.json \
  --assets ./src/tree-sitter/assets \
  --output ./src/tree-sitter/parsers.ts

# Show help
bun update.ts --help
```

--------------------------------

### OpenTUI Solid API Reference

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

This section details the core functions and hooks provided by the OpenTUI Solid library for building terminal applications.

```APIDOC
## `render(node, rendererOrConfig?)`

### Description
Render a Solid component tree into a CLI renderer.

### Method
`render`

### Parameters
- `node` (Function) - Function returning a JSX element.
- `rendererOrConfig` (Object) - Optional `CliRenderer` instance or `CliRendererConfig`.

### Request Example
```tsx
import { render } from "@opentui/solid"

// Simple usage
render(() => <App />)

// With renderer config
render(() => <App />, {
  targetFps: 30,
  exitOnCtrlC: false,
})
```

## `testRender(node, options?)`

### Description
Create a test renderer for snapshots and interaction tests.

### Method
`testRender`

### Parameters
- `node` (Function) - Function returning a JSX element.
- `options` (Object) - Optional configuration for the test renderer (e.g., `width`, `height`).

### Request Example
```tsx
import { testRender } from "@opentui/solid"

const testSetup = await testRender(() => <App />, { width: 40, height: 10 })
```

## `extend(components)`

### Description
Register custom renderables as JSX intrinsic elements.

### Method
`extend`

### Parameters
- `components` (Object) - An object mapping component names to their renderable implementations.

### Request Example
```tsx
import { extend } from "@opentui/solid"

extend({ custom_box: CustomBoxRenderable })
```

## `getComponentCatalogue()`

### Description
Returns the current component catalogue that powers JSX tag lookup.

### Method
`getComponentCatalogue`

### Request Example
```tsx
const catalogue = getComponentCatalogue()
```

## `useRenderer()`

### Description
Access the OpenTUI renderer instance.

### Method
`useRenderer`

### Response Example
```tsx
import { useRenderer } from "@opentui/solid"
import { onMount } from "solid-js"

const App = () => {
  const renderer = useRenderer()

  onMount(() => {
    renderer.console.show()
    console.log("Hello from console!")
  })

  return <box />
}
```

## `useKeyboard(handler, options?)`

### Description
Subscribe to keyboard events.

### Method
`useKeyboard`

### Parameters
- `handler` (Function) - Callback function to handle keyboard events.
- `options` (Object) - Optional configuration, e.g., `{ release: true }` to also listen for key release events.

### Request Example
```tsx
import { useKeyboard } from "@opentui/solid"

const App = () => {
  useKeyboard((key) => {
    if (key.name === "escape") {
      process.exit(0)
    }
  })

  return <text>Press ESC to exit</text>
}
```

With release events:

```tsx
import { createSignal } from "solid-js"

const App = () => {
  const [pressedKeys, setPressedKeys] = createSignal(new Set<string>())

  useKeyboard(
    (event) => {
      setPressedKeys((keys) => {
        const newKeys = new Set(keys)
        if (event.eventType === "release") {
          newKeys.delete(event.name)
        } else {
          newKeys.add(event.name)
        }
        return newKeys
      })
    },
    { release: true },
  )

  return <text>Pressed: {Array.from(pressedKeys()).join(", ") || "none"}</text>
}
```

## `onResize(callback)`

### Description
Handle terminal resize events.

### Method
`onResize`

### Parameters
- `callback` (Function) - Callback function that receives new width and height.

### Request Example
```tsx
import { onResize } from "@opentui/solid"

const App = () => {
  onResize((width, height) => {
    console.log(`Resized to ${width}x${height}`)
  })

  return <text>Resize-aware component</text>
}
```

## `useTerminalDimensions()`

### Description
Get reactive terminal dimensions (returns a Solid signal).

### Method
`useTerminalDimensions`

### Response Example
```tsx
import { useTerminalDimensions } from "@opentui/solid"

const App = () => {
  const dimensions = useTerminalDimensions()

  return (
    <text>
      Terminal: {dimensions().width}x{dimensions().height}
    </text>
  )
}
```

## `usePaste(handler)`

### Description
Subscribe to paste events.

### Method
`usePaste`

### Parameters
- `handler` (Function) - Callback function that receives paste event data.

### Request Example
```tsx
import { usePaste } from "@opentui/solid"

const App = () => {
  usePaste((event) => {
    console.log("Pasted:", event.text)
  })

  return <text>Paste something!</text>
}
```

## `useSelectionHandler(callback)`

### Description
Handle text selection events.

### Method
`useSelectionHandler`

### Parameters
- `callback` (Function) - Callback function that receives selection event data.

### Request Example
```tsx
import { useSelectionHandler } from "@opentui/solid"

const App = () => {
  useSelectionHandler((selection) => {
    console.log("Selected:", selection)
  })

  return <text selectable>Select me!</text>
}
```
```

--------------------------------

### Create Function Spy for Testing Callbacks

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/src/testing/README.md

Creates a spy function that can be used to test callbacks. It tracks call counts, arguments, and allows resetting the spy. Useful for asserting that functions are called with expected parameters.

```typescript
import { createSpy } from "@opentui/core/testing"

const spy = createSpy()

// Use as callback
someFunction(spy)

// Assertions
spy.callCount() // number
spy.calledWith(arg1, arg2) // boolean
spy.calls // any[][]
spy.reset()
```

--------------------------------

### Handle OpenTUI Console Toggle with Keypress

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/console.mdx

Illustrates how to bind keyboard shortcuts to toggle the OpenTUI console overlay. It shows examples for toggling with the backtick key or a Ctrl+L combination.

```typescript
renderer.keyInput.on("keypress", (key) => {
  // Toggle with backtick key
  if (key.name === "`") {
    renderer.console.toggle()
  }

  // Or with a modifier
  if (key.ctrl && key.name === "l") {
    renderer.console.toggle()
  }
})
```

--------------------------------

### Add Tree-sitter Update to Build Pipeline (JSON)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/src/lib/tree-sitter/assets/README.md

Integrates the Tree-sitter asset update script into the `package.json` build process using `npm` scripts. The `prebuild` script ensures assets are updated before the main build command.

```json
{
  "scripts": {
    "prebuild": "bun node_modules/@opentui/core/lib/tree-sitter/assets/update.ts --config ./parsers-config.json --assets ./src/parsers --output ./src/parsers.ts",
    "build": "bun build ./src/index.ts"
  }
}
```

--------------------------------

### Run OpenTUI Native Benchmarks with npm

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/src/zig/bench/README.md

Execute the native benchmarks for OpenTUI using npm scripts. This includes options to include memory statistics for a more detailed performance analysis.

```bash
# Using the npm script (recommended)
bun bench:native

# Include memory statistics
bun bench:native --mem
```

--------------------------------

### Use Local Tree-Sitter Parsers and Queries with Bun (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/tree-sitter.md

Shows how to use local parser WASM files and query files with Tree-Sitter in a Bun environment. It utilizes Bun's `with { type: "file" }` syntax to import local files directly into the `addDefaultParsers` configuration.

```typescript
// Using Bun's file import
import pythonWasm from "./parsers/tree-sitter-python.wasm" with { type: "file" }
import pythonHighlights from "./queries/python/highlights.scm" with { type: "file" }

addDefaultParsers([
  {
    filetype: "python",
    wasm: pythonWasm,
    queries: {
      highlights: [pythonHighlights],
    },
  },
])
```

--------------------------------

### Use Generated Tree-Sitter Parsers in TypeScript

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/tree-sitter.md

Shows how to import and use the generated TypeScript file containing pre-configured Tree-Sitter parsers with the OpenTUI client for syntax highlighting.

```typescript
import { addDefaultParsers, getTreeSitterClient } from "@opentui/core"
import { getParsers } from "./parsers" // Generated file

addDefaultParsers(getParsers())

const client = getTreeSitterClient()
await client.initialize()

const result = await client.highlightOnce('def hello():\n    print("world")', "python")
```

--------------------------------

### FrameBuffer Creation

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/frame-buffer.mdx

Demonstrates two ways to create a FrameBuffer: using FrameBufferRenderable for integration with the renderer, and using the FrameBuffer constructor directly.

```APIDOC
## FrameBuffer Creation

### Description

This section covers the creation of FrameBuffer instances. You can use `FrameBufferRenderable` for direct integration into the rendering tree or the `FrameBuffer` constructor for standalone buffer creation.

### Method

POST (implicitly, for instantiation)

### Endpoint

N/A (Class instantiation)

### Parameters

#### Request Body (for FrameBufferRenderable constructor)

- **renderer** (object) - Required - The CLI renderer instance.
- **options** (object) - Required - Configuration options for the FrameBufferRenderable.
  - **id** (string) - Required - Unique identifier for the renderable.
  - **width** (number) - Required - Width of the frame buffer in characters.
  - **height** (number) - Required - Height of the frame buffer in rows.
  - **position** (string) - Optional - Positioning mode ('relative' or 'absolute'). Defaults to 'relative'.
  - **left**, **top**, **right**, **bottom** (number) - Optional - Position offsets if `position` is 'absolute'.

#### Request Body (for FrameBuffer constructor)

- **options** (object) - Required - Configuration options for the FrameBuffer.
  - **width** (number) - Required - Buffer width in characters.
  - **height** (number) - Required - Buffer height in rows.
  - **respectAlpha** (boolean) - Optional - Enable alpha blending when drawing. Defaults to `false`.

### Request Example

```typescript
// Using FrameBufferRenderable
import { FrameBufferRenderable, createCliRenderer } from "@opentui/core"
const renderer = await createCliRenderer()
const canvas = new FrameBufferRenderable(renderer, {
  id: "canvas",
  width: 50,
  height: 20,
})

// Using FrameBuffer constructor
import { FrameBuffer, createCliRenderer } from "@opentui/core"
const renderer = await createCliRenderer()
const buffer = FrameBuffer({
  width: 50,
  height: 20,
})
```

### Response

#### Success Response (200)

Returns the created FrameBuffer instance or FrameBufferRenderable instance.

#### Response Example

(Instance of FrameBufferRenderable or FrameBuffer)
```

--------------------------------

### Install OpenTUI Solid.js Bindings

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/bindings/solid.mdx

Installs the necessary Solid.js and OpenTUI packages using Bun. This is the first step to integrating OpenTUI with a Solid.js application.

```bash
bun install solid-js @opentui/solid
```

--------------------------------

### Positioning Options

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/layout.mdx

Covers the positioning strategies for elements, including relative positioning (default flow) and absolute positioning for precise placement within a parent.

```typescript
{
  position: "relative",
}

{
  position: "absolute",
  left: 10,
  top: 5,
  right: 10,
  bottom: 5,
}
```

--------------------------------

### Tree-sitter Parsers Configuration (JSON)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/src/lib/tree-sitter/assets/README.md

Defines the structure for a `parsers-config.json` file used to specify language parsers and their associated query files for Tree-sitter. It includes filetype, WASM file URL, and query file URLs.

```json
{
  "parsers": [
    {
      "filetype": "python",
      "wasm": "https://github.com/tree-sitter/tree-sitter-python/releases/download/v0.20.4/tree-sitter-python.wasm",
      "queries": {
        "highlights": [
          "https://raw.githubusercontent.com/tree-sitter/tree-sitter-python/refs/heads/master/queries/highlights.scm"
        ]
      }
    }
  ]
}
```

--------------------------------

### Customize Tree-Sitter Client Cache Directory (TypeScript)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/tree-sitter.md

Shows how to specify a custom directory for caching Tree-Sitter parser and query files when instantiating the `TreeSitterClient`.

```typescript
const client = new TreeSitterClient({
  dataPath: "./my-custom-cache",
})
```

--------------------------------

### Build Application with OpenTUI Solid.js Plugin for Bun

Source: https://github.com/anomalyco/opentui/blob/main/packages/solid/README.md

Shows how to use Bun.build with the OpenTUI Solid.js plugin to bundle a Solid.js application. It specifies entry points, target, output directory, and includes the Solid plugin for compilation.

```ts
import solidPlugin from "@opentui/solid/bun-plugin"

await Bun.build({
  entrypoints: ["./index.tsx"],
  target: "bun",
  outdir: "./build",
  plugins: [solidPlugin],
  compile: {
    target: "bun-darwin-arm64",
    outfile: "app-macos",
  },
})
```

--------------------------------

### Tree-Sitter Parser Configuration Structure (TypeScript Interface)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/tree-sitter.md

Defines the `FiletypeParserOptions` interface for configuring Tree-Sitter parsers. It specifies the required properties: `filetype` (identifier), `wasm` (path to WASM file), and `queries` (including an array of highlight query file paths).

```typescript
interface FiletypeParserOptions {
  filetype: string // The filetype identifier (e.g., "python", "rust")
  wasm: string // URL or local file path to the .wasm parser file
  queries: {
    highlights: string[] // Array of URLs or local file paths to .scm query files
  }
}
```

--------------------------------

### Configure Bun Preload Script for OpenTUI

Source: https://github.com/anomalyco/opentui/blob/main/packages/solid/README.md

Adds a preload script to the bunfig.toml file for OpenTUI. This ensures that necessary OpenTUI modules are loaded before your application starts, which is crucial for proper rendering in a Bun environment.

```toml
preload = ["@opentui/solid/preload"]
```

--------------------------------

### Test OpenTUI with Bun

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/development.md

Runs tests for the OpenTUI project using Bun. This includes commands for running TypeScript tests, native tests, filtering native tests by name, and running native benchmarks.

```bash
# TypeScript tests
cd packages/core
bun test

# Native tests
bun run test:native

# Filter native tests
bun run test:native -Dtest-filter="test name"

# Benchmarks
bun run bench:native
```

--------------------------------

### Console Overlay with OpenTUI

Source: https://context7.com/anomalyco/opentui/llms.txt

Shows how to set up and use the built-in console overlay for debugging in OpenTUI. It covers creating a renderer, configuring console options like position and colors, capturing standard console methods, and programmatically controlling the overlay's visibility.

```typescript
import { createCliRenderer, ConsolePosition } from "@opentui/core"

const renderer = await createCliRenderer({
  consoleOptions: {
    position: ConsolePosition.BOTTOM,  // TOP, BOTTOM, LEFT, RIGHT
    sizePercent: 40,
    maxStoredLogs: 1000,
    colorInfo: "#00FFFF",
    colorWarn: "#FFFF00",
    colorError: "#FF0000",
    colorDebug: "#888888",
    startInDebugMode: false,
  },
  openConsoleOnError: true,
})

// Console methods are captured and displayed in overlay
console.log("Info message")
console.info("Another info")
console.warn("Warning message")
console.error("Error message")
console.debug("Debug message")

// Toggle console visibility
renderer.console.toggle()

// Programmatically control console
renderer.console.open()
renderer.console.close()
```

--------------------------------

### Import New Test File in Zig

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/src/zig/tests/README.md

Demonstrates how to import a new test file into the main Zig build file. This ensures that new tests are recognized and included in the test suite.

```zig
const new_tests = @import("new_test.zig");
```

--------------------------------

### Initialize OpenTUI Console Overlay

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/console.mdx

Demonstrates how to create a CLI renderer with the console overlay enabled, specifying its position and size. Captures console logs like log, info, warn, error, and debug.

```typescript
import { createCliRenderer, ConsolePosition } from "@opentui/core"

const renderer = await createCliRenderer({
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 30,
  },
})

// These appear in the overlay instead of stdout
console.log("This appears in the overlay")
console.error("Errors are color-coded red")
console.warn("Warnings appear in yellow")
```

--------------------------------

### Position ASCII Text on Screen

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/ascii-font.mdx

Positions ASCII text elements at specific coordinates on the screen using the `x` and `y` properties within the `ASCIIFontRenderable` options. This allows for precise placement of decorative text.

```typescript
const title = new ASCIIFontRenderable(renderer, {
  id: "title",
  text: "TITLE",
  font: "block",
  color: RGBA.fromHex("#FFFF00"),
  x: 10,
  y: 2,
})
```

--------------------------------

### FrameBuffer Drawing Methods

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/frame-buffer.mdx

Details on various methods available for drawing and manipulating content within a FrameBuffer, including setting individual cells, drawing text, filling rectangles, and copying other frame buffers.

```APIDOC
## FrameBuffer Drawing Methods

### Description

This section details the core drawing functionalities provided by the FrameBuffer API. These methods allow for precise control over the content and appearance of the rendering surface.

### Methods

- **setCell**
- **setCellWithAlphaBlending**
- **drawText**
- **fillRect**
- **drawFrameBuffer**

### setCell

#### Description

Sets the character, foreground color, background color, and attributes for a single cell at the specified coordinates.

#### Method

`setCell(x, y, char, fg, bg, attributes)`

#### Parameters

- **x** (number) - Required - The X coordinate of the cell.
- **y** (number) - Required - The Y coordinate of the cell.
- **char** (string) - Required - The character to display in the cell.
- **fg** (RGBA) - Required - The foreground color of the cell.
- **bg** (RGBA) - Required - The background color of the cell.
- **attributes** (number) - Optional - Text attributes (e.g., bold, underline). Defaults to 0.

#### Request Example

```typescript
canvas.frameBuffer.setCell(10, 5, "@", RGBA.fromHex("#FFFF00"), RGBA.fromHex("#000000"))
```

### setCellWithAlphaBlending

#### Description

Sets the cell's content and colors, applying alpha blending for transparency effects.

#### Method

`setCellWithAlphaBlending(x, y, char, fg, bg)`

#### Parameters

- **x** (number) - Required - The X coordinate of the cell.
- **y** (number) - Required - The Y coordinate of the cell.
- **char** (string) - Required - The character to display in the cell.
- **fg** (RGBA) - Required - The foreground color (supports transparency).
- **bg** (RGBA) - Required - The background color (supports transparency).

#### Request Example

```typescript
const semiTransparent = RGBA.fromValues(1.0, 0.0, 0.0, 0.5)
const transparent = RGBA.fromValues(0, 0, 0, 0)
canvas.frameBuffer.setCellWithAlphaBlending(10, 5, " ", transparent, semiTransparent)
```

### drawText

#### Description

Draws a string of text starting at the specified coordinates, with options for foreground and background colors, and text attributes.

#### Method

`drawText(text, x, y, fg, bg, attributes)`

#### Parameters

- **text** (string) - Required - The string to draw.
- **x** (number) - Required - The starting X position.
- **y** (number) - Required - The starting Y position.
- **fg** (RGBA) - Required - The text color.
- **bg** (RGBA) - Optional - The background color for the text.
- **attributes** (number) - Optional - Text attributes. Defaults to 0.

#### Request Example

```typescript
canvas.frameBuffer.drawText("Score: 100", 2, 1, RGBA.fromHex("#00FF00"))
```

### fillRect

#### Description

Fills a rectangular area on the frame buffer with the specified color.

#### Method

`fillRect(x, y, width, height, color)`

#### Parameters

- **x** (number) - Required - The starting X coordinate of the rectangle.
- **y** (number) - Required - The starting Y coordinate of the rectangle.
- **width** (number) - Required - The width of the rectangle.
- **height** (number) - Required - The height of the rectangle.
- **color** (RGBA) - Required - The color to fill the rectangle with.

#### Request Example

```typescript
// Draw a red rectangle
canvas.frameBuffer.fillRect(10, 5, 20, 8, RGBA.fromHex("#FF0000"))
```

### drawFrameBuffer

#### Description

Copies content from a source FrameBuffer onto the current frame buffer at the specified destination coordinates.

#### Method

`drawFrameBuffer(destX, destY, sourceBuffer, sourceX, sourceY, sourceWidth, sourceHeight)`

#### Parameters

- **destX** (number) - Required - The destination X coordinate on the current buffer.
- **destY** (number) - Required - The destination Y coordinate on the current buffer.
- **sourceBuffer** (OptimizedBuffer) - Required - The source FrameBuffer to copy from.
- **sourceX** (number) - Optional - The starting X offset in the source buffer. Defaults to 0.
- **sourceY** (number) - Optional - The starting Y offset in the source buffer. Defaults to 0.
- **sourceWidth** (number) - Optional - The width of the area to copy. Defaults to the source buffer's width.
- **sourceHeight** (number) - Optional - The height of the area to copy. Defaults to the source buffer's height.

#### Request Example

```typescript
// Assuming 'otherBuffer' is an existing FrameBuffer instance
canvas.frameBuffer.drawFrameBuffer(0, 0, otherBuffer, 0, 0, 20, 10)
```
```

--------------------------------

### Run OpenTUI Core Examples with Bun

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/README.md

Installs project dependencies and runs the example application using Bun. This is useful for quickly seeing the library in action.

```bash
bun install
bun run src/examples/index.ts
```

--------------------------------

### Filter Native Tests for Core Package

Source: https://github.com/anomalyco/opentui/blob/main/AGENTS.md

Command to run native tests for the 'packages/core' directory while filtering by a specific test name. The filter is applied using the '-Dtest-filter' flag.

```shell
bun run test:native -Dtest-filter="test name"
```

--------------------------------

### Link OpenTUI for Local Development

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/development.md

Links a local development version of OpenTUI to another project. This script facilitates testing changes in OpenTUI against a consuming application without publishing.

```bash
./scripts/link-opentui-dev.sh /path/to/your/project

# Link core and solid with subdependency discovery
./scripts/link-opentui-dev.sh /path/to/your/project --solid --subdeps

# Link built artifacts
./scripts/link-opentui-dev.sh /path/to/your/project --react --dist

# Copy for Docker/Windows
./scripts/link-opentui-dev.sh /path/to/your/project --dist --copy
```

--------------------------------

### Run OpenTUI Core Examples with Bun

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/development.md

Executes the example scripts located within the '@opentui/core' package using Bun. This helps in verifying the functionality of the core OpenTUI library.

```bash
cd packages/core
bun run src/examples/index.ts
```

--------------------------------

### Configure OpenTUI Behavior with Environment Variables (Bash)

Source: https://context7.com/anomalyco/opentui/llms.txt

Lists environment variables used to configure OpenTUI's behavior, categorized into debugging/development options and rendering settings. These variables allow for fine-tuning the library's operation during development and deployment.

```bash
# Debug and development
OTUI_DEBUG=true           # Enable debug mode for raw input capture
OTUI_SHOW_STATS=true      # Show debug overlay at startup
OTUI_DUMP_CAPTURES=true   # Dump captured output on exit

# Rendering options
OTUI_NO_NATIVE_RENDER=true      # Disable native ANSI output (debugging)
OTUI_USE_ALTERNATE_SCREEN=true  # Use alternate screen buffer
OTUI_OVERRIDE_STDOUT=true       # Override stdout stream
```

--------------------------------

### Run All OpenTUI Zig Tests

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/src/zig/tests/README.md

Executes all tests within the OpenTUI Zig test suite. This command provides a summary of all test results.

```bash
zig build test --summary all
```

--------------------------------

### Test Recorder for Terminal UI Frames

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/src/testing/README.md

Records frames generated during terminal UI rendering for testing or analysis. It allows starting, stopping, and clearing recordings, and provides access to the recorded frames with their timestamps and frame numbers.

```typescript
import { TestRecorder } from "@opentui/core/testing"

const { renderer, renderOnce } = await createTestRenderer({ width: 80, height: 24 })
const recorder = new TestRecorder(renderer)

// Start recording
recorder.rec()

// Add content and trigger renders
const text = new TextRenderable(renderer, { content: "Hello" })
renderer.root.add(text)
await Bun.sleep(1) // Wait for automatic render from add()

text.content = "World"
await Bun.sleep(1) // Wait for automatic render from content change

// Stop recording
recorder.stop()

// Access recorded frames
const frames = recorder.recordedFrames
console.log(`Recorded ${frames.length} frames`)

frames.forEach((frame) => {
  console.log(`Frame ${frame.frameNumber} at ${frame.timestamp}ms:`)
  console.log(frame.frame)
})

// Clear and start new recording
recorder.clear()
recorder.rec()
```

--------------------------------

### Run Native Tests for Core Package

Source: https://github.com/anomalyco/opentui/blob/main/AGENTS.md

Command to execute native tests specifically for the 'packages/core' directory. These tests are run from within the 'packages/core' directory.

```shell
bun run test:native
```

--------------------------------

### Install OpenTUI with Bun

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/getting-started.mdx

Installs the OpenTUI core library using Bun. This involves initializing a new project, adding the dependency, and setting up the runtime environment.

```bash
mkdir my-tui && cd my-tui
bun init -y
bun add @opentui/core
```

--------------------------------

### Install OpenTUI Solid.js Dependencies

Source: https://github.com/anomalyco/opentui/blob/main/packages/solid/README.md

Installs the Solid.js library and the OpenTUI Solid integration package using Bun. This is the first step to using OpenTUI with Solid.js.

```bash
bun install solid-js @opentui/solid
```

--------------------------------

### Clone and Install OpenTUI with Bun

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/development.md

Clones the OpenTUI repository and installs its dependencies using Bun, the JavaScript runtime and package manager. This is the initial setup step for development.

```bash
git clone https://github.com/anomalyco/opentui.git
cd opentui
bun install
```

--------------------------------

### Create Tree-Sitter Parser Configuration

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/tree-sitter.md

Defines the `parsers-config.json` file structure for specifying Tree-Sitter parsers, including file types, WASM binary URLs, and query file locations for syntax highlighting.

```json
{
  "parsers": [
    {
      "filetype": "python",
      "wasm": "https://github.com/tree-sitter/tree-sitter-python/releases/download/v0.23.6/tree-sitter-python.wasm",
      "queries": {
        "highlights": ["https://raw.githubusercontent.com/tree-sitter/tree-sitter-python/master/queries/highlights.scm"]
      }
    },
    {
      "filetype": "rust",
      "wasm": "https://github.com/tree-sitter/tree-sitter-rust/releases/download/v0.23.2/tree-sitter-rust.wasm",
      "queries": {
        "highlights": ["https://raw.githubusercontent.com/tree-sitter/tree-sitter-rust/master/queries/highlights.scm"]
      }
    }
  ]
}
```

--------------------------------

### OpenTUI Console Configuration and Usage

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/docs/getting-started.md

Shows how to configure and use the built-in console overlay in OpenTUI. This includes setting console position, size, custom colors for different log levels, and toggling the console visibility and focus.

```typescript
import { createCliRenderer, ConsolePosition } from "@opentui/core"

const renderer = await createCliRenderer({
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 30,
    colorInfo: "#00FFFF",
    colorWarn: "#FFFF00",
    colorError: "#FF0000",
    startInDebugMode: false,
  },
})

console.log("This appears in the overlay")
console.error("Errors are color-coded red")
console.warn("Warnings appear in yellow")

renderer.console.toggle()
```

--------------------------------

### FrameBuffer Properties

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/components/frame-buffer.mdx

Lists and describes the configurable properties of a FrameBuffer instance, including dimensions, positioning, and alpha blending behavior.

```APIDOC
## FrameBuffer Properties

### Description

This section outlines the configurable properties available for a FrameBuffer instance. These properties control the dimensions, layout, and rendering behavior of the buffer.

### Properties Table

| Property                         | Type      | Default      | Description                                     |
| -------------------------------- | --------- | ------------ | ----------------------------------------------- |
| `width`                          | `number`  | -            | Buffer width in characters (required)           |
| `height`                         | `number`  | -            | Buffer height in rows (required)                |
| `respectAlpha`                   | `boolean` | `false`      | Enable alpha blending when drawing              |
| `position`                       | `string`  | `"relative"` | Positioning mode (`"relative"` or `"absolute"`) |
| `left`, `top`, `right`, `bottom` | `number`  | -            | Position offsets for absolute positioning       |

### Usage Example (during instantiation)

```typescript
const gameCanvas = new FrameBufferRenderable(renderer, {
  id: "game",
  width: 40,
  height: 20,
  position: "absolute",
  left: 5,
  top: 2,
  respectAlpha: true // Example of setting a property
})
```
```

--------------------------------

### Build OpenTUI Core with Bun

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/README.md

Builds the OpenTUI Core library using a Bun script. This process generates platform-specific libraries essential for the TypeScript layer to function correctly.

```bash
bun run build
```

--------------------------------

### Control OpenTUI Console with Environment Variables

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/console.mdx

Explains how to control the behavior of the OpenTUI console overlay using environment variables. Options include disabling capture, starting with the console visible, and dumping captured output on exit.

```bash
# Disable console capture entirely
OTUI_USE_CONSOLE=false bun app.ts

# Start with console visible
SHOW_CONSOLE=true bun app.ts

# Dump captured output on exit
OTUI_DUMP_CAPTURES=true bun app.ts
```

--------------------------------

### Scaffold OpenTUI Project with create-tui

Source: https://context7.com/anomalyco/opentui/llms.txt

Creates a new OpenTUI project using the create-tui command-line interface tool.

```bash
bun create tui
```

--------------------------------

### Compile and Run OpenTUI Benchmarks with Zig

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/src/zig/bench/README.md

Build and run the native benchmarks using the Zig build system. Supports optimization flags and memory statistics collection.

```zig
zig build bench -Doptimize=ReleaseFast
zig build bench -Doptimize=ReleaseFast -- --mem
```

--------------------------------

### Configure OpenTUI Console Overlay Options

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/console.mdx

Shows various configuration options for the OpenTUI console overlay, including position, size, custom colors for different log levels, and enabling debug mode to show file and line information.

```typescript
const renderer = await createCliRenderer({
  consoleOptions: {
    position: ConsolePosition.BOTTOM, // Position on screen
    sizePercent: 30, // Size as percentage of terminal
    colorInfo: "#00FFFF", // Color for console.info
    colorWarn: "#FFFF00", // Color for console.warn
    colorError: "#FF0000", // Color for console.error
    startInDebugMode: false, // Show file/line info in logs
  },
})
```

--------------------------------

### OpenTUI Console Position Enum

Source: https://github.com/anomalyco/opentui/blob/main/packages/web/src/content/docs/core-concepts/console.mdx

Lists the available enum values for positioning the OpenTUI console overlay within the terminal: TOP, BOTTOM, LEFT, and RIGHT.

```typescript
import { ConsolePosition } from "@opentui/core"

ConsolePosition.TOP // Dock at top
ConsolePosition.BOTTOM // Dock at bottom
ConsolePosition.LEFT // Dock at left
ConsolePosition.RIGHT // Dock at right
```

--------------------------------

### Run Native Benchmarks with Bun

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/README.md

Executes native performance benchmarks for OpenTUI Core using a Bun script. The Zig code for benchmarks is located in `src/zig/bench.zig` and supports options like `--filter` and `--mem`.

```bash
bun run bench:native
```

--------------------------------

### Add New Benchmark in OpenTUI (Zig)

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/src/zig/bench/README.md

Steps to add a new benchmark in OpenTUI using Zig. This involves creating a new `.zig` file, importing utilities, implementing a `run` function, and integrating it into the main benchmark runner.

```zig
// Import shared types from bench-utils.zig:
const bench_utils = @import("../bench-utils.zig");
const BenchResult = bench_utils.BenchResult;
const MemStats = bench_utils.MemStats;

// Implement a pub fn run function:
pub fn run(allocator: std.mem.Allocator, show_mem: bool) ![]BenchResult {
    // ... benchmark setup and execution ...
    return BenchResult{}; // Placeholder
}

// Import it in bench.zig:
const my_new_bench = @import("bench/my_new_bench.zig");

// Call it and print results in main():
const my_results = try my_new_bench.run(allocator, show_mem);
defer allocator.free(my_results);
try bench_utils.printResults(stdout, my_results);
```

--------------------------------

### Install OpenTUI Core with Bun

Source: https://github.com/anomalyco/opentui/blob/main/packages/core/README.md

Installs the OpenTUI Core library using the Bun package manager. This is the primary step to begin using the library in your project.

```bash
bun install @opentui/core
```
