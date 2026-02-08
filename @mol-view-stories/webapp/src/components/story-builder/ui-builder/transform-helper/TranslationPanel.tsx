'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TranslationPanelProps } from './types';

export function TranslationPanel({ x, y, z, onChange }: TranslationPanelProps) {
  const handleChange = (axis: 0 | 1 | 2, value: string) => {
    const num = parseFloat(value) || 0;
    const vals: [number, number, number] = [x, y, z];
    vals[axis] = num;
    onChange(vals[0], vals[1], vals[2]);
  };

  return (
    <div className='space-y-2'>
      <Label className='text-sm'>Translation Vector (X, Y, Z)</Label>
      <div className='grid grid-cols-3 gap-2'>
        {(['X', 'Y', 'Z'] as const).map((label, i) => (
          <div key={label}>
            <Label className='text-xs text-muted-foreground'>{label}</Label>
            <Input
              className='h-8 text-sm font-mono no-spinners'
              type='number'
              step='0.1'
              placeholder='0'
              value={[x, y, z][i]}
              onChange={(e) => handleChange(i as 0 | 1 | 2, e.target.value)}
              title={`${label} translation`}
            />
          </div>
        ))}
      </div>
      <p className='text-xs text-muted-foreground'>
        Applied after rotation. Units match structure coordinates.
      </p>
    </div>
  );
}
