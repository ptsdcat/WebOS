import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Square, Monitor, HardDrive, Cpu, MemoryStick, Settings, Plus, Trash2 } from 'lucide-react';

interface VirtualMachine {
  id: string;
  name: string;
  os: string;
  status: 'running' | 'stopped' | 'paused' | 'starting' | 'stopping';
  cpu: number;
  memory: number;
  storage: number;
  network: string;
  uptime?: string;
  screenshot?: string;
}

export const VMManager: FC = () => {
  const [vms, setVms] = useState<VirtualMachine[]>([]);
  const [selectedVM, setSelectedVM] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadVirtualMachines();
  }, []);

  const loadVirtualMachines = () => {
    const mockVMs: VirtualMachine[] = [
      {
        id: 'vm1',
        name: 'Ubuntu Desktop',
        os: 'Ubuntu 22.04 LTS',
        status: 'running',
        cpu: 4,
        memory: 8192,
        storage: 50,
        network: 'NAT',
        uptime: '2h 15m',
        screenshot: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjY5MjJBIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPnVidW50dTwvdGV4dD48L3N2Zz4='
      },
      {
        id: 'vm2',
        name: 'Windows 11 Dev',
        os: 'Windows 11 Pro',
        status: 'stopped',
        cpu: 6,
        memory: 16384,
        storage: 100,
        network: 'Bridged'
      },
      {
        id: 'vm3',
        name: 'Kali Linux',
        os: 'Kali Linux 2023.4',
        status: 'paused',
        cpu: 2,
        memory: 4096,
        storage: 25,
        network: 'Host-only'
      }
    ];
    setVms(mockVMs);
  };

  const startVM = (vmId: string) => {
    setVms(prev => prev.map(vm => 
      vm.id === vmId ? { ...vm, status: 'starting' as const } : vm
    ));

    setTimeout(() => {
      setVms(prev => prev.map(vm => 
        vm.id === vmId ? { ...vm, status: 'running' as const, uptime: '0m' } : vm
      ));
    }, 3000);
  };

  const stopVM = (vmId: string) => {
    setVms(prev => prev.map(vm => 
      vm.id === vmId ? { ...vm, status: 'stopping' as const } : vm
    ));

    setTimeout(() => {
      setVms(prev => prev.map(vm => 
        vm.id === vmId ? { ...vm, status: 'stopped' as const, uptime: undefined } : vm
      ));
    }, 2000);
  };

  const pauseVM = (vmId: string) => {
    setVms(prev => prev.map(vm => 
      vm.id === vmId ? { ...vm, status: 'paused' as const } : vm
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-500">Running</Badge>;
      case 'stopped':
        return <Badge variant="outline">Stopped</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'starting':
        return <Badge variant="secondary">Starting...</Badge>;
      case 'stopping':
        return <Badge variant="secondary">Stopping...</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const selectedVMData = vms.find(vm => vm.id === selectedVM);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Monitor className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Virtual Machine Manager</h1>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New VM
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="console">Console</TabsTrigger>
            <TabsTrigger value="snapshots">Snapshots</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="overview" className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold">Virtual Machines</h2>
                
                {vms.map((vm) => (
                  <Card 
                    key={vm.id} 
                    className={`cursor-pointer transition-all ${selectedVM === vm.id ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`}
                    onClick={() => setSelectedVM(vm.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          {vm.screenshot && (
                            <img 
                              src={vm.screenshot} 
                              alt={vm.name}
                              className="w-16 h-12 rounded border object-cover"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{vm.name}</h3>
                              {getStatusBadge(vm.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">{vm.os}</p>
                            <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                              <span>{vm.cpu} vCPU</span>
                              <span>{vm.memory} MB RAM</span>
                              <span>{vm.storage} GB Storage</span>
                              {vm.uptime && <span>Uptime: {vm.uptime}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1">
                          {vm.status === 'stopped' && (
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); startVM(vm.id); }}>
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          {vm.status === 'running' && (
                            <>
                              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); pauseVM(vm.id); }}>
                                <Pause className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); stopVM(vm.id); }}>
                                <Square className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {vm.status === 'paused' && (
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); startVM(vm.id); }}>
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                {selectedVMData ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{selectedVMData.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Status:</span>
                          {getStatusBadge(selectedVMData.status)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">OS:</span>
                          <span className="text-sm">{selectedVMData.os}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Network:</span>
                          <span className="text-sm">{selectedVMData.network}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          Resources
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>CPU Usage</span>
                            <span>45%</span>
                          </div>
                          <Progress value={45} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Memory</span>
                            <span>{selectedVMData.memory} MB</span>
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Storage</span>
                            <span>{selectedVMData.storage} GB</span>
                          </div>
                          <Progress value={30} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-2">
                      <Button className="w-full" size="sm">
                        <Monitor className="h-4 w-4 mr-2" />
                        Open Console
                      </Button>
                      <Button variant="outline" className="w-full" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                      <Button variant="outline" className="w-full" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete VM
                      </Button>
                    </div>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Select a virtual machine to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="console" className="p-4">
            {selectedVMData ? (
              <Card>
                <CardHeader>
                  <CardTitle>Console - {selectedVMData.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 flex items-center justify-center">
                    {selectedVMData.status === 'running' ? (
                      <div className="text-center">
                        <Monitor className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>VM Console would be displayed here</p>
                        <p className="text-xs mt-2">WebRTC or VNC connection required</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p>Virtual machine is not running</p>
                        <p className="text-xs mt-2">Start the VM to access console</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <Monitor className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a virtual machine to access console</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="snapshots" className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>VM Snapshots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <HardDrive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No snapshots found</h3>
                  <p className="text-muted-foreground mb-4">Create snapshots to save VM states</p>
                  <Button>Create Snapshot</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Hypervisor Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Default VM Location</label>
                    <Input value="/home/user/VirtualMachines" readOnly />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Memory Allocation (MB)</label>
                    <Input type="number" value="8192" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">CPU Cores</label>
                    <Input type="number" value="4" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Network Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Default Network Mode</label>
                    <Input value="NAT" readOnly />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Host Interface</label>
                    <Input value="eth0" readOnly />
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    Configure Networks
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};