import { FC, useState, useEffect } from 'react';
import { RobloxAPI } from './RobloxAPI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Users, Star, Clock, Download, Search, Filter,
  Settings, User, Gamepad2, Trophy, Coins, Heart,
  MessageCircle, Share2, Globe, Lock, Edit3, Eye
} from 'lucide-react';

interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  creator: string;
  players: number;
  maxPlayers: number;
  rating: number;
  visits: number;
  genre: string;
  isPrivate: boolean;
  lastUpdated: string;
}

interface Friend {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'playing';
  currentGame?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const Roblox: FC = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [accountMode, setAccountMode] = useState<'default' | 'connected'>('default');
  const [userProfile, setUserProfile] = useState({
    username: 'WebOSPlayer',
    displayName: 'WebOS Player',
    avatar: '🧑‍💻',
    robux: 2500,
    level: 45,
    joinDate: '2024-01-15',
    premium: true,
    followers: 156,
    following: 89,
    description: 'WebOS default account - Connect your real Roblox account for full features!'
  });

  const [games, setGames] = useState<Game[]>([
    {
      id: '1',
      title: 'Mega Obby Challenge',
      description: 'Navigate through 500+ challenging obstacles in this epic obby adventure!',
      thumbnail: '🏃‍♂️',
      creator: 'ObbyMaster',
      players: 2847,
      maxPlayers: 50,
      rating: 4.8,
      visits: 15234567,
      genre: 'Adventure',
      isPrivate: false,
      lastUpdated: '2024-12-01'
    },
    {
      id: '2',
      title: 'City Roleplay Simulator',
      description: 'Build your life in the ultimate city roleplay experience with jobs, cars, and houses!',
      thumbnail: '🏙️',
      creator: 'UrbanDev',
      players: 5621,
      maxPlayers: 100,
      rating: 4.6,
      visits: 28945123,
      genre: 'Roleplay',
      isPrivate: false,
      lastUpdated: '2024-12-02'
    },
    {
      id: '3',
      title: 'Space Wars Battle Arena',
      description: 'Epic PvP battles in space with custom ships and weapons!',
      thumbnail: '🚀',
      creator: 'GalacticGames',
      players: 1834,
      maxPlayers: 30,
      rating: 4.9,
      visits: 8765432,
      genre: 'Fighting',
      isPrivate: false,
      lastUpdated: '2024-12-02'
    },
    {
      id: '4',
      title: 'Tycoon Empire Builder',
      description: 'Build and manage your business empire from the ground up!',
      thumbnail: '🏭',
      creator: 'TycoonKing',
      players: 3456,
      maxPlayers: 25,
      rating: 4.7,
      visits: 12456789,
      genre: 'Simulation',
      isPrivate: false,
      lastUpdated: '2024-12-01'
    },
    {
      id: '5',
      title: 'Horror Mansion Escape',
      description: 'Survive the night in this terrifying horror experience with friends!',
      thumbnail: '👻',
      creator: 'ScareStudios',
      players: 892,
      maxPlayers: 8,
      rating: 4.5,
      visits: 5234567,
      genre: 'Horror',
      isPrivate: false,
      lastUpdated: '2024-11-30'
    }
  ]);

