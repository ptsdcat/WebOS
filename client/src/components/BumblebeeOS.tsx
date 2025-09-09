import { FC, useState, useEffect } from 'react';
import { BumblebeeLogin } from './BumblebeeLogin';
import { BumblebeeDesktop } from './BumblebeeDesktop';

interface BumblebeeOSProps {
  onReturnToWebOS: () => void;
}

export const BumblebeeOS: FC<BumblebeeOSProps> = ({ onReturnToWebOS }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-orange-400 via-yellow-500 to-amber-600 overflow-hidden">
      {!isLoggedIn ? (
        <BumblebeeLogin onLogin={handleLogin} onReturnToWebOS={onReturnToWebOS} />
      ) : (
        <BumblebeeDesktop 
          username={currentUser} 
          onLogout={handleLogout}
          onReturnToWebOS={onReturnToWebOS}
        />
      )}
    </div>
  );
};