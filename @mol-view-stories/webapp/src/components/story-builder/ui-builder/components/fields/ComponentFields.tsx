import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectorHelper } from '../../SelectorHelper';

interface ComponentFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
}

export function ComponentFields({ params, onChange }: ComponentFieldsProps) {
  const selector = params.selector;

  // Convert selector to string for display
  const selectorString =
    typeof selector === 'string' ? selector : selector ? JSON.stringify(selector, null, 2) : '';

  const handleSelectorChange = (value: string) => {
    // Try to parse as JSON object, otherwise use as string
    let parsedSelector: unknown;
    const trimmedValue = value.trim();

    if (trimmedValue.startsWith('{')) {
      try {
        parsedSelector = JSON.parse(trimmedValue);
      } catch {
        // If JSON parse fails, keep as string
        parsedSelector = value;
      }
    } else {
      // Simple string selector (polymer, ligand, all, chain ID, etc.)
      parsedSelector = value;
    }

    onChange({ ...params, selector: parsedSelector });
  };

  return (
    <div className='flex-1'>
      <Label className='text-xs'>Selector</Label>
      <div className='flex gap-1'>
        <Input
          className='h-8 text-sm flex-1'
          placeholder='e.g., polymer or { "label_asym_id": "A" }'
          value={selectorString}
          onChange={(e) => handleSelectorChange(e.target.value)}
        />
        <SelectorHelper onSelect={handleSelectorChange} selectorType='all' />
      </div>
    </div>
  );
}
