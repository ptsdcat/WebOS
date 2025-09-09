import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  X, 
  FileText, 
  Table, 
  Presentation, 
  Save, 
  Download, 
  Upload,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Image,
  Link
} from 'lucide-react';

type AppType = 'word' | 'excel' | 'powerpoint';

export const ProductivitySuite: FC = () => {
  const [activeApp, setActiveApp] = useState<AppType>('word');
  const [documentContent, setDocumentContent] = useState(`Welcome to WebOS Office Suite

This is a comprehensive productivity suite featuring:

Word Processor:
• Rich text formatting
• Document templates
• Collaborative editing
• Export to PDF/DOCX

Spreadsheet:
• Formula calculations
• Charts and graphs
• Data analysis tools
• Import/export Excel files

Presentation:
• Slide templates
• Animations and transitions
• Media integration
• Export to PowerPoint

Start creating professional documents with our powerful office tools.`);

  const [spreadsheetData, setSpreadsheetData] = useState([
    ['Quarter', 'Revenue', 'Expenses', 'Profit'],
    ['Q1 2024', '150000', '120000', '=B2-C2'],
    ['Q2 2024', '180000', '140000', '=B3-C3'],
    ['Q3 2024', '165000', '130000', '=B4-C4'],
    ['Q4 2024', '200000', '155000', '=B5-C5'],
    ['Total', '=SUM(B2:B5)', '=SUM(C2:C5)', '=SUM(D2:D5)']
  ]);

  const [presentations] = useState([
    {
      title: 'Quarterly Review',
      slides: [
        { title: 'Q4 2024 Performance', content: 'Revenue increased by 25% compared to Q3' },
        { title: 'Key Achievements', content: '• Launched 3 new products\n• Expanded to 5 new markets\n• Increased team by 30%' },
        { title: 'Future Goals', content: 'Focus on sustainable growth and innovation' }
      ]
    }
  ]);

  const [currentSlide, setCurrentSlide] = useState(0);

  const formatText = (format: string) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = documentContent.substring(start, end);
    
    let formattedText = selectedText;
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `_${selectedText}_`;
        break;
    }
    
    const newContent = documentContent.substring(0, start) + formattedText + documentContent.substring(end);
    setDocumentContent(newContent);
  };

  const calculateCell = (formula: string): string => {
    if (!formula.startsWith('=')) return formula;
    
    // Simple formula calculation for demo
    if (formula.includes('SUM')) {
      const match = formula.match(/SUM\(([A-Z])(\d+):([A-Z])(\d+)\)/);
      if (match) {
        const [, col, startRow, , endRow] = match;
        const colIndex = col.charCodeAt(0) - 65;
        let sum = 0;
        for (let i = parseInt(startRow) - 1; i < parseInt(endRow); i++) {
          const value = parseFloat(spreadsheetData[i]?.[colIndex] || '0');
          if (!isNaN(value)) sum += value;
        }
        return sum.toString();
      }
    }
    
    // Simple arithmetic
    const match = formula.match(/=([A-Z])(\d+)-([A-Z])(\d+)/);
    if (match) {
      const [, col1, row1, col2, row2] = match;
      const col1Index = col1.charCodeAt(0) - 65;
      const col2Index = col2.charCodeAt(0) - 65;
      const val1 = parseFloat(spreadsheetData[parseInt(row1) - 1]?.[col1Index] || '0');
      const val2 = parseFloat(spreadsheetData[parseInt(row2) - 1]?.[col2Index] || '0');
      return (val1 - val2).toString();
    }
    
    return formula;
  };

  const renderWordProcessor = () => (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 p-2 border-b flex items-center space-x-2">
        <Button size="sm" variant="ghost" onClick={() => formatText('bold')}>
          <Bold className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => formatText('italic')}>
          <Italic className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => formatText('underline')}>
          <Underline className="w-4 h-4" />
        </Button>
        <div className="border-l h-6 mx-2" />
        <Button size="sm" variant="ghost">
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost">
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost">
          <AlignRight className="w-4 h-4" />
        </Button>
        <div className="border-l h-6 mx-2" />
        <Button size="sm" variant="ghost">
          <List className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost">
          <ListOrdered className="w-4 h-4" />
        </Button>
        <div className="border-l h-6 mx-2" />
        <Button size="sm" variant="ghost">
          <Image className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost">
          <Link className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 p-6 bg-white">
        <textarea
          value={documentContent}
          onChange={(e) => setDocumentContent(e.target.value)}
          className="w-full h-full resize-none border-0 outline-none font-serif text-lg leading-relaxed"
          placeholder="Start typing your document..."
        />
      </div>
    </div>
  );

  const renderSpreadsheet = () => (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 p-2 border-b flex items-center space-x-2">
        <Button size="sm" variant="ghost">
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
        <Button size="sm" variant="ghost">
          Insert Chart
        </Button>
        <Button size="sm" variant="ghost">
          Format Cells
        </Button>
        <Button size="sm" variant="ghost">
          Sort Data
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-12 bg-gray-200 border border-gray-300 p-1"></th>
              {['A', 'B', 'C', 'D', 'E', 'F'].map(col => (
                <th key={col} className="bg-gray-200 border border-gray-300 p-2 font-bold text-center min-w-24">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 20 }, (_, i) => (
              <tr key={i}>
                <td className="bg-gray-200 border border-gray-300 p-2 text-center font-bold text-sm">
                  {i + 1}
                </td>
                {Array.from({ length: 6 }, (_, j) => (
                  <td key={j} className="border border-gray-300 p-1">
                    <input
                      type="text"
                      value={spreadsheetData[i]?.[j] ? calculateCell(spreadsheetData[i][j]) : ''}
                      onChange={(e) => {
                        const newData = [...spreadsheetData];
                        if (!newData[i]) newData[i] = [];
                        newData[i][j] = e.target.value;
                        setSpreadsheetData(newData);
                      }}
                      className="w-full border-0 outline-none p-1 text-sm"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPresentation = () => (
    <div className="flex h-full">
      <div className="w-64 bg-gray-100 border-r p-4">
        <h3 className="font-semibold mb-4">Slides</h3>
        <div className="space-y-2">
          {presentations[0].slides.map((slide, index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`p-3 border rounded cursor-pointer transition-colors ${
                currentSlide === index ? 'bg-blue-100 border-blue-300' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-medium mb-1">{index + 1}. {slide.title}</div>
              <div className="text-xs text-gray-600 line-clamp-2">{slide.content}</div>
            </div>
          ))}
        </div>
        <Button className="w-full mt-4" size="sm">
          Add Slide
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-100 p-2 border-b flex items-center space-x-2">
          <Button size="sm" variant="ghost">
            New Slide
          </Button>
          <Button size="sm" variant="ghost">
            Design
          </Button>
          <Button size="sm" variant="ghost">
            Animations
          </Button>
          <Button size="sm" variant="ghost">
            Slide Show
          </Button>
        </div>
        
        <div className="flex-1 p-8 bg-gray-50 flex items-center justify-center">
          <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl aspect-video">
            <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
              {presentations[0].slides[currentSlide].title}
            </h1>
            <div className="text-lg leading-relaxed whitespace-pre-line">
              {presentations[0].slides[currentSlide].content}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-100 p-2 border-t flex items-center justify-between">
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              disabled={currentSlide === 0}
              onClick={() => setCurrentSlide(currentSlide - 1)}
            >
              Previous
            </Button>
            <Button 
              size="sm"
              disabled={currentSlide === presentations[0].slides.length - 1}
              onClick={() => setCurrentSlide(currentSlide + 1)}
            >
              Next
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            Slide {currentSlide + 1} of {presentations[0].slides.length}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[700px] flex flex-col">
      <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span className="font-medium">WebOS Office Suite</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" className="text-white hover:bg-blue-700">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button size="sm" variant="ghost" className="text-white hover:bg-blue-700">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex border-b">
        <button
          onClick={() => setActiveApp('word')}
          className={`flex items-center space-x-2 px-4 py-2 ${
            activeApp === 'word' ? 'bg-blue-50 border-b-2 border-blue-600' : 'hover:bg-gray-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Word Processor</span>
        </button>
        <button
          onClick={() => setActiveApp('excel')}
          className={`flex items-center space-x-2 px-4 py-2 ${
            activeApp === 'excel' ? 'bg-blue-50 border-b-2 border-blue-600' : 'hover:bg-gray-50'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Spreadsheet</span>
        </button>
        <button
          onClick={() => setActiveApp('powerpoint')}
          className={`flex items-center space-x-2 px-4 py-2 ${
            activeApp === 'powerpoint' ? 'bg-blue-50 border-b-2 border-blue-600' : 'hover:bg-gray-50'
          }`}
        >
          <Presentation className="w-4 h-4" />
          <span>Presentation</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeApp === 'word' && renderWordProcessor()}
        {activeApp === 'excel' && renderSpreadsheet()}
        {activeApp === 'powerpoint' && renderPresentation()}
      </div>

      <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 border-t">
        WebOS Office Suite • Auto-save enabled • Last saved: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};