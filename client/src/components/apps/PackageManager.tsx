import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, Trash2, RefreshCw, Package, Terminal, Shield, Star, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PackageInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  size: string;
  category: 'system' | 'development' | 'multimedia' | 'productivity' | 'games' | 'network' | 'security';
  dependencies: string[];
  installed: boolean;
  official: boolean;
  popularity: number;
  lastUpdate: string;
  maintainer: string;
  repository: 'core' | 'extra' | 'community' | 'aur';
}

const availablePackages: PackageInfo[] = [
  // WebOS Built-in Applications
  {
    id: 'weather-app',
    name: 'webos-weather',
    description: 'Advanced weather application with forecast and location support',
    version: '2.1.0-1',
    size: '2.4 MB',
    category: 'productivity',
    dependencies: ['nodejs', 'curl'],
    installed: false,
    official: false,
    popularity: 78,
    lastUpdate: '2024-01-20',
    maintainer: 'WebOS Team',
    repository: 'aur'
  },
  {
    id: 'email-client',
    name: 'webos-mail',
    description: 'Full-featured email client with compose, search, and attachment support',
    version: '3.2.1-1',
    size: '4.1 MB',
    category: 'network',
    dependencies: ['nodejs', 'electron'],
    installed: false,
    official: false,
    popularity: 85,
    lastUpdate: '2024-01-18',
    maintainer: 'WebOS Team',
    repository: 'aur'
  },
  {
    id: 'spreadsheet',
    name: 'webos-calc',
    description: 'Professional spreadsheet application with formulas, charts, and data analysis',
    version: '1.8.3-1',
    size: '6.7 MB',
    category: 'productivity',
    dependencies: ['nodejs', 'mathjs'],
    installed: false,
    official: false,
    popularity: 72,
    lastUpdate: '2024-01-17',
    maintainer: 'WebOS Team',
    repository: 'aur'
  },
  {
    id: 'presentation',
    name: 'webos-present',
    description: 'PowerPoint-style presentation creator with slides, animations, and themes',
    version: '2.0.5-1',
    size: '5.3 MB',
    category: 'productivity',
    dependencies: ['nodejs', 'canvas'],
    installed: false,
    official: false,
    popularity: 68,
    lastUpdate: '2024-01-16',
    maintainer: 'WebOS Team',
    repository: 'aur'
  },
  {
    id: 'office-suite',
    name: 'webos-office',
    description: 'Complete office suite with word processing, spreadsheets, and presentations',
    version: '4.1.2-1',
    size: '12.8 MB',
    category: 'productivity',
    dependencies: ['webos-calc', 'webos-present'],
    installed: false,
    official: false,
    popularity: 82,
    lastUpdate: '2024-01-19',
    maintainer: 'WebOS Team',
    repository: 'aur'
  },
  {
    id: 'tetris',
    name: 'webos-tetris',
    description: 'Classic Tetris puzzle game with modern graphics and scoring',
    version: '1.4.2-1',
    size: '1.2 MB',
    category: 'games',
    dependencies: ['nodejs'],
    installed: false,
    official: false,
    popularity: 89,
    lastUpdate: '2024-01-14',
    maintainer: 'WebOS Team',
    repository: 'aur'
  },
  {
    id: 'virtual-machine',
    name: 'webos-vm',
    description: 'Virtual machine manager with container support and system emulation',
    version: '3.0.1-1',
    size: '8.9 MB',
    category: 'system',
    dependencies: ['qemu', 'docker'],
    installed: false,
    official: false,
    popularity: 65,
    lastUpdate: '2024-01-15',
    maintainer: 'WebOS Team',
    repository: 'aur'
  },
  {
    id: 'video-editor',
    name: 'webos-video',
    description: 'Professional video editing suite with timeline, effects, and export options',
    version: '2.3.4-1',
    size: '15.2 MB',
    category: 'multimedia',
    dependencies: ['ffmpeg', 'nodejs', 'opencv'],
    installed: false,
    official: false,
    popularity: 71,
    lastUpdate: '2024-01-13',
    maintainer: 'WebOS Team',
    repository: 'aur'
  },
  {
    id: 'roblox',
    name: 'roblox-player',
    description: 'Roblox game client for playing user-generated games',
    version: '2.598.566-1',
    size: '127.3 MB',
    category: 'games',
    dependencies: ['wine', 'winetricks'],
    installed: false,
    official: false,
    popularity: 92,
    lastUpdate: '2024-01-12',
    maintainer: 'Roblox Corporation',
    repository: 'aur'
  },
  {
    id: 'roblox-studio',
    name: 'roblox-studio',
    description: 'Roblox Studio for game development and scripting',
    version: '2.598.566-1',
    size: '156.7 MB',
    category: 'development',
    dependencies: ['wine', 'winetricks', 'dotnet'],
    installed: false,
    official: false,
    popularity: 76,
    lastUpdate: '2024-01-12',
    maintainer: 'Roblox Corporation',
    repository: 'aur'
  },
  {
    id: 'pacman',
    name: 'webos-pacman',
    description: 'Classic Pac-Man arcade game with authentic gameplay and sound',
    version: '1.3.1-1',
    size: '2.8 MB',
    category: 'games',
    dependencies: ['nodejs', 'sdl2'],
    installed: false,
    official: false,
    popularity: 87,
    lastUpdate: '2024-01-10',
    maintainer: 'WebOS Team',
    repository: 'aur'
  },
  {
    id: 'retro-emulator',
    name: 'webos-retro',
    description: 'Multi-system retro game emulator supporting NES, SNES, Game Boy, and more',
    version: '4.2.0-1',
    size: '24.6 MB',
    category: 'games',
    dependencies: ['libretro', 'sdl2', 'opengl'],
    installed: false,
    official: false,
    popularity: 81,
    lastUpdate: '2024-01-11',
    maintainer: 'WebOS Team',
    repository: 'aur'
  },
  {
    id: 'storage-manager',
    name: 'webos-storage',
    description: 'Advanced disk and storage management with partitioning and monitoring',
    version: '2.1.3-1',
    size: '3.7 MB',
    category: 'system',
    dependencies: ['util-linux', 'smartmontools'],
    installed: false,
    official: false,
    popularity: 69,
    lastUpdate: '2024-01-09',
    maintainer: 'WebOS Team',
    repository: 'aur'
  },
  {
    id: 'system-recovery',
    name: 'webos-recovery',
    description: 'System recovery and backup utilities with file restoration',
    version: '1.5.2-1',
    size: '4.2 MB',
    category: 'system',
    dependencies: ['rsync', 'tar', 'gzip'],
    installed: false,
    official: false,
    popularity: 73,
    lastUpdate: '2024-01-08',
    maintainer: 'WebOS Team',
    repository: 'aur'
  },
  // External Applications
  {
    id: 'firefox',
    name: 'firefox',
    description: 'Standalone web browser from Mozilla',
    version: '121.0-1',
    size: '58.2 MB',
    category: 'network',
    dependencies: ['gtk3', 'libpulse', 'ffmpeg'],
    installed: false,
    official: true,
    popularity: 95,
    lastUpdate: '2024-01-15',
    maintainer: 'Mozilla Team',
    repository: 'extra'
  },
  {
    id: 'code',
    name: 'visual-studio-code-bin',
    description: 'The Open Source build of Visual Studio Code (vscode) editor',
    version: '1.85.1-1',
    size: '102.4 MB',
    category: 'development',
    dependencies: ['electron', 'libxss', 'gtk3'],
    installed: false,
    official: false,
    popularity: 88,
    lastUpdate: '2024-01-12',
    maintainer: 'Microsoft',
    repository: 'aur'
  },
  {
    id: 'discord',
    name: 'discord',
    description: 'All-in-one voice and text chat for gamers',
    version: '0.0.40-1',
    size: '78.9 MB',
    category: 'network',
    dependencies: ['gtk3', 'libxss', 'gconf'],
    installed: false,
    official: false,
    popularity: 82,
    lastUpdate: '2024-01-10',
    maintainer: 'Discord Inc.',
    repository: 'aur'
  },
  {
    id: 'gimp',
    name: 'gimp',
    description: 'GNU Image Manipulation Program',
    version: '2.10.36-1',
    size: '45.7 MB',
    category: 'multimedia',
    dependencies: ['gtk2', 'lcms2', 'libmng', 'librsvg'],
    installed: false,
    official: true,
    popularity: 75,
    lastUpdate: '2024-01-08',
    maintainer: 'GIMP Team',
    repository: 'extra'
  },
  {
    id: 'steam',
    name: 'steam',
    description: 'Valve\'s digital software delivery system',
    version: '1.0.0.78-1',
    size: '3.2 MB',
    category: 'games',
    dependencies: ['lib32-libgl', 'lib32-gcc-libs', 'lib32-libx11'],
    installed: false,
    official: false,
    popularity: 90,
    lastUpdate: '2024-01-14',
    maintainer: 'Valve Corporation',
    repository: 'aur'
  },
  {
    id: 'libreoffice',
    name: 'libreoffice-fresh',
    description: 'LibreOffice branch which contains new features and program enhancements',
    version: '7.6.4-1',
    size: '285.6 MB',
    category: 'productivity',
    dependencies: ['curl', 'hunspell', 'python', 'libwpd'],
    installed: false,
    official: true,
    popularity: 70,
    lastUpdate: '2024-01-13',
    maintainer: 'The Document Foundation',
    repository: 'extra'
  },
  {
    id: 'htop',
    name: 'htop',
    description: 'Interactive process viewer',
    version: '3.3.0-1',
    size: '245 KB',
    category: 'system',
    dependencies: ['ncurses'],
    installed: true,
    official: true,
    popularity: 85,
    lastUpdate: '2023-12-20',
    maintainer: 'Hisham Muhammad',
    repository: 'extra'
  },
  {
    id: 'vim',
    name: 'vim',
    description: 'Vi Improved, a highly configurable, improved version of the vi text editor',
    version: '9.0.2189-1',
    size: '3.8 MB',
    category: 'development',
    dependencies: ['gpm', 'acl', 'glibc'],
    installed: true,
    official: true,
    popularity: 92,
    lastUpdate: '2024-01-11',
    maintainer: 'Bram Moolenaar',
    repository: 'extra'
  },
  {
    id: 'wireshark',
    name: 'wireshark-qt',
    description: 'Network traffic and protocol analyzer/sniffer - Qt GUI',
    version: '4.2.1-1',
    size: '28.4 MB',
    category: 'security',
    dependencies: ['qt6-base', 'qt6-multimedia', 'libpcap'],
    installed: false,
    official: true,
    popularity: 65,
    lastUpdate: '2024-01-09',
    maintainer: 'Wireshark Team',
    repository: 'extra'
  },
  {
    id: 'blender',
    name: 'blender',
    description: 'A fully integrated 3D graphics creation suite',
    version: '4.0.2-1',
    size: '267.8 MB',
    category: 'multimedia',
    dependencies: ['libgl', 'python', 'python-numpy', 'openimageio'],
    installed: false,
    official: true,
    popularity: 78,
    lastUpdate: '2024-01-16',
    maintainer: 'Blender Foundation',
    repository: 'community'
  }
];

