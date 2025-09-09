import { FC, useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Settings, BookOpen, Gamepad2, Monitor } from 'lucide-react';

interface RetroGame {
  id: string;
  title: string;
  system: string;
  year: number;
  description: string;
  educational: string;
  controls: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Programming' | 'Logic' | 'Math' | 'History' | 'Strategy';
}

interface GameState {
  score: number;
  level: number;
  lives: number;
  gameOver: boolean;
  paused: boolean;
}

export const RetroEmulator: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    lives: 3,
    gameOver: false,
    paused: false
  });
  const [currentTab, setCurrentTab] = useState('library');

  const retroGames: RetroGame[] = [
    {
      id: 'snake',
      title: 'Educational Snake',
      system: 'Classic Arcade',
      year: 1976,
      description: 'Learn algorithmic thinking and pathfinding concepts through the classic Snake game.',
      educational: 'Teaches: Array manipulation, collision detection, game loops, and basic AI pathfinding algorithms.',
      controls: ['Arrow Keys: Move snake', 'Space: Pause', 'R: Restart'],
      difficulty: 'Easy',
      category: 'Programming'
    },
    {
      id: 'pong',
      title: 'Physics Pong',
      system: 'Atari 2600',
      year: 1972,
      description: 'Understand physics concepts like velocity, acceleration, and collision through Pong.',
      educational: 'Teaches: Physics simulation, velocity vectors, collision response, and real-time calculation.',
      controls: ['W/S: Left paddle', 'Up/Down: Right paddle', 'Space: Serve'],
      difficulty: 'Easy',
      category: 'Math'
    },
    {
      id: 'breakout',
      title: 'Algorithm Breakout',
      system: 'Atari 2600',
      year: 1976,
      description: 'Learn about geometric calculations and pattern recognition through brick breaking.',
      educational: 'Teaches: Angle calculations, pattern recognition, optimization algorithms, and resource management.',
      controls: ['A/D or Left/Right: Move paddle', 'Space: Launch ball'],
      difficulty: 'Medium',
      category: 'Math'
    },
    {
      id: 'tetris',
      title: 'Logic Tetris',
      system: 'Game Boy',
      year: 1984,
      description: 'Master spatial reasoning and algorithmic thinking with the classic puzzle game.',
      educational: 'Teaches: Spatial reasoning, pattern matching, optimization strategies, and decision trees.',
      controls: ['A/D: Move', 'W: Rotate', 'S: Drop', 'Space: Hard drop'],
      difficulty: 'Medium',
      category: 'Logic'
    },
    {
      id: 'maze',
      title: 'Pathfinding Maze',
      system: 'Educational',
      year: 1980,
      description: 'Learn graph traversal and pathfinding algorithms by solving procedural mazes.',
      educational: 'Teaches: Graph theory, breadth-first search, depth-first search, and A* pathfinding.',
      controls: ['Arrow Keys: Move', 'H: Show hint path', 'N: New maze'],
      difficulty: 'Hard',
      category: 'Programming'
    },
    {
      id: 'calculator',
      title: 'Math Blaster',
      system: 'Educational',
      year: 1983,
      description: 'Improve mental math skills through fast-paced arithmetic challenges.',
      educational: 'Teaches: Mental arithmetic, order of operations, number patterns, and mathematical reasoning.',
      controls: ['Number keys: Input answer', 'Enter: Submit', 'Backspace: Clear'],
      difficulty: 'Medium',
      category: 'Math'
    }
  ];

  const [currentGame, setCurrentGame] = useState<RetroGame | null>(null);

  // Snake Game Implementation
  const SnakeGame: FC = () => {
    const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
    const [food, setFood] = useState({ x: 15, y: 15 });
    const [direction, setDirection] = useState({ x: 0, y: 1 });
    const [gameRunning, setGameRunning] = useState(false);

    const BOARD_SIZE = 20;
    const CELL_SIZE = 20;

    const moveSnake = useCallback(() => {
      if (!gameRunning || gameState.paused) return;

      setSnake(currentSnake => {
        const newSnake = [...currentSnake];
        const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };

        // Check boundaries
        if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
          setGameRunning(false);
          setGameState(prev => ({ ...prev, gameOver: true }));
          return currentSnake;
        }

        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameRunning(false);
          setGameState(prev => ({ ...prev, gameOver: true }));
          return currentSnake;
        }

        newSnake.unshift(head);

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setFood({
            x: Math.floor(Math.random() * BOARD_SIZE),
            y: Math.floor(Math.random() * BOARD_SIZE)
          });
          setGameState(prev => ({ ...prev, score: prev.score + 10 }));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, [direction, food, gameRunning, gameState.paused]);

    useEffect(() => {
      const gameInterval = setInterval(moveSnake, 200);
      return () => clearInterval(gameInterval);
    }, [moveSnake]);

    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (!gameRunning) return;

        switch (e.key) {
          case 'ArrowUp':
            if (direction.y === 0) setDirection({ x: 0, y: -1 });
            break;
          case 'ArrowDown':
            if (direction.y === 0) setDirection({ x: 0, y: 1 });
            break;
          case 'ArrowLeft':
            if (direction.x === 0) setDirection({ x: -1, y: 0 });
            break;
          case 'ArrowRight':
            if (direction.x === 0) setDirection({ x: 1, y: 0 });
            break;
          case ' ':
            setGameState(prev => ({ ...prev, paused: !prev.paused }));
            break;
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }, [direction, gameRunning]);

    const startGame = () => {
      setSnake([{ x: 10, y: 10 }]);
      setFood({ x: 15, y: 15 });
      setDirection({ x: 0, y: 1 });
      setGameRunning(true);
      setGameState({ score: 0, level: 1, lives: 3, gameOver: false, paused: false });
    };

    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="flex gap-4 text-sm">
          <span>Score: {gameState.score}</span>
          <span>Length: {snake.length}</span>
        </div>
        
        <svg width={BOARD_SIZE * CELL_SIZE} height={BOARD_SIZE * CELL_SIZE} className="border-2 border-green-500 bg-black">
          {/* Grid */}
          {Array.from({ length: BOARD_SIZE }, (_, i) => (
            <g key={i}>
              <line x1={i * CELL_SIZE} y1="0" x2={i * CELL_SIZE} y2={BOARD_SIZE * CELL_SIZE} stroke="#333" strokeWidth="0.5" />
              <line x1="0" y1={i * CELL_SIZE} x2={BOARD_SIZE * CELL_SIZE} y2={i * CELL_SIZE} stroke="#333" strokeWidth="0.5" />
            </g>
          ))}
          
          {/* Snake */}
          {snake.map((segment, index) => (
            <rect
              key={index}
              x={segment.x * CELL_SIZE}
              y={segment.y * CELL_SIZE}
              width={CELL_SIZE}
              height={CELL_SIZE}
              fill={index === 0 ? '#00ff00' : '#008800'}
              stroke="#004400"
            />
          ))}
          
          {/* Food */}
          <circle
            cx={food.x * CELL_SIZE + CELL_SIZE / 2}
            cy={food.y * CELL_SIZE + CELL_SIZE / 2}
            r={CELL_SIZE / 3}
            fill="#ff0000"
          />
        </svg>

        <div className="flex gap-2">
          {!gameRunning ? (
            <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-1" />
              Start Game
            </Button>
          ) : (
            <Button onClick={() => setGameState(prev => ({ ...prev, paused: !prev.paused }))}>
              {gameState.paused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
              {gameState.paused ? 'Resume' : 'Pause'}
            </Button>
          )}
          <Button onClick={() => setGameRunning(false)} variant="outline">
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>

        {gameState.gameOver && (
          <div className="text-center p-4 bg-red-900 rounded-lg">
            <h3 className="text-lg font-bold text-red-400">Game Over!</h3>
            <p>Final Score: {gameState.score}</p>
            <p className="text-sm mt-2">Snake Length: {snake.length}</p>
          </div>
        )}
      </div>
    );
  };

  const renderGameContent = () => {
    if (!currentGame) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Select a game to start learning</p>
          </div>
        </div>
      );
    }

    switch (currentGame.id) {
      case 'snake':
        return <SnakeGame />;
      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">{currentGame.title}</p>
              <p className="text-sm">Coming Soon - Advanced Educational Features</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                Start {currentGame.title}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Educational Gaming Emulator</h1>
              <p className="text-sm text-gray-300">Learn programming and math through classic games</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-white/20 text-white">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </Button>
            <Button variant="outline" size="sm" className="border-white/20 text-white">
              <BookOpen className="w-4 h-4 mr-1" />
              Tutorials
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar - Game Library */}
        <div className="w-80 bg-black/20 border-r border-white/10 p-4 overflow-y-auto">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-2 bg-white/10">
              <TabsTrigger value="library">Game Library</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
            </TabsList>
            
            <TabsContent value="library" className="space-y-3 mt-4">
              {retroGames.map(game => (
                <Card
                  key={game.id}
                  className={`cursor-pointer transition-all bg-white/10 border-white/20 hover:bg-white/20 ${
                    currentGame?.id === game.id ? 'ring-2 ring-blue-400' : ''
                  }`}
                  onClick={() => setCurrentGame(game)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{game.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        game.difficulty === 'Easy' ? 'bg-green-600' :
                        game.difficulty === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}>
                        {game.difficulty}
                      </span>
                    </div>
                    <div className="text-xs text-gray-300 space-y-1">
                      <div>{game.system} • {game.year}</div>
                      <div className="text-blue-300">{game.category}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="learning" className="mt-4">
              {currentGame ? (
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Educational Focus</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-1">What You'll Learn:</h4>
                      <p className="text-xs text-gray-300">{currentGame.educational}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-green-300 mb-1">Controls:</h4>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {currentGame.controls.map((control, index) => (
                          <li key={index}>• {control}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-purple-300 mb-1">Description:</h4>
                      <p className="text-xs text-gray-300">{currentGame.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a game to see learning objectives</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
          {/* Game Header */}
          {currentGame && (
            <div className="bg-black/20 border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">{currentGame.title}</h2>
                  <p className="text-sm text-gray-300">{currentGame.system} • {currentGame.year}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>Score: {gameState.score}</span>
                  <span>Level: {gameState.level}</span>
                  <span>Lives: {gameState.lives}</span>
                </div>
              </div>
            </div>
          )}

          {/* Game Canvas/Content */}
          <div className="flex-1 flex items-center justify-center p-8">
            {renderGameContent()}
          </div>

          {/* Educational Info Footer */}
          {currentGame && (
            <div className="bg-black/20 border-t border-white/10 p-4">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-semibold text-blue-300">Programming Concepts</div>
                  <div className="text-xs text-gray-300">Game loops, collision detection, state management</div>
                </div>
                <div>
                  <div className="font-semibold text-green-300">Mathematical Skills</div>
                  <div className="text-xs text-gray-300">Coordinate systems, algorithms, optimization</div>
                </div>
                <div>
                  <div className="font-semibold text-purple-300">Problem Solving</div>
                  <div className="text-xs text-gray-300">Logic, pattern recognition, strategic thinking</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};