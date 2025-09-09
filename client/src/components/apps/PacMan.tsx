import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BOARD_WIDTH = 19;
const BOARD_HEIGHT = 21;
const CELL_SIZE = 24;

type CellType = 'wall' | 'dot' | 'power' | 'empty' | 'ghost-house';
type Direction = 'up' | 'down' | 'left' | 'right';

interface Position {
  x: number;
  y: number;
}

interface Ghost {
  id: string;
  position: Position;
  direction: Direction;
  color: string;
  mode: 'chase' | 'scatter' | 'frightened';
  target: Position;
}

const MAZE_LAYOUT = [
  "WWWWWWWWWWWWWWWWWWW",
  "W........W........W",
  "W.WW.WWW.W.WWW.WW.W",
  "WP..............PW",
  "W.WW.W.WWWWW.W.WW.W",
  "W....W...W...W....W",
  "WWWW.WWW.W.WWW.WWWW",
  "   W.W.......W.W   ",
  "   W.W.WW WW.W.W   ",
  "WWWW.W.W   W.W.WWWW",
  "W.....W     W.....W",
  "WWWW.W.W   W.W.WWWW",
  "   W.W.WWWWW.W.W   ",
  "   W.W.......W.W   ",
  "WWWW.W.WWWWW.W.WWWW",
  "W........W........W",
  "W.WW.WWW.W.WWW.WW.W",
  "WP.W..........W.PW",
  "WWW.W.W.WWW.W.W.WWW",
  "W.....W..W..W.....W",
  "WWWWWWWWWWWWWWWWWWW"
];

