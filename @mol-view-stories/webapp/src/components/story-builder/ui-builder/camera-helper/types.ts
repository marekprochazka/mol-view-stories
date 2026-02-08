/** Camera parameters matching MVS camera node spec */
export interface CameraParams {
  position: [number, number, number];
  target: [number, number, number];
  up?: [number, number, number];
}

/** Vectors panel props */
export interface VectorsPanelProps {
  position: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];
  onPositionChange: (v: [number, number, number]) => void;
  onTargetChange: (v: [number, number, number]) => void;
  onUpChange: (v: [number, number, number]) => void;
}

/** Presets panel props */
export interface PresetsPanelProps {
  onSelect: (params: CameraParams) => void;
}

/** Raw panel props */
export interface RawPanelProps {
  value: string;
  error: string;
  onChange: (value: string) => void;
}

/** Camera preview props */
export interface CameraPreviewProps {
  position: [number, number, number];
  target: [number, number, number];
}

/** Camera preset definition */
export interface CameraPresetDef {
  label: string;
  description: string;
  position: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];
}
