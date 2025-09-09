import { FC, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Power } from 'lucide-react';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (app: string) => void;
}

const apps = [
  { id: 'terminal', name: 'Terminal', icon: 'fas fa-terminal', color: 'bg-green-600' },
  { id: 'browser', name: 'Browser', icon: 'fas fa-globe', color: 'bg-blue-600' },
  { id: 'package-manager', name: 'Pacman', icon: 'fas fa-box', color: 'bg-purple-600' },
  { id: 'file-manager', name: 'Files', icon: 'fas fa-folder', color: 'bg-yellow-500' },
  { id: 'text-editor', name: 'Editor', icon: 'fas fa-file-alt', color: 'bg-blue-500' },
  { id: 'calculator', name: 'Calc', icon: 'fas fa-calculator', color: 'bg-gray-700' },
  { id: 'settings', name: 'Settings', icon: 'fas fa-cog', color: 'bg-gray-600' }
];

export const StartMenu: FC<StartMenuProps> = ({ isOpen, onClose, onOpenApp }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-12 left-2 w-72 h-80 bg-card border border-border rounded-md shadow-xl animate-in slide-in-from-bottom-2 duration-200 overflow-hidden">
      <div className="p-3 h-full flex flex-col font-mono">
        <div className="mb-3">
          <Input
            type="text"
            placeholder="Type to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm bg-background border-border focus:border-primary"
          />
        </div>
        
        <div className="mb-3 flex-1">
          <h3 className="text-sm font-medium text-foreground mb-2">Applications</h3>
          <div className="grid grid-cols-4 gap-2">
            {filteredApps.map((app) => (
              <div 
                key={app.id}
                className="app-item p-2 rounded hover:bg-muted cursor-pointer transition-colors group"
                onClick={() => {
                  onOpenApp(app.id);
                  onClose();
                }}
              >
                <div className="text-center">
                  <div className="w-6 h-6 bg-card border border-border rounded flex items-center justify-center mb-1 mx-auto group-hover:border-primary/50 transition-colors">
                    <i className={`${app.icon} text-primary text-xs`}></i>
                  </div>
                  <span className="text-xs text-foreground truncate block">{app.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-border pt-2 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                <i className="fas fa-user text-primary text-xs"></i>
              </div>
              <span className="text-sm text-foreground">
                {localStorage.getItem('webos-username') || 'html@javascriptiso'}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="p-1 hover:bg-muted text-muted-foreground"
              onClick={() => {
                localStorage.removeItem('archInstalled');
                window.location.reload();
              }}
              title="Shutdown"
            >
              <Power className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
