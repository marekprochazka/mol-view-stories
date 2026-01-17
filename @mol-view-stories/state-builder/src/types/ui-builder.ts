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

  /** Child nodes */
  children?: UINode[];
}

/**
 * Complete UI Builder state
 */
export interface UIBuilderState {
  /** Root-level nodes */
  nodes: UINode[];

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
