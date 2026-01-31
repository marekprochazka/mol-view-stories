// Export UI builder types (MVS format)
export type {
  UINode,
  UIBuilderState,
  ConstantType,
  ConstantEntry,
  ConstantDefinition,
  ConstantRef,
} from './types/ui-builder';
export {
  createEmptyNode,
  createEmptyConstant,
  createConstantRef,
  isConstantRef,
} from './types/ui-builder';

// Export MVS tree grammar (valid parent-child relationships)
export {
  MVS_KIND_LABELS,
  MVS_ALL_KINDS,
  MVS_SELECTABLE_KINDS,
  MVS_VALID_CHILDREN,
  getValidChildren,
  canHaveChild,
  getTerminalKinds,
  isTerminalKind,
} from './types/mvs-tree-grammar';

export const placeholder = 'state-builder';

