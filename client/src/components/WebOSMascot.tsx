import { FC, useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface WebOSMascotProps {
  isVisible?: boolean;
}

export const WebOSMascot: FC<WebOSMascotProps> = ({ isVisible = true }) => {
  const [position, setPosition] = useState({ x: 10, y: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isAngry, setIsAngry] = useState(false);
  const [showGun, setShowGun] = useState(false);
  const controls = useAnimation();
  const lastClickTime = useRef(0);

  useEffect(() => {
    // Spinning animation when not being dragged
    if (!isDragging && isVisible) {
      controls.start({
        rotate: 360,
        transition: {
          duration: 4,
          ease: "linear",
          repeat: Infinity
        }
      });
    } else {
      controls.stop();
    }
  }, [isDragging, isVisible, controls]);

  const handleClick = () => {
    const now = Date.now();
    
    // Reset click count if more than 3 seconds between clicks
    if (now - lastClickTime.current > 3000) {
      setClickCount(1);
    } else {
      setClickCount(prev => prev + 1);
    }
    
    lastClickTime.current = now;

    // Show gun after 10 rapid clicks
    if (clickCount >= 9) {
      setIsAngry(true);
      setShowGun(true);
      
      // Hide gun after 3 seconds
      setTimeout(() => {
        setShowGun(false);
        setIsAngry(false);
        setClickCount(0);
      }, 3000);
    } else if (clickCount >= 5) {
      setIsAngry(true);
      // Shake animation when getting annoyed
      controls.start({
        x: [0, -5, 5, -5, 5, 0],
        transition: { duration: 0.5 }
      });
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
    controls.stop();
  };

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const newX = Math.max(0, Math.min(100, position.x + (info.offset.x / window.innerWidth) * 100));
    const newY = Math.max(0, Math.min(100, position.y + (info.offset.y / window.innerHeight) * 100));
    setPosition({ x: newX, y: newY });
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed z-50 cursor-pointer select-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      animate={controls}
      drag
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative">
        {/* Main mascot body */}
        <div 
          className={`w-16 h-16 rounded-full border-4 border-blue-400 bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg transition-all duration-300 ${
            isAngry ? 'border-red-400 from-red-500 to-orange-600' : ''
          }`}
        >
          {/* Eyes */}
          <div className="flex justify-center items-center h-full">
            <div className="flex space-x-2">
              <div 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isAngry ? 'bg-red-300' : 'bg-white'
                }`} 
              />
              <div 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isAngry ? 'bg-red-300' : 'bg-white'
                }`} 
              />
            </div>
          </div>
          
          {/* Mouth */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            {isAngry ? (
              <div className="w-3 h-1 bg-red-300 rounded-full transform rotate-180" />
            ) : (
              <div className="w-3 h-1 bg-white rounded-full" />
            )}
          </div>
        </div>

        {/* WebOS logo overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-70">
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Fake gun when angry */}
        {showGun && (
          <motion.div
            className="absolute -right-8 top-1/2 transform -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <div className="w-6 h-3 bg-gray-700 rounded-sm relative">
              <div className="w-2 h-1 bg-gray-800 rounded-full absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2" />
              <div className="w-1 h-4 bg-gray-600 absolute -bottom-1 left-1" />
            </div>
          </motion.div>
        )}

        {/* Click counter display when getting annoyed */}
        {clickCount >= 3 && clickCount < 10 && (
          <motion.div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Stop it! ({clickCount}/10)
          </motion.div>
        )}

        {/* Angry message */}
        {showGun && (
          <motion.div
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-2 rounded whitespace-nowrap"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            That's enough! 🔫
          </motion.div>
        )}

        {/* Spinning trail effect */}
        {!isDragging && (
          <div className="absolute inset-0 rounded-full border-2 border-blue-300 opacity-30 animate-ping" />
        )}
      </div>
    </motion.div>
  );
};