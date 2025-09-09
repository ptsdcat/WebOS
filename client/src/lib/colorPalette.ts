interface ColorPalette {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  preview?: string;
}

interface CustomColorPalette extends ColorPalette {
  isCustom: boolean;
  createdAt: Date;
}

export const defaultPalettes: ColorPalette[] = [
  {
    id: 'arch-dark',
    name: 'Arch Dark',
    description: 'Classic Arch Linux inspired dark theme',
    primary: '#1793d1',
    secondary: '#0f172a',
    accent: '#3b82f6',
    background: '#0a0e18',
    surface: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    border: '#334155',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4'
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Calming ocean-inspired blue tones',
    primary: '#0ea5e9',
    secondary: '#0c4a6e',
    accent: '#38bdf8',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#64748b',
    border: '#475569',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#f87171',
    info: '#06b6d4'
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Natural forest green palette',
    primary: '#22c55e',
    secondary: '#14532d',
    accent: '#4ade80',
    background: '#0f1b0f',
    surface: '#1a2e1a',
    text: '#f0fdf4',
    textSecondary: '#86efac',
    border: '#166534',
    success: '#22c55e',
    warning: '#eab308',
    error: '#dc2626',
    info: '#06b6d4'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm sunset orange and red tones',
    primary: '#f97316',
    secondary: '#9a3412',
    accent: '#fb923c',
    background: '#1c1917',
    surface: '#292524',
    text: '#fef7ee',
    textSecondary: '#fdba74',
    border: '#78716c',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#dc2626',
    info: '#06b6d4'
  },
  {
    id: 'purple-cosmic',
    name: 'Purple Cosmic',
    description: 'Deep space purple theme',
    primary: '#8b5cf6',
    secondary: '#581c87',
    accent: '#a78bfa',
    background: '#1e1b2e',
    surface: '#2d2438',
    text: '#f3f4f6',
    textSecondary: '#c4b5fd',
    border: '#6b46c1',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4'
  },
  {
    id: 'cyberpunk-pink',
    name: 'Cyberpunk Pink',
    description: 'Neon cyberpunk aesthetic',
    primary: '#ec4899',
    secondary: '#831843',
    accent: '#f472b6',
    background: '#0f0a0f',
    surface: '#1f1726',
    text: '#fdf2f8',
    textSecondary: '#f9a8d4',
    border: '#be185d',
    success: '#22c55e',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#06b6d4'
  },
  {
    id: 'light-minimal',
    name: 'Light Minimal',
    description: 'Clean minimal light theme',
    primary: '#2563eb',
    secondary: '#f1f5f9',
    accent: '#3b82f6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#475569',
    border: '#e2e8f0',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0284c7'
  },
  {
    id: 'dark-minimal',
    name: 'Dark Minimal',
    description: 'Clean minimal dark theme',
    primary: '#3b82f6',
    secondary: '#1e293b',
    accent: '#60a5fa',
    background: '#020617',
    surface: '#0f172a',
    text: '#f1f5f9',
    textSecondary: '#64748b',
    border: '#334155',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4'
  }
];

class ColorPaletteManager {
  private currentPalette: ColorPalette | CustomColorPalette;
  private customPalettes: CustomColorPalette[] = [];
  private listeners: Set<(palette: ColorPalette | CustomColorPalette) => void> = new Set();

  constructor() {
    this.loadCustomPalettes();
    this.currentPalette = this.loadCurrentPalette();
    this.applyPalette(this.currentPalette);
  }

  private loadCustomPalettes(): void {
    const stored = localStorage.getItem('webos-custom-palettes');
    if (stored) {
      try {
        this.customPalettes = JSON.parse(stored).map((palette: any) => ({
          ...palette,
          createdAt: new Date(palette.createdAt)
        }));
      } catch (error) {
        console.warn('Failed to load custom palettes:', error);
        this.customPalettes = [];
      }
    }
  }

  private saveCustomPalettes(): void {
    localStorage.setItem('webos-custom-palettes', JSON.stringify(this.customPalettes));
  }

  private loadCurrentPalette(): ColorPalette | CustomColorPalette {
    const storedId = localStorage.getItem('webos-color-palette');
    if (storedId) {
      const defaultPalette = defaultPalettes.find(p => p.id === storedId);
      if (defaultPalette) return defaultPalette;
      
      const customPalette = this.customPalettes.find(p => p.id === storedId);
      if (customPalette) return customPalette;
    }
    return defaultPalettes[0]; // Default to Arch Dark
  }

