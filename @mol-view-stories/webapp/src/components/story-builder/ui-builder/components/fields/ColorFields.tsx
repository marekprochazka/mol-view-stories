import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ConstantDefinition,
  ConstantRef,
  createConstantRef,
  isConstantRef,
} from '@mol-view-stories/state-builder/src';

interface ColorFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
  custom?: Record<string, unknown>;
  onCustomChange?: (custom: Record<string, unknown> | undefined) => void;
  availableConstants?: ConstantDefinition[];
}

// TODO: might be possible to get dynamically from somewhere
const MOLSTAR_COLOR_THEMES = [
  { value: 'element-symbol', label: 'Element Symbol' },
  { value: 'chain-id', label: 'Chain ID' },
  { value: 'entity-id', label: 'Entity ID' },
  { value: 'residue-name', label: 'Residue Name' },
  { value: 'secondary-structure', label: 'Secondary Structure' },
  { value: 'uniform', label: 'Uniform' },
] as const;

// TODO: might be possible to get dynamically from somewhere
const CARBON_COLOR_OPTIONS = [
  { value: 'element-symbol', label: 'Element Symbol' },
  { value: 'uniform', label: 'Uniform' },
] as const;

type ColorMode = 'simple' | 'theme' | 'constant';

function numericToHex(value: number): string {
  return '#' + value.toString(16).padStart(6, '0');
}

function hexToNumeric(hex: string): number {
  const clean = hex.replace('#', '');
  return parseInt(clean, 16) || 0;
}

interface CarbonColorParam {
  name: string;
  params?: {
    value?: number;
  };
}

