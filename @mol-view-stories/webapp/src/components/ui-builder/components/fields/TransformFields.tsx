import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TransformFieldsProps {
  translation: string;
  rotation: string;
  onTranslationChange: (value: string) => void;
  onRotationChange: (value: string) => void;
}

export function TransformFields({ translation, rotation, onTranslationChange, onRotationChange }: TransformFieldsProps) {
  return (
    <>
      <div className='flex-1'>
        <Label className='text-xs'>Translation (X,Y,Z)</Label>
        <Input
          className='h-8 text-sm'
          placeholder='e.g., 0,0,0'
          value={translation}
          onChange={(e) => onTranslationChange(e.target.value)}
        />
      </div>
      <div className='flex-1'>
        <Label className='text-xs'>Rotation (optional)</Label>
        <Input
          className='h-8 text-sm'
          placeholder='Matrix or Euler angles'
          value={rotation}
          onChange={(e) => onRotationChange(e.target.value)}
        />
      </div>
    </>
  );
}
