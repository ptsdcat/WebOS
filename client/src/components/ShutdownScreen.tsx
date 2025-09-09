import { FC, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Power, RotateCcw, LogOut, Moon, RefreshCw } from 'lucide-react';

interface ShutdownScreenProps {
  onRestart: () => void;
  onLogout: () => void;
  onCancel: () => void;
  onShutdown: () => void;
  onFactoryReset?: () => void;
}

export const ShutdownScreen: FC<ShutdownScreenProps> = ({ onRestart, onLogout, onCancel, onShutdown, onFactoryReset }) => {
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showFactoryResetConfirm, setShowFactoryResetConfirm] = useState(false);

  const handleShutdown = () => {
    setIsShuttingDown(true);
    setCountdown(5);
  };

  const handleFactoryReset = () => {
    if (!onFactoryReset) return;
    
    // Perform factory reset - clear all user data except default apps
    const keysToKeep = [
      'archInstalled', // Keep installation state
      'webos-setup-complete' // Keep setup completion
    ];
    
    // Get all localStorage keys
    const allKeys = Object.keys(localStorage);
    
    // Remove all keys except the ones we want to keep
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    onFactoryReset();
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (isShuttingDown && countdown === 0) {
      // Simulate shutdown by showing a black screen and clearing all data
      document.body.innerHTML = '<div style="background: black; width: 100vw; height: 100vh; color: white; display: flex; align-items: center; justify-content: center; font-family: monospace;">System Halted</div>';
    }
  }, [countdown, isShuttingDown]);

  if (isShuttingDown) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/50 flex items-center justify-center">
            <Power className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Shutting Down...</h1>
          <p className="text-gray-400 mb-4">System will halt in {countdown} seconds</p>
          <div className="w-48 h-2 bg-gray-800 rounded-full mx-auto">
            <div 
              className="h-full bg-red-500 rounded-full transition-all duration-1000"
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
            />
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setIsShuttingDown(false);
              setCountdown(0);
            }}
            className="mt-4 text-gray-400 hover:text-white"
          >
            Cancel Shutdown
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="shutdownGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(115, 176, 219, 0.3)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#shutdownGrid)" />
        </svg>
      </div>

      {/* Arch logo background */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
        <svg width="600" height="600" viewBox="0 0 64 64" className="text-white">
          <path fill="currentColor" d="M32 2L4 62h56L32 2zm0 8.5L54.2 58H9.8L32 10.5z"/>
        </svg>
      </div>

      {/* Shutdown options card */}
      <Card className="w-full max-w-md p-8 bg-background/95 backdrop-blur-sm border-border/50 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <Power className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">System Options</h1>
          <p className="text-muted-foreground">Choose an action to perform</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={onShutdown}
            variant="destructive"
            className="w-full h-14 text-lg"
          >
            <Power className="w-5 h-5 mr-3" />
            Shutdown
          </Button>

          <Button
            onClick={onRestart}
            variant="outline"
            className="w-full h-14 text-lg"
          >
            <RotateCcw className="w-5 h-5 mr-3" />
            Restart
          </Button>

          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full h-14 text-lg"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Log Out
          </Button>

          <Button
            onClick={() => {
              // Simulate sleep mode
              const sleepOverlay = document.createElement('div');
              sleepOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: black;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-family: monospace;
                cursor: pointer;
              `;
              sleepOverlay.innerHTML = '<div><div style="text-align: center;"><div style="font-size: 2rem; margin-bottom: 1rem;">💤</div><div>System Sleeping</div><div style="font-size: 0.8rem; margin-top: 1rem; opacity: 0.7;">Click anywhere to wake</div></div></div>';
              
              sleepOverlay.onclick = () => {
                document.body.removeChild(sleepOverlay);
              };
              
              document.body.appendChild(sleepOverlay);
            }}
            variant="outline"
            className="w-full h-14 text-lg"
          >
            <Moon className="w-5 h-5 mr-3" />
            Sleep
          </Button>

          {onFactoryReset && !showFactoryResetConfirm && (
            <Button
              onClick={() => setShowFactoryResetConfirm(true)}
              variant="outline"
              className="w-full h-14 text-lg border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              <RefreshCw className="w-5 h-5 mr-3" />
              Factory Reset
            </Button>
          )}

          {showFactoryResetConfirm && (
            <div className="space-y-2 p-4 border border-orange-300 rounded-lg bg-orange-50">
              <h3 className="font-semibold text-orange-800">Factory Reset Warning</h3>
              <p className="text-sm text-orange-700">
                This will delete all user data, installed apps, achievements, and settings. 
                Only default system apps will remain. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleFactoryReset}
                  variant="destructive"
                  className="flex-1"
                >
                  Confirm Reset
                </Button>
                <Button
                  onClick={() => setShowFactoryResetConfirm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t">
          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
};