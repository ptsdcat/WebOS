import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cpu, HardDrive, Wifi, Zap, Activity, MemoryStick } from 'lucide-react';

interface SystemStats {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  temperature: number;
  processes: ProcessInfo[];
}

interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  status: 'running' | 'sleeping' | 'stopped';
}

export const SystemMonitor: FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    temperature: 0,
    processes: []
  });

  const [selectedTab, setSelectedTab] = useState<'overview' | 'processes' | 'performance'>('overview');

  useEffect(() => {
    const updateStats = () => {
      // Simulate realistic system stats
      setStats({
        cpu: Math.floor(Math.random() * 100),
        memory: 65 + Math.floor(Math.random() * 20),
        disk: 78,
        network: Math.floor(Math.random() * 50),
        temperature: 45 + Math.floor(Math.random() * 15),
        processes: [
          { pid: 1, name: 'systemd', cpu: 0.1, memory: 2.3, status: 'running' },
          { pid: 789, name: 'gnome-shell', cpu: 15.2, memory: 12.8, status: 'running' },
          { pid: 1024, name: 'firefox', cpu: 25.6, memory: 18.4, status: 'running' },
          { pid: 1156, name: 'code', cpu: 8.3, memory: 9.7, status: 'running' },
          { pid: 2048, name: 'node', cpu: 12.1, memory: 15.2, status: 'running' },
          { pid: 3072, name: 'docker', cpu: 3.4, memory: 6.8, status: 'running' },
          { pid: 4096, name: 'spotify', cpu: 2.1, memory: 4.5, status: 'sleeping' }
        ]
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[600px] flex flex-col">
      <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5" />
          <span className="font-medium">System Monitor</span>
        </div>
      </div>

      <div className="flex border-b">
        {[
          { key: 'overview', label: 'Overview', icon: Activity },
          { key: 'processes', label: 'Processes', icon: Cpu },
          { key: 'performance', label: 'Performance', icon: Zap }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key as any)}
            className={`flex items-center space-x-2 px-4 py-2 ${
              selectedTab === tab.key ? 'bg-blue-50 border-b-2 border-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">CPU Usage</span>
                  </div>
                  <span className="text-lg font-bold">{stats.cpu}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getStatusColor(stats.cpu)}`}
                    style={{ width: `${stats.cpu}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MemoryStick className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Memory</span>
                  </div>
                  <span className="text-lg font-bold">{stats.memory}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getStatusColor(stats.memory)}`}
                    style={{ width: `${stats.memory}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Disk Usage</span>
                  </div>
                  <span className="text-lg font-bold">{stats.disk}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getStatusColor(stats.disk)}`}
                    style={{ width: `${stats.disk}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">Network</span>
                  </div>
                  <span className="text-lg font-bold">{stats.network} MB/s</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-orange-500"
                    style={{ width: `${stats.network * 2}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">System Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">OS:</span>
                  <span className="ml-2">WebOS 4.0 (Ubuntu 22.04 Base)</span>
                </div>
                <div>
                  <span className="text-gray-600">Kernel:</span>
                  <span className="ml-2">5.15.0-91-generic</span>
                </div>
                <div>
                  <span className="text-gray-600">CPU:</span>
                  <span className="ml-2">Intel Core i7-8565U (4 cores)</span>
                </div>
                <div>
                  <span className="text-gray-600">Memory:</span>
                  <span className="ml-2">8.0 GB DDR4</span>
                </div>
                <div>
                  <span className="text-gray-600">Temperature:</span>
                  <span className="ml-2">{stats.temperature}°C</span>
                </div>
                <div>
                  <span className="text-gray-600">Uptime:</span>
                  <span className="ml-2">2h 34m</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'processes' && (
          <div>
            <div className="mb-4">
              <h3 className="font-medium">Running Processes</h3>
              <p className="text-sm text-gray-600">Total: {stats.processes.length} processes</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">PID</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">CPU %</th>
                    <th className="text-left p-2">Memory %</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.processes.map(process => (
                    <tr key={process.pid} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono">{process.pid}</td>
                      <td className="p-2">{process.name}</td>
                      <td className="p-2">{process.cpu.toFixed(1)}%</td>
                      <td className="p-2">{process.memory.toFixed(1)}%</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          process.status === 'running' ? 'bg-green-100 text-green-800' :
                          process.status === 'sleeping' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {process.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Performance Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">CPU Performance</span>
                    <span className="text-sm font-medium">{(100 - stats.cpu)}% available</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    4 cores @ 1.8GHz • Turbo: 4.6GHz
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Memory Performance</span>
                    <span className="text-sm font-medium">{((100 - stats.memory) * 8 / 100).toFixed(1)}GB free</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    DDR4-3200 • Dual Channel
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Storage Performance</span>
                    <span className="text-sm font-medium">NVMe SSD • 450MB/s</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    512GB capacity • {((100 - stats.disk) * 512 / 100).toFixed(0)}GB available
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Resource Usage History</h3>
              <div className="h-32 bg-white rounded border flex items-end justify-center space-x-1 p-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-blue-500 w-3 rounded-t"
                    style={{ height: `${Math.random() * 100}%` }}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-600 mt-2 text-center">
                CPU usage over last 20 minutes
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};