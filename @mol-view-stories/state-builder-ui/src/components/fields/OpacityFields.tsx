import { Label } from '../../ui/label';

interface OpacityFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function OpacityFields({ params, onChange }: OpacityFieldsProps) {
  const opacity = (params.opacity as number) ?? 1.0;
  const pct = Math.round(opacity * 100);

  return (
    <div className='w-40'>
      <Label className='text-xs'>Opacity ({pct}%)</Label>
      <input
        type='range'
        min='0'
        max='100'
        step='1'
        value={pct}
        onChange={(e) => onChange({ ...params, opacity: parseInt(e.target.value) / 100 })}
        className='w-full mt-2 accent-primary cursor-pointer'
        title={`Opacity: ${opacity.toFixed(2)}`}
      />
    </div>
  );
}
