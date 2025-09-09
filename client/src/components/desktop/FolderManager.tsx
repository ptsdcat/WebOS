import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { FolderPlus, Palette, Save, X } from 'lucide-react';

interface App {
  id: string;
  name: string;
  icon: string;
}

interface Folder {
  id: string;
  name: string;
  apps: App[];
  color: string;
}

interface FolderManagerProps {
  isOpen: boolean;
  onClose: () => void;
  availableApps: App[];
  folders: Folder[];
  onCreateFolder: (folder: Omit<Folder, 'id'>) => void;
  onUpdateFolder: (folderId: string, updates: Partial<Folder>) => void;
  onDeleteFolder: (folderId: string) => void;
}

const FOLDER_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1'  // indigo
];

const FOLDER_CATEGORIES = [
  { id: 'productivity', name: 'Productivity', apps: ['text-editor', 'notepad', 'calculator-pro', 'calendar', 'email-client'] },
  { id: 'media', name: 'Media & Entertainment', apps: ['music-player', 'video-player', 'image-viewer'] },
  { id: 'development', name: 'Development', apps: ['code-editor', 'terminal', 'package-manager'] },
  { id: 'system', name: 'System Tools', apps: ['file-manager', 'settings', 'task-manager'] },
  { id: 'internet', name: 'Internet & Communication', apps: ['browser', 'email-client'] },
  { id: 'utilities', name: 'Utilities', apps: ['calculator', 'weather-app'] }
];

export const FolderManager: FC<FolderManagerProps> = ({
  isOpen,
  onClose,
  availableApps,
  folders,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [mode, setMode] = useState<'manual' | 'category'>('category');

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    let appsToAdd: App[] = [];
    
    if (mode === 'category' && selectedCategory) {
      const category = FOLDER_CATEGORIES.find(c => c.id === selectedCategory);
      if (category) {
        appsToAdd = availableApps.filter(app => 
          category.apps.includes(app.id) && 
          !folders.some(folder => folder.apps.some(folderApp => folderApp.id === app.id))
        );
      }
    } else if (mode === 'manual') {
      appsToAdd = availableApps.filter(app => 
        selectedApps.includes(app.id) &&
        !folders.some(folder => folder.apps.some(folderApp => folderApp.id === app.id))
      );
    }

    onCreateFolder({
      name: newFolderName.trim(),
      apps: appsToAdd,
      color: selectedColor
    });

    // Reset form
    setNewFolderName('');
    setSelectedApps([]);
    setSelectedCategory('');
    setSelectedColor(FOLDER_COLORS[0]);
  };

  const handleCreateCategoryFolders = () => {
    FOLDER_CATEGORIES.forEach(category => {
      const categoryApps = availableApps.filter(app => 
        category.apps.includes(app.id) && 
        !folders.some(folder => folder.apps.some(folderApp => folderApp.id === app.id))
      );

      if (categoryApps.length > 0) {
        onCreateFolder({
          name: category.name,
          apps: categoryApps,
          color: FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)]
        });
      }
    });
  };

  const unorganizedApps = availableApps.filter(app => 
    !folders.some(folder => folder.apps.some(folderApp => folderApp.id === app.id))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5" />
            Organize Applications
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Auto-Organize */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Quick Organization</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Automatically create folders based on app categories
            </p>
            <Button onClick={handleCreateCategoryFolders} className="w-full">
              <FolderPlus className="w-4 h-4 mr-2" />
              Auto-organize by Category
            </Button>
          </Card>

          {/* Create Custom Folder */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Create Custom Folder</h3>
            
            {/* Folder Name */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Folder Name</label>
              <Input
                placeholder="Enter folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>

            {/* Color Selection */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Folder Color</label>
              <div className="flex gap-2 flex-wrap">
                {FOLDER_COLORS.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-md border-2 transition-all ${
                      selectedColor === color ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            {/* Organization Mode */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Organization Method</label>
              <div className="flex gap-2">
                <Button
                  variant={mode === 'category' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('category')}
                >
                  By Category
                </Button>
                <Button
                  variant={mode === 'manual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('manual')}
                >
                  Manual Selection
                </Button>
              </div>
            </div>

            {/* Category Selection */}
            {mode === 'category' && (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Select Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {FOLDER_CATEGORIES.map(category => {
                      const availableCount = availableApps.filter(app => 
                        category.apps.includes(app.id) && 
                        !folders.some(folder => folder.apps.some(folderApp => folderApp.id === app.id))
                      ).length;
                      
                      return (
                        <SelectItem key={category.id} value={category.id} disabled={availableCount === 0}>
                          {category.name} ({availableCount} apps)
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Manual App Selection */}
            {mode === 'manual' && (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Select Applications</label>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border rounded">
                  {unorganizedApps.map(app => (
                    <label key={app.id} className="flex items-center space-x-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedApps.includes(app.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedApps([...selectedApps, app.id]);
                          } else {
                            setSelectedApps(selectedApps.filter(id => id !== app.id));
                          }
                        }}
                        className="rounded"
                      />
                      <i className={`${app.icon} text-xs`} />
                      <span className="truncate">{app.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || (mode === 'category' && !selectedCategory) || (mode === 'manual' && selectedApps.length === 0)}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              Create Folder
            </Button>
          </Card>

          {/* Existing Folders */}
          {folders.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Existing Folders</h3>
              <div className="space-y-2">
                {folders.map(folder => (
                  <div key={folder.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: folder.color }}
                      />
                      <span className="font-medium">{folder.name}</span>
                      <span className="text-sm text-muted-foreground">({folder.apps.length} apps)</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteFolder(folder.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Unorganized Apps */}
          {unorganizedApps.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Unorganized Applications ({unorganizedApps.length})</h3>
              <div className="grid grid-cols-4 gap-2">
                {unorganizedApps.map(app => (
                  <div key={app.id} className="flex flex-col items-center p-2 border rounded text-center">
                    <i className={`${app.icon} text-sm mb-1`} />
                    <span className="text-xs truncate w-full">{app.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};