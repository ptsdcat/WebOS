import { FC, useState, useEffect, useRef } from 'react';
import { Play, Users, ShoppingCart, Settings, Trophy, Target, Crosshair, Shield, Zap, Star, Crown, Coins, Swords, Search, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Player {
  id: string;
  username: string;
  level: number;
  prestige: number;
  kd: number;
  wins: number;
  losses: number;
  rank: string;
  avatar: string;
  isOnline: boolean;
  clan?: string;
  coins: number;
  codPoints: number;
}

interface Weapon {
  id: string;
  name: string;
  type: 'assault' | 'smg' | 'sniper' | 'lmg' | 'shotgun' | 'pistol';
  damage: number;
  range: number;
  mobility: number;
  accuracy: number;
  fireRate: number;
  unlockLevel: number;
  price: number;
  attachments: string[];
  skin?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface GameMode {
  id: string;
  name: string;
  description: string;
  maxPlayers: number;
  mapRotation: string[];
  duration: number;
  featured: boolean;
}

interface Lobby {
  id: string;
  name: string;
  mode: string;
  map: string;
  players: number;
  maxPlayers: number;
  ping: number;
  region: string;
  host: string;
  isPrivate: boolean;
}

const gameModes: GameMode[] = [
  {
    id: 'tdm',
    name: 'Team Deathmatch',
    description: 'Classic team vs team combat',
    maxPlayers: 12,
    mapRotation: ['Nuketown', 'Crash', 'Shipment', 'Rust'],
    duration: 600,
    featured: true
  },
  {
    id: 'domination',
    name: 'Domination',
    description: 'Capture and hold objectives',
    maxPlayers: 12,
    mapRotation: ['Terminal', 'Highrise', 'Favela'],
    duration: 900,
    featured: true
  },
  {
    id: 'snd',
    name: 'Search & Destroy',
    description: 'Eliminate the enemy team or complete the objective',
    maxPlayers: 12,
    mapRotation: ['Crash', 'Strike', 'Dust2'],
    duration: 480,
    featured: false
  },
  {
    id: 'br',
    name: 'Battle Royale',
    description: 'Last player standing wins',
    maxPlayers: 150,
    mapRotation: ['Verdansk', 'Blackout'],
    duration: 1800,
    featured: true
  }
];

const weapons: Weapon[] = [
  {
    id: 'ak47',
    name: 'AK-47',
    type: 'assault',
    damage: 85,
    range: 75,
    mobility: 60,
    accuracy: 70,
    fireRate: 65,
    unlockLevel: 1,
    price: 0,
    attachments: ['Red Dot', 'Extended Mag', 'Grip'],
    rarity: 'common'
  },
  {
    id: 'm4a1',
    name: 'M4A1',
    type: 'assault',
    damage: 80,
    range: 80,
    mobility: 65,
    accuracy: 85,
    fireRate: 70,
    unlockLevel: 5,
    price: 1200,
    attachments: ['ACOG', 'Silencer', 'Laser'],
    rarity: 'rare'
  },
  {
    id: 'awp',
    name: 'AWP',
    type: 'sniper',
    damage: 100,
    range: 100,
    mobility: 30,
    accuracy: 95,
    fireRate: 20,
    unlockLevel: 15,
    price: 4750,
    attachments: ['High Power Scope', 'Bipod'],
    rarity: 'legendary'
  }
];

export const CallOfDuty: FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'main' | 'multiplayer' | 'shop' | 'loadout' | 'game' | 'lobby'>('main');
  const [player, setPlayer] = useState<Player>({
    id: 'player1',
    username: 'Ghost_117',
    level: 42,
    prestige: 2,
    kd: 1.85,
    wins: 287,
    losses: 156,
    rank: 'Captain',
    avatar: 'default',
    isOnline: true,
    clan: 'ELITE',
    coins: 12500,
    codPoints: 850
  });
  
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon>(weapons[0]);
  const [selectedMode, setSelectedMode] = useState<GameMode>(gameModes[0]);
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [selectedLobby, setSelectedLobby] = useState<Lobby | null>(null);
  const [isInGame, setIsInGame] = useState(false);
  const [gameTime, setGameTime] = useState(600);
  const [score, setScore] = useState({ team1: 0, team2: 0 });
  const [playerScore, setPlayerScore] = useState({ kills: 0, deaths: 0, assists: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate random lobbies
  useEffect(() => {
    const generateLobbies = () => {
      const regions = ['US East', 'US West', 'Europe', 'Asia'];
      const maps = ['Nuketown', 'Crash', 'Shipment', 'Terminal', 'Rust'];
      
      const newLobbies: Lobby[] = Array.from({ length: 15 }, (_, i) => ({
        id: `lobby_${i}`,
        name: `Room ${i + 1}`,
        mode: gameModes[Math.floor(Math.random() * gameModes.length)].name,
        map: maps[Math.floor(Math.random() * maps.length)],
        players: Math.floor(Math.random() * 12) + 1,
        maxPlayers: 12,
        ping: Math.floor(Math.random() * 80) + 20,
        region: regions[Math.floor(Math.random() * regions.length)],
        host: `Player_${Math.floor(Math.random() * 1000)}`,
        isPrivate: Math.random() > 0.7
      }));
      
      setLobbies(newLobbies);
    };

    generateLobbies();
    const interval = setInterval(generateLobbies, 5000);
    return () => clearInterval(interval);
  }, []);

  // Game timer
  useEffect(() => {
    if (isInGame && gameTime > 0) {
      const timer = setTimeout(() => setGameTime(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isInGame, gameTime]);

  // Simple 3D game renderer
  useEffect(() => {
    if (currentScreen === 'game' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const render = () => {
        // Clear canvas
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw ground
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

        // Draw buildings/cover
        ctx.fillStyle = '#696969';
        ctx.fillRect(100, 300, 80, 120);
        ctx.fillRect(300, 250, 100, 170);
        ctx.fillRect(600, 320, 60, 100);

        // Draw crosshair
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 15, centerY);
        ctx.lineTo(centerX + 15, centerY);
        ctx.moveTo(centerX, centerY - 15);
        ctx.lineTo(centerX, centerY + 15);
        ctx.stroke();

        // Draw HUD
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 80);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.fillText(`Health: 100`, 20, 30);
        ctx.fillText(`Ammo: 30/90`, 20, 50);
        ctx.fillText(`${Math.floor(gameTime / 60)}:${(gameTime % 60).toString().padStart(2, '0')}`, 20, 70);
      };

      render();
    }
  }, [currentScreen, gameTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const joinLobby = (lobby: Lobby) => {
    setSelectedLobby(lobby);
    setCurrentScreen('lobby');
  };

  const startGame = () => {
    setIsInGame(true);
    setCurrentScreen('game');
    setGameTime(600);
    setScore({ team1: 0, team2: 0 });
    setPlayerScore({ kills: 0, deaths: 0, assists: 0 });
  };

  if (currentScreen === 'game') {
    return (
      <div className="h-full bg-black relative overflow-hidden">
        <canvas 
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full"
        />
        
        {/* Game HUD */}
        <div className="absolute top-4 left-4 text-white">
          <div className="bg-black/70 p-2 rounded">
            <div className="text-green-400">Health: 100</div>
            <div className="text-blue-400">Armor: 100</div>
            <div className="text-yellow-400">Ammo: 30/90</div>
          </div>
        </div>

        <div className="absolute top-4 right-4 text-white">
          <div className="bg-black/70 p-2 rounded text-center">
            <div className="text-xl font-bold">{formatTime(gameTime)}</div>
            <div className="text-sm">Team Deathmatch</div>
          </div>
        </div>

        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white">
          <div className="bg-black/70 p-2 rounded flex gap-8">
            <div className="text-center">
              <div className="text-blue-400 text-xl font-bold">{score.team1}</div>
              <div className="text-sm">BLUE</div>
            </div>
            <div className="text-center">
              <div className="text-red-400 text-xl font-bold">{score.team2}</div>
              <div className="text-sm">RED</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 text-white">
          <div className="bg-black/70 p-2 rounded">
            <div className="text-green-400">K: {playerScore.kills}</div>
            <div className="text-red-400">D: {playerScore.deaths}</div>
            <div className="text-yellow-400">A: {playerScore.assists}</div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4">
          <Button 
            onClick={() => setCurrentScreen('multiplayer')}
            variant="outline"
            className="bg-red-600 hover:bg-red-700 text-white border-red-600"
          >
            Leave Game
          </Button>
        </div>

        {/* Minimap */}
        <div className="absolute top-4 right-1/4 w-32 h-32 bg-black/70 border border-gray-600 rounded">
          <div className="relative w-full h-full">
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-red-400 rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-red-400 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'lobby') {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 to-black text-white overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Lobby: {selectedLobby?.name}</h1>
            <Button 
              onClick={() => setCurrentScreen('multiplayer')}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Leave Lobby
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lobby Info */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Match Info</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400">Mode:</span>
                    <span className="ml-2 text-blue-400">{selectedLobby?.mode}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Map:</span>
                    <span className="ml-2 text-green-400">{selectedLobby?.map}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Players:</span>
                    <span className="ml-2">{selectedLobby?.players}/{selectedLobby?.maxPlayers}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Ping:</span>
                    <span className="ml-2 text-green-400">{selectedLobby?.ping}ms</span>
                  </div>
                </div>
              </div>

              {/* Players List */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Players</h2>
                <div className="space-y-2">
                  {Array.from({ length: selectedLobby?.players || 0 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-sm">P{i + 1}</span>
                        </div>
                        <span>Player_{Math.floor(Math.random() * 1000)}</span>
                        {i === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Lvl {Math.floor(Math.random() * 50) + 1}</span>
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat & Controls */}
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Chat</h2>
                <div className="bg-gray-900 rounded p-3 h-32 overflow-y-auto mb-3">
                  <div className="text-sm space-y-1">
                    <div><span className="text-blue-400">System:</span> Welcome to the lobby!</div>
                    <div><span className="text-green-400">Player_123:</span> Ready to play?</div>
                    <div><span className="text-yellow-400">Ghost_117:</span> Let's go!</div>
                  </div>
                </div>
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  className="w-full p-2 bg-gray-700 rounded text-white placeholder-gray-400"
                />
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Ready Status</h2>
                <div className="space-y-3">
                  <Button 
                    onClick={startGame}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Lobby Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'shop') {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 to-black text-white overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">COD Store</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span>{player.coins.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <span>{player.codPoints}</span>
              </div>
              <Button onClick={() => setCurrentScreen('main')} variant="outline">
                Back to Main
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weapons.map((weapon) => (
              <div key={weapon.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${getRarityColor(weapon.rarity)}`}>
                    {weapon.name}
                  </h3>
                  <Badge variant="outline" className="capitalize">
                    {weapon.type}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Damage</span>
                    <div className="flex items-center gap-2">
                      <Progress value={weapon.damage} className="w-16 h-2" />
                      <span className="text-sm">{weapon.damage}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Range</span>
                    <div className="flex items-center gap-2">
                      <Progress value={weapon.range} className="w-16 h-2" />
                      <span className="text-sm">{weapon.range}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mobility</span>
                    <div className="flex items-center gap-2">
                      <Progress value={weapon.mobility} className="w-16 h-2" />
                      <span className="text-sm">{weapon.mobility}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Unlock: Level {weapon.unlockLevel}
                  </div>
                  <Button 
                    size="sm"
                    disabled={player.level < weapon.unlockLevel || player.coins < weapon.price}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {weapon.price === 0 ? 'Unlocked' : `${weapon.price} coins`}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'multiplayer') {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 to-black text-white overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Multiplayer</h1>
            <Button onClick={() => setCurrentScreen('main')} variant="outline">
              Back to Main
            </Button>
          </div>

          {/* Game Modes */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Game Modes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {gameModes.map((mode) => (
                <div 
                  key={mode.id}
                  onClick={() => setSelectedMode(mode)}
                  className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-700 border-2 ${
                    selectedMode.id === mode.id ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{mode.name}</h3>
                    {mode.featured && <Star className="w-4 h-4 text-yellow-400" />}
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{mode.description}</p>
                  <div className="text-xs text-gray-500">
                    {mode.maxPlayers} players • {formatTime(mode.duration)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Server Browser */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Server Browser</h2>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="grid grid-cols-7 gap-4 p-4 bg-gray-700 text-sm font-medium">
                <div>Server Name</div>
                <div>Mode</div>
                <div>Map</div>
                <div>Players</div>
                <div>Ping</div>
                <div>Region</div>
                <div>Action</div>
              </div>
              <div className="divide-y divide-gray-700">
                {lobbies.slice(0, 10).map((lobby) => (
                  <div key={lobby.id} className="grid grid-cols-7 gap-4 p-4 hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-2">
                      {lobby.isPrivate && <Shield className="w-4 h-4 text-yellow-400" />}
                      {lobby.name}
                    </div>
                    <div className="text-blue-400">{lobby.mode}</div>
                    <div className="text-green-400">{lobby.map}</div>
                    <div>{lobby.players}/{lobby.maxPlayers}</div>
                    <div className={`${lobby.ping < 50 ? 'text-green-400' : lobby.ping < 100 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {lobby.ping}ms
                    </div>
                    <div className="text-gray-400">{lobby.region}</div>
                    <div>
                      <Button 
                        size="sm"
                        onClick={() => joinLobby(lobby)}
                        disabled={lobby.players >= lobby.maxPlayers}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Menu
  return (
    <div className="h-full bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden relative">
      {/* Background Video Effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-r from-orange-500/20 to-red-500/20 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Target className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              CALL OF DUTY
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-semibold">{player.username}</div>
              <div className="text-sm text-gray-400">Level {player.level} • Prestige {player.prestige}</div>
            </div>
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="font-bold">G</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Menu */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <Button
                onClick={() => setCurrentScreen('multiplayer')}
                className="h-32 bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 flex flex-col items-center justify-center"
              >
                <Users className="w-8 h-8 mb-2" />
                <span className="text-xl font-semibold">Multiplayer</span>
                <span className="text-sm opacity-80">Join online matches</span>
              </Button>

              <Button
                onClick={() => setCurrentScreen('shop')}
                className="h-32 bg-gradient-to-br from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 flex flex-col items-center justify-center"
              >
                <ShoppingCart className="w-8 h-8 mb-2" />
                <span className="text-xl font-semibold">Store</span>
                <span className="text-sm opacity-80">Buy weapons & items</span>
              </Button>

              <Button
                onClick={() => setCurrentScreen('loadout')}
                className="h-32 bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 flex flex-col items-center justify-center"
              >
                <Swords className="w-8 h-8 mb-2" />
                <span className="text-xl font-semibold">Loadout</span>
                <span className="text-sm opacity-80">Customize weapons</span>
              </Button>

              <Button
                className="h-32 bg-gradient-to-br from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 flex flex-col items-center justify-center"
              >
                <Trophy className="w-8 h-8 mb-2" />
                <span className="text-xl font-semibold">Barracks</span>
                <span className="text-sm opacity-80">Stats & achievements</span>
              </Button>
            </div>

            {/* Featured Content */}
            <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-lg p-6 border border-red-700/30">
              <h2 className="text-xl font-bold mb-2">Season 2: Reloaded</h2>
              <p className="text-gray-300 mb-4">New maps, weapons, and operators available now!</p>
              <Button className="bg-red-600 hover:bg-red-700">
                Learn More
              </Button>
            </div>
          </div>

          {/* Player Stats */}
          <div className="space-y-6">
            <div className="bg-gray-800/80 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Player Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">K/D Ratio</span>
                  <span className="text-green-400 font-semibold">{player.kd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wins</span>
                  <span className="text-blue-400">{player.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rank</span>
                  <span className="text-yellow-400">{player.rank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Clan</span>
                  <span className="text-purple-400">[{player.clan}]</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/80 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Progression</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Level {player.level}</span>
                    <span className="text-sm">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Battle Pass</span>
                    <span className="text-sm">Tier 42</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/80 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Match</h2>
              <Button 
                onClick={() => setCurrentScreen('multiplayer')}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Find Match
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};