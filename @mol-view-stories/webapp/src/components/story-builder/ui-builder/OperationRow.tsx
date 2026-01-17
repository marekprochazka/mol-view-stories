'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Operation, OperationType } from '@mol-view-stories/state-builder';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';
import { ConstantOperation } from './components/ConstantOperation';
import { TreeLines } from './components/TreeLines';
import { OperationActions } from './components/OperationActions';
import { TypeSelect } from './components/TypeSelect';
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
  AnimationFields,
} from './components/fields';

interface OperationRowProps {
  operation: Operation;
  onUpdate: (updates: Partial<Operation>) => void;
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
  operation,
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

  const handleTypeChange = (type: OperationType) => {
    onUpdate({ type, params: {} });
  };

  const handleParamChange = (key: string, value: string) => {
    onUpdate({
      params: { ...operation.params, [key]: value },
    });
  };

  const handleRefChange = (value: string) => {
    onUpdate({ ref: value });
  };

  const canHaveChildren = ['structure', 'component', 'representation', 'primitives'].includes(operation.type);

  const renderDynamicFields = () => {
    if (!operation.params) {
      return null;
    }

    switch (operation.type) {
      case 'constant':
        // Handled specially by ConstantOperation component
        return null;

      case 'download':
        return <DownloadFields value={operation.params.url || ''} onChange={(v) => handleParamChange('url', v)} />;

      case 'parse':
        return <ParseFields value={operation.params.format || ''} onChange={(v) => handleParamChange('format', v)} />;

      case 'structure':
        return (
          <StructureFields
            value={operation.params.structureType || ''}
            onChange={(v) => handleParamChange('structureType', v)}
          />
        );

      case 'component':
        return (
          <ComponentFields
            selectorType={operation.params.selectorType || ''}
            selectorValue={operation.params.selectorValue || ''}
            onSelectorTypeChange={(v) => handleParamChange('selectorType', v)}
            onSelectorValueChange={(v) => handleParamChange('selectorValue', v)}
          />
        );

      case 'representation':
        return (
          <RepresentationFields
            value={operation.params.repType || ''}
            onChange={(v) => handleParamChange('repType', v)}
          />
        );

      case 'color':
        return (
          <ColorFields
            colorType={operation.params.colorType || ''}
            color={operation.params.color || ''}
            onColorTypeChange={(v) => handleParamChange('colorType', v)}
            onColorChange={(v) => handleParamChange('color', v)}
          />
        );

      case 'transform':
        return (
          <TransformFields
            translation={operation.params.translation || ''}
            rotation={operation.params.rotation || ''}
            onTranslationChange={(v) => handleParamChange('translation', v)}
            onRotationChange={(v) => handleParamChange('rotation', v)}
          />
        );

      case 'label':
        return (
          <LabelFields
            text={operation.params.text || ''}
            position={operation.params.position || ''}
            size={operation.params.size || ''}
            onTextChange={(v) => handleParamChange('text', v)}
            onPositionChange={(v) => handleParamChange('position', v)}
            onSizeChange={(v) => handleParamChange('size', v)}
          />
        );

      case 'primitives':
        return (
          <PrimitivesFields value={operation.params.options || ''} onChange={(v) => handleParamChange('options', v)} />
        );

      case 'animation':
        return (
          <AnimationFields
            animType={operation.params.animType || ''}
            params={operation.params.params || ''}
            onAnimTypeChange={(v) => handleParamChange('animType', v)}
            onParamsChange={(v) => handleParamChange('params', v)}
          />
        );

      default:
        return null;
    }
  };

  // Special layout for constant type
  if (operation.type === 'constant') {
    return (
      <ConstantOperation
        operation={operation}
        depth={depth}
        isLast={isLast}
        isFirst={isFirst}
        onTypeChange={handleTypeChange}
        onParamChange={handleParamChange}
        onRefChange={handleRefChange}
        onRemove={onRemove}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onCopy={onCopy}
      />
    );
  }

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

          <TypeSelect value={operation.type} onChange={handleTypeChange} />

          {renderDynamicFields()}

          <div className='w-24'>
            <Label className='text-xs'>Ref</Label>
            <Input
              className='h-8 text-sm'
              placeholder='name'
              value={operation.ref || ''}
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

      {isExpanded && operation.children && operation.children.length > 0 && (
        <div className='mt-2 space-y-2'>
          {operation.children.map((child, index) => (
            <OperationRow
              key={child.id}
              operation={child}
              depth={depth + 1}
              isFirst={index === 0}
              isLast={index === operation.children!.length - 1}
              onUpdate={(updates) => {
                const newChildren = [...operation.children!];
                newChildren[index] = { ...child, ...updates };
                onUpdate({ children: newChildren });
              }}
              onRemove={() => {
                const newChildren = operation.children!.filter((_, i) => i !== index);
                onUpdate({ children: newChildren });
              }}
              onAddChild={() => {
                const newChild: Operation = {
                  id: Date.now().toString() + Math.random(),
                  type: '',
                  params: {},
                  children: [],
                };
                onUpdate({ children: [...(operation.children || []), newChild] });
              }}
              onCopy={() => {
                const copiedChild = JSON.parse(JSON.stringify(child));
                copiedChild.id = Date.now().toString() + Math.random();
                onUpdate({ children: [...operation.children!, copiedChild] });
              }}
              onMoveUp={() => {
                if (index === 0) return;
                const newChildren = [...operation.children!];
                [newChildren[index - 1], newChildren[index]] = [newChildren[index], newChildren[index - 1]];
                onUpdate({ children: newChildren });
              }}
              onMoveDown={() => {
                if (index >= operation.children!.length - 1) return;
                const newChildren = [...operation.children!];
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
