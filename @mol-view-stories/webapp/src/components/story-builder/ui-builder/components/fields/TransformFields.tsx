import { Label } from '@/components/ui/label';
import { TransformHelper } from '../../TransformHelper';
import type { TransformParams } from '../../transform-helper';

interface TransformFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function TransformFields({ params, onChange }: TransformFieldsProps) {
  const handleTransformApply = (transform: TransformParams) => {
    const newParams: Record<string, unknown> = { ...params };

    if (transform.rotation) {
      newParams.rotation = transform.rotation;
    } else {
      delete newParams.rotation;
    }

    if (transform.translation) {
      newParams.translation = transform.translation;
    } else {
      delete newParams.translation;
    }

    if (transform.rotation_center !== undefined && transform.rotation_center !== null) {
      newParams.rotation_center = transform.rotation_center;
    } else {
      delete newParams.rotation_center;
    }

    if (transform.matrix) {
      newParams.matrix = transform.matrix;
    } else {
      delete newParams.matrix;
    }

    onChange(newParams);
  };

  return (
    <div className='flex-1'>
      <Label className='text-xs'>Transform</Label>
      <TransformHelper
        onApply={handleTransformApply}
        initialValue={params}
      />
    </div>
  );
}
