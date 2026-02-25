# Architecture

## Package Structure

```
state-builder-ui/
├── src/
│   ├── index.ts                    # Public API barrel
│   ├── provider.tsx                # UIBuilderProvider + UIBuilderHandle
│   ├── styles.css                  # CSS variables + utility classes
│   │
│   ├── state/                      # Internal Jotai atoms and contexts
│   │   ├── atoms.ts                # SceneKeyAtom, UIBuilderNodesAtom, etc.
│   │   ├── notifications.ts        # NotificationContext + useNotify hook
│   │   └── codegen-context.ts      # CodeGenContext + useCodeGenCallback hook
│   │
│   ├── lib/
│   │   └── utils.ts                # cn() utility (clsx + tailwind-merge)
│   │
│   ├── ui/                         # Copied Shadcn/Radix UI components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   └── confirm-dialog.tsx
│   │
│   ├── UIBuilder.tsx               # Main visual builder component
│   ├── AnimationHelper.tsx         # Animation editing dialog
│   ├── AnimationSection.tsx        # Animation section in UIBuilder
│   ├── CameraHelper.tsx            # Camera editing dialog
│   ├── CameraSection.tsx           # Camera section in UIBuilder
│   ├── ConstantsSection.tsx        # Constants (colors, URLs) section
│   ├── OperationRow.tsx            # Single node row in the tree
│   ├── CompositeRow.tsx            # Composite sequence row
│   ├── SelectorHelper.tsx          # Structure selector dialog
│   ├── StructureMetadataContext.tsx # Context for chain/residue/ligand data
│   ├── TransformHelper.tsx         # Transform matrix editing dialog
│   │
│   ├── animation-helper/           # Animation helper sub-panels
│   ├── camera-helper/              # Camera helper sub-panels
│   ├── selector-helper/            # Selector helper sub-panels
│   ├── transform-helper/           # Transform helper sub-panels
│   │
│   ├── components/
│   │   ├── fields/                 # Node parameter field editors
│   │   ├── KindSelect.tsx
│   │   ├── TypeSelect.tsx
│   │   ├── ConstantOperation.tsx
│   │   ├── OperationActions.tsx
│   │   └── TreeLines.tsx
│   │
│   └── hooks/
│       └── useStructureMetadataLoader.ts
│
├── docs/
│   ├── integration-guide.md
│   └── architecture.md
├── package.json
├── tsconfig.json
└── README.md
```

## State Layer

Internal state is managed via Jotai atoms in `src/state/atoms.ts`. These atoms are **not exported** from the public API — they are an implementation detail.

| Atom | Type | Purpose |
|------|------|---------|
| `SceneKeyAtom` | `string` | Active scene identifier for scoping |
| `CameraSnapshotAtom` | `unknown` | Mol* camera snapshot (optional) |
| `PluginAtom` | `unknown` | Mol* PluginUIContext instance (optional) |
| `UIBuilderNodesAtom` | `Record<string, UINode[]>` | Per-scene node trees |
| `UIBuilderConstantsAtom` | `Record<string, ConstantDefinition[]>` | Per-scene color/URL constants |
| `UIBuilderCameraAtom` | `Record<string, CameraParams | null>` | Per-scene camera params |
| `UIBuilderAnimationAtom` | `Record<string, AnimationParams | null>` | Per-scene animation params |

Atoms are scoped by `SceneKeyAtom` — switching `sceneKey` on the provider automatically changes which slice of state each component reads.

## Provider Pattern

`UIBuilderProvider` creates an isolated Jotai store (not the default global store). This means:
- Multiple `UIBuilderProvider` instances can coexist on the same page without state conflicts
- Props flow into atoms via `useEffect` syncs
- The `UIBuilderHandle` ref exposes an imperative API for external control

```
UIBuilderProvider
  ├── creates JotaiStore (isolated)
  ├── syncs sceneKey/plugin/cameraSnapshot via useEffect → atoms
  ├── provides NotificationContext (onNotification callback)
  ├── provides CodeGenContext (onCodeGenerated callback)
  └── exposes UIBuilderHandle via forwardRef
      ├── setCamera(params) → writes to UIBuilderCameraAtom
      └── getState() → reads all atoms for current sceneKey
```

## Shadcn Components

The 10 Shadcn/Radix UI components in `src/ui/` are direct copies from the webapp, with:
- `@/lib/utils` → `../lib/utils`
- `@/components/ui/X` → `./X` (in confirm-dialog.tsx)

When Shadcn releases updates, copy the new versions from the webapp. The copy strategy avoids complex re-export chains and ensures the components use this package's `cn()` function.

## Styling

`src/styles.css` declares CSS variables inside `@layer state-builder-ui-defaults`. The `@layer` rule ensures consumer variables declared outside a layer (or in a higher-priority layer) always win — no `!important` needed.

The `no-spinners` utility class (for number inputs) is also defined here.

Theme variables follow the Shadcn naming convention (`--primary`, `--muted-foreground`, etc.) using OKLch colors.
