import { FC, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, X, Star } from 'lucide-react';
import { playSounds } from '@/lib/soundManager';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementNotification: FC<AchievementNotificationProps> = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      playSounds.achievement();
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-50';
      case 'rare': return 'border-blue-400 bg-blue-50';
      case 'epic': return 'border-purple-400 bg-purple-50';
      case 'legendary': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Star className="w-4 h-4 text-yellow-500" />;
      default: return <Trophy className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div className={`fixed top-20 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <Card className={`p-4 w-80 border-2 ${getRarityColor(achievement.rarity)} shadow-lg`}>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <i className={`${achievement.icon} text-lg text-green-600`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-green-700">Achievement Unlocked!</span>
              {getRarityIcon(achievement.rarity)}
            </div>
            
            <h4 className="font-semibold text-foreground mb-1">
              {achievement.name}
            </h4>
            
            <p className="text-sm text-muted-foreground">
              {achievement.description}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${
                achievement.rarity === 'common' ? 'bg-gray-200 text-gray-700' :
                achievement.rarity === 'rare' ? 'bg-blue-200 text-blue-700' :
                achievement.rarity === 'epic' ? 'bg-purple-200 text-purple-700' :
                'bg-yellow-200 text-yellow-700'
              }`}>
                {achievement.rarity}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};