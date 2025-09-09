import { FC, useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Wifi, BarChart3, TrendingUp, TrendingDown, Zap, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AppPerformance {
  id: string;
  name: string;
  icon: string;
  pid: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
  uptime: number;
  responseTime: number;
  crashes: number;
  status: 'running' | 'idle' | 'suspended' | 'error';
  priority: 'low' | 'normal' | 'high' | 'critical';
  threads: number;
  handles: number;
  powerUsage: number;
  gpuUsage?: number;
}

interface SystemMetrics {
  totalCpuUsage: number;
  totalMemoryUsage: number;
  totalDiskUsage: number;
  totalNetworkUsage: number;
  temperature: number;
  batteryLevel: number;
  powerConsumption: number;
  processorCount: number;
  totalMemory: number;
  availableMemory: number;
}

export const PerformanceMonitor: FC = () => {
  const [apps, setApps] = useState<AppPerformance[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalCpuUsage: 0,
    totalMemoryUsage: 0,
    totalDiskUsage: 0,
    totalNetworkUsage: 0,
    temperature: 45,
    batteryLevel: 85,
    powerConsumption: 25,
    processorCount: 8,
    totalMemory: 16384,
    availableMemory: 8192
  });
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'cpu' | 'memory' | 'disk' | 'network'>('cpu');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [refreshRate, setRefreshRate] = useState(1000);

  // Simulate real app performance data
  useEffect(() => {
    const generateAppPerformance = (): AppPerformance[] => {
      const installedApps = JSON.parse(localStorage.getItem('desktop-apps') || '[]');
      const systemApps = [
        { id: 'terminal', name: 'Terminal', icon: 'terminal' },
        { id: 'browser', name: 'Firefox', icon: 'browser' },
        { id: 'file-manager', name: 'Files', icon: 'folder' },
        { id: 'package-manager', name: 'App Store', icon: 'package' }
      ];

      const allApps = [...systemApps, ...installedApps];
      
      return allApps.map((app, index) => ({
        id: app.id,
        name: app.name,
        icon: app.icon,
        pid: 1000 + index * 100 + Math.floor(Math.random() * 50),
        cpuUsage: Math.random() * 25 + (app.id === 'browser' ? 15 : 2),
        memoryUsage: Math.random() * 512 + (app.id === 'browser' ? 256 : 64),
        diskUsage: Math.random() * 10 + 1,
        networkUsage: Math.random() * 50 + (app.id === 'browser' ? 25 : 1),
        uptime: Math.floor(Math.random() * 86400) + 3600,
        responseTime: Math.random() * 100 + 10,
        crashes: Math.floor(Math.random() * 3),
        status: Math.random() > 0.1 ? 'running' : (Math.random() > 0.5 ? 'idle' : 'suspended'),
        priority: ['low', 'normal', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'normal' | 'high',
        threads: Math.floor(Math.random() * 20) + 1,
        handles: Math.floor(Math.random() * 500) + 50,
        powerUsage: Math.random() * 5 + 1,
        gpuUsage: app.id === 'browser' || app.id === 'video-editor' ? Math.random() * 30 : undefined
      }));
    };

    const updateMetrics = () => {
      const newApps = generateAppPerformance();
      setApps(newApps);

      // Calculate system totals
      const totalCpu = newApps.reduce((sum, app) => sum + app.cpuUsage, 0);
      const totalMemory = newApps.reduce((sum, app) => sum + app.memoryUsage, 0);
      const totalDisk = newApps.reduce((sum, app) => sum + app.diskUsage, 0);
      const totalNetwork = newApps.reduce((sum, app) => sum + app.networkUsage, 0);

      setSystemMetrics(prev => ({
        ...prev,
        totalCpuUsage: Math.min(totalCpu, 100),
        totalMemoryUsage: (totalMemory / prev.totalMemory) * 100,
        totalDiskUsage: Math.min(totalDisk, 100),
        totalNetworkUsage: Math.min(totalNetwork, 100),
        temperature: 35 + (totalCpu * 0.3) + Math.random() * 5,
        powerConsumption: 15 + (totalCpu * 0.5) + Math.random() * 10
      }));
    };

    updateMetrics();

    if (isMonitoring) {
      const interval = setInterval(updateMetrics, refreshRate);
      return () => clearInterval(interval);
    }
  }, [isMonitoring, refreshRate]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'suspended': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const sortedApps = [...apps].sort((a, b) => {
    switch (sortBy) {
      case 'cpu': return b.cpuUsage - a.cpuUsage;
      case 'memory': return b.memoryUsage - a.memoryUsage;
      case 'disk': return b.diskUsage - a.diskUsage;
      case 'network': return b.networkUsage - a.networkUsage;
      default: return 0;
    }
  });

  const selectedAppData = selectedApp ? apps.find(app => app.id === selectedApp) : null;

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Performance Monitor</h1>
            <Badge className={`${isMonitoring ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
              {isMonitoring ? 'LIVE' : 'PAUSED'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={refreshRate} 
              onChange={(e) => setRefreshRate(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
            >
              <option value={500}>0.5s</option>
              <option value={1000}>1s</option>
              <option value={2000}>2s</option>
              <option value={5000}>5s</option>
            </select>
            <Button 
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`${isMonitoring ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
            >
              {isMonitoring ? 'Stop' : 'Start'} Monitoring
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Sidebar - System Overview */}
        <div className="w-80 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Overview</h2>
          
          <div className="space-y-4">
            {/* CPU Usage */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">CPU Usage</span>
                </div>
                <span className="text-sm font-bold text-blue-600">
                  {systemMetrics.totalCpuUsage.toFixed(1)}%
                </span>
              </div>
              <Progress value={systemMetrics.totalCpuUsage} className="h-2" />
              <div className="text-xs text-gray-500 mt-1">
                {systemMetrics.processorCount} cores • {systemMetrics.temperature.toFixed(1)}°C
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Memory</span>
                </div>
                <span className="text-sm font-bold text-green-600">
                  {systemMetrics.totalMemoryUsage.toFixed(1)}%
                </span>
              </div>
              <Progress value={systemMetrics.totalMemoryUsage} className="h-2" />
              <div className="text-xs text-gray-500 mt-1">
                {formatBytes(systemMetrics.availableMemory * 1024 * 1024)} free of {formatBytes(systemMetrics.totalMemory * 1024 * 1024)}
              </div>
            </div>

            {/* Network Usage */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Network</span>
                </div>
                <span className="text-sm font-bold text-purple-600">
                  {systemMetrics.totalNetworkUsage.toFixed(1)} MB/s
                </span>
              </div>
              <Progress value={Math.min(systemMetrics.totalNetworkUsage, 100)} className="h-2" />
            </div>

            {/* Power & Battery */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">Power</span>
                </div>
                <span className="text-sm font-bold text-yellow-600">
                  {systemMetrics.powerConsumption.toFixed(1)}W
                </span>
              </div>
              <Progress value={systemMetrics.batteryLevel} className="h-2" />
              <div className="text-xs text-gray-500 mt-1">
                Battery: {systemMetrics.batteryLevel}%
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Kill High CPU Apps
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Optimize Performance
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {selectedAppData ? (
            /* Detailed App View */
            <div className="h-full overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg font-bold">{selectedAppData.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAppData.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedAppData.status)}`}></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{selectedAppData.status}</span>
                        <Badge className={getPriorityColor(selectedAppData.priority)}>
                          {selectedAppData.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedApp(null)}>
                    Back to Overview
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedAppData.cpuUsage.toFixed(1)}%</p>
                      </div>
                      <Cpu className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Memory</p>
                        <p className="text-2xl font-bold text-green-600">{formatBytes(selectedAppData.memoryUsage * 1024 * 1024)}</p>
                      </div>
                      <HardDrive className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Network</p>
                        <p className="text-2xl font-bold text-purple-600">{selectedAppData.networkUsage.toFixed(1)} KB/s</p>
                      </div>
                      <Wifi className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
                        <p className="text-lg font-bold text-orange-600">{formatUptime(selectedAppData.uptime)}</p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                </div>

                {/* Detailed Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Process Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Process ID</span>
                        <span className="font-mono">{selectedAppData.pid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Threads</span>
                        <span>{selectedAppData.threads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Handles</span>
                        <span>{selectedAppData.handles.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                        <span>{selectedAppData.responseTime.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Crashes</span>
                        <span className={selectedAppData.crashes > 0 ? 'text-red-600' : 'text-green-600'}>
                          {selectedAppData.crashes}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Resource Usage</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">CPU</span>
                          <span className="text-sm font-medium">{selectedAppData.cpuUsage.toFixed(1)}%</span>
                        </div>
                        <Progress value={selectedAppData.cpuUsage} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Memory</span>
                          <span className="text-sm font-medium">{formatBytes(selectedAppData.memoryUsage * 1024 * 1024)}</span>
                        </div>
                        <Progress value={(selectedAppData.memoryUsage / systemMetrics.totalMemory) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Power Usage</span>
                          <span className="text-sm font-medium">{selectedAppData.powerUsage.toFixed(1)}W</span>
                        </div>
                        <Progress value={(selectedAppData.powerUsage / 10) * 100} className="h-2" />
                      </div>
                      {selectedAppData.gpuUsage && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">GPU</span>
                            <span className="text-sm font-medium">{selectedAppData.gpuUsage.toFixed(1)}%</span>
                          </div>
                          <Progress value={selectedAppData.gpuUsage} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* App List View */
            <div className="h-full overflow-y-auto">
              <div className="p-6">
                {/* Sort Controls */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Running Applications</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
                    {(['cpu', 'memory', 'disk', 'network'] as const).map((metric) => (
                      <Button
                        key={metric}
                        variant={sortBy === metric ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy(metric)}
                        className="capitalize"
                      >
                        {metric === 'cpu' ? 'CPU' : metric}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Apps Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Application
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            CPU %
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Memory
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Network
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Uptime
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedApps.map((app) => (
                          <tr 
                            key={app.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => setSelectedApp(app.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                                  <span className="text-white text-xs font-bold">{app.name.charAt(0)}</span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{app.name}</div>
                                  <div className="text-sm text-gray-500">PID: {app.pid}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(app.status)}`}></div>
                                <span className="text-sm text-gray-900 dark:text-white capitalize">{app.status}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 mr-2">
                                  <Progress value={app.cpuUsage} className="h-2" />
                                </div>
                                <span className="text-sm text-gray-900 dark:text-white">{app.cpuUsage.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatBytes(app.memoryUsage * 1024 * 1024)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {app.networkUsage.toFixed(1)} KB/s
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatUptime(app.uptime)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedApp(app.id);
                                }}
                              >
                                Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};