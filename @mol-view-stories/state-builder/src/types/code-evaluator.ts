import type { ConstantDefinition, RawMVSNode, RawMVSTree } from './ui-builder.ts';

/**
 * Reverse mapping: builder method name → MVS node kind (+ optional extra params)
 */
const METHOD_TO_KIND: Record<string, { kind: string; extraParams?: Record<string, unknown> }> = {
  // Direct mappings
  download:     { kind: 'download' },
  parse:        { kind: 'parse' },
  coordinates:  { kind: 'coordinates' },
  representation: { kind: 'representation' },
  volume:       { kind: 'volume' },
  opacity:      { kind: 'opacity' },
  transform:    { kind: 'transform' },
  instance:     { kind: 'instance' },
  clip:         { kind: 'clip' },
  focus:        { kind: 'focus' },
  camera:       { kind: 'camera' },
  canvas:       { kind: 'canvas' },
  animation:    { kind: 'animation' },
  interpolate:  { kind: 'interpolate' },

  // Structure variants
  modelStructure:         { kind: 'structure', extraParams: { type: 'model' } },
  assemblyStructure:      { kind: 'structure', extraParams: { type: 'assembly' } },
  symmetryStructure:      { kind: 'structure', extraParams: { type: 'symmetry' } },
  symmetryMatesStructure: { kind: 'structure', extraParams: { type: 'symmetry_mates' } },

  // Component variants
  component:           { kind: 'component' },
  componentFromUri:    { kind: 'component_from_uri' },
  componentFromSource: { kind: 'component_from_source' },

  // Color variants
  color:           { kind: 'color' },
  colorFromUri:    { kind: 'color_from_uri' },
  colorFromSource: { kind: 'color_from_source' },

  // Label variants (defaults to annotation label)
  label:           { kind: 'label' },
  labelFromUri:    { kind: 'label_from_uri' },
  labelFromSource: { kind: 'label_from_source' },

  // Tooltip variants
  tooltip:           { kind: 'tooltip' },
  tooltipFromUri:    { kind: 'tooltip_from_uri' },
  tooltipFromSource: { kind: 'tooltip_from_source' },

  // Primitives
  primitives:       { kind: 'primitives' },
  primitivesFromUri: { kind: 'primitives_from_uri' },

  // Primitive shapes (called on a primitives node)
  mesh:     { kind: 'primitive', extraParams: { kind: 'mesh' } },
  lines:    { kind: 'primitive', extraParams: { kind: 'lines' } },
  tube:     { kind: 'primitive', extraParams: { kind: 'tube' } },
  arrow:    { kind: 'primitive', extraParams: { kind: 'arrow' } },
  distance: { kind: 'primitive', extraParams: { kind: 'distance_measurement' } },
  angle:    { kind: 'primitive', extraParams: { kind: 'angle_measurement' } },
  ellipse:  { kind: 'primitive', extraParams: { kind: 'ellipse' } },
  ellipsoid: { kind: 'primitive', extraParams: { kind: 'ellipsoid' } },
  box:      { kind: 'primitive', extraParams: { kind: 'box' } },
};

function makeMockNode(kind: string, params: Record<string, unknown>, parentChildren: RawMVSNode[]): unknown {
  const node: RawMVSNode = { kind, params, children: [] };
  parentChildren.push(node);
  return new Proxy({}, {
    get(_, method: string) {
      if (method === '__node__') return node;
      return (childParams: Record<string, unknown> = {}) => {
        const mapping = METHOD_TO_KIND[method];
        if (!mapping) return undefined;
        const childKind = mapping.kind;
        const mergedParams = { ...mapping.extraParams, ...childParams };
        return makeMockNode(childKind, mergedParams, node.children!);
      };
    },
  });
}

export interface EvaluateCodeOptions {
  /** ConstantDefinition objects to inject as named scope variables (e.g. `Colors`, `Urls`). */
  constants?: ConstantDefinition[];
  /**
   * Global story JavaScript that defines helper functions (e.g. `structure()`, `polymer()`).
   * Prepended before the scene code so helpers are in scope when the scene code runs.
   */
  storyCode?: string;
  /**
   * Additional scope variables to inject (e.g. BuilderLib: Vec3, Mat3, etc.) so helper
   * functions that use math utilities don't throw ReferenceErrors.
   * Constants win over extraScope if keys collide.
   */
  extraScope?: Record<string, unknown>;
}

/**
 * Execute builder-API JavaScript code and reconstruct the MVS tree via a Proxy-based mock.
 *
 * Mirrors the execution pattern of `getMVSSnapshot` in `@mol-view-stories/lib`:
 * - combines `storyCode` (helper function definitions) + `code` (scene code)
 * - injects `extraScope` (BuilderLib math utilities) + `constants` (ConstantDefinition values)
 *
 * Helper functions like `structure(builder, id)` work because they call `builder.xxx()` methods
 * which are intercepted by the Proxy regardless of call site.
 *
 * Returns `null` if the code cannot be evaluated (syntax error, CSP block, async code,
 * non-builder patterns, etc.). The caller should surface an appropriate error message.
 */
export function evaluateCodeToMVSTree(
  code: string,
  options?: EvaluateCodeOptions
): RawMVSTree | null {
  const { constants, storyCode, extraScope } = options ?? {};

  const rootChildren: RawMVSNode[] = [];

  const builder = new Proxy({}, {
    get(_, method: string) {
      return (params: Record<string, unknown> = {}) => {
        const mapping = METHOD_TO_KIND[method as string];
        if (!mapping) return undefined;
        return makeMockNode(mapping.kind, { ...mapping.extraParams, ...params }, rootChildren);
      };
    },
  });

  // Combine story helpers + scene code (mirrors getMVSSnapshot pattern)
  const fullCode = storyCode ? `${storyCode}\n\n${code}` : code;

  // Build scope: extraScope first, then constants (constants win on collision)
  const allScope: Record<string, unknown> = { ...extraScope };
  for (const c of constants ?? []) {
    allScope[c.name] = Object.fromEntries(c.entries.map(e => [e.key, e.value]));
  }
  const scopeArgNames = Object.keys(allScope);
  const scopeArgValues = Object.values(allScope);

  try {
    // eslint-disable-next-line no-new-func
    new Function('builder', ...scopeArgNames, fullCode)(builder, ...scopeArgValues);
    return { kind: 'root', params: {}, children: rootChildren };
  } catch {
    return null;
  }
}
