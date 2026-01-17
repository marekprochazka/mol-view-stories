import { Button } from '@/components/ui/button';
import { ArrowDownIcon, ArrowUpIcon, CopyIcon, PlusIcon, XIcon } from 'lucide-react';

interface OperationActionsProps {
  canHaveChildren?: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAddChild?: () => void;
  onCopy?: () => void;
  onRemove: () => void;
}

/**
 * Action buttons for operations: move up/down, add child, copy, remove
 */
export function OperationActions({
  canHaveChildren,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onAddChild,
  onCopy,
  onRemove,
}: OperationActionsProps) {
  return (
    <div className='flex gap-1'>
      {onMoveUp && (
        <Button
          variant='ghost'
          size='sm'
          onClick={onMoveUp}
          title='Move up'
          className='h-8 w-8 p-0'
          disabled={isFirst}
        >
          <ArrowUpIcon className='size-4' />
        </Button>
      )}
      {onMoveDown && (
        <Button
          variant='ghost'
          size='sm'
          onClick={onMoveDown}
          title='Move down'
          className='h-8 w-8 p-0'
          disabled={isLast}
        >
          <ArrowDownIcon className='size-4' />
        </Button>
      )}
      {canHaveChildren && onAddChild && (
        <Button variant='ghost' size='sm' onClick={onAddChild} title='Add child operation' className='h-8 w-8 p-0'>
          <PlusIcon className='size-4' />
        </Button>
      )}
      {onCopy && (
        <Button variant='ghost' size='sm' onClick={onCopy} title='Copy operation' className='h-8 w-8 p-0'>
          <CopyIcon className='size-4' />
        </Button>
      )}
      <Button variant='ghost' size='sm' onClick={onRemove} title='Remove operation' className='h-8 w-8 p-0'>
        <XIcon className='size-4' />
      </Button>
    </div>
  );
}
