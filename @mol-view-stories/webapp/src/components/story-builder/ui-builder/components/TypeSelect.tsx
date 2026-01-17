import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { OperationType } from '@mol-view-stories/state-builder';

interface TypeSelectProps {
  value: OperationType | '';
  onChange: (type: OperationType) => void;
}

/**
 * Operation type selector dropdown
 */
export function TypeSelect({ value, onChange }: TypeSelectProps) {
  return (
    <div className='w-32'>
      <Label className='text-xs'>Type</Label>
      <Select value={value} onValueChange={onChange as (value: string) => void}>
        <SelectTrigger size='sm'>
          <SelectValue placeholder='Select' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='constant'>Constant</SelectItem>
          <SelectItem value='download'>Download</SelectItem>
          <SelectItem value='parse'>Parse</SelectItem>
          <SelectItem value='structure'>Structure</SelectItem>
          <SelectItem value='component'>Component</SelectItem>
          <SelectItem value='representation'>Representation</SelectItem>
          <SelectItem value='color'>Color</SelectItem>
          <SelectItem value='transform'>Transform</SelectItem>
          <SelectItem value='label'>Label</SelectItem>
          <SelectItem value='primitives'>Primitives</SelectItem>
          <SelectItem value='animation'>Animation</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
