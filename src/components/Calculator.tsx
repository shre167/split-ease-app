import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calculator, X, Copy } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const FloatingCalculator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // Keyboard support
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      
      if (key >= '0' && key <= '9') {
        inputDigit(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (key === '+') {
        performOperation('+');
      } else if (key === '-') {
        performOperation('-');
      } else if (key === '*') {
        performOperation('×');
      } else if (key === '/') {
        performOperation('÷');
      } else if (key === 'Enter' || key === '=') {
        handleEquals();
      } else if (key === 'Escape') {
        clearAll();
      } else if (key === 'Backspace') {
        // Clear last digit
        if (display.length > 1) {
          setDisplay(display.slice(0, -1));
        } else {
          setDisplay('0');
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  const clearAll = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
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
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    if (!previousValue || !operation) return;

    const inputValue = parseFloat(display);
    const newValue = calculate(previousValue, inputValue, operation);
    setDisplay(String(newValue));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const handlePercentage = () => {
    const currentValue = parseFloat(display);
    const newValue = currentValue / 100;
    setDisplay(String(newValue));
  };

  const handlePlusMinus = () => {
    const currentValue = parseFloat(display);
    const newValue = -currentValue;
    setDisplay(String(newValue));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(display);
      // You could add a toast notification here if you want
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const buttonClass = "w-12 h-12 rounded-full text-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95";
  const numberButtonClass = `${buttonClass} bg-gray-100 hover:bg-gray-200 text-gray-800`;
  const operatorButtonClass = `${buttonClass} bg-orange-500 hover:bg-orange-600 text-white`;
  const functionButtonClass = `${buttonClass} bg-gray-200 hover:bg-gray-300 text-gray-800`;

  return (
    <>
      {/* Floating Calculator Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(true)}
              className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 hover:border-slate-300/80 text-slate-600 hover:text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              <Calculator className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-slate-800 text-white border-0">
            <p className="text-sm font-medium">Calculator</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Calculator Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex justify-between items-center">
              <h2 className="text-white font-semibold text-lg">Calculator</h2>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Display */}
            <div className="p-6 bg-gray-50">
              <div className="text-right">
                <div className="text-gray-500 text-sm h-6">
                  {previousValue !== null && operation && `${previousValue} ${operation}`}
                </div>
                <div className="text-3xl font-bold text-gray-800 min-h-[2.5rem] flex items-center justify-end gap-2">
                  <span>{display}</span>
                  <Button
                    onClick={copyToClipboard}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Calculator Buttons */}
            <div className="p-4 bg-white">
              <div className="grid grid-cols-4 gap-3">
                {/* First Row */}
                <Button onClick={clearAll} className={functionButtonClass}>
                  AC
                </Button>
                <Button onClick={handlePlusMinus} className={functionButtonClass}>
                  ±
                </Button>
                <Button onClick={handlePercentage} className={functionButtonClass}>
                  %
                </Button>
                <Button onClick={() => performOperation('÷')} className={operatorButtonClass}>
                  ÷
                </Button>

                {/* Second Row */}
                <Button onClick={() => inputDigit('7')} className={numberButtonClass}>
                  7
                </Button>
                <Button onClick={() => inputDigit('8')} className={numberButtonClass}>
                  8
                </Button>
                <Button onClick={() => inputDigit('9')} className={numberButtonClass}>
                  9
                </Button>
                <Button onClick={() => performOperation('×')} className={operatorButtonClass}>
                  ×
                </Button>

                {/* Third Row */}
                <Button onClick={() => inputDigit('4')} className={numberButtonClass}>
                  4
                </Button>
                <Button onClick={() => inputDigit('5')} className={numberButtonClass}>
                  5
                </Button>
                <Button onClick={() => inputDigit('6')} className={numberButtonClass}>
                  6
                </Button>
                <Button onClick={() => performOperation('-')} className={operatorButtonClass}>
                  -
                </Button>

                {/* Fourth Row */}
                <Button onClick={() => inputDigit('1')} className={numberButtonClass}>
                  1
                </Button>
                <Button onClick={() => inputDigit('2')} className={numberButtonClass}>
                  2
                </Button>
                <Button onClick={() => inputDigit('3')} className={numberButtonClass}>
                  3
                </Button>
                <Button onClick={() => performOperation('+')} className={operatorButtonClass}>
                  +
                </Button>

                {/* Fifth Row */}
                <Button onClick={() => inputDigit('0')} className={`${numberButtonClass} col-span-2 w-full`}>
                  0
                </Button>
                <Button onClick={inputDecimal} className={numberButtonClass}>
                  .
                </Button>
                <Button onClick={handleEquals} className={operatorButtonClass}>
                  =
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingCalculator; 