import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HardDrive, Trash2, FolderOpen, FileText, Image, Music, Video, Archive, Settings, Download, Upload, RefreshCw } from 'lucide-react';

interface StorageDevice {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'cloud';
  totalSpace: number;
  usedSpace: number;
  status: 'healthy' | 'warning' | 'error';
  mountPoint: string;
}

interface FileCategory {
  name: string;
  icon: any;
  size: number;
  count: number;
  color: string;
}

export const StorageManager: FC = () => {
  const [devices, setDevices] = useState<StorageDevice[]>([
    {
      id: 'sda1',
      name: 'System Drive (SSD)',
      type: 'internal',
      totalSpace: 512 * 1024 * 1024 * 1024, // 512GB
      usedSpace: 89 * 1024 * 1024 * 1024,   // 89GB
      status: 'healthy',
      mountPoint: '/'
    },
    {
      id: 'sdb1',
      name: 'Data Drive (HDD)',
      type: 'internal',
      totalSpace: 2 * 1024 * 1024 * 1024 * 1024, // 2TB
      usedSpace: 650 * 1024 * 1024 * 1024,       // 650GB
      status: 'healthy',
      mountPoint: '/home'
    },
    {
      id: 'sdc1',
      name: 'Storage Drive (HDD)',
      type: 'internal',
      totalSpace: 4 * 1024 * 1024 * 1024 * 1024, // 4TB
      usedSpace: 1.2 * 1024 * 1024 * 1024 * 1024, // 1.2TB
      status: 'healthy',
      mountPoint: '/media/storage'
    },
    {
      id: 'usb1',
      name: 'USB Drive',
      type: 'external',
      totalSpace: 64 * 1024 * 1024 * 1024, // 64GB
      usedSpace: 23 * 1024 * 1024 * 1024,  // 23GB
      status: 'healthy',
      mountPoint: '/media/usb'
    }
  ]);

  const [fileCategories, setFileCategories] = useState<FileCategory[]>([
    { name: 'Documents', icon: FileText, size: 12.5 * 1024 * 1024 * 1024, count: 2847, color: 'bg-blue-500' },
    { name: 'Images', icon: Image, size: 145.3 * 1024 * 1024 * 1024, count: 8934, color: 'bg-green-500' },
    { name: 'Videos', icon: Video, size: 523.7 * 1024 * 1024 * 1024, count: 456, color: 'bg-red-500' },
    { name: 'Music', icon: Music, size: 87.2 * 1024 * 1024 * 1024, count: 3456, color: 'bg-purple-500' },
    { name: 'Archives', icon: Archive, size: 34.8 * 1024 * 1024 * 1024, count: 234, color: 'bg-orange-500' },
    { name: 'Applications', icon: Settings, size: 156.4 * 1024 * 1024 * 1024, count: 127, color: 'bg-indigo-500' }
  ]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getUsagePercentage = (used: number, total: number): number => {
    return Math.round((used / total) * 100);
  };

  const getTotalStorage = (): { total: number; used: number } => {
    const total = devices.reduce((sum, device) => sum + device.totalSpace, 0);
    const used = devices.reduce((sum, device) => sum + device.usedSpace, 0);
    return { total, used };
  };

  const totalStorage = getTotalStorage();

  const cleanupStorage = async () => {
    // Simulate storage cleanup
    setDevices(prev => prev.map(device => ({
      ...device,
      usedSpace: device.usedSpace * 0.95 // Reduce usage by 5%
    })));
  };

  const scanStorage = async () => {
    // Simulate storage scan
    setTimeout(() => {
      setFileCategories(prev => prev.map(category => ({
        ...category,
        size: category.size + Math.random() * 1024 * 1024 * 100,
        count: category.count + Math.floor(Math.random() * 10)
      })));
    }, 1000);
  };

  return (
    <div className="h-full p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Storage Manager</h1>
        <p className="text-gray-600">Manage your storage devices and monitor disk usage</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="files">File Analysis</TabsTrigger>
          <TabsTrigger value="cleanup">Cleanup</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Total Storage Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Total Storage Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Total Capacity</span>
                  <span className="font-medium">{formatBytes(totalStorage.total)}</span>
                </div>
                <Progress value={getUsagePercentage(totalStorage.used, totalStorage.total)} className="h-3" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatBytes(totalStorage.used)} used</span>
                  <span>{formatBytes(totalStorage.total - totalStorage.used)} free</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <HardDrive className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{devices.length}</div>
                  <div className="text-sm text-gray-600">Storage Devices</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{fileCategories.reduce((sum, cat) => sum + cat.count, 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Files</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Archive className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold">{formatBytes(fileCategories.reduce((sum, cat) => sum + cat.size, 0))}</div>
                  <div className="text-sm text-gray-600">Data Stored</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Settings className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">{devices.filter(d => d.status === 'healthy').length}</div>
                  <div className="text-sm text-gray-600">Healthy Drives</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          {devices.map(device => (
            <Card key={device.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <HardDrive className={`w-6 h-6 ${device.type === 'external' ? 'text-orange-500' : 'text-blue-500'}`} />
                    <div>
                      <h3 className="font-semibold">{device.name}</h3>
                      <p className="text-sm text-gray-600">{device.mountPoint} • {device.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatBytes(device.totalSpace)}</div>
                    <div className={`text-sm ${device.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                      {device.status}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used: {formatBytes(device.usedSpace)}</span>
                    <span>Free: {formatBytes(device.totalSpace - device.usedSpace)}</span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(device.usedSpace, device.totalSpace)} 
                    className="h-2"
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {getUsagePercentage(device.usedSpace, device.totalSpace)}% used
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <FolderOpen className="w-4 h-4 mr-1" />
                    Browse
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    Properties
                  </Button>
                  {device.type === 'external' && (
                    <Button variant="outline" size="sm">
                      Eject
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">File Analysis by Category</h2>
            <Button onClick={scanStorage} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-1" />
              Scan Storage
            </Button>
          </div>

          <div className="grid gap-4">
            {fileCategories.map((category, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <category.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.count.toLocaleString()} files</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatBytes(category.size)}</div>
                      <div className="text-sm text-gray-600">
                        {((category.size / totalStorage.used) * 100).toFixed(1)}% of used space
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cleanup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Cleanup Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Temporary Files</h3>
                    <p className="text-sm text-gray-600">Remove cached files and temporary data</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">~2.3 GB</span>
                    <Button size="sm">Clean</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Old Downloads</h3>
                    <p className="text-sm text-gray-600">Files downloaded more than 30 days ago</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">~8.7 GB</span>
                    <Button size="sm">Clean</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Duplicate Files</h3>
                    <p className="text-sm text-gray-600">Identical files found in multiple locations</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">~4.1 GB</span>
                    <Button size="sm">Scan</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Large Files</h3>
                    <p className="text-sm text-gray-600">Files larger than 1GB</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">157 files</span>
                    <Button size="sm">Review</Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={cleanupStorage} className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Run Complete Cleanup (Potential: ~15.1 GB)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};