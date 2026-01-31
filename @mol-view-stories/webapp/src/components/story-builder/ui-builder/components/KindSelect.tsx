import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MVSKind } from 'molstar/lib/extensions/mvs/tree/mvs/mvs-tree';
import { MVS_KIND_LABELS, MVS_SELECTABLE_KINDS } from '@mol-view-stories/state-builder/src';

interface KindSelectProps {
  value: MVSKind | '';
  onChange: (kind: MVSKind) => void;
  allowedKinds?: readonly MVSKind[];
}

export function KindSelect({ value, onChange, allowedKinds }: KindSelectProps) {
  // Use allowed kinds if provided, otherwise show all selectable kinds
  const kindsToShow = allowedKinds ?? MVS_SELECTABLE_KINDS;

  return (
    <div className='w-40'>
      <Label className='text-xs'>Kind</Label>
      <Select value={value} onValueChange={onChange as (v: string) => void}>
        <SelectTrigger size='sm'>
          <SelectValue placeholder='Select kind' />
        </SelectTrigger>
        <SelectContent>
          {kindsToShow.map((kind) => (
            <SelectItem key={kind} value={kind}>
              {MVS_KIND_LABELS[kind] ?? kind}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
