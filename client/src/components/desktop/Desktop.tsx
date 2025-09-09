import { FC, useState, useEffect, useCallback } from 'react';
import { DesktopIcon } from './DesktopIcon';
import { AppFolder } from './AppFolder';
import { FolderManager } from './FolderManager';
import { StartMenu } from './StartMenu';
import { Taskbar } from './Taskbar';
import { AppLauncher } from './AppLauncher';
import { AchievementNotification } from '@/components/apps/AchievementNotification';
import { TourGuide } from '@/components/TourGuide';
import { HelpSystem } from '@/components/HelpSystem';
import { WindowManager } from '@/components/window/WindowManager';
import { WorkspaceManager } from '@/components/WorkspaceManager';
import { FloatingConnectionStatus } from '@/components/ui/connection-status';
import { Button } from '@/components/ui/button';
import { FolderPlus, HelpCircle } from 'lucide-react';

const getDefaultDesktopApps = () => {
  const installationType = localStorage.getItem('webos-installation-type');
  const isArchMode = localStorage.getItem('arch-console-mode') === 'true' || installationType === 'arch';
  
  // Different package managers based on installation type
  const packageManagerApp = isArchMode 
    ? { id: 'arch-package-manager', name: 'Package Manager', icon: 'package', description: 'Arch Linux package manager (pacman)' }
    : { id: 'app-store', name: 'App Store', icon: 'package', description: 'Download and install applications' };
  
  const baseApps = [
    { id: 'browser', name: 'Firefox', icon: 'browser', description: 'firefox | chromium' },
    { id: 'file-manager', name: 'Files', icon: 'folder', description: 'thunar | nautilus' },
    packageManagerApp,
    { id: 'settings', name: 'Settings', icon: 'settings', description: 'arch-config' }
  ];

  // Quick install - limited apps only
  if (installationType === 'quick') {
    return baseApps;
  }
  
  // Custom install or default - full apps
  const apps = [
    { id: 'terminal', name: 'Terminal', icon: 'terminal', description: 'bash | zsh | fish' },
    ...baseApps,
    { id: 'calculator', name: 'Calculator', icon: 'calculator', description: 'galculator | bc' },
    { id: 'performance-monitor', name: 'Performance Monitor', icon: 'activity', description: 'system metrics' },
    { id: 'notepad', name: 'Text Editor', icon: 'text-editor', description: 'vim | nano | gedit' },
    { id: 'system-monitor', name: 'System Monitor', icon: 'cpu', description: 'Advanced system metrics' },
    { id: 'advanced-dashboard', name: 'Command Center', icon: 'activity', description: 'Live data dashboard' },
    { id: 'proxy-test-center', name: 'Proxy Test Center', icon: 'globe', description: 'Advanced proxy system testing' },
    { id: 'cloud-storage', name: 'Cloud Storage', icon: 'cloud', description: 'File sync and backup' },
    { id: 'network-manager', name: 'Network Manager', icon: 'wifi', description: 'Network configuration' },
    { id: 'network-status-monitor', name: 'Network Status', icon: 'activity', description: 'WebSocket connection monitoring' },
    { id: 'color-palette-selector', name: 'Color Themes', icon: 'palette', description: 'Customize interface colors' },
    { id: 'dev-tools', name: 'Developer Tools', icon: 'code', description: 'Debug and development tools' },

    { id: 'vm-manager', name: 'Virtual Machines', icon: 'monitor', description: 'Virtualization management' },
    { id: 'system-backup', name: 'Backup & Recovery', icon: 'shield', description: 'System backup and restore' }
  ];

  // Add Arch-specific apps only if Arch was installed (but not duplicate package manager)
  if (isArchMode) {
    apps.push(
      { id: 'hyprland-config', name: 'Hyprland Config', icon: 'layout', description: 'Wayland compositor configuration' }
    );
  }

  return apps;
};

interface DesktopProps {
  onLogout?: () => void;
  onShutdown?: () => void;
  onRestart?: () => void;
}

