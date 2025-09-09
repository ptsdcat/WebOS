import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Package, 
  Search, 
  Download, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  Terminal,
  Settings,
  Info,
  ExternalLink,
  Star,
  Calendar,
  HardDrive,
  Cpu,
  Monitor
} from 'lucide-react';

interface Package {
  name: string;
  version: string;
  description: string;
  maintainer: string;
  repo: string;
  size: string;
  installed: boolean;
  dependencies: string[];
  buildDate: string;
  url: string;
  popularity: number;
  votes: number;
  outOfDate: boolean;
}

interface SystemInfo {
  kernel: string;
  uptime: string;
  packages: number;
  memory: string;
  storage: string;
}

export const ArchPackageManager: FC = () => {
  const [packages, setPackages] = useState<Package[]>([
    {
      name: 'hyprland',
      version: '0.32.3-1',
      description: 'Dynamic tiling Wayland compositor based on wlroots',
      maintainer: 'Caleb Maclennan',
      repo: 'community',
      size: '2.4 MiB',
      installed: true,
      dependencies: ['wayland', 'wlroots', 'libxkbcommon'],
      buildDate: '2024-01-15',
      url: 'https://hyprland.org',
      popularity: 95,
      votes: 247,
      outOfDate: false
    },
    {
      name: 'waybar',
      version: '0.9.24-1',
      description: 'Highly customizable Wayland bar for Sway and Wlroots compositors',
      maintainer: 'Brett Cornwall',
      repo: 'community',
      size: '1.8 MiB',
      installed: true,
      dependencies: ['gtkmm3', 'jsoncpp', 'libpulse'],
      buildDate: '2024-01-10',
      url: 'https://github.com/Alexays/Waybar',
      popularity: 89,
      votes: 198,
      outOfDate: false
    },
    {
      name: 'kitty',
      version: '0.31.0-1',
      description: 'Cross-platform, fast, feature-rich, GPU based terminal',
      maintainer: 'Daniel M. Capella',
      repo: 'community',
      size: '5.2 MiB',
      installed: true,
      dependencies: ['python', 'harfbuzz', 'libcanberra'],
      buildDate: '2024-01-08',
      url: 'https://sw.kovidgoyal.net/kitty/',
      popularity: 92,
      votes: 312,
      outOfDate: false
    },
    {
      name: 'wofi',
      version: '1.3-1',
      description: 'Launcher/menu program for wlroots based wayland compositors',
      maintainer: 'Sven-Hendrik Haase',
      repo: 'community',
      size: '0.8 MiB',
      installed: false,
      dependencies: ['gtk3', 'wayland'],
      buildDate: '2023-12-20',
      url: 'https://hg.sr.ht/~scoopta/wofi',
      popularity: 78,
      votes: 145,
      outOfDate: false
    },
    {
      name: 'swaylock',
      version: '1.7.2-1',
      description: 'Screen locker for Wayland',
      maintainer: 'Brett Cornwall',
      repo: 'community',
      size: '0.3 MiB',
      installed: false,
      dependencies: ['wayland', 'libxkbcommon', 'pam'],
      buildDate: '2023-11-15',
      url: 'https://github.com/swaywm/swaylock',
      popularity: 85,
      votes: 167,
      outOfDate: false
    },
    {
      name: 'mako',
      version: '1.8.0-1',
      description: 'Lightweight notification daemon for Wayland',
      maintainer: 'Brett Cornwall',
      repo: 'community',
      size: '0.5 MiB',
      installed: false,
      dependencies: ['wayland', 'pango', 'cairo'],
      buildDate: '2023-10-28',
      url: 'https://github.com/emersion/mako',
      popularity: 73,
      votes: 123,
      outOfDate: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  
  const [systemInfo] = useState<SystemInfo>({
    kernel: 'Linux 6.6.8-arch1-1',
    uptime: '2 days, 14 hours, 23 minutes',
    packages: 1247,
    memory: '15.6 GB',
    storage: '512 GB SSD'
  });

  const [installQueue, setInstallQueue] = useState<string[]>([]);
  const [removeQueue, setRemoveQueue] = useState<string[]>([]);

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRepo = selectedRepo === 'all' || pkg.repo === selectedRepo;
    return matchesSearch && matchesRepo;
  });

  const installedPackages = packages.filter(pkg => pkg.installed);
  const availableUpdates = packages.filter(pkg => pkg.installed && Math.random() > 0.7);

  const handleInstall = (packageName: string) => {
    setInstallQueue(prev => [...prev, packageName]);
    // Simulate installation
    setTimeout(() => {
      setPackages(prev => prev.map(pkg => 
        pkg.name === packageName ? { ...pkg, installed: true } : pkg
      ));
      setInstallQueue(prev => prev.filter(name => name !== packageName));
    }, 2000);
  };

  const handleRemove = (packageName: string) => {
    setRemoveQueue(prev => [...prev, packageName]);
    // Simulate removal
    setTimeout(() => {
      setPackages(prev => prev.map(pkg => 
        pkg.name === packageName ? { ...pkg, installed: false } : pkg
      ));
      setRemoveQueue(prev => prev.filter(name => name !== packageName));
    }, 1500);
  };

  const handleSystemUpdate = () => {
    setIsUpdating(true);
    setUpdateProgress(0);
    
    const interval = setInterval(() => {
      setUpdateProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUpdating(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Package className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Arch Package Manager</h2>
          <Badge variant="secondary">pacman</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleSystemUpdate} disabled={isUpdating} size="sm" variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            System Update
          </Button>
          <Button size="sm">
            <Terminal className="w-4 h-4 mr-2" />
            Terminal
          </Button>
        </div>
      </div>

      {isUpdating && (
        <div className="p-4 bg-muted/30 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Updating system packages...</span>
            <span className="text-sm text-muted-foreground">{updateProgress}%</span>
          </div>
          <Progress value={updateProgress} className="w-full" />
        </div>
      )}

      <div className="flex-1 p-4 overflow-auto">
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="installed">Installed ({installedPackages.length})</TabsTrigger>
            <TabsTrigger value="updates">Updates ({availableUpdates.length})</TabsTrigger>
            <TabsTrigger value="system">System Info</TabsTrigger>
            <TabsTrigger value="aur">AUR</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search packages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select 
                value={selectedRepo} 
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Repositories</option>
                <option value="core">Core</option>
                <option value="extra">Extra</option>
                <option value="community">Community</option>
                <option value="multilib">Multilib</option>
              </select>
            </div>

            <div className="grid gap-4">
              {filteredPackages.map((pkg) => (
                <Card key={pkg.name} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{pkg.name}</h3>
                          <Badge variant="outline">{pkg.version}</Badge>
                          <Badge variant={pkg.repo === 'core' ? 'default' : 'secondary'}>
                            {pkg.repo}
                          </Badge>
                          {pkg.installed && <Badge variant="secondary">Installed</Badge>}
                          {pkg.outOfDate && <Badge variant="destructive">Out of Date</Badge>}
                        </div>
                        <p className="text-muted-foreground mb-2">{pkg.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Size: {pkg.size}</span>
                          <span>Maintainer: {pkg.maintainer}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>{pkg.votes}</span>
                          </div>
                          <span>{pkg.popularity}% popularity</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {pkg.installed ? (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleRemove(pkg.name)}
                            disabled={removeQueue.includes(pkg.name)}
                          >
                            {removeQueue.includes(pkg.name) ? (
                              <Clock className="w-4 h-4 mr-2" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            {removeQueue.includes(pkg.name) ? 'Removing...' : 'Remove'}
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleInstall(pkg.name)}
                            disabled={installQueue.includes(pkg.name)}
                          >
                            {installQueue.includes(pkg.name) ? (
                              <Clock className="w-4 h-4 mr-2" />
                            ) : (
                              <Download className="w-4 h-4 mr-2" />
                            )}
                            {installQueue.includes(pkg.name) ? 'Installing...' : 'Install'}
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedPackage(pkg)}
                        >
                          <Info className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="installed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Installed Packages</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {installedPackages.map((pkg) => (
                      <div key={pkg.name} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{pkg.name}</span>
                            <Badge variant="outline">{pkg.version}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => handleRemove(pkg.name)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="updates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5" />
                  <span>Available Updates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableUpdates.length > 0 ? (
                  <div className="space-y-3">
                    {availableUpdates.map((pkg) => (
                      <div key={pkg.name} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">{pkg.name}</span>
                          <span className="text-muted-foreground ml-2">{pkg.version} → {pkg.version.replace(/\d+$/, (n) => String(parseInt(n) + 1))}</span>
                        </div>
                        <Button size="sm">Update</Button>
                      </div>
                    ))}
                    <Button className="w-full" onClick={handleSystemUpdate}>
                      Update All Packages
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium">System is up to date</p>
                    <p className="text-muted-foreground">All packages are at their latest versions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="w-5 h-5" />
                    <span>System Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kernel:</span>
                    <span className="font-medium">{systemInfo.kernel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime:</span>
                    <span className="font-medium">{systemInfo.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Packages:</span>
                    <span className="font-medium">{systemInfo.packages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Memory:</span>
                    <span className="font-medium">{systemInfo.memory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage:</span>
                    <span className="font-medium">{systemInfo.storage}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Package Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Installed:</span>
                    <span className="font-medium">{installedPackages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updates Available:</span>
                    <span className="font-medium">{availableUpdates.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Orphaned:</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cache Size:</span>
                    <span className="font-medium">2.4 GB</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="aur" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Arch User Repository (AUR)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">AUR Helper Integration</p>
                  <p className="text-muted-foreground mb-4">Install an AUR helper like yay or paru to access community packages</p>
                  <div className="space-x-2">
                    <Button>Install yay</Button>
                    <Button variant="outline">Install paru</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>{selectedPackage.name}</span>
                </CardTitle>
                <Button variant="ghost" onClick={() => setSelectedPackage(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedPackage.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Version</h4>
                  <p>{selectedPackage.version}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Repository</h4>
                  <p>{selectedPackage.repo}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Size</h4>
                  <p>{selectedPackage.size}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Build Date</h4>
                  <p>{selectedPackage.buildDate}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Dependencies</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPackage.dependencies.map((dep) => (
                    <Badge key={dep} variant="outline">{dep}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => window.open(selectedPackage.url, '_blank')}
                  variant="outline"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Homepage
                </Button>
                {selectedPackage.installed ? (
                  <Button variant="destructive" onClick={() => handleRemove(selectedPackage.name)}>
                    Remove Package
                  </Button>
                ) : (
                  <Button onClick={() => handleInstall(selectedPackage.name)}>
                    Install Package
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};