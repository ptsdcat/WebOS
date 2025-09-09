import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Pause, Play, X, FileText, Image, Video, Music, Archive, Code, Folder } from 'lucide-react';
import { playSounds } from '@/lib/soundManager';

interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  size: number;
  downloaded: number;
  status: 'downloading' | 'paused' | 'completed' | 'error' | 'queued';
  speed: number;
  timeRemaining: number;
  type: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'code' | 'other';
  createdAt: Date;
}

export const DownloadManager: FC = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadPath, setDownloadPath] = useState('/home/html/Downloads');
  const [activeTab, setActiveTab] = useState('active');
  const [systemInfo, setSystemInfo] = useState({
    os: 'Arch Linux',
    kernel: '6.1.0-webos',
    architecture: 'x86_64',
    desktop: 'WebOS',
    downloadPath: '/home/html/Downloads'
  });

  // Sample download items for demonstration
  useEffect(() => {
    const sampleDownloads: DownloadItem[] = [
      {
        id: '1',
        filename: 'ubuntu-22.04.3-desktop-amd64.iso',
        url: 'https://releases.ubuntu.com/22.04.3/ubuntu-22.04.3-desktop-amd64.iso',
        size: 4896235520, // ~4.6GB
        downloaded: 2147483648, // ~2GB
        status: 'downloading',
        speed: 1048576, // 1MB/s
        timeRemaining: 2550, // seconds
        type: 'archive',
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 min ago
      },
      {
        id: '2',
        filename: 'nodejs-20.10.0-linux-x64.tar.xz',
        url: 'https://nodejs.org/dist/v20.10.0/node-v20.10.0-linux-x64.tar.xz',
        size: 52428800, // ~50MB
        downloaded: 52428800,
        status: 'completed',
        speed: 0,
        timeRemaining: 0,
        type: 'archive',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: '3',
        filename: 'sample-presentation.pdf',
        url: 'https://example.com/sample-presentation.pdf',
        size: 2097152, // 2MB
        downloaded: 1048576, // 1MB
        status: 'paused',
        speed: 0,
        timeRemaining: 0,
        type: 'document',
        createdAt: new Date(Date.now() - 10 * 60 * 1000) // 10 min ago
      }
    ];

    setDownloads(sampleDownloads);
  }, []);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'image': return <Image className="w-5 h-5 text-green-500" />;
      case 'video': return <Video className="w-5 h-5 text-purple-500" />;
      case 'audio': return <Music className="w-5 h-5 text-orange-500" />;
      case 'archive': return <Archive className="w-5 h-5 text-yellow-500" />;
      case 'code': return <Code className="w-5 h-5 text-cyan-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return formatFileSize(bytesPerSecond) + '/s';
  };

  const formatTimeRemaining = (seconds: number) => {
    if (seconds === 0) return '--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getFileTypeFromUrl = (url: string): DownloadItem['type'] => {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'document';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) return 'image';
    if (['mp4', 'avi', 'mkv', 'webm', 'mov', 'wmv'].includes(extension)) return 'video';
    if (['mp3', 'wav', 'flac', 'ogg', 'aac'].includes(extension)) return 'audio';
    if (['zip', 'rar', 'tar', 'gz', 'xz', '7z', 'iso'].includes(extension)) return 'archive';
    if (['js', 'ts', 'py', 'cpp', 'c', 'java', 'html', 'css'].includes(extension)) return 'code';
    
    return 'other';
  };

  const addDownload = () => {
    if (!downloadUrl.trim()) return;

    playSounds.buttonClick();
    
    const filename = downloadUrl.split('/').pop() || 'unknown_file';
    const newDownload: DownloadItem = {
      id: Date.now().toString(),
      filename,
      url: downloadUrl,
      size: Math.floor(Math.random() * 100000000) + 1000000, // Random size for demo
      downloaded: 0,
      status: 'queued',
      speed: 0,
      timeRemaining: 0,
      type: getFileTypeFromUrl(downloadUrl),
      createdAt: new Date()
    };

    setDownloads(prev => [newDownload, ...prev]);
    setDownloadUrl('');

    // Simulate download start
    setTimeout(() => {
      setDownloads(prev => prev.map(d => 
        d.id === newDownload.id ? { ...d, status: 'downloading' as const } : d
      ));
    }, 1000);
  };

  const pauseDownload = (id: string) => {
    playSounds.buttonClick();
    setDownloads(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'paused' as const, speed: 0 } : d
    ));
  };

  const resumeDownload = (id: string) => {
    playSounds.buttonClick();
    setDownloads(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'downloading' as const } : d
    ));
  };

  const cancelDownload = (id: string) => {
    playSounds.buttonClick();
    setDownloads(prev => prev.filter(d => d.id !== id));
  };

  const openDownloadFolder = () => {
    playSounds.folderOpen();
    // Simulate opening file manager to downloads folder
    const event = new CustomEvent('open-app', { detail: { app: 'file-manager', path: downloadPath } });
    window.dispatchEvent(event);
  };

  const activeDownloads = downloads.filter(d => d.status === 'downloading' || d.status === 'queued');
  const completedDownloads = downloads.filter(d => d.status === 'completed');
  const pausedDownloads = downloads.filter(d => d.status === 'paused' || d.status === 'error');

  // Simulate download progress
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads(prev => prev.map(download => {
        if (download.status === 'downloading' && download.downloaded < download.size) {
          const increment = Math.floor(Math.random() * 1048576) + 102400; // Random progress
          const newDownloaded = Math.min(download.downloaded + increment, download.size);
          const isComplete = newDownloaded >= download.size;
          
          return {
            ...download,
            downloaded: newDownloaded,
            status: isComplete ? 'completed' as const : download.status,
            speed: isComplete ? 0 : Math.floor(Math.random() * 2097152) + 524288, // Random speed
            timeRemaining: isComplete ? 0 : Math.floor((download.size - newDownloaded) / 1048576)
          };
        }
        return download;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold mb-4">Download Manager</h2>
        
        {/* System Info */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="font-medium">OS:</span> {systemInfo.os}
          </div>
          <div>
            <span className="font-medium">Architecture:</span> {systemInfo.architecture}
          </div>
          <div>
            <span className="font-medium">Kernel:</span> {systemInfo.kernel}
          </div>
          <div>
            <span className="font-medium">Desktop:</span> {systemInfo.desktop}
          </div>
        </div>

        {/* Add Download */}
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-2">
              <Label htmlFor="url">Download URL</Label>
              <Input
                id="url"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://example.com/file.zip"
                onKeyPress={(e) => e.key === 'Enter' && addDownload()}
              />
            </div>
            <div>
              <Label htmlFor="path">Download Path</Label>
              <Select value={downloadPath} onValueChange={setDownloadPath}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="/home/html/Downloads">~/Downloads</SelectItem>
                  <SelectItem value="/home/html/Desktop">~/Desktop</SelectItem>
                  <SelectItem value="/home/html/Documents">~/Documents</SelectItem>
                  <SelectItem value="/tmp">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={addDownload} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Downloads List */}
      <div className="flex-1 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="active">
                Active ({activeDownloads.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedDownloads.length})
              </TabsTrigger>
              <TabsTrigger value="paused">
                Paused ({pausedDownloads.length})
              </TabsTrigger>
            </TabsList>
            
            <Button variant="outline" onClick={openDownloadFolder}>
              <Folder className="w-4 h-4 mr-2" />
              Open Folder
            </Button>
          </div>

          <TabsContent value="active" className="space-y-2">
            {activeDownloads.map(download => (
              <Card key={download.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(download.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium truncate">{download.filename}</h4>
                        <div className="flex items-center gap-2">
                          {download.status === 'downloading' ? (
                            <Button variant="outline" size="sm" onClick={() => pauseDownload(download.id)}>
                              <Pause className="w-3 h-3" />
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => resumeDownload(download.id)}>
                              <Play className="w-3 h-3" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => cancelDownload(download.id)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Progress 
                          value={(download.downloaded / download.size) * 100} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {formatFileSize(download.downloaded)} / {formatFileSize(download.size)}
                          </span>
                          <span>
                            {download.status === 'downloading' && `${formatSpeed(download.speed)} • ${formatTimeRemaining(download.timeRemaining)}`}
                            {download.status === 'queued' && 'Queued'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {activeDownloads.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No active downloads
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-2">
            {completedDownloads.map(download => (
              <Card key={download.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(download.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium truncate">{download.filename}</h4>
                        <div className="text-xs text-muted-foreground">
                          {formatFileSize(download.size)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Completed {download.createdAt.toLocaleString()}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => cancelDownload(download.id)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {completedDownloads.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No completed downloads
              </div>
            )}
          </TabsContent>

          <TabsContent value="paused" className="space-y-2">
            {pausedDownloads.map(download => (
              <Card key={download.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(download.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium truncate">{download.filename}</h4>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => resumeDownload(download.id)}>
                            <Play className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => cancelDownload(download.id)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Progress 
                          value={(download.downloaded / download.size) * 100} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {formatFileSize(download.downloaded)} / {formatFileSize(download.size)}
                          </span>
                          <span className="text-orange-500">
                            {download.status === 'paused' ? 'Paused' : 'Error'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pausedDownloads.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No paused downloads
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};