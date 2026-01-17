import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SelectorHelper } from '../../SelectorHelper';

interface ComponentFieldsProps {
  selectorType: string;
  selectorValue: string;
  onSelectorTypeChange: (value: string) => void;
  onSelectorValueChange: (value: string) => void;
}

export function ComponentFields({
  selectorType,
  selectorValue,
  onSelectorTypeChange,
  onSelectorValueChange,
}: ComponentFieldsProps) {
  return (
    <>
      <div className='flex-1'>
        <Label className='text-xs'>Selector Type</Label>
        <Select value={selectorType} onValueChange={onSelectorTypeChange}>
          <SelectTrigger size='sm'>
            <SelectValue placeholder='Select' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='chain'>Chain</SelectItem>
            <SelectItem value='residue'>Residue Range</SelectItem>
            <SelectItem value='ligand'>Ligand</SelectItem>
            <SelectItem value='all'>All</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='flex-1'>
        <Label className='text-xs'>Selector Value</Label>
        <div className='flex gap-1'>
          <Input
            className='h-8 text-sm flex-1'
            placeholder='e.g., A or { label_asym_id: "A" }'
            value={selectorValue}
            onChange={(e) => onSelectorValueChange(e.target.value)}
          />
          <SelectorHelper onSelect={onSelectorValueChange} selectorType={selectorType} />
        </div>
      </div>
    </>
  );
}
