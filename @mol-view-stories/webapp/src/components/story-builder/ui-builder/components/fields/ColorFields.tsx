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

type ColorMode = 'simple' | 'theme';

export function ColorFields({ params, onChange, custom, onCustomChange }: ColorFieldsProps) {
  // Determine color mode based on what's set
  const hasCustomTheme = custom?.molstar_color_theme_name !== undefined;
  const hasSimpleColor = typeof params.color === 'string' && params.color.length > 0;

  // Default to simple mode if color is set, or theme mode if custom theme is set
  const colorMode: ColorMode = hasCustomTheme ? 'theme' : 'simple';

  // Simple color value (hex string)
  const simpleColor = (params.color as string) || '';

  // Theme values
  const themeName = (custom?.molstar_color_theme_name as string) || '';

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
        <div className='flex-1'>
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
      )}
    </>
  );
}
