import { FC, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ZoomIn, ZoomOut, RotateCw, RotateCcw, Download, Upload, Home } from 'lucide-react';

export const ImageViewer: FC = () => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlLoad = () => {
    if (imageUrl) {
      setImageSrc(imageUrl);
    }
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 500));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const rotateRight = () => setRotation(prev => (prev + 90) % 360);
  const rotateLeft = () => setRotation(prev => (prev - 90 + 360) % 360);
  const resetView = () => {
    setZoom(100);
    setRotation(0);
  };

  const downloadImage = () => {
    if (imageSrc) {
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = 'image.png';
      link.click();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="border-b border-border p-3">
        <div className="flex items-center gap-2 mb-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Open File
          </Button>
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Input
              placeholder="Enter image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlLoad()}
            />
            <Button onClick={handleUrlLoad} size="sm">
              Load
            </Button>
          </div>
          {imageSrc && (
            <Button onClick={downloadImage} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Save
            </Button>
          )}
        </div>

        {imageSrc && (
          <div className="flex items-center gap-2">
            <Button onClick={zoomOut} size="sm" variant="outline">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-mono min-w-16 text-center">
              {zoom}%
            </span>
            <Button onClick={zoomIn} size="sm" variant="outline">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <div className="border-l border-border h-6 mx-2" />
            <Button onClick={rotateLeft} size="sm" variant="outline">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button onClick={rotateRight} size="sm" variant="outline">
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button onClick={resetView} size="sm" variant="outline">
              <Home className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Image Display Area */}
      <div className="flex-1 overflow-auto bg-checkered relative">
        {imageSrc ? (
          <div className="min-h-full flex items-center justify-center p-4">
            <img
              src={imageSrc}
              alt="Viewed image"
              className="max-w-none transition-transform duration-200"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                imageRendering: zoom > 100 ? 'pixelated' : 'auto'
              }}
              onError={() => {
                setImageSrc('');
                alert('Failed to load image. Please check the URL or file format.');
              }}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Image Loaded</h3>
              <p className="text-sm mb-4">Upload a file or enter an image URL to get started</p>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, GIF, WebP, SVG
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <style>{`
        .bg-checkered {
          background-image: 
            linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
            linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
            linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
        .dark .bg-checkered {
          background-image: 
            linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
            linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
            linear-gradient(-45deg, transparent 75%, #2a2a2a 75%);
        }
      `}</style>
    </div>
  );
};