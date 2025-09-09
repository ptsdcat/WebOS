import { FC, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Cpu, HardDrive, MemoryStick, Network, Info } from 'lucide-react';

interface SystemSpecs {
  cpu: {
    model: string;
    cores: number;
    threads: number;
    frequency: string;
    usage: number;
  };
  memory: {
    total: string;
    used: string;
    available: string;
    usage: number;
  };
  storage: {
    total: string;
    used: string;
    available: string;
    usage: number;
  };
  network: {
    interface: string;
    status: string;
    speed: string;
    ip: string;
  };
  uptime: string;
}

export const SystemInfo: FC = () => {
  const [systemSpecs, setSystemSpecs] = useState<SystemSpecs>({
    cpu: {
      model: 'AMD Ryzen 7 5800X',
      cores: 8,
      threads: 16,
      frequency: '3.8 GHz',
      usage: 0
    },
    memory: {
      total: '32.0 GB',
      used: '12.4 GB',
      available: '19.6 GB',
      usage: 0
    },
    storage: {
      total: '1.0 TB',
      used: '340.2 GB',
      available: '659.8 GB',
      usage: 0
    },
    network: {
      interface: 'enp3s0',
      status: 'Connected',
      speed: '1000 Mbps',
      ip: '192.168.1.42'
    },
    uptime: '0h 0m'
  });

  const systemInfo = {
    os: 'WebOS (Arch Linux)',
    kernel: '6.6.8-arch1-1',
    architecture: 'x86_64',
    desktop: 'WebOS Desktop Environment',
    shell: '/bin/bash',
    terminal: 'WebOS Terminal',
    packageManager: 'pacman',
    bootloader: 'GRUB',
    display: 'Wayland',
    hostname: 'webos-desktop',
    user: 'html',
    home: '/home/html',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: navigator.language,
    theme: localStorage.getItem('webos-theme') || 'dark'
  };

  useEffect(() => {
    // Simulate dynamic system monitoring
    const interval = setInterval(() => {
      setSystemSpecs(prev => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          usage: Math.floor(Math.random() * 100)
        },
        memory: {
          ...prev.memory,
          usage: Math.floor(Math.random() * 100)
        },
        storage: {
          ...prev.storage,
          usage: 34 // Fixed storage usage
        }
      }));
    }, 2000);

    // Update uptime
    const startTime = Date.now();
    const uptimeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      setSystemSpecs(prev => ({
        ...prev,
        uptime: `${hours}h ${minutes}m`
      }));
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(uptimeInterval);
    };
  }, []);

  return (
    <div className="h-full bg-background p-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">WebOS System Information</h1>
          <p className="text-muted-foreground">Built on Arch Linux</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="hardware">Hardware</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Operating System</CardTitle>
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemInfo.os}</div>
                  <p className="text-xs text-muted-foreground">
                    Kernel {systemInfo.kernel}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemSpecs.uptime}</div>
                  <p className="text-xs text-muted-foreground">
                    Since last boot
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemSpecs.cpu.usage}%</div>
                  <Progress value={systemSpecs.cpu.usage} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  <MemoryStick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemSpecs.memory.usage}%</div>
                  <Progress value={systemSpecs.memory.usage} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {systemSpecs.memory.used} / {systemSpecs.memory.total}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hardware" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Processor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Model</p>
                    <p className="text-sm text-muted-foreground">{systemSpecs.cpu.model}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Base Frequency</p>
                    <p className="text-sm text-muted-foreground">{systemSpecs.cpu.frequency}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cores</p>
                    <p className="text-sm text-muted-foreground">{systemSpecs.cpu.cores}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Threads</p>
                    <p className="text-sm text-muted-foreground">{systemSpecs.cpu.threads}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Current Usage</p>
                  <Progress value={systemSpecs.cpu.usage} />
                  <p className="text-xs text-muted-foreground mt-1">{systemSpecs.cpu.usage}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MemoryStick className="h-5 w-5" />
                  Memory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Total</p>
                    <p className="text-sm text-muted-foreground">{systemSpecs.memory.total}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Used</p>
                    <p className="text-sm text-muted-foreground">{systemSpecs.memory.used}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Available</p>
                    <p className="text-sm text-muted-foreground">{systemSpecs.memory.available}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Usage</p>
                  <Progress value={systemSpecs.memory.usage} />
                  <p className="text-xs text-muted-foreground mt-1">{systemSpecs.memory.usage}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Storage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Total</p>
                    <p className="text-sm text-muted-foreground">{systemSpecs.storage.total}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Used</p>
                    <p className="text-sm text-muted-foreground">{systemSpecs.storage.used}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Available</p>
                    <p className="text-sm text-muted-foreground">{systemSpecs.storage.available}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Usage</p>
                  <Progress value={systemSpecs.storage.usage} />
                  <p className="text-xs text-muted-foreground mt-1">{systemSpecs.storage.usage}%</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Operating System</p>
                      <p className="text-sm text-muted-foreground">{systemInfo.os}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Kernel Version</p>
                      <p className="text-sm text-muted-foreground">{systemInfo.kernel}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Architecture</p>
                      <p className="text-sm text-muted-foreground">{systemInfo.architecture}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Desktop Environment</p>
                      <p className="text-sm text-muted-foreground">{systemInfo.desktop}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Display Server</p>
                      <p className="text-sm text-muted-foreground">{systemInfo.display}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Package Manager</p>
                      <p className="text-sm text-muted-foreground">{systemInfo.packageManager}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Hostname</p>
                      <p className="text-sm text-muted-foreground">{systemInfo.hostname}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Current User</p>
                      <p className="text-sm text-muted-foreground">{systemInfo.user}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Home Directory</p>
                      <p className="text-sm text-muted-foreground">{systemInfo.home}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Shell</p>
                      <p className="text-sm text-muted-foreground">{systemInfo.shell}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Timezone</p>
                      <p className="text-sm text-muted-foreground">{systemInfo.timezone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Current Theme</p>
                      <Badge variant="outline">{systemInfo.theme}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Interface
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Interface</p>
                    <p className="text-sm text-muted-foreground">{systemSpecs.network.interface}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant="outline" className="text-green-600">
                      {systemSpecs.network.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Speed</p>
                    <p className="text-sm text-muted-foreground">{systemSpecs.network.speed}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">IP Address</p>
                    <p className="text-sm text-muted-foreground">{systemSpecs.network.ip}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};