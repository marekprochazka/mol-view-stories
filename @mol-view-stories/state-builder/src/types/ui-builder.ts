/**
 * Headless UI Builder Types - MVS Format
 *
 * These types define MVS nodes in a mutable format suitable for UI editing.
 * They are compatible with the MVS JSON format used by the compiler.
 *
 * This is a headless layer (no UI dependencies) that allows:
 * - Direct storage of MVS-compatible data structures
 * - Type-safe parameter handling
 * - Direct compilation to JavaScript without conversion layers
 */

import type { MVSKind } from 'molstar/lib/extensions/mvs/tree/mvs/mvs-tree';

// ============================================
// Constants Types
// ============================================

/**
 * Types of constants supported by the builder
 */
export type ConstantType = 'colors' | 'urls' | 'generic';

/**
 * A single key-value entry in a constant definition
 */
export interface ConstantEntry {
  key: string;
  value: string;
}

/**
 * A constant definition that can be referenced in field components
 */
export interface ConstantDefinition {
  /** Unique ID for React keys */
  id: string;
  /** Variable name for the constant (e.g., "Colors", "Urls") */
  name: string;
  /** Type of constant - affects UI rendering and validation */
  type: ConstantType;
  /** Key-value entries */
  entries: ConstantEntry[];
}

/**
 * Reference to a constant value for use in field components.
 * When a field uses a constant reference instead of a literal value,
 * the code generator will output an unquoted identifier (e.g., Colors.primary)
 */
export interface ConstantRef {
  /** Marker for type detection */
  __constantRef: true;
  /** The constant name (e.g., "Colors") */
  constantName: string;
  /** The key within the constant (e.g., "primary") */
  entryKey: string;
}

/**
 * Type guard for ConstantRef
 */
export function isConstantRef(value: unknown): value is ConstantRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    '__constantRef' in value &&
    (value as ConstantRef).__constantRef === true
  );
}

/**
 * Helper for creating a constant reference
 */
export function createConstantRef(constantName: string, entryKey: string): ConstantRef {
  return {
    __constantRef: true,
    constantName,
    entryKey,
  };
}

/**
 * Helper for creating an empty constant definition
 */
export function createEmptyConstant(type: ConstantType = 'generic'): ConstantDefinition {
  return {
    id: generateId(),
    name: '',
    type,
    entries: [],
  };
}

// ============================================
// UINode Types
// ============================================

/**
 * Mutable MVS node for UI editing
 * This matches the MVS JSON structure but allows mutation for React state
 */
export interface UINode {
  /** Unique ID for React keys (not part of MVS spec) */
  id: string;

  /** MVS node kind */
  kind: MVSKind | '';

  /** Type-safe parameters for this kind */
  params: Record<string, unknown>;

  /** Optional reference name */
  ref?: string;

  /** Custom properties (Molstar-specific extensions like color themes) */
  custom?: Record<string, unknown>;

  /** Child nodes */
  children?: UINode[];
}

/**
 * Complete UI Builder state
 */
export interface UIBuilderState {
  /** Root-level nodes */
  nodes: UINode[];

  /** Constant definitions */
  constants?: ConstantDefinition[];

  /** Metadata */
  metadata?: {
    timestamp?: string;
  };
}

/**
 * Helper for creating empty nodes
 */
export function createEmptyNode(kind: MVSKind | '' = ''): UINode {
  return {
    id: generateId(),
    kind,
    params: {},
    children: [],
  };
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}
