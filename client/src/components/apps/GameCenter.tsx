import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Gamepad2, Trophy, Users, Clock, Star, Download, Play, Settings } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  genre: string;
  rating: number;
  players: string;
  size: string;
  description: string;
  screenshots: string[];
  achievements: number;
  lastPlayed?: Date;
  installed: boolean;
  featured: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export const GameCenter: FC = () => {
  const [selectedTab, setSelectedTab] = useState<'library' | 'store' | 'achievements' | 'friends'>('library');
  const [games, setGames] = useState<Game[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadGameData();
    loadAchievements();
  }, []);

  const loadGameData = () => {
    const gameLibrary: Game[] = [
      {
        id: 'snake-classic',
        title: 'Snake Classic',
        genre: 'Arcade',
        rating: 4.5,
        players: '1 Player',
        size: '2.1 MB',
        description: 'Classic snake game with modern graphics and smooth gameplay. Guide your snake to eat food and grow longer while avoiding collisions.',
        screenshots: ['🐍', '🎮', '🏆'],
        achievements: 12,
        installed: true,
        featured: true,
        lastPlayed: new Date()
      },
      {
        id: 'tetris-deluxe',
        title: 'Tetris Deluxe',
        genre: 'Puzzle',
        rating: 4.8,
        players: '1-2 Players',
        size: '5.3 MB',
        description: 'Enhanced Tetris experience with multiple game modes, power-ups, and competitive multiplayer.',
        screenshots: ['🧩', '🎯', '⚡'],
        achievements: 25,
        installed: true,
        featured: true,
        lastPlayed: new Date(Date.now() - 86400000)
      },
      {
        id: 'pac-adventure',
        title: 'Pac-Man Adventure',
        genre: 'Arcade',
        rating: 4.3,
        players: '1 Player',
        size: '8.7 MB',
        description: 'Modern take on the classic Pac-Man with new mazes, power-ups, and challenging ghost AI.',
        screenshots: ['👻', '🟡', '🍒'],
        achievements: 18,
        installed: false,
        featured: true
      },
      {
        id: 'space-shooter',
        title: 'Space Shooter Pro',
        genre: 'Action',
        rating: 4.6,
        players: '1 Player',
        size: '12.4 MB',
        description: 'Fast-paced space combat with stunning visuals, weapon upgrades, and epic boss battles.',
        screenshots: ['🚀', '💥', '🛸'],
        achievements: 30,
        installed: false,
        featured: false
      },
      {
        id: 'memory-master',
        title: 'Memory Master',
        genre: 'Educational',
        rating: 4.2,
        players: '1 Player',
        size: '3.8 MB',
        description: 'Train your memory with various exercises and challenges. Track your progress over time.',
        screenshots: ['🧠', '🎯', '📊'],
        achievements: 15,
        installed: true,
        featured: false
      }
    ];
    setGames(gameLibrary);
    setSelectedGame(gameLibrary[0]);
  };

  const loadAchievements = () => {
    const userAchievements: Achievement[] = [
      {
        id: 'first-game',
        title: 'Getting Started',
        description: 'Play your first game',
        icon: '🎮',
        unlocked: true,
        progress: 1,
        maxProgress: 1
      },
      {
        id: 'high-score',
        title: 'High Scorer',
        description: 'Achieve a score of 10,000 points',
        icon: '🏆',
        unlocked: true,
        progress: 15420,
        maxProgress: 10000
      },
      {
        id: 'speed-demon',
        title: 'Speed Demon',
        description: 'Complete 50 levels in under 30 minutes',
        icon: '⚡',
        unlocked: false,
        progress: 32,
        maxProgress: 50
      },
      {
        id: 'collector',
        title: 'Collector',
        description: 'Install 10 different games',
        icon: '📦',
        unlocked: false,
        progress: 3,
        maxProgress: 10
      },
      {
        id: 'master-gamer',
        title: 'Master Gamer',
        description: 'Unlock all achievements in 3 games',
        icon: '👑',
        unlocked: false,
        progress: 1,
        maxProgress: 3
      }
    ];
    setAchievements(userAchievements);
  };

  const filteredGames = games.filter(game =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const launchGame = (game: Game) => {
    if (!game.installed) return;
    
    // Launch game logic would go here
    console.log(`Launching ${game.title}`);
    
    // Update last played
    const updatedGames = games.map(g => 
      g.id === game.id ? { ...g, lastPlayed: new Date() } : g
    );
    setGames(updatedGames);
  };

  const installGame = (game: Game) => {
    const updatedGames = games.map(g => 
      g.id === game.id ? { ...g, installed: true } : g
    );
    setGames(updatedGames);
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg shadow-2xl w-full max-w-6xl h-[700px] flex flex-col">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gamepad2 className="w-5 h-5" />
          <span className="font-medium">Game Center</span>
        </div>
      </div>

      <div className="flex border-b border-gray-700">
        {[
          { key: 'library', label: 'Library', icon: Gamepad2 },
          { key: 'store', label: 'Store', icon: Download },
          { key: 'achievements', label: 'Achievements', icon: Trophy },
          { key: 'friends', label: 'Friends', icon: Users }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key as any)}
            className={`flex items-center space-x-2 px-4 py-3 ${
              selectedTab === tab.key 
                ? 'bg-gray-800 border-b-2 border-purple-500' 
                : 'hover:bg-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {(selectedTab === 'library' || selectedTab === 'store') && (
          <>
            <div className="w-2/3 p-4 overflow-auto">
              <div className="mb-4">
                <Input
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              {selectedTab === 'library' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Recently Played</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {filteredGames
                      .filter(g => g.installed && g.lastPlayed)
                      .sort((a, b) => (b.lastPlayed?.getTime() || 0) - (a.lastPlayed?.getTime() || 0))
                      .slice(0, 4)
                      .map(game => (
                        <div 
                          key={game.id}
                          onClick={() => setSelectedGame(game)}
                          className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="text-3xl">{game.screenshots[0]}</div>
                            <div>
                              <h3 className="font-semibold">{game.title}</h3>
                              <p className="text-gray-400 text-sm">{game.genre}</p>
                            </div>
                          </div>
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              launchGame(game);
                            }}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Play
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <h2 className="text-xl font-bold mb-4">
                {selectedTab === 'library' ? 'All Games' : 'Featured Games'}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {filteredGames
                  .filter(g => selectedTab === 'store' ? g.featured : true)
                  .map(game => (
                    <div 
                      key={game.id}
                      onClick={() => setSelectedGame(game)}
                      className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex space-x-4">
                        <div className="text-4xl">{game.screenshots[0]}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{game.title}</h3>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{game.rating}</span>
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{game.genre} • {game.players} • {game.size}</p>
                          <p className="text-gray-300 text-sm mb-3">{game.description}</p>
                          <div className="flex space-x-2">
                            {game.installed ? (
                              <Button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  launchGame(game);
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Play
                              </Button>
                            ) : (
                              <Button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  installGame(game);
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Install
                              </Button>
                            )}
                            <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="w-1/3 border-l border-gray-700 p-4 overflow-auto">
              {selectedGame ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{selectedGame.screenshots[0]}</div>
                    <h2 className="text-xl font-bold mb-2">{selectedGame.title}</h2>
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{selectedGame.rating}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{selectedGame.genre}</p>
                  </div>

                  <div className="bg-gray-800 p-4 rounded space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Players:</span>
                      <span>{selectedGame.players}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Size:</span>
                      <span>{selectedGame.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Achievements:</span>
                      <span>{selectedGame.achievements}</span>
                    </div>
                    {selectedGame.lastPlayed && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Played:</span>
                        <span>{selectedGame.lastPlayed.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-300 text-sm">{selectedGame.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Screenshots</h3>
                    <div className="flex space-x-2">
                      {selectedGame.screenshots.map((screenshot, index) => (
                        <div key={index} className="text-2xl bg-gray-800 p-2 rounded">
                          {screenshot}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a game to view details</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {selectedTab === 'achievements' && (
          <div className="flex-1 p-4 overflow-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Achievements</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>{achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked</span>
                <span>•</span>
                <span>{Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}% Complete</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map(achievement => (
                <div 
                  key={achievement.id}
                  className={`bg-gray-800 p-4 rounded-lg ${
                    achievement.unlocked ? 'border-l-4 border-yellow-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div>
                      <h3 className={`font-semibold ${achievement.unlocked ? 'text-yellow-500' : ''}`}>
                        {achievement.title}
                      </h3>
                      <p className="text-gray-400 text-sm">{achievement.description}</p>
                    </div>
                  </div>
                  
                  {!achievement.unlocked && achievement.maxProgress > 1 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress} / {achievement.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {achievement.unlocked && (
                    <div className="text-yellow-500 text-sm flex items-center">
                      <Trophy className="w-4 h-4 mr-1" />
                      Unlocked
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'friends' && (
          <div className="flex-1 p-4 overflow-auto">
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold mb-2">Connect with Friends</h3>
              <p className="text-gray-400 mb-4">Add friends to compare scores and achievements</p>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Add Friends
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};