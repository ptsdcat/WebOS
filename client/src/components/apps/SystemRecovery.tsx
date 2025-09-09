import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Wrench, HardDrive, Wifi, Settings } from 'lucide-react';

interface DiagnosticResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'pass' | 'fail' | 'warning';
  details: string;
  fixAvailable?: boolean;
  critical?: boolean;
}

interface RecoveryStep {
  id: string;
  title: string;
  description: string;
  action: () => Promise<boolean>;
  dangerous?: boolean;
}

export const SystemRecovery: FC = () => {
  const [currentStep, setCurrentStep] = useState<'home' | 'diagnostics' | 'recovery' | 'results'>('home');
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFixes, setSelectedFixes] = useState<string[]>([]);
  const [recoveryResults, setRecoveryResults] = useState<{[key: string]: boolean}>({});

  const diagnosticTests: DiagnosticResult[] = [
    {
      id: 'storage',
      name: 'Local Storage Check',
      status: 'pending',
      details: 'Checking browser storage integrity and capacity',
      fixAvailable: true
    },
    {
      id: 'apps',
      name: 'Installed Applications',
      status: 'pending',
      details: 'Verifying installed app configurations',
      fixAvailable: true
    },
    {
      id: 'settings',
      name: 'System Settings',
      status: 'pending',
      details: 'Validating system configuration files',
      fixAvailable: true
    },
    {
      id: 'database',
      name: 'Database Connection',
      status: 'pending',
      details: 'Testing backend database connectivity',
      fixAvailable: false
    },
    {
      id: 'memory',
      name: 'Memory Usage',
      status: 'pending',
      details: 'Analyzing browser memory consumption',
      fixAvailable: true
    },
    {
      id: 'permissions',
      name: 'Browser Permissions',
      status: 'pending',
      details: 'Checking required browser API access',
      fixAvailable: false
    }
  ];

  const recoverySteps: RecoveryStep[] = [
    {
      id: 'storage',
      title: 'Clear Corrupted Storage Data',
      description: 'Remove invalid entries from local storage',
      action: async () => {
        const keysToCheck = Object.keys(localStorage);
        let fixed = false;
        
        keysToCheck.forEach(key => {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              JSON.parse(value);
            }
          } catch (e) {
            localStorage.removeItem(key);
            fixed = true;
          }
        });
        
        return fixed;
      }
    },
    {
      id: 'apps',
      title: 'Reset Application Registry',
      description: 'Rebuild the installed applications list',
      action: async () => {
        const installedApps = localStorage.getItem('webos-installed-apps');
        if (installedApps) {
          try {
            const apps = JSON.parse(installedApps);
            const validApps = apps.filter((app: any) => app.id && app.name && app.component);
            localStorage.setItem('webos-installed-apps', JSON.stringify(validApps));
            return true;
          } catch (e) {
            localStorage.removeItem('webos-installed-apps');
            return true;
          }
        }
        return false;
      }
    },
    {
      id: 'settings',
      title: 'Restore Default Settings',
      description: 'Reset system settings to factory defaults',
      action: async () => {
        const settingsKeys = [
          'webos-theme', 'webos-wallpaper', 'webos-show-icons',
          'webos-icon-positions', 'webos-folders'
        ];
        
        settingsKeys.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Set safe defaults
        localStorage.setItem('webos-theme', 'dark');
        localStorage.setItem('webos-wallpaper', 'default');
        localStorage.setItem('webos-show-icons', 'true');
        
        return true;
      },
      dangerous: true
    },
    {
      id: 'memory',
      title: 'Clear Browser Cache',
      description: 'Force garbage collection and clear caches',
      action: async () => {
        // Clear session storage
        sessionStorage.clear();
        
        // Force garbage collection if available
        if ('gc' in window && typeof window.gc === 'function') {
          window.gc();
        }
        
        return true;
      }
    }
  ];

  const runDiagnostics = async () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentStep('diagnostics');
    
    const results = [...diagnosticTests];
    setDiagnostics(results);

    for (let i = 0; i < results.length; i++) {
      // Update current test status
      results[i].status = 'running';
      setDiagnostics([...results]);
      
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate test time
      
      // Run actual diagnostic
      const testResult = await runDiagnosticTest(results[i].id);
      results[i] = { ...results[i], ...testResult };
      
      setDiagnostics([...results]);
      setProgress(((i + 1) / results.length) * 100);
    }
    
    setIsRunning(false);
  };

  const runDiagnosticTest = async (testId: string): Promise<Partial<DiagnosticResult>> => {
    switch (testId) {
      case 'storage':
        try {
          const testKey = 'webos-test-storage';
          localStorage.setItem(testKey, 'test');
          localStorage.removeItem(testKey);
          
          // Check for corrupted data
          let corruptedKeys = 0;
          Object.keys(localStorage).forEach(key => {
            try {
              const value = localStorage.getItem(key);
              if (value) JSON.parse(value);
            } catch {
              corruptedKeys++;
            }
          });
          
          if (corruptedKeys > 0) {
            return {
              status: 'warning',
              details: `Storage accessible but ${corruptedKeys} corrupted entries found`
            };
          }
          
          return {
            status: 'pass',
            details: 'Local storage is healthy and accessible'
          };
        } catch {
          return {
            status: 'fail',
            details: 'Local storage is not accessible or full',
            critical: true
          };
        }

      case 'apps':
        try {
          const installedApps = localStorage.getItem('webos-installed-apps');
          if (installedApps) {
            const apps = JSON.parse(installedApps);
            const invalidApps = apps.filter((app: any) => !app.id || !app.name);
            
            if (invalidApps.length > 0) {
              return {
                status: 'warning',
                details: `${invalidApps.length} invalid app entries found`
              };
            }
          }
          
          return {
            status: 'pass',
            details: 'All installed applications are properly configured'
          };
        } catch {
          return {
            status: 'fail',
            details: 'Application registry is corrupted'
          };
        }

      case 'settings':
        const requiredSettings = ['webos-theme', 'webos-wallpaper'];
        const missingSettings = requiredSettings.filter(setting => 
          !localStorage.getItem(setting)
        );
        
        if (missingSettings.length > 0) {
          return {
            status: 'warning',
            details: `Missing settings: ${missingSettings.join(', ')}`
          };
        }
        
        return {
          status: 'pass',
          details: 'System settings are properly configured'
        };

      case 'database':
        try {
          const response = await fetch('/api/health-check');
          if (response.ok) {
            return {
              status: 'pass',
              details: 'Database connection is healthy'
            };
          } else {
            return {
              status: 'warning',
              details: 'Database connection issues detected'
            };
          }
        } catch {
          return {
            status: 'fail',
            details: 'Cannot connect to backend database'
          };
        }

      case 'memory':
        const memoryInfo = (performance as any).memory;
        if (memoryInfo) {
          const usagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
          
          if (usagePercent > 80) {
            return {
              status: 'warning',
              details: `High memory usage: ${usagePercent.toFixed(1)}%`
            };
          }
          
          return {
            status: 'pass',
            details: `Memory usage: ${usagePercent.toFixed(1)}%`
          };
        }
        
        return {
          status: 'pass',
          details: 'Memory information not available but system responsive'
        };

      case 'permissions':
        const permissions = ['localStorage', 'sessionStorage', 'indexedDB'];
        const failedPermissions = permissions.filter(perm => {
          try {
            return !(perm in window);
          } catch {
            return true;
          }
        });
        
        if (failedPermissions.length > 0) {
          return {
            status: 'warning',
            details: `Missing permissions: ${failedPermissions.join(', ')}`
          };
        }
        
        return {
          status: 'pass',
          details: 'All required browser permissions are available'
        };

      default:
        return {
          status: 'fail',
          details: 'Unknown diagnostic test'
        };
    }
  };

  const runRecovery = async () => {
    setCurrentStep('recovery');
    setIsRunning(true);
    const results: {[key: string]: boolean} = {};
    
    for (const fixId of selectedFixes) {
      const step = recoverySteps.find(s => s.id === fixId);
      if (step) {
        try {
          const success = await step.action();
          results[fixId] = success;
        } catch (error) {
          results[fixId] = false;
        }
      }
    }
    
    setRecoveryResults(results);
    setIsRunning(false);
    setCurrentStep('results');
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      running: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (currentStep === 'home') {
    return (
      <div className="h-full p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Wrench className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-3xl font-bold mb-2">System Recovery Wizard</h1>
            <p className="text-muted-foreground">
              Diagnose and fix common WebOS issues automatically
            </p>
          </div>

          <div className="grid gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={runDiagnostics}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <HardDrive className="w-8 h-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-lg">Run System Diagnostics</h3>
                    <p className="text-muted-foreground">
                      Automatically scan for system issues and errors
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Settings className="w-8 h-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-lg">Manual Recovery Tools</h3>
                    <p className="text-muted-foreground">
                      Access individual recovery and repair utilities
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Wifi className="w-8 h-8 text-purple-500" />
                  <div>
                    <h3 className="font-semibold text-lg">Network Diagnostics</h3>
                    <p className="text-muted-foreground">
                      Test network connectivity and backend services
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'diagnostics') {
    return (
      <div className="h-full p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">System Diagnostics</h1>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {isRunning ? 'Running diagnostics...' : `Completed ${diagnostics.filter(d => d.status !== 'pending').length}/${diagnostics.length} tests`}
            </p>
          </div>

          <div className="space-y-4">
            {diagnostics.map((diagnostic) => (
              <Card key={diagnostic.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(diagnostic.status)}
                      <div>
                        <h3 className="font-medium">{diagnostic.name}</h3>
                        <p className="text-sm text-muted-foreground">{diagnostic.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {diagnostic.critical && (
                        <Badge variant="destructive">Critical</Badge>
                      )}
                      {getStatusBadge(diagnostic.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isRunning && diagnostics.some(d => d.status === 'fail' || d.status === 'warning') && (
            <div className="mt-6 text-center">
              <Button 
                onClick={() => {
                  const availableFixes = diagnostics
                    .filter(d => (d.status === 'fail' || d.status === 'warning') && d.fixAvailable)
                    .map(d => d.id);
                  setSelectedFixes(availableFixes);
                  setCurrentStep('recovery');
                }}
                className="px-8"
              >
                Proceed to Recovery
              </Button>
            </div>
          )}

          {!isRunning && diagnostics.every(d => d.status === 'pass') && (
            <div className="mt-6 text-center">
              <div className="p-6 bg-green-50 rounded-lg">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">System Healthy</h3>
                <p className="text-green-700">No issues were detected during the diagnostic scan.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 'recovery') {
    const availableSteps = recoverySteps.filter(step => selectedFixes.includes(step.id));

    return (
      <div className="h-full p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Recovery Actions</h1>
            <p className="text-muted-foreground">
              Review and confirm the recovery actions to be performed
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {availableSteps.map((step) => (
              <Card key={step.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Wrench className="w-5 h-5 mt-1 text-primary" />
                    <div className="flex-1">
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      {step.dangerous && (
                        <Badge variant="destructive" className="text-xs">
                          Destructive Action
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep('diagnostics')}
              disabled={isRunning}
            >
              Back to Diagnostics
            </Button>
            <Button 
              onClick={runRecovery}
              disabled={isRunning || availableSteps.length === 0}
              className="flex-1"
            >
              {isRunning ? 'Running Recovery...' : 'Start Recovery'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'results') {
    const successCount = Object.values(recoveryResults).filter(Boolean).length;
    const totalCount = Object.keys(recoveryResults).length;

    return (
      <div className="h-full p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            {successCount === totalCount ? (
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            ) : (
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            )}
            <h1 className="text-2xl font-bold mb-2">Recovery Complete</h1>
            <p className="text-muted-foreground">
              {successCount} of {totalCount} recovery actions completed successfully
            </p>
          </div>

          <div className="space-y-4 mb-6">
            {Object.entries(recoveryResults).map(([stepId, success]) => {
              const step = recoverySteps.find(s => s.id === stepId);
              if (!step) return null;

              return (
                <Card key={stepId}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <h3 className="font-medium">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {success ? 'Completed successfully' : 'Failed to complete'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep('home')}
              className="flex-1"
            >
              Return to Home
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Restart System
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};