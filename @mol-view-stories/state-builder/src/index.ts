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

export const placeholder = 'state-builder';