export const Desktop: FC<DesktopProps> = ({ onLogout, onShutdown, onRestart }) => {
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [windows, setWindows] = useState<any[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [openApp, setOpenApp] = useState<string | null>(null);
  const [wallpaper, setWallpaper] = useState(() => {
    const isCorrupted = localStorage.getItem('arch-desktop-corrupted') === 'true';
    if (isCorrupted) return 'corrupted';
    const saved = localStorage.getItem('webos-wallpaper');
    return saved || 'default';
  });
  const [showIcons, setShowIcons] = useState(() => {
    const saved = localStorage.getItem('webos-show-icons');
    return saved !== 'false';
  });
  const [activeWorkspace, setActiveWorkspace] = useState(1);
  const [desktopApps, setDesktopApps] = useState(() => getDefaultDesktopApps());
  const [installedApps, setInstalledApps] = useState<any[]>([]);
  const [showAppLauncher, setShowAppLauncher] = useState(false);
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggedApp, setDraggedApp] = useState<string | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);
  const [appUsageStats, setAppUsageStats] = useState<any>({});
  const [showTour, setShowTour] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShutdown, setShowShutdown] = useState(false);
  const [tourType, setTourType] = useState<'welcome' | 'features' | 'advanced'>('welcome');
  

  // Load installed apps and icon positions on mount
  useEffect(() => {
    const loadInstalledApps = () => {
      const stored = localStorage.getItem('desktop-apps');
      if (stored) {
        const apps = JSON.parse(stored);
        setInstalledApps(apps);
        
        // Combine default apps with installed apps
        const defaultApps = getDefaultDesktopApps();
        const allApps = [...defaultApps, ...apps];
        // Remove duplicates based on app id
        const uniqueApps = allApps.filter((app: any, index: number, self: any[]) => 
          index === self.findIndex((a: any) => a.id === app.id)
        );
        setDesktopApps(uniqueApps);
      }
    };

    const loadIconPositions = () => {
      const stored = localStorage.getItem('webos-icon-positions');
      if (stored) {
        setIconPositions(JSON.parse(stored));
      } else {
        // Initialize default grid positions with improved spacing
        const defaultPositions: Record<string, { x: number; y: number }> = {};
        const ICON_WIDTH = 80;
        const ICON_HEIGHT = 100;
        const GRID_MARGIN_X = 20;
        const GRID_MARGIN_Y = 20;
        const MAX_COLUMNS = 10;
        
        getDefaultDesktopApps().forEach((app: any, index: number) => {
          const row = Math.floor(index / MAX_COLUMNS);
          const col = index % MAX_COLUMNS;
          defaultPositions[app.id] = {
            x: GRID_MARGIN_X + col * ICON_WIDTH,
            y: GRID_MARGIN_Y + row * ICON_HEIGHT
          };
        });
        setIconPositions(defaultPositions);
        localStorage.setItem('webos-icon-positions', JSON.stringify(defaultPositions));
      }
    };

    const loadFolders = () => {
      const stored = localStorage.getItem('webos-folders');
      if (stored) {
        setFolders(JSON.parse(stored));
      } else {
        // No default folders - clean desktop
        setFolders([]);
      }
    };

    const loadAchievements = () => {
      const stored = localStorage.getItem('webos-achievements');
      const storedStats = localStorage.getItem('webos-usage-stats');
      
      if (stored) {
        setAchievements(JSON.parse(stored));
      } else {
        // Initialize achievements
        const initialAchievements = [
          { id: 'first-launch', name: 'Welcome to WebOS', description: 'Launch your first application', icon: 'fas fa-rocket', current: 0, target: 1, unlocked: false, rarity: 'common' },
          { id: 'app-explorer', name: 'App Explorer', description: 'Launch 5 different applications', icon: 'fas fa-compass', current: 0, target: 5, unlocked: false, rarity: 'common' },
          { id: 'power-user', name: 'Power User', description: 'Launch 25 applications total', icon: 'fas fa-bolt', current: 0, target: 25, unlocked: false, rarity: 'rare' },
          { id: 'terminal-master', name: 'Terminal Master', description: 'Use the terminal 10 times', icon: 'fas fa-terminal', current: 0, target: 10, unlocked: false, rarity: 'rare' },
          { id: 'package-collector', name: 'Software Collector', description: 'Install 5 applications', icon: 'fas fa-download', current: 0, target: 5, unlocked: false, rarity: 'rare' },
          { id: 'organizer', name: 'Desktop Organizer', description: 'Create your first folder', icon: 'fas fa-folder', current: 0, target: 1, unlocked: false, rarity: 'common' },
          { id: 'speed-launcher', name: 'Speed Launcher', description: 'Use quick launch 10 times', icon: 'fas fa-search', current: 0, target: 10, unlocked: false, rarity: 'rare' },
          { id: 'multitasker', name: 'Multitasker', description: 'Have 5 applications open simultaneously', icon: 'fas fa-layer-group', current: 0, target: 5, unlocked: false, rarity: 'epic' }
        ];
        setAchievements(initialAchievements);
        localStorage.setItem('webos-achievements', JSON.stringify(initialAchievements));
      }

      if (storedStats) {
        setAppUsageStats(JSON.parse(storedStats));
      }
    };

    loadInstalledApps();
    loadIconPositions();
    loadFolders();
    loadAchievements();

    // Listen for desktop refresh events from package manager
    const handleDesktopRefresh = () => {
      loadInstalledApps();
    };

    window.addEventListener('desktop-refresh', handleDesktopRefresh);

    // Check if user should see welcome tour
    const hasCompletedWelcomeTour = localStorage.getItem('webos-tour-welcome-completed');
    const isFirstTime = localStorage.getItem('webos-first-time-user') !== 'false';
    
    if (isFirstTime && !hasCompletedWelcomeTour) {
      setTimeout(() => {
        setShowTour(true);
        setTourType('welcome');
      }, 2000); // Show tour after 2 seconds
    }

    // Listen for app installation updates
    const handleAppsUpdated = (event: CustomEvent) => {
      const apps = event.detail;
      setInstalledApps(apps);
      const defaultApps = getDefaultDesktopApps();
      const allApps = [...defaultApps, ...apps];
      setDesktopApps(allApps);

      // Improved positioning for new apps using stable grid system
      const currentPositions = { ...iconPositions };
      const ICON_WIDTH = 80;
      const ICON_HEIGHT = 100; 
      const GRID_MARGIN_X = 20;
      const GRID_MARGIN_Y = 20;
      const MAX_COLUMNS = 10; // More columns for better layout
      
      // Create a grid occupancy map to avoid conflicts
      const occupiedPositions = new Set();
      Object.values(currentPositions).forEach(pos => {
        const gridX = Math.round((pos.x - GRID_MARGIN_X) / ICON_WIDTH);
        const gridY = Math.round((pos.y - GRID_MARGIN_Y) / ICON_HEIGHT);
        occupiedPositions.add(`${gridX},${gridY}`);
      });
      
      // Find next available grid positions for new apps
      let currentRow = 0;
      let currentCol = 0;
      
      apps.forEach((app: any) => {
        if (!currentPositions[app.id]) {
          // Find next available position
          while (occupiedPositions.has(`${currentCol},${currentRow}`)) {
            currentCol++;
            if (currentCol >= MAX_COLUMNS) {
              currentCol = 0;
              currentRow++;
            }
          }
          
          const x = GRID_MARGIN_X + (currentCol * ICON_WIDTH);
          const y = GRID_MARGIN_Y + (currentRow * ICON_HEIGHT);
          
          currentPositions[app.id] = { x, y };
          occupiedPositions.add(`${currentCol},${currentRow}`);
          
          // Move to next position for next app
          currentCol++;
          if (currentCol >= MAX_COLUMNS) {
            currentCol = 0;
            currentRow++;
          }
        }
      });

      setIconPositions(currentPositions);
      localStorage.setItem('webos-icon-positions', JSON.stringify(currentPositions));
    };

    window.addEventListener('appsUpdated', handleAppsUpdated as EventListener);

    return () => {
      window.removeEventListener('appsUpdated', handleAppsUpdated as EventListener);
      window.removeEventListener('desktop-refresh', handleDesktopRefresh);
    };
  }, []);

  // App launch handler
  const handleAppLaunch = useCallback((appId: string) => {
    console.log('handleAppLaunch called with:', appId);
    
    // Check if desktop is corrupted due to missing dependencies
    const isCorrupted = localStorage.getItem('arch-desktop-corrupted') === 'true';
    if (isCorrupted) {
      // Show error dialog instead of launching app
      alert(`Application Error\n\nERROR`);
      return;
    }
    
    setOpenApp(appId);
    const now = new Date();
    const newStats = { ...appUsageStats };
    
    if (!newStats[appId]) {
      newStats[appId] = {
        launches: 0,
        totalTime: 0,
        firstLaunch: now,
        streakDays: 1
      };
    }
    
    newStats[appId].launches += 1;
    newStats[appId].lastLaunch = now;
    
    setAppUsageStats(newStats);
    localStorage.setItem('webos-usage-stats', JSON.stringify(newStats));

    // Check achievements
    let newAchievements = [...achievements];
    let unlockedAchievement = null;
    
    // First launch
    const totalLaunches = Object.values(newStats).reduce((total: number, app: any) => total + app.launches, 0);
    if (totalLaunches === 1) {
      const achievement = newAchievements.find(a => a.id === 'first-launch');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.current = 1;
        achievement.unlockedAt = now;
        unlockedAchievement = achievement;
      }
    }
    
    // Update other achievements
    const uniqueAppsUsed = Object.keys(newStats).length;
    const appExplorer = newAchievements.find(a => a.id === 'app-explorer');
    if (appExplorer) {
      appExplorer.current = uniqueAppsUsed;
      if (uniqueAppsUsed >= 5 && !appExplorer.unlocked) {
        appExplorer.unlocked = true;
        appExplorer.unlockedAt = now;
        unlockedAchievement = appExplorer;
      }
    }
    
    setAchievements(newAchievements);
    localStorage.setItem('webos-achievements', JSON.stringify(newAchievements));
    
    if (unlockedAchievement) {
      setCurrentAchievement(unlockedAchievement);
    }
  }, [appUsageStats, achievements]);

  // Handle quick launch events from taskbar
  useEffect(() => {
    const handleQuickLaunch = (event: CustomEvent) => {
      const appId = event.detail;
      handleAppLaunch(appId);
    };

    window.addEventListener('openApp', handleQuickLaunch as EventListener);

    return () => {
      window.removeEventListener('openApp', handleQuickLaunch as EventListener);
    };
  }, [handleAppLaunch]);

  // Additional achievement tracking for other components
  const trackAchievement = useCallback((achievementId: string, increment = 1) => {
    const now = new Date();
    let newAchievements = [...achievements];
    let unlockedAchievement = null;
    
    const achievement = newAchievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
      achievement.current = Math.min(achievement.current + increment, achievement.target);
      if (achievement.current >= achievement.target) {
        achievement.unlocked = true;
        achievement.unlockedAt = now;
        unlockedAchievement = achievement;
      }
    }
    
    setAchievements(newAchievements);
    localStorage.setItem('webos-achievements', JSON.stringify(newAchievements));
    
    if (unlockedAchievement) {
      setCurrentAchievement(unlockedAchievement);
    }
  }, [achievements]);

  const trackEvent = useCallback((eventType: string, data?: any) => {
    let newAchievements = [...achievements];
    let unlockedAchievement = null;
    const now = new Date();
    
    switch (eventType) {
      case 'package-installed':
        const installCount = parseInt(localStorage.getItem('webos-packages-installed') || '0') + 1;
        localStorage.setItem('webos-packages-installed', installCount.toString());
        const packageCollector = newAchievements.find(a => a.id === 'package-collector');
        if (packageCollector) {
          packageCollector.current = installCount;
          if (installCount >= 5 && !packageCollector.unlocked) {
            packageCollector.unlocked = true;
            packageCollector.unlockedAt = now;
            unlockedAchievement = packageCollector;
          }
        }
        break;
        
      case 'folder-created':
        const organizer = newAchievements.find(a => a.id === 'organizer');
        if (organizer && !organizer.unlocked) {
          organizer.unlocked = true;
          organizer.current = 1;
          organizer.unlockedAt = now;
          unlockedAchievement = organizer;
        }
        break;
        
      case 'quick-launch-used':
        const quickLaunchCount = parseInt(localStorage.getItem('webos-quick-launch-count') || '0') + 1;
        localStorage.setItem('webos-quick-launch-count', quickLaunchCount.toString());
        const speedLauncher = newAchievements.find(a => a.id === 'speed-launcher');
        if (speedLauncher) {
          speedLauncher.current = quickLaunchCount;
          if (quickLaunchCount >= 10 && !speedLauncher.unlocked) {
            speedLauncher.unlocked = true;
            speedLauncher.unlockedAt = now;
            unlockedAchievement = speedLauncher;
          }
        }
        break;
        
      case 'windows-count':
        if (data?.count >= 5) {
          const multitasker = newAchievements.find(a => a.id === 'multitasker');
          if (multitasker && !multitasker.unlocked) {
            multitasker.unlocked = true;
            multitasker.current = data.count;
            multitasker.unlockedAt = now;
            unlockedAchievement = multitasker;
          }
        }
        break;
    }
    
    setAchievements(newAchievements);
    localStorage.setItem('webos-achievements', JSON.stringify(newAchievements));
    
    if (unlockedAchievement) {
      setCurrentAchievement(unlockedAchievement);
    }
  }, [achievements]);

  const handleOpenApp = useCallback((appId: string) => {
    handleAppLaunch(appId);
  }, [handleAppLaunch]);

  const handleAppOpened = useCallback(() => {
    setOpenApp(null);
  }, []);

  const handleStartMenuToggle = useCallback(() => {
    setShowStartMenu(!showStartMenu);
  }, [showStartMenu]);

  const handleStartMenuClose = useCallback(() => {
    setShowStartMenu(false);
  }, []);

  const handleWindowsChange = useCallback((windows: any[]) => {
    setWindows(windows);
    // Track multitasker achievement
    trackEvent('windows-count', { count: windows.length });
  }, [trackEvent]);

  const handleActiveWindowChange = useCallback((windowId: string | null) => {
    setActiveWindowId(windowId);
  }, []);

  const handleStartTour = useCallback((type: 'welcome' | 'features' | 'advanced') => {
    setTourType(type);
    setShowTour(true);
    setShowHelp(false);
  }, []);

  const handleTourComplete = useCallback(() => {
    setShowTour(false);
    localStorage.setItem('webos-first-time-user', 'false');
  }, []);

  const handleTourSkip = useCallback(() => {
    setShowTour(false);
    localStorage.setItem('webos-first-time-user', 'false');
  }, []);

  // Drag and drop handlers for desktop icons
  const handleIconDragStart = useCallback((appId: string, e: React.DragEvent) => {
    setDraggedApp(appId);
  }, []);

  const handleIconDragEnd = useCallback(() => {
    setDraggedApp(null);
  }, []);

  const handleDesktopDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (draggedApp) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - 40; // Center the icon
      const y = e.clientY - rect.top - 40;
      
      // Use the same grid system as the automatic positioning
      const ICON_WIDTH = 80;
      const ICON_HEIGHT = 100;
      const GRID_MARGIN_X = 20;
      const GRID_MARGIN_Y = 20;
      
      // Calculate grid position
      const gridX = Math.round((x - GRID_MARGIN_X) / ICON_WIDTH);
      const gridY = Math.round((y - GRID_MARGIN_Y) / ICON_HEIGHT);
      
      // Ensure minimum grid positions
      const clampedGridX = Math.max(0, gridX);
      const clampedGridY = Math.max(0, gridY);
      
      // Convert back to pixel positions
      const snappedX = GRID_MARGIN_X + (clampedGridX * ICON_WIDTH);
      const snappedY = GRID_MARGIN_Y + (clampedGridY * ICON_HEIGHT);
      
      // Ensure icon stays within bounds
      const maxX = rect.width - 80;
      const maxY = rect.height - 120; // Account for taskbar
      const finalX = Math.max(0, Math.min(snappedX, maxX));
      const finalY = Math.max(0, Math.min(snappedY, maxY));
      
      setIconPositions(prev => {
        const updated = {
          ...prev,
          [draggedApp]: { x: finalX, y: finalY }
        };
        localStorage.setItem('webos-icon-positions', JSON.stringify(updated));
        return updated;
      });
    }
  }, [draggedApp]);

  const handleDesktopDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  }, []);

  // Folder management functions
  const handleCreateFolder = useCallback((folderData: any) => {
    const newFolder = {
      id: `folder-${Date.now()}`,
      ...folderData
    };
    
    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    localStorage.setItem('webos-folders', JSON.stringify(updatedFolders));

    // Add position for the new folder
    const currentPositions = { ...iconPositions };
    let nextY = 32;
    let nextX = 300; // Start folders to the right of regular apps
    
    // Find available position
    Object.values(currentPositions).forEach(pos => {
      if (pos.x >= 300 && pos.y >= nextY) {
        nextY = pos.y + 104;
      }
    });

    currentPositions[newFolder.id] = { x: nextX, y: nextY };
    setIconPositions(currentPositions);
    localStorage.setItem('webos-icon-positions', JSON.stringify(currentPositions));
  }, [folders, iconPositions]);

  const handleUpdateFolder = useCallback((folderId: string, updates: any) => {
    const updatedFolders = folders.map(folder => 
      folder.id === folderId ? { ...folder, ...updates } : folder
    );
    setFolders(updatedFolders);
    localStorage.setItem('webos-folders', JSON.stringify(updatedFolders));
  }, [folders]);

  const handleDeleteFolder = useCallback((folderId: string) => {
    const updatedFolders = folders.filter(folder => folder.id !== folderId);
    setFolders(updatedFolders);
    localStorage.setItem('webos-folders', JSON.stringify(updatedFolders));
    
    // Remove folder position
    const updatedPositions = { ...iconPositions };
    delete updatedPositions[folderId];
    setIconPositions(updatedPositions);
    localStorage.setItem('webos-icon-positions', JSON.stringify(updatedPositions));
  }, [folders, iconPositions]);

  // Get apps that are not in folders
  const unorganizedApps = desktopApps.filter(app => 
    !folders.some(folder => folder.apps.some((folderApp: any) => folderApp.id === app.id))
  );

  const handleWindowRestore = useCallback((windowId: string) => {
    // This will be handled by the WindowManager
  }, []);

  const handleWindowFocus = useCallback((windowId: string) => {
    // This will be handled by the WindowManager
  }, []);

  // Close start menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#start-menu') && !target.closest('#start-button')) {
        setShowStartMenu(false);
      }
    };

    if (showStartMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showStartMenu]);

  // Keyboard shortcuts and event listeners
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // App Launcher shortcuts: Cmd+Space (Mac) or Ctrl+Space (Windows/Linux)
      if (event.key === ' ' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setShowAppLauncher(true);
      }
      
      // Also support Alt+Space for quick launch
      if (event.key === ' ' && event.altKey) {
        event.preventDefault();
        setShowAppLauncher(true);
      }
      
      if (event.key === 'Escape') {
        setShowStartMenu(false);
        setShowAppLauncher(false);
      }
    };

    const handleWallpaperChange = (event: CustomEvent) => {
      setWallpaper(event.detail.wallpaper);
    };

    const handleIconToggle = (event: CustomEvent) => {
      setShowIcons(event.detail.show);
    };

    const handleOpenAppEvent = (event: CustomEvent) => {
      const appId = event.detail;
      console.log('Desktop received openApp event:', appId);
      handleAppLaunch(appId);
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wallpaper-change', handleWallpaperChange as EventListener);
    window.addEventListener('desktop-icons-toggle', handleIconToggle as EventListener);
    window.addEventListener('openApp', handleOpenAppEvent as EventListener);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wallpaper-change', handleWallpaperChange as EventListener);
      window.removeEventListener('desktop-icons-toggle', handleIconToggle as EventListener);
      window.removeEventListener('openApp', handleOpenAppEvent as EventListener);
    };
  }, [handleAppLaunch]);

  const getWallpaperClass = () => {
    switch (wallpaper) {
      case 'corrupted':
        return 'corrupted-wallpaper';
      case 'terminal':
        return 'bg-gradient-to-br from-green-900 to-black';
      case 'code':
        return 'bg-gradient-to-br from-blue-900 to-indigo-900';
      case 'matrix':
        return 'bg-gradient-to-br from-black to-green-800';
      case 'cyber':
        return 'bg-gradient-to-br from-purple-900 to-black';
      case 'sunset':
        return 'bg-gradient-to-br from-orange-600 to-red-800';
      case 'ocean':
        return 'bg-gradient-to-br from-blue-400 to-blue-800';
      case 'forest':
        return 'bg-gradient-to-br from-green-600 to-green-900';
      case 'fire':
        return 'bg-gradient-to-br from-red-500 to-orange-700';
      case 'cosmic':
        return 'bg-gradient-to-br from-indigo-600 to-purple-800';
      case 'dawn':
        return 'bg-gradient-to-br from-pink-400 to-purple-600';
      case 'midnight':
        return 'bg-gradient-to-br from-gray-900 to-blue-900';
      case 'custom':
        return 'bg-transparent';
      default:
        return 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900';
    }
  };

  const getCustomWallpaperStyle = () => {
    if (wallpaper === 'custom') {
      const customImage = localStorage.getItem('webos-custom-wallpaper');
      if (customImage) {
        return {
          backgroundImage: `url(${customImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      }
    }
    return {};
  };

  return (
    <div className="h-screen bg-background font-mono overflow-hidden relative">
      {/* Dynamic wallpaper */}
      <div className={`absolute inset-0 ${getWallpaperClass()}`} style={getCustomWallpaperStyle()}>
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="archGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(115, 176, 219, 0.3)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#archGrid)" />
          </svg>
        </div>
        {/* Arch logo subtle background */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
          <svg width="300" height="300" viewBox="0 0 64 64" className="text-primary">
            <path fill="currentColor" d="M32 2L4 62h56L32 2zm0 8.5L54.2 58H9.8L32 10.5z"/>
          </svg>
        </div>
      </div>

      {/* Desktop Icons */}
      {showIcons && (
        <div 
          className="absolute inset-0 z-10 desktop-area"
          onDrop={handleDesktopDrop}
          onDragOver={handleDesktopDragOver}
        >
          {/* Render unorganized apps */}
          {unorganizedApps.map((app) => {
            const position = iconPositions[app.id] || { x: 32, y: 32 };
            return (
              <DesktopIcon
                key={app.id}
                appId={app.id}
                icon={app.icon}
                label={app.name}
                position={position}
                onDoubleClick={() => handleOpenApp(app.id)}
                onDragStart={handleIconDragStart}
                onDragEnd={handleIconDragEnd}
                isDragging={draggedApp === app.id}
              />
            );
          })}

          {/* Render folders */}
          {folders.map((folder) => {
            const position = iconPositions[folder.id] || { x: 300, y: 32 };
            return (
              <AppFolder
                key={folder.id}
                folder={folder}
                position={position}
                onDoubleClick={() => {}}
                onDragStart={handleIconDragStart}
                onDragEnd={handleIconDragEnd}
                onUpdateFolder={handleUpdateFolder}
                onLaunchApp={handleOpenApp}
                isDragging={draggedApp === folder.id}
              />
            );
          })}
        </div>
      )}

      {/* Folder Management Button */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          onClick={() => setShowHelp(true)}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
          title="Help & Tours"
        >
          <HelpCircle className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFolderManager(true)}
          className="bg-background/80 backdrop-blur-sm organize-button"
        >
          <FolderPlus className="w-4 h-4 mr-2" />
          Organize Apps
        </Button>
      </div>

      {/* Windows */}
      <WindowManager
        onWindowsChange={handleWindowsChange}
        onActiveWindowChange={handleActiveWindowChange}
        openApp={openApp}
        onAppOpened={handleAppOpened}
        onShutdown={onShutdown}
        onRestart={onRestart}
        onLogout={onLogout}
      />

      {/* Start Menu */}
      <div id="start-menu">
        <StartMenu
          isOpen={showStartMenu}
          onClose={handleStartMenuClose}
          onOpenApp={handleOpenApp}
        />
      </div>

      {/* Workspace Manager */}
      <WorkspaceManager
        windows={windows}
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={setActiveWorkspace}
      />

      {/* Taskbar */}
      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onStartMenuToggle={handleStartMenuToggle}
        onWindowRestore={handleWindowRestore}
        onWindowFocus={handleWindowFocus}
        onQuickLaunch={() => setShowAppLauncher(true)}
        onOpenSettings={() => handleOpenApp('settings')}
        onOpenPowerMenu={() => onShutdown && onShutdown()}
        onToggleVolume={() => {}}
        onLogout={onLogout}
      />

      {/* App Launcher */}
      <AppLauncher
        isOpen={showAppLauncher}
        onClose={() => setShowAppLauncher(false)}
        onLaunchApp={handleOpenApp}
      />

      {/* Folder Manager */}
      <FolderManager
        isOpen={showFolderManager}
        onClose={() => setShowFolderManager(false)}
        availableApps={desktopApps}
        folders={folders}
        onCreateFolder={handleCreateFolder}
        onUpdateFolder={handleUpdateFolder}
        onDeleteFolder={handleDeleteFolder}
      />

      {/* Achievement Notification */}
      <AchievementNotification
        achievement={currentAchievement}
        onClose={() => setCurrentAchievement(null)}
      />

      {/* Tour Guide */}
      <TourGuide
        isActive={showTour}
        onComplete={handleTourComplete}
        onSkip={handleTourSkip}
        tourType={tourType}
      />

      {/* Help System */}
      <HelpSystem
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        onStartTour={handleStartTour}
      />


      {/* Floating Connection Status */}
      <FloatingConnectionStatus position="top-right" />
    </div>
  );
};
