'use client';

import { ActiveSceneIdAtom, UIBuilderConstantsAtom, UIBuilderNodesAtom } from '@/app/appstate';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ASTFactory } from '@mol-view-stories/state-builder/src/compiler/ast/factory';
import { CodeGenerator } from '@mol-view-stories/state-builder/src/compiler/codegen/generator';
import { useAtom, useAtomValue } from 'jotai';
import { UploadIcon, PlusIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { OperationRow } from './OperationRow';
import { ConstantsSection } from './ConstantsSection';
import {
  createEmptyNode,
  createEmptyConstant,
  UINode,
  ConstantDefinition,
  getValidChildren,
} from '@mol-view-stories/state-builder/src';
import { createDownloadParseNodes } from '@mol-view-stories/state-builder/src/types/composite-sequences';
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

export function UIBuilder({ onCodeGenerated }: UIBuilderProps) {
  const activeSceneId = useAtomValue(ActiveSceneIdAtom);

  // Nodes state (per-scene)
  const [allNodes, setAllNodes] = useAtom(UIBuilderNodesAtom);
  const sceneKey = activeSceneId || 'default';
  const nodes = (allNodes[sceneKey] || []) as UINode[];
  const setNodes = (newNodes: UINode[]) => {
    setAllNodes({ ...allNodes, [sceneKey]: newNodes });
  };

  // Constants state (per-scene)
  const [allConstants, setAllConstants] = useAtom(UIBuilderConstantsAtom);
  const constants = (allConstants[sceneKey] || []) as ConstantDefinition[];
  const setConstants = (newConstants: ConstantDefinition[]) => {
    setAllConstants({ ...allConstants, [sceneKey]: newConstants });
  };

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [constantsExpanded, setConstantsExpanded] = useState(true);

  const addNode = () => {
    const newNode = createDownloadParseNodes();
    setNodes([...nodes, newNode]);
  };

  const updateNode = (id: string, updates: Partial<UINode>) => {
    setNodes(nodes.map((node) => (node.id === id ? { ...node, ...updates } : node)));
  };

  const removeNode = (id: string) => {
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

  const generateCodeFromNodes = (nodesToGenerate: UINode[], constantsToInclude: ConstantDefinition[] = constants) => {
    try {
      if (nodesToGenerate.length === 0) {
        toast.error('No nodes to generate code from. Add nodes or import an MVSTree first.');
        return;
      }

      // Build MVS data structure with root wrapper
      const mvsData = {
        root: {
          kind: 'root' as const,
          params: {},
          children: nodesToGenerate.map(stripIds),
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      console.log('MVS Data:', JSON.stringify(mvsData, null, 2));

      // Pass directly to compiler
      const ast = ASTFactory.fromMVSData(mvsData);

      // Filter out incomplete constants (no name or no entries)
      const validConstants = constantsToInclude.filter(
        (c) => c.name && c.entries.length > 0 && c.entries.some((e) => e.key)
      );

      const generator = new CodeGenerator({
        includeSectionMarkers: true,
        builderVar: 'builder',
        includeComments: true,
        constants: validConstants,
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

  const generateCode = () => {
    generateCodeFromNodes(nodes);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importJson);

      // Check if it's a valid MVSTree (has kind: 'root')
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON: expected an object');
      }

      if (parsed.kind !== 'root') {
        throw new Error('Invalid MVSTree: root node must have kind "root"');
      }

      const mvsTree = parsed as MVSTree;
      const uiNodes = mvsTreeToUINodes(mvsTree);

      if (uiNodes.length === 0) {
        throw new Error('MVSTree has no children nodes');
      }

      setNodes(uiNodes);
      setImportDialogOpen(false);
      setImportJson('');
      toast.success('MVSTree imported successfully!');

      // Auto-generate code after import
      setTimeout(() => {
        generateCodeFromNodes(uiNodes);
      }, 0);
    } catch (error) {
      toast.error(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className='flex flex-col gap-2 h-full p-2'>
      <div className='flex items-center justify-between pb-2 border-b'>
        <h3 className='text-sm font-medium'>Visual Builder</h3>
        <div className='flex gap-2'>
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button size='sm' variant='outline'>
                <UploadIcon className='size-4 mr-1' />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Import MVSTree JSON</DialogTitle>
                <DialogDescription>
                  Paste an MVSTree JSON object with kind &quot;root&quot; to load it into the visual builder.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                className='min-h-[300px] font-mono text-xs'
                placeholder='{"kind": "root", "children": [...]}'
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
              />
              <DialogFooter>
                <Button variant='outline' onClick={() => setImportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={!importJson.trim()}>
                  Import
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
        {/* Constants Section */}
        <ConstantsSection
          constants={constants}
          expanded={constantsExpanded}
          onToggleExpanded={() => setConstantsExpanded(!constantsExpanded)}
          onConstantsChange={setConstants}
        />

        {/* Nodes Section */}
        {nodes.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2 border rounded-md'>
            <p>No nodes yet.</p>
            <p>Click &quot;Import&quot; to load an MVSTree or &quot;Add&quot; to create a new node.</p>
          </div>
        ) : (
          nodes.map((node, index) => (
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
              availableConstants={constants}
              allowedKinds={getValidChildren('root')}
            />
          ))
        )}
      </div>
    </div>
  );
}
