/**
 * Primitive Helper Types
 *
 * Shared types and helpers for the primitive-helper panel components.
 */

export type PositionMode = 'vec3' | 'expression';

/**
 * Dual-mode position state: either a vec3 triple [x,y,z] or a raw ComponentExpression JSON.
 * Primitive position/start/end/center fields accept both.
 */
export interface PositionEditorState {
  mode: PositionMode;
  x: number;
  y: number;
  z: number;
  /** Raw JSON string for expression mode, e.g. '{}' or '{ "label_asym_id": "A" }' */
  expressionJson: string;
}

export function defaultPositionState(): PositionEditorState {
  return { mode: 'vec3', x: 0, y: 0, z: 0, expressionJson: '{}' };
}

export function positionFromParam(value: unknown): PositionEditorState {
  if (Array.isArray(value) && value.length === 3) {
    const [x, y, z] = value;
    return {
      mode: 'vec3',
      x: typeof x === 'number' ? x : 0,
      y: typeof y === 'number' ? y : 0,
      z: typeof z === 'number' ? z : 0,
      expressionJson: '{}',
    };
  }
  if (value !== null && typeof value === 'object') {
    return {
      mode: 'expression',
      x: 0,
      y: 0,
      z: 0,
      expressionJson: JSON.stringify(value, null, 2),
    };
  }
  return defaultPositionState();
}

export function positionToParam(state: PositionEditorState): unknown {
  if (state.mode === 'vec3') {
    return [state.x, state.y, state.z];
  }
  try {
    return JSON.parse(state.expressionJson);
  } catch {
    return {};
  }
}

/** Shared props contract for ALL primitive kind field components */
export interface PrimitiveKindFieldsProps {
  params: Record<string, unknown>;
  onUpdate: (params: Record<string, unknown>) => void;
}
