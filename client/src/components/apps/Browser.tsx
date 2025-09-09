import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Plus, X, Shield, Star, StarOff, History, Search, RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react';

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
      // Handle search queries
      if (!url.includes('.') && !url.startsWith('http')) {
        displayUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        targetUrl = `/api/proxy/site?url=${encodeURIComponent(displayUrl)}&mode=embed`;
      } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
        displayUrl = 'https://' + url;
        targetUrl = `/api/proxy/site?url=${encodeURIComponent(displayUrl)}&mode=embed`;
      } else {
        // Use enhanced site proxy for better compatibility
        targetUrl = `/api/proxy/site?url=${encodeURIComponent(url)}&mode=embed`;
      }
    }

    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, url: targetUrl, isLoading: true, title: 'Loading...', error: undefined }
        : tab
    ));

    setUrlInput(displayUrl);

    // Update iframe immediately for better responsiveness
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
        ? { ...tab, isLoading: false, title: getPageTitle(), error: undefined }
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

  const getPageTitle = () => {
    try {
      if (iframeRef.current?.contentDocument?.title) {
        return iframeRef.current.contentDocument.title;
      }
    } catch (e) {
      // Cross-origin restrictions
    }
    return urlInput?.replace(/^https?:\/\//, '').replace(/^www\./, '') || 'New Tab';
  };

  const goBack = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.back();
      } catch (e) {
        console.warn('Cannot go back in iframe');
      }
    }
  };

  const goForward = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.forward();
      } catch (e) {
        console.warn('Cannot go forward in iframe');
      }
    }
  };

  const goHome = () => {
    navigateTo('about:blank');
  };

  const navigateToPopularSite = (site: string) => {
    navigateTo(`/api/proxy/popular/${site}`);
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
    <div className="w-full h-full flex flex-col bg-background">
      {/* Tab Bar */}
      <div className="flex bg-muted/30 border-b overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-3 py-2 border-r cursor-pointer min-w-0 max-w-40 flex-shrink-0 ${
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
                className="h-5 w-5 p-0 flex-shrink-0"
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
          className="px-3 flex-shrink-0"
          onClick={createNewTab}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 p-2 border-b bg-background">
        <Button variant="outline" size="sm" onClick={goBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={goForward}>
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={goHome}>
          <Home className="w-4 h-4" />
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
          <div className="h-full flex items-center justify-center p-8 overflow-y-auto">
            <div className="text-center max-w-4xl">
              <h2 className="text-3xl font-bold mb-6 text-primary">WebOS Browser</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Enhanced proxy system for secure, fast browsing with advanced compatibility
              </p>
              
              {/* Popular Sites Grid */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Popular Sites</h3>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-6">
                  {[
                    { id: 'github', name: 'GitHub', icon: '⚡', color: 'bg-gray-900' },
                    { id: 'stackoverflow', name: 'Stack Overflow', icon: '📚', color: 'bg-orange-500' },
                    { id: 'reddit', name: 'Reddit', icon: '📢', color: 'bg-orange-600' },
                    { id: 'wikipedia', name: 'Wikipedia', icon: '📖', color: 'bg-gray-700' },
                    { id: 'youtube', name: 'YouTube', icon: '📺', color: 'bg-red-600' },
                    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-blue-500' },
                    { id: 'hackernews', name: 'Hacker News', icon: '🔥', color: 'bg-orange-400' },
                    { id: 'medium', name: 'Medium', icon: '✍️', color: 'bg-green-600' },
                    { id: 'dev', name: 'Dev.to', icon: '💻', color: 'bg-black' },
                    { id: 'codepen', name: 'CodePen', icon: '🎨', color: 'bg-gray-800' },
                    { id: 'replit', name: 'Replit', icon: '🔧', color: 'bg-blue-600' },
                    { id: 'codesandbox', name: 'CodeSandbox', icon: '📦', color: 'bg-yellow-500' }
                  ].map(site => (
                    <Card 
                      key={site.id} 
                      className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                      onClick={() => navigateToPopularSite(site.id)}
                    >
                      <CardContent className="p-3 text-center">
                        <div className={`w-12 h-12 ${site.color} rounded-lg flex items-center justify-center text-white text-xl mb-2 mx-auto`}>
                          {site.icon}
                        </div>
                        <div className="text-xs font-medium">{site.name}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Search Engines */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Search Engines</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { engine: 'google', name: 'Google', icon: '🔍', desc: 'Most popular search', url: 'https://www.google.com/search?q=programming' },
                    { engine: 'bing', name: 'Bing', icon: '🅱️', desc: 'Microsoft search', url: 'https://www.bing.com/search?q=programming' },
                    { engine: 'duckduckgo', name: 'DuckDuckGo', icon: '🦆', desc: 'Privacy focused', url: '/api/proxy/search?q=programming&engine=duckduckgo' },
                    { engine: 'yandex', name: 'Yandex', icon: '🟡', desc: 'Russian search', url: '/api/proxy/search?q=programming&engine=yandex' }
                  ].map(search => (
                    <Card 
                      key={search.engine} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigateTo(search.url)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{search.icon}</div>
                        <div className="text-sm font-medium">{search.name}</div>
                        <div className="text-xs text-muted-foreground">{search.desc}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Your Bookmarks */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Your Bookmarks</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {bookmarks.slice(0, 6).map(bookmark => (
                    <Card 
                      key={bookmark.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigateTo(bookmark.url)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{bookmark.favicon}</div>
                        <div className="text-sm font-medium">{bookmark.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{bookmark.url}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Proxy Features */}
              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Enhanced Proxy Features</h4>
                <div className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>✓ Site compatibility mode</div>
                  <div>✓ Image & video optimization</div>
                  <div>✓ JSON API access</div>
                  <div>✓ Search engine integration</div>
                  <div>✓ Popular sites shortcuts</div>
                  <div>✓ Advanced error handling</div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab?.error ? (
          <div className="h-full flex items-center justify-center bg-red-50">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold mb-2 text-red-700">Connection Failed</h3>
              <p className="text-red-600 mb-4">
                Unable to load: {urlInput}
              </p>
              <div className="space-x-2">
                <Button onClick={refresh} variant="outline">
                  Try Again
                </Button>
                <Button onClick={() => navigateTo('https://google.com')} variant="default">
                  Go to Google
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full relative">
            {activeTab?.isLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading {urlInput}...</p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={activeTab?.url}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-navigation"
              style={{ background: 'white' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};