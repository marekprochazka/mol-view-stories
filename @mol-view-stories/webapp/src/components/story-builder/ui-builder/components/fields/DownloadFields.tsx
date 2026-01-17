import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DownloadFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function DownloadFields({ params, onChange }: DownloadFieldsProps) {
  const url = (params.url as string) || '';

  return (
    <div className='flex-1'>
      <Label className='text-xs'>URL or PDB ID</Label>
      <Input
        className='h-8 text-sm'
        placeholder='e.g., 1opl or https://...'
        value={url}
        onChange={(e) => onChange({ ...params, url: e.target.value })}
      />
    </div>
  );
}
