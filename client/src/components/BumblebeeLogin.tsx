import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Bug, Shield, User } from 'lucide-react';

interface BumblebeeLoginProps {
  onLogin: (username: string) => void;
  onReturnToWebOS: () => void;
}

export const BumblebeeLogin: FC<BumblebeeLoginProps> = ({ onLogin, onReturnToWebOS }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const defaultUsers = [
    { username: 'ubuntu', fullName: 'Ubuntu User', avatar: '👤' },
    { username: 'developer', fullName: 'Developer', avatar: '💻' },
    { username: 'admin', fullName: 'Administrator', avatar: '🔐' },
    { username: 'guest', fullName: 'Guest User', avatar: '👋' }
  ];

  const handleLogin = () => {
    if (username.trim()) {
      onLogin(username);
    }
  };

  const handleUserSelect = (user: string) => {
    setSelectedUser(user);
    setUsername(user);
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-orange-400 via-yellow-500 to-amber-600 flex items-center justify-center relative">
      {/* Hexagon Pattern Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 gap-4 h-full w-full p-8">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 border-2 border-orange-800 transform rotate-45"
              style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Return to WebOS Button */}
      <Button
        onClick={onReturnToWebOS}
        className="absolute top-4 left-4 bg-black/20 hover:bg-black/30 text-white border-orange-300"
        variant="outline"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Return to WebOS
      </Button>

      {/* Login Container */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        {/* Bumblebee OS Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 rounded-full mb-4 shadow-lg">
            <Bug className="w-10 h-10 text-orange-800" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bumblebee OS</h1>
          <p className="text-orange-100">Ubuntu-based Desktop Environment</p>
        </div>

        {/* User Selection */}
        <div className="mb-6">
          <label className="block text-orange-100 text-sm font-medium mb-3">
            Select User Account
          </label>
          <div className="grid grid-cols-2 gap-3">
            {defaultUsers.map((user) => (
              <button
                key={user.username}
                onClick={() => handleUserSelect(user.username)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedUser === user.username
                    ? 'border-white bg-white/20 text-white'
                    : 'border-orange-300/50 bg-white/10 text-orange-100 hover:bg-white/15'
                }`}
              >
                <div className="text-2xl mb-1">{user.avatar}</div>
                <div className="text-sm font-medium">{user.fullName}</div>
                <div className="text-xs opacity-75">{user.username}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Username Input */}
        <div className="mb-4">
          <label className="block text-orange-100 text-sm font-medium mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Username
          </label>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="bg-white/10 border-orange-300/50 text-white placeholder-orange-200/70 focus:border-white"
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label className="block text-orange-100 text-sm font-medium mb-2">
            <Shield className="w-4 h-4 inline mr-2" />
            Password
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="bg-white/10 border-orange-300/50 text-white placeholder-orange-200/70 focus:border-white"
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {/* Login Button */}
        <Button
          onClick={handleLogin}
          disabled={!username.trim()}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-orange-900 font-semibold py-3 text-lg disabled:opacity-50"
        >
          Sign In to Bumblebee OS
        </Button>

        {/* System Info */}
        <div className="mt-6 text-center text-orange-100/70 text-sm">
          <p>Bumblebee OS v22.04 LTS</p>
          <p>Powered by Ubuntu + GNOME</p>
        </div>
      </div>
    </div>
  );
};