  const [friends, setFriends] = useState<Friend[]>([
    { id: '1', username: 'GameMaster99', avatar: '👑', status: 'online', currentGame: 'Space Wars Battle Arena' },
    { id: '2', username: 'BuilderPro', avatar: '🔨', status: 'playing', currentGame: 'Tycoon Empire Builder' },
    { id: '3', username: 'SpeedRunner42', avatar: '⚡', status: 'online' },
    { id: '4', username: 'CreativeGenius', avatar: '🎨', status: 'offline' }
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      name: 'First Steps',
      description: 'Join your first game',
      icon: '👶',
      unlocked: true,
      rarity: 'common'
    },
    {
      id: '2',
      name: 'Social Butterfly',
      description: 'Add 10 friends',
      icon: '🦋',
      unlocked: true,
      rarity: 'common'
    },
    {
      id: '3',
      name: 'Developer',
      description: 'Create your first game',
      icon: '💻',
      unlocked: false,
      rarity: 'rare'
    },
    {
      id: '4',
      name: 'Legendary Player',
      description: 'Reach level 50',
      icon: '🏆',
      unlocked: false,
      rarity: 'legendary'
    }
  ]);

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || game.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const genres = ['all', 'Adventure', 'Roleplay', 'Fighting', 'Simulation', 'Horror', 'Racing', 'Sports'];

  const playGame = async (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      try {
        const response = await fetch('/api/roblox/games/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            placeId: parseInt(gameId),
            universeId: parseInt(gameId)
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          // Attempt to launch Roblox client
          window.open(data.joinUrl, '_blank');
        } else {
          console.error('Failed to join game');
        }
      } catch (error) {
        console.error('Error joining game:', error);
      }
    }
  };

  const openStudio = () => {
    // This would open Roblox Studio
    alert('Opening Roblox Studio...\n\nThis would launch the game development environment!');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              ROBLOX
            </div>
            <div className="flex items-center gap-2 bg-black/30 rounded-full px-3 py-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-bold">{userProfile.robux.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button onClick={openStudio} className="bg-green-600 hover:bg-green-700">
              <Edit3 className="w-4 h-4 mr-1" />
              Studio
            </Button>
            <div className="flex items-center gap-2">
              <div className="text-2xl">{userProfile.avatar}</div>
              <div className="text-sm">
                <div className="font-medium">{userProfile.username}</div>
                <div className="text-xs opacity-80">Level {userProfile.level}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="h-full flex flex-col">
        <TabsList className="bg-black/30 border-b border-white/20 rounded-none justify-start">
          <TabsTrigger value="home" className="data-[state=active]:bg-white/20">
            <Gamepad2 className="w-4 h-4 mr-1" />
            Games
          </TabsTrigger>
          <TabsTrigger value="friends" className="data-[state=active]:bg-white/20">
            <Users className="w-4 h-4 mr-1" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-white/20">
            <User className="w-4 h-4 mr-1" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-white/20">
            <Edit3 className="w-4 h-4 mr-1" />
            Create
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white/20">
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="home" className="p-6 space-y-6">
            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/30 border-white/20 text-white placeholder-gray-400"
                />
              </div>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-black/30 border border-white/20 rounded-md px-3 py-2 text-white"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre} className="bg-gray-800">
                    {genre === 'all' ? 'All Genres' : genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Games */}
            <div>
              <h2 className="text-xl font-bold mb-4">🔥 Popular Games</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGames.map(game => (
                  <Card key={game.id} className="bg-black/30 border-white/20 text-white hover:bg-black/40 transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-4xl">{game.thumbnail}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold truncate">{game.title}</h3>
                          <p className="text-sm text-gray-300 line-clamp-2 mb-2">{game.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {formatNumber(game.players)}/{game.maxPlayers}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400" />
                              {game.rating}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatNumber(game.visits)}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {game.genre}
                              </Badge>
                              <span className="text-xs text-gray-400">by {game.creator}</span>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => playGame(game.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Play
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="friends" className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Friends ({friends.length})</h2>
              <Button variant="outline" className="border-white/20 text-white">
                Add Friends
              </Button>
            </div>

            <div className="grid gap-4">
              {friends.map(friend => (
                <Card key={friend.id} className="bg-black/30 border-white/20 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{friend.avatar}</div>
                        <div>
                          <div className="font-medium">{friend.username}</div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${
                              friend.status === 'online' ? 'bg-green-400' :
                              friend.status === 'playing' ? 'bg-blue-400' : 'bg-gray-400'
                            }`} />
                            {friend.status === 'playing' && friend.currentGame ? 
                              `Playing ${friend.currentGame}` : 
                              friend.status
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-white/20 text-white">
                          <MessageCircle className="w-3 h-3" />
                        </Button>
                        {friend.currentGame && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Join Game
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="p-6 space-y-6">
            <Card className="bg-black/30 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="text-4xl">{userProfile.avatar}</div>
                  <div>
                    <div className="text-2xl">{userProfile.username}</div>
                    <div className="text-sm text-gray-400">Level {userProfile.level} • Joined {userProfile.joinDate}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-black/40 rounded-lg p-3">
                    <div className="text-xl font-bold text-yellow-400">{userProfile.robux.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Robux</div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-3">
                    <div className="text-xl font-bold text-blue-400">{friends.length}</div>
                    <div className="text-sm text-gray-400">Friends</div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-3">
                    <div className="text-xl font-bold text-green-400">{achievements.filter(a => a.unlocked).length}</div>
                    <div className="text-sm text-gray-400">Achievements</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-white/20 text-white">
              <CardHeader>
                <CardTitle>🏆 Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {achievements.map(achievement => (
                    <div key={achievement.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                      achievement.unlocked ? 'bg-green-900/30' : 'bg-gray-800/30'
                    }`}>
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium">{achievement.name}</div>
                        <div className="text-sm text-gray-400">{achievement.description}</div>
                      </div>
                      <Badge variant={achievement.unlocked ? 'default' : 'secondary'}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="p-6 space-y-6">
            <Card className="bg-black/30 border-white/20 text-white">
              <CardHeader>
                <CardTitle>⚙️ Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Account Mode</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card 
                      className={`cursor-pointer transition-all ${
                        accountMode === 'default' 
                          ? 'bg-blue-600/20 border-blue-500' 
                          : 'bg-black/40 border-white/10 hover:border-white/20'
                      }`}
                      onClick={() => setAccountMode('default')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            🧑‍💻
                          </div>
                          <div>
                            <h4 className="font-semibold">WebOS Default Account</h4>
                            <p className="text-sm text-gray-400">Demo experience</p>
                          </div>
                        </div>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• Browse sample games and content</li>
                          <li>• Access Roblox Studio features</li>
                          <li>• Educational gaming experience</li>
                          <li>• No personal data required</li>
                        </ul>
                        {accountMode === 'default' && (
                          <div className="mt-3 text-sm text-blue-400 font-medium">
                            ✓ Currently active
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all ${
                        accountMode === 'connected' 
                          ? 'bg-green-600/20 border-green-500' 
                          : 'bg-black/40 border-white/10 hover:border-white/20'
                      }`}
                      onClick={() => setAccountMode('connected')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                            🔗
                          </div>
                          <div>
                            <h4 className="font-semibold">Connected Roblox Account</h4>
                            <p className="text-sm text-gray-400">Full features</p>
                          </div>
                        </div>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• Access your real games library</li>
                          <li>• Join friends and real players</li>
                          <li>• Sync your actual progress</li>
                          <li>• Full Roblox experience</li>
                        </ul>
                        {accountMode === 'connected' && (
                          <div className="mt-3 text-sm text-green-400 font-medium">
                            ✓ Currently active
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {accountMode === 'default' && (
                  <Card className="bg-blue-600/10 border-blue-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          ℹ️
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-300 mb-2">Default Account Active</h4>
                          <p className="text-sm text-gray-300 mb-3">
                            You're using the WebOS default Roblox account. This provides a full demo experience 
                            with sample games, Roblox Studio access, and educational content.
                          </p>
                          <div className="bg-black/30 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Username:</span>
                              <span className="text-white font-medium">{userProfile.username}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Robux:</span>
                              <span className="text-yellow-400 font-medium">💰 {userProfile.robux.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Level:</span>
                              <span className="text-blue-400 font-medium">⭐ {userProfile.level}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Premium:</span>
                              <span className="text-purple-400 font-medium">👑 {userProfile.premium ? 'Active' : 'None'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {accountMode === 'connected' && (
                  <Card className="bg-green-600/10 border-green-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          🔗
                        </div>
                        <div className="w-full">
                          <h4 className="font-semibold text-green-300 mb-2">Connect Your Roblox Account</h4>
                          <p className="text-sm text-gray-300 mb-4">
                            Connect your real Roblox account to access your games, friends, and full platform features.
                            Your API credentials are used securely to fetch your data.
                          </p>
                          
                          <div className="space-y-3">
                            <Button 
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                // This would trigger the real API connection
                                alert('API connection feature requires valid Roblox API credentials. Contact support for setup.');
                              }}
                            >
                              <Globe className="w-4 h-4 mr-2" />
                              Connect Roblox Account
                            </Button>
                            
                            <div className="text-xs text-gray-400 bg-black/30 rounded p-3">
                              <strong>Note:</strong> Real account connection requires valid API credentials and proper 
                              authentication setup. The default account provides full functionality for demo purposes.
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-black/40 border-white/10">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Privacy & Data</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Data Storage:</span>
                        <span className="text-blue-400">Local WebOS only</span>
                      </div>
                      <div className="flex justify-between">
                        <span>External Connections:</span>
                        <span className="text-green-400">Secure API only</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Account Data:</span>
                        <span className="text-purple-400">Encrypted</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="p-6 space-y-6">
            <Card className="bg-black/30 border-white/20 text-white">
              <CardHeader>
                <CardTitle>🎮 Create Games</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Use Roblox Studio to create amazing games and experiences! Choose from templates or start from scratch.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={openStudio} className="h-24 bg-blue-600 hover:bg-blue-700 flex-col">
                    <Edit3 className="w-8 h-8 mb-2" />
                    Open Studio
                  </Button>
                  <Button variant="outline" className="h-24 border-white/20 text-white flex-col">
                    <Download className="w-8 h-8 mb-2" />
                    Templates
                  </Button>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">My Games</h3>
                  <Card className="bg-black/40 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Awesome Adventure</div>
                          <div className="text-sm text-gray-400">Last edited: 2 days ago</div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="border-white/20 text-white">
                            Edit
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Publish
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};