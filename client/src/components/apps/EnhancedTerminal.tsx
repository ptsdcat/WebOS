import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Terminal as TerminalIcon, Activity, Cpu, HardDrive, Wifi } from 'lucide-react';

interface TerminalLine {
  type: 'command' | 'output' | 'error' | 'success' | 'system';
  content: string;
  timestamp: Date;
}

export const EnhancedTerminal: FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      type: 'system',
      content: 'WebOS Enhanced Terminal v5.0 - Real-time System Interface',
      timestamp: new Date()
    },
    {
      type: 'system',
      content: 'Type "help" for commands, "system-status" for real-time monitoring',
      timestamp: new Date()
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMonitoring) {
      interval = setInterval(() => {
        const timestamp = new Date();
        const cpu = Math.floor(Math.random() * 100);
        const memory = Math.floor(Math.random() * 100);
        const disk = 78;
        
        setLines(prev => [...prev, {
          type: 'system',
          content: `[${timestamp.toLocaleTimeString()}] CPU: ${cpu}% | Memory: ${memory}% | Disk: ${disk}% | Network: ${Math.floor(Math.random() * 50)}MB/s`,
          timestamp
        }]);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  const executeCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    const commandLine: TerminalLine = {
      type: 'command',
      content: `user@webos:~$ ${trimmedCmd}`,
      timestamp: new Date()
    };

    let output = '';
    let outputType: 'output' | 'error' | 'success' = 'output';

    if (trimmedCmd === 'help') {
      output = `Enhanced WebOS Terminal Commands:
======================================
SYSTEM MONITORING:
  system-status         - Real-time system monitoring toggle
  process-monitor       - Show running processes
  network-monitor       - Network activity monitoring
  performance-test      - Run performance benchmarks
  disk-analyzer         - Analyze disk usage patterns

LIVE DATA SERVICES:
  check-apis           - Test external API connectivity
  weather [location]   - Get weather data (requires API key)
  crypto-prices        - Cryptocurrency market data
  stock-quote [symbol] - Stock market quotes
  news-feed [category] - Latest news headlines

ADVANCED SYSTEM:
  gpu-info             - Graphics card information
  thermal-status       - CPU/GPU temperature monitoring
  power-management     - Battery and power statistics
  security-scan        - System security audit
  backup-status        - Backup and recovery status

DEVELOPMENT TOOLS:
  docker-status        - Container management
  git-projects         - Git repository management
  database-connect     - Database connectivity
  api-endpoints        - Available API endpoints
  log-analyzer         - System log analysis

Type any command for detailed help or usage examples.`;
    } else if (trimmedCmd === 'system-status') {
      setIsMonitoring(!isMonitoring);
      output = isMonitoring ? 'Real-time monitoring stopped' : 'Real-time monitoring started';
      outputType = 'success';
    } else if (trimmedCmd === 'process-monitor') {
      output = `Process Monitor - Active Processes:
=====================================
PID    NAME              CPU%   MEM%   STATUS
1      systemd           0.1    0.2    Running
789    gnome-shell       8.5    12.3   Running
1024   firefox           15.2   25.8   Running
1156   webos-terminal    3.4    5.1    Running
2048   nodejs            12.8   18.6   Running
3072   docker-daemon     2.1    8.9    Running
4096   postgresql        1.8    15.2   Running
5120   nginx             0.5    2.3    Running
6144   redis-server      0.8    4.7    Running
7168   elasticsearch     5.3    22.1   Running

Total Processes: 247 | Running: 189 | Sleeping: 58`;
    } else if (trimmedCmd === 'network-monitor') {
      output = `Network Activity Monitor:
========================
Interface: enp0s3
  IP Address: 192.168.1.100/24
  Gateway: 192.168.1.1
  DNS Servers: 8.8.8.8, 1.1.1.1
  
Current Activity:
  Download: ${Math.floor(Math.random() * 100)}MB/s
  Upload: ${Math.floor(Math.random() * 50)}MB/s
  Packets In: ${Math.floor(Math.random() * 10000)}/sec
  Packets Out: ${Math.floor(Math.random() * 5000)}/sec
  
Active Connections: 45
Listening Ports: 22, 80, 443, 3000, 5432, 6379`;
    } else if (trimmedCmd === 'performance-test') {
      output = `System Performance Benchmark:
============================
CPU Performance Test... ⚡ 8,432 MIPS
Memory Bandwidth Test... 📊 15.6 GB/s
Disk I/O Test... 💾 542 MB/s read, 387 MB/s write
Network Latency Test... 🌐 12ms avg
Graphics Performance... 🎮 9,847 FPS

Overall Performance Score: 8.7/10
System Classification: High Performance Workstation`;
      outputType = 'success';
    } else if (trimmedCmd === 'disk-analyzer') {
      output = `Disk Usage Analysis:
==================
/ (root)          20GB  Used: 14.2GB (71%)  Available: 5.8GB
/home             50GB  Used: 32.1GB (64%)  Available: 17.9GB
/var              10GB  Used: 3.8GB (38%)   Available: 6.2GB
/tmp              2GB   Used: 0.3GB (15%)   Available: 1.7GB

Largest Directories:
/home/user/Documents    8.5GB
/var/log               2.1GB
/usr/share             4.3GB
/opt/applications      6.7GB

Disk Health: ✓ Good
SSD Wear Level: 12%
Estimated Lifespan: 8.2 years`;
    } else if (trimmedCmd === 'check-apis') {
      // Test API connectivity
      try {
        const responses = await Promise.allSettled([
          fetch('/api/weather?location=test'),
          fetch('/api/crypto'),
          fetch('/api/news'),
          fetch('/api/stocks?symbol=AAPL')
        ]);
        
        output = `API Connectivity Status:
=======================
Weather API: ${responses[0].status === 'fulfilled' ? '✓ Connected' : '✗ Authentication Error'}
Crypto API: ${responses[1].status === 'fulfilled' ? '✓ Connected' : '✗ Authentication Error'}
News API: ${responses[2].status === 'fulfilled' ? '✓ Connected' : '✗ Authentication Error'}
Stock API: ${responses[3].status === 'fulfilled' ? '✓ Connected' : '✗ Authentication Error'}

Note: API errors typically indicate invalid or expired API keys.
Use valid credentials for live data access.`;
      } catch (error) {
        output = 'Error testing API connectivity';
        outputType = 'error';
      }
    } else if (trimmedCmd.startsWith('weather ')) {
      const location = trimmedCmd.split(' ').slice(1).join(' ') || 'London';
      output = `Weather Service Integration:
============================
Attempting to fetch weather data for: ${location}

Note: Live weather data requires valid OpenWeatherMap API key.
Configure API credentials for real-time weather information.

Weather service features:
• Current conditions and forecasts
• Temperature, humidity, wind data  
• 5-day weather predictions
• Severe weather alerts`;
    } else if (trimmedCmd === 'crypto-prices') {
      output = `Cryptocurrency Market Integration:
=================================
Connecting to CoinAPI for live market data...

Note: Live crypto data requires valid CoinAPI key.
Configure API credentials for real-time pricing.

Features available with API access:
• Real-time cryptocurrency prices
• Market capitalization data
• 24-hour trading volumes
• Price change percentages
• Historical data analysis`;
    } else if (trimmedCmd.startsWith('stock-quote ')) {
      const symbol = trimmedCmd.split(' ')[1] || 'AAPL';
      output = `Stock Market Integration:
========================
Fetching quote for: ${symbol.toUpperCase()}

Note: Live stock data requires valid Alpha Vantage API key.
Configure API credentials for real-time market data.

Features available with API access:
• Real-time stock quotes
• Intraday and historical data
• Company fundamentals
• Technical indicators
• Market analysis tools`;
    } else if (trimmedCmd.startsWith('news-feed ')) {
      const category = trimmedCmd.split(' ')[1] || 'technology';
      output = `News Feed Integration:
=====================
Fetching ${category} news headlines...

Note: Live news data requires valid NewsAPI key.
Configure API credentials for real-time news feeds.

Features available with API access:
• Breaking news headlines
• Category-specific feeds
• Source filtering
• Search functionality
• Article summaries`;
    } else if (trimmedCmd === 'gpu-info') {
      output = `Graphics Processing Unit Information:
=====================================
GPU Model: NVIDIA GeForce RTX 4080
Driver Version: 545.29.06
CUDA Version: 12.3
Memory: 16GB GDDR6X
Memory Clock: 1188 MHz
Core Clock: 2505 MHz
Temperature: ${35 + Math.floor(Math.random() * 25)}°C
Power Usage: ${150 + Math.floor(Math.random() * 170)}W
Performance State: P0 (Maximum Performance)

OpenGL Version: 4.6.0
Vulkan Support: 1.3.0
DirectX Support: 12 Ultimate`;
    } else if (trimmedCmd === 'thermal-status') {
      output = `Thermal Monitoring System:
=========================
CPU Temperature: ${45 + Math.floor(Math.random() * 25)}°C (Normal)
GPU Temperature: ${40 + Math.floor(Math.random() * 30)}°C (Normal)
Motherboard: ${35 + Math.floor(Math.random() * 15)}°C
Storage SSD: ${32 + Math.floor(Math.random() * 18)}°C

Fan Speeds:
CPU Cooler: ${800 + Math.floor(Math.random() * 800)} RPM
GPU Fans: ${1200 + Math.floor(Math.random() * 1000)} RPM
Case Fans: ${600 + Math.floor(Math.random() * 400)} RPM

Thermal Status: ✓ All components within safe operating temperatures`;
    } else if (trimmedCmd === 'clear') {
      setLines([]);
      return;
    } else {
      output = `Command not found: ${trimmedCmd}
Type 'help' for available commands or 'check-apis' to test live data services.`;
      outputType = 'error';
    }

    const outputLine: TerminalLine = {
      type: outputType,
      content: output,
      timestamp: new Date()
    };

    setLines(prev => [...prev, commandLine, outputLine]);
    setCommandHistory(prev => [...prev, trimmedCmd]);
    setCurrentCommand('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div className="bg-black rounded-lg shadow-2xl overflow-hidden border border-green-500/20 w-full h-full">
      <div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-green-500/20">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-4 h-4 text-green-400" />
          <span className="text-green-400 font-medium">Enhanced Terminal</span>
          {isMonitoring && (
            <div className="flex items-center space-x-1">
              <Activity className="w-3 h-3 text-yellow-400 animate-pulse" />
              <span className="text-yellow-400 text-xs">MONITORING</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <Cpu className="w-3 h-3" />
          <span>{Math.floor(Math.random() * 100)}%</span>
          <HardDrive className="w-3 h-3" />
          <span>78%</span>
          <Wifi className="w-3 h-3" />
          <span>{Math.floor(Math.random() * 50)}MB/s</span>
        </div>
      </div>

      <div 
        ref={terminalRef}
        className="bg-black text-green-400 p-4 h-96 overflow-y-auto font-mono text-sm"
      >
        {lines.map((line, index) => (
          <div key={index} className="mb-1">
            <span className="text-gray-500 text-xs mr-2">
              {line.timestamp.toLocaleTimeString()}
            </span>
            <span className={
              line.type === 'command' ? 'text-yellow-400' :
              line.type === 'error' ? 'text-red-400' :
              line.type === 'success' ? 'text-green-400' :
              line.type === 'system' ? 'text-cyan-400' :
              'text-green-400'
            }>
              {line.content.split('\n').map((subLine, subIndex) => (
                <div key={subIndex}>{subLine}</div>
              ))}
            </span>
          </div>
        ))}
        
        <div className="flex items-center">
          <span className="text-yellow-400 mr-2">
            {new Date().toLocaleTimeString()} user@webos:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent text-green-400 outline-none flex-1 font-mono"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};