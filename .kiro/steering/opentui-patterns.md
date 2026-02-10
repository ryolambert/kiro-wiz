---
inclusion: fileMatch
fileMatchPattern: ["*.js", "*.jsx", "*.ts", "*.tsx"]
---

# OpenTUI Production Patterns

Best practices distilled from RestMan, OpenDocker, opentui-examples, and opentui-spinner.

## App Architecture

### Screen-Based Routing

```tsx
// App.tsx — centralized screen routing (RestMan pattern)
type Screen = "menu" | "detail" | "settings" | "help"

function App() {
  const [screen, setScreen] = useState<Screen>("menu")

  useKeyboard((key) => {
    if (key.name === "escape" && screen !== "menu") setScreen("menu")
    if (key.ctrl && key.name === "q") { renderer.destroy(); process.exit(0) }
  })

  switch (screen) {
    case "menu": return <MainMenu onSelect={setScreen} />
    case "detail": return <DetailScreen onBack={() => setScreen("menu")} />
    // ...
  }
}
```

### Header / Content / Footer Layout

```tsx
// Universal three-section layout (opentui-examples pattern)
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <box flexDirection="column" flexGrow={1}>
      <box borderStyle="single" border={["bottom"]} paddingLeft={1} paddingRight={1}
           flexDirection="row" justifyContent="space-between">
        <text attributes={TextAttributes.BOLD}>App Title</text>
        <text attributes={TextAttributes.DIM}>Status info</text>
      </box>
      <box flexGrow={1} padding={1}>{children}</box>
      <box borderStyle="single" border={["top"]} flexDirection="row" justifyContent="center" gap={2}>
        <text>[1] Home</text>
        <text>[q] Quit</text>
      </box>
    </box>
  )
}
```

### Number-Key Navigation

```tsx
// Quick navigation with number keys (opentui-examples pattern)
const renderer = useRenderer()
useKeyboard((key) => {
  if (key.name === "1") setScreen("home")
  if (key.name === "2") setScreen("settings")
  if (key.name === "q") { renderer.destroy(); process.exit(0) }
})
```

## Focus Management

### Enum-Based Focus (RestMan)

```tsx
type FocusField = "url" | "method" | "headers" | "body"
const [focused, setFocused] = useState<FocusField>("url")

useKeyboard((key) => {
  if (key.name === "tab") {
    setFocused(prev => {
      const fields: FocusField[] = ["url", "method", "headers", "body"]
      const idx = fields.indexOf(prev)
      return fields[(idx + 1) % fields.length]
    })
  }
})

// Pass focus state to children:
<URLInput focused={focused === "url"} />
<MethodSelect focused={focused === "method"} />
```

### Panel Focus with Visual Indicator

```tsx
// Border color shows focus state (RestMan + OpenDocker pattern)
<box border borderColor={focused ? "#00FF00" : "#444444"} flexGrow={1}>
  <text>Panel content</text>
</box>
```

### Modal Keyboard Isolation

```tsx
// Modals consume keyboard events, preventing parent handlers (RestMan pattern)
function App() {
  const [showModal, setShowModal] = useState(false)

  useKeyboard((key) => {
    if (showModal) return // Modal handles its own keys
    if (key.name === "s") setShowModal(true)
  })

  return (
    <box>
      <MainContent />
      {showModal && <SaveDialog onClose={() => setShowModal(false)} />}
    </box>
  )
}
```

## Active State Visualization

```tsx
// Bitwise TextAttributes for active items (opentui-examples pattern)
import { TextAttributes } from "@opentui/core"

<text attributes={
  isActive
    ? TextAttributes.BOLD | TextAttributes.UNDERLINE
    : TextAttributes.NONE
}>
  {label}
</text>

// List with selection indicator:
{items.map((item, i) => (
  <text key={i} fg={i === selected ? "#00FF00" : "#888888"}>
    {i === selected ? "> " : "  "}{item.name}
  </text>
))}
```

## Design Tokens

```tsx
// Centralized color tokens (RestMan pattern)
const tokens = {
  border: { active: "#00FF00", inactive: "#444444", error: "#FF0000" },
  text: { primary: "#FFFFFF", muted: "#888888", accent: "#00FFAA" },
  bg: { panel: "#1a1a1a", selected: "#333366", input: "#222222" },
}

function getBorderColor(focused: boolean, error?: boolean) {
  if (error) return tokens.border.error
  return focused ? tokens.border.active : tokens.border.inactive
}
```

## Data Persistence

```tsx
// File-based storage in user home dir (RestMan pattern)
import { readFile, writeFile, mkdir } from "fs/promises"
import { homedir } from "os"
import { join } from "path"

const DATA_DIR = join(homedir(), ".myapp")
const DATA_FILE = join(DATA_DIR, "data.json")

async function load<T>(fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(DATA_FILE, "utf-8"))
  } catch {
    await mkdir(DATA_DIR, { recursive: true })
    return fallback
  }
}

async function save<T>(data: T): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2))
}
```

## Custom Spinner Component

```tsx
// Register third-party components (opentui-spinner pattern)
import { SpinnerRenderable } from "@opentui/spinner"
import { extend } from "@opentui/react"

extend({ spinner: SpinnerRenderable })

// Usage:
<spinner name="dots" color="#00FF00" />
<spinner frames={["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"]} interval={80} />
```

## Real-Time Data (OpenDocker)

```tsx
// Polling pattern with cleanup
function ContainerList() {
  const [containers, setContainers] = useState([])

  useEffect(() => {
    const fetch = async () => setContainers(await getContainers())
    fetch()
    const id = setInterval(fetch, 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <scrollbox focused style={{ flexGrow: 1 }}>
      {containers.map(c => (
        <box key={c.id} style={{ padding: 1 }}>
          <text fg={c.running ? "#00FF00" : "#FF0000"}>{c.name}</text>
        </box>
      ))}
    </scrollbox>
  )
}
```

## Centered Splash Screen

```tsx
// Home/splash screen pattern (opentui-examples)
function SplashScreen() {
  return (
    <box alignItems="center" justifyContent="center" flexGrow={1}>
      <box justifyContent="center" alignItems="flex-end">
        <ascii-font font="tiny" text="MyApp" />
        <text attributes={TextAttributes.DIM}>Press any key to continue</text>
      </box>
    </box>
  )
}
```

## Key Rules

1. **Always `renderer.destroy()` before exit** — never bare `process.exit(0)`
2. **Use `flexGrow={1}`** for responsive content areas, not fixed heights
3. **Show keyboard hints** in footer or status bar
4. **Guard keyboard handlers** with focus/modal checks
5. **Use memory history** for routing (not browser history)
6. **Pre-encode expensive data** (spinner frames, syntax styles) outside render
7. **Clean up intervals/subscriptions** in useEffect return
