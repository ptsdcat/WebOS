import { FC, useEffect } from 'react';
import { Window } from './Window';
import { playSounds } from '@/lib/soundManager';
import { Terminal } from '@/components/apps/Terminal';
import { Browser } from '@/components/apps/Browser';
import { WebBrowser } from '@/components/apps/WebBrowser';
import { AppStore } from '@/components/apps/AppStore';
import { FileManager } from '@/components/apps/FileManager';
import { TextEditor } from '@/components/apps/TextEditor';
import { Calculator } from '@/components/apps/Calculator';
import { Settings } from '@/components/apps/Settings';
import { NotePad } from '@/components/apps/NotePad';
import { CalculatorPro } from '@/components/apps/CalculatorPro';
import { ImageViewer } from '@/components/apps/ImageViewer';
import { Achievements } from '@/components/apps/Achievements';
import { AccountManager } from '@/components/apps/AccountManager';
import { WeatherApp } from '@/components/apps/WeatherApp';
import { Calendar } from '@/components/apps/Calendar';
import { EmailClient } from '@/components/apps/EmailClient';
import { TaskManager } from '@/components/apps/TaskManager';
import { SystemRecovery } from '@/components/apps/SystemRecovery';
import { Spreadsheet } from '@/components/apps/Spreadsheet';
import { PresentationApp } from '@/components/apps/Presentation';
import { OfficeSuite } from '@/components/apps/OfficeSuite';
import { StorageManager } from '@/components/apps/StorageManager';
import { Tetris } from '@/components/apps/Tetris';
import { VideoEditor } from '@/components/apps/VideoEditor';
import { Roblox } from '@/components/apps/Roblox';
import { RobloxStudio } from '@/components/apps/RobloxStudio';
import { PacMan } from '@/components/apps/PacMan';
import { RetroEmulator } from '@/components/apps/RetroEmulator';
import { IDE } from '@/components/apps/IDE';
import { VirtualMachine } from '@/components/apps/VirtualMachine';
import { DownloadManager } from '@/components/apps/DownloadManager';
import { PerformanceMonitor } from '@/components/apps/PerformanceMonitor';
import { CallOfDuty } from '@/components/apps/CallOfDuty';
import { MultiplayerShooter } from '@/components/apps/MultiplayerShooter';
import { VideoTube } from '@/components/apps/VideoTube';
import { WeatherStation } from '@/components/apps/WeatherStation';
import { NewsCenter } from '@/components/apps/NewsCenter';
import { CryptoTracker } from '@/components/apps/CryptoTracker';
import { StockMarket } from '@/components/apps/StockMarket';
import { GameCenter } from '@/components/apps/GameCenter';
import { ProductivitySuite } from '@/components/apps/ProductivitySuite';
import { SystemMonitor } from '@/components/apps/SystemMonitor';
import { AdvancedDashboard } from '@/components/apps/AdvancedDashboard';
import { ArchPackageManager } from '@/components/apps/ArchPackageManager';
import { HyprlandConfig } from '@/components/apps/HyprlandConfig';
import { SystemWOS } from '@/components/apps/SystemWOS';
import { ProxyTestCenter } from '@/components/apps/ProxyTestCenter';
import { NetworkStatusMonitor } from '@/components/apps/NetworkStatusMonitor';
import { ColorPaletteSelector } from '@/components/apps/ColorPaletteSelector';
import { CloudStorage } from '@/components/apps/CloudStorage';
import { NetworkManager } from '@/components/apps/NetworkManager';
import { DevTools } from '@/components/apps/DevTools';
import { PackageManagerPro } from '@/components/apps/PackageManagerPro';
import { VMManager } from '@/components/apps/VMManager';
import { SystemBackup } from '@/components/apps/SystemBackup';
import { useWindowManager } from '@/hooks/useWindowManager';
import { AppConfig } from '@/types/os';

