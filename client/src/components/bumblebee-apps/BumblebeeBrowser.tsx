import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Home, 
  Star, 
  Plus, 
  Settings, 
  Menu,
  Shield,
  Download,
  Bookmark
} from 'lucide-react';

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

interface BumblebeeBrowserProps {
  onClose: () => void;
}

export const BumblebeeBrowser: FC<BumblebeeBrowserProps> = ({ onClose }) => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'Ubuntu Home', url: 'https://ubuntu.com', favicon: '🐧' }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [addressBar, setAddressBar] = useState('https://ubuntu.com');
  const [bookmarks, setBookmarks] = useState([
    { title: 'Ubuntu', url: 'https://ubuntu.com' },
    { title: 'Mozilla Firefox', url: 'https://mozilla.org/firefox' },
    { title: 'GNOME', url: 'https://gnome.org' },
    { title: 'GitHub', url: 'https://github.com' }
  ]);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const createNewTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: 'New Tab',
      url: 'about:blank'
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setAddressBar('');
  };

  const closeTab = (tabId: string) => {
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    if (newTabs.length === 0) {
      onClose();
      return;
    }
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
      setAddressBar(newTabs[0].url);
    }
  };

  const navigateToUrl = (url: string) => {
    if (!url) return;
    
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('about:')) {
      finalUrl = `https://${url}`;
    }

    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, url: finalUrl, title: getDomainFromUrl(finalUrl) }
        : tab
    ));
    setAddressBar(finalUrl);
  };

  const getDomainFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getPageContent = (url: string) => {
    if (url === 'about:blank' || !url) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50">
          <div className="text-center">
            <div className="text-6xl mb-4">🦊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Firefox for Bumblebee OS</h2>
            <p className="text-gray-600 mb-6">Your privacy-focused browser experience</p>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {bookmarks.map((bookmark, index) => (
                <Button
                  key={index}
                  onClick={() => navigateToUrl(bookmark.url)}
                  variant="outline"
                  className="p-4 h-auto"
                >
                  <div className="text-center">
                    <div className="font-medium">{bookmark.title}</div>
                    <div className="text-sm text-gray-500">{getDomainFromUrl(bookmark.url)}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Simulate different websites
    const domain = getDomainFromUrl(url);
    
    if (domain.includes('ubuntu.com')) {
      return (
        <div className="p-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <div className="text-4xl mr-4">🐧</div>
              <h1 className="text-4xl font-bold text-orange-600">Ubuntu</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-4">The open source operating system</h2>
            <p className="text-gray-700 mb-6">
              Ubuntu is a complete Linux operating system, freely available with both community and professional support.
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Ubuntu Desktop</h3>
                <p className="text-sm text-gray-600">The open source desktop operating system</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Ubuntu Server</h3>
                <p className="text-sm text-gray-600">Secure, fast and economically scalable</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Ubuntu Core</h3>
                <p className="text-sm text-gray-600">Optimised Ubuntu for IoT and embedded systems</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (domain.includes('mozilla.org') || domain.includes('firefox')) {
      return (
        <div className="p-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <div className="text-4xl mr-4">🦊</div>
              <h1 className="text-4xl font-bold text-blue-600">Mozilla Firefox</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Fast, Private & Safe Web Browser</h2>
            <p className="text-gray-700 mb-6">
              Firefox is a free web browser backed by Mozilla, a non-profit dedicated to internet health and privacy.
            </p>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Why Firefox?</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Enhanced Tracking Protection</li>
                <li>• Private browsing with extra protection</li>
                <li>• Sync across all your devices</li>
                <li>• Thousands of extensions</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    if (domain.includes('github.com')) {
      return (
        <div className="p-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <div className="text-4xl mr-4">🐙</div>
              <h1 className="text-4xl font-bold text-gray-900">GitHub</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Where the world builds software</h2>
            <p className="text-gray-700 mb-6">
              Millions of developers and companies build, ship, and maintain their software on GitHub.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">🔧 Collaborative coding</h3>
                <p className="text-sm text-gray-600">Work together from anywhere</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">🚀 Automation & CI/CD</h3>
                <p className="text-sm text-gray-600">Built-in CI/CD and automation</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default content for other sites
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🌐</div>
          <h2 className="text-xl font-semibold mb-2">{domain}</h2>
          <p className="text-gray-600">Website content would be displayed here</p>
          <p className="text-sm text-gray-500 mt-2">This is a simulated browser environment</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-orange-300 w-full max-w-5xl h-[700px] flex flex-col">
      {/* Title Bar */}
      <div className="bg-orange-600 px-4 py-2 flex items-center justify-between text-white">
        <div className="flex items-center space-x-2">
          <div className="text-lg">🦊</div>
          <span className="font-medium">Firefox</span>
        </div>
        <Button onClick={onClose} size="sm" variant="ghost" className="text-white hover:bg-orange-700">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tab Bar */}
      <div className="bg-gray-200 flex items-center">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center px-4 py-2 cursor-pointer border-r border-gray-300 min-w-0 max-w-48 ${
              tab.id === activeTabId ? 'bg-white' : 'bg-gray-100 hover:bg-gray-50'
            }`}
            onClick={() => {
              setActiveTabId(tab.id);
              setAddressBar(tab.url);
            }}
          >
            <span className="mr-2">{tab.favicon || '📄'}</span>
            <span className="truncate flex-1 text-sm">{tab.title}</span>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              size="sm"
              variant="ghost"
              className="ml-2 h-6 w-6 p-0 hover:bg-gray-200"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
        <Button onClick={createNewTab} size="sm" variant="ghost" className="px-3">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation Bar */}
      <div className="bg-gray-100 px-4 py-2 flex items-center space-x-2 border-b">
        <Button size="sm" variant="ghost">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost">
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => navigateToUrl('about:blank')}>
          <Home className="w-4 h-4" />
        </Button>
        
        <div className="flex-1 flex items-center space-x-2">
          <div className="flex items-center bg-white rounded border px-3 py-1 flex-1">
            <Shield className="w-4 h-4 text-green-600 mr-2" />
            <Input
              value={addressBar}
              onChange={(e) => setAddressBar(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && navigateToUrl(addressBar)}
              className="border-0 bg-transparent flex-1 focus:ring-0"
              placeholder="Search or enter address"
            />
          </div>
          <Button size="sm" variant="ghost">
            <Star className="w-4 h-4" />
          </Button>
        </div>

        <Button size="sm" variant="ghost">
          <Download className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost">
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {activeTab && getPageContent(activeTab.url)}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 px-4 py-1 border-t text-xs text-gray-600">
        {activeTab?.url !== 'about:blank' && activeTab?.url && (
          <span>Connected to {getDomainFromUrl(activeTab.url)}</span>
        )}
      </div>
    </div>
  );
};