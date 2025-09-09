import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Play, Save, FolderOpen, Plus, X, Code, Terminal, 
  Bug, Settings, Search, FileText, Folder, GitBranch,
  Download, Upload, Zap, Package, Eye, EyeOff
} from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileNode[];
  parent?: string;
}

interface EditorTab {
  id: string;
  fileId: string;
  fileName: string;
  language: string;
  content: string;
  modified: boolean;
}

interface ConsoleMessage {
  id: string;
  type: 'info' | 'error' | 'warning' | 'success';
  message: string;
  timestamp: Date;
}

export const IDE: FC = () => {
  const [projectName, setProjectName] = useState('WebOS Project');
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [fileTree, setFileTree] = useState<FileNode[]>([
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      children: [
        {
          id: 'index.js',
          name: 'index.js',
          type: 'file',
          language: 'javascript',
          content: `// Welcome to WebOS IDE
console.log('Hello, WebOS!');

function greetUser(name) {
    return \`Welcome to the IDE, \${name}!\`;
}

// Example of modern JavaScript features
const users = ['Alice', 'Bob', 'Charlie'];
const greetings = users.map(user => greetUser(user));

greetings.forEach(greeting => {
    console.log(greeting);
});`
        },
        {
          id: 'styles.css',
          name: 'styles.css',
          type: 'file',
          language: 'css',
          content: `/* WebOS IDE Styles */
body {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    background: #1e1e1e;
    color: #d4d4d4;
    margin: 0;
    padding: 20px;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    background: #252526;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.header {
    color: #569cd6;
    font-size: 24px;
    margin-bottom: 20px;
    text-align: center;
}`
        }
      ]
    },
    {
      id: 'package.json',
      name: 'package.json',
      type: 'file',
      language: 'json',
      content: `{
  "name": "webos-project",
  "version": "1.0.0",
  "description": "A WebOS IDE project",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "build": "webpack --mode production",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "webpack": "^5.88.2"
  },
  "keywords": ["webos", "ide", "development"],
  "author": "WebOS Developer",
  "license": "MIT"
}`
    },
    {
      id: 'README.md',
      name: 'README.md',
      type: 'file',
      language: 'markdown',
      content: `# WebOS IDE Project

Welcome to your new WebOS IDE project! This powerful development environment provides everything you need to build modern applications.

## Features

- **Multi-language Support**: JavaScript, TypeScript, Python, CSS, HTML, JSON, Markdown
- **Syntax Highlighting**: Beautiful code highlighting for better readability
- **Integrated Terminal**: Run commands directly in the IDE
- **Project Management**: Organize files and folders efficiently
- **Version Control**: Built-in Git integration
- **Real-time Preview**: See your changes instantly

## Getting Started

1. Explore the file tree on the left
2. Open files by clicking on them
3. Edit code in the main editor
4. Use the terminal for running commands
5. Preview your work in real-time

## Keyboard Shortcuts

- \`Ctrl+S\`: Save file
- \`Ctrl+N\`: New file
- \`Ctrl+O\`: Open file
- \`Ctrl+F\`: Find in file
- \`Ctrl+Shift+F\`: Find in project
- \`F5\`: Run project

Happy coding! 🚀`
    }
  ]);

  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([
    {
      id: '1',
      type: 'info',
      message: 'WebOS IDE initialized successfully',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'success',
      message: 'Project loaded: ' + projectName,
      timestamp: new Date()
    }
  ]);

  const [terminalInput, setTerminalInput] = useState('');
  const [showFileTree, setShowFileTree] = useState(true);
  const [showConsole, setShowConsole] = useState(true);

  const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'javascript';
      case 'ts': return 'typescript';
      case 'py': return 'python';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'jsx': return 'javascript';
      case 'tsx': return 'typescript';
      default: return 'text';
    }
  };

  const findFileById = (files: FileNode[], id: string): FileNode | null => {
    for (const file of files) {
      if (file.id === id) return file;
      if (file.children) {
        const found = findFileById(file.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const openFile = (fileId: string) => {
    const file = findFileById(fileTree, fileId);
    if (!file || file.type !== 'file') return;

    // Check if tab already exists
    const existingTab = tabs.find(tab => tab.fileId === fileId);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    // Create new tab
    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      fileId: file.id,
      fileName: file.name,
      language: file.language || getLanguageFromFileName(file.name),
      content: file.content || '',
      modified: false
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    setTabs(prev => prev.filter(tab => tab.id !== tabId));
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId);
      setActiveTabId(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].id : null);
    }
  };

  const updateTabContent = (tabId: string, content: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, content, modified: true }
        : tab
    ));
  };

  const saveFile = () => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (!activeTab) return;

    // Update file tree with new content
    const updateFileContent = (files: FileNode[]): FileNode[] => {
      return files.map(file => {
        if (file.id === activeTab.fileId) {
          return { ...file, content: activeTab.content };
        }
        if (file.children) {
          return { ...file, children: updateFileContent(file.children) };
        }
        return file;
      });
    };

    setFileTree(updateFileContent);
    setTabs(prev => prev.map(tab => 
      tab.id === activeTab.id ? { ...tab, modified: false } : tab
    ));

    addConsoleMessage('success', `File saved: ${activeTab.fileName}`);
  };

  const addConsoleMessage = (type: ConsoleMessage['type'], message: string) => {
    const newMessage: ConsoleMessage = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };
    setConsoleMessages(prev => [...prev, newMessage]);
  };

  const runProject = () => {
    addConsoleMessage('info', 'Running project...');
    
    setTimeout(() => {
      addConsoleMessage('success', 'Project started successfully');
      addConsoleMessage('info', 'Server running on http://localhost:3000');
    }, 1000);
  };

  const executeTerminalCommand = () => {
    if (!terminalInput.trim()) return;

    addConsoleMessage('info', `$ ${terminalInput}`);

    // Simulate command execution
    switch (terminalInput.toLowerCase().trim()) {
      case 'npm install':
        addConsoleMessage('info', 'Installing dependencies...');
        setTimeout(() => {
          addConsoleMessage('success', 'Dependencies installed successfully');
        }, 2000);
        break;
      case 'npm start':
        addConsoleMessage('info', 'Starting development server...');
        setTimeout(() => {
          addConsoleMessage('success', 'Development server started on port 3000');
        }, 1500);
        break;
      case 'git status':
        addConsoleMessage('info', 'On branch main');
        addConsoleMessage('info', 'Changes not staged for commit:');
        addConsoleMessage('warning', '  modified: src/index.js');
        break;
      case 'ls':
        addConsoleMessage('info', 'src/  package.json  README.md');
        break;
      case 'pwd':
        addConsoleMessage('info', '/home/user/webos-project');
        break;
      case 'clear':
        setConsoleMessages([]);
        setTerminalInput('');
        return;
      default:
        addConsoleMessage('error', `Command not found: ${terminalInput}`);
    }

    setTerminalInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeTerminalCommand();
    }
  };

  const renderFileTree = (files: FileNode[], depth = 0) => {
    return files.map(file => (
      <div key={file.id} style={{ marginLeft: depth * 16 }}>
        <div 
          className={`flex items-center gap-2 p-1 hover:bg-gray-700 cursor-pointer rounded text-sm ${
            file.type === 'file' ? 'text-gray-300' : 'text-blue-300'
          }`}
          onClick={() => file.type === 'file' && openFile(file.id)}
        >
          {file.type === 'folder' ? (
            <Folder className="w-4 h-4" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          <span>{file.name}</span>
        </div>
        {file.children && renderFileTree(file.children, depth + 1)}
      </div>
    ));
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-400" />
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white w-48"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={runProject} size="sm" className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>
          <Button onClick={saveFile} size="sm" variant="outline" className="border-gray-600 text-white">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="outline" className="border-gray-600 text-white">
            <FolderOpen className="w-4 h-4 mr-1" />
            Open
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center gap-1">
        <Button
          onClick={() => setShowFileTree(!showFileTree)}
          size="sm"
          variant="ghost"
          className="text-white"
        >
          {showFileTree ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          Explorer
        </Button>
        <Button size="sm" variant="ghost" className="text-white">
          <Search className="w-4 h-4 mr-1" />
          Search
        </Button>
        <Button size="sm" variant="ghost" className="text-white">
          <GitBranch className="w-4 h-4 mr-1" />
          Git
        </Button>
        <Button size="sm" variant="ghost" className="text-white">
          <Bug className="w-4 h-4 mr-1" />
          Debug
        </Button>
        <Button size="sm" variant="ghost" className="text-white">
          <Package className="w-4 h-4 mr-1" />
          Extensions
        </Button>
      </div>

      <div className="flex-1 flex">
        {/* File Explorer */}
        {showFileTree && (
          <div className="w-64 bg-gray-800 border-r border-gray-700 p-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm uppercase">Explorer</h3>
              <Button size="sm" variant="ghost" className="w-6 h-6 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {renderFileTree(fileTree)}
            </div>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Tabs */}
          {tabs.length > 0 && (
            <div className="bg-gray-800 border-b border-gray-700 flex overflow-x-auto">
              {tabs.map(tab => (
                <div
                  key={tab.id}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-r border-gray-700 min-w-0 ${
                    activeTabId === tab.id ? 'bg-gray-900' : 'hover:bg-gray-700'
                  }`}
                  onClick={() => setActiveTabId(tab.id)}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate">
                    {tab.fileName}
                    {tab.modified && '*'}
                  </span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    size="sm"
                    variant="ghost"
                    className="w-4 h-4 p-0 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Code Editor */}
          <div className="flex-1 bg-gray-900">
            {activeTab ? (
              <div className="h-full p-4">
                <div className="h-full">
                  <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                    <span>{activeTab.language}</span>
                    <span>•</span>
                    <span>{activeTab.content.split('\n').length} lines</span>
                  </div>
                  <textarea
                    value={activeTab.content}
                    onChange={(e) => updateTabContent(activeTab.id, e.target.value)}
                    className="w-full h-full bg-gray-900 text-white font-mono text-sm border-none outline-none resize-none"
                    style={{ 
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                      lineHeight: '1.6',
                      tabSize: 2
                    }}
                    spellCheck={false}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Welcome to WebOS IDE</h3>
                  <p className="text-sm">Open a file from the explorer to start coding</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Panel - Console/Terminal */}
      {showConsole && (
        <div className="h-64 bg-gray-800 border-t border-gray-700 flex flex-col">
          <Tabs defaultValue="console" className="flex-1 flex flex-col">
            <TabsList className="bg-gray-700 justify-start rounded-none">
              <TabsTrigger value="console">Console</TabsTrigger>
              <TabsTrigger value="terminal">Terminal</TabsTrigger>
              <TabsTrigger value="problems">Problems</TabsTrigger>
              <Button
                onClick={() => setShowConsole(false)}
                size="sm"
                variant="ghost"
                className="ml-auto w-6 h-6 p-0 text-gray-400"
              >
                <X className="w-3 h-3" />
              </Button>
            </TabsList>
            
            <TabsContent value="console" className="flex-1 p-3 overflow-y-auto">
              <div className="space-y-1 font-mono text-sm">
                {consoleMessages.map(msg => (
                  <div key={msg.id} className={`flex items-start gap-2 ${
                    msg.type === 'error' ? 'text-red-400' :
                    msg.type === 'warning' ? 'text-yellow-400' :
                    msg.type === 'success' ? 'text-green-400' : 'text-gray-300'
                  }`}>
                    <span className="text-xs text-gray-500 w-20 flex-shrink-0">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                    <span>{msg.message}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="terminal" className="flex-1 flex flex-col p-3">
              <div className="flex-1 overflow-y-auto mb-2 font-mono text-sm">
                {consoleMessages.filter(msg => msg.message.startsWith('$')).map(msg => (
                  <div key={msg.id} className="text-gray-300">
                    {msg.message}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-green-400">$</span>
                <Input
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter command..."
                  className="bg-transparent border-none text-white font-mono focus:ring-0"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="problems" className="flex-1 p-3">
              <div className="text-gray-400 text-sm">
                No problems detected in workspace
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!showConsole && (
        <div className="bg-gray-800 border-t border-gray-700 p-2 flex justify-center">
          <Button
            onClick={() => setShowConsole(true)}
            size="sm"
            variant="ghost"
            className="text-gray-400"
          >
            <Terminal className="w-4 h-4 mr-1" />
            Show Console
          </Button>
        </div>
      )}
    </div>
  );
};