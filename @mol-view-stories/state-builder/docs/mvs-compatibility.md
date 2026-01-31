# MVS Compatibility Guide

This document tracks all places that depend on Molstar's MolViewSpec (MVS) schema and what would need to change when MVS is updated to a newer version.

## Dependency Categories

### 1. Auto-Synchronized (No Changes Needed)

These derive from `MVSTreeSchema` at runtime and will automatically adapt:

| Location | What | Source |
|----------|------|--------|
| `types/mvs-tree-grammar.ts` | `MVS_VALID_CHILDREN` | Computed from `MVSTreeSchema.nodes[*].parent` |
| `types/mvs-tree-grammar.ts` | `MVS_KIND_LABELS` | Computed from `MVSTreeSchema.nodes` keys |
| `types/mvs-tree-grammar.ts` | `MVS_ALL_KINDS` | Computed from `MVSTreeSchema.nodes` keys |
| `types/mvs-tree-grammar.ts` | `MVS_SELECTABLE_KINDS` | Computed from `MVSTreeSchema.nodes` keys |
| `types/mvs-tree-grammar.ts` | `getValidChildren()` | Uses `MVS_VALID_CHILDREN` |
| `types/mvs-tree-grammar.ts` | `isTerminalKind()` | Uses `MVS_VALID_CHILDREN` |

**On MVS update:** These will automatically include new node kinds and updated parent-child relationships.

---

### 2. Type Imports (Compile-Time Checked)

These import types from Molstar and will fail to compile if types change:

| Location | Import | Purpose |
|----------|--------|---------|
| `compiler/ast/types.ts` | `MVSKind`, `MVSSubtree` | AST node typing |
| `compiler/ast/types.ts` | `ParamsOfKind` | Type-safe params |
| `compiler/ast/factory.ts` | `MVSKind`, `MVSSubtree` | Factory methods |
| `compiler/ast/node.ts` | `MVSKind` | Node class |
| `types/ui-builder.ts` | `MVSKind` | UINode.kind type |
| `types/composite-sequences.ts` | `MVSKind` | Composite pattern definitions |

**On MVS update:** TypeScript will catch incompatibilities at compile time.

---

### 3. Hardcoded Values (Manual Update Required)

These contain hardcoded lists that must be manually updated when MVS changes:

#### 3.1 Node Kind Mappings (`compiler/codegen/mappings.ts`)

```typescript
// NodeMethodMapper.getMethodName() - switch statement
case 'download': return 'download';
case 'parse': return 'parse';
// ... etc
```

**Risk:** New node kinds will throw `Unknown node kind` error.
**Fix:** Add new cases to the switch statement.

#### 3.2 Structure Types (`compiler/codegen/mappings.ts`)

```typescript
// getStructureMethod()
case 'model': return 'modelStructure';
case 'assembly': return 'assemblyStructure';
case 'symmetry': return 'symmetryStructure';
case 'symmetry_mates': return 'symmetryMatesStructure';
```

**Risk:** New structure types will default to `modelStructure` with warning.

#### 3.3 Primitive Types (`compiler/codegen/mappings.ts`)

```typescript
// getPrimitiveMethod()
case 'mesh': return 'mesh';
case 'lines': return 'lines';
case 'tube': return 'tube';
// ... etc
```

**Risk:** New primitive types will default to `mesh` with warning.

#### 3.4 Chainable/Variable Nodes (`compiler/codegen/mappings.ts`)

```typescript
// isChainable() - hardcoded array
['camera', 'canvas', 'focus', 'transform', ...]

// needsVariable() - hardcoded array
['download', 'parse', 'structure', ...]
```

**Risk:** New nodes won't be properly categorized for code generation.

#### 3.5 Composite Sequence Patterns (`types/composite-sequences.ts`)

```typescript
// DOWNLOAD_PARSE_SEQUENCE - hardcoded pattern
export const DOWNLOAD_PARSE_SEQUENCE: CompositeSequence = {
  id: 'download-parse',
  label: 'Download + Parse',
  pattern: ['download', 'parse'],
  exitKind: 'parse',
};

// detectCompositeSequence() - hardcoded detection logic
if (node.kind === 'download') {
  const parseChild = node.children?.[0];
  if (parseChild?.kind === 'parse') { ... }
}
```

**Risk:** If MVS changes the `download` or `parse` kinds, composite detection will break.
**Fix:** Update the pattern array and detection logic in `composite-sequences.ts`.

---

### 4. UI Field Components (Type-Safe via mvs-params.ts)

Located in `webapp/src/components/story-builder/ui-builder/components/fields/`:

| File | Source | Type Safety |
|------|--------|-------------|
| `StructureFields.tsx` | `STRUCTURE_TYPES` from state-builder | Compile-time checked via `StructureType` |
| `RepresentationFields.tsx` | `REPRESENTATION_TYPES` from state-builder | Compile-time checked via `RepresentationType` |
| `ComponentFields.tsx` | `COMPONENT_SELECTORS` from state-builder | Compile-time checked via `ComponentSelector` |
| `ColorFields.tsx` | `MOLSTAR_COLOR_THEMES` from state-builder | Molstar-specific (not MVS) |
| `DownloadParseFields.tsx` | `PARSE_FORMATS` from state-builder | Compile-time checked via `ParseFormat` |
| `PrimitivesFields.tsx` | Free-form input | N/A |
| `TransformFields.tsx` | Numeric arrays | N/A |
| `CameraFields.tsx` | Vector3 arrays | N/A |
| `OpacityFields.tsx` | Number (0-1) | N/A |
| `LabelFields.tsx` | Free-form text | N/A |

**Risk:** TypeScript will error in `mvs-params.ts` if MVS types change, making it easy to locate what needs updating.

---

### 5. Composite Sequences (View-Level Abstraction)

