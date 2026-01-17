'use client';

import { Button } from '@/components/ui/button';
import { ASTFactory } from '@mol-view-stories/state-builder/src/compiler/ast/factory';
import { CodeGenerator } from '@mol-view-stories/state-builder/src/compiler/codegen/generator';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { OperationRow } from './OperationRow';
import { createEmptyNode, UINode } from '@mol-view-stories/state-builder/src';
import type { MVSTree } from 'molstar/lib/extensions/mvs/tree/mvs/mvs-tree';
export interface UIBuilderProps {
  /** Callback when code is generated - receives the generated JavaScript code */
  onCodeGenerated?: (code: string) => void;
}

// Type for raw MVS JSON node (more permissive than the strict MVSNode union type)
interface RawMVSNode {
  kind: string;
  params?: Record<string, unknown>;
  ref?: string;
  custom?: Record<string, unknown>;
  children?: RawMVSNode[];
}

/** Convert raw MVS JSON node to UINode by adding IDs recursively */
function addIdsToMVSNode(node: RawMVSNode, prefix = ''): UINode {
  const id = `${prefix}${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    kind: node.kind as UINode['kind'],
    params: node.params ?? {},
    ref: node.ref,
    custom: node.custom,
    children: node.children?.map((child, i) => addIdsToMVSNode(child, `${id}_${i}_`)),
  };
}

/** Convert MVSTree (root node) to UINode[] (the root's children with IDs) */
function mvsTreeToUINodes(tree: MVSTree): UINode[] {
  // MVSTree.children is typed as a discriminated union, cast to RawMVSNode for simpler handling
  const children = (tree as { children?: RawMVSNode[] }).children;
  if (!children) return [];
  return children.map((node, i) => addIdsToMVSNode(node, `${i}_`));
}

// Example MVS JSON data - can be pasted directly without IDs
const EXAMPLE_MVS_NODES: MVSTree = {

    "kind": "root",
    "children": [
      {
        "kind": "download",
        "params": {
          "url": "https://www.ebi.ac.uk/pdbe/entry-files/download/1opl.bcif"
        },
        "children": [
          {
            "kind": "parse",
            "params": {
              "format": "bcif"
            },
            "children": [
              {
                "kind": "structure",
                "params": {
                  "type": "model"
                },
                "children": [
                  {
                    "kind": "transform",
                    "params": {
                      "rotation": [
                        -0.6321036327, 0.3450463255, 0.6938213248, -0.6288677634, -0.7515716885, -0.1991615756,
                        0.4527364948, -0.5622126202, 0.6920597055
                      ],
                      "translation": [36.3924122492, 118.2516908402, -26.4992054179]
                    }
                  },
                  {
                    "kind": "component",
                    "params": {
                      "selector": {
                        "label_asym_id": "A"
                      }
                    },
                    "children": [
                      {
                        "kind": "representation",
                        "params": {
                          "type": "cartoon"
                        },
                        "children": [
                          {
                            "kind": "color",
                            "params": {
                              "color": "#4577B2"
                            }
                          }
                        ]
                      },
                      {
                        "kind": "label",
                        "params": {
                          "text": "ABL Kinase"
                        }
                      }
                    ]
                  },
                  {
                    "kind": "component",
                    "params": {
                      "selector": {
                        "label_asym_id": "C"
                      }
                    },
                    "children": [
                      {
                        "kind": "representation",
                        "params": {
                          "type": "ball_and_stick"
                        },
                        "children": [
                          {
                            "kind": "color",
                            "params": {
                              "color": "#4577B2"
                            }
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "kind": "component",
                    "params": {
                      "selector": {
                        "label_asym_id": "D"
                      }
                    },
                    "children": [
                      {
                        "kind": "representation",
                        "params": {
                          "type": "surface"
                        },
                        "children": [
                          {
                            "kind": "color",
                            "params": {},
                            "custom": {
                              "molstar_color_theme_name": "element-symbol",
                              "molstar_color_theme_params": {
                                "carbonColor": {
                                  "name": "uniform",
                                  "params": {
                                    "value": 4552626
                                  }
                                }
                              }
                            }
                          },
                          {
                            "kind": "opacity",
                            "params": {
                              "opacity": 0.33
                            }
                          }
                        ]
                      },
                      {
                        "kind": "representation",
                        "params": {
                          "type": "ball_and_stick"
                        },
                        "children": [
                          {
                            "kind": "color",
                            "params": {},
                            "custom": {
                              "molstar_color_theme_name": "element-symbol",
                              "molstar_color_theme_params": {
                                "carbonColor": {
                                  "name": "uniform",
                                  "params": {
                                    "value": 4552626
                                  }
                                }
                              }
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "kind": "camera",
        "params": {
          "position": [79.46831913851136, 66.05809711216442, 20.82033041314537],
          "target": [0.36, 55.32, 21.8],
          "up": [-0.01, 0.01, -1]
        }
      }
    ]
  }
;

export function UIBuilder({ onCodeGenerated }: UIBuilderProps) {
  const [nodes, setNodes] = useState<UINode[]>(() => mvsTreeToUINodes(EXAMPLE_MVS_NODES));

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
  const stripIds = (node: UINode): RawMVSNode => ({
    kind: node.kind,
    params: node.params,
    ...(node.ref && { ref: node.ref }),
    ...(node.custom && { custom: node.custom }),
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

      // Call the callback if provided
      if (onCodeGenerated) {
        onCodeGenerated(code);
        toast.success('Code generated and applied to editor!');
      } else {
        toast.success('Code generated successfully! (no callback provided)');
      }
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
