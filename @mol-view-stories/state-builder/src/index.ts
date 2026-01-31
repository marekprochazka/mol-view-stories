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

// Export MVS parameter types and validators
export type {
  StructureType,
  ParseFormat,
  RepresentationType,
  ComponentSelector,
  PrimitiveKind,
  ClipType,
  VolumeRepresentationType,
  MolstarColorTheme,
  CarbonColorOption,
} from './types/mvs-params';
export {
  STRUCTURE_TYPES,
  PARSE_FORMATS,
  REPRESENTATION_TYPES,
  COMPONENT_SELECTORS,
  PRIMITIVE_KINDS,
  CLIP_TYPES,
  VOLUME_REPRESENTATION_TYPES,
  MOLSTAR_COLOR_THEMES,
  CARBON_COLOR_OPTIONS,
  getActiveValues,
  isValidStructureType,
  isValidParseFormat,
  isValidRepresentationType,
  isValidPrimitiveKind,
  validateStructureParams,
  validateParseParams,
  validateRepresentationParams,
} from './types/mvs-params';

export const placeholder = 'state-builder';

