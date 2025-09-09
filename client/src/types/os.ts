export interface WindowState {
  id: string;
  app: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  workspace: number;
}

export interface OSSettings {
  theme: 'light' | 'dark' | 'auto';
  wallpaper: string;
  showDesktopIcons: boolean;
}

export interface AppConfig {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType;
}

export interface DragState {
  isDragging: boolean;
  windowId: string | null;
  offset: { x: number; y: number };
}