export const PackageManager: FC = () => {
  const [packages, setPackages] = useState<PackageInfo[]>(availablePackages);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRepository, setSelectedRepository] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [installingPackages, setInstallingPackages] = useState<Set<string>>(new Set());
  const [removingPackages, setRemovingPackages] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const categories = ['all', 'system', 'development', 'multimedia', 'productivity', 'games', 'network', 'security'];
  const repositories = ['all', 'core', 'extra', 'community', 'aur'];

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
    const matchesRepository = selectedRepository === 'all' || pkg.repository === selectedRepository;
    
    return matchesSearch && matchesCategory && matchesRepository;
  });

  const installedPackages = packages.filter(pkg => pkg.installed);
  const availableForInstall = packages.filter(pkg => !pkg.installed);

  const handleInstallPackage = async (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;

    const currentInstalling = Array.from(installingPackages);
    setInstallingPackages(new Set([...currentInstalling, packageId]));
    
    // Simulate package installation
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    setPackages(prev => prev.map(p => 
      p.id === packageId ? { ...p, installed: true } : p
    ));
    
    // Create desktop shortcut for WebOS applications
    if (pkg.maintainer === 'WebOS Team') {
      const desktopApps = JSON.parse(localStorage.getItem('desktop-apps') || '[]');
      const newApp = {
        id: packageId,
        name: getAppDisplayName(packageId),
        icon: getAppIcon(packageId),
        description: pkg.description
      };
      
      if (!desktopApps.find((app: any) => app.id === packageId)) {
        desktopApps.push(newApp);
        localStorage.setItem('desktop-apps', JSON.stringify(desktopApps));
        
        // Trigger desktop refresh
        window.dispatchEvent(new CustomEvent('desktop-refresh'));
      }
    }
    
    const updatedInstalling = Array.from(installingPackages).filter(id => id !== packageId);
    setInstallingPackages(new Set(updatedInstalling));

    toast({
      title: "Package Installed",
      description: `${pkg.name} has been successfully installed`,
    });

    // Track installation for achievements
    window.dispatchEvent(new CustomEvent('package-installed', { detail: pkg }));
  };

  const getAppDisplayName = (packageId: string): string => {
    const nameMap: { [key: string]: string } = {
      'weather-app': 'Weather',
      'email-client': 'Thunderbird',
      'spreadsheet': 'LibreOffice Calc',
      'presentation': 'LibreOffice Impress',
      'office-suite': 'Office Suite',
      'tetris': 'Tetris',
      'virtual-machine': 'VirtualBox',
      'video-editor': 'Video Editor',
      'roblox': 'Roblox',
      'roblox-studio': 'Roblox Studio',
      'pacman': 'Pac-Man',
      'retro-emulator': 'Retro Emulator',
      'storage-manager': 'Storage Manager',
      'system-recovery': 'System Recovery'
    };
    return nameMap[packageId] || packageId;
  };

  const getAppIcon = (packageId: string): string => {
    const iconMap: { [key: string]: string } = {
      'weather-app': 'cloud',
      'email-client': 'email',
      'spreadsheet': 'spreadsheet',
      'presentation': 'presentation',
      'office-suite': 'briefcase',
      'tetris': 'gamepad',
      'virtual-machine': 'monitor',
      'video-editor': 'video',
      'roblox': 'gamepad',
      'roblox-studio': 'code',
      'pacman': 'gamepad',
      'retro-emulator': 'gamepad',
      'storage-manager': 'harddrive',
      'system-recovery': 'shield'
    };
    return iconMap[packageId] || 'package';
  };

  const handleRemovePackage = async (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;

    const currentRemoving = Array.from(removingPackages);
    setRemovingPackages(new Set([...currentRemoving, packageId]));
    
    // Simulate package removal
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setPackages(prev => prev.map(p => 
      p.id === packageId ? { ...p, installed: false } : p
    ));
    
    setRemovingPackages(prev => {
      const newSet = new Set(prev);
      newSet.delete(packageId);
      return newSet;
    });

    toast({
      title: "Package Removed",
      description: `${pkg.name} has been successfully removed`,
    });
  };

  const handleUpdateSystem = async () => {
    setIsUpdating(true);
    toast({
      title: "System Update Started",
      description: "Checking for package updates...",
    });

    // Simulate system update
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    setIsUpdating(false);
    toast({
      title: "System Updated",
      description: "All packages are up to date",
    });
  };

  const getRepositoryBadgeColor = (repo: string) => {
    switch (repo) {
      case 'core': return 'bg-blue-500';
      case 'extra': return 'bg-green-500';
      case 'community': return 'bg-purple-500';
      case 'aur': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Terminal className="w-4 h-4" />;
      case 'development': return <Package className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-950 to-cyan-950 text-blue-100 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-cyan-100 font-mono">pacman</h1>
              <p className="text-blue-300 text-sm font-mono">Arch Linux Package Manager</p>
            </div>
            <Button
              onClick={handleUpdateSystem}
              disabled={isUpdating}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-mono"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  pacman -Syu
                </>
              )}
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
              <Input
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-blue-900/50 border-blue-400/30 text-blue-100 placeholder-blue-300 font-mono"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-blue-900/50 border border-blue-400/30 rounded-md text-blue-100 font-mono"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-blue-900">
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedRepository}
              onChange={(e) => setSelectedRepository(e.target.value)}
              className="px-3 py-2 bg-blue-900/50 border border-blue-400/30 rounded-md text-blue-100 font-mono"
            >
              {repositories.map(repo => (
                <option key={repo} value={repo} className="bg-blue-900">
                  {repo === 'all' ? 'All Repositories' : repo.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-blue-900/50 border-blue-400/30">
            <TabsTrigger value="browse" className="font-mono data-[state=active]:bg-cyan-600">
              Browse Packages
            </TabsTrigger>
            <TabsTrigger value="installed" className="font-mono data-[state=active]:bg-cyan-600">
              Installed ({installedPackages.length})
            </TabsTrigger>
            <TabsTrigger value="updates" className="font-mono data-[state=active]:bg-cyan-600">
              Updates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPackages.map(pkg => (
                <Card key={pkg.id} className="bg-blue-900/30 border-blue-400/30 hover:bg-blue-800/40 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(pkg.category)}
                        <CardTitle className="text-cyan-100 font-mono text-lg">{pkg.name}</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Badge className={`${getRepositoryBadgeColor(pkg.repository)} text-white text-xs`}>
                          {pkg.repository.toUpperCase()}
                        </Badge>
                        {pkg.official && (
                          <Badge className="bg-green-600 text-white text-xs">
                            Official
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-300">
                      <span className="font-mono">{pkg.version}</span>
                      <span>•</span>
                      <span>{pkg.size}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{pkg.popularity}%</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-blue-200 mb-3 text-sm">
                      {pkg.description}
                    </CardDescription>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-blue-300">
                        <strong>Maintainer:</strong> {pkg.maintainer}
                      </div>
                      <div className="text-xs text-blue-300">
                        <strong>Last Update:</strong> {pkg.lastUpdate}
                      </div>
                      {pkg.dependencies.length > 0 && (
                        <div className="text-xs text-blue-300">
                          <strong>Dependencies:</strong> {pkg.dependencies.join(', ')}
                        </div>
                      )}
                    </div>

                    {pkg.installed ? (
                      <Button
                        onClick={() => handleRemovePackage(pkg.id)}
                        disabled={removingPackages.has(pkg.id)}
                        variant="destructive"
                        size="sm"
                        className="w-full font-mono"
                      >
                        {removingPackages.has(pkg.id) ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            pacman -R
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleInstallPackage(pkg.id)}
                        disabled={installingPackages.has(pkg.id)}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 font-mono"
                      >
                        {installingPackages.has(pkg.id) ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Installing...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            pacman -S
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="installed" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {installedPackages.map(pkg => (
                <Card key={pkg.id} className="bg-green-900/20 border-green-400/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(pkg.category)}
                        <CardTitle className="text-green-100 font-mono text-lg">{pkg.name}</CardTitle>
                      </div>
                      <Badge className="bg-green-600 text-white text-xs">
                        Installed
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-300">
                      <span className="font-mono">{pkg.version}</span>
                      <span>•</span>
                      <span>{pkg.size}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-green-200 mb-3 text-sm">
                      {pkg.description}
                    </CardDescription>
                    
                    <Button
                      onClick={() => handleRemovePackage(pkg.id)}
                      disabled={removingPackages.has(pkg.id)}
                      variant="destructive"
                      size="sm"
                      className="w-full font-mono"
                    >
                      {removingPackages.has(pkg.id) ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          pacman -R {pkg.name}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="updates" className="mt-6">
            <Card className="bg-blue-900/30 border-blue-400/30">
              <CardHeader>
                <CardTitle className="text-cyan-100 font-mono flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  System Updates
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Check for and install system updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-blue-100 mb-2">System Up to Date</h3>
                  <p className="text-blue-300 mb-4">All packages are running the latest versions</p>
                  <Button
                    onClick={handleUpdateSystem}
                    disabled={isUpdating}
                    className="bg-cyan-600 hover:bg-cyan-700 font-mono"
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Checking for updates...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Check for Updates
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};