'use client';

import { ActiveSceneIdAtom, UIBuilderAnimationAtom, UIBuilderCameraAtom, UIBuilderConstantsAtom, UIBuilderNodesAtom } from '@/app/appstate';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UploadIcon, PlusIcon, ChevronDownIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { OperationRow } from './OperationRow';
import { AnimationSection } from './AnimationSection';
import { CameraSection } from './CameraSection';
import { ConstantsSection } from './ConstantsSection';
import {
  createEmptyNode,
  createEmptyConstant,
  UINode,
  ConstantDefinition,
  getValidChildren,
  getTemplatesForParentKind,
  instantiateTemplate,
  mvsTreeToUINodes,
  uiNodeToMVSNode,
  extractCameraFromUINodes,
  extractAnimationFromUINodes,
  extractRefsFromNodes,
  convertAnimationToMVSNode,
  isDefaultUp,
  assignMissingRefs,
  type RawMVSTree,
  type CameraParams,
  type AnimationParams,
} from '@mol-view-stories/state-builder/src';
import { createDownloadParseNodes } from '@mol-view-stories/state-builder/src/types/composite-sequences';
import type { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import { StructureMetadataProvider } from './StructureMetadataContext';

export interface UIBuilderProps {
  /** Callback when code is generated - receives the generated JavaScript code */
  onCodeGenerated?: (code: string) => void;
  /** Mol* plugin instance for structure metadata extraction */
  plugin?: PluginUIContext | null;
}

export function UIBuilder({ onCodeGenerated, plugin }: UIBuilderProps) {
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

  // Camera state (per-scene)
  const [allCameras, setAllCameras] = useAtom(UIBuilderCameraAtom);
  const camera = allCameras[sceneKey] || null;
  const setCamera = (newCamera: CameraParams | null) => {
    setAllCameras({ ...allCameras, [sceneKey]: newCamera });
  };

  // Animation state (per-scene)
  const [allAnimations, setAllAnimations] = useAtom(UIBuilderAnimationAtom);
  const animation = (allAnimations[sceneKey] || null) as AnimationParams | null;
  const setAnimation = (newAnimation: AnimationParams | null) => {
    setAllAnimations({ ...allAnimations, [sceneKey]: newAnimation });
  };

  // Available refs from the node tree (for animation target_ref dropdowns)
  const availableRefs = useMemo(() => extractRefsFromNodes(nodes), [nodes]);

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [constantsExpanded, setConstantsExpanded] = useState(false);

  const addNode = () => {
    const [newNode] = assignMissingRefs([createDownloadParseNodes()], nodes);
    setNodes([...nodes, newNode]);
  };

  const addConstant = () => {
    const newConstant = createEmptyConstant('colors');
    setConstants([...constants, newConstant]);
    // Expand constants section when adding
    if (!constantsExpanded) {
      setConstantsExpanded(true);
    }
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

  const generateCodeFromNodes = (nodesToGenerate: UINode[], constantsToInclude: ConstantDefinition[] = constants, cameraToInclude: CameraParams | null = camera, animationToInclude: AnimationParams | null = animation) => {
    try {
      if (nodesToGenerate.length === 0) {
        toast.error('No nodes to generate code from. Add nodes or import an MVSTree first.');
        return;
      }

      // Build children list, appending camera node if set
      const children = nodesToGenerate.map(uiNodeToMVSNode);
      if (cameraToInclude) {
        const cameraParams: Record<string, unknown> = {
          position: cameraToInclude.position,
          target: cameraToInclude.target,
        };
        if (cameraToInclude.up && !isDefaultUp(cameraToInclude.up)) {
          cameraParams.up = cameraToInclude.up;
        }
        children.push({ kind: 'camera', params: cameraParams });
      }

      // Append animation node if set
      if (animationToInclude && (animationToInclude.steps.length > 0 || animationToInclude.trackball?.enabled)) {
        children.push(convertAnimationToMVSNode(animationToInclude));
      }

      // Build MVS data structure with root wrapper
      const mvsData = {
        root: {
          kind: 'root' as const,
          params: {},
          children,
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

      const mvsTree = parsed as RawMVSTree;
      const uiNodes = mvsTreeToUINodes(mvsTree);

      if (uiNodes.length === 0) {
        throw new Error('MVSTree has no children nodes');
      }

      // Extract camera nodes into the dedicated camera section
      const cameraExtracted = extractCameraFromUINodes(uiNodes);

      // Extract animation nodes into the dedicated animation section
      const animExtracted = extractAnimationFromUINodes(cameraExtracted.nodes);

      if (cameraExtracted.camera) {
        setCamera(cameraExtracted.camera);
      }
      if (animExtracted.animation) {
        setAnimation(animExtracted.animation);
      }

      const nodesWithRefs = assignMissingRefs(animExtracted.nodes, []);
      setNodes(nodesWithRefs);
      setImportDialogOpen(false);
      setImportJson('');
      toast.success('MVSTree imported successfully!');

      // Auto-generate code after import
      setTimeout(() => {
        generateCodeFromNodes(nodesWithRefs, constants, cameraExtracted.camera ?? camera, animExtracted.animation ?? animation);
      }, 0);
    } catch (error) {
      toast.error(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <StructureMetadataProvider plugin={plugin ?? null} onGenerateCode={generateCode}>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size='sm' variant='outline'>
                <PlusIcon className='size-4 mr-1' />
                Add
                <ChevronDownIcon className='size-4 ml-1' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={addNode}>
                Empty Node
              </DropdownMenuItem>
              <DropdownMenuItem onClick={addConstant}>
                Constant
              </DropdownMenuItem>
              {getTemplatesForParentKind('root').length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  {getTemplatesForParentKind('root').map((template) => (
                    <DropdownMenuItem
                      key={template.id}
                      onClick={() => {
                        const templateNodes = assignMissingRefs(instantiateTemplate(template), nodes);
                        setNodes([...nodes, ...templateNodes]);
                      }}
                      title={template.description}
                    >
                      {template.name}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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

        {/* Camera Section */}
        <CameraSection camera={camera} onCameraChange={setCamera} />

        {/* Animation Section */}
        <AnimationSection animation={animation} onAnimationChange={setAnimation} availableRefs={availableRefs} />

        {/* Nodes Section */}
        {nodes.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-32 text-muted-foreground text-sm gap-2 border rounded-md'>
            <p>No nodes yet.</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size='sm' variant='outline'>
                  <PlusIcon className='size-4 mr-1' />
                  Add
                  <ChevronDownIcon className='size-4 ml-1' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='center'>
                <DropdownMenuItem onClick={addNode}>
                  Empty Node
                </DropdownMenuItem>
                {getTemplatesForParentKind('root').length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    {getTemplatesForParentKind('root').map((template) => (
                      <DropdownMenuItem
                        key={template.id}
                        onClick={() => {
                          const templateNodes = instantiateTemplate(template);
                          setNodes([...nodes, ...templateNodes]);
                        }}
                        title={template.description}
                      >
                        {template.name}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
              onAddTemplateChildren={(templateNodes) => {
                const withRefs = assignMissingRefs(templateNodes, nodes);
                setNodes(
                  nodes.map((n) =>
                    n.id === node.id
                      ? { ...n, children: [...(n.children || []), ...withRefs] }
                      : n
                  )
                );
              }}
              onCopy={() => copyNode(node.id)}
              onMoveUp={() => moveNodeUp(node.id)}
              onMoveDown={() => moveNodeDown(node.id)}
              availableConstants={constants}
              allowedKinds={getValidChildren('root')}
              allNodes={nodes}
            />
          ))
        )}
      </div>
    </div>
    </StructureMetadataProvider>
  );
}
