import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Operation, OperationType } from '@mol-view-stories/state-builder';
import { PlusIcon, XIcon } from 'lucide-react';
import { TreeLines } from './TreeLines';
import { OperationActions } from './OperationActions';
import { TypeSelect } from './TypeSelect';

interface ConstantOperationProps {
  operation: Operation;
  depth: number;
  isLast: boolean;
  isFirst: boolean;
  onTypeChange: (type: OperationType) => void;
  onParamChange: (key: string, value: string) => void;
  onRefChange: (value: string) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onCopy?: () => void;
}

/**
 * Special rendering for constant operations with key-value entry editor
 */
export function ConstantOperation({
  operation,
  depth,
  isLast,
  isFirst,
  onTypeChange,
  onParamChange,
  onRefChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onCopy,
}: ConstantOperationProps) {
  // Parse entries from JSON or create empty array
  let entries: Array<{ key: string; value: string }> = [];
  try {
    if (operation.params.entries) {
      entries = JSON.parse(operation.params.entries);
    }
  } catch {
    entries = [];
  }

  const updateEntries = (newEntries: Array<{ key: string; value: string }>) => {
    onParamChange('entries', JSON.stringify(newEntries));
  };

  const isColorType = operation.params.constantType === 'colors';

  return (
    <div className='relative' style={{ marginLeft: depth > 0 ? '20px' : '0' }}>
      <TreeLines depth={depth} isLast={isLast} />

      <div className='border rounded-md p-2 bg-card space-y-2'>
        {/* First row: Type selector, Const Type, Name, Ref, Actions */}
        <div className='flex gap-2 items-end'>
          <TypeSelect value={operation.type} onChange={onTypeChange} />

          <div className='w-32'>
            <Label className='text-xs'>Const Type</Label>
            <Select
              value={operation.params.constantType || 'generic'}
              onValueChange={(value) => onParamChange('constantType', value)}
            >
              <SelectTrigger size='sm'>
                <SelectValue placeholder='Select' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='colors'>Colors</SelectItem>
                <SelectItem value='domains'>Domains</SelectItem>
                <SelectItem value='generic'>Generic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex-1'>
            <Label className='text-xs'>Name</Label>
            <Input
              className='h-8 text-sm'
              placeholder='e.g., Colors'
              value={operation.params.name || ''}
              onChange={(e) => onParamChange('name', e.target.value)}
            />
          </div>

          <div className='w-24'>
            <Label className='text-xs'>Ref</Label>
            <Input
              className='h-8 text-sm'
              placeholder='name'
              value={operation.ref || ''}
              onChange={(e) => onRefChange(e.target.value)}
              title='Reference name to use this operation later'
            />
          </div>

          <OperationActions
            isFirst={isFirst}
            isLast={isLast}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onCopy={onCopy}
            onRemove={onRemove}
          />
        </div>

        {/* Second row: Key-Value entries */}
        <div className='border-t pt-2'>
          <Label className='text-xs mb-2 block'>Entries</Label>
          <div className='space-y-1'>
            {entries.map((entry, idx) => (
              <div key={idx} className='flex gap-2 items-center'>
                <Input
                  className='h-8 text-sm w-32'
                  placeholder='Key'
                  value={entry.key}
                  onChange={(e) => {
                    const updated = [...entries];
                    updated[idx].key = e.target.value;
                    updateEntries(updated);
                  }}
                />
                <Input
                  className='h-8 text-sm flex-1'
                  placeholder={isColorType ? '#4577B2' : 'Value'}
                  value={entry.value}
                  onChange={(e) => {
                    const updated = [...entries];
                    updated[idx].value = e.target.value;
                    updateEntries(updated);
                  }}
                />
                {isColorType && (
                  <div
                    className='w-8 h-8 rounded border border-gray-300'
                    style={{ backgroundColor: entry.value }}
                    title={entry.value}
                  />
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    const updated = entries.filter((_, i) => i !== idx);
                    updateEntries(updated);
                  }}
                  className='h-8 w-8 p-0'
                >
                  <XIcon className='size-4' />
                </Button>
              </div>
            ))}
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                updateEntries([...entries, { key: '', value: isColorType ? '#000000' : '' }]);
              }}
              className='h-8'
            >
              <PlusIcon className='size-4 mr-1' />
              Add Entry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
