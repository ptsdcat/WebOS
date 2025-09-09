import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HardDrive, Shield, Clock, Download, Upload, Archive, RefreshCw, AlertTriangle } from 'lucide-react';

interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  size: number;
  created: Date;
  progress?: number;
  destination: string;
}

interface RestorePoint {
  id: string;
  name: string;
  type: 'system' | 'user' | 'application';
  created: Date;
  size: number;
  verified: boolean;
}

export const SystemBackup: FC = () => {
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [activeTab, setActiveTab] = useState('backup');
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);

  useEffect(() => {
    loadBackupData();
  }, []);

  const loadBackupData = () => {
    const mockBackups: BackupJob[] = [
      {
        id: '1',
        name: 'Daily System Backup',
        type: 'incremental',
        status: 'completed',
        size: 2400000000,
        created: new Date('2024-01-15T02:00:00'),
        destination: '/backup/system/daily'
      },
      {
        id: '2',
        name: 'Weekly Full Backup',
        type: 'full',
        status: 'running',
        size: 15600000000,
        created: new Date(),
        progress: 65,
        destination: '/backup/system/weekly'
      },
      {
        id: '3',
        name: 'User Data Backup',
        type: 'differential',
        status: 'scheduled',
        size: 0,
        created: new Date('2024-01-16T00:00:00'),
        destination: '/backup/user/documents'
      }
    ];

    const mockRestorePoints: RestorePoint[] = [
      {
        id: '1',
        name: 'Clean Installation',
        type: 'system',
        created: new Date('2024-01-01T10:00:00'),
        size: 8500000000,
        verified: true
      },
      {
        id: '2',
        name: 'Pre-Update Snapshot',
        type: 'system',
        created: new Date('2024-01-10T14:30:00'),
        size: 9200000000,
        verified: true
      },
      {
        id: '3',
        name: 'User Profile Backup',
        type: 'user',
        created: new Date('2024-01-14T18:00:00'),
        size: 3400000000,
        verified: false
      }
    ];

    setBackupJobs(mockBackups);
    setRestorePoints(mockRestorePoints);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-500">Running</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'full':
        return <Badge variant="default">Full</Badge>;
      case 'incremental':
        return <Badge variant="secondary">Incremental</Badge>;
      case 'differential':
        return <Badge variant="outline">Differential</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const startBackup = () => {
    const newBackup: BackupJob = {
      id: Date.now().toString(),
      name: 'Manual System Backup',
      type: 'full',
      status: 'running',
      size: 0,
      created: new Date(),
      progress: 0,
      destination: '/backup/manual'
    };

    setBackupJobs(prev => [newBackup, ...prev]);

    // Simulate backup progress
    const interval = setInterval(() => {
      setBackupJobs(prev => prev.map(job => {
        if (job.id === newBackup.id && job.progress !== undefined) {
          const newProgress = job.progress + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            return { ...job, status: 'completed' as const, progress: 100, size: 12800000000 };
          }
          return { ...job, progress: newProgress };
        }
        return job;
      }));
    }, 500);
  };

  const restoreFromPoint = (pointId: string) => {
    const restorePoint = restorePoints.find(point => point.id === pointId);
    if (restorePoint) {
      // Simulate restore process
      alert(`Starting restore from: ${restorePoint.name}\nThis would restore your system to the state from ${restorePoint.created.toLocaleString()}`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">System Backup & Recovery</h1>
          </div>
          <Button onClick={startBackup}>
            <Archive className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="backup">Backup Jobs</TabsTrigger>
            <TabsTrigger value="restore">Restore Points</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="backup" className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <HardDrive className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold">24</div>
                      <div className="text-sm text-muted-foreground">Total Backups</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold">2h ago</div>
                      <div className="text-sm text-muted-foreground">Last Backup</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Archive className="h-8 w-8 text-purple-500" />
                    <div>
                      <div className="text-2xl font-bold">156 GB</div>
                      <div className="text-sm text-muted-foreground">Storage Used</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              {backupJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{job.name}</h3>
                          {getTypeBadge(job.type)}
                          {getStatusBadge(job.status)}
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Destination: {job.destination}</div>
                          <div>Created: {job.created.toLocaleString()}</div>
                          {job.size > 0 && <div>Size: {formatFileSize(job.size)}</div>}
                        </div>

                        {job.progress !== undefined && (
                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{job.progress}%</span>
                            </div>
                            <Progress value={job.progress} className="h-2" />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {job.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="restore" className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Available Restore Points</h2>
              <Badge variant="outline">{restorePoints.length} points</Badge>
            </div>

            <div className="space-y-3">
              {restorePoints.map((point) => (
                <Card key={point.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{point.name}</h3>
                          {getTypeBadge(point.type)}
                          {point.verified ? (
                            <Badge className="bg-green-500">Verified</Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Unverified
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <div>Created: {point.created.toLocaleString()}</div>
                          <div>Size: {formatFileSize(point.size)}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => restoreFromPoint(point.id)}
                          disabled={!point.verified}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Restore
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Automatic Backup Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Enable automatic backups</span>
                  <Button
                    variant={autoBackupEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
                  >
                    {autoBackupEnabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">Daily Incremental</div>
                      <div className="text-sm text-muted-foreground">Every day at 2:00 AM</div>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">Weekly Full Backup</div>
                      <div className="text-sm text-muted-foreground">Every Sunday at 1:00 AM</div>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium">Monthly Archive</div>
                      <div className="text-sm text-muted-foreground">First day of month at 12:00 AM</div>
                    </div>
                    <Badge variant="secondary">Scheduled</Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Configure Schedule
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Backup Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Default Backup Location</label>
                    <div className="text-sm text-muted-foreground">/var/backups/webos</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Compression Level</label>
                    <div className="text-sm text-muted-foreground">High (slower, smaller files)</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Retention Policy</label>
                    <div className="text-sm text-muted-foreground">Keep 30 daily, 12 weekly, 12 monthly</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recovery Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Recovery Mode</label>
                    <div className="text-sm text-muted-foreground">Full system restore</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Verification</label>
                    <div className="text-sm text-muted-foreground">Auto-verify after backup</div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    Configure Recovery
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