import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ColorFieldsProps {
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
  custom?: Record<string, unknown>;
  onCustomChange?: (custom: Record<string, unknown> | undefined) => void;
}

// Molstar color theme names
const MOLSTAR_COLOR_THEMES = [
  { value: 'element-symbol', label: 'Element Symbol' },
  { value: 'chain-id', label: 'Chain ID' },
  { value: 'entity-id', label: 'Entity ID' },
  { value: 'residue-name', label: 'Residue Name' },
  { value: 'secondary-structure', label: 'Secondary Structure' },
  { value: 'uniform', label: 'Uniform' },
] as const;

// Carbon color options for element-symbol theme
const CARBON_COLOR_OPTIONS = [
  { value: 'element-symbol', label: 'Element Symbol' },
  { value: 'uniform', label: 'Uniform' },
] as const;

type ColorMode = 'simple' | 'theme';

// Helper to convert numeric color to hex
function numericToHex(value: number): string {
  return '#' + value.toString(16).padStart(6, '0');
}

// Helper to convert hex to numeric
function hexToNumeric(hex: string): number {
  const clean = hex.replace('#', '');
  return parseInt(clean, 16) || 0;
}

// Type for carbonColor param structure
interface CarbonColorParam {
  name: string;
  params?: {
    value?: number;
  };
}

export function ColorFields({ params, onChange, custom, onCustomChange }: ColorFieldsProps) {
  // Determine color mode based on what's set
  const hasCustomTheme = custom?.molstar_color_theme_name !== undefined;

  // Default to simple mode if color is set, or theme mode if custom theme is set
  const colorMode: ColorMode = hasCustomTheme ? 'theme' : 'simple';

  // Simple color value (hex string)
  const simpleColor = (params.color as string) || '';

  // Theme values
  const themeName = (custom?.molstar_color_theme_name as string) || '';
  const themeParams = custom?.molstar_color_theme_params as Record<string, unknown> | undefined;

  // Carbon color specific params (used with element-symbol theme)
  const carbonColor = themeParams?.carbonColor as CarbonColorParam | undefined;
  const carbonColorName = carbonColor?.name || 'element-symbol';
  const carbonColorValue = carbonColor?.params?.value;
  const carbonColorHex = carbonColorValue !== undefined ? numericToHex(carbonColorValue) : '#808080';

  const handleModeChange = (mode: ColorMode) => {
    if (mode === 'simple') {
      // Switch to simple color mode - clear custom, set default color if empty
      onCustomChange?.(undefined);
      if (!params.color) {
        onChange({ ...params, color: '#808080' });
      }
    } else {
      // Switch to theme mode - clear simple color, set default theme
      onChange({ color: undefined });
      onCustomChange?.({
        molstar_color_theme_name: 'element-symbol',
      });
    }
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
      // Remove carbonColor param entirely
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
    </>
  );
}
