import { FC, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Square, X } from 'lucide-react';
import { WindowState } from '@/types/os';

interface WindowProps {
  window: WindowState;
  isActive: boolean;
  children: React.ReactNode;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onDragStart: (offsetX: number, offsetY: number) => void;
  onDrag: (x: number, y: number) => void;
  onDragEnd: () => void;
}

export const Window: FC<WindowProps> = ({
  window,
  isActive,
  children,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onDragStart,
  onDrag,
  onDragEnd
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        onDrag(e.clientX, e.clientY);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        onDragEnd();
        document.body.classList.remove('select-none');
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onDrag, onDragEnd]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (headerRef.current && e.target instanceof Node && headerRef.current.contains(e.target)) {
      e.preventDefault();
      isDraggingRef.current = true;
      document.body.classList.add('select-none');
      
      const rect = windowRef.current?.getBoundingClientRect();
      if (rect) {
        onDragStart(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
    onFocus();
  };

  if (window.minimized) {
    return null;
  }

  return (
    <div
      ref={windowRef}
      className="absolute bg-card border border-border rounded-md shadow-lg animate-in fade-in-0 scale-in-95 duration-200"
      style={{
        left: window.maximized ? '1rem' : window.x,
        top: window.maximized ? '1rem' : window.y,
        width: window.maximized ? 'calc(100vw - 2rem)' : window.width,
        height: window.maximized ? 'calc(100vh - 4rem)' : window.height,
        zIndex: window.zIndex,
        minWidth: 320,
        minHeight: 200,
        maxWidth: window.maximized ? 'none' : 'calc(100vw - 2rem)',
        maxHeight: window.maximized ? 'none' : 'calc(100vh - 4rem)'
      }}
      onMouseDown={handleMouseDown}
    >
      <div 
        ref={headerRef}
        className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border cursor-move select-none font-mono"
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className={`${window.icon} text-primary text-xs`}></i>
          </div>
          <span className="text-sm text-foreground">{window.title}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm"
            className="w-5 h-5 p-0 rounded hover:bg-background transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
          >
            <Minus className="w-3 h-3 text-muted-foreground" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="w-5 h-5 p-0 rounded hover:bg-background transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
          >
            <Square className="w-3 h-3 text-muted-foreground" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="w-5 h-5 p-0 rounded hover:bg-destructive hover:text-destructive-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="p-3 overflow-auto bg-background" style={{ height: 'calc(100% - 45px)' }}>
        {children}
      </div>
    </div>
  );
};
