import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Plus, Edit2, Check, FolderOpen } from 'lucide-react';

interface App {
  id: string;
  name: string;
  icon: string;
}

interface AppFolderProps {
  folder: {
    id: string;
    name: string;
    apps: App[];
    color: string;
  };
  position: { x: number; y: number };
  onDoubleClick: () => void;
  onDragStart?: (folderId: string, e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onUpdateFolder?: (folderId: string, updates: any) => void;
  onLaunchApp?: (appId: string) => void;
  isDragging?: boolean;
}

export const AppFolder: FC<AppFolderProps> = ({
  folder,
  position,
  onDoubleClick,
  onDragStart,
  onDragEnd,
  onUpdateFolder,
  onLaunchApp,
  isDragging = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [folderName, setFolderName] = useState(folder.name);
  const [isBeingDragged, setIsBeingDragged] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDragStart = (e: React.DragEvent) => {
    setIsBeingDragged(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', folder.id);
    onDragStart?.(folder.id, e);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsBeingDragged(false);
    onDragEnd?.();
  };

  const handleSaveName = () => {
    if (folderName.trim() && folderName !== folder.name) {
      onUpdateFolder?.(folder.id, { name: folderName.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setFolderName(folder.name);
      setIsEditing(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Get the first 4 apps for preview
  const previewApps = folder.apps.slice(0, 4);

  return (
    <>
      {/* Folder Icon */}
      <div
        className={`absolute cursor-pointer group transition-all duration-200 ${
          isBeingDragged || isDragging ? 'opacity-70 scale-110 z-50' : 'opacity-100'
        }`}
        style={{
          left: position.x,
          top: position.y,
          transform: isBeingDragged ? 'rotate(3deg)' : 'none'
        }}
        onDoubleClick={handleOpen}
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col items-center p-2 rounded-md hover:bg-primary/10 transition-all duration-200 w-20">
          {/* Folder Icon with App Previews */}
          <div className="w-12 h-12 relative mb-2">
            {/* Folder Background */}
            <div 
              className="w-full h-full rounded-md border-2 flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: folder.color + '20', borderColor: folder.color }}
            >
              {/* App Preview Grid */}
              <div className="grid grid-cols-2 gap-0.5 w-8 h-8">
                {previewApps.map((app, index) => (
                  <div
                    key={app.id}
                    className="w-3 h-3 rounded-sm bg-card border border-border flex items-center justify-center"
                  >
                    <i className={`${app.icon} text-xs text-primary`} />
                  </div>
                ))}
                {/* Fill empty slots with placeholder */}
                {Array.from({ length: 4 - previewApps.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="w-3 h-3 rounded-sm bg-muted/50 border border-border/50"
                  />
                ))}
              </div>
              
              {/* Folder Icon Overlay */}
              <div className="absolute top-0 right-0 w-3 h-3 rounded-sm" style={{ backgroundColor: folder.color }}>
                <FolderOpen className="w-2 h-2 text-white m-0.5" />
              </div>
            </div>
          </div>

          {/* Folder Name */}
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                ref={inputRef}
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveName}
                className="w-16 h-5 text-xs p-1 text-center"
              />
            </div>
          ) : (
            <div
              className="text-foreground text-xs text-center font-mono max-w-20 leading-tight break-words cursor-text"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              {folder.name}
            </div>
          )}
          
          {/* App Count Badge */}
          <div className="text-xs text-muted-foreground mt-1">
            {folder.apps.length} apps
          </div>
        </div>
      </div>

      {/* Folder Content Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-w-[90vw] max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: folder.color }}
                >
                  <FolderOpen className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold">{folder.name}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4">
              {folder.apps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">This folder is empty</p>
                  <p className="text-xs mt-1">Drag apps here to organize them</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {folder.apps.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col items-center p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => {
                        onLaunchApp?.(app.id);
                        handleClose();
                      }}
                    >
                      <div className="w-8 h-8 bg-card border border-border rounded-md flex items-center justify-center mb-1">
                        <i className={`${app.icon} text-sm text-primary`} />
                      </div>
                      <span className="text-xs text-center font-mono leading-tight max-w-16 truncate">
                        {app.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-muted/20">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{folder.apps.length} applications</span>
                <span>Double-click to rename folder</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};