import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ParseFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function ParseFields({ params, onChange }: ParseFieldsProps) {
  const format = (params.format as string) || '';

  return (
    <div className='flex-1'>
      <Label className='text-xs'>Format</Label>
      <Select value={format} onValueChange={(value) => onChange({ ...params, format: value })}>
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
