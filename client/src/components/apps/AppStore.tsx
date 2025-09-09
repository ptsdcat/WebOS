import { FC, useState, useEffect } from 'react';
import { Search, Download, Star, Award, Heart, Share, Grid3X3, List, Filter, X, Clock, TrendingUp, Users, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface AppInfo {
  id: string;
  name: string;
  developer: string;
  description: string;
  longDescription: string;
  version: string;
  size: string;
  category: 'productivity' | 'games' | 'utilities' | 'creative' | 'social' | 'developer';
  price: number; // 0 for free
  rating: number;
  reviewCount: number;
  screenshots: string[];
  icon: string;
  installed: boolean;
  featured: boolean;
  editorChoice: boolean;
  releaseDate: string;
  ageRating: string;
  requirements: string[];
}

const featuredApps: AppInfo[] = [
  {
    id: 'weather-app',
    name: 'WeatherPro',
    developer: 'WebOS Studio',
    description: 'Beautiful weather forecasts with radar and alerts',
    longDescription: 'Get accurate weather forecasts, severe weather alerts, and interactive radar maps. Features include hourly and 10-day forecasts, weather widgets, and location-based notifications.',
    version: '2.1.0',
    size: '45.2 MB',
    category: 'utilities',
    price: 0,
    rating: 4.8,
    reviewCount: 2847,
    screenshots: [],
    icon: 'cloud',
    installed: false,
    featured: true,
    editorChoice: true,
    releaseDate: '2024-01-15',
    ageRating: '4+',
    requirements: ['macOS 11.0 or later']
  },
  {
    id: 'tetris',
    name: 'Tetris Classic',
    developer: 'Puzzle Games Inc',
    description: 'The timeless puzzle game everyone loves',
    longDescription: 'Experience the classic Tetris gameplay with modern graphics and smooth controls. Multiple game modes, achievements, and leaderboards included.',
    version: '1.4.2',
    size: '12.8 MB',
    category: 'games',
    price: 4.99,
    rating: 4.9,
    reviewCount: 15632,
    screenshots: [],
    icon: 'gamepad',
    installed: false,
    featured: true,
    editorChoice: false,
    releaseDate: '2024-01-10',
    ageRating: '4+',
    requirements: ['macOS 10.15 or later']
  },
  {
    id: 'office-suite',
    name: 'Office Pro',
    developer: 'Productivity Labs',
    description: 'Complete office suite for all your productivity needs',
    longDescription: 'Full-featured office suite with word processing, spreadsheets, and presentations. Compatible with Microsoft Office formats and includes cloud sync.',
    version: '4.1.2',
    size: '128.5 MB',
    category: 'productivity',
    price: 19.99,
    rating: 4.7,
    reviewCount: 8943,
    screenshots: [],
    icon: 'briefcase',
    installed: false,
    featured: true,
    editorChoice: true,
    releaseDate: '2024-01-20',
    ageRating: '4+',
    requirements: ['macOS 12.0 or later']
  }
];

const allApps: AppInfo[] = [
  ...featuredApps,
  {
    id: 'email-client',
    name: 'Mail Master',
    developer: 'Communication Co',
    description: 'Powerful email client with smart organization',
    longDescription: 'Advanced email management with smart filters, unified inbox, and powerful search. Supports multiple accounts and advanced security features.',
    version: '3.2.1',
    size: '67.3 MB',
    category: 'productivity',
    price: 9.99,
    rating: 4.6,
    reviewCount: 5621,
    screenshots: [],
    icon: 'email',
    installed: false,
    featured: false,
    editorChoice: false,
    releaseDate: '2024-01-18',
    ageRating: '4+',
    requirements: ['macOS 11.0 or later']
  },
  {
    id: 'video-editor',
    name: 'Video Studio Pro',
    developer: 'Creative Labs',
    description: 'Professional video editing made simple',
    longDescription: 'Create stunning videos with professional-grade editing tools. Features include 4K support, color grading, audio mixing, and hundreds of effects.',
    version: '2.3.4',
    size: '245.7 MB',
    category: 'creative',
    price: 29.99,
    rating: 4.8,
    reviewCount: 3247,
    screenshots: [],
    icon: 'video',
    installed: false,
    featured: false,
    editorChoice: true,
    releaseDate: '2024-01-13',
    ageRating: '4+',
    requirements: ['macOS 12.0 or later', '8GB RAM']
  },
  {
    id: 'roblox',
    name: 'Roblox',
    developer: 'Roblox Corporation',
    description: 'Powering Imagination',
    longDescription: 'Join millions of players in immersive 3D experiences created by a global community. Play, create, and share with friends in endless virtual worlds.',
    version: '2.598.566',
    size: '187.2 MB',
    category: 'games',
    price: 0,
    rating: 4.3,
    reviewCount: 125847,
    screenshots: [],
    icon: 'gamepad',
    installed: false,
    featured: false,
    editorChoice: false,
    releaseDate: '2024-01-12',
    ageRating: '9+',
    requirements: ['macOS 10.13 or later']
  },
  {
    id: 'spreadsheet',
    name: 'Numbers Pro',
    developer: 'Data Analytics Inc',
    description: 'Advanced spreadsheet application',
    longDescription: 'Powerful spreadsheet app with advanced formulas, charts, and data analysis tools. Perfect for business and personal use.',
    version: '1.8.3',
    size: '89.4 MB',
    category: 'productivity',
    price: 14.99,
    rating: 4.5,
    reviewCount: 2156,
    screenshots: [],
    icon: 'spreadsheet',
    installed: false,
    featured: false,
    editorChoice: false,
    releaseDate: '2024-01-17',
    ageRating: '4+',
    requirements: ['macOS 11.0 or later']
  },
  {
    id: 'call-of-duty',
    name: 'Call of Duty: Modern Warfare',
    developer: 'Activision',
    description: 'Epic first-person shooter with multiplayer combat',
    longDescription: 'Experience the most realistic and intense Call of Duty ever created. Features include campaign mode, multiplayer battles, battle royale, weapon customization, clan system, and competitive ranked matches with authentic military combat.',
    version: '1.24.0',
    size: '187.2 GB',
    category: 'games',
    price: 59.99,
    rating: 4.7,
    reviewCount: 89432,
    screenshots: [],
    icon: 'gamepad',
    installed: false,
    featured: true,
    editorChoice: true,
    releaseDate: '2024-01-05',
    ageRating: '17+',
    requirements: ['macOS 12.0 or later', '16GB RAM', 'Dedicated GPU']
  },
  {
    id: 'multiplayer-shooter',
    name: 'Battle Arena FPS',
    developer: 'WebOS Games',
    description: 'Real-time multiplayer first-person shooter with authentic combat mechanics',
    longDescription: 'Experience intense multiplayer combat with real movement, shooting, and tactical gameplay. Features include real-time multiplayer battles, weapon systems, health management, respawn mechanics, team-based combat, and authentic FPS controls with WASD movement and mouse aiming.',
    version: '2.1.0',
    size: '4.2 GB',
    category: 'games',
    price: 29.99,
    rating: 4.8,
    reviewCount: 12847,
    screenshots: [],
    icon: 'gamepad',
    installed: false,
    featured: true,
    editorChoice: true,
    releaseDate: '2024-01-25',
    ageRating: '16+',
    requirements: ['macOS 11.0 or later', '8GB RAM', 'Graphics Card']
  },
  {
    id: 'video-tube',
    name: 'VideoTube',
    developer: 'WebOS Media',
    description: 'Create, share, and discover videos with the world',
    longDescription: 'VideoTube is a comprehensive video sharing platform where users can upload, watch, and interact with content. Features include multiple user accounts, video uploading, commenting system, likes/dislikes, subscriptions, search functionality, and personalized recommendations.',
    version: '3.4.1',
    size: '67.8 MB',
    category: 'social',
    price: 0,
    rating: 4.6,
    reviewCount: 45289,
    screenshots: [],
    icon: 'video',
    installed: false,
    featured: true,
    editorChoice: false,
    releaseDate: '2024-01-28',
    ageRating: '13+',
    requirements: ['macOS 10.15 or later', '4GB RAM']
  },
  {
    id: 'system-recovery',
    name: 'Recovery Tool',
    developer: 'WebOS Core',
    description: 'System recovery and repair utilities',
    longDescription: 'Advanced system recovery tools for diagnosing and repairing WebOS issues. Includes system restore, file recovery, boot repair, and emergency recovery features.',
    version: '1.0.0',
    size: '23.4 MB',
    category: 'utilities',
    price: 0,
    rating: 4.5,
    reviewCount: 1247,
    screenshots: [],
    icon: 'life-buoy',
    installed: false,
    featured: false,
    editorChoice: false,
    releaseDate: '2024-01-01',
    ageRating: '4+',
    requirements: ['WebOS 1.0 or later']
  },
  {
    id: 'system-diagnostics',
    name: 'System Diagnostics',
    developer: 'WebOS Core',
    description: 'Comprehensive system health monitoring',
    longDescription: 'Monitor system health, performance metrics, and detect potential issues before they become problems. Includes hardware diagnostics, software analysis, and optimization recommendations.',
    version: '1.2.1',
    size: '18.7 MB',
    category: 'utilities',
    price: 0,
    rating: 4.7,
    reviewCount: 856,
    screenshots: [],
    icon: 'stethoscope',
    installed: false,
    featured: false,
    editorChoice: false,
    releaseDate: '2024-01-15',
    ageRating: '4+',
    requirements: ['WebOS 1.0 or later']
  },
  {
    id: 'crypto-tracker',
    name: 'CryptoWatch',
    developer: 'FinTech Solutions',
    description: 'Real-time cryptocurrency prices and market analysis',
    longDescription: 'Track live cryptocurrency prices, market cap, trading volume, and price charts. Features include portfolio tracking, price alerts, market news, and detailed analytics for Bitcoin, Ethereum, and hundreds of other cryptocurrencies.',
    version: '2.3.1',
    size: '34.8 MB',
    category: 'utilities',
    price: 0,
    rating: 4.6,
    reviewCount: 5847,
    screenshots: [],
    icon: 'trending-up',
    installed: false,
    featured: true,
    editorChoice: false,
    releaseDate: '2024-01-12',
    ageRating: '4+',
    requirements: ['WebOS 1.0 or later', 'Internet connection']
  },
  {
    id: 'game-center',
    name: 'GameHub',
    developer: 'Gaming Studios',
    description: 'Ultimate gaming platform with hundreds of games',
    longDescription: 'Access a vast library of games including puzzle games, arcade classics, strategy games, and multiplayer experiences. Features include achievement tracking, leaderboards, cloud saves, and social gaming features.',
    version: '3.1.4',
    size: '156.2 MB',
    category: 'games',
    price: 0,
    rating: 4.8,
    reviewCount: 12847,
    screenshots: [],
    icon: 'gamepad-2',
    installed: false,
    featured: true,
    editorChoice: true,
    releaseDate: '2024-01-18',
    ageRating: '12+',
    requirements: ['WebOS 1.0 or later', '4GB RAM', 'Graphics acceleration']
  },
  {
    id: 'news-center',
    name: 'NewsReader Pro',
    developer: 'Media Corp',
    description: 'Breaking news and headlines from around the world',
    longDescription: 'Stay informed with real-time news from trusted sources worldwide. Features include customizable news feeds, breaking news alerts, offline reading, article bookmarking, and news from categories like technology, sports, politics, and entertainment.',
    version: '1.8.2',
    size: '28.9 MB',
    category: 'social',
    price: 0,
    rating: 4.4,
    reviewCount: 3926,
    screenshots: [],
    icon: 'newspaper',
    installed: false,
    featured: false,
    editorChoice: false,
    releaseDate: '2024-01-22',
    ageRating: '4+',
    requirements: ['WebOS 1.0 or later', 'Internet connection']
  },
  {
    id: 'video-tube',
    name: 'VideoTube',
    developer: 'WebOS Media',
    description: 'Create, share, and discover videos with diverse content',
    longDescription: 'VideoTube features a vast collection of content including Linux tutorials, JavaScript and TypeScript programming courses, custom programming language development, gaming content from popular creators like Sampey and DanTDM, Roblox gameplay, Team Fortress 2 SFM animations, and much more.',
    version: '4.2.0',
    size: '89.4 MB',
    category: 'social',
    price: 0,
    rating: 4.7,
    reviewCount: 18547,
    screenshots: [],
    icon: 'video',
    installed: false,
    featured: true,
    editorChoice: true,
    releaseDate: '2024-02-01',
    ageRating: '13+',
    requirements: ['WebOS 1.0 or later', 'Internet connection', '2GB RAM']
  }
];

export const AppStore: FC = () => {
  const [apps, setApps] = useState<AppInfo[]>(allApps);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const [installingApps, setInstallingApps] = useState<Set<string>>(new Set());
  const [uninstallingApps, setUninstallingApps] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Real app installation system
  const installApp = async (app: AppInfo) => {
    setInstallingApps(prev => {
      const newSet = new Set(prev);
      newSet.add(app.id);
      return newSet;
    });
    
    try {
      // Simulate installation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add app to desktop
      const desktopApps = JSON.parse(localStorage.getItem('desktop-apps') || '[]');
      const newApp = {
        id: app.id,
        name: app.name,
        icon: app.icon,
        description: app.description
      };
      
      desktopApps.push(newApp);
      localStorage.setItem('desktop-apps', JSON.stringify(desktopApps));
      
      // Update app state
      setApps(prev => prev.map(a => 
        a.id === app.id ? { ...a, installed: true } : a
      ));
      
      // Trigger desktop refresh
      window.dispatchEvent(new CustomEvent('appsUpdated'));
      
      toast({
        title: 'Installation Complete',
        description: `${app.name} has been installed successfully`
      });
      
    } catch (error) {
      toast({
        title: 'Installation Failed',
        description: 'An error occurred during installation',
        variant: 'destructive'
      });
    } finally {
      setInstallingApps(prev => {
        const newSet = new Set(prev);
        newSet.delete(app.id);
        return newSet;
      });
    }
  };

  const uninstallApp = async (app: AppInfo) => {
    setUninstallingApps(prev => {
      const newSet = new Set(prev);
      newSet.add(app.id);
      return newSet;
    });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove app from desktop
      const desktopApps = JSON.parse(localStorage.getItem('desktop-apps') || '[]');
      const filteredApps = desktopApps.filter((a: any) => a.id !== app.id);
      localStorage.setItem('desktop-apps', JSON.stringify(filteredApps));
      
      // Update app state
      setApps(prev => prev.map(a => 
        a.id === app.id ? { ...a, installed: false } : a
      ));
      
      // Trigger desktop refresh
      window.dispatchEvent(new CustomEvent('appsUpdated'));
      
      toast({
        title: 'Uninstalled',
        description: `${app.name} has been removed`
      });
      
    } catch (error) {
      toast({
        title: 'Uninstall Failed',
        description: 'An error occurred during uninstallation',
        variant: 'destructive'
      });
    } finally {
      setUninstallingApps(prev => {
        const newSet = new Set(prev);
        newSet.delete(app.id);
        return newSet;
      });
    }
  };

  // Check which apps are already installed on desktop
  useEffect(() => {
    const checkInstalledApps = () => {
      const desktopApps = JSON.parse(localStorage.getItem('desktop-apps') || '[]');
      const installedAppIds = new Set(desktopApps.map((app: any) => app.id));
      
      setApps(prev => prev.map(app => ({
        ...app,
        installed: installedAppIds.has(app.id)
      })));
    };

    checkInstalledApps();

    // Listen for desktop changes
    const handleDesktopRefresh = () => {
      checkInstalledApps();
    };

    window.addEventListener('desktop-refresh', handleDesktopRefresh);
    return () => {
      window.removeEventListener('desktop-refresh', handleDesktopRefresh);
    };
  }, []);

  const categories = [
    { id: 'all', name: 'All Categories', icon: Grid3X3 },
    { id: 'featured', name: 'Featured', icon: Star },
    { id: 'productivity', name: 'Productivity', icon: Users },
    { id: 'games', name: 'Games', icon: Award },
    { id: 'creative', name: 'Creative', icon: Heart },
    { id: 'utilities', name: 'Utilities', icon: TrendingUp },
    { id: 'developer', name: 'Developer', icon: Terminal }
  ];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.developer.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'featured') return matchesSearch && app.featured;
    return matchesSearch && app.category === selectedCategory;
  });

  const handleInstallApp = async (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    setInstallingApps(prev => new Set([...Array.from(prev), appId]));
    
    // Simulate installation
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    setApps(prev => prev.map(a => 
      a.id === appId ? { ...a, installed: true } : a
    ));

    // Create desktop shortcut
    const desktopApps = JSON.parse(localStorage.getItem('desktop-apps') || '[]');
    const newApp = {
      id: appId,
      name: app.name,
      icon: app.icon,
      description: app.description
    };
    
    if (!desktopApps.find((a: any) => a.id === appId)) {
      desktopApps.push(newApp);
      localStorage.setItem('desktop-apps', JSON.stringify(desktopApps));
      window.dispatchEvent(new CustomEvent('desktop-refresh'));
    }
    
    const currentInstalling = Array.from(installingApps);
    setInstallingApps(new Set(currentInstalling.filter(id => id !== appId)));

    toast({
      title: "App Installed",
      description: `${app.name} has been installed successfully`,
    });
  };

  const handleUninstallApp = async (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    setUninstallingApps(prev => new Set([...Array.from(prev), appId]));
    
    // Simulate uninstallation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setApps(prev => prev.map(a => 
      a.id === appId ? { ...a, installed: false } : a
    ));

    // Remove desktop shortcut
    const desktopApps = JSON.parse(localStorage.getItem('desktop-apps') || '[]');
    const updatedApps = desktopApps.filter((a: any) => a.id !== appId);
    localStorage.setItem('desktop-apps', JSON.stringify(updatedApps));
    window.dispatchEvent(new CustomEvent('desktop-refresh'));
    
    const currentUninstalling = Array.from(uninstallingApps);
    setUninstallingApps(new Set(currentUninstalling.filter(id => id !== appId)));

    toast({
      title: "App Uninstalled",
      description: `${app.name} has been removed from your system`,
    });
  };

  const renderStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  if (selectedApp) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedApp(null)} className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Back to Store
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Share className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* App Details */}
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl font-bold">{selectedApp.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{selectedApp.name}</h1>
                      <p className="text-lg text-blue-600 dark:text-blue-400 mb-2">{selectedApp.developer}</p>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          {renderStarRating(selectedApp.rating)}
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                            {selectedApp.rating} • {selectedApp.reviewCount.toLocaleString()} reviews
                          </span>
                        </div>
                        <Badge variant="secondary">{selectedApp.ageRating}</Badge>
                        {selectedApp.editorChoice && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            Editor's Choice
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {formatPrice(selectedApp.price)}
                      </div>
                      {selectedApp.installed ? (
                        <Button 
                          onClick={() => handleUninstallApp(selectedApp.id)}
                          disabled={uninstallingApps.has(selectedApp.id)}
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-8 py-2 rounded-full font-semibold"
                        >
                          {uninstallingApps.has(selectedApp.id) ? 'Uninstalling...' : 'Uninstall'}
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleInstallApp(selectedApp.id)}
                          disabled={installingApps.has(selectedApp.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full font-semibold"
                        >
                          {installingApps.has(selectedApp.id) ? 'Installing...' : 
                           selectedApp.price === 0 ? 'Get' : 'Buy'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4">About this app</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    {selectedApp.longDescription}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Version</span>
                          <span>{selectedApp.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Size</span>
                          <span>{selectedApp.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Category</span>
                          <span className="capitalize">{selectedApp.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Updated</span>
                          <span>{new Date(selectedApp.releaseDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Compatibility</h3>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {selectedApp.requirements.map((req, index) => (
                          <div key={index}>{req}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Ratings and Reviews</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold">{selectedApp.rating}</div>
                      <div className="flex justify-center gap-1 my-2">
                        {renderStarRating(selectedApp.rating)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedApp.reviewCount.toLocaleString()} reviews
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">App Store</h1>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-full"
          />
        </div>
      </div>

      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 p-4">
          <nav className="space-y-1">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Featured Apps Banner */}
          {selectedCategory === 'all' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Featured Apps</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">{app.name.charAt(0)}</span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{app.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{app.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {renderStarRating(app.rating)}
                          <span className="text-xs text-gray-500 ml-1">{app.rating}</span>
                        </div>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {formatPrice(app.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apps Grid/List */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedCategory === 'all' ? 'All Apps' : 
                 selectedCategory === 'featured' ? 'Featured Apps' :
                 categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <span className="text-sm text-gray-500">
                {filteredApps.length} apps
              </span>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-4"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center mb-3">
                      <span className="text-white text-xl font-bold">{app.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{app.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{app.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {renderStarRating(app.rating)}
                        <span className="text-xs text-gray-500 ml-1">{app.rating}</span>
                      </div>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {formatPrice(app.price)}
                      </span>
                    </div>
                    {app.editorChoice && (
                      <Badge className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                        Editor's Choice
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer p-4 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">{app.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{app.name}</h3>
                        {app.editorChoice && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                            Editor's Choice
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{app.description}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {renderStarRating(app.rating)}
                          <span className="text-xs text-gray-500 ml-1">{app.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">{app.size}</span>
                        <span className="text-xs text-gray-500 capitalize">{app.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                        {formatPrice(app.price)}
                      </div>
                      {app.installed ? (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUninstallApp(app.id);
                          }}
                          disabled={uninstallingApps.has(app.id)}
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full px-4"
                        >
                          {uninstallingApps.has(app.id) ? 'Uninstalling...' : 'Uninstall'}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInstallApp(app.id);
                          }}
                          disabled={installingApps.has(app.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4"
                        >
                          {installingApps.has(app.id) ? 'Installing...' : 
                           app.price === 0 ? 'Get' : 'Buy'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};