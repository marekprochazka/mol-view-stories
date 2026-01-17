import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RepresentationFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function RepresentationFields({ params, onChange }: RepresentationFieldsProps) {
  const type = (params.type as string) || '';

  return (
    <div className='flex-1'>
      <Label className='text-xs'>Type</Label>
      <Select value={type} onValueChange={(value) => onChange({ ...params, type: value })}>
        <SelectTrigger size='sm'>
          <SelectValue placeholder='Select' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='cartoon'>Cartoon</SelectItem>
          <SelectItem value='ball-and-stick'>Ball and Stick</SelectItem>
          <SelectItem value='surface'>Surface</SelectItem>
          <SelectItem value='spacefill'>Spacefill</SelectItem>
          <SelectItem value='ribbon'>Ribbon</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
