import { FC, useState, useEffect } from 'react';
import { soundManager } from '@/lib/soundManager';

interface LoginAnimationProps {
  username: string;
  onComplete: () => void;
}

export const LoginAnimation: FC<LoginAnimationProps> = ({ username, onComplete }) => {
  const [stage, setStage] = useState<'welcome' | 'loading' | 'desktop'>('welcome');
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Play Windows XP login sound
    soundManager.play('login');
    
    const sequence = async () => {
      // Welcome stage - 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Loading stage with progress
      setStage('loading');
      
      // Animate progress bar
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Animate dots
      const dotsInterval = setInterval(() => {
        setDots(prev => {
          if (prev.length >= 3) return '';
          return prev + '.';
        });
      }, 500);

      // Wait for progress to complete
      await new Promise(resolve => {
        const checkProgress = setInterval(() => {
          if (progress >= 100) {
            clearInterval(checkProgress);
            clearInterval(dotsInterval);
            resolve(void 0);
          }
        }, 100);
      });

      // Desktop transition
      setStage('desktop');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onComplete();
    };

    sequence();
  }, [onComplete, progress]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
      {/* Windows XP style background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)
            `
          }}
        />
      </div>

      <div className="relative text-center text-white">
        {stage === 'welcome' && (
          <div className="animate-fade-in">
            {/* Windows logo placeholder */}
            <div className="mb-8 flex justify-center">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-2xl">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-light mb-4 tracking-wide">
              Welcome
            </h1>
            <p className="text-xl opacity-90">
              {username}
            </p>
          </div>
        )}

        {stage === 'loading' && (
          <div className="animate-fade-in">
            <div className="mb-8 flex justify-center">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-2xl animate-pulse">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-light mb-8">
              Loading your personal settings{dots}
            </h2>

            {/* Progress bar */}
            <div className="w-80 mx-auto mb-4">
              <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            <p className="text-sm opacity-75">
              Please wait while Windows configures your desktop...
            </p>
          </div>
        )}

        {stage === 'desktop' && (
          <div className="animate-fade-in">
            <div className="mb-8 flex justify-center">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-2xl animate-bounce">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-light">
              Welcome to WebOS
            </h2>
            <p className="text-lg opacity-90 mt-2">
              Your desktop is ready
            </p>
          </div>
        )}
      </div>

      {/* XP-style corner elements */}
      <div className="absolute bottom-4 right-4 text-white/50 text-xs">
        WebOS • {new Date().getFullYear()}
      </div>
    </div>
  );
};