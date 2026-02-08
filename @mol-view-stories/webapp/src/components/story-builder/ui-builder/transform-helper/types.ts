/** Transform parameters matching MVS spec */
export interface TransformParams {
  rotation?: number[]; // 9 values, 3x3 column-major
  translation?: [number, number, number];
  rotation_center?: 'centroid' | [number, number, number] | null;
  matrix?: number[] | null; // 16 values, 4x4 column-major
}

/** Translation panel props */
export interface TranslationPanelProps {
  x: number;
  y: number;
  z: number;
  onChange: (x: number, y: number, z: number) => void;
}

/** Rotation matrix panel props */
export interface RotationMatrixPanelProps {
  /** 9-element column-major rotation matrix */
  matrix: number[];
  onChange: (matrix: number[]) => void;
}

/** Rotation presets panel props */
export interface RotationPresetsPanelProps {
  onSelect: (matrix: number[]) => void;
}

/** Euler angles panel props */
export interface EulerAnglesPanelProps {
  roll: number;
  pitch: number;
  yaw: number;
  onChange: (roll: number, pitch: number, yaw: number) => void;
}

/** Rotation center panel props */
export interface RotationCenterPanelProps {
  mode: 'none' | 'centroid' | 'custom';
  x: number;
  y: number;
  z: number;
  onModeChange: (mode: 'none' | 'centroid' | 'custom') => void;
  onCoordsChange: (x: number, y: number, z: number) => void;
}

/** 4x4 Matrix panel props */
export interface MatrixPanelProps {
  /** 16-element column-major 4x4 matrix, or null if not set */
  matrix: number[] | null;
  onChange: (matrix: number[] | null) => void;
}

/** Raw panel props */
export interface RawPanelProps {
  value: string;
  error: string;
  onChange: (value: string) => void;
}

/** SVG transform preview props */
export interface TransformPreviewProps {
  /** 9-element column-major rotation matrix */
  rotation: number[];
  /** Translation vector [x, y, z] */
  translation: [number, number, number];
}
