import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LabelFieldsProps {
  text: string;
  position: string;
  size: string;
  onTextChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  onSizeChange: (value: string) => void;
}

export function LabelFields({ text, position, size, onTextChange, onPositionChange, onSizeChange }: LabelFieldsProps) {
  return (
    <>
      <div className='flex-1'>
        <Label className='text-xs'>Text</Label>
        <Input
          className='h-8 text-sm'
          placeholder='Label text'
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
        />
      </div>
      <div className='flex-1'>
        <Label className='text-xs'>Position (X,Y,Z)</Label>
        <Input
          className='h-8 text-sm'
          placeholder='e.g., 0,0,0'
          value={position}
          onChange={(e) => onPositionChange(e.target.value)}
        />
      </div>
      <div className='w-24'>
        <Label className='text-xs'>Size</Label>
        <Input
          className='h-8 text-sm'
          type='number'
          placeholder='1.5'
          value={size}
          onChange={(e) => onSizeChange(e.target.value)}
        />
      </div>
    </>
  );
}