export const PacMan: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('pacman-highscore');
    return saved ? parseInt(saved) : 0;
  });

  const [pacman, setPacman] = useState<{
    position: Position;
    direction: Direction;
    nextDirection: Direction;
    mouthOpen: boolean;
  }>({
    position: { x: 9, y: 15 },
    direction: 'right',
    nextDirection: 'right',
    mouthOpen: true
  });

  const [ghosts, setGhosts] = useState<Ghost[]>([
    {
      id: 'blinky',
      position: { x: 9, y: 9 },
      direction: 'up',
      color: '#FF0000',
      mode: 'chase',
      target: { x: 0, y: 0 }
    },
    {
      id: 'pinky',
      position: { x: 9, y: 10 },
      direction: 'down',
      color: '#FFB8FF',
      mode: 'chase',
      target: { x: 0, y: 0 }
    },
    {
      id: 'inky',
      position: { x: 8, y: 10 },
      direction: 'up',
      color: '#00FFFF',
      mode: 'chase',
      target: { x: 0, y: 0 }
    },
    {
      id: 'clyde',
      position: { x: 10, y: 10 },
      direction: 'down',
      color: '#FFB852',
      mode: 'chase',
      target: { x: 0, y: 0 }
    }
  ]);

  const [maze, setMaze] = useState<CellType[][]>(() => {
    return MAZE_LAYOUT.map(row => 
      row.split('').map(cell => {
        switch (cell) {
          case 'W': return 'wall';
          case '.': return 'dot';
          case 'P': return 'power';
          case ' ': return 'ghost-house';
          default: return 'empty';
        }
      })
    );
  });

  const [powerPelletActive, setPowerPelletActive] = useState(false);
  const [powerPelletTimer, setPowerPelletTimer] = useState(0);

  const canMoveTo = useCallback((x: number, y: number): boolean => {
    if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
      return false;
    }
    return maze[y][x] !== 'wall';
  }, [maze]);

  const getNextPosition = useCallback((pos: Position, direction: Direction): Position => {
    let newX = pos.x;
    let newY = pos.y;
    
    switch (direction) {
      case 'up': newY--; break;
      case 'down': newY++; break;
      case 'left': newX--; break;
      case 'right': newX++; break;
    }
    
    // Handle tunnel effect
    if (newX < 0) newX = BOARD_WIDTH - 1;
    if (newX >= BOARD_WIDTH) newX = 0;
    
    return { x: newX, y: newY };
  }, []);

  const movePacman = useCallback(() => {
    setPacman(prevPacman => {
      const nextPos = getNextPosition(prevPacman.position, prevPacman.nextDirection);
      
      if (canMoveTo(nextPos.x, nextPos.y)) {
        // Can turn to next direction
        const newDirection = prevPacman.nextDirection;
        const newPos = nextPos;
        
        // Check for dots and power pellets
        if (maze[newPos.y][newPos.x] === 'dot') {
          setScore(prev => prev + 10);
          setMaze(prevMaze => {
            const newMaze = [...prevMaze];
            newMaze[newPos.y] = [...newMaze[newPos.y]];
            newMaze[newPos.y][newPos.x] = 'empty';
            return newMaze;
          });
        } else if (maze[newPos.y][newPos.x] === 'power') {
          setScore(prev => prev + 50);
          setPowerPelletActive(true);
          setPowerPelletTimer(200); // 200 frames ~= 10 seconds
          setGhosts(prevGhosts => 
            prevGhosts.map(ghost => ({ ...ghost, mode: 'frightened' }))
          );
          setMaze(prevMaze => {
            const newMaze = [...prevMaze];
            newMaze[newPos.y] = [...newMaze[newPos.y]];
            newMaze[newPos.y][newPos.x] = 'empty';
            return newMaze;
          });
        }
        
        return {
          ...prevPacman,
          position: newPos,
          direction: newDirection,
          mouthOpen: !prevPacman.mouthOpen
        };
      } else {
        // Continue in current direction if possible
        const currentNext = getNextPosition(prevPacman.position, prevPacman.direction);
        if (canMoveTo(currentNext.x, currentNext.y)) {
          return {
            ...prevPacman,
            position: currentNext,
            mouthOpen: !prevPacman.mouthOpen
          };
        }
        
        // Can't move
        return prevPacman;
      }
    });
  }, [canMoveTo, getNextPosition, maze]);

  const moveGhosts = useCallback(() => {
    setGhosts(prevGhosts => 
      prevGhosts.map(ghost => {
        const possibleDirections: Direction[] = [];
        const currentPos = ghost.position;
        
        ['up', 'down', 'left', 'right'].forEach(dir => {
          const nextPos = getNextPosition(currentPos, dir as Direction);
          if (canMoveTo(nextPos.x, nextPos.y)) {
            possibleDirections.push(dir as Direction);
          }
        });
        
        if (possibleDirections.length === 0) return ghost;
        
        // Simple AI: choose random direction for now
        const newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        const newPosition = getNextPosition(currentPos, newDirection);
        
        return {
          ...ghost,
          position: newPosition,
          direction: newDirection
        };
      })
    );
  }, [canMoveTo, getNextPosition]);

  const checkCollisions = useCallback(() => {
    const pacmanPos = pacman.position;
    
    ghosts.forEach(ghost => {
      if (ghost.position.x === pacmanPos.x && ghost.position.y === pacmanPos.y) {
        if (powerPelletActive && ghost.mode === 'frightened') {
          // Eat ghost
          setScore(prev => prev + 200);
          // Reset ghost to center (simplified)
          setGhosts(prevGhosts => 
            prevGhosts.map(g => 
              g.id === ghost.id 
                ? { ...g, position: { x: 9, y: 10 }, mode: 'chase' }
                : g
            )
          );
        } else {
          // Pacman dies
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameState('gameover');
              if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('pacman-highscore', score.toString());
              }
            }
            return newLives;
          });
          
          // Reset positions
          setPacman(prev => ({
            ...prev,
            position: { x: 9, y: 15 },
            direction: 'right',
            nextDirection: 'right'
          }));
        }
      }
    });
  }, [pacman.position, ghosts, powerPelletActive, score, highScore]);

  const checkWinCondition = useCallback(() => {
    const dotsRemaining = maze.flat().filter(cell => cell === 'dot' || cell === 'power').length;
    if (dotsRemaining === 0) {
      setLevel(prev => prev + 1);
      // Reset maze for next level
      setMaze(MAZE_LAYOUT.map(row => 
        row.split('').map(cell => {
          switch (cell) {
            case 'W': return 'wall';
            case '.': return 'dot';
            case 'P': return 'power';
            case ' ': return 'ghost-house';
            default: return 'empty';
          }
        })
      ));
    }
  }, [maze]);

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;
    
    movePacman();
    moveGhosts();
    checkCollisions();
    checkWinCondition();
    
    // Handle power pellet timer
    if (powerPelletActive) {
      setPowerPelletTimer(prev => {
        if (prev <= 1) {
          setPowerPelletActive(false);
          setGhosts(prevGhosts => 
            prevGhosts.map(ghost => ({ ...ghost, mode: 'chase' }))
          );
          return 0;
        }
        return prev - 1;
      });
    }
  }, [gameState, movePacman, moveGhosts, checkCollisions, checkWinCondition, powerPelletActive]);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = window.setInterval(gameLoop, 150);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault();
          setPacman(prev => ({ ...prev, nextDirection: 'up' }));
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault();
          setPacman(prev => ({ ...prev, nextDirection: 'down' }));
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          setPacman(prev => ({ ...prev, nextDirection: 'left' }));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          setPacman(prev => ({ ...prev, nextDirection: 'right' }));
          break;
        case ' ':
          event.preventDefault();
          setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw maze
    ctx.fillStyle = '#0000FF';
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = maze[y][x];
        const pixelX = x * CELL_SIZE;
        const pixelY = y * CELL_SIZE;
        
        if (cell === 'wall') {
          ctx.fillRect(pixelX, pixelY, CELL_SIZE, CELL_SIZE);
        } else if (cell === 'dot') {
          ctx.fillStyle = '#FFFF00';
          ctx.beginPath();
          ctx.arc(pixelX + CELL_SIZE/2, pixelY + CELL_SIZE/2, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0000FF';
        } else if (cell === 'power') {
          ctx.fillStyle = '#FFFF00';
          ctx.beginPath();
          ctx.arc(pixelX + CELL_SIZE/2, pixelY + CELL_SIZE/2, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0000FF';
        }
      }
    }
    
    // Draw Pacman
    ctx.fillStyle = '#FFFF00';
    const pacX = pacman.position.x * CELL_SIZE + CELL_SIZE/2;
    const pacY = pacman.position.y * CELL_SIZE + CELL_SIZE/2;
    
    ctx.beginPath();
    if (pacman.mouthOpen) {
      let startAngle = 0;
      let endAngle = Math.PI * 2;
      
      switch (pacman.direction) {
        case 'right':
          startAngle = 0.3 * Math.PI;
          endAngle = 1.7 * Math.PI;
          break;
        case 'down':
          startAngle = 0.8 * Math.PI;
          endAngle = 0.2 * Math.PI;
          break;
        case 'left':
          startAngle = 1.3 * Math.PI;
          endAngle = 0.7 * Math.PI;
          break;
        case 'up':
          startAngle = 1.8 * Math.PI;
          endAngle = 1.2 * Math.PI;
          break;
      }
      
      ctx.arc(pacX, pacY, CELL_SIZE/2 - 2, startAngle, endAngle);
      ctx.lineTo(pacX, pacY);
    } else {
      ctx.arc(pacX, pacY, CELL_SIZE/2 - 2, 0, Math.PI * 2);
    }
    ctx.fill();
    
    // Draw ghosts
    ghosts.forEach(ghost => {
      const ghostX = ghost.position.x * CELL_SIZE + CELL_SIZE/2;
      const ghostY = ghost.position.y * CELL_SIZE + CELL_SIZE/2;
      
      ctx.fillStyle = ghost.mode === 'frightened' ? '#0000FF' : ghost.color;
      ctx.beginPath();
      ctx.arc(ghostX, ghostY, CELL_SIZE/2 - 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Ghost eyes
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(ghostX - 4, ghostY - 4, 2, 0, Math.PI * 2);
      ctx.arc(ghostX + 4, ghostY - 4, 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(ghostX - 4, ghostY - 4, 1, 0, Math.PI * 2);
      ctx.arc(ghostX + 4, ghostY - 4, 1, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [maze, pacman, ghosts]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setLevel(1);
    setPacman({
      position: { x: 9, y: 15 },
      direction: 'right',
      nextDirection: 'right',
      mouthOpen: true
    });
    setGhosts([
      { id: 'blinky', position: { x: 9, y: 9 }, direction: 'up', color: '#FF0000', mode: 'chase', target: { x: 0, y: 0 } },
      { id: 'pinky', position: { x: 9, y: 10 }, direction: 'down', color: '#FFB8FF', mode: 'chase', target: { x: 0, y: 0 } },
      { id: 'inky', position: { x: 8, y: 10 }, direction: 'up', color: '#00FFFF', mode: 'chase', target: { x: 0, y: 0 } },
      { id: 'clyde', position: { x: 10, y: 10 }, direction: 'down', color: '#FFB852', mode: 'chase', target: { x: 0, y: 0 } }
    ]);
    // Reset maze
    setMaze(MAZE_LAYOUT.map(row => 
      row.split('').map(cell => {
        switch (cell) {
          case 'W': return 'wall';
          case '.': return 'dot';
          case 'P': return 'power';
          case ' ': return 'ghost-house';
          default: return 'empty';
        }
      })
    ));
  };

  const pauseGame = () => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  return (
    <div className="h-full bg-black text-yellow-400 p-4 flex flex-col items-center">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-center mb-2">PAC-MAN</h1>
        <div className="flex gap-6 text-lg font-mono">
          <div>Score: {score.toLocaleString()}</div>
          <div>High: {highScore.toLocaleString()}</div>
          <div>Lives: {'●'.repeat(lives)}</div>
          <div>Level: {level}</div>
        </div>
      </div>

      {gameState === 'menu' && (
        <Card className="bg-blue-900 border-yellow-400 text-white mb-4">
          <CardHeader>
            <CardTitle className="text-center text-yellow-400">🎮 PAC-MAN</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>Navigate the maze and eat all the dots while avoiding ghosts!</p>
            <div className="text-sm space-y-2">
              <div>🕹️ Use Arrow Keys or WASD to move</div>
              <div>🟡 Eat dots for points</div>
              <div>🟠 Power pellets make ghosts vulnerable</div>
              <div>👻 Avoid ghosts or eat them when they're blue</div>
              <div>⏸️ Press Space to pause</div>
            </div>
            <Button onClick={startGame} className="bg-yellow-600 hover:bg-yellow-700 text-black">
              START GAME
            </Button>
          </CardContent>
        </Card>
      )}

      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <Card className="bg-blue-900 border-yellow-400 text-white">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">PAUSED</h2>
              <Button onClick={pauseGame} className="bg-yellow-600 hover:bg-yellow-700 text-black">
                RESUME
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
          <Card className="bg-red-900 border-yellow-400 text-white">
            <CardContent className="p-6 text-center space-y-4">
              <h2 className="text-2xl font-bold text-yellow-400">GAME OVER</h2>
              <div className="text-lg">Final Score: {score.toLocaleString()}</div>
              {score > highScore && (
                <div className="text-yellow-400">🏆 NEW HIGH SCORE!</div>
              )}
              <div className="flex gap-2">
                <Button onClick={startGame} className="bg-yellow-600 hover:bg-yellow-700 text-black">
                  PLAY AGAIN
                </Button>
                <Button onClick={() => setGameState('menu')} variant="outline" className="border-yellow-400 text-yellow-400">
                  MENU
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={BOARD_WIDTH * CELL_SIZE}
        height={BOARD_HEIGHT * CELL_SIZE}
        className="border-2 border-yellow-400 rounded-lg"
        style={{ imageRendering: 'pixelated' }}
      />

      <div className="mt-4 text-center text-sm">
        <div className="mb-2">Controls: Arrow Keys or WASD to move • Space to pause</div>
        {powerPelletActive && (
          <div className="text-blue-400 font-bold">
            POWER PELLET ACTIVE! ({Math.ceil(powerPelletTimer / 20)}s)
          </div>
        )}
      </div>
    </div>
  );
};