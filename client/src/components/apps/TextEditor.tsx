import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Save, FolderOpen } from 'lucide-react';

export const TextEditor: FC = () => {
  const [content, setContent] = useState('Welcome to the Text Editor!\n\nStart typing to create your document...');
  const [filename, setFilename] = useState('untitled.txt');
  const [isModified, setIsModified] = useState(false);

  const handleContentChange = (value: string) => {
    setContent(value);
    setIsModified(true);
  };

  const handleSave = () => {
    // Simulate saving
    console.log('Saving file:', filename, content);
    setIsModified(false);
    // In a real implementation, this would save to a backend or local storage
  };

  const handleNew = () => {
    setContent('');
    setFilename('untitled.txt');
    setIsModified(false);
  };

  const handleOpen = () => {
    // Simulate opening a file
    const sampleContent = `Sample Document

This is a sample document loaded from the file system.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

• Bullet point 1
• Bullet point 2
• Bullet point 3

Thank you for using the Text Editor!`;
    
    setContent(sampleContent);
    setFilename('sample.txt');
    setIsModified(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleNew}
            className="px-3 py-1 text-sm"
          >
            <FileText className="w-4 h-4 mr-1" />
            New
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleOpen}
            className="px-3 py-1 text-sm"
          >
            <FolderOpen className="w-4 h-4 mr-1" />
            Open
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSave}
            className="px-3 py-1 text-sm"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          {filename}{isModified && ' •'}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="flex-1 resize-none border border-gray-200 rounded-lg p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Start typing..."
          style={{ minHeight: '300px' }}
        />
      </div>

      {/* Status Bar */}
      <div className="mt-4 p-2 bg-gray-50 rounded-lg text-sm text-gray-600 flex justify-between border-t">
        <span>Lines: {content.split('\n').length}</span>
        <span>Characters: {content.length}</span>
      </div>
    </div>
  );
};
