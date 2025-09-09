import { FC, useState, useEffect } from 'react';
import { WindowState } from '@/types/os';

interface WorkspaceManagerProps {
  windows: WindowState[];
  activeWorkspace: number;
  onWorkspaceChange: (workspace: number) => void;
}

export const WorkspaceManager: FC<WorkspaceManagerProps> = ({
  windows,
  activeWorkspace,
  onWorkspaceChange
}) => {
  const [workspaces] = useState([1, 2, 3, 4, 5]);

  const getWorkspaceWindows = (workspace: number) => {
    return windows.filter(w => w.workspace === workspace && !w.minimized);
  };

  const handleWorkspaceClick = (workspace: number) => {
    onWorkspaceChange(workspace);
  };

  // Keyboard shortcuts for workspace switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const workspace = parseInt(e.key);
        onWorkspaceChange(workspace);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onWorkspaceChange]);

  return (
    <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-black/80 backdrop-blur-md rounded-lg px-4 py-2 border border-primary/30">
        <div className="flex space-x-2">
          {workspaces.map((workspace) => {
            const windowCount = getWorkspaceWindows(workspace).length;
            const isActive = workspace === activeWorkspace;
            
            return (
              <button
                key={workspace}
                onClick={() => handleWorkspaceClick(workspace)}
                className={`
                  relative w-12 h-8 rounded-md transition-all duration-200 
                  ${isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <span className="text-xs font-mono">{workspace}</span>
                {windowCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full text-[8px] flex items-center justify-center text-black">
                    {windowCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="text-xs text-center text-muted-foreground mt-1 font-mono">
          Alt+{activeWorkspace}
        </div>
      </div>
    </div>
  );
};