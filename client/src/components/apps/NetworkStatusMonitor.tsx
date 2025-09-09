import { FC, useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity, Zap, Clock, AlertTriangle, CheckCircle, RotateCcw, Server, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ConnectionStatus } from '@/components/ui/connection-status';
import { wsManager } from '@/lib/websocketManager';

interface NetworkMetrics {
  latency: number;
  jitter: number;
  packetLoss: number;
  bandwidth: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface ConnectionLog {
  id: string;
  timestamp: Date;
  event: 'connected' | 'disconnected' | 'reconnecting' | 'error';
  message: string;
  duration?: number;
}

export const NetworkStatusMonitor: FC = () => {
  const [wsStatus, setWsStatus] = useState(wsManager.getStatus());
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLog[]>([]);
  const [metrics, setMetrics] = useState<NetworkMetrics>({
    latency: 0,
    jitter: 0,
    packetLoss: 0,
    bandwidth: 0,
    connectionQuality: 'good'
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [lastConnectedTime, setLastConnectedTime] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = wsManager.onStatusChange((status) => {
      const previousStatus = wsStatus;
      setWsStatus(status);

      // Log connection events
      const logEntry: ConnectionLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        event: status.isConnected ? 'connected' : 
               status.isReconnecting ? 'reconnecting' : 'disconnected',
        message: getStatusMessage(status, previousStatus),
        duration: status.isConnected && lastConnectedTime ? 
                 Date.now() - lastConnectedTime.getTime() : undefined
      };

      setConnectionLogs(prev => [logEntry, ...prev.slice(0, 49)]);

      if (status.isConnected) {
        setLastConnectedTime(new Date());
        updateMetrics(status);
      }
    });

    // Start connection monitoring
    monitorConnection();

    return unsubscribe;
  }, []);

  const getStatusMessage = (current: any, previous: any) => {
    if (current.isConnected && !previous.isConnected) {
      return 'WebSocket connection established successfully';
    } else if (!current.isConnected && previous.isConnected) {
      return current.lastError || 'Connection lost';
    } else if (current.isReconnecting) {
      return `Reconnection attempt ${current.reconnectAttempts} of 10`;
    } else if (current.lastError) {
      return current.lastError;
    }
    return 'Connection status updated';
  };

  const updateMetrics = (status: any) => {
    setMetrics(prev => ({
      ...prev,
      latency: status.latency || prev.latency,
      connectionQuality: getConnectionQuality(status.latency || 0)
    }));
  };

  const getConnectionQuality = (latency: number): NetworkMetrics['connectionQuality'] => {
    if (latency < 50) return 'excellent';
    if (latency < 100) return 'good';
    if (latency < 200) return 'fair';
    return 'poor';
  };

  const monitorConnection = () => {
    const interval = setInterval(() => {
      if (wsStatus.isConnected) {
        // Simulate network metrics updates
        setMetrics(prev => ({
          ...prev,
          jitter: Math.random() * 10,
          packetLoss: Math.random() * 2,
          bandwidth: 50 + Math.random() * 50
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      // Test connection with ping
      const startTime = Date.now();
      const success = wsManager.send({
        type: 'ping',
        timestamp: startTime
      });

      if (success) {
        const logEntry: ConnectionLog = {
          id: Date.now().toString(),
          timestamp: new Date(),
          event: 'connected',
          message: 'Connection test initiated'
        };
        setConnectionLogs(prev => [logEntry, ...prev.slice(0, 49)]);
      }
    } catch (error) {
      const logEntry: ConnectionLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        event: 'error',
        message: 'Connection test failed'
      };
      setConnectionLogs(prev => [logEntry, ...prev.slice(0, 49)]);
    } finally {
      setTimeout(() => setIsTestingConnection(false), 2000);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEventIcon = (event: string) => {
    switch (event) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected': return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'reconnecting': return <RotateCcw className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-h-full overflow-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="w-6 h-6" />
          Network Status Monitor
        </h1>
        <Button 
          onClick={testConnection}
          disabled={isTestingConnection}
          variant="outline"
          size="sm"
        >
          {isTestingConnection ? (
            <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 mr-2" />
          )}
          Test Connection
        </Button>
      </div>

      {/* Connection Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            WebSocket Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConnectionStatus showDetails className="border-0 p-0" />
        </CardContent>
      </Card>

      {/* Network Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.latency}ms</div>
            <p className="text-xs text-gray-500">Round trip time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connection Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold capitalize ${getQualityColor(metrics.connectionQuality)}`}>
              {metrics.connectionQuality}
            </div>
            <p className="text-xs text-gray-500">Overall rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Jitter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.jitter.toFixed(1)}ms</div>
            <p className="text-xs text-gray-500">Latency variation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Packet Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.packetLoss.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">Data loss rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Connection History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Connection History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-auto">
            {connectionLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No connection events recorded yet</p>
            ) : (
              connectionLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  {getEventIcon(log.event)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={log.event === 'connected' ? 'default' : 
                                   log.event === 'error' ? 'destructive' : 'secondary'}>
                        {log.event}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{log.message}</p>
                    {log.duration && (
                      <p className="text-xs text-gray-500 mt-1">
                        Duration: {Math.round(log.duration / 1000)}s
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => wsManager.forceReconnect()}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Force Reconnect
            </Button>
            <Button 
              onClick={() => wsManager.disconnect()}
              variant="outline"
              size="sm"
            >
              <WifiOff className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
            <Button 
              onClick={() => setConnectionLogs([])}
              variant="outline"
              size="sm"
            >
              Clear History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};