import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ColorFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function ColorFields({ params, onChange }: ColorFieldsProps) {
  const color = (params.color as string) || '';

  // Extract color type and color value from the color string
  // Format could be "uniform:#FF0000" or just "chain-id"
  const parts = color.split(':');
  const colorType = parts[0] || '';
  const colorValue = parts[1] || '';

  const handleColorTypeChange = (newColorType: string) => {
    if (newColorType === 'uniform') {
      onChange({ ...params, color: `${newColorType}:${colorValue}` });
    } else {
      onChange({ ...params, color: newColorType });
    }
  };

  const handleColorValueChange = (newColorValue: string) => {
    onChange({ ...params, color: `${colorType}:${newColorValue}` });
  };

  return (
    <>
      <div className='flex-1'>
        <Label className='text-xs'>Color Type</Label>
        <Select value={colorType} onValueChange={handleColorTypeChange}>
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
              value={colorValue}
              onChange={(e) => handleColorValueChange(e.target.value)}
            />
            <div
              className='w-8 h-8 rounded border border-gray-300'
              style={{ backgroundColor: colorValue || '#000000' }}
              title={colorValue || ''}
            />
          </div>
        </div>
      )}
    </>
  );
}
