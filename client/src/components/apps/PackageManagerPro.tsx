import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Download, Search, Star, Shield, RefreshCw, Trash2, CheckCircle } from 'lucide-react';

interface PackageInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  size: number;
  rating: number;
  downloads: number;
  author: string;
  status: 'available' | 'installed' | 'updating';
  dependencies: string[];
  repository: string;
  verified: boolean;
}

export const PackageManagerPro: FC = () => {
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('browse');
  const [installProgress, setInstallProgress] = useState<{[key: string]: number}>({});

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = () => {
    const mockPackages: PackageInfo[] = [
      {
        id: 'firefox',
        name: 'Firefox Browser',
        version: '121.0',
        description: 'Fast, secure web browser with privacy protection',
        category: 'Web Browsers',
        size: 89600000,
        rating: 4.8,
        downloads: 2500000,
        author: 'Mozilla Foundation',
        status: 'available',
        dependencies: ['libgtk-3', 'libssl'],
        repository: 'official',
        verified: true
      },
      {
        id: 'vscode',
        name: 'Visual Studio Code',
        version: '1.85.1',
        description: 'Powerful code editor with IntelliSense and debugging',
        category: 'Development',
        size: 156700000,
        rating: 4.9,
        downloads: 5000000,
        author: 'Microsoft',
        status: 'installed',
        dependencies: ['electron', 'nodejs'],
        repository: 'official',
        verified: true
      },
      {
        id: 'gimp',
        name: 'GIMP',
        version: '2.10.36',
        description: 'GNU Image Manipulation Program for photo editing',
        category: 'Graphics',
        size: 267800000,
        rating: 4.6,
        downloads: 1800000,
        author: 'GIMP Team',
        status: 'available',
        dependencies: ['libgimp', 'python3'],
        repository: 'official',
        verified: true
      },
      {
        id: 'discord',
        name: 'Discord',
        version: '0.0.40',
        description: 'Voice, video and text communication platform',
        category: 'Communication',
        size: 124500000,
        rating: 4.7,
        downloads: 3200000,
        author: 'Discord Inc.',
        status: 'available',
        dependencies: ['electron'],
        repository: 'third-party',
        verified: true
      },
      {
        id: 'blender',
        name: 'Blender',
        version: '4.0.2',
        description: '3D creation suite for modeling, animation, and rendering',
        category: 'Graphics',
        size: 445600000,
        rating: 4.8,
        downloads: 980000,
        author: 'Blender Foundation',
        status: 'available',
        dependencies: ['python3', 'ffmpeg'],
        repository: 'official',
        verified: true
      }
    ];
    setPackages(mockPackages);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const installPackage = (packageId: string) => {
    setInstallProgress(prev => ({ ...prev, [packageId]: 0 }));
    
    const interval = setInterval(() => {
      setInstallProgress(prev => {
        const currentProgress = prev[packageId] || 0;
        if (currentProgress >= 100) {
          clearInterval(interval);
          setPackages(pkgs => pkgs.map(pkg => 
            pkg.id === packageId ? { ...pkg, status: 'installed' as const } : pkg
          ));
          return { ...prev, [packageId]: 100 };
        }
        return { ...prev, [packageId]: currentProgress + 10 };
      });
    }, 300);
  };

  const uninstallPackage = (packageId: string) => {
    setPackages(prev => prev.map(pkg => 
      pkg.id === packageId ? { ...pkg, status: 'available' as const } : pkg
    ));
  };

  const categories = ['all', 'Development', 'Web Browsers', 'Graphics', 'Communication', 'Games', 'Utilities'];

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const installedPackages = packages.filter(pkg => pkg.status === 'installed');

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b p-4">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Package Manager</h1>
          <Badge variant="secondary">WebOS Repository</Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="installed">Installed ({installedPackages.length})</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
            <TabsTrigger value="repositories">Repositories</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="browse" className="p-4 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search packages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'All Categories' : category}
                </Button>
              ))}
            </div>

            <div className="grid gap-4">
              {filteredPackages.map((pkg) => (
                <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{pkg.name}</h3>
                          <Badge variant="secondary">{pkg.version}</Badge>
                          {pkg.verified && <Shield className="h-4 w-4 text-green-500" />}
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{pkg.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>By {pkg.author}</span>
                          <span>{formatFileSize(pkg.size)}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{pkg.rating}</span>
                          </div>
                          <span>{pkg.downloads.toLocaleString()} downloads</span>
                        </div>

                        {pkg.dependencies.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground">Dependencies: </span>
                            {pkg.dependencies.map(dep => (
                              <Badge key={dep} variant="outline" className="text-xs mr-1">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        {pkg.status === 'installed' ? (
                          <div className="flex flex-col gap-2">
                            <Badge variant="default" className="justify-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Installed
                            </Badge>
                            <Button variant="outline" size="sm" onClick={() => uninstallPackage(pkg.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <Button onClick={() => installPackage(pkg.id)} disabled={pkg.id in installProgress}>
                            <Download className="h-4 w-4 mr-2" />
                            Install
                          </Button>
                        )}

                        {pkg.id in installProgress && (
                          <div className="w-32">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Installing...</span>
                              <span>{installProgress[pkg.id]}%</span>
                            </div>
                            <Progress value={installProgress[pkg.id]} className="h-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="installed" className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Installed Packages</h2>
              <Badge variant="outline">{installedPackages.length} packages</Badge>
            </div>

            <div className="grid gap-4">
              {installedPackages.map((pkg) => (
                <Card key={pkg.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{pkg.name}</h3>
                          <Badge variant="secondary">{pkg.version}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatFileSize(pkg.size)} • {pkg.author}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Update</Button>
                        <Button variant="outline" size="sm" onClick={() => uninstallPackage(pkg.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {installedPackages.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No packages installed</h3>
                <p className="text-muted-foreground">Browse the package repository to install applications</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="updates" className="p-4">
            <div className="text-center py-12">
              <RefreshCw className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No updates available</h3>
              <p className="text-muted-foreground">All installed packages are up to date</p>
            </div>
          </TabsContent>

          <TabsContent value="repositories" className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configured Repositories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">Official WebOS Repository</div>
                    <div className="text-sm text-muted-foreground">https://packages.webos.dev/</div>
                  </div>
                  <Badge variant="default">Official</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">Community Repository</div>
                    <div className="text-sm text-muted-foreground">https://community.webos.dev/</div>
                  </div>
                  <Badge variant="secondary">Community</Badge>
                </div>

                <Button variant="outline" className="w-full">
                  Add Repository
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};