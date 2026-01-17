import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PrimitivesFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function PrimitivesFields({ params, onChange }: PrimitivesFieldsProps) {
  const value = (params.value as string) || '';

  return (
    <div className='flex-1'>
      <Label className='text-xs'>Options (optional)</Label>
      <Input
        className='h-8 text-sm'
        placeholder='e.g., label_background_color: black'
        value={value}
        onChange={(e) => onChange({ ...params, value: e.target.value })}
      />
    </div>
  );
}
