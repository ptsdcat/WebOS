import { FC, useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, SkipForward, RotateCcw, HelpCircle } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector or element ID
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'none';
  waitForElement?: boolean;
  optional?: boolean;
}

interface TourGuideProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  tourType?: 'welcome' | 'features' | 'advanced';
}

const WELCOME_TOUR: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to WebOS!',
    description: 'Let\'s take a quick tour to help you get started with the desktop environment.',
    target: 'body',
    position: 'center'
  },
  {
    id: 'desktop',
    title: 'Desktop Area',
    description: 'This is your desktop where application icons are displayed. You can drag icons to rearrange them.',
    target: '.desktop-area',
    position: 'center'
  },
  {
    id: 'app-icons',
    title: 'Application Icons',
    description: 'Double-click any application icon to launch it. Right-click for additional options.',
    target: '[data-app-id="terminal"]',
    position: 'bottom',
    action: 'hover'
  },
  {
    id: 'taskbar',
    title: 'Taskbar',
    description: 'The taskbar shows running applications and system information. Click the start menu to access more apps.',
    target: '.taskbar',
    position: 'top'
  },
  {
    id: 'start-menu',
    title: 'Start Menu',
    description: 'Click here to access the start menu with quick actions and system options.',
    target: '#start-button',
    position: 'top',
    action: 'click'
  },
  {
    id: 'quick-launch',
    title: 'Quick Launch',
    description: 'Press Ctrl+Space anywhere to quickly search and launch applications.',
    target: 'body',
    position: 'center'
  },
  {
    id: 'workspace-switcher',
    title: 'Workspace Switcher',
    description: 'Use the workspace indicator to switch between different desktops for better organization.',
    target: '.workspace-indicator',
    position: 'left'
  }
];

const FEATURES_TOUR: TourStep[] = [
  {
    id: 'package-manager',
    title: 'Package Manager',
    description: 'Install new applications and manage existing ones through the package manager.',
    target: '[data-app-id="package-manager"]',
    position: 'bottom'
  },
  {
    id: 'file-manager',
    title: 'File Manager',
    description: 'Browse and manage files and folders in your system.',
    target: '[data-app-id="file-manager"]',
    position: 'bottom'
  },
  {
    id: 'terminal',
    title: 'Terminal',
    description: 'Access the command line interface for advanced system operations.',
    target: '[data-app-id="terminal"]',
    position: 'bottom'
  },
  {
    id: 'browser',
    title: 'Web Browser',
    description: 'Browse the internet with the built-in web browser that can access real websites.',
    target: '[data-app-id="browser"]',
    position: 'bottom'
  },
  {
    id: 'achievements',
    title: 'Achievements System',
    description: 'Track your progress and unlock achievements as you use the system.',
    target: '[data-app-id="achievements"]',
    position: 'bottom'
  },
  {
    id: 'folder-organization',
    title: 'Folder Organization',
    description: 'Click the organize button to create folders and organize your desktop apps.',
    target: '.organize-button',
    position: 'left'
  }
];

export const TourGuide: FC<TourGuideProps> = ({ 
  isActive, 
  onComplete, 
  onSkip, 
  tourType = 'welcome' 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const tours = {
    welcome: WELCOME_TOUR,
    features: FEATURES_TOUR,
    advanced: [...WELCOME_TOUR, ...FEATURES_TOUR]
  };

  const currentTour = tours[tourType];
  const step = currentTour[currentStep];

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      setCurrentStep(0);
      updateHighlight();
    } else {
      setIsVisible(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (isVisible && step) {
      updateHighlight();
    }
  }, [currentStep, isVisible, step]);

  const updateHighlight = () => {
    if (!step) return;

    const targetElement = document.querySelector(step.target) as HTMLElement;
    if (!targetElement) {
      // If target not found, center the tooltip
      setHighlightPosition({ x: 0, y: 0, width: 0, height: 0 });
      setTooltipPosition({ 
        x: window.innerWidth / 2 - 200, 
        y: window.innerHeight / 2 - 100 
      });
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    setHighlightPosition({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    });

    // Calculate tooltip position based on step position preference
    let tooltipX = 0;
    let tooltipY = 0;

    switch (step.position) {
      case 'top':
        tooltipX = rect.left + rect.width / 2 - 200;
        tooltipY = rect.top - 120;
        break;
      case 'bottom':
        tooltipX = rect.left + rect.width / 2 - 200;
        tooltipY = rect.bottom + 20;
        break;
      case 'left':
        tooltipX = rect.left - 420;
        tooltipY = rect.top + rect.height / 2 - 60;
        break;
      case 'right':
        tooltipX = rect.right + 20;
        tooltipY = rect.top + rect.height / 2 - 60;
        break;
      case 'center':
      default:
        tooltipX = window.innerWidth / 2 - 200;
        tooltipY = window.innerHeight / 2 - 100;
        break;
    }

    // Ensure tooltip stays within viewport
    tooltipX = Math.max(20, Math.min(tooltipX, window.innerWidth - 420));
    tooltipY = Math.max(20, Math.min(tooltipY, window.innerHeight - 200));

    setTooltipPosition({ x: tooltipX, y: tooltipY });
  };

  const handleNext = () => {
    if (currentStep < currentTour.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
    
    // Mark tour as completed
    localStorage.setItem(`webos-tour-${tourType}-completed`, 'true');
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  const handleRestart = () => {
    setCurrentStep(0);
    updateHighlight();
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  if (!isVisible || !step) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay with highlight cutout */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 pointer-events-auto"
        style={{
          clipPath: highlightPosition.width > 0 
            ? `polygon(0% 0%, 0% 100%, ${highlightPosition.x}px 100%, ${highlightPosition.x}px ${highlightPosition.y}px, ${highlightPosition.x + highlightPosition.width}px ${highlightPosition.y}px, ${highlightPosition.x + highlightPosition.width}px ${highlightPosition.y + highlightPosition.height}px, ${highlightPosition.x}px ${highlightPosition.y + highlightPosition.height}px, ${highlightPosition.x}px 100%, 100% 100%, 100% 0%)`
            : 'none'
        }}
      />

      {/* Highlight border */}
      {highlightPosition.width > 0 && (
        <div
          className="absolute border-2 border-primary rounded pointer-events-none animate-pulse"
          style={{
            left: highlightPosition.x - 2,
            top: highlightPosition.y - 2,
            width: highlightPosition.width + 4,
            height: highlightPosition.height + 4
          }}
        />
      )}

      {/* Tooltip */}
      <Card
        ref={tooltipRef}
        className="absolute w-96 p-6 pointer-events-auto shadow-2xl border-primary/20"
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {currentStep + 1} of {currentTour.length}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {tourType} Tour
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
        <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
          {step.description}
        </p>

        {/* Progress indicators */}
        <div className="flex gap-1 mb-4">
          {currentTour.map((_, index) => (
            <button
              key={index}
              onClick={() => handleStepClick(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentStep 
                  ? 'bg-primary w-6' 
                  : index < currentStep 
                    ? 'bg-primary/60 w-2' 
                    : 'bg-muted w-2'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Restart
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Skip Tour
            </Button>
            
            <Button
              onClick={handleNext}
              size="sm"
            >
              {currentStep === currentTour.length - 1 ? 'Complete' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};