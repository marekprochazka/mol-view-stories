# Integration Guide

## 1. Provider Props Reference

```tsx
interface UIBuilderProviderProps {
  children: React.ReactNode;

  /** Scene identifier — used to scope state per-scene (default: 'default') */
  sceneKey?: string;

  /** Mol* PluginUIContext instance — enables camera capture and structure metadata */
  plugin?: PluginUIContext | null;

  /** Current camera snapshot from Mol* — enables "Capture from Viewer" buttons */
  cameraSnapshot?: unknown;

  /** Called when the user clicks "Generate Code" — receives generated JS string */
  onCodeGenerated?: (code: string) => void;

  /** Notification handler — wire to sonner, react-hot-toast, etc. */
  onNotification?: (n: { type: 'success' | 'error'; message: string }) => void;

  /** Initial state to load on mount — useful for restoring saved sessions */
  initialState?: Partial<UIBuilderSnapshot>;
}
```

## 2. Theming

CSS variables are declared in `src/styles.css` inside `@layer state-builder-ui-defaults`, so any consumer variable declarations win automatically.

### Override theme variables

```css
:root {
  --primary: oklch(0.5 0.2 220);
  --radius: 0.25rem;
}
```

### Dark mode

Add the `.dark` class to your `<html>` or container element.

### Shadcn compatibility

The bundled Shadcn components use the same variable names as Shadcn's default theme. If your app already defines these variables, the UIBuilder will inherit them automatically — no import of `styles.css` needed.

## 3. Mol* Viewer Integration

Pass the `plugin` and `cameraSnapshot` props to enable viewer-specific features:

```tsx
<UIBuilderProvider
  plugin={molstarPlugin}
  cameraSnapshot={currentCameraSnapshot}
>
  <UIBuilder />
</UIBuilderProvider>
```

**What these enable:**
- `plugin` — "Capture from Viewer" camera button, structure metadata (chain/residue/ligand selectors)
- `cameraSnapshot` — populates the camera section with the current viewer position

## 4. State Management

### Per-scene isolation with `sceneKey`

```tsx
<UIBuilderProvider sceneKey={activeSceneId}>
  <UIBuilder />
</UIBuilderProvider>
```

Each unique `sceneKey` maintains separate node, camera, animation, and constants state. Switching `sceneKey` automatically changes which state is visible.

### Restoring saved state

```tsx
<UIBuilderProvider
  sceneKey={sceneId}
  initialState={{
    nodes: savedNodes,
    constants: savedConstants,
    camera: savedCamera,
    animation: savedAnimation,
  }}
>
  <UIBuilder />
</UIBuilderProvider>
```

`initialState` is applied once on mount and ignored on subsequent renders.

## 5. Imperative API

Use a ref to interact with the builder programmatically:

```tsx
const builderRef = useRef<UIBuilderHandle>(null);

// Set camera from external source
builderRef.current?.setCamera({ position: [0, 0, 100], target: [0, 0, 0] });

// Read current state
const state = builderRef.current?.getState();
```

```tsx
<UIBuilderProvider ref={builderRef} sceneKey={sceneId}>
  <UIBuilder />
</UIBuilderProvider>
```

## 6. Notifications

Wire `onNotification` to your preferred toast library:

```tsx
// With sonner
import { toast } from 'sonner';

<UIBuilderProvider
  onNotification={(n) =>
    n.type === 'error' ? toast.error(n.message) : toast.success(n.message)
  }
>

// With react-hot-toast
import toast from 'react-hot-toast';

<UIBuilderProvider
  onNotification={(n) =>
    n.type === 'error' ? toast.error(n.message) : toast.success(n.message)
  }
>
```

If no `onNotification` is provided, messages are logged to the console.

## 7. Advanced Composition

Individual components can be imported separately:

```tsx
import {
  SelectorHelper,
  CameraHelper,
  AnimationHelper,
  TransformHelper,
  OperationRow,
  TreeLines,
  OperationActions,
} from '@mol-view-stories/state-builder-ui/src';
```

These components expect to be rendered inside a `UIBuilderProvider`.

## 8. Tailwind Setup

Tailwind 4 auto-scans symlinked workspace packages in most configurations. If Tailwind classes from UIBuilder components aren't applied, add an explicit `@source` directive to your CSS entry point:

```css
/* globals.css */
@import 'tailwindcss';
@source "path/to/node_modules/@mol-view-stories/state-builder-ui/src";
```
