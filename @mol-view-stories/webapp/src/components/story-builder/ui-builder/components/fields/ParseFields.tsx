import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PARSE_FORMATS, getActiveValues } from '@mol-view-stories/state-builder/src';

interface ParseFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function ParseFields({ params, onChange }: ParseFieldsProps) {
  const format = (params.format as string) || '';
  const activeFormats = getActiveValues(PARSE_FORMATS);

  return (
    <div className='flex-1'>
      <Label className='text-xs'>Format</Label>
      <Select value={format} onValueChange={(value) => onChange({ ...params, format: value })}>
        <SelectTrigger size='sm'>
          <SelectValue placeholder='Select' />
        </SelectTrigger>
        <SelectContent>
          {activeFormats.map((fmt) => (
            <SelectItem key={fmt.value} value={fmt.value}>
              {fmt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
