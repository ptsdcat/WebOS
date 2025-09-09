import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Minus, Square } from 'lucide-react';

interface TerminalLine {
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

interface BumblebeeTerminalProps {
  onClose: () => void;
}

export const BumblebeeTerminal: FC<BumblebeeTerminalProps> = ({ onClose }) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      type: 'output',
      content: 'Welcome to Bumblebee OS Terminal',
      timestamp: new Date()
    },
    {
      type: 'output',
      content: 'Ubuntu 22.04 LTS - GNOME Desktop Environment',
      timestamp: new Date()
    },
    {
      type: 'output',
      content: 'Type "help" for available commands',
      timestamp: new Date()
    }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    const commandLine: TerminalLine = {
      type: 'command',
      content: `ubuntu@bumblebee:~$ ${trimmedCmd}`,
      timestamp: new Date()
    };

    let output = '';

    if (trimmedCmd === 'help') {
      output = `Bumblebee OS Terminal Commands:
=================================
help              - Show this help message
clear             - Clear terminal
ls                - List directory contents
pwd               - Print working directory
whoami            - Show current user
date              - Show current date and time
uname -a          - Show system information
neofetch          - Show system info with logo
htop              - Show system monitor
ps aux            - Show running processes
apt list          - Show available packages
snap list         - Show installed snap packages
firefox           - Launch Firefox browser
code              - Launch VS Code
nautilus          - Launch file manager
gnome-settings    - Open system settings
systemctl status  - Show system services
df -h             - Show disk usage
free -h           - Show memory usage
ip addr           - Show network interfaces
ping google.com   - Test network connectivity
exit              - Close terminal`;
    } else if (trimmedCmd === 'clear') {
      setLines([]);
      return;
    } else if (trimmedCmd === 'ls') {
      output = `Desktop    Documents    Downloads    Music    Pictures    Videos
Public     Templates    snap         .bashrc  .profile     .cache`;
    } else if (trimmedCmd === 'pwd') {
      output = '/home/ubuntu';
    } else if (trimmedCmd === 'whoami') {
      output = 'ubuntu';
    } else if (trimmedCmd === 'date') {
      output = new Date().toString();
    } else if (trimmedCmd === 'uname -a') {
      output = 'Linux bumblebee 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux';
    } else if (trimmedCmd === 'neofetch') {
      output = `            .-/+oossssoo+/-.               ubuntu@bumblebee
        \`:+ssssssssssssssssss+:\`           ------------------
      -+ssssssssssssssssssyyssss+-         OS: Ubuntu 22.04.3 LTS x86_64
    .ossssssssssssssssssdMMMNysssso.       Host: Bumblebee Virtual Machine
   /ssssssssssshdmmNNmmyNMMMMhssssss/      Kernel: 5.15.0-91-generic
  +ssssssssshmydMMMMMMMNddddyssssssss+     Uptime: 2 hours, 15 mins
 /sssssssshNMMMyhhyyyyhmNMMMNhssssssss/    Packages: 1834 (dpkg), 63 (snap)
.ssssssssdMMMNhsssssssssshNMMMdssssssss.   Shell: bash 5.1.16
+sssshhhyNMMNyssssssssssssyNMMMysssssss+   Resolution: 1920x1080
ossyNMMMNyMMhsssssssssssssshmmmhssssssso   DE: GNOME 42.9
ossyNMMMNyMMhsssssssssssssshmmmhssssssso   WM: Mutter
+sssshhhyNMMNyssssssssssssyNMMMysssssss+   Terminal: gnome-terminal
.ssssssssdMMMNhsssssssssshNMMMdssssssss.   CPU: Intel i5-8265U (4) @ 1.600GHz
 /sssssssshNMMMyhhyyyyhdNMMMNhssssssss/    Memory: 2048MiB / 8192MiB`;
    } else if (trimmedCmd === 'exit') {
      onClose();
      return;
    } else {
      output = `bash: ${trimmedCmd}: command not found
Try 'help' for available commands`;
    }

    const outputLine: TerminalLine = {
      type: output.includes('command not found') ? 'error' : 'output',
      content: output,
      timestamp: new Date()
    };

    setLines(prev => [...prev, commandLine, outputLine]);
    setCommandHistory(prev => [...prev, trimmedCmd]);
    setCurrentCommand('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };

  return (
    <div className="bg-black rounded-lg shadow-2xl overflow-hidden border border-orange-500/20">
      <div className="bg-orange-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-white font-medium">Bumblebee Terminal</span>
        <Button onClick={onClose} size="sm" variant="ghost" className="text-white hover:bg-orange-700">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div 
        ref={terminalRef}
        className="bg-black text-green-400 p-4 h-96 overflow-y-auto font-mono text-sm"
      >
        {lines.map((line, index) => (
          <div key={index} className="mb-1">
            <span className="text-gray-500 text-xs mr-2">
              {formatTime(line.timestamp)}
            </span>
            <span className={
              line.type === 'command' ? 'text-yellow-400' :
              line.type === 'error' ? 'text-red-400' : 'text-green-400'
            }>
              {line.content.split('\n').map((subLine, subIndex) => (
                <div key={subIndex}>{subLine}</div>
              ))}
            </span>
          </div>
        ))}
        
        <div className="flex items-center">
          <span className="text-yellow-400 mr-2">
            {formatTime(new Date())} ubuntu@bumblebee:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent text-green-400 outline-none flex-1 font-mono"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};