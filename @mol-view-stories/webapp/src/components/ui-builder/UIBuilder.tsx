'use client';

import { Button } from '@/components/ui/button';
import type { Operation } from '@mol-view-stories/state-builder';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { OperationRow } from './OperationRow';

export function UIBuilder() {
  const [operations, setOperations] = useState<Operation[]>([
    {
      id: '1',
      type: 'constant',
      ref: 'Colors',
      params: {
        name: 'Colors',
        constantType: 'colors',
        entries: JSON.stringify([
          { key: '1opl', value: '#4577B2' },
          { key: 'ligand', value: '#BF99A1' },
        ]),
      },
      children: [],
    },
    {
      id: '2',
      type: 'download',
      params: {
        url: '1opl',
      },
      children: [
        {
          id: '2.1',
          type: 'parse',
          params: {
            format: 'bcif',
          },
          children: [
            {
              id: '2.1.1',
              type: 'structure',
              ref: '_1opl',
              params: {
                structureType: 'model',
              },
              children: [
                {
                  id: '2.1.1.1',
                  type: 'component',
                  ref: '_1opl_poly',
                  params: {
                    selectorType: 'chain',
                    selectorValue: 'A',
                  },
                  children: [
                    {
                      id: '2.1.1.1.1',
                      type: 'representation',
                      ref: '_1opl_poly_repr',
                      params: {
                        repType: 'cartoon',
                      },
                      children: [
                        {
                          id: '2.1.1.1.1.1',
                          type: 'color',
                          params: {
                            colorType: 'uniform',
                            color: '#4577B2',
                          },
                          children: [],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: '2.1.1.2',
                  type: 'component',
                  params: {
                    selectorType: 'ligand',
                    selectorValue: 'C',
                  },
                  children: [
                    {
                      id: '2.1.1.2.1',
                      type: 'representation',
                      params: {
                        repType: 'ball-and-stick',
                      },
                      children: [
                        {
                          id: '2.1.1.2.1.1',
                          type: 'color',
                          params: {
                            colorType: 'element-symbol',
                          },
                          children: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: '3',
      type: 'primitives',
      params: {},
      children: [
        {
          id: '3.1',
          type: 'label',
          params: {
            text: 'SH2 Domain',
            position: '0,0,0',
            size: '9',
          },
          children: [],
        },
      ],
    },
  ]);

  const addOperation = () => {
    const newOp: Operation = {
      id: Date.now().toString(),
      type: '',
      params: {},
      children: [],
    };
    setOperations([...operations, newOp]);
  };

  const updateOperation = (id: string, updates: Partial<Operation>) => {
    setOperations(operations.map((op) => (op.id === id ? { ...op, ...updates } : op)));
  };

  const removeOperation = (id: string) => {
    if (operations.length === 1) return;
    setOperations(operations.filter((op) => op.id !== id));
  };

  const addChildToOperation = (id: string) => {
    setOperations(
      operations.map((op) => {
        if (op.id === id) {
          const newChild: Operation = {
            id: Date.now().toString() + Math.random(),
            type: '',
            params: {},
            children: [],
          };
          return {
            ...op,
            children: [...(op.children || []), newChild],
          };
        }
        return op;
      })
    );
  };

  const copyOperation = (id: string) => {
    const opToCopy = operations.find((op) => op.id === id);
    if (!opToCopy) return;

    const copiedOp = JSON.parse(JSON.stringify(opToCopy));
    copiedOp.id = Date.now().toString();
    if (copiedOp.ref) copiedOp.ref = copiedOp.ref + '_copy';

    setOperations([...operations, copiedOp]);
  };

  const moveOperationUp = (id: string) => {
    const index = operations.findIndex((op) => op.id === id);
    if (index <= 0) return; // Already at top or not found

    const newOperations = [...operations];
    [newOperations[index - 1], newOperations[index]] = [newOperations[index], newOperations[index - 1]];
    setOperations(newOperations);
  };

  const moveOperationDown = (id: string) => {
    const index = operations.findIndex((op) => op.id === id);
    if (index === -1 || index >= operations.length - 1) return; // Not found or already at bottom

    const newOperations = [...operations];
    [newOperations[index], newOperations[index + 1]] = [newOperations[index + 1], newOperations[index]];
    setOperations(newOperations);
  };

  const generateCode = () => {
    // TODO: Implement code generation
    console.log('Operations:', JSON.stringify(operations, null, 2));
  };

  return (
    <div className='flex flex-col gap-2 h-full p-2'>
      <div className='flex items-center justify-between pb-2 border-b'>
        <h3 className='text-sm font-medium'>Visual Builder</h3>
        <div className='flex gap-2'>
          <Button onClick={addOperation} size='sm' variant='outline'>
            <PlusIcon className='size-4 mr-1' />
            Add
          </Button>
          <Button onClick={generateCode} size='sm'>
            Generate Code
          </Button>
        </div>
      </div>

      <div className='flex-1 min-h-0 overflow-y-auto space-y-2 pb-20'>
        {operations.map((op, index) => (
          <OperationRow
            key={op.id}
            operation={op}
            isFirst={index === 0}
            isLast={index === operations.length - 1}
            onUpdate={(updates) => updateOperation(op.id, updates)}
            onRemove={() => removeOperation(op.id)}
            onAddChild={() => addChildToOperation(op.id)}
            onCopy={() => copyOperation(op.id)}
            onMoveUp={() => moveOperationUp(op.id)}
            onMoveDown={() => moveOperationDown(op.id)}
          />
        ))}
      </div>
    </div>
  );
}
