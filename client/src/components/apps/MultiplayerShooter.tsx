import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { Play, Users, Settings, Trophy, Target, Crosshair, Shield, Zap, Star, Crown, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Player {
  id: string;
  x: number;
  y: number;
  rotation: number;
  health: number;
  maxHealth: number;
  username: string;
  kills: number;
  deaths: number;
  team: 'red' | 'blue';
  isLocal: boolean;
  weapon: string;
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
}

interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  playerId: string;
  distance: number;
  maxDistance: number;
}

interface GameState {
  players: Player[];
  bullets: Bullet[];
  gameTime: number;
  redScore: number;
  blueScore: number;
  isGameActive: boolean;
  winner: string | null;
}

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;
const PLAYER_SIZE = 16;
const BULLET_SPEED = 12;
const BULLET_SIZE = 2;
const MAX_BULLET_DISTANCE = 400;
const PLAYER_SPEED = 4;
const WEAPON_DAMAGE = 34;
const MAX_AMMO = 30;
const FIRE_RATE = 120; // milliseconds between shots

const MAP_OBSTACLES = [
  // Outer walls
  { x: 0, y: 0, width: CANVAS_WIDTH, height: 20 },
  { x: 0, y: 0, width: 20, height: CANVAS_HEIGHT },
  { x: CANVAS_WIDTH - 20, y: 0, width: 20, height: CANVAS_HEIGHT },
  { x: 0, y: CANVAS_HEIGHT - 20, width: CANVAS_WIDTH, height: 20 },
  
  // Center structures
  { x: 400, y: 300, width: 200, height: 100 },
  { x: 480, y: 250, width: 40, height: 50 },
  
  // Side covers
  { x: 100, y: 150, width: 80, height: 30 },
  { x: 820, y: 150, width: 80, height: 30 },
  { x: 100, y: 520, width: 80, height: 30 },
  { x: 820, y: 520, width: 80, height: 30 },
  
  // Corner structures
  { x: 200, y: 100, width: 100, height: 20 },
  { x: 700, y: 100, width: 100, height: 20 },
  { x: 200, y: 580, width: 100, height: 20 },
  { x: 700, y: 580, width: 100, height: 20 },
  
  // Mid-map cover
  { x: 300, y: 200, width: 30, height: 80 },
  { x: 670, y: 200, width: 30, height: 80 },
  { x: 300, y: 420, width: 30, height: 80 },
  { x: 670, y: 420, width: 30, height: 80 },
];

