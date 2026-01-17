import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ParseFieldsProps {
  value: string;
  onChange: (value: string) => void;
}

export function ParseFields({ value, onChange }: ParseFieldsProps) {
  return (
    <div className='flex-1'>
      <Label className='text-xs'>Format</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger size='sm'>
          <SelectValue placeholder='Select' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='bcif'>BCIF</SelectItem>
          <SelectItem value='mmcif'>mmCIF</SelectItem>
          <SelectItem value='pdb'>PDB</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
