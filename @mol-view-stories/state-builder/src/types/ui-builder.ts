/**
 * Headless UI Builder Operation Types
 *
 * These types define the structure of operations in the visual UI builder.
 * They are headless (no UI dependencies) and serve as:
 * - Data structures for the UI components to build scenes
 * - Input format for the compiler to generate executable code
 *
 * This separation allows the business logic to live in state-builder
 * while UI components can be implemented in any framework.
 */

/**
 * All supported operation types in the UI builder
 */
export type OperationType =
  | 'constant'
  | 'download'
  | 'parse'
  | 'structure'
  | 'component'
  | 'representation'
  | 'color'
  | 'opacity'
  | 'clip'
  | 'transform'
  | 'label'
  | 'tooltip'
  | 'primitives'
  | 'camera'
  | 'focus'
  | 'canvas'
  | 'animation';

/**
 * Base operation interface
 * All operations share these common fields
 */
export interface Operation {
  /** Unique identifier for this operation */
  id: string;

  /** The type of operation */
  type: OperationType | '';

  /** Parameters specific to this operation type */
  params: Record<string, string>;

  /** Optional reference name for this operation to be used elsewhere */
  ref?: string;

  /** Child operations that depend on this operation */
  children?: Operation[];
}

/**
 * Structure for constant definitions (colors, domains, generic key-value pairs)
 */
export interface ConstantDefinition {
  /** Type of constant: colors, domains, or generic */
  constantType: 'colors' | 'domains' | 'generic';

  /** Display name for this constant */
  name: string;

  /** Key-value entries */
  entries: Array<{
    key: string;
    value: string;
  }>;
}

/**
 * Helper type for building selector objects
 */
export interface SelectorHelper {
  /** Type of selector helper: chain, residue range, ligand, or quick patterns */
  selectorType: 'chain' | 'residue' | 'ligand' | 'all';

  /** The constructed selector value */
  selectorValue: string;
}

/**
 * Export a collection of operations as a complete scene definition
 */
export interface SceneDefinition {
  /** List of operations that define the scene */
  operations: Operation[];

  /** Metadata about the scene */
  metadata?: {
    name?: string;
    description?: string;
    version?: string;
  };
}
