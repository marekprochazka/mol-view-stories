import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STRUCTURE_TYPES, getActiveValues } from '@mol-view-stories/state-builder/src';

interface StructureFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function StructureFields({ params, onChange }: StructureFieldsProps) {
  const type = (params.type as string) || '';
  const activeTypes = getActiveValues(STRUCTURE_TYPES);

  return (
    <div className='flex-1'>
      <Label className='text-xs'>Type</Label>
      <Select value={type} onValueChange={(value) => onChange({ ...params, type: value })}>
        <SelectTrigger size='sm'>
          <SelectValue placeholder='Select' />
        </SelectTrigger>
        <SelectContent>
          {activeTypes.map((st) => (
            <SelectItem key={st.value} value={st.value}>
              {st.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