export function ColorFields({
  params,
  onChange,
  custom,
  onCustomChange,
  availableConstants = [],
}: ColorFieldsProps) {
  const colorConstants = availableConstants.filter((c) => c.type === 'colors');

  const hasConstantRef = isConstantRef(params.color);
  const hasCustomTheme = custom?.molstar_color_theme_name !== undefined;

  const colorMode: ColorMode = hasConstantRef ? 'constant' : hasCustomTheme ? 'theme' : 'simple';

  const currentConstantRef = hasConstantRef ? (params.color as ConstantRef) : null;

  const simpleColor = (params.color as string) || '';

  const themeName = (custom?.molstar_color_theme_name as string) || '';
  const themeParams = custom?.molstar_color_theme_params as Record<string, unknown> | undefined;

  const carbonColor = themeParams?.carbonColor as CarbonColorParam | undefined;
  const carbonColorName = carbonColor?.name || 'element-symbol';
  const carbonColorValue = carbonColor?.params?.value;
  const carbonColorHex = carbonColorValue !== undefined ? numericToHex(carbonColorValue) : '#808080';

  const handleModeChange = (mode: ColorMode) => {
    if (mode === 'simple') {
      onCustomChange?.(undefined);
      onChange({ ...params, color: '#808080' });
    } else if (mode === 'theme') {
      onChange({ ...params, color: undefined });
      onCustomChange?.({
        molstar_color_theme_name: 'element-symbol',
      });
    } else if (mode === 'constant') {
      onCustomChange?.(undefined);
      if (colorConstants.length > 0 && colorConstants[0].entries.length > 0) {
        const firstConst = colorConstants[0];
        const firstEntry = firstConst.entries.find((e) => e.key) || firstConst.entries[0];
        onChange({ ...params, color: createConstantRef(firstConst.name, firstEntry.key) });
      } else {
        onChange({ ...params, color: createConstantRef('', '') });
      }
    }
  };

  const handleConstantRefChange = (constantName: string, entryKey: string) => {
    onChange({ ...params, color: createConstantRef(constantName, entryKey) });
  };

  const handleSimpleColorChange = (value: string) => {
    onChange({ ...params, color: value });
  };

  const handleThemeChange = (theme: string) => {
    onCustomChange?.({
      ...custom,
      molstar_color_theme_name: theme,
      // Clear theme params when changing theme
      molstar_color_theme_params: undefined,
    });
  };

  const handleCarbonColorNameChange = (name: string) => {
    if (name === 'element-symbol') {
      const newThemeParams = { ...themeParams };
      delete newThemeParams.carbonColor;
      onCustomChange?.({
        ...custom,
        molstar_color_theme_params: Object.keys(newThemeParams).length > 0 ? newThemeParams : undefined,
      });
    } else {
      // Set to uniform with a default color
      onCustomChange?.({
        ...custom,
        molstar_color_theme_params: {
          ...themeParams,
          carbonColor: {
            name: 'uniform',
            params: { value: carbonColorValue ?? 0x808080 },
          },
        },
      });
    }
  };

  const handleCarbonColorValueChange = (hex: string) => {
    const numValue = hexToNumeric(hex);
    onCustomChange?.({
      ...custom,
      molstar_color_theme_params: {
        ...themeParams,
        carbonColor: {
          name: 'uniform',
          params: { value: numValue },
        },
      },
    });
  };

  const currentConstantValue = currentConstantRef
    ? `${currentConstantRef.constantName}:${currentConstantRef.entryKey}`
    : '';

  // Build list of all available constant entries
  const constantOptions = colorConstants.flatMap((c) =>
    c.entries
      .filter((e) => e.key)
      .map((e) => ({
        value: `${c.name}:${e.key}`,
        label: `${c.name}.${e.key}`,
        previewColor: e.value,
      }))
  );

  return (
    <>
      <div className='w-28'>
        <Label className='text-xs'>Color Mode</Label>
        <Select value={colorMode} onValueChange={(v) => handleModeChange(v as ColorMode)}>
          <SelectTrigger size='sm'>
            <SelectValue placeholder='Select' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='simple'>Simple</SelectItem>
            <SelectItem value='theme'>Theme</SelectItem>
            {colorConstants.length > 0 && <SelectItem value='constant'>Constant</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      {colorMode === 'simple' && (
        <div className='flex-1'>
          <Label className='text-xs'>Color</Label>
          <div className='flex gap-1'>
            <Input
              className='h-8 text-sm flex-1'
              placeholder='e.g., #4577B2 or red'
              value={simpleColor}
              onChange={(e) => handleSimpleColorChange(e.target.value)}
            />
            <input
              type='color'
              className='w-8 h-8 rounded border border-gray-300 cursor-pointer p-0'
              value={simpleColor.startsWith('#') ? simpleColor : '#808080'}
              onChange={(e) => handleSimpleColorChange(e.target.value)}
              title='Pick color'
            />
            <div
              className='w-8 h-8 rounded border border-gray-300'
              style={{ backgroundColor: simpleColor || '#808080' }}
              title={simpleColor || 'No color set'}
            />
          </div>
        </div>
      )}

      {colorMode === 'theme' && (
        <>
          <div className='w-36'>
            <Label className='text-xs'>Color Theme</Label>
            <Select value={themeName} onValueChange={handleThemeChange}>
              <SelectTrigger size='sm'>
                <SelectValue placeholder='Select theme' />
              </SelectTrigger>
              <SelectContent>
                {MOLSTAR_COLOR_THEMES.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Carbon color options for element-symbol theme */}
          {themeName === 'element-symbol' && (
            <>
              <div className='w-32'>
                <Label className='text-xs'>Carbon Color</Label>
                <Select value={carbonColorName} onValueChange={handleCarbonColorNameChange}>
                  <SelectTrigger size='sm'>
                    <SelectValue placeholder='Select' />
                  </SelectTrigger>
                  <SelectContent>
                    {CARBON_COLOR_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {carbonColorName === 'uniform' && (
                <div className='flex-1'>
                  <Label className='text-xs'>Carbon Value</Label>
                  <div className='flex gap-1'>
                    <Input
                      className='h-8 text-sm flex-1'
                      placeholder='#808080'
                      value={carbonColorHex}
                      onChange={(e) => handleCarbonColorValueChange(e.target.value)}
                    />
                    <input
                      type='color'
                      className='w-8 h-8 rounded border border-gray-300 cursor-pointer p-0'
                      value={carbonColorHex}
                      onChange={(e) => handleCarbonColorValueChange(e.target.value)}
                      title='Pick carbon color'
                    />
                    <div
                      className='w-8 h-8 rounded border border-gray-300'
                      style={{ backgroundColor: carbonColorHex }}
                      title={`${carbonColorValue ?? 'N/A'} (${carbonColorHex})`}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {colorMode === 'constant' && (
        <div className='flex-1'>
          <Label className='text-xs'>Constant Reference</Label>
          <div className='flex gap-1'>
            <Select
              value={currentConstantValue}
              onValueChange={(v) => {
                const [constName, entryKey] = v.split(':');
                handleConstantRefChange(constName, entryKey);
              }}
            >
              <SelectTrigger size='sm' className='flex-1'>
                <SelectValue placeholder='Select constant' />
              </SelectTrigger>
              <SelectContent>
                {constantOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className='flex items-center gap-2'>
                      <span
                        className='w-3 h-3 rounded-sm border border-gray-300'
                        style={{ backgroundColor: opt.previewColor }}
                      />
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentConstantRef && (
              <div
                className='w-8 h-8 rounded border border-gray-300'
                style={{
                  backgroundColor:
                    constantOptions.find((o) => o.value === currentConstantValue)?.previewColor || '#808080',
                }}
                title={currentConstantValue}
              />
            )}
          </div>
          {constantOptions.length === 0 && (
            <p className='text-xs text-muted-foreground mt-1'>No color constants defined.</p>
          )}
        </div>
      )}
    </>
  );
}
