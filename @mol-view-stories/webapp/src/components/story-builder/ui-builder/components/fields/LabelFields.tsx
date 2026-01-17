import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LabelFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function LabelFields({ params, onChange }: LabelFieldsProps) {
  const text = (params.text as string) || '';
  const position = (params.position as string) || '';
  const size = (params.size as string) || '';

  return (
    <>
      <div className='flex-1'>
        <Label className='text-xs'>Text</Label>
        <Input
          className='h-8 text-sm'
          placeholder='Label text'
          value={text}
          onChange={(e) => onChange({ ...params, text: e.target.value })}
        />
      </div>
      <div className='flex-1'>
        <Label className='text-xs'>Position (X,Y,Z)</Label>
        <Input
          className='h-8 text-sm'
          placeholder='e.g., 0,0,0'
          value={position}
          onChange={(e) => onChange({ ...params, position: e.target.value })}
        />
      </div>
      <div className='w-24'>
        <Label className='text-xs'>Size</Label>
        <Input
          className='h-8 text-sm'
          type='number'
          placeholder='1.5'
          value={size}
          onChange={(e) => onChange({ ...params, size: e.target.value })}
        />
      </div>
    </>
  );
}
