import { Label } from '../../ui/label';
import type { ConstantDefinition } from '@mol-view-stories/state-builder/src';
import { ColorHelper } from '../../ColorHelper';

interface ColorFieldsProps {
  params: Record<string, unknown>;
  custom?: Record<string, unknown>;
  availableConstants?: ConstantDefinition[];
  onApply: (params: Record<string, unknown>, custom: Record<string, unknown> | undefined) => void;
}

export function ColorFields({
  params,
  custom,
  availableConstants = [],
  onApply,
}: ColorFieldsProps) {
  return (
    <div className='flex-1'>
      <Label className='text-xs'>Color</Label>
      <ColorHelper
        params={params}
        custom={custom}
        availableConstants={availableConstants}
        onApply={onApply}
      />
    </div>
  );
}
