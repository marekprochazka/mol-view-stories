import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TransformFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function TransformFields({ params, onChange }: TransformFieldsProps) {
  // Translation is an array of 3 numbers [x, y, z]
  const translation = params.translation as number[] | undefined;
  const tx = translation?.[0] ?? 0;
  const ty = translation?.[1] ?? 0;
  const tz = translation?.[2] ?? 0;

  // Rotation is an array of 9 numbers (3x3 matrix, column-major)
  const rotation = params.rotation as number[] | undefined;
  // Display as comma-separated string for easier editing
  const rotationString = rotation ? rotation.map((n) => n.toFixed(6)).join(', ') : '';

  const handleTranslationChange = (axis: 0 | 1 | 2, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newTranslation = [...(translation || [0, 0, 0])];
    newTranslation[axis] = numValue;
    onChange({ ...params, translation: newTranslation });
  };

  const handleRotationChange = (value: string) => {
    if (!value.trim()) {
      // Clear rotation if empty
      const { rotation: _rotation, ...rest } = params;
      onChange(rest);
      return;
    }

    // Parse comma-separated numbers
    const numbers = value
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));

    if (numbers.length === 9) {
      onChange({ ...params, rotation: numbers });
    }
    // If not exactly 9 numbers, don't update (let user keep editing)
  };

  return (
    <>
      <div className='flex-1'>
        <Label className='text-xs'>Translation (X, Y, Z)</Label>
        <div className='flex gap-1'>
          <Input
            className='h-8 text-sm'
            type='number'
            step='0.1'
            placeholder='X'
            value={tx}
            onChange={(e) => handleTranslationChange(0, e.target.value)}
            title='X translation'
          />
          <Input
            className='h-8 text-sm'
            type='number'
            step='0.1'
            placeholder='Y'
            value={ty}
            onChange={(e) => handleTranslationChange(1, e.target.value)}
            title='Y translation'
          />
          <Input
            className='h-8 text-sm'
            type='number'
            step='0.1'
            placeholder='Z'
            value={tz}
            onChange={(e) => handleTranslationChange(2, e.target.value)}
            title='Z translation'
          />
        </div>
      </div>
      <div className='flex-1'>
        <Label className='text-xs'>Rotation Matrix (9 values, optional)</Label>
        <Input
          className='h-8 text-sm font-mono text-xs'
          placeholder='r1, r2, r3, r4, r5, r6, r7, r8, r9'
          value={rotationString}
          onChange={(e) => handleRotationChange(e.target.value)}
          title='3x3 rotation matrix in column-major order'
        />
      </div>
    </>
  );
}
