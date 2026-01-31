import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { REPRESENTATION_TYPES, getActiveValues } from '@mol-view-stories/state-builder/src';

interface RepresentationFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function RepresentationFields({ params, onChange }: RepresentationFieldsProps) {
  const type = (params.type as string) || '';
  const activeTypes = getActiveValues(REPRESENTATION_TYPES);

  return (
    <div className='flex-1'>
      <Label className='text-xs'>Type</Label>
      <Select value={type} onValueChange={(value) => onChange({ ...params, type: value })}>
        <SelectTrigger size='sm'>
          <SelectValue placeholder='Select' />
        </SelectTrigger>
        <SelectContent>
          {activeTypes.map((rep) => (
            <SelectItem key={rep.value} value={rep.value}>
              {rep.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
