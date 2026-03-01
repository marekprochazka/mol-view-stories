import { Label } from '../../ui/label';
import type { ConstantDefinition } from '@mol-view-stories/state-builder/src';
import { ColorHelper } from '../../ColorHelper';

interface ColorFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
  custom?: Record<string, unknown>;
  onCustomChange?: (custom: Record<string, unknown> | undefined) => void;
  availableConstants?: ConstantDefinition[];
}

export function ColorFields({
  params,
  onChange,
  custom,
  onCustomChange,
  availableConstants = [],
}: ColorFieldsProps) {
  return (
    <div className='flex-1'>
      <Label className='text-xs'>Color</Label>
      <ColorHelper
        params={params}
        custom={custom}
        availableConstants={availableConstants}
        onApply={(newParams, newCustom) => {
          onChange(newParams);
          onCustomChange?.(newCustom);
        }}
      />
    </div>
  );
}
