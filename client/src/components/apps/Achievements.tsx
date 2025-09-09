import { FC, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Target, Clock, Package, Terminal, Globe, Folder } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'usage' | 'exploration' | 'productivity' | 'mastery';
  type: 'count' | 'streak' | 'milestone' | 'time';
  target: number;
  current: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const ACHIEVEMENTS_DATA: Omit<Achievement, 'current' | 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first-launch',
    name: 'Welcome to WebOS',
    description: 'Launch your first application',
    icon: 'fas fa-rocket',
    category: 'usage',
    type: 'milestone',
    target: 1,
    rarity: 'common'
  },
  {
    id: 'app-explorer',
    name: 'App Explorer',
    description: 'Launch 5 different applications',
    icon: 'fas fa-compass',
    category: 'exploration',
    type: 'count',
    target: 5,
    rarity: 'common'
  },
  {
    id: 'power-user',
    name: 'Power User',
    description: 'Launch 25 applications total',
    icon: 'fas fa-bolt',
    category: 'usage',
    type: 'count',
    target: 25,
    rarity: 'rare'
  },
  {
    id: 'terminal-master',
    name: 'Terminal Master',
    description: 'Use the terminal 10 times',
    icon: 'fas fa-terminal',
    category: 'mastery',
    type: 'count',
    target: 10,
    rarity: 'rare'
  },
  {
    id: 'web-surfer',
    name: 'Web Surfer',
    description: 'Browse 20 different websites',
    icon: 'fas fa-globe',
    category: 'exploration',
    type: 'count',
    target: 20,
    rarity: 'common'
  },
  {
    id: 'package-collector',
    name: 'Software Collector',
    description: 'Install 5 applications from package manager',
    icon: 'fas fa-download',
    category: 'exploration',
    type: 'count',
    target: 5,
    rarity: 'rare'
  },
  {
    id: 'organizer',
    name: 'Desktop Organizer',
    description: 'Create your first folder',
    icon: 'fas fa-folder',
    category: 'productivity',
    type: 'milestone',
    target: 1,
    rarity: 'common'
  },
  {
    id: 'speed-launcher',
    name: 'Speed Launcher',
    description: 'Use quick launch (Ctrl+Space) 10 times',
    icon: 'fas fa-search',
    category: 'productivity',
    type: 'count',
    target: 10,
    rarity: 'rare'
  },
  {
    id: 'multitasker',
    name: 'Multitasker',
    description: 'Have 5 applications open simultaneously',
    icon: 'fas fa-layer-group',
    category: 'productivity',
    type: 'milestone',
    target: 5,
    rarity: 'epic'
  },
  {
    id: 'browser-master',
    name: 'Browser Master',
    description: 'Use the web browser 20 times',
    icon: 'fas fa-globe',
    category: 'mastery',
    type: 'count',
    target: 20,
    rarity: 'rare'
  },
  {
    id: 'calculator-wizard',
    name: 'Calculator Wizard',
    description: 'Perform 50 calculations',
    icon: 'fas fa-calculator',
    category: 'mastery',
    type: 'count',
    target: 50,
    rarity: 'epic'
  },
  {
    id: 'text-master',
    name: 'Text Master',
    description: 'Create 10 notes in NotePad',
    icon: 'fas fa-file-alt',
    category: 'productivity',
    type: 'count',
    target: 10,
    rarity: 'rare'
  }
];

export const Achievements: FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const loadAchievements = () => {
      const stored = localStorage.getItem('webos-achievements');
      
      if (stored) {
        setAchievements(JSON.parse(stored));
      } else {
        const initialAchievements = ACHIEVEMENTS_DATA.map(achievement => ({
          ...achievement,
          current: 0,
          unlocked: false
        }));
        setAchievements(initialAchievements);
        localStorage.setItem('webos-achievements', JSON.stringify(initialAchievements));
      }
    };

    loadAchievements();
  }, []);

  const filteredAchievements = achievements.filter(achievement => {
    const statusMatch = filter === 'all' || 
                       (filter === 'unlocked' && achievement.unlocked) ||
                       (filter === 'locked' && !achievement.unlocked);
    
    const categoryMatch = categoryFilter === 'all' || achievement.category === categoryFilter;
    
    return statusMatch && categoryMatch;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 border-gray-200';
      case 'rare': return 'text-blue-600 border-blue-200';
      case 'epic': return 'text-purple-600 border-purple-200';
      case 'legendary': return 'text-yellow-600 border-yellow-200';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-50';
      case 'rare': return 'bg-blue-50';
      case 'epic': return 'bg-purple-50';
      case 'legendary': return 'bg-yellow-50';
      default: return 'bg-gray-50';
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  const categories = ['all', 'usage', 'exploration', 'productivity', 'mastery'];

  return (
    <div className="h-full flex flex-col bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Achievements</h1>
            <p className="text-muted-foreground">Track your progress and unlock rewards</p>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{unlockedCount}/{totalCount}</span>
          </div>
          <Progress value={completionPercentage} className="h-3 mb-2" />
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-600">{achievements.filter(a => a.rarity === 'common' && a.unlocked).length}</div>
              <div className="text-xs text-muted-foreground">Common</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{achievements.filter(a => a.rarity === 'rare' && a.unlocked).length}</div>
              <div className="text-xs text-muted-foreground">Rare</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">{achievements.filter(a => a.rarity === 'epic' && a.unlocked).length}</div>
              <div className="text-xs text-muted-foreground">Epic</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">{achievements.filter(a => a.rarity === 'legendary' && a.unlocked).length}</div>
              <div className="text-xs text-muted-foreground">Legendary</div>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex gap-1">
            {['all', 'unlocked', 'locked'].map(status => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status as any)}
                className="capitalize"
              >
                {status} {status === 'all' ? `(${totalCount})` : 
                         status === 'unlocked' ? `(${unlockedCount})` : 
                         `(${totalCount - unlockedCount})`}
              </Button>
            ))}
          </div>
          <div className="flex gap-1">
            {categories.map(category => (
              <Button
                key={category}
                variant={categoryFilter === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map(achievement => (
            <Card 
              key={achievement.id} 
              className={`p-4 transition-all hover:shadow-md ${
                achievement.unlocked ? 'border-green-200 bg-green-50/50' : 'border-gray-200'
              } ${getRarityColor(achievement.rarity)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'
                } ${getRarityBg(achievement.rarity)}`}>
                  <i className={`${achievement.icon} text-lg ${
                    achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold truncate ${
                      achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {achievement.name}
                    </h4>
                    {achievement.unlocked && <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity}
                    </Badge>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {achievement.category}
                    </Badge>
                  </div>
                  
                  <p className={`text-sm mb-3 ${
                    achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {achievement.description}
                  </p>
                  
                  {!achievement.unlocked && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{achievement.current}/{achievement.target}</span>
                      </div>
                      <Progress value={(achievement.current / achievement.target) * 100} className="h-2" />
                    </div>
                  )}
                  
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No achievements found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};