export const MultiplayerShooter: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    bullets: [],
    gameTime: 300,
    redScore: 0,
    blueScore: 0,
    isGameActive: false,
    winner: null
  });
  
  const [localPlayer, setLocalPlayer] = useState<Player>({
    id: 'local',
    x: 100,
    y: 100,
    rotation: 0,
    health: 100,
    maxHealth: 100,
    username: 'Ghost_117',
    kills: 0,
    deaths: 0,
    team: 'blue',
    isLocal: true,
    weapon: 'AK-47',
    ammo: 30,
    maxAmmo: 30,
    isReloading: false
  });

  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isShooting, setIsShooting] = useState(false);
  const gameLoopRef = useRef<number>();
  const lastShotTime = useRef<number>(0);
  const reloadTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize game with bot players
  useEffect(() => {
    const initGame = () => {
      const spawnPoints = [
        // Blue team spawns
        { x: 50, y: 50, team: 'blue' },
        { x: 50, y: 150, team: 'blue' },
        { x: 150, y: 50, team: 'blue' },
        { x: 100, y: 250, team: 'blue' },
        // Red team spawns
        { x: CANVAS_WIDTH - 70, y: CANVAS_HEIGHT - 70, team: 'red' },
        { x: CANVAS_WIDTH - 70, y: CANVAS_HEIGHT - 170, team: 'red' },
        { x: CANVAS_WIDTH - 170, y: CANVAS_HEIGHT - 70, team: 'red' },
        { x: CANVAS_WIDTH - 120, y: CANVAS_HEIGHT - 270, team: 'red' }
      ];

      const botPlayers: Player[] = Array.from({ length: 7 }, (_, i) => {
        const spawn = spawnPoints[i % spawnPoints.length];
        return {
          id: `bot_${i}`,
          x: spawn.x,
          y: spawn.y,
          rotation: Math.random() * Math.PI * 2,
          health: 100,
          maxHealth: 100,
          username: `Player_${i + 1}`,
          kills: 0,
          deaths: 0,
          team: spawn.team as 'red' | 'blue',
          isLocal: false,
          weapon: ['AK-47', 'M4A1', 'Sniper'][Math.floor(Math.random() * 3)],
          ammo: 30,
          maxAmmo: 30,
          isReloading: false
        };
      });

      setGameState(prev => ({
        ...prev,
        players: [localPlayer, ...botPlayers],
        isGameActive: true
      }));
    };

    initGame();
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
      
      if (e.key.toLowerCase() === 'r' && !localPlayer.isReloading && localPlayer.ammo < localPlayer.maxAmmo) {
        reload();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [localPlayer.isReloading, localPlayer.ammo, localPlayer.maxAmmo]);

  // Mouse controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left click
        setIsShooting(true);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsShooting(false);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Collision detection
  const checkCollision = (x: number, y: number, size: number = PLAYER_SIZE) => {
    // Check boundaries
    if (x < 0 || y < 0 || x + size > CANVAS_WIDTH || y + size > CANVAS_HEIGHT) {
      return true;
    }

    // Check obstacles
    for (const obstacle of MAP_OBSTACLES) {
      if (x < obstacle.x + obstacle.width &&
          x + size > obstacle.x &&
          y < obstacle.y + obstacle.height &&
          y + size > obstacle.y) {
        return true;
      }
    }

    return false;
  };

  // Reload function
  const reload = () => {
    if (localPlayer.isReloading) return;

    setLocalPlayer(prev => ({ ...prev, isReloading: true }));
    
    reloadTimeoutRef.current = setTimeout(() => {
      setLocalPlayer(prev => ({
        ...prev,
        ammo: prev.maxAmmo,
        isReloading: false
      }));
    }, 2000);
  };

  // Shooting function
  const shoot = useCallback(() => {
    const now = Date.now();
    if (now - lastShotTime.current < FIRE_RATE || localPlayer.ammo <= 0 || localPlayer.isReloading) return;

    lastShotTime.current = now;

    const angle = Math.atan2(mousePos.y - localPlayer.y, mousePos.x - localPlayer.x);
    const bulletId = `bullet_${now}_${Math.random()}`;

    const newBullet: Bullet = {
      id: bulletId,
      x: localPlayer.x + PLAYER_SIZE / 2,
      y: localPlayer.y + PLAYER_SIZE / 2,
      vx: Math.cos(angle) * BULLET_SPEED,
      vy: Math.sin(angle) * BULLET_SPEED,
      damage: WEAPON_DAMAGE,
      playerId: localPlayer.id,
      distance: 0,
      maxDistance: MAX_BULLET_DISTANCE
    };

    setGameState(prev => ({
      ...prev,
      bullets: [...prev.bullets, newBullet]
    }));

    setLocalPlayer(prev => ({ ...prev, ammo: prev.ammo - 1 }));
  }, [mousePos, localPlayer]);

  // Bot AI
  const updateBots = useCallback((players: Player[], bullets: Bullet[]) => {
    return players.map(player => {
      if (player.isLocal || player.health <= 0) return player;

      // Simple AI: move randomly and shoot at enemies
      const enemies = players.filter(p => p.team !== player.team && p.health > 0);
      const nearestEnemy = enemies.reduce((closest, enemy) => {
        const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
        const closestDist = closest ? Math.hypot(closest.x - player.x, closest.y - player.y) : Infinity;
        return dist < closestDist ? enemy : closest;
      }, null as Player | null);

      let newX = player.x;
      let newY = player.y;
      let newRotation = player.rotation;

      if (nearestEnemy) {
        // Move towards enemy or find cover
        const distanceToEnemy = Math.hypot(nearestEnemy.x - player.x, nearestEnemy.y - player.y);
        
        if (distanceToEnemy > 150) {
          // Move towards enemy
          const angle = Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x);
          newX += Math.cos(angle) * PLAYER_SPEED * 0.5;
          newY += Math.sin(angle) * PLAYER_SPEED * 0.5;
        } else if (distanceToEnemy < 80) {
          // Move away from enemy
          const angle = Math.atan2(player.y - nearestEnemy.y, player.x - nearestEnemy.x);
          newX += Math.cos(angle) * PLAYER_SPEED * 0.3;
          newY += Math.sin(angle) * PLAYER_SPEED * 0.3;
        }

        // Face the enemy
        newRotation = Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x);

        // Shoot at enemy (with some randomness)
        if (distanceToEnemy < 200 && Math.random() < 0.1 && player.ammo > 0) {
          const bulletId = `bot_bullet_${Date.now()}_${Math.random()}`;
          const newBullet: Bullet = {
            id: bulletId,
            x: player.x + PLAYER_SIZE / 2,
            y: player.y + PLAYER_SIZE / 2,
            vx: Math.cos(newRotation) * BULLET_SPEED,
            vy: Math.sin(newRotation) * BULLET_SPEED,
            damage: WEAPON_DAMAGE,
            playerId: player.id,
            distance: 0,
            maxDistance: MAX_BULLET_DISTANCE
          };

          setGameState(prev => ({
            ...prev,
            bullets: [...prev.bullets, newBullet]
          }));

          return { ...player, ammo: player.ammo - 1, rotation: newRotation };
        }
      } else {
        // Random movement
        newX += (Math.random() - 0.5) * PLAYER_SPEED;
        newY += (Math.random() - 0.5) * PLAYER_SPEED;
        newRotation += (Math.random() - 0.5) * 0.2;
      }

      // Check collision
      if (!checkCollision(newX, newY)) {
        return { ...player, x: newX, y: newY, rotation: newRotation };
      }

      return player;
    });
  }, []);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      if (!gameState.isGameActive) return;

      // Update local player position based on keys
      let newX = localPlayer.x;
      let newY = localPlayer.y;
      let newRotation = localPlayer.rotation;

      if (keys.has('w') || keys.has('arrowup')) newY -= PLAYER_SPEED;
      if (keys.has('s') || keys.has('arrowdown')) newY += PLAYER_SPEED;
      if (keys.has('a') || keys.has('arrowleft')) newX -= PLAYER_SPEED;
      if (keys.has('d') || keys.has('arrowright')) newX += PLAYER_SPEED;

      // Update rotation to face mouse
      newRotation = Math.atan2(mousePos.y - localPlayer.y, mousePos.x - localPlayer.x);

      // Check collision for local player
      if (!checkCollision(newX, newY)) {
        setLocalPlayer(prev => ({
          ...prev,
          x: newX,
          y: newY,
          rotation: newRotation
        }));
      }

      // Shooting
      if (isShooting) {
        shoot();
      }

      // Update game state
      setGameState(prev => {
        // Update bullets
        const updatedBullets = prev.bullets
          .map(bullet => ({
            ...bullet,
            x: bullet.x + bullet.vx,
            y: bullet.y + bullet.vy,
            distance: bullet.distance + Math.hypot(bullet.vx, bullet.vy)
          }))
          .filter(bullet => {
            // Remove bullets that are out of bounds or hit obstacles
            if (bullet.distance > bullet.maxDistance) return false;
            if (bullet.x < 0 || bullet.x > CANVAS_WIDTH || bullet.y < 0 || bullet.y > CANVAS_HEIGHT) return false;
            
            // Check obstacle collision
            for (const obstacle of MAP_OBSTACLES) {
              if (bullet.x >= obstacle.x && bullet.x <= obstacle.x + obstacle.width &&
                  bullet.y >= obstacle.y && bullet.y <= obstacle.y + obstacle.height) {
                return false;
              }
            }
            return true;
          });

        // Check bullet-player collisions
        const updatedPlayers = prev.players.map(player => {
          if (player.health <= 0) return player;

          for (const bullet of updatedBullets) {
            if (bullet.playerId !== player.id &&
                bullet.x >= player.x && bullet.x <= player.x + PLAYER_SIZE &&
                bullet.y >= player.y && bullet.y <= player.y + PLAYER_SIZE) {
              
              // Remove bullet and damage player
              const bulletIndex = updatedBullets.findIndex(b => b.id === bullet.id);
              if (bulletIndex >= 0) {
                updatedBullets.splice(bulletIndex, 1);
              }

              const newHealth = Math.max(0, player.health - bullet.damage);
              
              // Handle death
              if (newHealth === 0 && player.health > 0) {
                // Respawn after delay
                setTimeout(() => {
                  setGameState(prevState => ({
                    ...prevState,
                    players: prevState.players.map(p => 
                      p.id === player.id ? {
                        ...p,
                        health: p.maxHealth,
                        x: Math.random() * (CANVAS_WIDTH - PLAYER_SIZE),
                        y: Math.random() * (CANVAS_HEIGHT - PLAYER_SIZE),
                        deaths: p.deaths + 1
                      } : p
                    )
                  }));
                }, 3000);

                // Update killer's score
                const killer = prev.players.find(p => p.id === bullet.playerId);
                if (killer) {
                  const updatedKiller = { ...killer, kills: killer.kills + 1 };
                  
                  if (killer.team === 'red') {
                    return { ...player, health: newHealth };
                  } else if (killer.team === 'blue') {
                    return { ...player, health: newHealth };
                  }
                }
              }

              return { ...player, health: newHealth };
            }
          }
          return player;
        });

        // Update bots
        const botsUpdated = updateBots(updatedPlayers, updatedBullets);

        return {
          ...prev,
          players: botsUpdated,
          bullets: updatedBullets,
          gameTime: prev.gameTime > 0 ? prev.gameTime - 1/60 : 0
        };
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState.isGameActive) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [keys, mousePos, isShooting, localPlayer, gameState.isGameActive, shoot, updateBots]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear canvas with grass texture
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#4a7c59');
      gradient.addColorStop(1, '#2d5233');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw map obstacles with better graphics
      MAP_OBSTACLES.forEach(obstacle => {
        // Main structure
        ctx.fillStyle = '#654321';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Highlight
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, 3);
        ctx.fillRect(obstacle.x, obstacle.y, 3, obstacle.height);
        
        // Shadow
        ctx.fillStyle = '#4a2c17';
        ctx.fillRect(obstacle.x + 2, obstacle.y + obstacle.height, obstacle.width, 2);
        ctx.fillRect(obstacle.x + obstacle.width, obstacle.y + 2, 2, obstacle.height);
      });

      // Draw players with improved graphics
      gameState.players.forEach(player => {
        if (player.health <= 0) return;

        ctx.save();
        ctx.translate(player.x + PLAYER_SIZE / 2, player.y + PLAYER_SIZE / 2);
        ctx.rotate(player.rotation);

        // Player shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(-PLAYER_SIZE / 2 + 1, -PLAYER_SIZE / 2 + 1, PLAYER_SIZE, PLAYER_SIZE);

        // Player body with better colors
        if (player.isLocal) {
          ctx.fillStyle = '#00ff44';
        } else {
          ctx.fillStyle = player.team === 'red' ? '#ff3333' : '#3366ff';
        }
        ctx.fillRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);

        // Player outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);

        // Weapon with better detail
        ctx.fillStyle = '#222';
        ctx.fillRect(PLAYER_SIZE / 2 - 1, -2, 18, 4);
        ctx.fillStyle = '#444';
        ctx.fillRect(PLAYER_SIZE / 2 + 14, -1, 3, 2);

        ctx.restore();

        // Health bar with improved design
        const healthBarWidth = PLAYER_SIZE + 4;
        const healthPercentage = player.health / player.maxHealth;
        
        // Health bar background
        ctx.fillStyle = '#333';
        ctx.fillRect(player.x - 2, player.y - 10, healthBarWidth, 6);
        
        // Health bar
        const healthColor = healthPercentage > 0.6 ? '#4CAF50' : 
                           healthPercentage > 0.3 ? '#FF9800' : '#f44336';
        ctx.fillStyle = healthColor;
        ctx.fillRect(player.x - 1, player.y - 9, (healthBarWidth - 2) * healthPercentage, 4);

        // Username with better visibility
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.username, player.x + PLAYER_SIZE / 2 + 1, player.y - 14);
        ctx.fillStyle = '#fff';
        ctx.fillText(player.username, player.x + PLAYER_SIZE / 2, player.y - 15);
      });

      // Draw bullets with trails
      gameState.bullets.forEach(bullet => {
        // Bullet trail
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bullet.x - bullet.vx * 3, bullet.y - bullet.vy * 3);
        ctx.lineTo(bullet.x, bullet.y);
        ctx.stroke();
        
        // Bullet
        ctx.fillStyle = '#ffff44';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, BULLET_SIZE, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw enhanced crosshair
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mousePos.x - 12, mousePos.y);
      ctx.lineTo(mousePos.x - 4, mousePos.y);
      ctx.moveTo(mousePos.x + 4, mousePos.y);
      ctx.lineTo(mousePos.x + 12, mousePos.y);
      ctx.moveTo(mousePos.x, mousePos.y - 12);
      ctx.lineTo(mousePos.x, mousePos.y - 4);
      ctx.moveTo(mousePos.x, mousePos.y + 4);
      ctx.lineTo(mousePos.x, mousePos.y + 12);
      ctx.stroke();
      
      // Crosshair center dot
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(mousePos.x, mousePos.y, 1, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(render);
    };

    render();
  }, [gameState, mousePos]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const redTeamPlayers = gameState.players.filter(p => p.team === 'red');
  const blueTeamPlayers = gameState.players.filter(p => p.team === 'blue');
  const redScore = redTeamPlayers.reduce((sum, p) => sum + p.kills, 0);
  const blueScore = blueTeamPlayers.reduce((sum, p) => sum + p.kills, 0);

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden relative">
      {/* Game Canvas */}
      <div className="flex justify-center items-center h-full">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border border-gray-600 cursor-crosshair"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* HUD Overlay */}
          <div className="absolute top-4 left-4 text-white">
            <div className="bg-black/70 p-3 rounded">
              <div className="text-green-400">Health: {localPlayer.health}</div>
              <div className="text-blue-400">Ammo: {localPlayer.ammo}/{localPlayer.maxAmmo}</div>
              <div className="text-yellow-400">Weapon: {localPlayer.weapon}</div>
              {localPlayer.isReloading && <div className="text-red-400">Reloading...</div>}
            </div>
          </div>

          <div className="absolute top-4 right-4 text-white">
            <div className="bg-black/70 p-3 rounded text-center">
              <div className="text-xl font-bold">{formatTime(gameState.gameTime)}</div>
              <div className="text-sm">Team Deathmatch</div>
            </div>
          </div>

          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white">
            <div className="bg-black/70 p-3 rounded flex gap-8">
              <div className="text-center">
                <div className="text-blue-400 text-xl font-bold">{blueScore}</div>
                <div className="text-sm">BLUE</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 text-xl font-bold">{redScore}</div>
                <div className="text-sm">RED</div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 text-white">
            <div className="bg-black/70 p-3 rounded">
              <div className="text-green-400">K: {localPlayer.kills}</div>
              <div className="text-red-400">D: {localPlayer.deaths}</div>
              <div className="text-yellow-400">Team: {localPlayer.team.toUpperCase()}</div>
            </div>
          </div>

          {/* Controls Help */}
          <div className="absolute bottom-4 right-4 text-white">
            <div className="bg-black/70 p-3 rounded text-xs">
              <div>WASD: Move</div>
              <div>Mouse: Aim</div>
              <div>Left Click: Shoot</div>
              <div>R: Reload</div>
            </div>
          </div>

          {/* Minimap */}
          <div className="absolute top-1/4 right-4 w-32 h-24 bg-black/70 border border-gray-600 rounded">
            <div className="relative w-full h-full overflow-hidden">
              {/* Map obstacles */}
              {MAP_OBSTACLES.map((obstacle, i) => (
                <div
                  key={i}
                  className="absolute bg-brown-600"
                  style={{
                    left: `${(obstacle.x / CANVAS_WIDTH) * 100}%`,
                    top: `${(obstacle.y / CANVAS_HEIGHT) * 100}%`,
                    width: `${(obstacle.width / CANVAS_WIDTH) * 100}%`,
                    height: `${(obstacle.height / CANVAS_HEIGHT) * 100}%`,
                    backgroundColor: '#8B4513'
                  }}
                />
              ))}
              
              {/* Players */}
              {gameState.players.map(player => (
                player.health > 0 && (
                  <div
                    key={player.id}
                    className={`absolute w-1 h-1 rounded-full ${
                      player.isLocal ? 'bg-green-400' : 
                      player.team === 'red' ? 'bg-red-400' : 'bg-blue-400'
                    }`}
                    style={{
                      left: `${(player.x / CANVAS_WIDTH) * 100}%`,
                      top: `${(player.y / CANVAS_HEIGHT) * 100}%`
                    }}
                  />
                )
              ))}
            </div>
          </div>

          {/* Death Screen */}
          {localPlayer.health <= 0 && (
            <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
              <div className="bg-black/80 p-8 rounded-lg text-center">
                <h2 className="text-2xl font-bold text-red-400 mb-4">YOU DIED</h2>
                <p className="text-gray-300">Respawning in 3 seconds...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};