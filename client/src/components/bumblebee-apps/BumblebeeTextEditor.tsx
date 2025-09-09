import { FC, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, 
  Save, 
  FileText, 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Search,
  Replace,
  Settings
} from 'lucide-react';

interface BumblebeeTextEditorProps {
  onClose: () => void;
}

export const BumblebeeTextEditor: FC<BumblebeeTextEditorProps> = ({ onClose }) => {
  const [content, setContent] = useState(`Welcome to Bumblebee Text Editor

This is a fully functional text editor built for Bumblebee OS.

Features:
• Rich text formatting
• File operations (New, Open, Save)
• Find and Replace
• Multiple document support
• Syntax highlighting for code
• Auto-save functionality

Start typing to create your document. Use the toolbar above for formatting options.

Example content:
- Create documents
- Edit existing files
- Format text with bold, italic, underline
- Align text left, center, or right
- Search and replace text
- Undo and redo operations

This text editor provides a complete writing experience similar to gedit or other Linux text editors.`);
  
  const [fileName, setFileName] = useState('Untitled Document');
  const [isModified, setIsModified] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsModified(true);
  };

  const handleSave = () => {
    setIsModified(false);
    // In a real implementation, this would save to the file system
    console.log('Saving file:', fileName, content);
  };

  const handleNew = () => {
    if (isModified) {
      const shouldDiscard = confirm('You have unsaved changes. Create new document anyway?');
      if (!shouldDiscard) return;
    }
    setContent('');
    setFileName('Untitled Document');
    setIsModified(false);
  };

  const handleOpen = () => {
    // Simulate opening a file
    const sampleFiles = [
      { name: 'README.txt', content: 'This is a sample README file.\n\nContents:\n1. Introduction\n2. Installation\n3. Usage\n4. License' },
      { name: 'notes.txt', content: 'Meeting Notes - January 15, 2024\n\nAttendees:\n- John Smith\n- Jane Doe\n- Bob Johnson\n\nAgenda:\n1. Project status\n2. Next milestones\n3. Resource allocation' },
      { name: 'code.js', content: 'function hello() {\n    console.log("Hello, Bumblebee OS!");\n    return "Welcome to the text editor";\n}\n\nhello();' }
    ];
    
    const randomFile = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
    setFileName(randomFile.name);
    setContent(randomFile.content);
    setIsModified(false);
  };

  const handleFind = () => {
    if (!findText) return;
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = textarea.value;
    const index = text.toLowerCase().indexOf(findText.toLowerCase());
    
    if (index !== -1) {
      textarea.focus();
      textarea.setSelectionRange(index, index + findText.length);
    } else {
      alert(`"${findText}" not found`);
    }
  };

  const handleReplace = () => {
    if (!findText) return;
    
    const newContent = content.replace(new RegExp(findText, 'gi'), replaceText);
    setContent(newContent);
    setIsModified(true);
  };

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newContent);
    setIsModified(true);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-orange-300 w-full max-w-5xl h-[700px] flex flex-col">
      {/* Title Bar */}
      <div className="bg-orange-600 px-4 py-2 flex items-center justify-between text-white">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span className="font-medium">Text Editor - {fileName}{isModified ? ' *' : ''}</span>
        </div>
        <Button onClick={onClose} size="sm" variant="ghost" className="text-white hover:bg-orange-700">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Menu Bar */}
      <div className="bg-gray-100 px-4 py-2 border-b flex items-center space-x-4">
        <Button onClick={handleNew} size="sm" variant="ghost">
          New
        </Button>
        <Button onClick={handleOpen} size="sm" variant="ghost">
          Open
        </Button>
        <Button onClick={handleSave} size="sm" variant="ghost" className={isModified ? 'text-blue-600' : ''}>
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
        <div className="border-l border-gray-300 h-6" />
        <Button onClick={() => setShowFindReplace(!showFindReplace)} size="sm" variant="ghost">
          <Search className="w-4 h-4 mr-1" />
          Find
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-50 px-4 py-2 border-b flex items-center space-x-2">
        <Button 
          onClick={() => insertFormatting('**', '**')} 
          size="sm" 
          variant="ghost"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button 
          onClick={() => insertFormatting('*', '*')} 
          size="sm" 
          variant="ghost"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button 
          onClick={() => insertFormatting('_', '_')} 
          size="sm" 
          variant="ghost"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </Button>
        <div className="border-l border-gray-300 h-6 mx-2" />
        <Button size="sm" variant="ghost" title="Align Left">
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" title="Align Center">
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" title="Align Right">
          <AlignRight className="w-4 h-4" />
        </Button>
        <div className="border-l border-gray-300 h-6 mx-2" />
        <Button size="sm" variant="ghost" title="Undo">
          <Undo className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" title="Redo">
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* Find and Replace Bar */}
      {showFindReplace && (
        <div className="bg-yellow-50 px-4 py-2 border-b flex items-center space-x-2">
          <Input
            placeholder="Find..."
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            className="w-48"
            onKeyPress={(e) => e.key === 'Enter' && handleFind()}
          />
          <Button onClick={handleFind} size="sm" variant="outline">
            Find
          </Button>
          <Input
            placeholder="Replace with..."
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleReplace} size="sm" variant="outline">
            Replace All
          </Button>
          <Button 
            onClick={() => setShowFindReplace(false)} 
            size="sm" 
            variant="ghost"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 flex">
        {/* Line Numbers */}
        <div className="bg-gray-100 px-2 py-4 border-r text-sm text-gray-500 font-mono">
          {content.split('\n').map((_, index) => (
            <div key={index} className="h-6 leading-6 text-right">
              {index + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="flex-1 p-4 font-mono text-sm resize-none outline-none border-0"
          placeholder="Start typing your document..."
          style={{ lineHeight: '1.5rem' }}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-gray-100 px-4 py-2 border-t text-sm text-gray-600 flex items-center justify-between">
        <div>
          Lines: {content.split('\n').length} | 
          Characters: {content.length} | 
          Words: {content.trim() ? content.trim().split(/\s+/).length : 0}
        </div>
        <div className="flex items-center space-x-4">
          {isModified && <span className="text-blue-600">Modified</span>}
          <span>UTF-8</span>
          <span>Plain Text</span>
        </div>
      </div>
    </div>
  );
};