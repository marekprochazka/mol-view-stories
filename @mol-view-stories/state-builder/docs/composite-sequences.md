# Composite Sequences - Developer Documentation

## Overview

Composite sequences are a **view-level abstraction** that allows common node patterns to be rendered as single UI rows while maintaining the underlying MVS node structure unchanged. This provides a cleaner UX for frequently used node combinations without modifying the AST, factory, or code generation layers.

**Key principle:** The underlying state remains regular MVS nodes - no new node types, no changes to the compiler. The composite is purely a UI rendering concern.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer (View)                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ CompositeRow renders download→parse as single row   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                State Layer (unchanged)                      │
│  UINode (kind: 'download')                                  │
│    └─ UINode (kind: 'parse')                                │
│        └─ ... children                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            Compiler Layer (unchanged)                       │
│  Processes standard MVS nodes, unaware of composites        │
└─────────────────────────────────────────────────────────────┘
```

## Files Structure

```
@mol-view-stories/state-builder/src/types/
├── composite-sequences.ts     # Composite definitions, detection, creation
├── index-internal.ts          # Internal re-exports (avoid circular deps)
└── ui-builder.ts              # Core UINode types

@mol-view-stories/webapp/.../ui-builder/
├── CompositeRow.tsx           # Renders composite as single row
├── OperationRow.tsx           # Detects composites, delegates to CompositeRow
└── components/
    ├── KindSelect.tsx         # Shows composite option in kind dropdown
    └── fields/
        └── DownloadParseFields.tsx  # Combined fields for download+parse
```

## Creating a New Composite

### Step 1: Define the Composite Sequence

In `composite-sequences.ts`, add your sequence definition:

```typescript
export interface CompositeSequence {
  id: string;           // Unique identifier
  label: string;        // Display label in UI
  pattern: readonly MVSKind[];  // Node kinds in parent→child order
  exitKind: MVSKind;    // Last node's kind (determines valid children)
}

// Example: A hypothetical structure→component composite
export const STRUCTURE_COMPONENT_SEQUENCE: CompositeSequence = {
  id: 'structure-component',
  label: 'Structure + Component',
  pattern: ['structure', 'component'],
  exitKind: 'component',
};

// Register it in the list
export const COMPOSITE_SEQUENCES: readonly CompositeSequence[] = [
  DOWNLOAD_PARSE_SEQUENCE,
  STRUCTURE_COMPONENT_SEQUENCE,  // Add here
];
```

### Step 2: Update Detection Logic

The `detectCompositeSequence` function checks if a node matches a composite pattern:

```typescript
export function detectCompositeSequence(node: UINode): {
  sequence: CompositeSequence;
  exitNode: UINode;
} | null {
  // Existing download → parse detection
  if (node.kind === 'download') {
    const parseChild = node.children?.[0];
    if (parseChild?.kind === 'parse') {
      return {
        sequence: DOWNLOAD_PARSE_SEQUENCE,
        exitNode: parseChild,
      };
    }
  }

  // Add your new detection
  if (node.kind === 'structure') {
    const componentChild = node.children?.[0];
    if (componentChild?.kind === 'component') {
      return {
        sequence: STRUCTURE_COMPONENT_SEQUENCE,
        exitNode: componentChild,
      };
    }
  }

  return null;
}
```

**Detection rules:**
1. Check the root node's kind matches pattern[0]
2. Check first child's kind matches pattern[1]
3. Return both the sequence definition and the exit node
4. Return `null` if pattern doesn't match (node renders normally)

### Step 3: Create Node Factory Function

```typescript
export function createStructureComponentNodes(): UINode {
  const componentNode = createEmptyNode('component');
  componentNode.params = { selector: 'all' };  // Default params

  const structureNode = createEmptyNode('structure');
  structureNode.params = { type: 'model' };
  structureNode.children = [componentNode];

  return structureNode;
}
```

### Step 4: Create Fields Component

Create a combined fields component in `components/fields/`:

```typescript
// StructureComponentFields.tsx
interface StructureComponentFieldsProps {
  structureNode: UINode;
  componentNode: UINode;
  onStructureChange: (params: Record<string, unknown>) => void;
  onComponentChange: (params: Record<string, unknown>) => void;
  onRefChange: (ref: string) => void;
}

export function StructureComponentFields({
  structureNode,
  componentNode,
  onStructureChange,
  onComponentChange,
  onRefChange,
}: StructureComponentFieldsProps) {
  // Combine fields from both node types
  return (
    <>
      {/* Structure fields */}
      <div className='w-24'>
        <Label className='text-xs'>Type</Label>
        <Select ...>...</Select>
      </div>

      {/* Component fields */}
      <div className='w-24'>
        <Label className='text-xs'>Selector</Label>
        <Select ...>...</Select>
      </div>

      {/* Single ref field */}
      <div className='w-24'>
        <Label className='text-xs'>Ref</Label>
        <Input ... onChange={onRefChange} />
      </div>
    </>
  );
}
```

### Step 5: Update CompositeRow

Add a case in `CompositeRow.tsx` to render your composite's fields:

```typescript
// In CompositeRow, add logic to render different composite types
const renderCompositeFields = () => {
  switch (sequence.id) {
    case 'download-parse':
      return (
        <DownloadParseFields
          downloadNode={rootNode}
          parseNode={exitNode}
          onDownloadChange={handleDownloadParamsChange}
          onParseChange={handleParseParamsChange}
          onRefChange={handleRefChange}
          availableConstants={availableConstants}
        />
      );
    case 'structure-component':
      return (
        <StructureComponentFields
          structureNode={rootNode}
          componentNode={exitNode}
          onStructureChange={...}
          onComponentChange={...}
          onRefChange={...}
        />
      );
  }
};
```

### Step 6: Update KindSelect (Optional)

If you want users to be able to select the composite from the kind dropdown:

```typescript
// In KindSelect.tsx
const showStructureComponentOption = kindsToShow.includes('structure');

