import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TransformFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function TransformFields({ params, onChange }: TransformFieldsProps) {
  const translation = (params.translation as string) || '';
  const rotation = (params.rotation as string) || '';

  return (
    <>
      <div className='flex-1'>
        <Label className='text-xs'>Translation (X,Y,Z)</Label>
        <Input
          className='h-8 text-sm'
          placeholder='e.g., 0,0,0'
          value={translation}
          onChange={(e) => onChange({ ...params, translation: e.target.value })}
        />
      </div>
      <div className='flex-1'>
        <Label className='text-xs'>Rotation (optional)</Label>
        <Input
          className='h-8 text-sm'
          placeholder='Matrix or Euler angles'
          value={rotation}
          onChange={(e) => onChange({ ...params, rotation: e.target.value })}
        />
      </div>
    </>
  );
}
