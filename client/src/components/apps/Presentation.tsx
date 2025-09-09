import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Save, Download, Upload, Plus, Minus, Play, Square, SkipBack, SkipForward,
  Type, Image, BarChart3, Shapes, Palette, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, RotateCcw, Copy, Trash2,
  Monitor, Eye, Grid3X3, Layout, FileImage, Video
} from 'lucide-react';

interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'chart';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  style: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    textAlign?: 'left' | 'center' | 'right';
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: number;
  };
}

interface Slide {
  id: string;
  title: string;
  layout: 'title' | 'content' | 'two-column' | 'image' | 'blank';
  backgroundColor: string;
  backgroundImage?: string;
  elements: SlideElement[];
}

export const PresentationApp: FC = () => {
  const [slides, setSlides] = useState<Slide[]>(() => {
    const stored = localStorage.getItem('webos-presentation-slides');
    if (stored) {
      return JSON.parse(stored);
    }
    return [
      {
        id: '1',
        title: 'Title Slide',
        layout: 'title',
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'title-1',
            type: 'text',
            x: 50,
            y: 150,
            width: 600,
            height: 100,
            content: 'Click to add title',
            style: {
              fontSize: 44,
              fontFamily: 'Calibri, Arial',
              color: '#1f4e79',
              bold: true,
              textAlign: 'center'
            }
          },
          {
            id: 'subtitle-1',
            type: 'text',
            x: 50,
            y: 280,
            width: 600,
            height: 60,
            content: 'Click to add subtitle',
            style: {
              fontSize: 20,
              fontFamily: 'Calibri, Arial',
              color: '#70ad47',
              textAlign: 'center'
            }
          }
        ]
      }
    ];
  });
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);
  const [fileName, setFileName] = useState('Presentation1');
  const [zoom, setZoom] = useState(100);
  const [theme, setTheme] = useState('office');
  const [showSlideTemplates, setShowSlideTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const canvasRef = useRef<HTMLDivElement>(null);

  const themes = {
    office: {
      name: 'Office Theme',
      colors: {
        primary: '#1f4e79',
        secondary: '#70ad47',
        accent: '#ffc000',
        background: '#ffffff',
        text: '#333333'
      }
    },
    ion: {
      name: 'Ion',
      colors: {
        primary: '#0078d4',
        secondary: '#005a9e',
        accent: '#40e0d0',
        background: '#f3f2f1',
        text: '#323130'
      }
    },
    facet: {
      name: 'Facet',
      colors: {
        primary: '#4472c4',
        secondary: '#e7e6e6',
        accent: '#70ad47',
        background: '#ffffff',
        text: '#44546a'
      }
    }
  };

  const slideLayouts = [
    { 
      id: 'title', 
      name: 'Title Slide',
      icon: '📄',
      elements: [
        { type: 'text', placeholder: 'Click to add title', x: 50, y: 150, width: 600, height: 100, fontSize: 44, bold: true, textAlign: 'center' },
        { type: 'text', placeholder: 'Click to add subtitle', x: 50, y: 280, width: 600, height: 60, fontSize: 20, textAlign: 'center' }
      ]
    },
    { 
      id: 'content', 
      name: 'Title and Content',
      icon: '📋',
      elements: [
        { type: 'text', placeholder: 'Click to add title', x: 50, y: 50, width: 600, height: 80, fontSize: 32, bold: true },
        { type: 'text', placeholder: 'Click to add content', x: 50, y: 150, width: 600, height: 300, fontSize: 16 }
      ]
    },
    { 
      id: 'two-column', 
      name: 'Two Content',
      icon: '📊',
      elements: [
        { type: 'text', placeholder: 'Click to add title', x: 50, y: 50, width: 600, height: 80, fontSize: 32, bold: true },
        { type: 'text', placeholder: 'Content', x: 50, y: 150, width: 290, height: 300, fontSize: 16 },
        { type: 'text', placeholder: 'Content', x: 360, y: 150, width: 290, height: 300, fontSize: 16 }
      ]
    },
    { 
      id: 'blank', 
      name: 'Blank',
      icon: '⬜',
      elements: []
    }
  ];

  useEffect(() => {
    const stored = localStorage.getItem('webos-presentation-data');
    if (stored) {
      const data = JSON.parse(stored);
      setSlides(data.slides || slides);
      setFileName(data.fileName || fileName);
    }
  }, []);

  useEffect(() => {
    const data = { slides, fileName };
    localStorage.setItem('webos-presentation-data', JSON.stringify(data));
  }, [slides, fileName]);

  const addSlide = (layoutId: string = 'content') => {
    const layout = slideLayouts.find(l => l.id === layoutId) || slideLayouts[1];
    const currentTheme = themes[theme as keyof typeof themes];
    
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `Slide ${slides.length + 1}`,
      layout: layoutId as Slide['layout'],
      backgroundColor: currentTheme.colors.background,
      elements: layout.elements.map((template, index) => ({
        id: `${layoutId}-${Date.now()}-${index}`,
        type: template.type as 'text',
        x: template.x,
        y: template.y,
        width: template.width,
        height: template.height,
        content: template.placeholder,
        style: {
          fontSize: template.fontSize,
          fontFamily: 'Calibri, Arial',
          color: index === 0 ? currentTheme.colors.primary : currentTheme.colors.text,
          bold: template.bold,
          textAlign: template.textAlign as 'left' | 'center' | 'right'
        }
      }))
    };
    
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
    setShowSlideTemplates(false);
  };

  const deleteSlide = (index: number) => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, i) => i !== index);
      setSlides(newSlides);
      if (currentSlide >= newSlides.length) {
        setCurrentSlide(newSlides.length - 1);
      }
    }
  };

  const addTextElement = () => {
    const newElement: SlideElement = {
      id: Date.now().toString(),
      type: 'text',
      x: 100,
      y: 100,
      width: 300,
      height: 50,
      content: 'New text box',
      style: {
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#333333',
        textAlign: 'left'
      }
    };

    const updatedSlides = [...slides];
    updatedSlides[currentSlide].elements.push(newElement);
    setSlides(updatedSlides);
  };

  const updateElement = (elementId: string, updates: Partial<SlideElement>) => {
    const updatedSlides = [...slides];
    const elementIndex = updatedSlides[currentSlide].elements.findIndex(el => el.id === elementId);
    if (elementIndex !== -1) {
      updatedSlides[currentSlide].elements[elementIndex] = {
        ...updatedSlides[currentSlide].elements[elementIndex],
        ...updates
      };
      setSlides(updatedSlides);
    }
  };

  const exportToPDF = () => {
    // Simulate PDF export
    const blob = new Blob(['PDF Export Coming Soon'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startPresentation = () => {
    setIsPresenting(true);
    setCurrentSlide(0);
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  if (isPresenting) {
    return (
      <div className="h-full bg-black flex items-center justify-center relative">
        <div 
          className="relative bg-white shadow-2xl"
          style={{ 
            width: '80vw', 
            height: '60vh',
            backgroundColor: slides[currentSlide]?.backgroundColor || '#ffffff'
          }}
        >
          {slides[currentSlide]?.elements.map(element => (
            <div
              key={element.id}
              className="absolute"
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                fontSize: element.style.fontSize,
                fontFamily: element.style.fontFamily,
                color: element.style.color,
                backgroundColor: element.style.backgroundColor,
                fontWeight: element.style.bold ? 'bold' : 'normal',
                fontStyle: element.style.italic ? 'italic' : 'normal',
                textDecoration: element.style.underline ? 'underline' : 'none',
                textAlign: element.style.textAlign,
                display: 'flex',
                alignItems: 'center',
                justifyContent: element.style.textAlign === 'center' ? 'center' : 
                              element.style.textAlign === 'right' ? 'flex-end' : 'flex-start',
                padding: '8px',
                borderRadius: element.style.borderRadius || 0,
                border: element.style.borderWidth ? 
                  `${element.style.borderWidth}px solid ${element.style.borderColor}` : 'none'
              }}
            >
              {element.content}
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <Button onClick={prevSlide} disabled={currentSlide === 0} variant="secondary">
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button onClick={() => setIsPresenting(false)} variant="secondary">
            <Square className="w-4 h-4" />
          </Button>
          <Button onClick={nextSlide} disabled={currentSlide === slides.length - 1} variant="secondary">
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="absolute bottom-4 right-4 text-white text-sm">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Ribbon Toolbar - PowerPoint Style */}
      <div className="border-b bg-background">
        {/* File Bar */}
        <div className="flex items-center gap-2 p-2 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-orange-600" />
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-48 h-8"
              placeholder="Presentation1"
            />
          </div>
          
          <div className="h-6 w-px bg-border mx-2" />
          
          <Button variant="outline" size="sm" onClick={() => {}}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="default" size="sm" onClick={startPresentation}>
            <Play className="w-4 h-4 mr-1" />
            Present
          </Button>
        </div>

        {/* Ribbon Tabs */}
        <div className="flex border-b">
          {['Home', 'Insert', 'Design', 'View'].map(tab => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-2">
          {activeTab === 'Home' && (
            <div className="flex items-center gap-1">
              {/* Slides Group */}
              <div className="flex items-center gap-1 px-2 border-r">
                <span className="text-xs font-medium text-muted-foreground mr-2 block mb-1">Slides</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => setShowSlideTemplates(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    New Slide
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addSlide('content')}>
                    <Layout className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Font Group */}
              <div className="flex items-center gap-1 px-2 border-r">
                <span className="text-xs font-medium text-muted-foreground mr-2 block mb-1">Font</span>
                <div className="flex gap-1">
                  <select className="text-xs border rounded px-2 py-1 w-20">
                    <option>Calibri</option>
                    <option>Arial</option>
                    <option>Times</option>
                  </select>
                  <select className="text-xs border rounded px-1 py-1 w-12">
                    <option>16</option>
                    <option>18</option>
                    <option>24</option>
                    <option>32</option>
                  </select>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Underline className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Palette className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Paragraph Group */}
              <div className="flex items-center gap-1 px-2 border-r">
                <span className="text-xs font-medium text-muted-foreground mr-2 block mb-1">Paragraph</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <AlignRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Insert' && (
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 px-2 border-r">
                <span className="text-xs font-medium text-muted-foreground mr-2 block mb-1">Content</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={addTextElement}>
                    <Type className="w-4 h-4 mr-1" />
                    Text Box
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileImage className="w-4 h-4 mr-1" />
                    Image
                  </Button>
                  <Button variant="outline" size="sm">
                    <Shapes className="w-4 h-4 mr-1" />
                    Shapes
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Chart
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Design' && (
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 px-2 border-r">
                <span className="text-xs font-medium text-muted-foreground mr-2 block mb-1">Themes</span>
                <div className="flex gap-1">
                  {Object.entries(themes).map(([key, themeData]) => (
                    <Button
                      key={key}
                      variant={theme === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme(key)}
                      className="text-xs"
                    >
                      {themeData.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'View' && (
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 px-2">
                <span className="text-xs font-medium text-muted-foreground mr-2 block mb-1">Zoom</span>
                <div className="flex gap-1 items-center">
                  <select 
                    value={zoom} 
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value={50}>50%</option>
                    <option value={75}>75%</option>
                    <option value={100}>100%</option>
                    <option value={150}>150%</option>
                    <option value={200}>200%</option>
                  </select>
                  <Button variant="outline" size="sm">
                    Fit to Window
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide Layout Selector */}
      {showSlideTemplates && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Choose a Layout</h2>
            <div className="grid grid-cols-4 gap-4 mb-4">
              {slideLayouts.map(layout => (
                <div
                  key={layout.id}
                  className="cursor-pointer border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                  onClick={() => addSlide(layout.id)}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{layout.icon}</div>
                    <div className="text-xs font-medium">{layout.name}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSlideTemplates(false)}>
                Cancel
              </Button>
              <Button onClick={() => addSlide('content')}>
                Add Slide
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Slide Thumbnails */}
        <div className="w-64 border-r bg-muted/10 p-2 overflow-y-auto">
          <div className="space-y-2">
            {slides.map((slide, index) => (
              <Card 
                key={slide.id}
                className={`cursor-pointer transition-all ${
                  currentSlide === index ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setCurrentSlide(index)}
              >
                <CardContent className="p-2">
                  <div 
                    className="w-full h-24 bg-white border rounded text-xs overflow-hidden relative"
                    style={{ backgroundColor: slide.backgroundColor }}
                  >
                    {slide.elements.slice(0, 3).map(element => (
                      <div
                        key={element.id}
                        className="absolute bg-gray-200 rounded"
                        style={{
                          left: `${(element.x / 700) * 100}%`,
                          top: `${(element.y / 500) * 100}%`,
                          width: `${(element.width / 700) * 100}%`,
                          height: `${Math.min((element.height / 500) * 100, 20)}%`,
                        }}
                      />
                    ))}
                    <div className="absolute bottom-1 left-1 text-xs text-gray-600">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs truncate">{slide.title}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlide(index);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 p-4 overflow-auto bg-gray-100">
          <div 
            ref={canvasRef}
            className="mx-auto bg-white shadow-lg relative"
            style={{ 
              width: `${700 * (zoom / 100)}px`, 
              height: `${500 * (zoom / 100)}px`,
              backgroundColor: slides[currentSlide]?.backgroundColor || '#ffffff'
            }}
          >
            {slides[currentSlide]?.elements.map(element => (
              <div
                key={element.id}
                className={`absolute cursor-pointer border-2 ${
                  selectedElement === element.id ? 'border-blue-500' : 'border-transparent'
                } hover:border-blue-300`}
                style={{
                  left: `${element.x * (zoom / 100)}px`,
                  top: `${element.y * (zoom / 100)}px`,
                  width: `${element.width * (zoom / 100)}px`,
                  height: `${element.height * (zoom / 100)}px`,
                  fontSize: `${(element.style.fontSize || 16) * (zoom / 100)}px`,
                  fontFamily: element.style.fontFamily,
                  color: element.style.color,
                  backgroundColor: element.style.backgroundColor,
                  fontWeight: element.style.bold ? 'bold' : 'normal',
                  fontStyle: element.style.italic ? 'italic' : 'normal',
                  textDecoration: element.style.underline ? 'underline' : 'none',
                  textAlign: element.style.textAlign,
                  padding: `${4 * (zoom / 100)}px`,
                  borderRadius: element.style.borderRadius || 0,
                }}
                onClick={() => setSelectedElement(element.id)}
              >
                <textarea
                  value={element.content}
                  onChange={(e) => updateElement(element.id, { content: e.target.value })}
                  className="w-full h-full bg-transparent border-0 outline-0 resize-none"
                  style={{
                    fontSize: 'inherit',
                    fontFamily: 'inherit',
                    color: 'inherit',
                    fontWeight: 'inherit',
                    fontStyle: 'inherit',
                    textDecoration: 'inherit',
                    textAlign: 'inherit'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 border-t bg-muted/30 text-xs">
        <div className="flex items-center gap-4">
          <span>Slide {currentSlide + 1} of {slides.length}</span>
          <span>Elements: {slides[currentSlide]?.elements.length || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Zoom: {zoom}%</span>
          {selectedElement && (
            <span>Selected: {slides[currentSlide]?.elements.find(e => e.id === selectedElement)?.type}</span>
          )}
        </div>
      </div>
    </div>
  );
};