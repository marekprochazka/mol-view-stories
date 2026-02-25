'use client';

import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { columnToRowMajor3, rowToColumnMajor3, isValidRotationMatrix } from '@mol-view-stories/state-builder/src';
import type { RotationMatrixPanelProps } from './types';

export function RotationMatrixPanel({ matrix, onChange }: RotationMatrixPanelProps) {
  // Display in row-major (natural reading) order
  const rowMajor = columnToRowMajor3(matrix);
  const valid = isValidRotationMatrix(matrix);

  const handleCellChange = (rowMajorIndex: number, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const newRowMajor = [...rowMajor];
    newRowMajor[rowMajorIndex] = num;
    onChange(rowToColumnMajor3(newRowMajor));
  };

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2'>
        <Label className='text-sm'>3x3 Rotation Matrix</Label>
        {matrix.some(v => v !== 0) && (
          <span className={`text-xs ${valid ? 'text-green-600' : 'text-amber-600'}`}>
            {valid ? 'Valid rotation' : 'Not a valid rotation matrix'}
          </span>
        )}
      </div>

      {/* 3x3 grid with bracket styling */}
      <div className='flex items-center gap-1'>
        <div className='border-l-2 border-t-2 border-b-2 border-foreground/30 w-1.5 self-stretch rounded-l-sm' />
        <div className='grid grid-cols-3 gap-1 flex-1'>
          {rowMajor.map((val, idx) => (
            <Input
              key={idx}
              className='h-8 text-xs font-mono text-center no-spinners'
              type='number'
              step='0.01'
              value={parseFloat(val.toFixed(6))}
              onChange={(e) => handleCellChange(idx, e.target.value)}
              title={`Row ${Math.floor(idx / 3) + 1}, Col ${(idx % 3) + 1}`}
            />
          ))}
        </div>
        <div className='border-r-2 border-t-2 border-b-2 border-foreground/30 w-1.5 self-stretch rounded-r-sm' />
      </div>

      <p className='text-xs text-muted-foreground'>
        Displayed row-by-row. Stored in column-major order per MVS spec.
      </p>
    </div>
  );
}
