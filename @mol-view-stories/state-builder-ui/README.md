# @mol-view-stories/state-builder-ui

A visual builder UI for MVS (MolViewSpec) trees, packaged as a React component library. Provides a drag-and-drop-style interface for constructing MolViewSpec scene trees without writing code manually.

## What it is

`state-builder-ui` is a React component library extracted from the MVS Stories webapp. It provides:

- **UIBuilder** — the main visual builder component for constructing MVS scene trees
- **UIBuilderProvider** — context/state provider that supplies atoms and callbacks
- **Helper dialogs** — CameraHelper, AnimationHelper, TransformHelper, SelectorHelper
- **Field components** — reusable field editors for node parameters
- Bundled Shadcn/Radix UI components with scoped CSS variables

## Requirements

- React 18+ or 19+
- Tailwind CSS 4 (for class scanning in consuming apps)
- Jotai 2.x

## Quick Start

```tsx
import { UIBuilderProvider, UIBuilder } from '@mol-view-stories/state-builder-ui/src';
import '@mol-view-stories/state-builder-ui/src/styles.css';

function MyApp() {
  return (
    <UIBuilderProvider
      onCodeGenerated={(code) => console.log('Generated:', code)}
    >
      <UIBuilder />
    </UIBuilderProvider>
  );
}
```

## Tailwind CSS Setup

If UIBuilder styles don't appear, add a source directive to your `globals.css`:

```css
@source "path/to/@mol-view-stories/state-builder-ui/src";
```

See `docs/integration-guide.md` for full documentation.
