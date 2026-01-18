import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ConstantDefinition,
  ConstantRef,
  createConstantRef,
  isConstantRef,
} from '@mol-view-stories/state-builder/src';

interface DownloadFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
  availableConstants?: ConstantDefinition[];
}

type UrlMode = 'literal' | 'constant';

export function DownloadFields({ params, onChange, availableConstants = [] }: DownloadFieldsProps) {
  const urlConstants = availableConstants.filter((c) => c.type === 'urls');

  const hasConstantRef = isConstantRef(params.url);
  const urlMode: UrlMode = hasConstantRef ? 'constant' : 'literal';

  const currentConstantRef = hasConstantRef ? (params.url as ConstantRef) : null;
  const literalUrl = hasConstantRef ? '' : ((params.url as string) || '');

  const currentConstantValue = currentConstantRef
    ? `${currentConstantRef.constantName}:${currentConstantRef.entryKey}`
    : '';

  // Build list of available constant entries
  const constantOptions = urlConstants.flatMap((c) =>
    c.entries
      .filter((e) => e.key)
      .map((e) => ({
        value: `${c.name}:${e.key}`,
        label: `${c.name}.${e.key}`,
        preview: e.value.length > 30 ? e.value.slice(0, 30) + '...' : e.value,
      }))
  );

  const handleModeChange = (mode: UrlMode) => {
    if (mode === 'literal') {
      onChange({ ...params, url: '' });
    } else if (mode === 'constant') {
      // Set first available constant entry as default if available
      if (urlConstants.length > 0 && urlConstants[0].entries.length > 0) {
        const firstConst = urlConstants[0];
        const firstEntry = firstConst.entries.find((e) => e.key) || firstConst.entries[0];
        onChange({ ...params, url: createConstantRef(firstConst.name, firstEntry.key) });
      } else {
        onChange({ ...params, url: createConstantRef('', '') });
      }
    }
  };

  const handleConstantRefChange = (constantName: string, entryKey: string) => {
    onChange({ ...params, url: createConstantRef(constantName, entryKey) });
  };

  return (
    <>
      {urlConstants.length > 0 && (
        <div className='w-24'>
          <Label className='text-xs'>Mode</Label>
          <Select value={urlMode} onValueChange={(v) => handleModeChange(v as UrlMode)}>
            <SelectTrigger size='sm'>
              <SelectValue placeholder='Select' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='literal'>Literal</SelectItem>
              <SelectItem value='constant'>Constant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {urlMode === 'literal' && (
        <div className='flex-1'>
          <Label className='text-xs'>URL or PDB ID</Label>
          <Input
            className='h-8 text-sm'
            placeholder='e.g., 1opl or https://...'
            value={literalUrl}
            onChange={(e) => onChange({ ...params, url: e.target.value })}
          />
        </div>
      )}

      {urlMode === 'constant' && (
        <div className='flex-1'>
          <Label className='text-xs'>URL Constant</Label>
          <Select
            value={currentConstantValue}
            onValueChange={(v) => {
              const [constName, entryKey] = v.split(':');
              handleConstantRefChange(constName, entryKey);
            }}
          >
            <SelectTrigger size='sm'>
              <SelectValue placeholder='Select constant' />
            </SelectTrigger>
            <SelectContent>
              {constantOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className='flex flex-col'>
                    <span>{opt.label}</span>
                    <span className='text-xs text-muted-foreground'>{opt.preview}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {constantOptions.length === 0 && (
            <p className='text-xs text-muted-foreground mt-1'>No URL constants defined.</p>
          )}
        </div>
      )}
    </>
  );
}
