import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ColorFieldsProps {
  colorType: string;
  color: string;
  onColorTypeChange: (value: string) => void;
  onColorChange: (value: string) => void;
}

export function ColorFields({ colorType, color, onColorTypeChange, onColorChange }: ColorFieldsProps) {
  return (
    <>
      <div className='flex-1'>
        <Label className='text-xs'>Color Type</Label>
        <Select value={colorType} onValueChange={onColorTypeChange}>
          <SelectTrigger size='sm'>
            <SelectValue placeholder='Select' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='uniform'>Uniform</SelectItem>
            <SelectItem value='chain-id'>Chain ID</SelectItem>
            <SelectItem value='element-symbol'>Element Symbol</SelectItem>
            <SelectItem value='custom'>Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {colorType === 'uniform' && (
        <div className='flex-1'>
          <Label className='text-xs'>Color</Label>
          <div className='flex gap-1'>
            <Input
              className='h-8 text-sm flex-1'
              placeholder='e.g., #4577B2'
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
            />
            <div
              className='w-8 h-8 rounded border border-gray-300'
              style={{ backgroundColor: color || '#000000' }}
              title={color || ''}
            />
          </div>
        </div>
      )}
    </>
  );
}
