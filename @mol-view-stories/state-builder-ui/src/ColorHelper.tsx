'use client';

import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PaletteIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  isConstantRef,
  createConstantRef,
  MOLSTAR_COLOR_THEMES,
  CARBON_COLOR_OPTIONS,
} from '@mol-view-stories/state-builder/src';
import type { ConstantDefinition, ConstantRef } from '@mol-view-stories/state-builder/src';
import { SimplePanel, ThemePanel, ConstantPanel } from './color-helper';

interface ColorHelperProps {
  params: Record<string, unknown>;
  custom?: Record<string, unknown>;
  availableConstants?: ConstantDefinition[];
  onApply: (params: Record<string, unknown>, custom: Record<string, unknown> | undefined) => void;
}

type ColorTab = 'simple' | 'theme' | 'constant';

interface CarbonColorParam {
  name: string;
  params?: { value?: number };
}

function numericToHex(value: number): string {
  return '#' + value.toString(16).padStart(6, '0');
}

function hexToNumeric(hex: string): number {
  const clean = hex.replace('#', '');
  return parseInt(clean, 16) || 0;
}

export function ColorHelper({
  params,
  custom,
  availableConstants = [],
  onApply,
}: ColorHelperProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ColorTab>('simple');

  const [simpleColor, setSimpleColor] = useState('#808080');
  const [themeName, setThemeName] = useState('element-symbol');
  const [carbonColorName, setCarbonColorName] = useState('element-symbol');
  const [carbonColorHex, setCarbonColorHex] = useState('#808080');
  const [constantValue, setConstantValue] = useState('');

  const colorConstants = availableConstants.filter((c) => c.type === 'colors');

  // Initialize state from props when dialog opens
  useEffect(() => {
    if (!open) return;

    if (isConstantRef(params.color)) {
      const ref = params.color as ConstantRef;
      setActiveTab('constant');
      setConstantValue(`${ref.constantName}:${ref.entryKey}`);
    } else if (custom?.molstar_color_theme_name !== undefined) {
      setActiveTab('theme');
      const name = (custom.molstar_color_theme_name as string) || 'element-symbol';
      setThemeName(name);

      const themeParams = custom.molstar_color_theme_params as Record<string, unknown> | undefined;
      const carbonColor = themeParams?.carbonColor as CarbonColorParam | undefined;
      setCarbonColorName(carbonColor?.name || 'element-symbol');
      const carbonValue = carbonColor?.params?.value;
      setCarbonColorHex(carbonValue !== undefined ? numericToHex(carbonValue) : '#808080');
    } else {
      setActiveTab('simple');
      setSimpleColor((params.color as string) || '');
    }
  }, [open, params, custom]);

  const handleCarbonColorNameChange = (name: string) => {
    setCarbonColorName(name);
    if (name === 'uniform') {
      // keep current hex
    }
  };

  const handleApply = () => {
    if (activeTab === 'simple') {
      onApply({ ...params, color: simpleColor }, undefined);
    } else if (activeTab === 'theme') {
      const themeParams = custom?.molstar_color_theme_params as Record<string, unknown> | undefined;
      let newThemeParams: Record<string, unknown> | undefined;

      if (themeName === 'element-symbol' && carbonColorName === 'uniform') {
        newThemeParams = {
          ...themeParams,
          carbonColor: {
            name: 'uniform',
            params: { value: hexToNumeric(carbonColorHex) },
          },
        };
      } else if (themeName === 'element-symbol' && carbonColorName === 'element-symbol') {
        if (themeParams) {
          const { carbonColor: _cc, ...rest } = themeParams;
          newThemeParams = Object.keys(rest).length > 0 ? rest : undefined;
        }
      }

      const newParams = { ...params };
      delete newParams.color;

      onApply(newParams, {
        molstar_color_theme_name: themeName,
        molstar_color_theme_params: newThemeParams,
      });
    } else {
      // constant
      if (constantValue) {
        const [constName, entryKey] = constantValue.split(':');
        onApply({ ...params, color: createConstantRef(constName, entryKey) }, undefined);
      } else {
        onApply({ ...params, color: createConstantRef('', '') }, undefined);
      }
    }
    setOpen(false);
  };

  // Compute preview for trigger button
  const computePreview = (): { previewColor: string | null; label: string } => {
    if (isConstantRef(params.color)) {
      const ref = params.color as ConstantRef;
      const key = `${ref.constantName}:${ref.entryKey}`;
      const label = `${ref.constantName}.${ref.entryKey}`;
      const option = colorConstants
        .flatMap((c) => c.entries.filter((e) => e.key).map((e) => ({ value: `${c.name}:${e.key}`, color: e.value })))
        .find((o) => o.value === key);
      return { previewColor: option?.color ?? null, label };
    }

    if (custom?.molstar_color_theme_name !== undefined) {
      const name = (custom.molstar_color_theme_name as string) || '';
      const themeLabel = MOLSTAR_COLOR_THEMES.find((t) => t.value === name)?.label ?? name;
      const themeParams = custom.molstar_color_theme_params as Record<string, unknown> | undefined;
      const carbonColor = themeParams?.carbonColor as CarbonColorParam | undefined;

      if (name === 'element-symbol' && carbonColor?.name === 'uniform') {
        const hex = carbonColor.params?.value !== undefined ? numericToHex(carbonColor.params.value) : '';
        const carbonLabel = CARBON_COLOR_OPTIONS.find((o) => o.value === 'uniform')?.label ?? 'uniform';
        return {
          previewColor: null,
          label: `${themeLabel} · ${carbonLabel}${hex ? ` ${hex}` : ''}`,
        };
      }

      return { previewColor: null, label: themeLabel || 'Configure color' };
    }

    const color = params.color as string | undefined;
    if (color) {
      return { previewColor: color.startsWith('#') ? color : null, label: color };
    }

    return { previewColor: null, label: 'Configure color' };
  };

  const { previewColor, label } = computePreview();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='h-8 justify-start text-left font-normal w-full'
          title='Open color helper'
        >
          {previewColor ? (
            <span
              className='w-4 h-4 rounded border border-gray-300 mr-2 shrink-0'
              style={{ backgroundColor: previewColor }}
            />
          ) : (
            <PaletteIcon className='size-4 mr-2 shrink-0 text-muted-foreground' />
          )}
          <span className='truncate'>{label}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Color Helper</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ColorTab)}>
          <TabsList className='w-full'>
            <TabsTrigger value='simple' className='text-xs flex-1'>Simple</TabsTrigger>
            <TabsTrigger value='theme' className='text-xs flex-1'>Theme</TabsTrigger>
            {colorConstants.length > 0 && (
              <TabsTrigger value='constant' className='text-xs flex-1'>Constant</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value='simple'>
            <SimplePanel color={simpleColor} onChange={setSimpleColor} />
          </TabsContent>

          <TabsContent value='theme'>
            <ThemePanel
              themeName={themeName}
              carbonColorName={carbonColorName}
              carbonColorHex={carbonColorHex}
              onThemeChange={setThemeName}
              onCarbonColorNameChange={handleCarbonColorNameChange}
              onCarbonColorHexChange={setCarbonColorHex}
            />
          </TabsContent>

          <TabsContent value='constant'>
            <ConstantPanel
              value={constantValue}
              colorConstants={colorConstants}
              onChange={setConstantValue}
            />
          </TabsContent>
        </Tabs>

        <div className='flex gap-2 justify-end pt-2'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
