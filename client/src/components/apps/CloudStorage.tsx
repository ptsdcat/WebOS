import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Cloud, Upload, Download, Folder, File, Trash2, Share, Lock, Search, Grid, List } from 'lucide-react';

interface CloudFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  modified: Date;
  shared: boolean;
  encrypted: boolean;
  mimeType?: string;
  path: string;
}

export const CloudStorage: FC = () => {
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [storageUsed, setStorageUsed] = useState(2.3); // GB
  const [storageTotal] = useState(15); // GB

  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const loadFiles = () => {
    // Simulate cloud storage files
    const mockFiles: CloudFile[] = [
      {
        id: '1',
        name: 'Documents',
        type: 'folder',
        size: 0,
        modified: new Date('2024-01-15'),
        shared: false,
        encrypted: false,
        path: '/Documents'
      },
      {
        id: '2',
        name: 'Photos',
        type: 'folder',
        size: 0,
        modified: new Date('2024-01-10'),
        shared: true,
        encrypted: false,
        path: '/Photos'
      },
      {
        id: '3',
        name: 'Project Report.pdf',
        type: 'file',
        size: 2048576,
        modified: new Date('2024-01-12'),
        shared: false,
        encrypted: true,
        mimeType: 'application/pdf',
        path: '/Project Report.pdf'
      },
      {
        id: '4',
        name: 'Backup.zip',
        type: 'file',
        size: 52428800,
        modified: new Date('2024-01-08'),
        shared: false,
        encrypted: true,
        mimeType: 'application/zip',
        path: '/Backup.zip'
      }
    ];
    setFiles(mockFiles);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Add uploaded file to list
          const newFile: CloudFile = {
            id: Date.now().toString(),
            name: file.name,
            type: 'file',
            size: file.size,
            modified: new Date(),
            shared: false,
            encrypted: false,
            mimeType: file.type,
            path: currentPath + file.name
          };
          setFiles(prev => [...prev, newFile]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: CloudFile) => {
    if (file.type === 'folder') return <Folder className="h-5 w-5 text-blue-500" />;
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <File className="h-5 w-5 text-red-500" />;
      case 'zip': case 'rar': return <File className="h-5 w-5 text-yellow-500" />;
      case 'jpg': case 'png': case 'gif': return <File className="h-5 w-5 text-green-500" />;
      case 'mp4': case 'avi': return <File className="h-5 w-5 text-purple-500" />;
      default: return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Cloud Storage</h1>
            <Badge variant="secondary">15GB</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Storage Used</span>
            <span>{storageUsed.toFixed(1)} GB of {storageTotal} GB</span>
          </div>
          <Progress value={(storageUsed / storageTotal) * 100} className="h-2" />
        </div>

        {/* Search and Upload */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <label htmlFor="file-upload" className="cursor-pointer">
            <Button disabled={isUploading}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'list' ? (
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="p-3 hover:bg-accent cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{file.name}</span>
                        {file.shared && <Share className="h-3 w-3 text-blue-500" />}
                        {file.encrypted && <Lock className="h-3 w-3 text-green-500" />}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {file.type === 'file' && formatFileSize(file.size)} • 
                        Modified {file.modified.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="p-4 hover:bg-accent cursor-pointer">
                <div className="text-center">
                  <div className="mb-2 flex justify-center">
                    {getFileIcon(file)}
                  </div>
                  <div className="text-sm font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {file.type === 'file' && formatFileSize(file.size)}
                  </div>
                  <div className="flex justify-center gap-1 mt-2">
                    {file.shared && <Share className="h-3 w-3 text-blue-500" />}
                    {file.encrypted && <Lock className="h-3 w-3 text-green-500" />}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <Cloud className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No files found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search' : 'Upload your first file to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};