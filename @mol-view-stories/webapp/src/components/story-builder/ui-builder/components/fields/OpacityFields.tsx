import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OpacityFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function OpacityFields({ params, onChange }: OpacityFieldsProps) {
  const opacity = (params.opacity as number) ?? 1.0;

  const handleOpacityChange = (value: string) => {
    const numValue = parseFloat(value);
    // Clamp to 0-1 range
    const clampedValue = Math.max(0, Math.min(1, isNaN(numValue) ? 1 : numValue));
    onChange({ ...params, opacity: clampedValue });
  };

  return (
    <div className='w-32'>
      <Label className='text-xs'>Opacity (0-1)</Label>
      <Input
        className='h-8 text-sm'
        type='number'
        min='0'
        max='1'
        step='0.1'
        placeholder='1.0'
        value={opacity}
        onChange={(e) => handleOpacityChange(e.target.value)}
        title='0.0 = fully transparent, 1.0 = fully opaque'
      />
    </div>
  );
}
