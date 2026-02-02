// Export UI builder types (MVS format)
export type {
  UINode,
  UIBuilderState,
  ConstantType,
  ConstantEntry,
  ConstantDefinition,
  ConstantRef,
  RawMVSNode,
  RawMVSTree,
} from './types/ui-builder';
export {
  createEmptyNode,
  createEmptyConstant,
  createConstantRef,
  isConstantRef,
  countSubtreeNodes,
  mvsNodeToUINode,
  mvsTreeToUINodes,
  uiNodeToMVSNode,
  uiNodesToMVSTree,
} from './types/ui-builder';

// Export composite sequences
export type { CompositeSequence } from './types/composite-sequences';
export {
  COMPOSITE_SEQUENCES,
  DOWNLOAD_PARSE_SEQUENCE,
  detectCompositeSequence,
  createDownloadParseNodes,
  getCompositeValidChildren,
} from './types/composite-sequences';

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

// Export selector builder types and utilities
export type {
  LabeledValue,
  ComponentSelectorObject,
  ComponentSelectorValue,
  SelectorBuilderMode,
  StructureMetadata,
  ChainInfo,
  LigandInfo,
  ParsedSelector,
} from './types/selector-builder';
export {
  DEFAULT_CHAIN_IDS,
  COMMON_LIGAND_IDS,
  QUICK_SELECTOR_PRESETS,
  buildChainSelector,
  buildResidueSelector,
  buildLigandSelector,
  buildUnionSelector,
  parseSelector,
  selectorToString,
  parseRawSelectorInput,
  formatSelectorPreview,
  getAvailableChains,
  getAvailableLigands,
  getResidueRange,
} from './types/selector-builder';

// Export structure metadata extraction utilities
export type { RawChainData, RawLigandData } from './types/structure-metadata-extractor';
export {
  buildStructureMetadata,
  mergeStructureMetadata,
} from './types/structure-metadata-extractor';

// Export tree templates
export type {
  MVSNodeSnippet,
  TreeTemplate,
  TemplateCategory,
} from './types/tree-templates';
export {
  BUILTIN_TEMPLATES,
  getTemplatesForParentKind,
  instantiateTemplate,
} from './types/tree-templates';

// Export template adapter
export type { TemplateAdapter } from './types/template-adapter';
export { BUILTIN_ADAPTER_ID } from './types/template-adapter';

// Export template registry
export type { TemplateRegistry } from './types/template-registry';
export { createTemplateRegistry } from './types/template-registry';

export const placeholder = 'state-builder';

