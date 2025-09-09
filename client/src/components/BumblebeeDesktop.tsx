import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bug, 
  FileText, 
  Terminal, 
  Settings, 
  LogOut, 
  Grid3X3, 
  Folder,
  Calculator,
  Image,
  Music,
  Video,
  Globe,
  Monitor,
  Wifi,
  Volume2,
  Battery
} from 'lucide-react';
import { BumblebeeTerminal } from './bumblebee-apps/BumblebeeTerminal';
import { BumblebeeFileManager } from './bumblebee-apps/BumblebeeFileManager';
import { BumblebeeBrowser } from './bumblebee-apps/BumblebeeBrowser';
import { BumblebeeTextEditor } from './bumblebee-apps/BumblebeeTextEditor';

interface BumblebeeDesktopProps {
  username: string;
  onLogout: () => void;
  onReturnToWebOS: () => void;
}

export const BumblebeeDesktop: FC<BumblebeeDesktopProps> = ({ 
  username, 
  onLogout, 
  onReturnToWebOS 
}) => {
  const [showApplications, setShowApplications] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [openApps, setOpenApps] = useState<{[key: string]: boolean}>({});

  // Update time every second
  setInterval(() => {
    setTime(new Date().toLocaleTimeString());
  }, 1000);

  const openApp = (appName: string) => {
    setOpenApps(prev => ({ ...prev, [appName]: true }));
    setShowApplications(false);
  };

  const closeApp = (appName: string) => {
    setOpenApps(prev => ({ ...prev, [appName]: false }));
  };

  const applications = [
    { name: 'Files', icon: Folder, category: 'System' },
    { name: 'Terminal', icon: Terminal, category: 'System' },
    { name: 'Text Editor', icon: FileText, category: 'Office' },
    { name: 'Calculator', icon: Calculator, category: 'Utilities' },
    { name: 'Image Viewer', icon: Image, category: 'Graphics' },
    { name: 'Music Player', icon: Music, category: 'Media' },
    { name: 'Video Player', icon: Video, category: 'Media' },
    { name: 'Web Browser', icon: Globe, category: 'Internet' },
    { name: 'Settings', icon: Settings, category: 'System' },
    { name: 'System Monitor', icon: Monitor, category: 'System' }
  ];

  return (
    <div className="h-screen w-full bg-gradient-to-br from-orange-400 via-yellow-500 to-amber-600 relative">
      {/* Desktop Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-12 gap-8 h-full w-full p-8">
          {Array.from({ length: 144 }).map((_, i) => (
            <Bug key={i} className="w-6 h-6 text-orange-800" />
          ))}
        </div>
      </div>

      {/* Top Panel */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-orange-900/80 backdrop-blur-sm border-b border-orange-700/50 flex items-center justify-between px-4 z-50">
        {/* Left Side - Activities */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setShowApplications(!showApplications)}
            className="bg-transparent hover:bg-orange-800/50 text-white px-3 py-1 h-8"
          >
            Activities
          </Button>
        </div>

        {/* Center - Current Time */}
        <div className="text-white font-medium">
          {new Date().toLocaleDateString()} {time}
        </div>

        {/* Right Side - System Indicators */}
        <div className="flex items-center space-x-3 text-white">
          <Wifi className="w-4 h-4" />
          <Volume2 className="w-4 h-4" />
          <Battery className="w-4 h-4" />
          <Button
            onClick={onLogout}
            className="bg-transparent hover:bg-orange-800/50 text-white px-3 py-1 h-8"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Applications Overview */}
      {showApplications && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 pt-12">
          <div className="p-8">
            <h2 className="text-4xl font-bold text-white mb-8 text-center">Applications</h2>
            <div className="grid grid-cols-5 gap-6 max-w-4xl mx-auto">
              {applications.map((app, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all cursor-pointer group"
                  onClick={() => openApp(app.name)}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <app.icon className="w-8 h-8 text-orange-800" />
                    </div>
                    <h3 className="text-white font-medium text-sm">{app.name}</h3>
                    <p className="text-orange-200 text-xs mt-1">{app.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Application Windows */}
      {openApps.Terminal && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/20">
          <BumblebeeTerminal onClose={() => closeApp('Terminal')} />
        </div>
      )}

      {openApps.Files && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/20">
          <BumblebeeFileManager onClose={() => closeApp('Files')} />
        </div>
      )}

      {openApps['Web Browser'] && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/20">
          <BumblebeeBrowser onClose={() => closeApp('Web Browser')} />
        </div>
      )}

      {openApps['Text Editor'] && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/20">
          <BumblebeeTextEditor onClose={() => closeApp('Text Editor')} />
        </div>
      )}

      {/* Desktop Icons */}
      <div className="absolute top-20 left-8 grid grid-cols-1 gap-4">
        {['Home', 'Documents', 'Downloads', 'Pictures'].map((folder, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3 cursor-pointer hover:bg-white/20 transition-all w-24"
          >
            <Folder className="w-8 h-8 text-white mx-auto mb-1" />
            <p className="text-white text-xs text-center">{folder}</p>
          </div>
        ))}
      </div>

      {/* Dock */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-orange-900/80 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center space-x-3 border border-orange-700/50">
          <Button
            onClick={() => openApp('Files')}
            className="w-12 h-12 bg-yellow-400 hover:bg-yellow-300 rounded-xl p-0 transition-all hover:scale-110"
          >
            <Folder className="w-6 h-6 text-orange-800" />
          </Button>
          <Button
            onClick={() => openApp('Terminal')}
            className="w-12 h-12 bg-yellow-400 hover:bg-yellow-300 rounded-xl p-0 transition-all hover:scale-110"
          >
            <Terminal className="w-6 h-6 text-orange-800" />
          </Button>
          <Button
            onClick={() => openApp('Web Browser')}
            className="w-12 h-12 bg-yellow-400 hover:bg-yellow-300 rounded-xl p-0 transition-all hover:scale-110"
          >
            <Globe className="w-6 h-6 text-orange-800" />
          </Button>
          <Button
            onClick={() => openApp('Text Editor')}
            className="w-12 h-12 bg-yellow-400 hover:bg-yellow-300 rounded-xl p-0 transition-all hover:scale-110"
          >
            <FileText className="w-6 h-6 text-orange-800" />
          </Button>
          <Button
            onClick={() => setShowApplications(true)}
            className="w-12 h-12 bg-yellow-400 hover:bg-yellow-300 rounded-xl p-0 transition-all hover:scale-110"
          >
            <Settings className="w-6 h-6 text-orange-800" />
          </Button>
        </div>
      </div>

      {/* Return to WebOS Button */}
      <Button
        onClick={onReturnToWebOS}
        className="absolute top-16 right-4 bg-red-600 hover:bg-red-700 text-white"
      >
        Exit Bumblebee OS
      </Button>

      {/* Welcome Message */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <Bug className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Bumblebee OS</h1>
          <p className="text-orange-100 mb-2">Hello, {username}!</p>
          <p className="text-orange-200 text-sm">Ubuntu 22.04 LTS with GNOME Desktop</p>
        </div>
      </div>
    </div>
  );
};