const getAppComponent = (appId: string) => {
  const componentMap: Record<string, any> = {
    'terminal': Terminal,
    'browser': WebBrowser,
    'package-manager': AppStore,
    'app-store': AppStore,
    'file-manager': FileManager,
    'text-editor': TextEditor,
    'calculator': Calculator,
    'settings': Settings,
    'achievements': Achievements,
    'account-manager': AccountManager,
    // Installable apps
    'notepad': NotePad,
    'calculator-pro': CalculatorPro,
    'image-viewer': ImageViewer,
    // New functional apps from package manager
    'WeatherApp': WeatherApp,
    'Calendar': Calendar,
    'EmailClient': EmailClient,
    'TaskManager': TaskManager,
    'SystemRecovery': SystemRecovery,
    'weather-app': WeatherApp,
    'calendar': Calendar,
    'email-client': EmailClient,
    'task-manager': TaskManager,
    'system-recovery': SystemRecovery,
    'spreadsheet': Spreadsheet,
    'presentation': PresentationApp,
    'office-suite': OfficeSuite,
    'storage-manager': StorageManager,
    'tetris': Tetris,
    'video-editor': VideoEditor,
    'roblox': Roblox,
    'roblox-studio': RobloxStudio,
    'pacman': PacMan,
    'retro-emulator': RetroEmulator,
    'ide': IDE,
    'virtual-machine': VirtualMachine,
    'download-manager': DownloadManager,
    'performance-monitor': PerformanceMonitor,
    'call-of-duty': CallOfDuty,
    'multiplayer-shooter': MultiplayerShooter,
    'video-tube': VideoTube,
    // Advanced applications with live data
    'weather-station': WeatherStation,
    'news-center': NewsCenter,
    'crypto-tracker': CryptoTracker,
    'stock-market': StockMarket,
    'game-center': GameCenter,
    'productivity-suite': ProductivitySuite,
    'system-monitor': SystemMonitor,
    'advanced-dashboard': AdvancedDashboard,
    'arch-package-manager': ArchPackageManager,
    'hyprland-config': HyprlandConfig,
    'system-wos': SystemWOS,
    'proxy-test-center': ProxyTestCenter,
    'cloud-storage': CloudStorage,
    'network-manager': NetworkManager,
    'network-status-monitor': NetworkStatusMonitor,
    'color-palette-selector': ColorPaletteSelector,
    'dev-tools': DevTools,
    'package-manager-pro': PackageManagerPro,
    'vm-manager': VMManager,
    'system-backup': SystemBackup,
    // Future apps
    'music-player': () => <div className="h-full flex items-center justify-center text-muted-foreground"><div className="text-center"><i className="fas fa-music text-4xl mb-4 opacity-50"></i><h3 className="text-lg font-medium mb-2">Music Player</h3><p className="text-sm">Coming Soon</p></div></div>,
    'video-player': () => <div className="h-full flex items-center justify-center text-muted-foreground"><div className="text-center"><i className="fas fa-play-circle text-4xl mb-4 opacity-50"></i><h3 className="text-lg font-medium mb-2">Video Player</h3><p className="text-sm">Coming Soon</p></div></div>,
    'code-editor': () => <div className="h-full flex items-center justify-center text-muted-foreground"><div className="text-center"><i className="fas fa-code text-4xl mb-4 opacity-50"></i><h3 className="text-lg font-medium mb-2">Code Editor</h3><p className="text-sm">Coming Soon</p></div></div>
  };
  
  return componentMap[appId] || (() => <div className="h-full flex items-center justify-center text-muted-foreground"><div className="text-center"><i className="fas fa-question-circle text-4xl mb-4 opacity-50"></i><h3 className="text-lg font-medium mb-2">Application Not Found</h3><p className="text-sm">App ID: {appId}</p></div></div>);
};

const appConfigs: AppConfig[] = [
  {
    id: 'terminal',
    name: 'Terminal',
    icon: 'fas fa-terminal text-green-500',
    component: Terminal
  },
  {
    id: 'browser',
    name: 'Web Browser',
    icon: 'fas fa-globe text-blue-500',
    component: Browser
  },
  {
    id: 'package-manager',
    name: 'App Store',
    icon: 'fas fa-shopping-bag text-blue-500',
    component: AppStore
  },
  {
    id: 'file-manager',
    name: 'File Manager',
    icon: 'fas fa-folder text-yellow-500',
    component: FileManager
  },
  {
    id: 'text-editor',
    name: 'Text Editor',
    icon: 'fas fa-file-alt text-blue-500',
    component: TextEditor
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: 'fas fa-calculator text-gray-700',
    component: Calculator
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: 'fas fa-cog text-gray-600',
    component: Settings
  }
];

