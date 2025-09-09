import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, ArrowRight, Home, Folder, FileText, Plus, 
  Edit, Trash2, Download, Upload, Search, Grid3X3, List,
  File, Image, Video, Music, Archive, Code, Settings,
  Copy, Scissors, Clipboard, MoreVertical, Eye, Share2
} from 'lucide-react';
import type { File as FileType } from '@shared/schema';

interface FileViewMode {
  view: 'grid' | 'list';
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
}

export const FileManager: FC = () => {
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<FileViewMode>({
    view: 'grid',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [editingFile, setEditingFile] = useState<FileType | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [clipboard, setClipboard] = useState<{ files: FileType[], operation: 'copy' | 'cut' } | null>(null);
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [mockFiles, setMockFiles] = useState<FileType[]>([]);

  const { toast } = useToast();

  // Real file operations with localStorage persistence
  const saveFilesToStorage = (files: FileType[]) => {
    localStorage.setItem('webos-filesystem', JSON.stringify(files));
  };

  const loadFilesFromStorage = (): FileType[] => {
    const stored = localStorage.getItem('webos-filesystem');
    return stored ? JSON.parse(stored) : [];
  };

  const createNewFile = (name: string, content: string = '', isFolder: boolean = false, parentId: number | null = null) => {
    const newFile: FileType = {
      id: Date.now(),
      name,
      content: isFolder ? null : content,
      isFolder,
      parentId,
      size: isFolder ? 0 : content.length,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 1,
      mimeType: isFolder ? 'folder' : getFileType(name)
    };

    const files = loadFilesFromStorage();
    files.push(newFile);
    saveFilesToStorage(files);
    setMockFiles(files);
    
    toast({
      title: isFolder ? 'Folder Created' : 'File Created',
      description: `${name} has been created successfully`
    });

    return newFile;
  };

  const deleteFile = (id: number) => {
    const files = loadFilesFromStorage();
    const filteredFiles = files.filter(file => file.id !== id && file.parentId !== id);
    saveFilesToStorage(filteredFiles);
    setMockFiles(filteredFiles);
    
    toast({
      title: 'Deleted',
      description: 'File/folder has been deleted successfully'
    });
  };

  const updateFile = (id: number, updates: Partial<FileType>) => {
    const files = loadFilesFromStorage();
    const updatedFiles = files.map(file => 
      file.id === id 
        ? { ...file, ...updates, updatedAt: new Date() }
        : file
    );
    saveFilesToStorage(updatedFiles);
    setMockFiles(updatedFiles);
    
    toast({
      title: 'Updated',
      description: 'File has been updated successfully'
    });
  };

  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const typeMap: Record<string, string> = {
      'txt': 'text/plain',
      'js': 'text/javascript',
      'html': 'text/html',
      'css': 'text/css',
      'json': 'application/json',
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg',
      'zip': 'application/zip'
    };
    return typeMap[ext] || 'application/octet-stream';
  };

  // Initialize file system
  useEffect(() => {
    const hasInitialized = localStorage.getItem('filesystem-initialized');
    if (hasInitialized) {
      setMockFiles(loadFilesFromStorage());
    } else {
      // Create default system structure
      const defaultFiles: FileType[] = [
        {
          id: 1,
          name: 'Desktop',
          content: null,
          isFolder: true,
          parentId: null,
          size: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 1,
          mimeType: 'folder'
        },
        {
          id: 2,
          name: 'Documents',
          content: null,
          isFolder: true,
          parentId: null,
          size: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 1,
          mimeType: 'folder'
        },
        {
          id: 3,
          name: 'Downloads',
          content: null,
          isFolder: true,
          parentId: null,
          size: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 1,
          mimeType: 'folder'
        },
        {
          id: 4,
          name: 'Welcome.txt',
          content: 'Welcome to WebOS File Manager!\n\nThis is a fully functional file system where you can:\n- Create files and folders\n- Edit text files\n- Delete items\n- Navigate through directories\n\nEnjoy exploring!',
          isFolder: false,
          parentId: null,
          size: 200,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 1,
          mimeType: 'text/plain'
        }
      ];
      
      saveFilesToStorage(defaultFiles);
      setMockFiles(defaultFiles);
      localStorage.setItem('filesystem-initialized', 'true');
    }
  }, []);

  const getFileIcon = (file: FileType) => {
    if (file.isFolder) {
      return <Folder className="w-6 h-6 text-blue-500" />;
    }
    
    const mimeType = file.mimeType || '';
    if (mimeType.startsWith('text/')) {
      return <FileText className="w-6 h-6 text-gray-600" />;
    } else if (mimeType.startsWith('image/')) {
      return <Image className="w-6 h-6 text-green-500" />;
    } else if (mimeType.startsWith('video/')) {
      return <Video className="w-6 h-6 text-red-500" />;
    } else if (mimeType.startsWith('audio/')) {
      return <Music className="w-6 h-6 text-purple-500" />;
    } else if (mimeType.includes('zip') || mimeType.includes('archive')) {
      return <Archive className="w-6 h-6 text-orange-500" />;
    } else if (mimeType.includes('javascript') || mimeType.includes('json')) {
      return <Code className="w-6 h-6 text-yellow-500" />;
    } else {
      return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatFileSize = (size: number): string => {
    if (size === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileClick = (file: FileType) => {
    if (file.isFolder) {
      setCurrentParentId(file.id);
      setCurrentPath(`${currentPath}/${file.name}`);
    } else {
      setEditingFile(file);
    }
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a file name"
      });
      return;
    }

    createNewFile(newFileName, newFileContent, false, currentParentId);
    setNewFileName('');
    setNewFileContent('');
    setShowNewFileDialog(false);
  };

  const handleCreateFolder = () => {
    if (!newFileName.trim()) {
      toast({
        title: "Error", 
        description: "Please enter a folder name"
      });
      return;
    }

    createNewFile(newFileName, '', true, currentParentId);
    setNewFileName('');
    setShowNewFolderDialog(false);
  };

  const handleDeleteSelected = () => {
    if (selectedFiles.size === 0) return;
    
    Array.from(selectedFiles).forEach(id => {
      deleteFile(id);
    });
    
    setSelectedFiles(new Set());
  };

  const navigateBack = () => {
    if (currentParentId === null) return;
    
    const parentFile = mockFiles.find(f => f.id === currentParentId);
    if (parentFile) {
      setCurrentParentId(parentFile.parentId);
      setCurrentPath(currentPath.split('/').slice(0, -1).join('/') || '/home/user');
    }
  };

  const navigateHome = () => {
    setCurrentParentId(null);
    setCurrentPath('/home/user');
  };

  const filteredFiles = mockFiles
    .filter(file => file.parentId === currentParentId)
    .filter(file => 
      searchQuery === '' || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="border-b p-4 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={navigateBack} disabled={currentParentId === null}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={navigateHome}>
          <Home className="w-4 h-4" />
        </Button>
        
        <div className="flex-1 mx-4">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {currentPath}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search files..."
              className="pl-10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button
            variant={viewMode.view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode(prev => ({ ...prev, view: 'grid' }))}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          
          <Button
            variant={viewMode.view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode(prev => ({ ...prev, view: 'list' }))}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="border-b p-3 flex items-center gap-2">
        <Dialog open={showNewFileDialog} onOpenChange={setShowNewFileDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New File
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="File name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
              <Textarea
                placeholder="File content (optional)"
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
                rows={6}
              />
              <Button onClick={handleCreateFile}>Create File</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Folder className="w-4 h-4 mr-2" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Folder name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
              <Button onClick={handleCreateFolder}>Create Folder</Button>
            </div>
          </DialogContent>
        </Dialog>

        {selectedFiles.size > 0 && (
          <>
            <Button variant="outline" size="sm" onClick={handleDeleteSelected}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedFiles.size})
            </Button>
          </>
        )}
      </div>

      {/* File List */}
      <div className="flex-1 p-4 overflow-auto">
        {viewMode.view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <Card
                key={file.id}
                className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedFiles.has(file.id) ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    const newSelected = new Set(selectedFiles);
                    if (newSelected.has(file.id)) {
                      newSelected.delete(file.id);
                    } else {
                      newSelected.add(file.id);
                    }
                    setSelectedFiles(newSelected);
                  } else {
                    handleFileClick(file);
                  }
                }}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  {getFileIcon(file)}
                  <div className="mt-2 text-sm font-medium truncate w-full">
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {file.isFolder ? 'Folder' : formatFileSize(file.size)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedFiles.has(file.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    const newSelected = new Set(selectedFiles);
                    if (newSelected.has(file.id)) {
                      newSelected.delete(file.id);
                    } else {
                      newSelected.add(file.id);
                    }
                    setSelectedFiles(newSelected);
                  } else {
                    handleFileClick(file);
                  }
                }}
              >
                {getFileIcon(file)}
                <div className="ml-3 flex-1">
                  <div className="text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-gray-500">
                    {file.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {file.isFolder ? 'Folder' : formatFileSize(file.size)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit File Dialog */}
      {editingFile && (
        <Dialog open={!!editingFile} onOpenChange={() => setEditingFile(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit {editingFile.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={editingFile.content || ''}
                onChange={(e) => setEditingFile(prev => prev ? { ...prev, content: e.target.value } : null)}
                rows={20}
                className="font-mono"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (editingFile) {
                      updateFile(editingFile.id, { content: editingFile.content });
                      setEditingFile(null);
                    }
                  }}
                >
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingFile(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};