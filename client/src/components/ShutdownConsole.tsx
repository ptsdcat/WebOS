import { FC, useState, useEffect } from 'react';
import { playSounds } from '@/lib/soundManager';

interface ShutdownConsoleProps {
  onComplete: () => void;
  shutdownType: 'shutdown' | 'restart' | 'logout';
}

export const ShutdownConsole: FC<ShutdownConsoleProps> = ({ onComplete, shutdownType }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Play initial shutdown sound
    playSounds.shutdown();

    const shutdownMessages = [
      'Stopping user processes...',
      'Unmounting file systems...',
      'Stopping network services...',
      'Stopping system services...',
      'Saving system state...',
      'Stopping database services...',
      'Stopping web server...',
      'Stopping background processes...',
      'Syncing file system...',
      'Unmounting /home partition...',
      'Unmounting /var partition...',
      'Unmounting /tmp partition...',
      'Stopping kernel modules...',
      shutdownType === 'restart' ? 'System restart initiated...' : 
      shutdownType === 'logout' ? 'User session terminated...' : 'System halt initiated...'
    ];

    let currentIndex = 0;
    
    const addMessage = () => {
      if (currentIndex < shutdownMessages.length) {
        setMessages(prev => [...prev, shutdownMessages[currentIndex]]);
        // Play console beep for each message
        playSounds.console();
        currentIndex++;
        setTimeout(addMessage, Math.random() * 800 + 400);
      } else {
        setTimeout(() => {
          setIsComplete(true);
          setTimeout(onComplete, 2000);
        }, 1000);
      }
    };

    setTimeout(addMessage, 500);
  }, [onComplete, shutdownType]);

  return (
    <div className="h-screen bg-black text-green-400 font-mono p-8 overflow-hidden">
      <div className="mb-4">
        <div className="text-xl mb-2">WebOS System {shutdownType === 'restart' ? 'Restart' : shutdownType === 'logout' ? 'Logout' : 'Shutdown'}</div>
        <div className="text-sm text-gray-500 mb-4">
          {new Date().toLocaleString()}
        </div>
      </div>

      <div className="space-y-1">
        {messages.map((message, index) => (
          <div key={index} className="flex items-center">
            <span className="text-blue-400 mr-2">[OK]</span>
            <span>{message}</span>
          </div>
        ))}
      </div>

      {isComplete && (
        <div className="mt-8 text-center">
          <div className="text-2xl mb-4">
            {shutdownType === 'restart' ? '🔄 Restarting...' : 
             shutdownType === 'logout' ? '👋 Logging out...' : '⏻ Shutting down...'}
          </div>
          <div className="text-sm text-gray-400">
            {shutdownType === 'restart' ? 'System will restart shortly' : 
             shutdownType === 'logout' ? 'Returning to login screen' : 'System halted'}
          </div>
        </div>
      )}

      {!isComplete && (
        <div className="mt-4">
          <div className="animate-pulse">_</div>
        </div>
      )}
    </div>
  );
};