import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Desktop } from "@/components/desktop/Desktop";
import { ArchInstaller } from "@/components/ArchInstaller";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { LoginScreen } from "@/components/LoginScreen";
import { LoginAnimation } from "@/components/LoginAnimation";
import { ShutdownScreen } from "@/components/ShutdownScreen";
import { ShutdownConsole } from "@/components/ShutdownConsole";
import { BumblebeeOS } from "@/components/BumblebeeOS";
import NotFound from "@/pages/not-found";
import { useState } from "react";

function Router() {
  const [isInstalled, setIsInstalled] = useState(() => {
    // Check if we have terminal redirect parameter after factory reset
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('terminal') === 'true') {
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
      return false; // Force terminal view
    }
    // Check if already installed
    return localStorage.getItem('archInstalled') === 'true';
  });
  
  const [showWelcome, setShowWelcome] = useState(() => {
    // Check if setup is complete
    return localStorage.getItem('webos-setup-complete') !== 'true';
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [showShutdown, setShowShutdown] = useState(false);
  const [showShutdownConsole, setShowShutdownConsole] = useState(false);
  const [shutdownType, setShutdownType] = useState<'shutdown' | 'restart' | 'logout'>('shutdown');
  const [showLoginAnimation, setShowLoginAnimation] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('webos-current-user');
    return stored ? JSON.parse(stored) : null;
  });

  const [inBumblebeeOS, setInBumblebeeOS] = useState(() => {
    return localStorage.getItem('bumblebee-active') === 'true';
  });

  const handleInstallComplete = () => {
    localStorage.setItem('archInstalled', 'true');
    setIsInstalled(true);
    setShowWelcome(false);
    setIsLoggedIn(false);
    // Clear any auto-login states
    localStorage.removeItem('webos-current-user');
    localStorage.removeItem('webos-auto-login');
  };

  const handleWelcomeComplete = (userInfo: any) => {
    // Apply user settings but don't auto-login
    localStorage.setItem('webos-theme', userInfo.theme);
    localStorage.setItem('webos-wallpaper', userInfo.wallpaper);
    localStorage.setItem('webos-username', userInfo.username);
    localStorage.setItem('webos-setup-complete', 'true');
    
    // Apply theme immediately
    document.documentElement.classList.toggle('dark', userInfo.theme === 'dark');
    
    // Dispatch events to update desktop
    window.dispatchEvent(new CustomEvent('wallpaper-change', { 
      detail: { wallpaper: getWallpaperClass(userInfo.wallpaper) } 
    }));
    
    setShowWelcome(false);
    setIsLoggedIn(false); // Force manual login
  };

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setShowLoginAnimation(true);
    
    // Apply user preferences
    document.documentElement.classList.toggle('dark', user.theme === 'dark');
    window.dispatchEvent(new CustomEvent('wallpaper-change', { 
      detail: { wallpaper: getWallpaperClass(user.wallpaper) } 
    }));
  };

  const handleLoginAnimationComplete = () => {
    setShowLoginAnimation(false);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setShutdownType('logout');
    setShowShutdown(false);
    setShowShutdownConsole(true);
  };

  const handleRestart = () => {
    setShutdownType('restart');
    setShowShutdown(false);
    setShowShutdownConsole(true);
  };

  const handleShutdown = () => {
    setShowShutdown(true);
  };

  const handleShutdownAction = () => {
    setShutdownType('shutdown');
    setShowShutdown(false);
    setShowShutdownConsole(true);
  };

  const handleShutdownComplete = () => {
    setShowShutdownConsole(false);
    
    if (shutdownType === 'logout') {
      localStorage.removeItem('webos-current-user');
      localStorage.removeItem('webos-last-user');
      setCurrentUser(null);
      setIsLoggedIn(false);
    } else if (shutdownType === 'restart') {
      localStorage.removeItem('webos-current-user');
      localStorage.removeItem('webos-last-user');
      window.location.reload();
    } else {
      localStorage.removeItem('webos-current-user');
      localStorage.removeItem('webos-last-user');
      setCurrentUser(null);
      setIsLoggedIn(false);
    }
  };

  const handleBumblebeeOSLaunch = () => {
    localStorage.setItem('bumblebee-active', 'true');
    setInBumblebeeOS(true);
  };

  const handleReturnToWebOS = () => {
    localStorage.removeItem('bumblebee-active');
    setInBumblebeeOS(false);
  };

  const handleFactoryReset = () => {
    // Clear all user data except installation status
    const keysToKeep = [
      'archInstalled',
      'webos-setup-complete'
    ];
    
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    // Reset application state
    setCurrentUser(null);
    setIsLoggedIn(false);
    setShowShutdown(false);
    
    // Force a complete page reload to reset all state
    window.location.reload();
  };

  const getWallpaperClass = (wallpaper: string) => {
    switch (wallpaper) {
      case 'terminal':
        return 'bg-gradient-to-br from-green-900 to-black';
      case 'code':
        return 'bg-gradient-to-br from-blue-900 to-indigo-900';
      case 'matrix':
        return 'bg-gradient-to-br from-black to-green-800';
      case 'cyber':
        return 'bg-gradient-to-br from-purple-900 to-black';
      case 'sunset':
        return 'bg-gradient-to-br from-orange-600 to-red-800';
      case 'ocean':
        return 'bg-gradient-to-br from-blue-400 to-blue-800';
      case 'forest':
        return 'bg-gradient-to-br from-green-600 to-green-900';
      case 'fire':
        return 'bg-gradient-to-br from-red-500 to-orange-700';
      case 'cosmic':
        return 'bg-gradient-to-br from-indigo-600 to-purple-800';
      case 'dawn':
        return 'bg-gradient-to-br from-pink-400 to-purple-600';
      case 'midnight':
        return 'bg-gradient-to-br from-gray-900 to-blue-900';
      case 'custom':
        const customImage = localStorage.getItem('webos-custom-wallpaper');
        return customImage ? `bg-[url('${customImage}')] bg-cover bg-center bg-no-repeat` : 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900';
      default:
        return 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900';
    }
  };

  if (!isInstalled) {
    return <ArchInstaller onInstallComplete={handleInstallComplete} />;
  }

  if (inBumblebeeOS) {
    return <BumblebeeOS onReturnToWebOS={handleReturnToWebOS} />;
  }

  if (showShutdownConsole) {
    return (
      <ShutdownConsole 
        onComplete={handleShutdownComplete}
        shutdownType={shutdownType}
      />
    );
  }

  if (showShutdown) {
    return (
      <ShutdownScreen 
        onRestart={handleRestart}
        onLogout={handleLogout}
        onCancel={() => setShowShutdown(false)}
        onFactoryReset={handleFactoryReset}
        onShutdown={handleShutdownAction}
      />
    );
  }

  if (showLoginAnimation && currentUser) {
    return (
      <LoginAnimation 
        username={currentUser.fullName || currentUser.username}
        onComplete={handleLoginAnimationComplete}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginScreen 
        onLogin={handleLogin}
        onShutdown={handleShutdown}
      />
    );
  }

  return (
    <>
      <Switch>
        <Route path="/" component={() => <Desktop 
          onLogout={handleLogout} 
          onShutdown={handleShutdown}
          onRestart={handleRestart}
        />} />
        <Route component={NotFound} />
      </Switch>
      
      <WelcomeDialog 
        isOpen={showWelcome} 
        onComplete={handleWelcomeComplete} 
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
