import { FC, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, User, Lock, Power } from 'lucide-react';
import { WebOSMascot } from './WebOSMascot';

interface User {
  username: string;
  password: string;
  fullName: string;
  avatar?: string;
  lastLogin?: Date;
  theme: 'light' | 'dark' | 'auto';
  wallpaper: string;
}

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onShutdown: () => void;
}

export const LoginScreen: FC<LoginScreenProps> = ({ onLogin, onShutdown }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showStartup, setShowStartup] = useState(true);
  
  const [newAccount, setNewAccount] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  // Startup sequence with logo and sound
  useEffect(() => {
    const startupSequence = async () => {
      // Play startup sound
      try {
        if ('AudioContext' in window) {
          const audioContext = new AudioContext();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        }
      } catch (e) {
        // Silently handle audio error
      }

      // Show startup logo for 8 seconds to enjoy the mascot longer
      setTimeout(() => {
        setShowStartup(false);
      }, 8000);
    };

    startupSequence();
  }, []);

  // Load users on mount
  useEffect(() => {
    if (showStartup) return; // Don't load users during startup

    const loadUsers = () => {
      const stored = localStorage.getItem('webos-users');
      if (stored) {
        const parsedUsers = JSON.parse(stored);
        setUsers(parsedUsers);
        
        // Auto-select the last logged in user
        const lastUser = localStorage.getItem('webos-last-user');
        if (lastUser) {
          const user = parsedUsers.find((u: User) => u.username === lastUser);
          if (user) {
            setSelectedUser(user);
          }
        } else if (parsedUsers.length > 0) {
          setSelectedUser(parsedUsers[0]);
        }
      } else {
        // Create default admin account
        const defaultUser: User = {
          username: 'Admin',
          password: 'password',
          fullName: 'Administrator',
          theme: 'dark',
          wallpaper: 'arch'
        };
        setUsers([defaultUser]);
        setSelectedUser(defaultUser);
        localStorage.setItem('webos-users', JSON.stringify([defaultUser]));
      }
    };

    loadUsers();
  }, [showStartup]);

  const handleLogin = async () => {
    if (!selectedUser || !password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (password === selectedUser.password) {
      const updatedUser = {
        ...selectedUser,
        lastLogin: new Date()
      };

      // Update user's last login
      const updatedUsers = users.map(u => 
        u.username === selectedUser.username ? updatedUser : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('webos-users', JSON.stringify(updatedUsers));
      localStorage.setItem('webos-last-user', selectedUser.username);
      localStorage.setItem('webos-current-user', JSON.stringify(updatedUser));

      onLogin(updatedUser);
    } else {
      setError('Invalid password');
    }

    setIsLoading(false);
  };

  const handleCreateAccount = () => {
    if (!newAccount.username || !newAccount.password || !newAccount.fullName) {
      setError('Please fill in all fields');
      return;
    }

    if (newAccount.password !== newAccount.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (users.some(u => u.username === newAccount.username)) {
      setError('Username already exists');
      return;
    }

    const user: User = {
      username: newAccount.username,
      password: newAccount.password,
      fullName: newAccount.fullName,
      theme: 'dark',
      wallpaper: 'arch'
    };

    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    localStorage.setItem('webos-users', JSON.stringify(updatedUsers));
    
    setSelectedUser(user);
    setShowCreateAccount(false);
    setNewAccount({ username: '', password: '', confirmPassword: '', fullName: '' });
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      if (showCreateAccount) {
        handleCreateAccount();
      } else {
        handleLogin();
      }
    }
  };

  // Show startup screen
  if (showStartup) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Startup animation */}
        <div className="text-center">
          <div className="mb-8 animate-pulse">
            <svg width="120" height="120" viewBox="0 0 200 200" className="text-orange-400 mx-auto">
              <rect x="20" y="20" width="160" height="160" rx="20" fill="none" stroke="currentColor" strokeWidth="8"/>
              <text x="100" y="80" textAnchor="middle" className="text-4xl font-bold fill-orange-400">&lt;/&gt;</text>
              <text x="100" y="140" textAnchor="middle" className="text-sm fill-yellow-400">HTML</text>
              <circle cx="60" cy="160" r="8" className="fill-blue-400"/>
              <circle cx="100" cy="160" r="8" className="fill-green-400"/>
              <circle cx="140" cy="160" r="8" className="fill-red-400"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">WebOS</h1>
          <p className="text-orange-400 text-lg">HTML/JavaScript Operating System</p>
          
          {/* Loading dots */}
          <div className="flex justify-center mt-6 space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
          
          {/* Interactive WebOS Mascot */}
          <WebOSMascot isVisible={showStartup} />
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
            <pattern id="loginGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(115, 176, 219, 0.3)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loginGrid)" />
        </svg>
      </div>

      {/* WebOS logo background */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
        <svg width="600" height="600" viewBox="0 0 200 200" className="text-white">
          <rect x="20" y="20" width="160" height="160" rx="20" fill="none" stroke="currentColor" strokeWidth="4"/>
          <text x="100" y="80" textAnchor="middle" className="text-6xl font-bold fill-current">&lt;/&gt;</text>
          <text x="100" y="140" textAnchor="middle" className="text-2xl fill-current">HTML</text>
        </svg>
      </div>

      {/* Login card */}
      <Card className="w-full max-w-md p-8 bg-background/95 backdrop-blur-sm border-border/50 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 200 200" className="text-primary">
              <rect x="20" y="20" width="160" height="160" rx="20" fill="none" stroke="currentColor" strokeWidth="8"/>
              <text x="100" y="80" textAnchor="middle" className="text-4xl font-bold fill-current">&lt;/&gt;</text>
              <text x="100" y="140" textAnchor="middle" className="text-sm fill-current">JS</text>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">WebOS</h1>
          <p className="text-muted-foreground">HTML/JavaScript Desktop Environment</p>
        </div>

        {!showCreateAccount ? (
          <>
            {/* User selection */}
            {users.length > 0 && (
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Select User</Label>
                <div className="space-y-2">
                  {users.map((user) => (
                    <Card
                      key={user.username}
                      className={`p-3 cursor-pointer transition-all hover:bg-accent ${
                        selectedUser?.username === user.username
                          ? 'ring-2 ring-primary bg-accent'
                          : 'bg-background'
                      }`}
                      onClick={() => {
                        setSelectedUser(user);
                        setPassword('');
                        setError('');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-muted-foreground">@{user.username}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Password input */}
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleLogin}
                  disabled={isLoading || !password}
                  className="w-full"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-between mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateAccount(true)}
              >
                <User className="w-4 h-4 mr-2" />
                New User
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onShutdown}
                className="text-destructive hover:text-destructive"
              >
                <Power className="w-4 h-4 mr-2" />
                Shutdown
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Create account form */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-center">Create New Account</h2>
              
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={newAccount.fullName}
                  onChange={(e) => setNewAccount({ ...newAccount, fullName: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newAccount.username}
                  onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value.toLowerCase() })}
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <Label htmlFor="newPassword">Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={newAccount.confirmPassword}
                  onChange={(e) => setNewAccount({ ...newAccount, confirmPassword: e.target.value })}
                  onKeyPress={handleKeyPress}
                  placeholder="Confirm your password"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button onClick={handleCreateAccount} className="flex-1">
                  Create Account
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateAccount(false);
                    setError('');
                    setNewAccount({ username: '', password: '', confirmPassword: '', fullName: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

    </div>
  );
};