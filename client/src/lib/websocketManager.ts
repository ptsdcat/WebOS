interface WebSocketConfig {
  url: string;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  heartbeatInterval: number;
  timeout: number;
}

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp: number;
}

interface ConnectionStatus {
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  lastError?: string;
  latency?: number;
}

type StatusListener = (status: ConnectionStatus) => void;
type MessageListener = (message: WebSocketMessage) => void;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private statusListeners: Set<StatusListener> = new Set();
  private messageListeners: Set<MessageListener> = new Set();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    isReconnecting: false,
    reconnectAttempts: 0
  };
  private shouldReconnect = true;
  private lastPingTime = 0;

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: this.getWebSocketUrl(),
      maxReconnectAttempts: 5,
      reconnectInterval: 2000,
      heartbeatInterval: 30000,
      timeout: 3000,
      ...config
    };
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws`;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.cleanup();
      this.shouldReconnect = true;

      try {
        this.ws = new WebSocket(this.config.url);
        this.setupEventListeners(resolve, reject);
      } catch (error) {
        this.handleError(error as Error);
        reject(error);
      }
    });
  }

  private setupEventListeners(resolve: () => void, reject: (error: Error) => void): void {
    if (!this.ws) return;

    const connectTimeout = setTimeout(() => {
      this.handleError(new Error('Connection timeout'));
      reject(new Error('Connection timeout'));
    }, this.config.timeout);

    this.ws.onopen = () => {
      clearTimeout(connectTimeout);
      this.connectionStatus = {
        isConnected: true,
        isReconnecting: false,
        reconnectAttempts: 0
      };
      this.notifyStatusListeners();
      this.startHeartbeat();
      resolve();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        // Handle pong response for latency calculation
        if (message.type === 'pong') {
          this.connectionStatus.latency = Date.now() - this.lastPingTime;
          this.notifyStatusListeners();
          return;
        }

        this.notifyMessageListeners(message);
      } catch (error) {
        console.warn('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      clearTimeout(connectTimeout);
      this.connectionStatus.isConnected = false;
      this.stopHeartbeat();
      
      if (this.shouldReconnect && event.code !== 1000) {
        this.attemptReconnect();
      } else {
        this.connectionStatus.isReconnecting = false;
        this.notifyStatusListeners();
      }
    };

    this.ws.onerror = (error) => {
      clearTimeout(connectTimeout);
      // Don't spam console with connection errors during normal reconnection attempts
      if (this.connectionStatus.reconnectAttempts === 0) {
        this.handleError(new Error('WebSocket connection error'));
      } else {
        this.connectionStatus.lastError = 'Connection failed';
        this.notifyStatusListeners();
      }
    };
  }

  private attemptReconnect(): void {
    if (this.connectionStatus.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.connectionStatus.isReconnecting = false;
      this.connectionStatus.lastError = 'Max reconnection attempts reached';
      this.notifyStatusListeners();
      return;
    }

    this.connectionStatus.isReconnecting = true;
    this.connectionStatus.reconnectAttempts++;
    this.notifyStatusListeners();

    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.connectionStatus.reconnectAttempts - 1),
      30000
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Reconnection failed, will try again
      });
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.lastPingTime = Date.now();
        this.send({ type: 'ping', timestamp: this.lastPingTime });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleError(error: Error): void {
    this.connectionStatus.lastError = error.message;
    this.connectionStatus.isConnected = false;
    this.notifyStatusListeners();
    // Only log actual errors, not connection attempts
    if (error.message !== 'Connection timeout') {
      console.error('WebSocket error:', error);
    }
  }

  public send(message: WebSocketMessage): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({
          ...message,
          timestamp: message.timestamp || Date.now()
        }));
        return true;
      } catch (error) {
        this.handleError(error as Error);
        return false;
      }
    }
    return false;
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    this.cleanup();
    this.connectionStatus = {
      isConnected: false,
      isReconnecting: false,
      reconnectAttempts: 0
    };
    this.notifyStatusListeners();
  }

  private cleanup(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }
  }

  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    // Immediately notify with current status
    listener(this.connectionStatus);
    
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  private notifyStatusListeners(): void {
    this.statusListeners.forEach(listener => {
      try {
        listener({ ...this.connectionStatus });
      } catch (error) {
        console.error('Error in status listener:', error);
      }
    });
  }

  private notifyMessageListeners(message: WebSocketMessage): void {
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  public getStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  public isConnected(): boolean {
    return this.connectionStatus.isConnected;
  }

  public forceReconnect(): void {
    this.connectionStatus.reconnectAttempts = 0;
    this.disconnect();
    this.shouldReconnect = true;
    this.connect();
  }
}

// Global WebSocket manager instance
export const wsManager = new WebSocketManager();

// Don't auto-connect to prevent console spam
// Connection will be initiated when needed by components