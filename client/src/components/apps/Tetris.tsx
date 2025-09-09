import { FC, useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCw, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const PIECE_SIZE = 25;

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Position {
  x: number;
  y: number;
}

interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  color: string;
}

const TETROMINOES: Record<TetrominoType, Tetromino> = {
  I: {
    type: 'I',
    shape: [[1, 1, 1, 1]],
    color: '#00FFFF'
  },
  O: {
    type: 'O',
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#FFFF00'
  },
  T: {
    type: 'T',
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: '#800080'
  },
  S: {
    type: 'S',
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: '#00FF00'
  },
  Z: {
    type: 'Z',
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: '#FF0000'
  },
  J: {
    type: 'J',
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: '#0000FF'
  },
  L: {
    type: 'L',
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: '#FFA500'
  }
};

export const Tetris: FC = () => {
  const [board, setBoard] = useState<string[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(''))
  );
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 0, y: 0 });
  const [nextPiece, setNextPiece] = useState<Tetromino | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [dropTime, setDropTime] = useState(1000);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomTetromino = useCallback((): Tetromino => {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return TETROMINOES[randomType];
  }, []);

  const rotatePiece = useCallback((piece: Tetromino): Tetromino => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    return { ...piece, shape: rotated };
  }, []);

  const isValidMove = useCallback((piece: Tetromino, position: Position, gameBoard: string[][]): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = position.x + x;
          const newY = position.y + y;
          
          if (
            newX < 0 || 
            newX >= BOARD_WIDTH || 
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && gameBoard[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const placePiece = useCallback((piece: Tetromino, position: Position, gameBoard: string[][]): string[][] => {
    const newBoard = gameBoard.map(row => [...row]);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] && position.y + y >= 0) {
          newBoard[position.y + y][position.x + x] = piece.color;
        }
      }
    }
    
    return newBoard;
  }, []);

  const clearLines = useCallback((gameBoard: string[][]): { newBoard: string[][]; clearedLines: number } => {
    const fullLines: number[] = [];
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (gameBoard[y].every(cell => cell !== '')) {
        fullLines.push(y);
      }
    }
    
    if (fullLines.length === 0) {
      return { newBoard: gameBoard, clearedLines: 0 };
    }
    
    const newBoard = gameBoard.filter((_, index) => !fullLines.includes(index));
    const emptyRows = Array(fullLines.length).fill(null).map(() => Array(BOARD_WIDTH).fill(''));
    
    return { 
      newBoard: [...emptyRows, ...newBoard], 
      clearedLines: fullLines.length 
    };
  }, []);

  const spawnPiece = useCallback(() => {
    const piece = nextPiece || getRandomTetromino();
    const newNextPiece = getRandomTetromino();
    const startPosition = { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2), y: 0 };
    
    if (!isValidMove(piece, startPosition, board)) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }
    
    setCurrentPiece(piece);
    setCurrentPosition(startPosition);
    setNextPiece(newNextPiece);
  }, [nextPiece, getRandomTetromino, isValidMove, board]);

  const movePiece = useCallback((direction: 'left' | 'right' | 'down') => {
    if (!currentPiece || gameOver) return;
    
    const newPosition = { ...currentPosition };
    
    switch (direction) {
      case 'left':
        newPosition.x -= 1;
        break;
      case 'right':
        newPosition.x += 1;
        break;
      case 'down':
        newPosition.y += 1;
        break;
    }
    
    if (isValidMove(currentPiece, newPosition, board)) {
      setCurrentPosition(newPosition);
    } else if (direction === 'down') {
      // Place the piece and spawn a new one
      const newBoard = placePiece(currentPiece, currentPosition, board);
      const { newBoard: clearedBoard, clearedLines } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      setLines(prev => prev + clearedLines);
      setScore(prev => prev + (clearedLines * 100 * level) + 10);
      setLevel(Math.floor((lines + clearedLines) / 10) + 1);
      
      spawnPiece();
    }
  }, [currentPiece, currentPosition, board, gameOver, isValidMove, placePiece, clearLines, level, lines, spawnPiece]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver) return;
    
    let newPosition = { ...currentPosition };
    while (isValidMove(currentPiece, { ...newPosition, y: newPosition.y + 1 }, board)) {
      newPosition.y += 1;
    }
    
    setCurrentPosition(newPosition);
    movePiece('down');
  }, [currentPiece, currentPosition, board, gameOver, isValidMove, movePiece]);

  const rotatePieceAction = useCallback(() => {
    if (!currentPiece || gameOver) return;
    
    const rotated = rotatePiece(currentPiece);
    if (isValidMove(rotated, currentPosition, board)) {
      setCurrentPiece(rotated);
    }
  }, [currentPiece, currentPosition, board, gameOver, rotatePiece, isValidMove]);

  const startGame = useCallback(() => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('')));
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPlaying(true);
    setDropTime(1000);
    
    const firstPiece = getRandomTetromino();
    const secondPiece = getRandomTetromino();
    setCurrentPiece(firstPiece);
    setNextPiece(secondPiece);
    setCurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - Math.floor(firstPiece.shape[0].length / 2), y: 0 });
  }, [getRandomTetromino]);

  const pauseGame = () => {
    setIsPlaying(!isPlaying);
  };

  // Game loop
  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(() => {
        movePiece('down');
      }, Math.max(50, dropTime - (level - 1) * 50));
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
  }, [isPlaying, gameOver, movePiece, dropTime, level]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          movePiece('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          movePiece('right');
          break;
        case 'ArrowDown':
          event.preventDefault();
          movePiece('down');
          break;
        case 'ArrowUp':
          event.preventDefault();
          rotatePieceAction();
          break;
        case ' ':
          event.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          pauseGame();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameOver, movePiece, rotatePieceAction, hardDrop]);

  // Initialize game
  useEffect(() => {
    if (!currentPiece && !nextPiece) {
      const firstPiece = getRandomTetromino();
      const secondPiece = getRandomTetromino();
      setCurrentPiece(firstPiece);
      setNextPiece(secondPiece);
      setCurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - Math.floor(firstPiece.shape[0].length / 2), y: 0 });
    }
  }, [currentPiece, nextPiece, getRandomTetromino]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // Add current piece to display board
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x] && currentPosition.y + y >= 0) {
            const boardY = currentPosition.y + y;
            const boardX = currentPosition.x + x;
            if (boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }
    
    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className="border border-gray-300"
            style={{
              width: PIECE_SIZE,
              height: PIECE_SIZE,
              backgroundColor: cell || '#f8f9fa'
            }}
          />
        ))}
      </div>
    ));
  };

  const renderNextPiece = () => {
    if (!nextPiece) return null;
    
    return nextPiece.shape.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            className="border border-gray-200"
            style={{
              width: 20,
              height: 20,
              backgroundColor: cell ? nextPiece.color : 'transparent'
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="h-full p-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="flex gap-6 h-full">
        {/* Game Board */}
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            TETRIS
          </h1>
          
          <div className="bg-black/30 p-4 rounded-lg border-2 border-cyan-400 shadow-2xl">
            <div className="border-2 border-white/50 bg-black/50">
              {renderBoard()}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 flex gap-2">
            <Button
              onClick={isPlaying ? pauseGame : startGame}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Start'}
            </Button>
            <Button onClick={() => movePiece('left')} variant="outline" className="text-black">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button onClick={rotatePieceAction} variant="outline" className="text-black">
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button onClick={() => movePiece('right')} variant="outline" className="text-black">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button onClick={hardDrop} variant="outline" className="text-black">
              <ArrowDown className="w-4 h-4" />
              Drop
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4 min-w-[200px]">
          {/* Score */}
          <Card className="bg-black/30 border-cyan-400 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{score.toLocaleString()}</div>
              <div className="text-sm mt-2">
                <div>Level: {level}</div>
                <div>Lines: {lines}</div>
              </div>
            </CardContent>
          </Card>

          {/* Next Piece */}
          <Card className="bg-black/30 border-cyan-400 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Next</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="bg-black/50 p-2 rounded">
                  {renderNextPiece()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls Guide */}
          <Card className="bg-black/30 border-cyan-400 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Controls</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="space-y-1">
                <div>← → Move</div>
                <div>↑ Rotate</div>
                <div>↓ Soft Drop</div>
                <div>Space: Hard Drop</div>
                <div>P: Pause</div>
              </div>
            </CardContent>
          </Card>

          {gameOver && (
            <Card className="bg-red-900/50 border-red-400 text-white">
              <CardContent className="text-center p-4">
                <h2 className="text-xl font-bold mb-2">Game Over!</h2>
                <p className="mb-4">Final Score: {score.toLocaleString()}</p>
                <Button onClick={startGame} className="bg-blue-600 hover:bg-blue-700">
                  Play Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};