import { FC, useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, Pause, Square, RotateCcw, Settings, Monitor, Cpu, 
  HardDrive, Zap, Wifi, Download, Upload, Terminal,
  Power, PowerOff, RefreshCw, Volume2, VolumeX, 
  Maximize2, Minimize2, MoreVertical, ChevronRight
} from 'lucide-react';

interface VirtualMachine {
  id: string;
  name: string;
  os: string;
  status: 'stopped' | 'running' | 'paused' | 'booting';
  cpu: number;
  memory: number;
  storage: number;
  uptime: number;
  created: Date;
  lastUsed: Date;
}

interface SystemStats {
  cpu: number;
  memory: number;
  disk: number;
  network: { upload: number; download: number };
}

export const VirtualMachine: FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedVM, setSelectedVM] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: { upload: 0, download: 0 }
  });
  const [bootSequence, setBootSequence] = useState<string[]>([]);
  const [isBooting, setIsBooting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [virtualMachines, setVirtualMachines] = useState<VirtualMachine[]>([
    {
      id: 'vm-1',
      name: 'Ubuntu Desktop 24.04',
      os: 'ubuntu',
      status: 'stopped',
      cpu: 2,
      memory: 4096,
      storage: 25600,
      uptime: 0,
      created: new Date('2024-11-15'),
      lastUsed: new Date('2024-12-30')
    },
    {
      id: 'vm-2',
      name: 'Windows 11 Pro',
      os: 'windows',
      status: 'stopped',
      cpu: 4,
      memory: 8192,
      storage: 51200,
      uptime: 0,
      created: new Date('2024-11-20'),
      lastUsed: new Date('2024-12-28')
    },
    {
      id: 'vm-3',
      name: 'macOS Sonoma',
      os: 'macos',
      status: 'running',
      cpu: 4,
      memory: 8192,
      storage: 76800,
      uptime: 2847,
      created: new Date('2024-11-25'),
      lastUsed: new Date()
    },
    {
      id: 'vm-4',
      name: 'Alpine Linux',
      os: 'alpine',
      status: 'paused',
      cpu: 1,
      memory: 512,
      storage: 2048,
      uptime: 156,
      created: new Date('2024-12-01'),
      lastUsed: new Date('2024-12-29')
    }
  ]);

  // Simulate system stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        network: {
          upload: Math.random() * 1000,
          download: Math.random() * 5000
        }
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Update VM uptimes
  useEffect(() => {
    const interval = setInterval(() => {
      setVirtualMachines(prev => prev.map(vm => 
        vm.status === 'running' 
          ? { ...vm, uptime: vm.uptime + 1 }
          : vm
      ));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getOSIcon = (os: string) => {
    switch (os) {
      case 'ubuntu': return '🐧';
      case 'windows': return '🪟';
      case 'macos': return '🍎';
      case 'alpine': return '🏔️';
      default: return '💻';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'booting': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const startVM = async (vmId: string) => {
    const vm = virtualMachines.find(v => v.id === vmId);
    if (!vm) return;

    setIsBooting(true);
    setBootSequence([]);
    
    // Simulate boot sequence
    const bootMessages = [
      'BIOS v2.1.0 - WebOS Virtual Machine',
      'Checking system memory... OK',
      'Initializing CPU cores... OK',
      'Loading virtual hardware drivers...',
      'Starting disk check...',
      `Booting ${vm.name}...`,
      'Loading kernel modules...',
      'Mounting file systems...',
      'Starting system services...',
      'Initializing network interfaces...',
      'Boot sequence complete!'
    ];

    for (let i = 0; i < bootMessages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setBootSequence(prev => [...prev, bootMessages[i]]);
    }

    setVirtualMachines(prev => prev.map(v =>
      v.id === vmId 
        ? { ...v, status: 'running', lastUsed: new Date(), uptime: 0 }
        : v
    ));

    setIsBooting(false);
    setSelectedVM(vmId);
  };

  const stopVM = (vmId: string) => {
    setVirtualMachines(prev => prev.map(v =>
      v.id === vmId 
        ? { ...v, status: 'stopped', uptime: 0 }
        : v
    ));
  };

  const pauseVM = (vmId: string) => {
    setVirtualMachines(prev => prev.map(v =>
      v.id === vmId 
        ? { ...v, status: v.status === 'paused' ? 'running' : 'paused' }
        : v
    ));
  };

  const resetVM = (vmId: string) => {
    stopVM(vmId);
    setTimeout(() => startVM(vmId), 1000);
  };

  // Virtual screen rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderScreen = () => {
      // Clear screen
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (selectedVM) {
        const vm = virtualMachines.find(v => v.id === selectedVM);
        if (vm && vm.status === 'running') {
          // Render desktop environment
          ctx.fillStyle = '#1e40af';
          ctx.fillRect(0, 0, canvas.width, 30); // Title bar

          ctx.fillStyle = '#fff';
          ctx.font = '12px monospace';
          ctx.fillText(`${vm.name} - Virtual Desktop`, 10, 20);

          // Render desktop
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(0, 30, canvas.width, canvas.height - 30);

          // Add some desktop icons
          const icons = ['📁 Documents', '🖼️ Pictures', '⚙️ Settings', '🔧 Terminal'];
          icons.forEach((icon, i) => {
            const x = 20 + (i % 4) * 100;
            const y = 60 + Math.floor(i / 4) * 80;
            
            ctx.fillStyle = '#1e40af';
            ctx.fillRect(x, y, 80, 60);
            ctx.fillStyle = '#fff';
            ctx.font = '10px sans-serif';
            ctx.fillText(icon, x + 5, y + 40);
          });

          // Add time display
          ctx.fillStyle = '#fff';
          ctx.font = '14px monospace';
          const time = new Date().toLocaleTimeString();
          ctx.fillText(time, canvas.width - 100, 20);
        }
      }

      if (isBooting) {
        // Boot screen
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = '12px monospace';
        bootSequence.forEach((message, i) => {
          ctx.fillText(message, 10, 20 + i * 16);
        });

        // Add cursor
        const cursorY = 20 + bootSequence.length * 16;
        ctx.fillText('_', 10, cursorY);
      }
    };

    const animationFrame = requestAnimationFrame(renderScreen);
    return () => cancelAnimationFrame(animationFrame);
  }, [selectedVM, virtualMachines, isBooting, bootSequence]);

  return (
    <div className="h-full bg-gray-900 text-white">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Virtual Machine Manager</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-400 border-green-400">
                {virtualMachines.filter(vm => vm.status === 'running').length} Running
              </Badge>
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                {virtualMachines.filter(vm => vm.status === 'paused').length} Paused
              </Badge>
              <Badge variant="outline" className="text-gray-400 border-gray-400">
                {virtualMachines.filter(vm => vm.status === 'stopped').length} Stopped
              </Badge>
            </div>
          </div>

          <TabsList className="bg-gray-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gray-600">
              <Monitor className="w-4 h-4 mr-1" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="console" className="data-[state=active]:bg-gray-600">
              <Terminal className="w-4 h-4 mr-1" />
              Console
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-600">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="dashboard" className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* VM List */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      Virtual Machines
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Play className="w-4 h-4 mr-1" />
                        Create New
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {virtualMachines.map((vm) => (
                        <Card key={vm.id} className="bg-gray-700 border-gray-600 hover:bg-gray-650 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">{getOSIcon(vm.os)}</div>
                                <div>
                                  <h3 className="font-medium text-white">{vm.name}</h3>
                                  <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(vm.status)}`}></div>
                                    <span className="capitalize">{vm.status}</span>
                                    {vm.status === 'running' && (
                                      <span>• Uptime: {formatUptime(vm.uptime)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="text-right text-sm text-gray-400 mr-4">
                                  <div>{vm.cpu} CPU • {formatBytes(vm.memory * 1024 * 1024)}</div>
                                  <div>{formatBytes(vm.storage * 1024 * 1024)} Storage</div>
                                </div>

                                <div className="flex gap-1">
                                  {vm.status === 'stopped' ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-green-600 text-green-400 hover:bg-green-600"
                                      onClick={() => startVM(vm.id)}
                                    >
                                      <Play className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-yellow-600 text-yellow-400 hover:bg-yellow-600"
                                        onClick={() => pauseVM(vm.id)}
                                      >
                                        {vm.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-red-600 text-red-400 hover:bg-red-600"
                                        onClick={() => stopVM(vm.id)}
                                      >
                                        <Square className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-blue-600 text-blue-400 hover:bg-blue-600"
                                    onClick={() => resetVM(vm.id)}
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Stats */}
              <div>
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">System Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">CPU Usage</span>
                        <span className="text-white">{systemStats.cpu.toFixed(1)}%</span>
                      </div>
                      <Progress value={systemStats.cpu} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Memory</span>
                        <span className="text-white">{systemStats.memory.toFixed(1)}%</span>
                      </div>
                      <Progress value={systemStats.memory} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Disk I/O</span>
                        <span className="text-white">{systemStats.disk.toFixed(1)}%</span>
                      </div>
                      <Progress value={systemStats.disk} className="h-2" />
                    </div>

                    <div className="border-t border-gray-600 pt-4">
                      <h4 className="text-sm font-medium text-white mb-2">Network Activity</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Upload</span>
                          <span className="text-green-400">{formatBytes(systemStats.network.upload)}/s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Download</span>
                          <span className="text-blue-400">{formatBytes(systemStats.network.download)}/s</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="console" className="p-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Virtual Console
                  {selectedVM && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        {virtualMachines.find(vm => vm.id === selectedVM)?.name}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={500}
                    className="w-full bg-black border border-gray-600 rounded"
                  />
                  {!selectedVM && !isBooting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                      <div className="text-center text-gray-400">
                        <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Select a running VM to view console</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center gap-2 mt-4">
                  <Button size="sm" variant="outline" className="border-gray-600">
                    <Volume2 className="w-4 h-4 mr-1" />
                    Audio
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-600">
                    <Wifi className="w-4 h-4 mr-1" />
                    Network
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-600">
                    <HardDrive className="w-4 h-4 mr-1" />
                    Storage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Hypervisor Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default CPU Cores
                    </label>
                    <Select defaultValue="2">
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="1">1 Core</SelectItem>
                        <SelectItem value="2">2 Cores</SelectItem>
                        <SelectItem value="4">4 Cores</SelectItem>
                        <SelectItem value="8">8 Cores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default RAM (MB)
                    </label>
                    <Select defaultValue="4096">
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="512">512 MB</SelectItem>
                        <SelectItem value="1024">1 GB</SelectItem>
                        <SelectItem value="2048">2 GB</SelectItem>
                        <SelectItem value="4096">4 GB</SelectItem>
                        <SelectItem value="8192">8 GB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Storage Path
                    </label>
                    <Input 
                      defaultValue="/home/user/VirtualMachines"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Network Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Network Mode
                    </label>
                    <Select defaultValue="nat">
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="nat">NAT</SelectItem>
                        <SelectItem value="bridge">Bridged</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="host">Host-only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Virtual Network
                    </label>
                    <Input 
                      defaultValue="192.168.1.0/24"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      DHCP Range
                    </label>
                    <Input 
                      defaultValue="192.168.1.100-200"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};