interface WindowManagerProps {
  onWindowsChange: (windows: any[]) => void;
  onActiveWindowChange: (windowId: string | null) => void;
  openApp: string | null;
  onAppOpened: () => void;
  onShutdown?: () => void;
  onRestart?: () => void;
  onLogout?: () => void;
}

export const WindowManager: FC<WindowManagerProps> = ({
  onWindowsChange,
  onActiveWindowChange,
  openApp,
  onAppOpened,
  onShutdown,
  onRestart,
  onLogout
}) => {
  const {
    windows,
    activeWindowId,
    dragState,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    moveWindow,
    startDrag,
    endDrag,
    createWindow
  } = useWindowManager();

  // Remove problematic effects causing infinite loops
  // useEffect(() => {
  //   onWindowsChange(windows);
  // }, [windows]);

  // useEffect(() => {
  //   onActiveWindowChange(activeWindowId);
  // }, [activeWindowId]);

  useEffect(() => {
    if (openApp) {
      console.log('WindowManager received openApp:', openApp);
      console.log('Available appConfigs:', appConfigs.map(app => app.id));
      
      const appConfig = appConfigs.find(app => app.id === openApp);
      if (appConfig) {
        console.log('Found appConfig for:', openApp);
        playSounds.windowOpen();
        createWindow(appConfig.id, appConfig.name, appConfig.icon);
      } else {
        console.log('No appConfig found, checking component map for:', openApp);
        // Check if we have a component for this app
        const AppComponent = getAppComponent(openApp);
        if (AppComponent && typeof AppComponent === 'function') {
          console.log('Found component for:', openApp);
          playSounds.windowOpen();
          createWindow(openApp, openApp.charAt(0).toUpperCase() + openApp.slice(1), 'fas fa-app');
        } else {
          console.log('No component found for:', openApp);
          // Handle dynamically installed apps
          const stored = localStorage.getItem('installedApps');
          if (stored) {
            const installedApps = JSON.parse(stored);
            const installedApp = installedApps.find((app: any) => app.id === openApp);
            if (installedApp) {
              console.log('Found installed app:', openApp);
              playSounds.windowOpen();
              createWindow(installedApp.id, installedApp.name, installedApp.icon);
            } else {
              console.log('App not found anywhere:', openApp);
            }
          }
        }
      }
      onAppOpened();
    }
  }, [openApp, onAppOpened, createWindow]);

  const handleDrag = (x: number, y: number) => {
    if (dragState.isDragging && dragState.windowId) {
      moveWindow(dragState.windowId, x, y);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {windows.map((window) => {
        const appConfig = appConfigs.find(app => app.id === window.app);
        let AppComponent;
        
        if (appConfig) {
          AppComponent = appConfig.component;
        } else {
          // Use dynamic component for installed apps
          AppComponent = getAppComponent(window.app);
        }

        return (
          <div key={window.id} className="pointer-events-auto">
            <Window
              window={window}
              isActive={activeWindowId === window.id}
              onClose={() => {
                playSounds.windowClose();
                closeWindow(window.id);
              }}
              onMinimize={() => {
                playSounds.windowMinimize();
                minimizeWindow(window.id);
              }}
              onMaximize={() => {
                playSounds.windowMaximize();
                maximizeWindow(window.id);
              }}
              onFocus={() => {
                playSounds.buttonClick();
                focusWindow(window.id);
              }}
              onDragStart={(offsetX, offsetY) => startDrag(window.id, offsetX, offsetY)}
              onDrag={handleDrag}
              onDragEnd={endDrag}
            >
              {window.app === 'settings' ? (
                <AppComponent 
                  onShutdown={onShutdown}
                  onRestart={onRestart}
                  onLogout={onLogout}
                />
              ) : (
                <AppComponent />
              )}
            </Window>
          </div>
        );
      })}
    </div>
  );
};
