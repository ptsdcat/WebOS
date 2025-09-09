import { FC, useState, useEffect } from 'react';
import { Wifi, WifiOff, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { wsManager } from '@/lib/websocketManager';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export const ConnectionStatus: FC<ConnectionStatusProps> = ({ 
  className, 
  showDetails = false,
  compact = false 
}) => {
  const [status, setStatus] = useState(wsManager.getStatus());
  const [showReconnectButton, setShowReconnectButton] = useState(false);

  useEffect(() => {
    const unsubscribe = wsManager.onStatusChange((newStatus) => {
      setStatus(newStatus);
      
      // Show reconnect button if connection failed and not auto-reconnecting
      setShowReconnectButton(
        !newStatus.isConnected && 
        !newStatus.isReconnecting && 
        newStatus.reconnectAttempts > 0
      );
    });

    return unsubscribe;
  }, []);

  const getStatusIcon = () => {
    if (status.isConnected) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (status.isReconnecting) {
      return <RotateCcw className="w-4 h-4 text-yellow-500 animate-spin" />;
    } else if (status.lastError) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    } else {
      return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (status.isConnected) {
      return 'Connected';
    } else if (status.isReconnecting) {
      return `Reconnecting... (${status.reconnectAttempts}/10)`;
    } else if (status.lastError) {
      return 'Connection Failed';
    } else {
      return 'Disconnected';
    }
  };

  const getStatusColor = () => {
    if (status.isConnected) {
      return 'bg-green-500';
    } else if (status.isReconnecting) {
      return 'bg-yellow-500';
    } else {
      return 'bg-red-500';
    }
  };

  const handleReconnect = () => {
    wsManager.forceReconnect();
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-2", className)}>
              <div className={cn("w-2 h-2 rounded-full", getStatusColor())} />
              {getStatusIcon()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-medium">{getStatusText()}</div>
              {status.latency && (
                <div className="text-xs text-gray-500">
                  Latency: {status.latency}ms
                </div>
              )}
              {status.lastError && (
                <div className="text-xs text-red-400 mt-1">
                  {status.lastError}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg border", className)}>
      <div className="flex items-center gap-2">
        <div className={cn("w-3 h-3 rounded-full", getStatusColor())} />
        {getStatusIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{getStatusText()}</span>
          {status.isConnected && status.latency && (
            <Badge variant="secondary" className="text-xs">
              {status.latency}ms
            </Badge>
          )}
        </div>
        
        {showDetails && (
          <div className="mt-1 space-y-1">
            {status.lastError && (
              <div className="text-xs text-red-500">{status.lastError}</div>
            )}
            {status.isReconnecting && (
              <div className="text-xs text-yellow-600">
                Attempting to reconnect... (Attempt {status.reconnectAttempts} of 10)
              </div>
            )}
            {status.isConnected && (
              <div className="text-xs text-green-600">
                Real-time connection established
              </div>
            )}
          </div>
        )}
      </div>

      {showReconnectButton && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleReconnect}
          className="text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
};

// Floating connection status indicator for global use
interface FloatingConnectionStatusProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export const FloatingConnectionStatus: FC<FloatingConnectionStatusProps> = ({
  position = 'top-right',
  className
}) => {
  const [status, setStatus] = useState(wsManager.getStatus());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = wsManager.onStatusChange((newStatus) => {
      setStatus(newStatus);
      
      // Show indicator when there are connection issues
      setIsVisible(!newStatus.isConnected || newStatus.isReconnecting);
    });

    return unsubscribe;
  }, []);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed z-50 animate-in slide-in-from-top-2 duration-300",
      positionClasses[position],
      className
    )}>
      <ConnectionStatus 
        compact
        className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2"
      />
    </div>
  );
};