import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, Cpu, HardDrive, Zap, X } from 'lucide-react';

interface Process {
  id: string;
  name: string;
  pid: number;
  cpu: number;
  memory: number;
  status: 'running' | 'sleeping' | 'stopped';
}

export const TaskManager: FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [systemStats, setSystemStats] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    uptime: '0:00:00'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Initialize with system processes
    const initialProcesses: Process[] = [
      { id: '1', name: 'WebOS Kernel', pid: 1, cpu: 2.3, memory: 45.2, status: 'running' },
      { id: '2', name: 'Window Manager', pid: 123, cpu: 1.8, memory: 23.1, status: 'running' },
      { id: '3', name: 'Desktop Environment', pid: 156, cpu: 0.9, memory: 34.7, status: 'running' },
      { id: '4', name: 'File System', pid: 78, cpu: 0.5, memory: 12.3, status: 'running' },
      { id: '5', name: 'Network Manager', pid: 234, cpu: 0.3, memory: 8.9, status: 'running' },
      { id: '6', name: 'Audio Service', pid: 345, cpu: 0.1, memory: 5.4, status: 'sleeping' },
      { id: '7', name: 'Terminal', pid: 456, cpu: 0.8, memory: 15.6, status: 'running' },
      { id: '8', name: 'Browser Process', pid: 567, cpu: 12.4, memory: 89.3, status: 'running' },
    ];

    setProcesses(initialProcesses);

    // Update system stats periodically
    const interval = setInterval(() => {
      setSystemStats({
        cpuUsage: Math.random() * 50 + 20,
        memoryUsage: Math.random() * 30 + 40,
        diskUsage: Math.random() * 10 + 60,
        uptime: new Date().toLocaleTimeString()
      });

      // Randomly update process stats
      setProcesses(prev => prev.map(proc => ({
        ...proc,
        cpu: Math.max(0, proc.cpu + (Math.random() - 0.5) * 2),
        memory: Math.max(0, proc.memory + (Math.random() - 0.5) * 5)
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filteredProcesses = processes.filter(proc =>
    proc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proc.pid.toString().includes(searchTerm)
  );

  const handleKillProcess = (processId: string) => {
    if (confirm('Are you sure you want to terminate this process?')) {
      setProcesses(prev => prev.filter(p => p.id !== processId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600';
      case 'sleeping': return 'text-yellow-600';
      case 'stopped': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Task Manager</h1>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Cpu className="w-5 h-5 text-blue-500" />
              <span className="font-medium">CPU Usage</span>
            </div>
            <Progress value={systemStats.cpuUsage} className="mb-2" />
            <span className="text-sm text-muted-foreground">{systemStats.cpuUsage.toFixed(1)}%</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <HardDrive className="w-5 h-5 text-green-500" />
              <span className="font-medium">Memory</span>
            </div>
            <Progress value={systemStats.memoryUsage} className="mb-2" />
            <span className="text-sm text-muted-foreground">{systemStats.memoryUsage.toFixed(1)}%</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <HardDrive className="w-5 h-5 text-purple-500" />
              <span className="font-medium">Disk</span>
            </div>
            <Progress value={systemStats.diskUsage} className="mb-2" />
            <span className="text-sm text-muted-foreground">{systemStats.diskUsage.toFixed(1)}%</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="font-medium">Uptime</span>
            </div>
            <span className="text-lg font-mono">{systemStats.uptime}</span>
          </CardContent>
        </Card>
      </div>

      {/* Process List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Running Processes ({processes.length})</CardTitle>
            <Input
              placeholder="Search processes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Process Name</th>
                  <th className="text-left p-2">PID</th>
                  <th className="text-left p-2">CPU %</th>
                  <th className="text-left p-2">Memory %</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProcesses.map(process => (
                  <tr key={process.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{process.name}</td>
                    <td className="p-2 font-mono text-sm">{process.pid}</td>
                    <td className="p-2">
                      <span className={process.cpu > 10 ? 'text-red-600 font-semibold' : ''}>
                        {process.cpu.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={process.memory > 50 ? 'text-orange-600 font-semibold' : ''}>
                        {process.memory.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`capitalize ${getStatusColor(process.status)}`}>
                        {process.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleKillProcess(process.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};