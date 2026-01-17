'use client';

import { Button } from '@/components/ui/button';
import { HelpCircleIcon } from 'lucide-react';

interface SelectorHelperProps {
  onSelect: (selector: string) => void;
  selectorType?: string;
}

/**
 * Placeholder component for selector helper
 * TODO: Implement full selector helper UI with chain, residue, ligand tabs
 */
export function SelectorHelper({ onSelect, selectorType }: SelectorHelperProps) {
  // Placeholder implementation - just a button for now
  return (
    <Button
      variant='ghost'
      size='sm'
      className='h-8 w-8 p-0'
      title='Selector Helper (Coming Soon)'
      onClick={() => {
        // TODO: Open modal/popover with selector builder
        console.log('Selector helper for type:', selectorType);
      }}
    >
      <HelpCircleIcon className='size-4' />
    </Button>
  );
}
