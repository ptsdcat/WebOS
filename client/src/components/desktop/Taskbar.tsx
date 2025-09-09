import { FC, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { WindowState } from '@/types/os';
import { Volume2, VolumeX, Wifi, Battery, Settings, Search, Monitor, Power } from 'lucide-react';
import { soundManager } from '@/lib/soundManager';

interface TaskbarProps {
  windows: WindowState[];
  activeWindowId: string | null;
  onStartMenuToggle: () => void;
  onWindowRestore: (windowId: string) => void;
  onWindowFocus: (windowId: string) => void;
  onQuickLaunch?: () => void;
  onLogout?: () => void;
  onOpenSettings?: () => void;
  onOpenPowerMenu?: () => void;
  onToggleVolume?: () => void;
}

export const Taskbar: FC<TaskbarProps> = ({ 
  windows, 
  activeWindowId, 
  onStartMenuToggle, 
  onWindowRestore,
  onWindowFocus,
  onQuickLaunch,
  onOpenSettings,
  onOpenPowerMenu,
  onToggleVolume
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSoundEnabled, setIsSoundEnabled] = useState(soundManager.isEnabled());
  const [batteryLevel, setBatteryLevel] = useState(75);
  const [isSystemTrayOpen, setIsSystemTrayOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate battery drain
      setBatteryLevel(prev => Math.max(20, prev - 0.01));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVolumeToggle = () => {
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    soundManager.setEnabled(newState);
    soundManager.play('click');
    if (onToggleVolume) onToggleVolume();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getAppIcon = (app: string) => {
    const icons = {
      'terminal': '💻',
      'browser': '🌐',
      'file-manager': '📁',
      'text-editor': '📝',
      'notepad': '📝',
      'calculator': '🧮',
      'calculator-pro': '🧮',
      'settings': '⚙️',
      'image-viewer': '🖼️',
      'email': '📧',
      'calendar': '📅',
      'achievements': '🏆',
      'ide': '💻',
      'package-manager': '📦',
      'download-manager': '⬇️',
      'account-manager': '👤'
    };
    return icons[app as keyof typeof icons] || '🪟';
  };

  const getAppName = (app: string) => {
    const names = {
      'terminal': 'Terminal',
      'browser': 'Browser',
      'file-manager': 'Files',
      'text-editor': 'Editor',
      'notepad': 'Notepad',
      'calculator': 'Calculator',
      'calculator-pro': 'Calculator Pro',
      'settings': 'Settings',
      'image-viewer': 'Image Viewer',
      'email': 'Email',
      'calendar': 'Calendar',
      'achievements': 'Achievements',
      'ide': 'IDE',
      'package-manager': 'Package Manager',
      'download-manager': 'Downloads',
      'account-manager': 'Accounts'
    };
    return names[app as keyof typeof names] || app;
  };

  const getBatteryIcon = () => {
    if (batteryLevel > 80) return '🔋';
    if (batteryLevel > 60) return '🔋';
    if (batteryLevel > 40) return '🔋';
    if (batteryLevel > 20) return '🪫';
    return '🪫';
  };

  const getBatteryColor = () => {
    if (batteryLevel > 50) return 'text-green-500';
    if (batteryLevel > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-blue-950/95 via-blue-900/95 to-blue-950/95 backdrop-blur-sm border-t border-blue-400/30 shadow-2xl taskbar">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center space-x-2">
          {/* Start Button - Enhanced WebOS Logo */}
          <Button 
            variant="ghost"
            size="sm"
            className="flex items-center justify-center w-10 h-10 rounded hover:bg-cyan-500/20 transition-all duration-200 transform hover:scale-105 border border-blue-400/20"
            onClick={() => {
              onStartMenuToggle();
              soundManager.play('open');
            }}
            title="Arch Linux Menu"
          >
            <div className="relative">
              <svg width="22" height="22" viewBox="0 0 64 64" className="text-cyan-400 drop-shadow-lg">
                <path fill="currentColor" d="M32 2L4 62h56L32 2zm0 8.5L54.2 58H9.8L32 10.5z"/>
              </svg>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
          </Button>
          
          {/* Quick Launch Icons */}
          <div className="flex items-center space-x-1 pl-2 border-l border-blue-400/30">
            {/* Terminal Quick Launch */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded text-blue-200 hover:text-cyan-100 hover:bg-blue-700/50 transition-all duration-200 transform hover:scale-105 border border-blue-400/20"
              onClick={() => {
                const event = new CustomEvent('openApp', { detail: 'terminal' });
                window.dispatchEvent(event);
                soundManager.play('open');
              }}
              title="pacman -S terminal"
            >
              <span className="text-sm">💻</span>
            </Button>

            {/* Browser Quick Launch */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded text-blue-200 hover:text-cyan-100 hover:bg-blue-700/50 transition-all duration-200 transform hover:scale-105 border border-blue-400/20"
              onClick={() => {
                const event = new CustomEvent('openApp', { detail: 'browser' });
                window.dispatchEvent(event);
                soundManager.play('open');
              }}
              title="firefox | chromium"
            >
              <span className="text-sm">🌐</span>
            </Button>

            {/* File Manager Quick Launch */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded text-blue-200 hover:text-cyan-100 hover:bg-blue-700/50 transition-all duration-200 transform hover:scale-105 border border-blue-400/20"
              onClick={() => {
                const event = new CustomEvent('openApp', { detail: 'file-manager' });
                window.dispatchEvent(event);
                soundManager.play('open');
              }}
              title="thunar | nautilus"
            >
              <span className="text-sm">📁</span>
            </Button>

            {/* Calculator Quick Launch */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded text-blue-200 hover:text-cyan-100 hover:bg-blue-700/50 transition-all duration-200 transform hover:scale-105 border border-blue-400/20"
              onClick={() => {
                const event = new CustomEvent('openApp', { detail: 'calculator' });
                window.dispatchEvent(event);
                soundManager.play('open');
              }}
              title="galculator | bc"
            >
              <span className="text-sm">🧮</span>
            </Button>

            {/* Search/Quick Launch */}
            {onQuickLaunch && (
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded text-blue-200 hover:text-cyan-100 hover:bg-blue-700/50 transition-all duration-200 transform hover:scale-105 border border-blue-400/20"
                onClick={() => {
                  onQuickLaunch();
                  soundManager.play('click');
                }}
                title="dmenu | rofi (Ctrl+Space)"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Running Apps */}
          <div className="flex items-center space-x-1 pl-2 border-l border-blue-400/30">
            {windows.map((window) => (
              <Button
                key={window.id}
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-2 px-3 py-2 rounded text-xs transition-all duration-200 transform hover:scale-105 border border-blue-400/20 ${
                  activeWindowId === window.id && !window.minimized
                    ? 'bg-cyan-500/30 text-cyan-100 shadow-lg border-cyan-400/60 shadow-cyan-500/20'
                    : 'text-blue-200 hover:text-cyan-100 hover:bg-blue-700/50'
                } ${window.minimized ? 'opacity-60' : ''}`}
                onClick={() => {
                  if (window.minimized) {
                    onWindowRestore(window.id);
                  } else {
                    onWindowFocus(window.id);
                  }
                  soundManager.play('click');
                }}
                title={`${getAppName(window.app)}${window.minimized ? ' (minimized)' : ''}`}
              >
                <span className="text-sm">{getAppIcon(window.app)}</span>
                <span className="hidden sm:inline max-w-20 truncate font-mono text-xs">
                  {getAppName(window.app)}
                </span>
                {window.minimized && <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>}
              </Button>
            ))}
          </div>
        </div>

        {/* System Tray */}
        <div className="flex items-center space-x-2">
          {/* Network Status */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded text-cyan-400 hover:bg-blue-700/50 transition-colors border border-blue-400/20"
            title="networkmanager: connected"
          >
            <Wifi className="h-4 w-4" />
          </Button>

          {/* Volume Control */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded hover:bg-blue-700/50 transition-colors border border-blue-400/20"
            onClick={handleVolumeToggle}
            title={`pulseaudio: ${isSoundEnabled ? 'unmuted' : 'muted'}`}
          >
            {isSoundEnabled ? (
              <Volume2 className="h-4 w-4 text-cyan-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-red-400" />
            )}
          </Button>

          {/* Battery */}
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 rounded hover:bg-blue-700/50 transition-colors border border-blue-400/20 ${getBatteryColor()}`}
            title={`acpi: ${Math.round(batteryLevel)}%`}
          >
            <div className="flex items-center space-x-1">
              <Battery className="h-4 w-4" />
              <span className="text-xs font-mono">{Math.round(batteryLevel)}%</span>
            </div>
          </Button>

          {/* Settings */}
          {onOpenSettings && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded text-blue-300 hover:text-cyan-100 hover:bg-blue-700/50 transition-colors border border-blue-400/20"
              onClick={() => {
                onOpenSettings();
                soundManager.play('click');
              }}
              title="arch-config"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}

          {/* Separator */}
          <div className="w-px h-6 bg-blue-400/30"></div>

          {/* Clock */}
          <Button
            variant="ghost"
            size="sm"
            className="px-3 py-2 rounded text-blue-100 hover:bg-blue-700/50 transition-colors border border-blue-400/20"
            onClick={() => setIsSystemTrayOpen(!isSystemTrayOpen)}
            title="systemctl status"
          >
            <div className="text-right">
              <div className="text-sm font-mono leading-tight">{formatTime(currentTime)}</div>
              <div className="text-xs text-blue-300 leading-tight">{formatDate(currentTime)}</div>
            </div>
          </Button>

          {/* Power Menu */}
          {onOpenPowerMenu && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded text-red-400 hover:text-red-300 hover:bg-blue-700/50 transition-colors border border-blue-400/20"
              onClick={() => {
                onOpenPowerMenu();
                soundManager.play('click');
              }}
              title="systemctl poweroff"
            >
              <Power className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* System Tray Popup */}
      {isSystemTrayOpen && (
        <div className="absolute bottom-12 right-4 w-80 bg-blue-950/95 backdrop-blur-sm border border-blue-400/30 rounded shadow-2xl p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-cyan-100 font-mono"># systemctl status</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSystemTrayOpen(false)}
                className="p-1 h-6 w-6 text-blue-300 hover:text-cyan-100"
              >
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-blue-900/50 rounded border border-blue-400/20 p-2 hover:bg-blue-800/50 transition-colors cursor-pointer">
                <div className="text-blue-300 font-mono">CPU Usage</div>
                <div className="text-cyan-400 font-mono">
                  {Math.floor(Math.random() * 30 + 5)}%
                </div>
              </div>
              <div className="bg-blue-900/50 rounded border border-blue-400/20 p-2 hover:bg-blue-800/50 transition-colors cursor-pointer">
                <div className="text-blue-300 font-mono">Memory</div>
                <div className="text-cyan-400 font-mono">
                  {(Math.random() * 2 + 1.5).toFixed(1)}GB
                </div>
              </div>
              <div className="bg-blue-900/50 rounded border border-blue-400/20 p-2 hover:bg-blue-800/50 transition-colors cursor-pointer">
                <div className="text-blue-300 font-mono">NetworkManager</div>
                <div className="text-cyan-400 font-mono flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse mr-1"></div>
                  Active
                </div>
              </div>
              <div className="bg-blue-900/50 rounded border border-blue-400/20 p-2 hover:bg-blue-800/50 transition-colors cursor-pointer">
                <div className="text-blue-300 font-mono">Uptime</div>
                <div className="text-cyan-400 font-mono">
                  {Math.floor(Date.now() / 1000 / 3600)}h {Math.floor((Date.now() / 1000 % 3600) / 60)}m
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-400/30">
              <div className="text-xs text-blue-300 font-mono">
                $ uname -a<br/>
                Linux archwebos 6.6.8-arch1-1 x86_64 GNU/Linux
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