// Add to the select content
{showStructureComponentOption && (
  <SelectItem value="__composite:structure-component">
    Structure + Component
  </SelectItem>
)}
```

## How Detection and Replacement Works

### Rendering Flow

```
OperationRow receives node
       │
       ▼
detectCompositeSequence(node)
       │
       ├── Returns null → Render as regular OperationRow
       │
       └── Returns {sequence, exitNode} → Render CompositeRow
                                               │
                                               ▼
                                    CompositeRow shows:
                                    - Combined fields
                                    - Kind selector with composite option
                                    - Children of exitNode
```

### Switching Between Composite and Regular Nodes

**Composite → Regular Node:**
When user selects a different kind in CompositeRow's dropdown:

```typescript
const handleKindChange = (value: string) => {
  if (value === DOWNLOAD_PARSE_VALUE) {
    return; // Already composite
  }
  // Convert to regular node
  onUpdate({
    kind: value as MVSKind,
    params: {},
    children: [],
    ref: undefined,
  });
};
```

This completely replaces the download→parse structure with a fresh node of the selected kind.

**Regular Node → Composite:**
When user selects composite from KindSelect dropdown:

```typescript
// In KindSelect
const handleChange = (selectedValue: string) => {
  if (selectedValue === DOWNLOAD_PARSE_VALUE) {
    const compositeNode = createDownloadParseNodes();
    onCompositeSelect(compositeNode);
  } else {
    onChange(selectedValue as MVSKind);
  }
};

// In OperationRow
const handleCompositeSelect = (compositeNode: UINode) => {
  onUpdate({
    kind: compositeNode.kind,
    params: compositeNode.params,
    children: compositeNode.children,
    ref: compositeNode.ref,
  });
};
```

### Supporting Both Composite and Non-Composite Alternatives

If you need to support both `download` as standalone AND `download→parse` as composite:

1. **Detection is greedy**: If download has a parse child, it's always detected as composite
2. **To allow standalone download**: Don't detect as composite if the pattern doesn't fully match

```typescript
// Only detect composite if there's exactly one parse child
if (node.kind === 'download') {
  const children = node.children || [];
  // Only treat as composite if first child is parse
  // User can still add non-parse children to download
  if (children.length > 0 && children[0].kind === 'parse') {
    return {
      sequence: DOWNLOAD_PARSE_SEQUENCE,
      exitNode: children[0],
    };
  }
}
```

3. **Kind dropdown options**: The KindSelect filters kinds to show composite OR individual kinds, not both:

```typescript
// Composite replaces both download and parse in dropdown
const regularKinds = showCompositeOption
  ? kindsToShow.filter((k) => k !== 'download' && k !== 'parse')
  : kindsToShow;
```

## Ref Handling in Composites

Composites use a single ref input that propagates to multiple nodes:

```typescript
const handleRefChange = (ref: string) => {
  if (ref) {
    // download.ref = "myData"
    // parse.ref = "myDataParse" (suffix added)
    onUpdate({
      ref,
      children: [{ ...exitNode, ref: ref + 'Parse' }],
    });
  } else {
    // Clear both refs
    onUpdate({
      ref: undefined,
      children: [{ ...exitNode, ref: undefined }],
    });
  }
};
```

## Children Handling

Children are attached to the **exit node** (last in pattern), not the root:

```
CompositeRow (download + parse)
  └─ Children rendered here are parse.children
      ├─ structure
      ├─ volume
      └─ coordinates
```

The `getCompositeValidChildren(sequence)` function returns valid children for the exit kind:

```typescript
export function getCompositeValidChildren(sequence: CompositeSequence): readonly MVSKind[] {
  return getValidChildren(sequence.exitKind);
}
```

## Exports

Add to `@mol-view-stories/state-builder/src/index.ts`:

```typescript
export type { CompositeSequence } from './types/composite-sequences';
export {
  COMPOSITE_SEQUENCES,
  DOWNLOAD_PARSE_SEQUENCE,
  detectCompositeSequence,
  createDownloadParseNodes,
  getCompositeValidChildren,
} from './types/composite-sequences';
```

## Testing Checklist

When adding a new composite:

- [ ] Detection correctly identifies the pattern
- [ ] Detection returns `null` when pattern doesn't match
- [ ] Combined fields render correctly
- [ ] All params from both nodes are editable
- [ ] Ref handling propagates to all nodes in composite
- [ ] Children are added to exit node
- [ ] Valid children dropdown shows correct options
- [ ] Switching to different kind from composite works
- [ ] Switching from regular kind to composite works
- [ ] Code generation produces correct MVS output
- [ ] Import of existing MVS data renders as composite
