import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';

export const Calculator: FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      case '%':
        return firstValue % secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    if (previousValue !== null && operation) {
      const inputValue = parseFloat(display);
      const newValue = calculate(previousValue, inputValue, operation);
      
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const CalcButton: FC<{ 
    onClick: () => void; 
    className?: string; 
    children: React.ReactNode;
    span?: number;
  }> = ({ onClick, className = '', children, span = 1 }) => (
    <Button
      onClick={onClick}
      className={`h-12 text-lg font-semibold transition-colors ${className} ${
        span === 2 ? 'col-span-2' : ''
      }`}
      variant="outline"
    >
      {children}
    </Button>
  );

  return (
    <div className="h-full flex flex-col max-w-xs mx-auto">
      {/* Display */}
      <div className="mb-4 p-4 bg-gray-900 text-white text-right text-2xl font-mono rounded-lg border">
        <div className="truncate" title={display}>
          {display}
        </div>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        {/* Row 1 */}
        <CalcButton 
          onClick={clear}
          className="bg-red-100 hover:bg-red-200 text-red-700"
        >
          C
        </CalcButton>
        <CalcButton 
          onClick={backspace}
          className="bg-gray-100 hover:bg-gray-200"
        >
          ⌫
        </CalcButton>
        <CalcButton 
          onClick={() => performOperation('%')}
          className="bg-blue-100 hover:bg-blue-200 text-blue-700"
        >
          %
        </CalcButton>
        <CalcButton 
          onClick={() => performOperation('/')}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          ÷
        </CalcButton>

        {/* Row 2 */}
        <CalcButton onClick={() => inputNumber('7')}>7</CalcButton>
        <CalcButton onClick={() => inputNumber('8')}>8</CalcButton>
        <CalcButton onClick={() => inputNumber('9')}>9</CalcButton>
        <CalcButton 
          onClick={() => performOperation('*')}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          ×
        </CalcButton>

        {/* Row 3 */}
        <CalcButton onClick={() => inputNumber('4')}>4</CalcButton>
        <CalcButton onClick={() => inputNumber('5')}>5</CalcButton>
        <CalcButton onClick={() => inputNumber('6')}>6</CalcButton>
        <CalcButton 
          onClick={() => performOperation('-')}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          −
        </CalcButton>

        {/* Row 4 */}
        <CalcButton onClick={() => inputNumber('1')}>1</CalcButton>
        <CalcButton onClick={() => inputNumber('2')}>2</CalcButton>
        <CalcButton onClick={() => inputNumber('3')}>3</CalcButton>
        <CalcButton 
          onClick={() => performOperation('+')}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          +
        </CalcButton>

        {/* Row 5 */}
        <CalcButton onClick={() => inputNumber('0')} span={2}>0</CalcButton>
        <CalcButton onClick={inputDecimal}>.</CalcButton>
        <CalcButton 
          onClick={performCalculation}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          =
        </CalcButton>
      </div>
    </div>
  );
};
