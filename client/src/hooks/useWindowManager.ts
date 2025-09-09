import { useState, useCallback, useRef } from 'react';
import { WindowState, OSSettings, DragState } from '@/types/os';

export function useWindowManager() {
  const [windows, setWindows] = useState<Map<string, WindowState>>(new Map());
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    windowId: null,
    offset: { x: 0, y: 0 }
  });
  const [settings, setSettings] = useState<OSSettings>(() => {
    const saved = localStorage.getItem('os-settings');
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      wallpaper: 'default',
      showDesktopIcons: true
    };
  });

  const zIndexRef = useRef(100);

  const createWindow = useCallback((app: string, title: string, icon: string) => {
    const windowId = `window-${Date.now()}`;
    const existingWindows = Array.from(windows.values());
    
    // Calculate responsive window dimensions
    const screenWidth = Math.max(globalThis.innerWidth || 1200, 800);
    const screenHeight = Math.max(globalThis.innerHeight || 800, 600);
    const taskbarHeight = 40;
    const availableHeight = screenHeight - taskbarHeight;
    
    const defaultWidth = Math.min(800, screenWidth * 0.7);
    const defaultHeight = Math.min(600, availableHeight * 0.7);
    
    let newWindow: WindowState;
    
    // Hyprland-style automatic tiling
    const totalWindows = existingWindows.length + 1;
    
    if (totalWindows === 1) {
      // Single window: take most of the screen
      newWindow = {
        id: windowId,
        app,
        title,
        icon,
        x: 50,
        y: 50,
        width: screenWidth - 100,
        height: availableHeight - 100,
        minimized: false,
        maximized: false,
        zIndex: ++zIndexRef.current,
        workspace: 1
      };
    } else if (totalWindows === 2) {
      // Two windows: split vertically
      const width = (screenWidth - 60) / 2;
      newWindow = {
        id: windowId,
        app,
        title,
        icon,
        x: 20 + width + 20,
        y: 50,
        width: width,
        height: availableHeight - 100,
        minimized: false,
        maximized: false,
        zIndex: ++zIndexRef.current,
        workspace: 1
      };
      
      // Resize existing window
      const firstWindow = existingWindows[0];
      if (firstWindow) {
        setWindows(prev => {
          const updatedWindows = new Map(prev);
          updatedWindows.set(firstWindow.id, {
            ...firstWindow,
            x: 20,
            y: 50,
            width: width,
            height: availableHeight - 100
          });
          return updatedWindows;
        });
      }
    } else if (totalWindows === 3) {
      // Three windows: main window left, two stacked right
      const mainWidth = (screenWidth - 60) * 0.6;
      const rightWidth = (screenWidth - 60) * 0.4;
      const rightHeight = (availableHeight - 120) / 2;
      
      newWindow = {
        id: windowId,
        app,
        title,
        icon,
        x: 20 + mainWidth + 20,
        y: 50 + rightHeight + 20,
        width: rightWidth,
        height: rightHeight,
        minimized: false,
        maximized: false,
        zIndex: ++zIndexRef.current,
        workspace: 1
      };
      
      // Rearrange existing windows
      existingWindows.forEach((window, index) => {
        setWindows(prev => {
          const updatedWindows = new Map(prev);
          if (index === 0) {
            updatedWindows.set(window.id, {
              ...window,
              x: 20,
              y: 50,
              width: mainWidth,
              height: availableHeight - 100
            });
          } else {
            updatedWindows.set(window.id, {
              ...window,
              x: 20 + mainWidth + 20,
              y: 50,
              width: rightWidth,
              height: rightHeight
            });
          }
          return updatedWindows;
        });
      });
    } else {
      // Four or more: grid layout
      const cols = Math.ceil(Math.sqrt(totalWindows));
      const rows = Math.ceil(totalWindows / cols);
      const windowWidth = (screenWidth - 20 * (cols + 1)) / cols;
      const windowHeight = (availableHeight - 20 * (rows + 1)) / rows;
      
      const newWindowIndex = totalWindows - 1;
      const col = newWindowIndex % cols;
      const row = Math.floor(newWindowIndex / cols);
      
      newWindow = {
        id: windowId,
        app,
        title,
        icon,
        x: 20 + col * (windowWidth + 20),
        y: 50 + row * (windowHeight + 20),
        width: windowWidth,
        height: windowHeight,
        minimized: false,
        maximized: false,
        zIndex: ++zIndexRef.current,
        workspace: 1
      };
      
      // Rearrange all existing windows in grid
      existingWindows.forEach((window, index) => {
        const windowCol = index % cols;
        const windowRow = Math.floor(index / cols);
        
        setWindows(prev => {
          const updatedWindows = new Map(prev);
          updatedWindows.set(window.id, {
            ...window,
            x: 20 + windowCol * (windowWidth + 20),
            y: 50 + windowRow * (windowHeight + 20),
            width: windowWidth,
            height: windowHeight
          });
          return updatedWindows;
        });
      });
    }

    setWindows(prev => {
      const newWindows = new Map(prev);
      newWindows.set(windowId, newWindow);
      return newWindows;
    });
    
    setActiveWindowId(windowId);
    return windowId;
  }, [windows]);

  const closeWindow = useCallback((windowId: string) => {
    setWindows(prev => {
      const currentWindows = new Map(prev);
      currentWindows.delete(windowId);
      
      // Get remaining windows and rearrange them
      const remainingWindows = Array.from(currentWindows.values());
      const totalWindows = remainingWindows.length;
      
      if (totalWindows > 0) {
        const screenWidth = Math.max(globalThis.innerWidth || 1200, 800);
        const screenHeight = Math.max(globalThis.innerHeight || 800, 600);
        const taskbarHeight = 40;
        const availableHeight = screenHeight - taskbarHeight;
        
        // Rearrange remaining windows using the same tiling logic
        remainingWindows.forEach((window, index) => {
          let newProps: Partial<WindowState> = {};
          
          if (totalWindows === 1) {
            // Single window: take most of the screen
            newProps = {
              x: 50,
              y: 50,
              width: screenWidth - 100,
              height: availableHeight - 100
            };
          } else if (totalWindows === 2) {
            // Two windows: split vertically
            const width = (screenWidth - 60) / 2;
            newProps = {
              x: index === 0 ? 20 : 20 + width + 20,
              y: 50,
              width: width,
              height: availableHeight - 100
            };
          } else if (totalWindows === 3) {
            // Three windows: main window left, two stacked right
            const mainWidth = (screenWidth - 60) * 0.6;
            const rightWidth = (screenWidth - 60) * 0.4;
            const rightHeight = (availableHeight - 120) / 2;
            
            if (index === 0) {
              newProps = {
                x: 20,
                y: 50,
                width: mainWidth,
                height: availableHeight - 100
              };
            } else {
              newProps = {
                x: 20 + mainWidth + 20,
                y: index === 1 ? 50 : 50 + rightHeight + 20,
                width: rightWidth,
                height: rightHeight
              };
            }
          } else {
            // Four or more: grid layout
            const cols = Math.ceil(Math.sqrt(totalWindows));
            const rows = Math.ceil(totalWindows / cols);
            const windowWidth = (screenWidth - 20 * (cols + 1)) / cols;
            const windowHeight = (availableHeight - 20 * (rows + 1)) / rows;
            
            const col = index % cols;
            const row = Math.floor(index / cols);
            
            newProps = {
              x: 20 + col * (windowWidth + 20),
              y: 50 + row * (windowHeight + 20),
              width: windowWidth,
              height: windowHeight
            };
          }
          
          currentWindows.set(window.id, { ...window, ...newProps });
        });
      }
      
      return currentWindows;
    });
    
    if (activeWindowId === windowId) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows(prev => {
      const newWindows = new Map(prev);
      const window = newWindows.get(windowId);
      if (window) {
        newWindows.set(windowId, { ...window, minimized: !window.minimized });
      }
      return newWindows;
    });
    
    if (activeWindowId === windowId) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const maximizeWindow = useCallback((windowId: string) => {
    setWindows(prev => {
      const newWindows = new Map(prev);
      const window = newWindows.get(windowId);
      if (window) {
        newWindows.set(windowId, { 
          ...window, 
          maximized: !window.maximized,
          minimized: false
        });
      }
      return newWindows;
    });
  }, []);

  const focusWindow = useCallback((windowId: string) => {
    setActiveWindowId(windowId);
    setWindows(prev => {
      const newWindows = new Map(prev);
      const window = newWindows.get(windowId);
      if (window) {
        newWindows.set(windowId, { 
          ...window, 
          zIndex: ++zIndexRef.current,
          minimized: false
        });
      }
      return newWindows;
    });
  }, []);

  const moveWindow = useCallback((windowId: string, x: number, y: number) => {
    setWindows(prev => {
      const newWindows = new Map(prev);
      const window = newWindows.get(windowId);
      if (window && !window.maximized) {
        const screenWidth = globalThis.innerWidth || 1200;
        const screenHeight = globalThis.innerHeight || 800;
        
        // Keep window within screen bounds
        const clampedX = Math.max(0, Math.min(x - dragState.offset.x, screenWidth - window.width));
        const clampedY = Math.max(0, Math.min(y - dragState.offset.y, screenHeight - window.height - 40));
        
        newWindows.set(windowId, { 
          ...window, 
          x: clampedX, 
          y: clampedY 
        });
      }
      return newWindows;
    });
  }, [dragState]);

  const startDrag = useCallback((windowId: string, offsetX: number, offsetY: number) => {
    setDragState({
      isDragging: true,
      windowId,
      offset: { x: offsetX, y: offsetY }
    });
  }, []);

  const endDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      windowId: null,
      offset: { x: 0, y: 0 }
    });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<OSSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('os-settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    windows: Array.from(windows.values()),
    activeWindowId,
    dragState,
    settings,
    createWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    moveWindow,
    startDrag,
    endDrag,
    updateSettings
  };
}