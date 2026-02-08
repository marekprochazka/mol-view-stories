'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { PresetsPanelProps, CameraPresetDef } from './types';

const CAMERA_PRESETS: CameraPresetDef[] = [
  { label: 'Front', description: 'View from front (+Z)', position: [0, 0, 100], target: [0, 0, 0], up: [0, 1, 0] },
  { label: 'Back', description: 'View from back (-Z)', position: [0, 0, -100], target: [0, 0, 0], up: [0, 1, 0] },
  { label: 'Top', description: 'View from top (+Y)', position: [0, 100, 0], target: [0, 0, 0], up: [0, 0, -1] },
  { label: 'Bottom', description: 'View from bottom (-Y)', position: [0, -100, 0], target: [0, 0, 0], up: [0, 0, 1] },
  { label: 'Left', description: 'View from left (-X)', position: [-100, 0, 0], target: [0, 0, 0], up: [0, 1, 0] },
  { label: 'Right', description: 'View from right (+X)', position: [100, 0, 0], target: [0, 0, 0], up: [0, 1, 0] },
];

export function PresetsPanel({ onSelect }: PresetsPanelProps) {
  return (
    <div className='space-y-2'>
      <Label className='text-sm'>Camera Presets</Label>
      <div className='grid grid-cols-3 gap-2'>
        {CAMERA_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            size='sm'
            variant='outline'
            onClick={() => onSelect({ position: preset.position, target: preset.target, up: preset.up })}
            title={preset.description}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <p className='text-xs text-muted-foreground'>
        Axis-aligned views at distance 100 from origin. Adjust position after selecting.
      </p>
    </div>
  );
}
