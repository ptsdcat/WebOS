import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Terminal, Database, Globe, Cpu, Monitor, GitBranch, Bug } from 'lucide-react';

export const DevTools: FC = () => {
  const [activeTab, setActiveTab] = useState('console');
  const [logs, setLogs] = useState<string[]>([]);
  const [command, setCommand] = useState('');

  useEffect(() => {
    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      setLogs(prev => [...prev, `[LOG] ${args.join(' ')}`].slice(-100));
      originalLog(...args);
    };

    console.error = (...args) => {
      setLogs(prev => [...prev, `[ERROR] ${args.join(' ')}`].slice(-100));
      originalError(...args);
    };

    console.warn = (...args) => {
      setLogs(prev => [...prev, `[WARN] ${args.join(' ')}`].slice(-100));
      originalWarn(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const executeCommand = () => {
    if (!command.trim()) return;

    try {
      const result = eval(command);
      setLogs(prev => [...prev, `> ${command}`, `< ${JSON.stringify(result)}`].slice(-100));
    } catch (error) {
      setLogs(prev => [...prev, `> ${command}`, `< Error: ${error}`].slice(-100));
    }

    setCommand('');
  };

  const getSystemInfo = () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      memory: (performance as any).memory ? {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1048576),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1048576),
        limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1048576)
      } : null
    };
  };

  const getNetworkInfo = () => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    } : null;
  };

  const getStorageInfo = () => {
    return {
      localStorage: {
        used: JSON.stringify(localStorage).length,
        keys: Object.keys(localStorage).length
      },
      sessionStorage: {
        used: JSON.stringify(sessionStorage).length,
        keys: Object.keys(sessionStorage).length
      }
    };
  };

  const systemInfo = getSystemInfo();
  const networkInfo = getNetworkInfo();
  const storageInfo = getStorageInfo();

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <Code className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Developer Tools</h1>
          <Badge variant="secondary">WebOS Debug</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="console">Console</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="console" className="flex-1 p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                JavaScript Console
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-auto">
                  {logs.map((log, index) => (
                    <div key={index} className={
                      log.includes('[ERROR]') ? 'text-red-400' :
                      log.includes('[WARN]') ? 'text-yellow-400' :
                      log.startsWith('>') ? 'text-blue-400' :
                      'text-green-400'
                    }>
                      {log}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="Type JavaScript command..."
                    onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
                    className="font-mono"
                  />
                  <Button onClick={executeCommand}>Execute</Button>
                  <Button variant="outline" onClick={() => setLogs([])}>Clear</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="flex-1 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Connection Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={navigator.onLine ? "default" : "destructive"}>
                    {navigator.onLine ? "Online" : "Offline"}
                  </Badge>
                </div>
                {networkInfo && (
                  <>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>{networkInfo.effectiveType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Downlink:</span>
                      <span>{networkInfo.downlink} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span>RTT:</span>
                      <span>{networkInfo.rtt} ms</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  WebOS Proxy Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Proxy Server:</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span>2.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Features:</span>
                  <span className="text-xs">Caching, Security, WebSocket</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="storage" className="flex-1 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Local Storage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span>{(storageInfo.localStorage.used / 1024).toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span>Keys:</span>
                  <span>{storageInfo.localStorage.keys}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View Details
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Session Storage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span>{(storageInfo.sessionStorage.used / 1024).toFixed(1)} KB</span>
                </div>
                <div className="flex justify-between">
                  <span>Keys:</span>
                  <span>{storageInfo.sessionStorage.keys}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="flex-1 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {systemInfo.memory ? (
                  <>
                    <div className="flex justify-between">
                      <span>Used:</span>
                      <span>{systemInfo.memory.used} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span>{systemInfo.memory.total} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Limit:</span>
                      <span>{systemInfo.memory.limit} MB</span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">Memory info not available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  Run Performance Test
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Clear Cache
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Force Garbage Collection
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="flex-1 p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">Platform:</span>
                    <span>{systemInfo.platform}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">Language:</span>
                    <span>{systemInfo.language}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">Timezone:</span>
                    <span>{systemInfo.timezone}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">Cookies:</span>
                    <Badge variant={systemInfo.cookieEnabled ? "default" : "destructive"}>
                      {systemInfo.cookieEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">Resolution:</span>
                    <span>{systemInfo.screenResolution}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">Color Depth:</span>
                    <span>{systemInfo.colorDepth} bits</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">WebOS Version:</span>
                    <span>2.0.0</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">Build:</span>
                    <span>Production</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <span className="font-medium">User Agent:</span>
                <p className="text-xs text-muted-foreground mt-1 break-all">
                  {systemInfo.userAgent}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};