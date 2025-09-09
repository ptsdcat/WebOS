import { FC, useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Download, Upload, Plus, Minus, FileSpreadsheet, Grid, Calculator, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Palette, Type, BarChart3, PieChart, TrendingUp } from 'lucide-react';

interface CellData {
  value: string;
  formula?: string;
  computed?: number | string;
  style?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    textAlign?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    borderStyle?: string;
  };
  dataType?: 'text' | 'number' | 'currency' | 'percentage' | 'date';
}

interface SpreadsheetData {
  [key: string]: CellData;
}

export const Spreadsheet: FC = () => {
  const [data, setData] = useState<SpreadsheetData>(() => {
    const stored = localStorage.getItem('webos-spreadsheet-data');
    return stored ? JSON.parse(stored) : {};
  });
  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const [formulaInput, setFormulaInput] = useState('');
  const [rows, setRows] = useState(20);
  const [columns, setCols] = useState(10);
  const [fileName, setFileName] = useState('Untitled Spreadsheet');
  const [isEditing, setIsEditing] = useState(false);
  const cellRefs = useRef<{ [key: string]: HTMLInputElement }>({});

  useEffect(() => {
    localStorage.setItem('webos-spreadsheet-data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const cellData = data[selectedCell];
    setFormulaInput(cellData?.formula || cellData?.value || '');
  }, [selectedCell, data]);

  const getColumnName = (index: number): string => {
    let result = '';
    while (index >= 0) {
      result = String.fromCharCode(65 + (index % 26)) + result;
      index = Math.floor(index / 26) - 1;
    }
    return result;
  };



  const getCellId = (row: number, col: number): string => {
    return `${getColumnName(col)}${row + 1}`;
  };

  const expandRange = useCallback((range: string): string[] => {
    const cells: string[] = [];
    
    if (range.includes(':')) {
      // Handle range like A1:B3
      const [start, end] = range.split(':');
      const startCol = start.match(/[A-Z]+/)?.[0] || 'A';
      const startRow = parseInt(start.match(/\d+/)?.[0] || '1');
      const endCol = end.match(/[A-Z]+/)?.[0] || 'A';
      const endRow = parseInt(end.match(/\d+/)?.[0] || '1');
      
      const startColIndex = startCol.charCodeAt(0) - 65;
      const endColIndex = endCol.charCodeAt(0) - 65;
      
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startColIndex; col <= endColIndex; col++) {
          cells.push(`${getColumnName(col)}${row}`);
        }
      }
    } else {
      // Handle individual cells separated by commas
      cells.push(...range.split(',').map(cell => cell.trim()));
    }
    
    return cells;
  }, []);

  const parseFormula = useCallback((formula: string): number | string => {
    if (!formula.startsWith('=')) return formula;
    
    try {
      let expression = formula.substring(1);
      
      // Replace cell references with their values
      expression = expression.replace(/[A-Z]+\d+/g, (match) => {
        const cellData = data[match];
        const value = cellData?.computed ?? cellData?.value ?? '0';
        return typeof value === 'number' ? value.toString() : (parseFloat(value as string) || 0).toString();
      });
      
      // Basic math operations
      expression = expression.replace(/\s/g, '');
      
      // Handle Excel-like functions
      expression = expression.replace(/SUM\(([^)]+)\)/g, (match, range) => {
        const cells = expandRange(range);
        let sum = 0;
        cells.forEach((cell: string) => {
          const cellData = data[cell.trim()];
          const value = cellData?.computed ?? cellData?.value ?? 0;
          sum += parseFloat(value as string) || 0;
        });
        return sum.toString();
      });
      
      expression = expression.replace(/AVERAGE\(([^)]+)\)/g, (match, range) => {
        const cells = expandRange(range);
        let sum = 0;
        let count = 0;
        cells.forEach((cell: string) => {
          const cellData = data[cell.trim()];
          const value = cellData?.computed ?? cellData?.value ?? 0;
          const num = parseFloat(value as string);
          if (!isNaN(num)) {
            sum += num;
            count++;
          }
        });
        return count > 0 ? (sum / count).toString() : '0';
      });

      expression = expression.replace(/COUNT\(([^)]+)\)/g, (match, range) => {
        const cells = expandRange(range);
        let count = 0;
        cells.forEach((cell: string) => {
          const cellData = data[cell.trim()];
          const value = cellData?.computed ?? cellData?.value ?? '';
          if (value !== '') count++;
        });
        return count.toString();
      });

      expression = expression.replace(/MAX\(([^)]+)\)/g, (match, range) => {
        const cells = expandRange(range);
        let max = -Infinity;
        cells.forEach((cell: string) => {
          const cellData = data[cell.trim()];
          const value = cellData?.computed ?? cellData?.value ?? 0;
          const num = parseFloat(value as string);
          if (!isNaN(num)) max = Math.max(max, num);
        });
        return max === -Infinity ? '0' : max.toString();
      });

      expression = expression.replace(/MIN\(([^)]+)\)/g, (match, range) => {
        const cells = expandRange(range);
        let min = Infinity;
        cells.forEach((cell: string) => {
          const cellData = data[cell.trim()];
          const value = cellData?.computed ?? cellData?.value ?? 0;
          const num = parseFloat(value as string);
          if (!isNaN(num)) min = Math.min(min, num);
        });
        return min === Infinity ? '0' : min.toString();
      });
      
      // Evaluate the expression safely
      const result = Function('"use strict"; return (' + expression + ')')();
      return typeof result === 'number' ? Math.round(result * 100) / 100 : result;
    } catch (error) {
      return '#ERROR';
    }
  }, [expandRange, data]);

  const updateCell = useCallback((cellId: string, value: string) => {
    setData(prev => {
      const newData = { ...prev };
      const isFormula = value.startsWith('=');
      
      newData[cellId] = {
        value,
        formula: isFormula ? value : undefined,
        computed: isFormula ? parseFormula(value) : value,
      };
      
      return newData;
    });
  }, [parseFormula]);

  const handleCellClick = (cellId: string) => {
    setSelectedCell(cellId);
    setIsEditing(false);
  };

  const handleCellDoubleClick = (cellId: string) => {
    setSelectedCell(cellId);
    setIsEditing(true);
    setTimeout(() => {
      const input = cellRefs.current[cellId];
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  };

  const handleFormulaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCell(selectedCell, formulaInput);
    setIsEditing(false);
  };

  const addRow = () => setRows(prev => prev + 5);
  const addColumn = () => setCols(prev => prev + 2);

  const exportToCSV = () => {
    let csv = '';
    for (let row = 0; row < rows; row++) {
      const rowData: string[] = [];
      for (let col = 0; col < columns; col++) {
        const cellId = getCellId(row, col);
        const cellData = data[cellId];
        const value = cellData?.computed ?? cellData?.value ?? '';
        rowData.push(`"${value.toString().replace(/"/g, '""')}"`);
      }
      csv += rowData.join(',') + '\n';
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveSpreadsheet = () => {
    const spreadsheetData = {
      fileName,
      data,
      rows,
      columns,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(spreadsheetData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.wss`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (confirm('Clear all data? This cannot be undone.')) {
      setData({});
      setSelectedCell('A1');
      setFormulaInput('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          <Input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-48 h-8"
            placeholder="Spreadsheet name"
          />
        </div>
        
        <div className="h-6 w-px bg-border mx-2" />
        
        <Button variant="outline" size="sm" onClick={saveSpreadsheet}>
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-1" />
          CSV
        </Button>
        <Button variant="outline" size="sm" onClick={clearAll}>
          Clear All
        </Button>
        
        <div className="h-6 w-px bg-border mx-2" />
        
        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus className="w-4 h-4 mr-1" />
          Rows
        </Button>
        <Button variant="outline" size="sm" onClick={addColumn}>
          <Plus className="w-4 h-4 mr-1" />
          Cols
        </Button>
      </div>

      {/* Formula Bar */}
      <div className="flex items-center gap-2 p-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium w-12">{selectedCell}</span>
          <Calculator className="w-4 h-4" />
        </div>
        <form onSubmit={handleFormulaSubmit} className="flex-1">
          <Input
            value={formulaInput}
            onChange={(e) => setFormulaInput(e.target.value)}
            placeholder="Enter value or formula (=A1+B1)"
            className="w-full"
          />
        </form>
      </div>

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto">
        <div className="inline-block min-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="w-12 h-8 border border-border bg-muted/50 text-xs font-medium"></th>
                {Array.from({ length: columns }, (_, col) => (
                  <th key={col} className="w-24 h-8 border border-border bg-muted/50 text-xs font-medium">
                    {getColumnName(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }, (_, row) => (
                <tr key={row}>
                  <td className="w-12 h-8 border border-border bg-muted/50 text-xs font-medium text-center">
                    {row + 1}
                  </td>
                  {Array.from({ length: columns }, (_, col) => {
                    const cellId = getCellId(row, col);
                    const cellData = data[cellId];
                    const displayValue = cellData?.computed ?? cellData?.value ?? '';
                    const isSelected = selectedCell === cellId;
                    
                    return (
                      <td key={col} className="w-24 h-8 border border-border p-0">
                        <input
                          ref={(el) => {
                            if (el) cellRefs.current[cellId] = el;
                          }}
                          value={isEditing && isSelected ? formulaInput : displayValue.toString()}
                          onChange={(e) => {
                            if (isEditing && isSelected) {
                              setFormulaInput(e.target.value);
                            }
                          }}
                          onFocus={() => handleCellClick(cellId)}
                          onDoubleClick={() => handleCellDoubleClick(cellId)}
                          onBlur={() => {
                            if (isEditing && isSelected) {
                              updateCell(cellId, formulaInput);
                              setIsEditing(false);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateCell(cellId, formulaInput);
                              setIsEditing(false);
                              
                              // Move to next row
                              const nextRow = row + 1;
                              if (nextRow < rows) {
                                const nextCellId = getCellId(nextRow, col);
                                setSelectedCell(nextCellId);
                              }
                            } else if (e.key === 'Tab') {
                              e.preventDefault();
                              updateCell(cellId, formulaInput);
                              setIsEditing(false);
                              
                              // Move to next column
                              const nextCol = col + 1;
                              if (nextCol < columns) {
                                const nextCellId = getCellId(row, nextCol);
                                setSelectedCell(nextCellId);
                              }
                            } else if (e.key === 'Escape') {
                              setIsEditing(false);
                              setFormulaInput(cellData?.formula || cellData?.value || '');
                            }
                          }}
                          className={`w-full h-full px-1 text-xs border-0 outline-0 ${
                            isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-transparent'
                          } ${cellData?.formula ? 'text-green-700' : ''}`}
                          readOnly={!isEditing || !isSelected}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 border-t bg-muted/30 text-xs">
        <div className="flex items-center gap-4">
          <span>Cells: {Object.keys(data).length}</span>
          <span>Size: {columns} × {rows}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Selected: {selectedCell}</span>
          {data[selectedCell]?.formula && (
            <span className="text-green-700">Formula: {data[selectedCell].formula}</span>
          )}
        </div>
      </div>
    </div>
  );
};