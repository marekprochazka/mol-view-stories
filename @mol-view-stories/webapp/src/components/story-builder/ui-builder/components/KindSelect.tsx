import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MVSKind } from 'molstar/lib/extensions/mvs/tree/mvs/mvs-tree';

interface KindSelectProps {
  value: MVSKind | '';
  onChange: (kind: MVSKind) => void;
}

export function KindSelect({ value, onChange }: KindSelectProps) {
  return (
    <div className='w-40'>
      <Label className='text-xs'>Kind</Label>
      <Select value={value} onValueChange={onChange as (v: string) => void}>
        <SelectTrigger size='sm'>
          <SelectValue placeholder='Select kind' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='download'>Download</SelectItem>
          <SelectItem value='parse'>Parse</SelectItem>
          <SelectItem value='structure'>Structure</SelectItem>
          <SelectItem value='component'>Component</SelectItem>
          <SelectItem value='component_from_uri'>Component From URI</SelectItem>
          <SelectItem value='component_from_source'>Component From Source</SelectItem>
          <SelectItem value='representation'>Representation</SelectItem>
          <SelectItem value='color'>Color</SelectItem>
          <SelectItem value='opacity'>Opacity</SelectItem>
          <SelectItem value='transform'>Transform</SelectItem>
          <SelectItem value='label'>Label</SelectItem>
          <SelectItem value='tooltip'>Tooltip</SelectItem>
          <SelectItem value='primitives'>Primitives</SelectItem>
          <SelectItem value='primitive'>Primitive</SelectItem>
          <SelectItem value='clip'>Clip</SelectItem>
          <SelectItem value='focus'>Focus</SelectItem>
          <SelectItem value='camera'>Camera</SelectItem>
          <SelectItem value='canvas'>Canvas</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
