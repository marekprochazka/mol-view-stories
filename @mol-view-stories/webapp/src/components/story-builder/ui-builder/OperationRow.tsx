'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UINode } from '@mol-view-stories/state-builder/src';
import type { MVSKind } from 'molstar/lib/extensions/mvs/tree/mvs/mvs-tree';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';
import { TreeLines } from './components/TreeLines';
import { OperationActions } from './components/OperationActions';
import { KindSelect } from './components/KindSelect';
import {
  DownloadFields,
  ParseFields,
  StructureFields,
  ComponentFields,
  RepresentationFields,
  ColorFields,
  TransformFields,
  LabelFields,
  PrimitivesFields,
} from './components/fields';

interface OperationRowProps {
  node: UINode;
  onUpdate: (updates: Partial<UINode>) => void;
  onRemove: () => void;
  onAddChild?: () => void;
  onCopy?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  depth?: number;
  isLast?: boolean;
  isFirst?: boolean;
}

export function OperationRow({
  node,
  onUpdate,
  onRemove,
  onAddChild,
  onCopy,
  onMoveUp,
  onMoveDown,
  depth = 0,
  isLast = false,
  isFirst = false,
}: OperationRowProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleKindChange = (kind: MVSKind) => {
    onUpdate({ kind, params: {} });
  };

  const handleParamsChange = (params: Record<string, unknown>) => {
    onUpdate({ params });
  };

  const handleRefChange = (value: string) => {
    onUpdate({ ref: value });
  };

  const canHaveChildren = ['structure', 'component', 'representation', 'primitives', 'download', 'parse'].includes(node.kind);

  const renderDynamicFields = () => {
    if (!node.params) {
      return null;
    }

    switch (node.kind) {
      case 'download':
        return <DownloadFields params={node.params} onChange={handleParamsChange} />;

      case 'parse':
        return <ParseFields params={node.params} onChange={handleParamsChange} />;

      case 'structure':
        return <StructureFields params={node.params} onChange={handleParamsChange} />;

      case 'component':
        return <ComponentFields params={node.params} onChange={handleParamsChange} />;

      case 'representation':
        return <RepresentationFields params={node.params} onChange={handleParamsChange} />;

      case 'color':
        return <ColorFields params={node.params} onChange={handleParamsChange} />;

      case 'transform':
        return <TransformFields params={node.params} onChange={handleParamsChange} />;

      case 'label':
        return <LabelFields params={node.params} onChange={handleParamsChange} />;

      case 'primitives':
        return <PrimitivesFields params={node.params} onChange={handleParamsChange} />;

      default:
        return null;
    }
  };

  return (
    <div className='relative' style={{ marginLeft: depth > 0 ? '20px' : '0' }}>
      <TreeLines depth={depth} isLast={isLast} />

      <div className='border rounded-md p-2 bg-card'>
        <div className='flex gap-2 items-end'>
          {canHaveChildren && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsExpanded(!isExpanded)}
              className='h-8 w-8 p-0'
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronDownIcon className='size-4' /> : <ChevronRightIcon className='size-4' />}
            </Button>
          )}

          <KindSelect value={node.kind} onChange={handleKindChange} />

          {renderDynamicFields()}

          <div className='w-24'>
            <Label className='text-xs'>Ref</Label>
            <Input
              className='h-8 text-sm'
              placeholder='name'
              value={node.ref || ''}
              onChange={(e) => handleRefChange(e.target.value)}
              title='Reference name to use this operation later'
            />
          </div>

          <OperationActions
            canHaveChildren={canHaveChildren}
            isFirst={isFirst}
            isLast={isLast}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onAddChild={onAddChild}
            onCopy={onCopy}
            onRemove={onRemove}
          />
        </div>
      </div>

      {isExpanded && node.children && node.children.length > 0 && (
        <div className='mt-2 space-y-2'>
          {node.children.map((child, index) => (
            <OperationRow
              key={child.id}
              node={child}
              depth={depth + 1}
              isFirst={index === 0}
              isLast={index === node.children!.length - 1}
              onUpdate={(updates) => {
                const newChildren = [...node.children!];
                newChildren[index] = { ...child, ...updates };
                onUpdate({ children: newChildren });
              }}
              onRemove={() => {
                const newChildren = node.children!.filter((_, i) => i !== index);
                onUpdate({ children: newChildren });
              }}
              onAddChild={() => {
                const newChild: UINode = {
                  id: Date.now().toString() + Math.random(),
                  kind: '',
                  params: {},
                  children: [],
                };
                onUpdate({ children: [...(node.children || []), newChild] });
              }}
              onCopy={() => {
                const copiedChild = JSON.parse(JSON.stringify(child));
                copiedChild.id = Date.now().toString() + Math.random();
                onUpdate({ children: [...node.children!, copiedChild] });
              }}
              onMoveUp={() => {
                if (index === 0) return;
                const newChildren = [...node.children!];
                [newChildren[index - 1], newChildren[index]] = [newChildren[index], newChildren[index - 1]];
                onUpdate({ children: newChildren });
              }}
              onMoveDown={() => {
                if (index >= node.children!.length - 1) return;
                const newChildren = [...node.children!];
                [newChildren[index], newChildren[index + 1]] = [newChildren[index + 1], newChildren[index]];
                onUpdate({ children: newChildren });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
