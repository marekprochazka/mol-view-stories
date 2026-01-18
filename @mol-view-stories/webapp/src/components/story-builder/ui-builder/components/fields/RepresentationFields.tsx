import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RepresentationFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

// MVS spec representation types
// TODO: might be able to define directly from spec instead of hardcoding
const REPRESENTATION_TYPES = [
  { value: 'cartoon', label: 'Cartoon' },
  { value: 'ball_and_stick', label: 'Ball and Stick' },
  { value: 'spacefill', label: 'Spacefill' },
  { value: 'surface', label: 'Surface' },
  { value: 'isosurface', label: 'Isosurface' },
  { value: 'carbohydrate', label: 'Carbohydrate' },
] as const;

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
          {REPRESENTATION_TYPES.map((rep) => (
            <SelectItem key={rep.value} value={rep.value}>
              {rep.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
