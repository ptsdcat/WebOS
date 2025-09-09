import { FC, useState, useEffect } from 'react';
import { 
  Terminal, 
  Globe, 
  Folder, 
  Settings, 
  Calculator, 
  FileText, 
  Calendar, 
  Mail, 
  Trophy, 
  Users, 
  Download, 
  Code, 
  Image,
  Package,
  Cloud,
  Activity,
  FileSpreadsheet,
  Monitor,
  Briefcase,
  Gamepad2,
  Zap
} from 'lucide-react';
import { soundManager } from '@/lib/soundManager';

interface DesktopIconProps {
  icon: string;
  label: string;
  position: { x: number; y: number };
  onDoubleClick: () => void;
  onDragStart?: (appId: string, e: React.DragEvent) => void;
  onDragEnd?: () => void;
  appId: string;
  isDragging?: boolean;
}

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'terminal': Terminal,
    'browser': Globe,
    'folder': Folder,
    'package': Package,
    'settings': Settings,
    'calculator': Calculator,
    'calculator-advanced': Calculator,
    'text-editor': FileText,
    'calendar': Calendar,
    'email': Mail,
    'trophy': Trophy,
    'users': Users,
    'download': Download,
    'code': Code,
    'image': Image,
    'cloud': Cloud,
    'activity': Activity,
    'spreadsheet': FileSpreadsheet,
    'presentation': Monitor,
    'briefcase': Briefcase,
    'gamepad': Gamepad2,
    'monitor': Monitor,
    'default': Zap
  };
  
  return iconMap[iconName] || iconMap['default'];
};

export const DesktopIcon: FC<DesktopIconProps> = ({ 
  icon, 
  label, 
  position,
  onDoubleClick,
  onDragStart,
  onDragEnd,
  appId,
  isDragging = false
}) => {
  const [isBeingDragged, setIsBeingDragged] = useState(false);
  const [iconColors, setIconColors] = useState({
    background: 'from-blue-900/90 to-cyan-900/90',
    border: 'border-blue-400/30',
    text: 'text-cyan-200',
    label: 'bg-blue-900/60 border-blue-400/20 text-blue-100',
    hover: 'group-hover:from-blue-500/80 group-hover:to-cyan-500/80'
  });

  // Dynamic color adaptation based on wallpaper/theme
  useEffect(() => {
    const updateIconColors = () => {
      const wallpaper = localStorage.getItem('webos-wallpaper') || 'default';
      const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      
      let colors = {
        background: 'from-blue-900/90 to-cyan-900/90',
        border: 'border-blue-400/30',
        text: 'text-cyan-200',
        label: 'bg-blue-900/60 border-blue-400/20 text-blue-100',
        hover: 'group-hover:from-blue-500/80 group-hover:to-cyan-500/80'
      };

      // Adapt colors based on wallpaper and theme
      if (wallpaper.includes('dark') || theme === 'dark') {
        colors = {
          background: 'from-gray-800/90 to-slate-800/90',
          border: 'border-gray-400/30',
          text: 'text-gray-200',
          label: 'bg-gray-800/60 border-gray-400/20 text-gray-100',
          hover: 'group-hover:from-gray-600/80 group-hover:to-slate-600/80'
        };
      } else if (wallpaper.includes('nature') || wallpaper.includes('green')) {
        colors = {
          background: 'from-green-800/90 to-emerald-800/90',
          border: 'border-green-400/30',
          text: 'text-green-200',
          label: 'bg-green-800/60 border-green-400/20 text-green-100',
          hover: 'group-hover:from-green-600/80 group-hover:to-emerald-600/80'
        };
      } else if (wallpaper.includes('sunset') || wallpaper.includes('orange')) {
        colors = {
          background: 'from-orange-800/90 to-red-800/90',
          border: 'border-orange-400/30',
          text: 'text-orange-200',
          label: 'bg-orange-800/60 border-orange-400/20 text-orange-100',
          hover: 'group-hover:from-orange-600/80 group-hover:to-red-600/80'
        };
      } else if (wallpaper.includes('ocean') || wallpaper.includes('blue')) {
        colors = {
          background: 'from-blue-800/90 to-teal-800/90',
          border: 'border-blue-400/30',
          text: 'text-blue-200',
          label: 'bg-blue-800/60 border-blue-400/20 text-blue-100',
          hover: 'group-hover:from-blue-600/80 group-hover:to-teal-600/80'
        };
      } else if (wallpaper.includes('purple')) {
        colors = {
          background: 'from-purple-800/90 to-violet-800/90',
          border: 'border-purple-400/30',
          text: 'text-purple-200',
          label: 'bg-purple-800/60 border-purple-400/20 text-purple-100',
          hover: 'group-hover:from-purple-600/80 group-hover:to-violet-600/80'
        };
      }

      setIconColors(colors);
    };

    updateIconColors();
    
    // Listen for theme/wallpaper changes
    const observer = new MutationObserver(updateIconColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    const handleStorageChange = () => updateIconColors();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('wallpaper-change', handleStorageChange);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wallpaper-change', handleStorageChange);
    };
  }, []);

  const handleDragStart = (e: React.DragEvent) => {
    setIsBeingDragged(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', appId);
    soundManager.play('click');
    onDragStart?.(appId, e);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsBeingDragged(false);
    onDragEnd?.();
  };

  const handleDoubleClick = () => {
    soundManager.play('iconClick');
    onDoubleClick();
  };

  const handleMouseEnter = () => {
    soundManager.play('hover');
  };

  return (
    <div 
      className={`desktop-icon cursor-pointer group transition-all duration-200 hover:scale-105 w-20 absolute ${
        isBeingDragged || isDragging ? 'opacity-70 scale-110 z-50' : 'opacity-100'
      }`}
      style={{
        left: position.x,
        top: position.y,
        transform: isBeingDragged ? 'rotate(3deg)' : 'none'
      }}
      data-app-id={appId}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col items-center p-2 rounded-md hover:bg-white/10 transition-all duration-200">
        <div className={`w-12 h-12 bg-gradient-to-br ${iconColors.background} border ${iconColors.border} rounded-sm flex items-center justify-center mb-2 shadow-lg backdrop-blur-sm ${iconColors.hover} group-hover:border-opacity-60 group-hover:shadow-lg transition-all duration-200`}>
          {(() => {
            const IconComponent = getIconComponent(icon);
            return <IconComponent className={`w-6 h-6 ${iconColors.text} drop-shadow-lg`} />;
          })()}
        </div>
        <span className={`text-xs text-center font-mono max-w-20 leading-tight break-words ${iconColors.label} px-1.5 py-0.5 rounded-sm backdrop-blur border`}>
          {label}
        </span>
      </div>
    </div>
  );
};
