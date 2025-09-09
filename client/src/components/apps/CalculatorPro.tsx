import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, RotateCcw } from 'lucide-react';

export const CalculatorPro: FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperator);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case '^':
        return Math.pow(firstValue, secondValue);
      case '%':
        return firstValue % secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      const calculation = `${previousValue} ${operation} ${inputValue} = ${newValue}`;
      
      setHistory(prev => [calculation, ...prev.slice(0, 9)]);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const clearEntry = () => {
    setDisplay('0');
    setWaitingForNewValue(false);
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const performFunction = (func: string) => {
    const inputValue = parseFloat(display);
    let result: number;

    switch (func) {
      case 'sin':
        result = Math.sin(inputValue * Math.PI / 180);
        break;
      case 'cos':
        result = Math.cos(inputValue * Math.PI / 180);
        break;
      case 'tan':
        result = Math.tan(inputValue * Math.PI / 180);
        break;
      case 'log':
        result = Math.log10(inputValue);
        break;
      case 'ln':
        result = Math.log(inputValue);
        break;
      case 'sqrt':
        result = Math.sqrt(inputValue);
        break;
      case '1/x':
        result = 1 / inputValue;
        break;
      case 'x²':
        result = inputValue * inputValue;
        break;
      default:
        return;
    }

    const calculation = `${func}(${inputValue}) = ${result}`;
    setHistory(prev => [calculation, ...prev.slice(0, 9)]);
    setDisplay(String(result));
    setWaitingForNewValue(true);
  };

  const buttonClass = "h-12 text-lg font-medium transition-all hover:scale-105";
  const operatorClass = `${buttonClass} bg-blue-600 hover:bg-blue-700 text-white`;
  const numberClass = `${buttonClass} bg-muted hover:bg-accent`;
  const functionClass = `${buttonClass} bg-green-600 hover:bg-green-700 text-white text-sm`;

  return (
    <div className="h-full bg-background p-4">
      <div className="max-w-4xl mx-auto h-full flex gap-4">
        {/* Calculator */}
        <Card className="flex-1 p-4">
          <div className="h-full flex flex-col">
            {/* Display */}
            <div className="bg-muted p-4 rounded mb-4 text-right">
              <div className="text-3xl font-mono font-bold break-all">
                {display}
              </div>
              {operation && previousValue !== null && (
                <div className="text-sm text-muted-foreground">
                  {previousValue} {operation}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-2 mb-4">
              <Button onClick={clear} variant="destructive" className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button onClick={clearEntry} variant="outline" className="flex-1">
                CE
              </Button>
              <Button 
                onClick={() => setShowHistory(!showHistory)} 
                variant="outline" 
                className="flex-1"
              >
                History
              </Button>
            </div>

            {/* Button Grid */}
            <div className="grid grid-cols-6 gap-2 flex-1">
              {/* Scientific Functions */}
              <Button onClick={() => performFunction('sin')} className={functionClass}>
                sin
              </Button>
              <Button onClick={() => performFunction('cos')} className={functionClass}>
                cos
              </Button>
              <Button onClick={() => performFunction('tan')} className={functionClass}>
                tan
              </Button>
              <Button onClick={() => performFunction('log')} className={functionClass}>
                log
              </Button>
              <Button onClick={() => performFunction('ln')} className={functionClass}>
                ln
              </Button>
              <Button onClick={() => performFunction('sqrt')} className={functionClass}>
                √
              </Button>

              <Button onClick={() => performFunction('1/x')} className={functionClass}>
                1/x
              </Button>
              <Button onClick={() => performFunction('x²')} className={functionClass}>
                x²
              </Button>
              <Button onClick={() => inputOperator('^')} className={operatorClass}>
                x^y
              </Button>
              <Button onClick={() => inputOperator('%')} className={operatorClass}>
                %
              </Button>
              <Button onClick={() => inputOperator('÷')} className={operatorClass}>
                ÷
              </Button>
              <Button onClick={() => inputOperator('×')} className={operatorClass}>
                ×
              </Button>

              <Button onClick={() => inputNumber('7')} className={numberClass}>
                7
              </Button>
              <Button onClick={() => inputNumber('8')} className={numberClass}>
                8
              </Button>
              <Button onClick={() => inputNumber('9')} className={numberClass}>
                9
              </Button>
              <Button onClick={() => inputOperator('-')} className={operatorClass}>
                −
              </Button>
              <Button onClick={() => inputOperator('+')} className={operatorClass}>
                +
              </Button>
              <Button onClick={performCalculation} className={`${operatorClass} row-span-2`}>
                =
              </Button>

              <Button onClick={() => inputNumber('4')} className={numberClass}>
                4
              </Button>
              <Button onClick={() => inputNumber('5')} className={numberClass}>
                5
              </Button>
              <Button onClick={() => inputNumber('6')} className={numberClass}>
                6
              </Button>
              <Button onClick={() => inputNumber('1')} className={numberClass}>
                1
              </Button>
              <Button onClick={() => inputNumber('2')} className={numberClass}>
                2
              </Button>

              <Button onClick={() => inputNumber('3')} className={numberClass}>
                3
              </Button>
              <Button onClick={() => inputNumber('0')} className={`${numberClass} col-span-2`}>
                0
              </Button>
              <Button onClick={inputDecimal} className={numberClass}>
                .
              </Button>
            </div>
          </div>
        </Card>

        {/* History Panel */}
        {showHistory && (
          <Card className="w-80 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">History</h3>
              <Button
                onClick={() => setHistory([])}
                variant="ghost"
                size="sm"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-96 overflow-auto">
              {history.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No calculations yet
                </p>
              ) : (
                history.map((calc, index) => (
                  <div
                    key={index}
                    className="p-2 bg-muted rounded text-sm font-mono cursor-pointer hover:bg-accent"
                    onClick={() => {
                      const result = calc.split(' = ')[1];
                      setDisplay(result);
                      setWaitingForNewValue(true);
                    }}
                  >
                    {calc}
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};