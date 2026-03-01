import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface TooltipFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function TooltipFields({ params, onChange }: TooltipFieldsProps) {
  const text = (params.text as string) || '';

  return (
    <div className='flex-1'>
      <Label className='text-xs'>Text</Label>
      <Input
        className='h-8 text-sm'
        placeholder='Tooltip text'
        value={text}
        onChange={(e) => onChange({ ...params, text: e.target.value })}
      />
    </div>
  );
}
