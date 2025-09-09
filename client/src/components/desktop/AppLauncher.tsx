import { FC, useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, Zap } from 'lucide-react';

interface App {
  id: string;
  name: string;
  icon: string;
  type: 'system' | 'installed';
}

interface AppLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchApp: (appId: string) => void;
}

export const AppLauncher: FC<AppLauncherProps> = ({ isOpen, onClose, onLaunchApp }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [apps, setApps] = useState<App[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // System apps that are always available
  const systemApps: App[] = [
    { id: 'terminal', name: 'Terminal', icon: 'fas fa-terminal', type: 'system' },
    { id: 'browser', name: 'Web Browser', icon: 'fas fa-globe', type: 'system' },
    { id: 'package-manager', name: 'Package Manager', icon: 'fas fa-box', type: 'system' },
    { id: 'file-manager', name: 'File Manager', icon: 'fas fa-folder', type: 'system' },
    { id: 'text-editor', name: 'Text Editor', icon: 'fas fa-file-alt', type: 'system' },
    { id: 'calculator', name: 'Calculator', icon: 'fas fa-calculator', type: 'system' },
    { id: 'settings', name: 'Settings', icon: 'fas fa-cog', type: 'system' }
  ];

  // Load all available apps (system + installed)
  useEffect(() => {
    const loadApps = () => {
      let allApps = [...systemApps];
      
      // Add installed apps
      const stored = localStorage.getItem('installedApps');
      if (stored) {
        const installedApps = JSON.parse(stored);
        const installedAppsList = installedApps.map((app: any) => ({
          id: app.id,
          name: app.name,
          icon: app.icon,
          type: 'installed' as const
        }));
        allApps = [...allApps, ...installedAppsList];
      }
      
      setApps(allApps);
    };

    loadApps();

    // Listen for app installation updates
    const handleAppsUpdated = () => {
      loadApps();
    };

    window.addEventListener('appsUpdated', handleAppsUpdated);
    return () => window.removeEventListener('appsUpdated', handleAppsUpdated);
  }, []);

  // Filter apps based on search term
  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredApps.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredApps.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredApps[selectedIndex]) {
            handleLaunchApp(filteredApps[selectedIndex].id);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredApps, selectedIndex, onClose]);

  const handleLaunchApp = (appId: string) => {
    onLaunchApp(appId);
    onClose();
    setSearchTerm('');
  };

  const handleAppClick = (appId: string, index: number) => {
    setSelectedIndex(index);
    handleLaunchApp(appId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Quick Launch</h3>
              <p className="text-sm text-muted-foreground">Search and launch applications</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Type to search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-lg h-12"
            />
          </div>

          <div className="max-h-80 overflow-auto">
            {filteredApps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No applications found</p>
                <p className="text-xs mt-1">Try searching with different keywords</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredApps.map((app, index) => (
                  <div
                    key={app.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      index === selectedIndex 
                        ? 'bg-accent border border-accent-foreground/20' 
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => handleAppClick(app.id, index)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                      <i className={`${app.icon} text-lg`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{app.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {app.type} application
                      </div>
                    </div>
                    {index === selectedIndex && (
                      <div className="text-xs text-muted-foreground">
                        Press Enter
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>↑↓ Navigate</span>
                <span>Enter Select</span>
                <span>Esc Close</span>
              </div>
              <span>{filteredApps.length} apps</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};