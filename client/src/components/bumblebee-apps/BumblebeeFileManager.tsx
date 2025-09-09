import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, 
  Folder, 
  File, 
  Home, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  Search,
  Grid,
  List,
  Plus,
  Trash2,
  Copy,
  Scissors,
  Download,
  Upload
} from 'lucide-react';

interface FileItem {
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified: string;
  icon?: string;
}

interface BumblebeeFileManagerProps {
  onClose: () => void;
}

export const BumblebeeFileManager: FC<BumblebeeFileManagerProps> = ({ onClose }) => {
  const [currentPath, setCurrentPath] = useState('/home/ubuntu');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const homeItems: FileItem[] = [
    { name: 'Desktop', type: 'folder', modified: '2024-01-15 10:30' },
    { name: 'Documents', type: 'folder', modified: '2024-01-15 09:15' },
    { name: 'Downloads', type: 'folder', modified: '2024-01-15 14:22' },
    { name: 'Music', type: 'folder', modified: '2024-01-14 16:45' },
    { name: 'Pictures', type: 'folder', modified: '2024-01-15 11:30' },
    { name: 'Videos', type: 'folder', modified: '2024-01-14 20:15' },
    { name: 'Public', type: 'folder', modified: '2024-01-10 08:00' },
    { name: 'Templates', type: 'folder', modified: '2024-01-10 08:00' },
    { name: '.bashrc', type: 'file', size: '3.2 KB', modified: '2024-01-10 08:00' },
    { name: '.profile', type: 'file', size: '807 B', modified: '2024-01-10 08:00' },
    { name: 'README.txt', type: 'file', size: '1.5 KB', modified: '2024-01-15 12:00' }
  ];

  const documentsItems: FileItem[] = [
    { name: 'report.pdf', type: 'file', size: '2.4 MB', modified: '2024-01-15 09:15' },
    { name: 'presentation.pptx', type: 'file', size: '5.1 MB', modified: '2024-01-14 15:30' },
    { name: 'notes.txt', type: 'file', size: '847 B', modified: '2024-01-15 11:45' },
    { name: 'budget.xlsx', type: 'file', size: '156 KB', modified: '2024-01-13 16:20' },
    { name: 'Projects', type: 'folder', modified: '2024-01-12 10:00' }
  ];

  const downloadsItems: FileItem[] = [
    { name: 'ubuntu-22.04.3-desktop-amd64.iso', type: 'file', size: '4.7 GB', modified: '2024-01-14 14:22' },
    { name: 'VSCode-linux-x64.tar.gz', type: 'file', size: '156 MB', modified: '2024-01-13 11:15' },
    { name: 'image.jpg', type: 'file', size: '2.3 MB', modified: '2024-01-15 13:45' },
    { name: 'document.pdf', type: 'file', size: '890 KB', modified: '2024-01-15 10:30' }
  ];

  const getCurrentItems = () => {
    if (currentPath === '/home/ubuntu/Documents') return documentsItems;
    if (currentPath === '/home/ubuntu/Downloads') return downloadsItems;
    return homeItems;
  };

  const filteredItems = getCurrentItems().filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigateToFolder = (folderName: string) => {
    if (folderName === '..') {
      const pathParts = currentPath.split('/');
      pathParts.pop();
      setCurrentPath(pathParts.join('/') || '/');
    } else {
      setCurrentPath(`${currentPath}/${folderName}`);
    }
  };

  const navigateHome = () => {
    setCurrentPath('/home/ubuntu');
  };

  const navigateBack = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    setCurrentPath(pathParts.join('/') || '/');
  };

  const toggleItemSelection = (itemName: string) => {
    setSelectedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const getFileIcon = (item: FileItem) => {
    if (item.type === 'folder') return <Folder className="w-5 h-5 text-yellow-600" />;
    
    const ext = item.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <File className="w-5 h-5 text-red-600" />;
      case 'txt': return <File className="w-5 h-5 text-gray-600" />;
      case 'jpg': case 'png': case 'gif': return <File className="w-5 h-5 text-green-600" />;
      case 'mp3': case 'wav': return <File className="w-5 h-5 text-purple-600" />;
      case 'mp4': case 'avi': return <File className="w-5 h-5 text-blue-600" />;
      default: return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-orange-300 w-full max-w-4xl h-[600px] flex flex-col">
      {/* Title Bar */}
      <div className="bg-orange-600 px-4 py-2 flex items-center justify-between text-white">
        <div className="flex items-center space-x-2">
          <Folder className="w-5 h-5" />
          <span className="font-medium">Nautilus - File Manager</span>
        </div>
        <Button onClick={onClose} size="sm" variant="ghost" className="text-white hover:bg-orange-700">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button onClick={navigateBack} size="sm" variant="ghost" disabled={currentPath === '/home/ubuntu'}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button onClick={navigateHome} size="sm" variant="ghost">
            <Home className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded border">
            {currentPath}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            size="sm" 
            variant="ghost"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gray-50 px-4 py-2 border-b flex items-center space-x-2">
        <Button size="sm" variant="ghost" disabled={selectedItems.length === 0}>
          <Copy className="w-4 h-4 mr-1" />
          Copy
        </Button>
        <Button size="sm" variant="ghost" disabled={selectedItems.length === 0}>
          <Scissors className="w-4 h-4 mr-1" />
          Cut
        </Button>
        <Button size="sm" variant="ghost" disabled={selectedItems.length === 0}>
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
        <div className="border-l border-gray-300 h-6 mx-2" />
        <Button size="sm" variant="ghost">
          <Plus className="w-4 h-4 mr-1" />
          New Folder
        </Button>
        <Button size="sm" variant="ghost">
          <Upload className="w-4 h-4 mr-1" />
          Upload
        </Button>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto p-4">
        {currentPath !== '/home/ubuntu' && (
          <div 
            onClick={() => navigateToFolder('..')}
            className="flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer mb-2"
          >
            <ChevronUp className="w-5 h-5 text-gray-500 mr-3" />
            <span className="text-gray-700">.. (Parent Directory)</span>
          </div>
        )}

        {viewMode === 'list' ? (
          <div className="space-y-1">
            {filteredItems.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  if (item.type === 'folder') {
                    navigateToFolder(item.name);
                  } else {
                    toggleItemSelection(item.name);
                  }
                }}
                className={`flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer ${
                  selectedItems.includes(item.name) ? 'bg-blue-100' : ''
                }`}
              >
                <div className="mr-3">
                  {getFileIcon(item)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">
                    {item.size && `${item.size} • `}{item.modified}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-4">
            {filteredItems.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  if (item.type === 'folder') {
                    navigateToFolder(item.name);
                  } else {
                    toggleItemSelection(item.name);
                  }
                }}
                className={`flex flex-col items-center p-3 hover:bg-gray-100 rounded cursor-pointer ${
                  selectedItems.includes(item.name) ? 'bg-blue-100' : ''
                }`}
              >
                <div className="mb-2">
                  {getFileIcon(item)}
                </div>
                <div className="text-sm text-center text-gray-900 truncate w-full">
                  {item.name}
                </div>
                {item.size && (
                  <div className="text-xs text-gray-500 mt-1">{item.size}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 px-4 py-2 border-t text-sm text-gray-600">
        {filteredItems.length} items • {selectedItems.length} selected
      </div>
    </div>
  );
};