  public getAllPalettes(): (ColorPalette | CustomColorPalette)[] {
    return [...defaultPalettes, ...this.customPalettes];
  }

  public getCurrentPalette(): ColorPalette | CustomColorPalette {
    return this.currentPalette;
  }

  public setPalette(paletteId: string): boolean {
    const palette = this.getAllPalettes().find(p => p.id === paletteId);
    if (!palette) return false;

    this.currentPalette = palette;
    this.applyPalette(palette);
    localStorage.setItem('webos-color-palette', paletteId);
    this.notifyListeners();
    return true;
  }

  public createCustomPalette(palette: Omit<CustomColorPalette, 'id' | 'isCustom' | 'createdAt'>): CustomColorPalette {
    const customPalette: CustomColorPalette = {
      ...palette,
      id: `custom-${Date.now()}`,
      isCustom: true,
      createdAt: new Date()
    };

    this.customPalettes.push(customPalette);
    this.saveCustomPalettes();
    return customPalette;
  }

  public updateCustomPalette(id: string, updates: Partial<ColorPalette>): boolean {
    const index = this.customPalettes.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.customPalettes[index] = { ...this.customPalettes[index], ...updates };
    this.saveCustomPalettes();

    if (this.currentPalette.id === id) {
      this.currentPalette = this.customPalettes[index];
      this.applyPalette(this.currentPalette);
      this.notifyListeners();
    }
    return true;
  }

  public deleteCustomPalette(id: string): boolean {
    const index = this.customPalettes.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.customPalettes.splice(index, 1);
    this.saveCustomPalettes();

    if (this.currentPalette.id === id) {
      this.setPalette(defaultPalettes[0].id);
    }
    return true;
  }

  private applyPalette(palette: ColorPalette | CustomColorPalette): void {
    const root = document.documentElement;
    
    // Convert hex to HSL for CSS custom properties
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Apply CSS custom properties
    root.style.setProperty('--primary', hexToHsl(palette.primary));
    root.style.setProperty('--secondary', hexToHsl(palette.secondary));
    root.style.setProperty('--accent', hexToHsl(palette.accent));
    root.style.setProperty('--background', hexToHsl(palette.background));
    root.style.setProperty('--surface', hexToHsl(palette.surface));
    root.style.setProperty('--foreground', hexToHsl(palette.text));
    root.style.setProperty('--muted-foreground', hexToHsl(palette.textSecondary));
    root.style.setProperty('--border', hexToHsl(palette.border));
    root.style.setProperty('--destructive', hexToHsl(palette.error));
    root.style.setProperty('--success', hexToHsl(palette.success));
    root.style.setProperty('--warning', hexToHsl(palette.warning));
    root.style.setProperty('--info', hexToHsl(palette.info));

    // Dispatch event for components that need to react to palette changes
    window.dispatchEvent(new CustomEvent('palette-changed', { 
      detail: { palette } 
    }));
  }

  public onChange(listener: (palette: ColorPalette | CustomColorPalette) => void): () => void {
    this.listeners.add(listener);
    // Immediately notify with current palette
    listener(this.currentPalette);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentPalette);
      } catch (error) {
        console.error('Error in palette listener:', error);
      }
    });
  }

  public exportPalette(id: string): string | null {
    const palette = this.getAllPalettes().find(p => p.id === id);
    if (!palette) return null;
    
    return JSON.stringify(palette, null, 2);
  }

  public importPalette(paletteJson: string): CustomColorPalette | null {
    try {
      const palette = JSON.parse(paletteJson);
      
      // Validate required properties
      const requiredProps = ['name', 'primary', 'secondary', 'accent', 'background', 'surface', 'text'];
      for (const prop of requiredProps) {
        if (!palette[prop]) {
          throw new Error(`Missing required property: ${prop}`);
        }
      }

      return this.createCustomPalette({
        ...palette,
        description: palette.description || 'Imported palette'
      });
    } catch (error) {
      console.error('Failed to import palette:', error);
      return null;
    }
  }
}

// Global color palette manager instance
export const colorPaletteManager = new ColorPaletteManager();

// Utility functions
export const isCustomPalette = (palette: ColorPalette | CustomColorPalette): palette is CustomColorPalette => {
  return 'isCustom' in palette && palette.isCustom;
};

export const getContrastColor = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};