Composite sequences are UI-only abstractions that render multiple MVS nodes as a single row. They don't affect the compiler or AST - only how nodes are displayed and edited.

#### 5.1 Composite Definitions (`types/composite-sequences.ts`)

| Composite | Pattern | Exit Kind | Valid Children |
|-----------|---------|-----------|----------------|
| Download + Parse | `['download', 'parse']` | `parse` | `structure`, `volume`, `coordinates` |

**On MVS update:** If valid children of `parse` change, `getCompositeValidChildren()` will automatically reflect this (uses `getValidChildren()`).

#### 5.2 UI Components with Composite Logic

| File | Hardcoded Logic |
|------|-----------------|
| `CompositeRow.tsx` | Renders `download-parse` composite, handles ref suffixing (`ref` → `refParse`) |
| `KindSelect.tsx` | Shows "Download + Parse" option when `download` is in allowed kinds |
| `OperationRow.tsx` | Delegates to `CompositeRow` when composite is detected |

**Risk:** Adding new composites requires updates to multiple UI files.
**Fix:** See `docs/composite-sequences.md` for step-by-step guide.

---

## Proposed Type-Safe Improvements

### Option 1: Extract Enums from MVSTreeSchema at Runtime

```typescript
// In state-builder/src/types/mvs-params.ts
import { MVSTreeSchema } from 'molstar/lib/extensions/mvs/tree/mvs/mvs-tree';

// Extract structure types from schema
type StructureParamsSchema = typeof MVSTreeSchema.nodes.structure.params;

// If the schema exposes enum values, extract them:
export function getStructureTypes(): string[] {
  const typeField = MVSTreeSchema.nodes.structure.params.fields.type;
  // Extract allowed values from field schema
  return typeField.type.values ?? [];
}
```

### Option 2: Use MVSNodeParams for Type Checking

```typescript
// In field components
import type { MVSNodeParams } from 'molstar/lib/extensions/mvs/tree/mvs/mvs-tree';

type StructureType = MVSNodeParams<'structure'>['type'];
// TypeScript will error if you use an invalid value

// Example usage in component:
const STRUCTURE_TYPES: StructureType[] = ['model', 'assembly', 'symmetry', 'symmetry_mates'];
// ^ TypeScript will catch if any value is invalid or missing
```

### Option 3: Validation Helper with Deprecation Warnings

```typescript
// In state-builder/src/types/mvs-validation.ts
import type { MVSNodeParams } from 'molstar/lib/extensions/mvs/tree/mvs/mvs-tree';

type ParseFormat = MVSNodeParams<'parse'>['format'];

// This will cause compile error if ParseFormat changes
const KNOWN_PARSE_FORMATS: Record<ParseFormat, { label: string; deprecated?: boolean }> = {
  bcif: { label: 'BCIF' },
  mmcif: { label: 'mmCIF' },
  pdb: { label: 'PDB' },
  // If MVS adds 'sdf', TypeScript will error here until we add it
};

export function getParseFormats() {
  return Object.entries(KNOWN_PARSE_FORMATS)
    .filter(([_, meta]) => !meta.deprecated)
    .map(([value, meta]) => ({ value, label: meta.label }));
}
```

---

## Recommended Actions for MVS Updates

### When Updating Molstar Version:

1. **Run TypeScript Build**
   ```bash
   cd @mol-view-stories/state-builder && npm run build
   ```
   This will catch type incompatibilities.

2. **Check Console Warnings**
   Look for "Unknown node kind", "Unknown structure type", etc.

3. **Review Changelog**
   Check Molstar/MolViewSpec changelog for:
   - New node kinds
   - New parameter types/enums
   - Deprecated features
   - Changed parent-child relationships

4. **Update Hardcoded Lists**
   - `mappings.ts` - node method mappings
   - `composite-sequences.ts` - if `download` or `parse` kinds change
   - Field components - enum values

5. **Test UI Builder**
   - Create nodes of each type
   - Verify dropdowns show all options
   - Check code generation output
   - Test composite row (Download + Parse) creation and editing

---

## Files Quick Reference

### State-Builder (`@mol-view-stories/state-builder/src/`)

| File | MVS Dependency Level |
|------|---------------------|
| `types/mvs-tree-grammar.ts` | Auto-sync |
| `types/ui-builder.ts` | Type import |
| `types/composite-sequences.ts` | **Hardcoded** (pattern detection) + Type import |
| `compiler/ast/types.ts` | Type import |
| `compiler/ast/factory.ts` | Type import |
| `compiler/ast/node.ts` | Type import |
| `compiler/codegen/mappings.ts` | **Hardcoded** |
| `compiler/codegen/generator.ts` | Uses mappings |

### Webapp UI (`@mol-view-stories/webapp/.../ui-builder/`)

| File | MVS Dependency Level |
|------|---------------------|
| `components/KindSelect.tsx` | Auto-sync (uses grammar) + **Hardcoded** (composite option) |
| `OperationRow.tsx` | Auto-sync (uses grammar) + Uses composite detection |
| `CompositeRow.tsx` | **Hardcoded** (composite-specific rendering) |
| `components/fields/StructureFields.tsx` | Type-safe (uses mvs-params) |
| `components/fields/RepresentationFields.tsx` | Type-safe (uses mvs-params) |
| `components/fields/ParseFields.tsx` | Type-safe (uses mvs-params) |
| `components/fields/ComponentFields.tsx` | Type-safe (uses mvs-params) |
| `components/fields/ColorFields.tsx` | Molstar-specific (uses mvs-params) |
| `components/fields/DownloadParseFields.tsx` | Type-safe (uses mvs-params) + Composite-specific |

---

## Related Documentation

- [Composite Sequences Developer Guide](./composite-sequences.md) - How to create new composite sequences
