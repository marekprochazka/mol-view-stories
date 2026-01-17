'use client';

import { Button } from '@/components/ui/button';
import { ASTFactory } from '@mol-view-stories/state-builder/src/compiler/ast/factory';
import { CodeGenerator } from '@mol-view-stories/state-builder/src/compiler/codegen/generator';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { OperationRow } from './OperationRow';
import { createEmptyNode, UINode } from '@mol-view-stories/state-builder/src';

export function UIBuilder() {
  const [nodes, setNodes] = useState<UINode[]>([
    {
      id: '1',
      kind: 'download',
      params: {
        url: '1opl',
      },
      children: [
        {
          id: '1.1',
          kind: 'parse',
          params: {
            format: 'bcif',
          },
          children: [
            {
              id: '1.1.1',
              kind: 'structure',
              ref: '_1opl',
              params: {
                type: 'model',
              },
              children: [
                {
                  id: '1.1.1.1',
                  kind: 'component',
                  ref: '_1opl_poly',
                  params: {
                    selector: 'polymer',
                  },
                  children: [
                    {
                      id: '1.1.1.1.1',
                      kind: 'representation',
                      ref: '_1opl_poly_repr',
                      params: {
                        type: 'cartoon',
                      },
                      children: [
                        {
                          id: '1.1.1.1.1.1',
                          kind: 'color',
                          params: {
                            color: '#4577B2',
                          },
                          children: [],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: '1.1.1.2',
                  kind: 'component',
                  params: {
                    selector: 'ligand',
                  },
                  children: [
                    {
                      id: '1.1.1.2.1',
                      kind: 'representation',
                      params: {
                        type: 'ball-and-stick',
                      },
                      children: [
                        {
                          id: '1.1.1.2.1.1',
                          kind: 'color',
                          params: {
                            color: 'element-symbol',
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
  ]);

  const addNode = () => {
    const newNode = createEmptyNode();
    setNodes([...nodes, newNode]);
  };

  const updateNode = (id: string, updates: Partial<UINode>) => {
    setNodes(nodes.map((node) => (node.id === id ? { ...node, ...updates } : node)));
  };

  const removeNode = (id: string) => {
    if (nodes.length === 1) return;
    setNodes(nodes.filter((node) => node.id !== id));
  };

  const addChildToNode = (id: string) => {
    setNodes(
      nodes.map((node) => {
        if (node.id === id) {
          const newChild = createEmptyNode();
          return {
            ...node,
            children: [...(node.children || []), newChild],
          };
        }
        return node;
      })
    );
  };

  const copyNode = (id: string) => {
    const nodeToCopy = nodes.find((node) => node.id === id);
    if (!nodeToCopy) return;

    const copiedNode = JSON.parse(JSON.stringify(nodeToCopy));
    copiedNode.id = Date.now().toString();
    if (copiedNode.ref) copiedNode.ref = copiedNode.ref + '_copy';

    setNodes([...nodes, copiedNode]);
  };

  const moveNodeUp = (id: string) => {
    const index = nodes.findIndex((node) => node.id === id);
    if (index <= 0) return;

    const newNodes = [...nodes];
    [newNodes[index - 1], newNodes[index]] = [newNodes[index], newNodes[index - 1]];
    setNodes(newNodes);
  };

  const moveNodeDown = (id: string) => {
    const index = nodes.findIndex((node) => node.id === id);
    if (index === -1 || index >= nodes.length - 1) return;

    const newNodes = [...nodes];
    [newNodes[index], newNodes[index + 1]] = [newNodes[index + 1], newNodes[index]];
    setNodes(newNodes);
  };

  // Helper to remove UI-only id field before passing to compiler
  const stripIds = (node: UINode): any => ({
    kind: node.kind,
    params: node.params,
    ...(node.ref && { ref: node.ref }),
    ...(node.children && node.children.length > 0 && {
      children: node.children.map(stripIds),
    }),
  });

  const generateCode = () => {
    try {
      // Build MVS data structure with root wrapper
      const mvsData = {
        root: {
          kind: 'root' as const,
          params: {},
          children: nodes.map(stripIds),
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      console.log('MVS Data:', JSON.stringify(mvsData, null, 2));

      // Pass directly to compiler
      const ast = ASTFactory.fromMVSData(mvsData);

      const generator = new CodeGenerator({
        includeSectionMarkers: true,
        builderVar: 'builder',
        includeComments: true,
      });

      const code = generator.generate(ast);

      console.log('Generated code:', code);

      toast.success('Code generated successfully!');
    } catch (error) {
      console.error('Code generation error:', error);
      toast.error(`Failed to generate code: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className='flex flex-col gap-2 h-full p-2'>
      <div className='flex items-center justify-between pb-2 border-b'>
        <h3 className='text-sm font-medium'>Visual Builder</h3>
        <div className='flex gap-2'>
          <Button onClick={addNode} size='sm' variant='outline'>
            <PlusIcon className='size-4 mr-1' />
            Add
          </Button>
          <Button onClick={generateCode} size='sm'>
            Generate Code
          </Button>
        </div>
      </div>

      <div className='flex-1 min-h-0 overflow-y-auto space-y-2 pb-20'>
        {nodes.map((node, index) => (
          <OperationRow
            key={node.id}
            node={node}
            isFirst={index === 0}
            isLast={index === nodes.length - 1}
            onUpdate={(updates) => updateNode(node.id, updates)}
            onRemove={() => removeNode(node.id)}
            onAddChild={() => addChildToNode(node.id)}
            onCopy={() => copyNode(node.id)}
            onMoveUp={() => moveNodeUp(node.id)}
            onMoveDown={() => moveNodeDown(node.id)}
          />
        ))}
      </div>
    </div>
  );
}
