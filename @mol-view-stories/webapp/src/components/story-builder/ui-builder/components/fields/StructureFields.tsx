import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StructureFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function StructureFields({ params, onChange }: StructureFieldsProps) {
  const type = (params.type as string) || '';

  return (
    <div className='flex-1'>
      <Label className='text-xs'>Type</Label>
      <Select value={type} onValueChange={(value) => onChange({ ...params, type: value })}>
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
