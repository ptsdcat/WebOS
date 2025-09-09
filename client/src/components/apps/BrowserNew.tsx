import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, RotateCcw, Home, Plus, X, Shield, Star, StarOff, History, Search } from 'lucide-react';

interface Tab {
  id: string;
  title: string;
  url: string;
  isLoading: boolean;
  error?: string;
  favicon?: string;
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
  favicon?: string;
}

export const Browser: FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'New Tab', url: 'about:blank', isLoading: false }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [urlInput, setUrlInput] = useState('');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const stored = localStorage.getItem('webos-browser-bookmarks');
    return stored ? JSON.parse(stored) : [
      { id: '1', title: 'Google', url: 'https://google.com', favicon: '🔍' },
      { id: '2', title: 'GitHub', url: 'https://github.com', favicon: '⚡' },
      { id: '3', title: 'Stack Overflow', url: 'https://stackoverflow.com', favicon: '📚' },
      { id: '4', title: 'MDN Web Docs', url: 'https://developer.mozilla.org', favicon: '📖' }
    ];
  });
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const stored = localStorage.getItem('webos-browser-history');
    return stored ? JSON.parse(stored).map((h: any) => ({
      ...h,
      timestamp: new Date(h.timestamp)
    })) : [];
  });
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  useEffect(() => {
    localStorage.setItem('webos-browser-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('webos-browser-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url === 'about:blank' ? '' : activeTab.url);
    }
  }, [activeTabId, activeTab]);

  const addToHistory = (url: string, title: string) => {
    if (url === 'about:blank') return;
    
    const historyEntry: HistoryEntry = {
      id: Date.now().toString(),
      title: title || url,
      url,
      timestamp: new Date(),
      favicon: '🌐'
    };
    
    setHistory(prev => [historyEntry, ...prev.slice(0, 99)]);
  };

  const navigateTo = (url: string, addToHistoryFlag = true) => {
    if (!url) return;
    
    let targetUrl = url;
    let displayUrl = url;
    
    if (url === 'about:blank') {
      targetUrl = 'about:blank';
    } else {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        displayUrl = 'https://' + url;
        targetUrl = 'https://' + url;
      }
      
      targetUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
    }

    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, url: targetUrl, isLoading: true, title: 'Loading...', error: undefined }
        : tab
    ));

    setUrlInput(displayUrl);

    if (iframeRef.current && targetUrl !== 'about:blank') {
      iframeRef.current.src = targetUrl;
    }

    if (addToHistoryFlag) {
      addToHistory(displayUrl, 'Loading...');
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(urlInput);
  };

  const createNewTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      title: 'New Tab',
      url: 'about:blank',
      isLoading: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      if (newTabs.length === 0) {
        const newTab: Tab = {
          id: Date.now().toString(),
          title: 'New Tab',
          url: 'about:blank',
          isLoading: false
        };
        return [newTab];
      }
      return newTabs;
    });
    
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTabId(remainingTabs[0].id);
      }
    }
  };

  const addBookmark = () => {
    if (!activeTab || activeTab.url === 'about:blank') return;
    
    const bookmark: Bookmark = {
      id: Date.now().toString(),
      title: activeTab.title,
      url: urlInput,
      favicon: '🌐'
    };
    
    setBookmarks(prev => [...prev, bookmark]);
  };

  const removeBookmark = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  };

  const isBookmarked = bookmarks.some(b => b.url === urlInput);

  const handleIframeLoad = () => {
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, isLoading: false, title: urlInput || 'Loaded' }
        : tab
    ));
  };

  const handleIframeError = () => {
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, isLoading: false, error: 'Failed to load page', title: 'Error' }
        : tab
    ));
  };

  const goHome = () => {
    navigateTo('https://google.com');
  };

  const refresh = () => {
    if (iframeRef.current && activeTab) {
      iframeRef.current.src = activeTab.url;
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, isLoading: true }
          : tab
      ));
    }
  };

  if (showBookmarks) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Bookmarks</h2>
          <Button variant="outline" onClick={() => setShowBookmarks(false)}>
            Back to Browser
          </Button>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid gap-2">
            {bookmarks.map(bookmark => (
              <Card key={bookmark.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3" onClick={() => {
                      setShowBookmarks(false);
                      navigateTo(bookmark.url);
                    }}>
                      <span className="text-lg">{bookmark.favicon}</span>
                      <div>
                        <h3 className="font-medium">{bookmark.title}</h3>
                        <p className="text-sm text-muted-foreground">{bookmark.url}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeBookmark(bookmark.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">History</h2>
          <Button variant="outline" onClick={() => setShowHistory(false)}>
            Back to Browser
          </Button>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid gap-2">
            {history.map(entry => (
              <Card key={entry.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3" onClick={() => {
                    setShowHistory(false);
                    navigateTo(entry.url);
                  }}>
                    <span className="text-lg">{entry.favicon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium">{entry.title}</h3>
                      <p className="text-sm text-muted-foreground">{entry.url}</p>
                      <p className="text-xs text-muted-foreground">{entry.timestamp.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tab Bar */}
      <div className="flex bg-muted/30 border-b">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2 border-r cursor-pointer min-w-0 max-w-48 ${
              tab.id === activeTabId ? 'bg-background' : 'hover:bg-muted/50'
            }`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <div className="flex-1 min-w-0">
              <span className="text-sm truncate block">
                {tab.isLoading ? 'Loading...' : tab.title}
              </span>
            </div>
            {tabs.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="px-3"
          onClick={createNewTab}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 p-2 border-b bg-background">
        <Button variant="outline" size="sm" onClick={goHome}>
          <Home className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowBookmarks(true)}>
          <Star className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
          <History className="w-4 h-4" />
        </Button>
        
        <form onSubmit={handleUrlSubmit} className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter URL or search..."
              className="pl-8"
            />
            <Shield className="w-4 h-4 absolute left-2 top-3 text-muted-foreground" />
          </div>
          <Button type="submit" size="sm">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        {activeTab && activeTab.url !== 'about:blank' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={isBookmarked ? () => {
              const bookmark = bookmarks.find(b => b.url === urlInput);
              if (bookmark) removeBookmark(bookmark.id);
            } : addBookmark}
          >
            {isBookmarked ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Bookmarks Bar */}
      <div className="flex items-center gap-2 p-2 bg-muted/20 border-b overflow-x-auto">
        {bookmarks.slice(0, 8).map(bookmark => (
          <Button
            key={bookmark.id}
            variant="ghost"
            size="sm"
            className="text-xs whitespace-nowrap"
            onClick={() => navigateTo(bookmark.url)}
          >
            <span className="mr-1">{bookmark.favicon}</span>
            {bookmark.title}
          </Button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 relative bg-white">
        {activeTab?.url === 'about:blank' ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">New Tab</h2>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                {bookmarks.slice(0, 6).map(bookmark => (
                  <Card 
                    key={bookmark.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigateTo(bookmark.url)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{bookmark.favicon}</div>
                      <div className="text-sm font-medium">{bookmark.title}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={activeTab?.url}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        )}
      </div>
    </div>
  );
};