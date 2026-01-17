import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StructureFieldsProps {
  value: string;
  onChange: (value: string) => void;
}

export function StructureFields({ value, onChange }: StructureFieldsProps) {
  return (
    <div className='flex-1'>
      <Label className='text-xs'>Type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger size='sm'>
          <SelectValue placeholder='Select' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='model'>Model</SelectItem>
          <SelectItem value='assembly'>Assembly</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
