'use client';

import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import type { RadiusPanelProps } from './types';

export function RadiusPanel({
  radiusFactor,
  radiusExtent,
  radius,
  onRadiusFactorChange,
  onRadiusExtentChange,
  onRadiusChange,
}: RadiusPanelProps) {
  const mode: 'relative' | 'absolute' = radius !== null ? 'absolute' : 'relative';

  return (
    <div className='space-y-3 pt-1'>
      <div className='flex gap-2'>
        <Button
          size='sm'
          variant={mode === 'relative' ? 'default' : 'outline'}
          onClick={() => { if (mode === 'absolute') onRadiusChange(null); }}
        >
          Relative
        </Button>
        <Button
          size='sm'
          variant={mode === 'absolute' ? 'default' : 'outline'}
          onClick={() => { if (mode === 'relative') onRadiusChange(10); }}
        >
          Absolute
        </Button>
      </div>

      {mode === 'relative' ? (
        <div className='space-y-3'>
          <div>
            <Label className='text-xs'>Radius factor</Label>
            <p className='text-xs text-muted-foreground mb-1'>Multiplier on bounding sphere radius (default: 1)</p>
            <Input
              className='h-8 text-sm font-mono'
              type='number'
              step='0.1'
              min='0'
              value={radiusFactor}
              onChange={(e) => onRadiusFactorChange(parseFloat(e.target.value) || 1)}
            />
          </div>
          <div>
            <Label className='text-xs'>Radius extent</Label>
            <p className='text-xs text-muted-foreground mb-1'>Additional additive extent in Å (default: 0)</p>
            <Input
              className='h-8 text-sm font-mono'
              type='number'
              step='0.1'
              value={radiusExtent}
              onChange={(e) => onRadiusExtentChange(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      ) : (
        <div>
          <Label className='text-xs'>Radius (Å)</Label>
          <p className='text-xs text-muted-foreground mb-1'>Absolute radius, overrides factor and extent</p>
          <Input
            className='h-8 text-sm font-mono'
            type='number'
            step='0.5'
            min='0'
            value={radius ?? 10}
            onChange={(e) => onRadiusChange(parseFloat(e.target.value) || 0)}
          />
        </div>
      )}
    </div>
  );
}
