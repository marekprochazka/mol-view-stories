import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StructureFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

// MVS spec structure types
// TODO: might be able to define directly from spec instead of hardcoding
const STRUCTURE_TYPES = [
  { value: 'model', label: 'Model' },
  { value: 'assembly', label: 'Assembly' },
  { value: 'symmetry', label: 'Symmetry' },
  { value: 'symmetry_mates', label: 'Symmetry Mates' },
] as const;

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
          {STRUCTURE_TYPES.map((st) => (
            <SelectItem key={st.value} value={st.value}>
              {st.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
