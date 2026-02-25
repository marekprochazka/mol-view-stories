import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface CameraFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

// Helper component for a 3-value vector input
function Vector3Input({
  label,
  value,
  onChange,
  placeholder = ['X', 'Y', 'Z'],
}: {
  label: string;
  value: number[];
  onChange: (newValue: number[]) => void;
  placeholder?: [string, string, string];
}) {
  const handleChange = (index: number, strValue: string) => {
    const numValue = parseFloat(strValue) || 0;
    const newValue = [...value];
    newValue[index] = numValue;
    onChange(newValue);
  };

  return (
    <div className='flex-1'>
      <Label className='text-xs'>{label}</Label>
      <div className='flex gap-1'>
        <Input
          className='h-8 text-sm'
          type='number'
          step='0.1'
          placeholder={placeholder[0]}
          value={value[0] ?? 0}
          onChange={(e) => handleChange(0, e.target.value)}
          title={`${label} X`}
        />
        <Input
          className='h-8 text-sm'
          type='number'
          step='0.1'
          placeholder={placeholder[1]}
          value={value[1] ?? 0}
          onChange={(e) => handleChange(1, e.target.value)}
          title={`${label} Y`}
        />
        <Input
          className='h-8 text-sm'
          type='number'
          step='0.1'
          placeholder={placeholder[2]}
          value={value[2] ?? 0}
          onChange={(e) => handleChange(2, e.target.value)}
          title={`${label} Z`}
        />
      </div>
    </div>
  );
}

export function CameraFields({ params, onChange }: CameraFieldsProps) {
  // Camera params are arrays of 3 numbers
  const position = (params.position as number[]) || [0, 0, 0];
  const target = (params.target as number[]) || [0, 0, 0];
  const up = (params.up as number[]) || [0, 1, 0];

  return (
    <>
      <Vector3Input
        label='Position'
        value={position}
        onChange={(newValue) => onChange({ ...params, position: newValue })}
      />
      <Vector3Input
        label='Target'
        value={target}
        onChange={(newValue) => onChange({ ...params, target: newValue })}
      />
      <Vector3Input
        label='Up'
        value={up}
        onChange={(newValue) => onChange({ ...params, up: newValue })}
      />
    </>
  );
}
