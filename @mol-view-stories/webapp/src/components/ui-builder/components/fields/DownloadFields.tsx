import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DownloadFieldsProps {
  value: string;
  onChange: (value: string) => void;
}

export function DownloadFields({ value, onChange }: DownloadFieldsProps) {
  return (
    <div className='flex-1'>
      <Label className='text-xs'>URL or PDB ID</Label>
      <Input
        className='h-8 text-sm'
        placeholder='e.g., 1opl or https://...'
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
