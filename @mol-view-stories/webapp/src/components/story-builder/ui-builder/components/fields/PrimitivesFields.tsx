import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PrimitivesFieldsProps {
  value: string;
  onChange: (value: string) => void;
}

export function PrimitivesFields({ value, onChange }: PrimitivesFieldsProps) {
  return (
    <div className='flex-1'>
      <Label className='text-xs'>Options (optional)</Label>
      <Input
        className='h-8 text-sm'
        placeholder='e.g., label_background_color: black'
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
