import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  Star, 
  Plus, 
  X, 
  Search,
  Shield,
  Download,
  Menu,
  Globe,
  History,
  BookmarkPlus
} from 'lucide-react';
import { soundManager } from '@/lib/soundManager';

interface Tab {
  id: string;
  title: string;
  url: string;
  isLoading: boolean;
  favicon?: string;
  content?: string;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

interface HistoryEntry {
  id: string;
  title: string;
  url: string;
  timestamp: Date;
}

const defaultBookmarks: Bookmark[] = [
  { id: '1', title: 'WebOS Search', url: 'webos://search', favicon: '🔍' },
  { id: '2', title: 'WebOS Home', url: 'webos://home', favicon: '🏠' },
  { id: '3', title: 'WebOS Apps', url: 'webos://apps', favicon: '📱' },
  { id: '4', title: 'Settings', url: 'webos://settings', favicon: '⚙️' },
  { id: '5', title: 'Terminal', url: 'webos://terminal', favicon: '💻' },
  { id: '6', title: 'File Manager', url: 'webos://files', favicon: '📁' }
];

// Search engine functionality
const searchEngines = {
  webos: {
    name: 'WebOS Search',
    url: (query: string) => `webos://search?q=${encodeURIComponent(query)}`,
    suggestion: (query: string) => `Search WebOS for "${query}"`
  },
  google: {
    name: 'Google',
    url: (query: string) => `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    suggestion: (query: string) => `Search Google for "${query}"`
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: (query: string) => `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
    suggestion: (query: string) => `Search DuckDuckGo for "${query}"`
  },
  wikipedia: {
    name: 'Wikipedia',
    url: (query: string) => `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
    suggestion: (query: string) => `Search Wikipedia for "${query}"`
  }
};

const webContent: Record<string, { title: string; content: string }> = {
  'webos://home': {
    title: 'WebOS - Home',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: white;">
        <header style="text-align: center; margin-bottom: 60px;">
          <h1 style="font-size: 3rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Welcome to WebOS</h1>
          <p style="font-size: 1.2rem; opacity: 0.9;">A powerful web-based operating system built with modern technologies</p>
        </header>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-bottom: 40px;">
          <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; text-align: center; backdrop-filter: blur(10px);">
            <h2 style="margin-bottom: 15px;">🚀 Getting Started</h2>
            <p>Explore the desktop, open applications, and customize your experience.</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; text-align: center; backdrop-filter: blur(10px);">
            <h2 style="margin-bottom: 15px;">💻 Terminal</h2>
            <p>Access the powerful terminal with 60+ commands including package management.</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; text-align: center; backdrop-filter: blur(10px);">
            <h2 style="margin-bottom: 15px;">🎮 Applications</h2>
            <p>Use the built-in applications including IDE, games, and productivity tools.</p>
          </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); padding: 40px; border-radius: 15px; backdrop-filter: blur(10px);">
          <h2 style="margin-bottom: 20px; text-align: center;">System Information</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div><strong>OS:</strong> WebOS (Arch Linux based)</div>
            <div><strong>Architecture:</strong> x86_64</div>
            <div><strong>Kernel:</strong> 6.6.8-arch1-1</div>
            <div><strong>Package Manager:</strong> pacman</div>
            <div><strong>Desktop:</strong> Custom Web Environment</div>
            <div><strong>Browser:</strong> WebOS Browser v1.0</div>
          </div>
        </div>
      </div>
    `
  },
  'webos://apps': {
    title: 'WebOS - Applications',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%); min-height: 100vh; color: white;">
        <h1 style="text-align: center; margin-bottom: 40px; font-size: 2.5rem;">WebOS Applications</h1>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 10px;">💻</div>
            <h3>Terminal</h3>
            <p>Full-featured terminal with 60+ commands</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 10px;">📁</div>
            <h3>File Manager</h3>
            <p>Browse and manage your files</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 10px;">🎮</div>
            <h3>Retro Emulator</h3>
            <p>Play classic games</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 10px;">🔧</div>
            <h3>IDE</h3>
            <p>Code editor with syntax highlighting</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 10px;">⚙️</div>
            <h3>Settings</h3>
            <p>Customize your WebOS experience</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 10px;">📥</div>
            <h3>Download Manager</h3>
            <p>Manage your downloads</p>
          </div>
        </div>
      </div>
    `
  },
  'webos://settings': {
    title: 'WebOS - Settings',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); min-height: 100vh; color: white;">
        <h1 style="text-align: center; margin-bottom: 40px;">WebOS Settings</h1>
        
        <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; margin-bottom: 20px;">
          <h2>Customization</h2>
          <p>• Choose from 12+ beautiful wallpaper gradients</p>
          <p>• Upload custom background images</p>
          <p>• Light and dark theme options</p>
          <p>• Desktop icon visibility controls</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; margin-bottom: 20px;">
          <h2>Audio</h2>
          <p>• System-wide sound effects</p>
          <p>• Volume controls</p>
          <p>• Notification sounds</p>
          <p>• Interactive sound testing</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px;">
          <h2>System</h2>
          <p>• Power management</p>
          <p>• Account settings</p>
          <p>• Factory reset options</p>
          <p>• Multi-user support</p>
        </div>
      </div>
    `
  },
  'webos://terminal': {
    title: 'WebOS - Terminal Guide',
    content: `
      <div style="font-family: 'Courier New', monospace; max-width: 1000px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #00ff00; min-height: 100vh;">
        <h1 style="color: #00ff00; text-align: center; margin-bottom: 30px;">WebOS Terminal</h1>
        
        <div style="background: #111; padding: 20px; border: 1px solid #333; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #ffff00;">System Commands</h2>
          <p>ls, pwd, cd, mkdir, touch, cat, tree, ps, top, free, df, lscpu, lsblk</p>
        </div>
        
        <div style="background: #111; padding: 20px; border: 1px solid #333; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #ffff00;">Network Tools</h2>
          <p>ping, curl, wget, netstat, ifconfig, ip</p>
        </div>
        
        <div style="background: #111; padding: 20px; border: 1px solid #333; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #ffff00;">Development</h2>
          <p>git, node, npm, python, vim, nano, code</p>
        </div>
        
        <div style="background: #111; padding: 20px; border: 1px solid #333; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #ffff00;">Package Management</h2>
          <p>pacman, yay, flatpak</p>
        </div>
        
        <div style="background: #111; padding: 20px; border: 1px solid #333; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #ffff00;">Fun Commands</h2>
          <p>matrix, hack, cowsay, fortune, cmatrix, neofetch</p>
        </div>
        
        <div style="background: #111; padding: 20px; border: 1px solid #333; border-radius: 5px;">
          <h2 style="color: #ffff00;">Application Launchers</h2>
          <p>browser, downloads, emulator, roblox, code</p>
        </div>
      </div>
    `
  },
  'webos://files': {
    title: 'WebOS - File System',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #16a085 0%, #f4d03f 100%); min-height: 100vh; color: white;">
        <h1 style="text-align: center; margin-bottom: 40px;">WebOS File System</h1>
        
        <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; font-family: monospace;">
          <h2>Directory Structure</h2>
          <pre style="color: #fff; font-size: 14px;">
/
├── home/
│   ├── user/
│   │   ├── Desktop/
│   │   ├── Documents/
│   │   ├── Downloads/
│   │   ├── Music/
│   │   ├── Pictures/
│   │   └── Videos/
│   └── .config/
│       ├── webos/
│       └── applications/
├── etc/
│   ├── motd
│   └── passwd
├── usr/
│   ├── bin/
│   ├── sbin/
│   └── share/
└── var/
    ├── log/
    └── tmp/
          </pre>
        </div>
      </div>
    `
  },
  'webos://search': {
    title: 'WebOS Search Engine',
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #4285f4 0%, #34a853 50%, #fbbc05 75%, #ea4335 100%); min-height: 100vh; color: white;">
        <div style="text-align: center; padding: 100px 20px;">
          <h1 style="font-size: 4rem; margin-bottom: 30px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">WebOS Search</h1>
          <p style="font-size: 1.2rem; margin-bottom: 40px; opacity: 0.9;">Your gateway to the web and WebOS ecosystem</p>
          
          <div style="max-width: 600px; margin: 0 auto;">
            <div style="background: rgba(255,255,255,0.95); border-radius: 25px; padding: 15px 25px; margin-bottom: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
              <input 
                type="text" 
                placeholder="Search the web or WebOS..." 
                style="width: 100%; border: none; outline: none; font-size: 1.1rem; padding: 10px; background: transparent; color: #333;"
                onkeydown="if(event.key==='Enter') window.parent.postMessage({type:'search', query: event.target.value}, '*')"
              />
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 40px;">
              <button onclick="window.parent.postMessage({type:'quickSearch', engine: 'google', query: ''}, '*')" style="background: rgba(255,255,255,0.2); border: none; padding: 15px; border-radius: 10px; color: white; font-size: 1rem; cursor: pointer; transition: all 0.3s;">
                🔍 Google Search
              </button>
              <button onclick="window.parent.postMessage({type:'quickSearch', engine: 'wikipedia', query: ''}, '*')" style="background: rgba(255,255,255,0.2); border: none; padding: 15px; border-radius: 10px; color: white; font-size: 1rem; cursor: pointer; transition: all 0.3s;">
                📚 Wikipedia
              </button>
              <button onclick="window.parent.postMessage({type:'quickSearch', engine: 'duckduckgo', query: ''}, '*')" style="background: rgba(255,255,255,0.2); border: none; padding: 15px; border-radius: 10px; color: white; font-size: 1rem; cursor: pointer; transition: all 0.3s;">
                🦆 DuckDuckGo
              </button>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px);">
              <h3 style="margin-bottom: 20px;">Quick Links</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                <a href="webos://home" style="color: white; text-decoration: none; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px; text-align: center;">🏠 WebOS Home</a>
                <a href="webos://apps" style="color: white; text-decoration: none; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px; text-align: center;">📱 Applications</a>
                <a href="webos://terminal" style="color: white; text-decoration: none; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px; text-align: center;">💻 Terminal</a>
                <a href="webos://settings" style="color: white; text-decoration: none; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px; text-align: center;">⚙️ Settings</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
};

export const WebBrowser: FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'WebOS Search', url: 'webos://search', isLoading: false }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(defaultBookmarks);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [addressBarValue, setAddressBarValue] = useState('webos://search');
  const [selectedSearchEngine, setSelectedSearchEngine] = useState('webos');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  useEffect(() => {
    if (activeTab) {
      setAddressBarValue(activeTab.url);
      loadContent(activeTab.url);
    }
  }, [activeTabId]);

  // Listen for search messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'search') {
        const query = event.data.query;
        if (query) {
          const searchUrl = searchEngines[selectedSearchEngine as keyof typeof searchEngines].url(query);
          navigate(searchUrl);
        }
      } else if (event.data?.type === 'quickSearch') {
        const engine = event.data.engine;
        const query = event.data.query || '';
        if (engine && searchEngines[engine as keyof typeof searchEngines]) {
          const searchUrl = searchEngines[engine as keyof typeof searchEngines].url(query || 'WebOS');
          navigate(searchUrl);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedSearchEngine]);

  const loadContent = (url: string) => {
    const content = webContent[url];
    if (content && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(content.content);
        doc.close();
        
        // Update tab title
        setTabs(prev => prev.map(tab => 
          tab.id === activeTabId ? { ...tab, title: content.title, isLoading: false } : tab
        ));
      }
    } else if (url.startsWith('http')) {
      // Handle external URLs with proxy support
      if (iframeRef.current) {
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        
        setTabs(prev => prev.map(tab => 
          tab.id === activeTabId ? { ...tab, isLoading: true } : tab
        ));

        // Try to load through proxy first
        fetch(proxyUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            return response.text();
          })
          .then(html => {
            if (iframeRef.current) {
              const iframe = iframeRef.current;
              const doc = iframe.contentDocument || iframe.contentWindow?.document;
              if (doc) {
                doc.open();
                // Fix relative URLs and resources
                const baseUrl = new URL(url).origin;
                const fixedHtml = html
                  .replace(/href="\/([^"]*)/g, `href="${baseUrl}/$1`)
                  .replace(/src="\/([^"]*)/g, `src="${baseUrl}/$1`)
                  .replace(/url\(\/([^)]*)/g, `url(${baseUrl}/$1`);
                
                doc.write(fixedHtml);
                doc.close();
                
                // Update tab title from page content
                const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                if (titleMatch) {
                  setTabs(prev => prev.map(tab => 
                    tab.id === activeTabId ? { 
                      ...tab, 
                      title: titleMatch[1].substring(0, 50),
                      isLoading: false 
                    } : tab
                  ));
                } else {
                  setTabs(prev => prev.map(tab => 
                    tab.id === activeTabId ? { ...tab, isLoading: false } : tab
                  ));
                }
              }
            }
          })
          .catch((error) => {
            console.log('Proxy failed, using direct iframe:', error);
            // Fallback to direct iframe loading with better error handling
            if (iframeRef.current) {
              const iframe = iframeRef.current;
              iframe.src = url;
              
              const handleLoad = () => {
                setTabs(prev => prev.map(tab => 
                  tab.id === activeTabId ? { ...tab, isLoading: false } : tab
                ));
                iframe.removeEventListener('load', handleLoad);
                iframe.removeEventListener('error', handleError);
              };
              
              const handleError = () => {
                setTabs(prev => prev.map(tab => 
                  tab.id === activeTabId ? { ...tab, isLoading: false } : tab
                ));
                // Show connection error page
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (doc) {
                  doc.open();
                  doc.write(`
                    <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f0f0; min-height: 100vh;">
                      <h1 style="color: #e74c3c;">Connection Failed</h1>
                      <p>Unable to connect to "${url}"</p>
                      <p>The site may be unreachable or blocked by CORS policy.</p>
                      <button onclick="window.location.reload()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Try Again
                      </button>
                    </div>
                  `);
                  doc.close();
                }
                iframe.removeEventListener('load', handleLoad);
                iframe.removeEventListener('error', handleError);
              };
              
              iframe.addEventListener('load', handleLoad);
              iframe.addEventListener('error', handleError);
            }
          });
      }
    } else {
      // Show 404 page for unknown URLs
      if (iframeRef.current) {
        const iframe = iframeRef.current;
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(`
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f0f0f0; min-height: 100vh;">
              <h1 style="color: #e74c3c;">404 - Page Not Found</h1>
              <p>The page "${url}" could not be found.</p>
              <p>Try visiting one of the WebOS pages like webos://home</p>
            </div>
          `);
          doc.close();
        }
      }
    }
  };

  const navigate = (url: string) => {
    if (!activeTab) return;
    
    // Add to history
    const historyEntry: HistoryEntry = {
      id: Date.now().toString(),
      title: activeTab.title,
      url: activeTab.url,
      timestamp: new Date()
    };
    setHistory(prev => [historyEntry, ...prev.slice(0, 99)]);

    // Update active tab
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId ? { ...tab, url, isLoading: true } : tab
    ));
    setAddressBarValue(url);
    loadContent(url);
    soundManager.play('click');
  };

  const createNewTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: 'WebOS Search',
      url: 'webos://search',
      isLoading: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    soundManager.play('open');
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return; // Don't close the last tab
    
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    
    if (activeTabId === tabId) {
      const tabIndex = tabs.findIndex(tab => tab.id === tabId);
      const newActiveTab = tabs[tabIndex - 1] || tabs[tabIndex + 1];
      if (newActiveTab) {
        setActiveTabId(newActiveTab.id);
      }
    }
    soundManager.play('close');
  };

  const addBookmark = () => {
    if (!activeTab) return;
    
    const bookmark: Bookmark = {
      id: Date.now().toString(),
      title: activeTab.title,
      url: activeTab.url,
      favicon: '⭐'
    };
    setBookmarks(prev => [...prev, bookmark]);
    soundManager.play('success');
  };

  const handleAddressBarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let url = addressBarValue.trim();
    
    if (!url.startsWith('http') && !url.startsWith('webos://')) {
      if (url.includes('.') && !url.includes(' ')) {
        // Looks like a domain
        url = 'https://' + url;
      } else {
        // Treat as search query
        const searchEngine = searchEngines[selectedSearchEngine as keyof typeof searchEngines];
        url = searchEngine.url(url);
      }
    }
    
    navigate(url);
    setShowSuggestions(false);
  };

  const handleAddressBarChange = (value: string) => {
    setAddressBarValue(value);
    
    // Generate search suggestions
    if (value.trim() && !value.startsWith('http') && !value.startsWith('webos://')) {
      const suggestions = [
        `Search ${searchEngines[selectedSearchEngine as keyof typeof searchEngines].name} for "${value}"`,
        `Visit ${value}.com`,
        `Visit ${value}.org`,
        `Search Wikipedia for "${value}"`
      ];
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Tab Bar */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 border-b">
        <div className="flex-1 flex items-center overflow-x-auto">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`flex items-center px-4 py-2 border-r cursor-pointer min-w-0 max-w-48 ${
                activeTabId === tab.id 
                  ? 'bg-white dark:bg-gray-700 border-b-2 border-blue-500' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <span className="truncate flex-1 text-sm">{tab.title}</span>
              {tabs.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-4 w-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mx-2"
          onClick={createNewTab}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 border-b">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => window.history.forward()}>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => loadContent(activeTab?.url || 'webos://home')}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate('webos://search')}>
          <Home className="h-4 w-4" />
        </Button>
        
        <form onSubmit={handleAddressBarSubmit} className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={addressBarValue}
              onChange={(e) => handleAddressBarChange(e.target.value)}
              onFocus={() => {
                if (addressBarValue.trim() && !addressBarValue.startsWith('http') && !addressBarValue.startsWith('webos://')) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10 pr-20"
              placeholder={`Search ${searchEngines[selectedSearchEngine as keyof typeof searchEngines].name} or enter URL...`}
            />
            
            {/* Search Engine Selector */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <select
                value={selectedSearchEngine}
                onChange={(e) => setSelectedSearchEngine(e.target.value)}
                className="text-xs bg-transparent border-none outline-none cursor-pointer"
              >
                <option value="webos">WebOS</option>
                <option value="google">Google</option>
                <option value="duckduckgo">DuckDuckGo</option>
                <option value="wikipedia">Wikipedia</option>
              </select>
            </div>

            {/* Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-b-md shadow-lg z-10">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    onClick={() => {
                      if (suggestion.includes('Visit ')) {
                        const domain = suggestion.split('Visit ')[1];
                        navigate(`https://${domain}`);
                      } else if (suggestion.includes('Search ')) {
                        const query = addressBarValue.trim();
                        if (suggestion.includes('Wikipedia')) {
                          navigate(searchEngines.wikipedia.url(query));
                        } else {
                          const searchEngine = searchEngines[selectedSearchEngine as keyof typeof searchEngines];
                          navigate(searchEngine.url(query));
                        }
                      }
                      setShowSuggestions(false);
                    }}
                  >
                    <Search className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBookmarks(!showBookmarks)}
        >
          <Star className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={addBookmark}>
          <BookmarkPlus className="h-4 w-4" />
        </Button>
      </div>

      {/* Bookmarks Bar */}
      {showBookmarks && (
        <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 border-b overflow-x-auto">
          {bookmarks.map(bookmark => (
            <Button
              key={bookmark.id}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 whitespace-nowrap"
              onClick={() => navigate(bookmark.url)}
            >
              <span>{bookmark.favicon}</span>
              <span className="text-xs">{bookmark.title}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          title="WebOS Browser Content"
          onLoad={() => {
            setTabs(prev => prev.map(tab => 
              tab.id === activeTabId ? { ...tab, isLoading: false } : tab
            ));
          }}
          onError={() => {
            setTabs(prev => prev.map(tab => 
              tab.id === activeTabId ? { ...tab, isLoading: false } : tab
            ));
          }}
        />
        
        {activeTab?.isLoading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg">Loading {activeTab.url}</p>
              <p className="text-sm text-gray-500 mt-2">Connecting through WebOS proxy...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};