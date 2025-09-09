import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Plus, Download, Upload, Edit3, Trash2, Copy, Check, Eye, Sparkles } from 'lucide-react';
import { colorPaletteManager, defaultPalettes, isCustomPalette, getContrastColor } from '@/lib/colorPalette';
import { useToast } from '@/hooks/use-toast';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

const ColorInput: FC<ColorInputProps> = ({ label, value, onChange, description }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      <div className="flex gap-2">
        <div 
          className="w-12 h-10 rounded border-2 border-gray-300 cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => document.getElementById(`color-${label}`)?.click()}
        />
        <Input
          id={`color-${label}`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 h-10 p-1 border cursor-pointer"
        />
        <Input
          value={value.toUpperCase()}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm"
          placeholder="#FFFFFF"
        />
      </div>
    </div>
  );
};

export const ColorPaletteSelector: FC = () => {
  const [currentPalette, setCurrentPalette] = useState(colorPaletteManager.getCurrentPalette());
  const [allPalettes, setAllPalettes] = useState(colorPaletteManager.getAllPalettes());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPalette, setEditingPalette] = useState<any>(null);
  const [previewPalette, setPreviewPalette] = useState<any>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { toast } = useToast();

  const [newPalette, setNewPalette] = useState({
    name: '',
    description: '',
    primary: '#3b82f6',
    secondary: '#1e293b',
    accent: '#60a5fa',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#64748b',
    border: '#334155',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4'
  });

  useEffect(() => {
    const unsubscribe = colorPaletteManager.onChange((palette) => {
      setCurrentPalette(palette);
      setAllPalettes(colorPaletteManager.getAllPalettes());
    });

    return unsubscribe;
  }, []);

  const handlePaletteSelect = (paletteId: string) => {
    const success = colorPaletteManager.setPalette(paletteId);
    if (success) {
      toast({
        title: "Palette Applied",
        description: "Color palette has been updated successfully.",
      });
    }
  };

  const handleCreatePalette = () => {
    if (!newPalette.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your custom palette.",
        variant: "destructive"
      });
      return;
    }

    const palette = colorPaletteManager.createCustomPalette(newPalette);
    setAllPalettes(colorPaletteManager.getAllPalettes());
    setShowCreateDialog(false);
    setNewPalette({
      name: '',
      description: '',
      primary: '#3b82f6',
      secondary: '#1e293b',
      accent: '#60a5fa',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#64748b',
      border: '#334155',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4'
    });

    toast({
      title: "Palette Created",
      description: `Custom palette "${palette.name}" has been created.`,
    });
  };

  const handleEditPalette = (palette: any) => {
    setEditingPalette({ ...palette });
    setShowEditDialog(true);
  };

  const handleUpdatePalette = () => {
    if (!editingPalette) return;

    const success = colorPaletteManager.updateCustomPalette(editingPalette.id, editingPalette);
    if (success) {
      setAllPalettes(colorPaletteManager.getAllPalettes());
      setShowEditDialog(false);
      setEditingPalette(null);
      
      toast({
        title: "Palette Updated",
        description: "Custom palette has been updated successfully.",
      });
    }
  };

  const handleDeletePalette = (paletteId: string) => {
    const success = colorPaletteManager.deleteCustomPalette(paletteId);
    if (success) {
      setAllPalettes(colorPaletteManager.getAllPalettes());
      toast({
        title: "Palette Deleted",
        description: "Custom palette has been deleted.",
      });
    }
  };

  const handleExportPalette = (paletteId: string) => {
    const exported = colorPaletteManager.exportPalette(paletteId);
    if (exported) {
      navigator.clipboard.writeText(exported);
      toast({
        title: "Palette Exported",
        description: "Palette JSON has been copied to clipboard.",
      });
    }
  };

  const handleImportPalette = () => {
    navigator.clipboard.readText().then(text => {
      const imported = colorPaletteManager.importPalette(text);
      if (imported) {
        setAllPalettes(colorPaletteManager.getAllPalettes());
        toast({
          title: "Palette Imported",
          description: `Palette "${imported.name}" has been imported.`,
        });
      } else {
        toast({
          title: "Import Failed",
          description: "Invalid palette format in clipboard.",
          variant: "destructive"
        });
      }
    }).catch(() => {
      toast({
        title: "Import Failed",
        description: "Could not read from clipboard.",
        variant: "destructive"
      });
    });
  };

  const handlePreviewPalette = (palette: any) => {
    setPreviewPalette(palette);
    setIsPreviewMode(true);
    
    // Temporarily apply palette for preview
    const root = document.documentElement;
    const originalValues: any = {};
    
    // Store original values
    ['--primary', '--secondary', '--accent', '--background', '--surface', '--foreground'].forEach(prop => {
      originalValues[prop] = root.style.getPropertyValue(prop);
    });

    // Apply preview
    colorPaletteManager.setPalette(palette.id);

    // Restore after 3 seconds
    setTimeout(() => {
      if (isPreviewMode) {
        colorPaletteManager.setPalette(currentPalette.id);
        setIsPreviewMode(false);
        setPreviewPalette(null);
      }
    }, 3000);
  };

  const stopPreview = () => {
    if (isPreviewMode) {
      colorPaletteManager.setPalette(currentPalette.id);
      setIsPreviewMode(false);
      setPreviewPalette(null);
    }
  };

  const renderPaletteCard = (palette: any) => (
    <Card key={palette.id} className={`cursor-pointer transition-all hover:shadow-lg ${
      currentPalette.id === palette.id ? 'ring-2 ring-primary' : ''
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{palette.name}</CardTitle>
          <div className="flex gap-1">
            {isCustomPalette(palette) && (
              <Badge variant="secondary" className="text-xs">Custom</Badge>
            )}
            {currentPalette.id === palette.id && (
              <Badge variant="default" className="text-xs">Active</Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500">{palette.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Color preview */}
        <div className="grid grid-cols-6 gap-1 h-8">
          <div className="rounded" style={{ backgroundColor: palette.primary }} title="Primary" />
          <div className="rounded" style={{ backgroundColor: palette.secondary }} title="Secondary" />
          <div className="rounded" style={{ backgroundColor: palette.accent }} title="Accent" />
          <div className="rounded" style={{ backgroundColor: palette.background }} title="Background" />
          <div className="rounded" style={{ backgroundColor: palette.success }} title="Success" />
          <div className="rounded" style={{ backgroundColor: palette.error }} title="Error" />
        </div>

        {/* Actions */}
        <div className="flex gap-1 flex-wrap">
          <Button
            size="sm"
            variant={currentPalette.id === palette.id ? "default" : "outline"}
            onClick={() => handlePaletteSelect(palette.id)}
            className="text-xs"
          >
            {currentPalette.id === palette.id ? <Check className="w-3 h-3 mr-1" /> : <Palette className="w-3 h-3 mr-1" />}
            {currentPalette.id === palette.id ? 'Active' : 'Apply'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePreviewPalette(palette)}
            className="text-xs"
          >
            <Eye className="w-3 h-3" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExportPalette(palette.id)}
            className="text-xs"
          >
            <Copy className="w-3 h-3" />
          </Button>

          {isCustomPalette(palette) && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEditPalette(palette)}
                className="text-xs"
              >
                <Edit3 className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeletePalette(palette.id)}
                className="text-xs"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderColorInputs = (palette: any, setPalette: (palette: any) => void) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ColorInput
        label="Primary"
        value={palette.primary}
        onChange={(value) => setPalette({ ...palette, primary: value })}
        description="Main brand color"
      />
      <ColorInput
        label="Secondary"
        value={palette.secondary}
        onChange={(value) => setPalette({ ...palette, secondary: value })}
        description="Secondary brand color"
      />
      <ColorInput
        label="Accent"
        value={palette.accent}
        onChange={(value) => setPalette({ ...palette, accent: value })}
        description="Accent and highlight color"
      />
      <ColorInput
        label="Background"
        value={palette.background}
        onChange={(value) => setPalette({ ...palette, background: value })}
        description="Main background color"
      />
      <ColorInput
        label="Surface"
        value={palette.surface}
        onChange={(value) => setPalette({ ...palette, surface: value })}
        description="Card and panel background"
      />
      <ColorInput
        label="Text"
        value={palette.text}
        onChange={(value) => setPalette({ ...palette, text: value })}
        description="Primary text color"
      />
      <ColorInput
        label="Text Secondary"
        value={palette.textSecondary}
        onChange={(value) => setPalette({ ...palette, textSecondary: value })}
        description="Secondary text color"
      />
      <ColorInput
        label="Border"
        value={palette.border}
        onChange={(value) => setPalette({ ...palette, border: value })}
        description="Border and divider color"
      />
      <ColorInput
        label="Success"
        value={palette.success}
        onChange={(value) => setPalette({ ...palette, success: value })}
        description="Success state color"
      />
      <ColorInput
        label="Warning"
        value={palette.warning}
        onChange={(value) => setPalette({ ...palette, warning: value })}
        description="Warning state color"
      />
      <ColorInput
        label="Error"
        value={palette.error}
        onChange={(value) => setPalette({ ...palette, error: value })}
        description="Error state color"
      />
      <ColorInput
        label="Info"
        value={palette.info}
        onChange={(value) => setPalette({ ...palette, info: value })}
        description="Info state color"
      />
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-h-full overflow-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          Color Palette Selector
        </h1>
        <div className="flex gap-2">
          <Button onClick={handleImportPalette} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Custom
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Create Custom Palette</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Palette Name</Label>
                    <Input
                      value={newPalette.name}
                      onChange={(e) => setNewPalette({ ...newPalette, name: e.target.value })}
                      placeholder="My Custom Palette"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={newPalette.description}
                      onChange={(e) => setNewPalette({ ...newPalette, description: e.target.value })}
                      placeholder="A beautiful custom color scheme"
                    />
                  </div>
                </div>
                
                {renderColorInputs(newPalette, setNewPalette)}
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePalette}>
                    Create Palette
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isPreviewMode && previewPalette && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Previewing: {previewPalette.name}</p>
                <p className="text-sm text-gray-600">Preview will end automatically in a few seconds</p>
              </div>
              <Button size="sm" variant="outline" onClick={stopPreview}>
                Stop Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="default" className="w-full">
        <TabsList>
          <TabsTrigger value="default">Default Palettes</TabsTrigger>
          <TabsTrigger value="custom">Custom Palettes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="default" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defaultPalettes.map(renderPaletteCard)}
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          {allPalettes.filter(isCustomPalette).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Palette className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No Custom Palettes</h3>
                <p className="text-gray-500 mb-4">Create your first custom color palette to get started</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom Palette
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPalettes.filter(isCustomPalette).map(renderPaletteCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Custom Palette</DialogTitle>
          </DialogHeader>
          {editingPalette && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Palette Name</Label>
                  <Input
                    value={editingPalette.name}
                    onChange={(e) => setEditingPalette({ ...editingPalette, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={editingPalette.description}
                    onChange={(e) => setEditingPalette({ ...editingPalette, description: e.target.value })}
                  />
                </div>
              </div>
              
              {renderColorInputs(editingPalette, setEditingPalette)}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePalette}>
                  Update Palette
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};