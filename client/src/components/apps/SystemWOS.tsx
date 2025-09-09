import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  Cpu, 
  HardDrive, 
  Monitor, 
  Settings,
  Lock,
  Key,
  Database,
  Server,
  Network,
  Zap
} from 'lucide-react';

export const SystemWOS: FC = () => {
  const [isSystemIntact, setIsSystemIntact] = useState(true);
  const [systemHealth, setSystemHealth] = useState(100);
  const [criticalFiles] = useState([
    { name: 'kernel32.wos', status: 'protected', size: '15.2 MB', critical: true },
    { name: 'webos.dll', status: 'protected', size: '8.7 MB', critical: true },
    { name: 'system.core', status: 'protected', size: '25.1 MB', critical: true },
    { name: 'window.manager', status: 'protected', size: '12.4 MB', critical: true },
    { name: 'desktop.engine', status: 'protected', size: '18.9 MB', critical: true },
    { name: 'auth.service', status: 'protected', size: '6.3 MB', critical: true },
    { name: 'network.stack', status: 'protected', size: '11.8 MB', critical: true },
    { name: 'graphics.driver', status: 'protected', size: '22.5 MB', critical: true }
  ]);

  const [systemServices] = useState([
    { name: 'WebOS Core Service', status: 'running', pid: 1001, memory: '45.2 MB' },
    { name: 'Window Manager Service', status: 'running', pid: 1002, memory: '32.1 MB' },
    { name: 'Desktop Environment', status: 'running', pid: 1003, memory: '28.7 MB' },
    { name: 'Security Manager', status: 'running', pid: 1004, memory: '15.4 MB' },
    { name: 'Network Stack', status: 'running', pid: 1005, memory: '22.8 MB' },
    { name: 'File System Driver', status: 'running', pid: 1006, memory: '18.3 MB' },
    { name: 'Graphics Subsystem', status: 'running', pid: 1007, memory: '67.9 MB' },
    { name: 'Audio Engine', status: 'running', pid: 1008, memory: '12.6 MB' }
  ]);

  const [protectionLevel, setProtectionLevel] = useState('maximum');

  useEffect(() => {
    // Simulate system monitoring
    const interval = setInterval(() => {
      setSystemHealth(prev => {
        const newHealth = 95 + Math.random() * 5;
        return Math.round(newHealth);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSystemCorruption = () => {
    setIsSystemIntact(false);
    setSystemHealth(0);
    
    // Trigger critical system failure and show recovery screen
    setTimeout(() => {
      // Create recovery component and mount it
      const recoveryDiv = document.createElement('div');
      recoveryDiv.id = 'webos-recovery-screen';
      recoveryDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 999999;
        background: linear-gradient(135deg, #7f1d1d, #991b1b, #000);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: system-ui, sans-serif;
      `;
      
      recoveryDiv.innerHTML = `
        <div style="text-align: center; max-width: 600px; padding: 2rem;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
          <h1 style="font-size: 3rem; margin-bottom: 1rem;">CRITICAL SYSTEM FAILURE</h1>
          <p style="font-size: 1.5rem; margin-bottom: 1rem;">System WOS has been corrupted</p>
          <p style="font-size: 1.2rem; margin-bottom: 2rem;">WebOS cannot continue operation</p>
          <div style="background: rgba(0,0,0,0.5); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
            <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">WebOS Maker Recovery</h2>
            <p style="margin-bottom: 1rem;">Critical system files have been corrupted.</p>
            <p style="margin-bottom: 1rem;">Recovery options are limited.</p>
            <p style="color: #fbbf24;">Contact system administrator for recovery assistance.</p>
          </div>
          <p style="font-size: 0.9rem; opacity: 0.7;">Do not power off your computer</p>
        </div>
      `;
      
      document.body.appendChild(recoveryDiv);
    }, 3000);
  };

  if (!isSystemIntact) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-red-900 text-white">
        <div className="text-center space-y-6">
          <AlertTriangle className="w-24 h-24 text-red-400 mx-auto animate-pulse" />
          <h1 className="text-4xl font-bold">CRITICAL SYSTEM FAILURE</h1>
          <p className="text-xl">System WOS has been corrupted</p>
          <div className="space-y-2">
            <p className="text-lg">WebOS cannot continue operation</p>
            <p className="text-sm opacity-75">Redirecting to WebOS Maker Recovery...</p>
          </div>
          <Progress value={66} className="w-64 mx-auto" />
          <p className="text-xs opacity-50">Do not power off your computer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-blue-600/10 to-purple-600/10">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">System WOS</h2>
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">PROTECTED</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">System Health</p>
            <p className="text-lg font-bold text-green-600">{systemHealth}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Protection Level</p>
            <p className="text-lg font-bold text-blue-600">Maximum</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Critical System Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Critical System Files</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {criticalFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                        {file.status.toUpperCase()}
                      </span>
                      <Shield className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>System Services</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">PID: {service.pid}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">{service.status.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{service.memory}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Protection Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>File System Protection</span>
                  <span className="text-green-600 font-medium">ENABLED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Memory Protection</span>
                  <span className="text-green-600 font-medium">ENABLED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Registry Protection</span>
                  <span className="text-green-600 font-medium">ENABLED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Service Protection</span>
                  <span className="text-green-600 font-medium">ENABLED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Network Protection</span>
                  <span className="text-green-600 font-medium">ENABLED</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleSystemCorruption}
                  variant="destructive" 
                  className="w-full"
                  size="sm"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  DELETE SYSTEM WOS (DANGER)
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Warning: This will cause critical system failure
                </p>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="w-5 h-5" />
                <span>System Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">OS Version</p>
                  <p className="font-medium">WebOS 3.0.0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Build</p>
                  <p className="font-medium">22000.1.2024.0115</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Architecture</p>
                  <p className="font-medium">x64</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kernel</p>
                  <p className="font-medium">WebOS NT 10.0</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Boot Time</p>
                  <p className="font-medium">12.3 seconds</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="font-medium">2d 14h 23m</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm">12%</span>
                  </div>
                  <Progress value={12} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm">68%</span>
                  </div>
                  <Progress value={68} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Disk Usage</span>
                    <span className="text-sm">45%</span>
                  </div>
                  <Progress value={45} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warning Banner */}
        <Card className="mt-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Critical System Component</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  System WOS contains essential files required for WebOS operation. 
                  Deletion or corruption of this component will result in immediate system failure 
                  and require complete system recovery through WebOS Maker.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};