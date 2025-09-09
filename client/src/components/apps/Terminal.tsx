import { FC, useState, useRef, useEffect } from 'react';

interface TerminalLine {
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export const Terminal: FC = () => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      type: 'output',
      content: 'Arch Linux 6.6.8-arch1-1 (TTY1)',
      timestamp: new Date()
    },
    {
      type: 'output',
      content: '',
      timestamp: new Date()
    },
    {
      type: 'output',
      content: 'arch@desktop login: user',
      timestamp: new Date()
    },
    {
      type: 'output',
      content: 'Password: ********',
      timestamp: new Date()
    },
    {
      type: 'output',
      content: 'Last login: ' + new Date().toLocaleString(),
      timestamp: new Date()
    },
    {
      type: 'output',
      content: '',
      timestamp: new Date()
    }
  ]);
  
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const handleCommand = (command: string) => {
    const commandLine: TerminalLine = {
      type: 'command',
      content: `[user@webos ~]$ ${command}`,
      timestamp: new Date()
    };

    setLines(prev => [...prev, commandLine]);

    let output = '';
    const cmd = command.toLowerCase().trim();
    const args = command.trim().split(' ');

    if (cmd === 'help') {
      output = `WebOS Terminal v4.0 - Advanced Command Interface
==========================================
SYSTEM COMMANDS:
  help              - Show this help message
  clear             - Clear the terminal
  pwd               - Print working directory
  whoami            - Show current user
  date              - Show current date and time
  uptime            - Show system uptime
  uname -a          - Show system information
  history           - Show command history
  wiki              - Show WebOS installation wiki and command reference
  serve-website     - Start local web server and open HTML website
  exit              - Close terminal

FILE SYSTEM:
  ls [options]      - List directory contents (-la for detailed)
  cd [dir]          - Change directory
  mkdir [dir]       - Create directory
  rmdir [dir]       - Remove directory
  touch [file]      - Create file
  rm [file]         - Remove file
  cat [file]        - Display file contents
  nano [file]       - Edit file with nano
  vim [file]        - Edit file with vim
  find [pattern]    - Find files/directories
  grep [pattern]    - Search text patterns
  chmod [mode]      - Change file permissions
  chown [user]      - Change file ownership

SYSTEM MANAGEMENT:
  ps                - Show running processes
  top               - Show system monitor
  htop              - Enhanced system monitor
  kill [pid]        - Kill process by ID
  killall [name]    - Kill processes by name
  systemctl [cmd]   - Control system services
  mount [device]    - Mount filesystem
  umount [device]   - Unmount filesystem
  df -h             - Show disk usage
  free -h           - Show memory usage
  lscpu             - Show CPU information
  lsblk             - Show block devices

NETWORK COMMANDS:
  ping [host]       - Ping network host
  wget [url]        - Download file from URL
  curl [url]        - Transfer data from/to servers
  ssh [user@host]   - Connect via SSH
  scp [src] [dst]   - Secure copy files
  netstat           - Show network connections
  ip addr           - Show network interfaces
  ifconfig          - Configure network interface

DEVELOPMENT TOOLS:
  git [command]     - Git version control
  npm [command]     - Node package manager
  node [file]       - Run Node.js file
  python [file]     - Run Python script
  gcc [file]        - Compile C programs
  make              - Build projects
  docker [cmd]      - Container management
  code [file]       - Launch WebOS IDE

PACKAGE MANAGEMENT:
  pacman [options]  - Arch Linux package manager
  yay [package]     - AUR helper
  pip [package]     - Python package installer
  npm install [pkg] - Install Node.js packages

SYSTEM INSTALLATION:
  install-webos     - Install WebOS desktop environment
  install-arch      - Install Arch Linux base system
  install-driver    - Install hardware drivers
  update-system     - Update all packages

UTILITIES:
  echo [text]       - Display text
  man [command]     - Show manual pages
  which [command]   - Locate command
  alias [name=cmd]  - Create command alias
  env               - Show environment variables
  export [var=val]  - Set environment variable
  crontab           - Schedule tasks
  tar [options]     - Archive files
  zip/unzip         - Compress/extract files

APPLICATIONS:
  pacman-game       - Launch Pac-Man arcade game
  emulator          - Launch retro gaming emulator
  videotube         - Launch VideoTube platform
  browser           - Launch web browser
  calculator        - Launch calculator
  settings          - Open system settings

Type 'install-webos --help' for WebOS installation guide.`;
    } else if (cmd === 'clear') {
      setLines([]);
      setCommandHistory([]);
      return;
    } else if (cmd === 'ls' || cmd === 'ls -la') {
      output = `total 64
drwxr-xr-x  8 user user 4096 Dec  2 23:10 .
drwxr-xr-x  3 root root 4096 Dec  2 22:55 ..
-rw-------  1 user user  220 Dec  2 22:55 .bash_logout
-rw-------  1 user user 3771 Dec  2 22:55 .bashrc
drwx------  2 user user 4096 Dec  2 23:05 .cache
drwxr-xr-x  3 user user 4096 Dec  2 23:05 .config
drwxr-xr-x  2 user user 4096 Dec  2 23:05 Desktop
drwxr-xr-x  2 user user 4096 Dec  2 23:05 Documents
drwxr-xr-x  2 user user 4096 Dec  2 23:05 Downloads
drwxr-xr-x  2 user user 4096 Dec  2 23:05 Pictures
-rw-------  1 user user  807 Dec  2 22:55 .profile
drwxr-xr-x  2 user user 4096 Dec  2 23:05 Videos`;
    } else if (cmd === 'pwd') {
      output = `/home/user`;
    } else if (cmd.startsWith('cd ')) {
      const dir = args[1] || '~';
      if (dir === '..') {
        output = `Changed to parent directory`;
      } else if (dir === '~' || dir === '/home/user') {
        output = `Changed to home directory`;
      } else {
        output = `bash: cd: ${dir}: No such file or directory`;
      }
    } else if (cmd.startsWith('mkdir ')) {
      output = args[1] ? `mkdir: created directory '${args[1]}'` : 'mkdir: missing operand';
    } else if (cmd.startsWith('touch ')) {
      output = args[1] ? `touch: created file '${args[1]}'` : 'touch: missing file operand';
    } else if (cmd.startsWith('cat ')) {
      const file = args[1];
      if (file === '.bashrc') {
        output = `# ~/.bashrc: executed by bash(1) for non-login shells
export PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin:/sbin
export PS1='[\\u@\\h \\W]\\$ '
export EDITOR=nano
export BROWSER=firefox

# Aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias grep='grep --color=auto'
alias ..='cd ..'
alias ...='cd ../..'

# WebOS specific
export WEBOS_VERSION="3.0"
export WEBOS_HOME="/opt/webos"`;
      } else if (file === '.profile') {
        output = `# ~/.profile: executed by the command interpreter for login shells
export PATH="$HOME/bin:$PATH"
export LANG=en_US.UTF-8
export TERM=xterm-256color

# Load .bashrc if it exists
if [ -f "$HOME/.bashrc" ]; then
    . "$HOME/.bashrc"
fi`;
      } else {
        output = file ? `cat: ${file}: No such file or directory` : 'cat: missing file operand';
      }
    } else if (cmd === 'date') {
      output = new Date().toString();
    } else if (cmd === 'whoami') {
      output = `user`;
    } else if (cmd === 'uptime') {
      const now = new Date();
      const uptime = Math.floor((Date.now() - (Date.now() - 2 * 24 * 60 * 60 * 1000)) / 1000);
      output = `${now.toTimeString().split(' ')[0]} up 2 days, 14:23, 1 user, load average: 0.08, 0.03, 0.01`;
    } else if (cmd === 'ps' || cmd === 'ps aux') {
      output = `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
user      1234  0.1  2.3  45672  8920 ?        S    Dec02   0:03 webos-kernel
user      1235  0.5  4.1  78432 15680 ?        S    Dec02   0:12 webos-desktop  
user      1236  0.0  0.8  12340  3456 pts/0    R    23:05   0:00 bash
user      1237  0.2  3.2  56789 12345 ?        S    23:03   0:01 browser
user      1238  0.1  1.5  23456  5678 ?        S    23:04   0:00 package-manager
user      1239  0.3  2.1  34567  8901 ?        S    23:06   0:01 office-suite`;
    } else if (cmd === 'top') {
      output = `top - ${new Date().toTimeString().split(' ')[0]} up 2 days, 14:23, 1 user, load average: 0.08, 0.03, 0.01
Tasks: 6 total, 1 running, 5 sleeping, 0 stopped, 0 zombie
%Cpu(s): 2.1 us, 0.9 sy, 0.0 ni, 96.8 id, 0.2 wa, 0.0 hi, 0.0 si, 0.0 st
MiB Mem: 7892.2 total, 3456.1 free, 2134.5 used, 2301.6 buff/cache

PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
1234 user      20   0   45672   8920   4560 S   0.3   0.1   0:03.12 webos-kernel
1235 user      20   0   78432  15680   8234 S   0.7   0.2   0:12.45 webos-desktop
1239 user      20   0   34567   8901   4321 S   0.4   0.1   0:01.23 office-suite`;
    } else if (cmd === 'install-webos' || cmd === 'install-webos --help') {
      if (args.includes('--help')) {
        output = `WebOS Installation Guide
========================

OVERVIEW:
WebOS is a modern desktop environment built with web technologies.
This installer will set up the complete WebOS ecosystem on your system.

INSTALLATION COMMANDS:
  install-webos              - Start interactive installation
  install-webos --quick      - Quick installation with defaults
  install-webos --custom     - Custom installation with options
  install-webos --check      - Check system requirements
  install-webos --remove     - Uninstall WebOS

SYSTEM REQUIREMENTS:
- RAM: 4GB minimum, 8GB recommended
- Storage: 20GB free space minimum
- Network: Internet connection required
- Graphics: Hardware acceleration supported

INSTALLATION PROCESS:
1. System compatibility check
2. Download WebOS components
3. Configure desktop environment
4. Install applications and services
5. User account setup
6. Final configuration

Use 'install-webos' to begin installation.`;
      } else if (args.includes('--check')) {
        output = `System Requirements Check
========================
✓ RAM: 8GB available (4GB minimum required)
✓ Storage: 45GB free space (20GB minimum required)  
✓ Network: Connected to internet
✓ Graphics: Hardware acceleration available
✓ CPU: x86_64 architecture supported

System Status: READY FOR INSTALLATION
Run 'install-webos' to proceed with installation.`;
      } else if (args.includes('--remove')) {
        output = `WebOS Removal Process
====================
WARNING: This will remove all WebOS components and user data.

Steps:
1. Stop all WebOS services
2. Remove desktop environment
3. Clean application data
4. Remove system files
5. Restore original configuration

Type 'install-webos --remove --confirm' to proceed.
This action cannot be undone.`;
      } else if (args.includes('--quick')) {
        output = `Starting WebOS Quick Installation...

[1/8] Checking system requirements... ✓
[2/8] Downloading WebOS core (450MB)... ✓
[3/8] Installing desktop environment... ✓
[4/8] Setting up applications... ✓
[5/8] Configuring services... ✓
[6/8] Creating user profile... ✓
[7/8] Applying desktop theme... ✓
[8/8] Starting WebOS desktop... ✓

Installation completed successfully!
WebOS v4.0 is now ready.

Installed Components:
- WebOS Desktop Environment
- Application Suite (Browser, Office, Games)
- Development Tools (IDE, Terminal, Package Manager)
- Media Center (VideoTube, Image Viewer, Audio Player)
- System Utilities (Settings, File Manager, Task Manager)

Restart required to complete installation.
Type 'reboot' or restart the system manually.`;
      } else {
        output = `WebOS Interactive Installation
============================

Welcome to WebOS v4.0 Installation!

This installer will guide you through setting up WebOS desktop environment.
The installation includes:
- Modern desktop interface with dynamic theming
- Comprehensive application suite
- Development environment with IDE and tools  
- Media and entertainment platform
- System management utilities

Choose installation type:
1. Quick Install (recommended settings)
2. Custom Install (advanced options)
3. Check Requirements
4. Exit

Enter choice [1-4]: 1

Starting installation...
Would you like to continue? (y/n)`;
      }
    } else if (cmd === 'install-arch') {
      output = `Arch Linux Base System Installation
===================================

This will install a minimal Arch Linux system.

Steps:
1. Partition disk
2. Format filesystems  
3. Mount partitions
4. Install base packages
5. Configure system
6. Install bootloader

WARNING: This will erase all data on the target disk.
Use 'install-arch --help' for detailed instructions.`;
    } else if (cmd === 'update-system') {
      output = `System Update Process
===================

Updating package database...
Checking for available updates...

Available updates:
- linux: 6.6.8 → 6.6.9 (kernel update)
- webos-desktop: 4.0.1 → 4.0.2 (bug fixes)
- browser: 1.5.2 → 1.5.3 (security update)
- office-suite: 2.1.0 → 2.1.1 (feature update)

Total download size: 245MB
Total install size: 1.2GB

Proceed with update? (y/n)`;
    } else if (cmd.startsWith('uname')) {
      if (args.includes('-a')) {
        output = `Linux webos-desktop 6.6.8-arch1-1 #1 SMP PREEMPT_DYNAMIC Mon, 04 Dec 2023 x86_64 GNU/Linux`;
      } else {
        output = `Linux`;
      }
    } else if (cmd === 'free' || cmd === 'free -h') {
      output = `              total        used        free      shared  buff/cache   available
Mem:           7.7G        2.1G        3.4G        234M        2.3G        5.2G
Swap:          2.0G          0B        2.0G`;
    } else if (cmd === 'df' || cmd === 'df -h') {
      output = `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   25G   23G  53% /
/dev/sda2       200G   45G  145G  24% /home
tmpfs           3.9G     0  3.9G   0% /dev/shm
tmpfs           3.9G  1.2M  3.9G   1% /run`;
    } else if (cmd === 'lscpu') {
      output = `Architecture:                    x86_64
CPU op-mode(s):                  32-bit, 64-bit
Byte Order:                      Little Endian
CPU(s):                          8
Thread(s) per core:              2
Core(s) per socket:              4
Socket(s):                       1
Model name:                      Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz
CPU family:                      6
Model:                           165
Stepping:                        5
CPU MHz:                         3800.000
BogoMIPS:                        7600.00
Virtualization:                  VT-x
L1d cache:                       128 KiB
L1i cache:                       128 KiB
L2 cache:                        1 MiB
L3 cache:                        16 MiB`;
    } else if (cmd === 'lsblk') {
      output = `NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sda      8:0    0   250G  0 disk 
├─sda1   8:1    0    50G  0 part /
├─sda2   8:2    0   200G  0 part /home
└─sda3   8:3    0     2G  0 part [SWAP]
sr0     11:0    1  1024M  0 rom`;
    } else if (cmd.startsWith('systemctl ')) {
      const service = args[2] || 'unknown';
      const action = args[1] || 'status';
      if (action === 'status') {
        output = `● ${service}.service - ${service} service
     Loaded: loaded (/usr/lib/systemd/system/${service}.service; enabled; vendor preset: enabled)
     Active: active (running) since Mon 2023-12-04 22:30:15 UTC; 2h 15min ago
   Main PID: 1234 (${service})
      Tasks: 3 (limit: 4915)
     Memory: 45.2M
        CPU: 1min 23.456s
     CGroup: /system.slice/${service}.service
             └─1234 /usr/bin/${service}`;
      } else {
        output = `${action}ing ${service} service...`;
      }
    } else if (cmd.startsWith('pacman ')) {
      const operation = args[1];
      if (operation === '-Syu') {
        output = `:: Synchronizing package databases...
 core                     130.6 KiB   890 KiB/s 00:00
 extra                   1645.9 KiB  2.15 MiB/s 00:01
 community                  6.9 MiB  3.42 MiB/s 00:02
:: Starting full system upgrade...
resolving dependencies...
looking for conflicting packages...

Packages (15) glibc-2.38-6  linux-6.6.8.arch1-1  webos-desktop-4.0.2-1

Total Download Size:   245.67 MiB
Total Installed Size: 1205.43 MiB

:: Proceed with installation? [Y/n]`;
      } else if (operation === '-S') {
        const package_name = args[2] || 'package';
        output = `resolving dependencies...
looking for conflicting packages...

Packages (1) ${package_name}-1.0.0-1

Total Download Size:   5.67 MiB
Total Installed Size: 23.45 MiB

:: Proceed with installation? [Y/n]`;
      } else if (operation === '-Q') {
        output = `linux 6.6.8.arch1-1
webos-desktop 4.0.1-1
browser 1.5.2-1
office-suite 2.1.0-1
package-manager 1.2.1-1
terminal 1.8.0-1
calculator 1.0.5-1
settings 2.3.1-1`;
      } else {
        output = `usage:  pacman <operation> [...]
operations:
    pacman -S <pkg>      install package
    pacman -R <pkg>      remove package  
    pacman -Syu          upgrade system
    pacman -Q            list installed packages
    pacman -Ss <query>   search packages`;
      }
    } else if (cmd.startsWith('git ')) {
      const gitCmd = args[1];
      if (gitCmd === 'status') {
        output = `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes)

        modified:   README.md
        modified:   src/terminal.tsx

no changes added to commit (use "git add" or "git commit -a")`;
      } else if (gitCmd === 'log') {
        output = `commit a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0 (HEAD -> main)
Author: WebOS Developer <dev@webos.org>
Date:   Mon Dec 4 23:15:32 2023 +0000

    Enhanced terminal with comprehensive command support

commit b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1
Author: WebOS Developer <dev@webos.org>
Date:   Sun Dec 3 18:45:12 2023 +0000

    Added WebOS installation system`;
      } else {
        output = `git version 2.42.0
usage: git [--version] [--help] [-C <path>] [-c <name>=<value>]
           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]
           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]
           <command> [<args>]`;
      }
    } else if (cmd.startsWith('npm ')) {
      const npmCmd = args[1];
      if (npmCmd === 'install') {
        const package_name = args[2] || 'package';
        output = `npm notice Beginning October 4, 2021, all connections to the npm registry
npm notice must use TLS 1.2 or higher.
npm WARN deprecated ${package_name}@1.0.0: This package is deprecated

added 1 package, and audited 245 packages in 2s

24 packages are looking for funding
  run \`npm fund\` for details

found 0 vulnerabilities`;
      } else if (npmCmd === 'list') {
        output = `webos-desktop@4.0.1 /opt/webos
├── react@18.2.0
├── typescript@5.2.2
├── vite@4.5.0
├── tailwindcss@3.3.5
└── lucide-react@0.294.0`;
      } else {
        output = `npm@10.2.3 /usr/bin/npm

Usage: npm <command>

Most commonly used commands:
  install     Install packages
  list        List installed packages
  run         Run scripts
  start       Start application
  test        Run tests
  update      Update packages`;
      }
    } else if (cmd.startsWith('docker ')) {
      const dockerCmd = args[1];
      if (dockerCmd === 'ps') {
        output = `CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS     NAMES
a1b2c3d4e5f6   webos:latest   "/bin/bash"              2 hours ago     Up 2 hours               webos-dev
b2c3d4e5f6g7   nginx:alpine   "/docker-entrypoint.…"   3 hours ago     Up 3 hours     80/tcp    webserver`;
      } else if (dockerCmd === 'images') {
        output = `REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
webos        latest    a1b2c3d4e5f6   2 hours ago     1.2GB
nginx        alpine    b2c3d4e5f6g7   3 days ago      23.5MB
ubuntu       22.04     c3d4e5f6g7h8   1 week ago      77.8MB`;
      } else {
        output = `Docker version 24.0.7, build afdd53b

Usage:  docker [OPTIONS] COMMAND

Management Commands:
  container   Manage containers
  image       Manage images
  network     Manage networks
  volume      Manage volumes

Commands:
  build       Build an image from a Dockerfile
  pull        Pull an image from a registry
  push        Push an image to a registry
  run         Run a command in a new container`;
      }
    } else if (cmd.startsWith('ping ')) {
      const host = args[1] || 'google.com';
      output = `PING ${host} (172.217.14.110) 56(84) bytes of data.
64 bytes from ${host}: icmp_seq=1 ttl=117 time=12.4 ms
64 bytes from ${host}: icmp_seq=2 ttl=117 time=11.8 ms  
64 bytes from ${host}: icmp_seq=3 ttl=117 time=12.1 ms
^C
--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max/mdev = 11.832/12.100/12.419/0.241 ms`;
    } else if (cmd.startsWith('curl ') || cmd.startsWith('wget ')) {
      const url = args[1] || 'example.com';
      output = `--${new Date().toISOString()}-- https://${url}/
Resolving ${url}... 93.184.216.34
Connecting to ${url}|93.184.216.34|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1256 [text/html]
Saving to: 'index.html'
index.html 100%[===================>] 1.23K --.-KB/s in 0s
${new Date().toISOString()} (1.23 KB/s) - 'index.html' saved [1256/1256]`;
    } else if (cmd.startsWith('ssh ')) {
      const host = args[1] || 'server.com';
      output = `ssh: connect to host ${host} port 22: Connection refused
ssh: Could not resolve hostname ${host}: Name or service not known`;
    } else if (cmd.startsWith('git ')) {
      const gitCmd = args[1] || 'status';
      if (gitCmd === 'status') {
        output = `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   webos-config.json

no changes added to commit (use "git add" and "git commit")`;
      } else if (gitCmd === 'log') {
        output = `commit a1b2c3d4e5f6789012345678901234567890abcd (HEAD -> main, origin/main)
Author: WebOS Developer <dev@webos.local>  
Date: Mon Dec 2 23:05:00 2024 +0000

    feat: Enhanced terminal with advanced command support
    
    - Added comprehensive command library
    - Improved system monitoring capabilities
    - Enhanced file operations

commit b2c3d4e5f6789012345678901234567890abcde1
Author: WebOS Developer <dev@webos.local>
Date: Sun Dec 1 18:30:00 2024 +0000

    Initial WebOS installation and setup`;
      } else if (gitCmd === 'branch') {
        output = `* main
  development
  feature/office-suite`;
      } else {
        output = `git: '${gitCmd}' is not a git command. See 'git --help'.`;
      }
    } else if (cmd.startsWith('npm ')) {
      const npmCmd = args[1] || 'help';
      if (npmCmd === 'version') {
        output = `{
  npm: '10.2.3',
  node: '20.9.0',
  acorn: '8.10.0',
  ada: '2.6.0',
  ares: '1.19.1',
  base64: '0.5.0',
  brotli: '1.0.9',
  cares: '1.19.1',
  cldr: '43.1',
  icu: '73.2',
  llhttp: '8.1.1',
  modules: '115',
  napi: '9',
  nghttp2: '1.57.0',
  nghttp3: '0.7.0',
  ngtcp2: '0.8.1',
  openssl: '3.0.10',
  simdutf: '3.2.18',
  tz: '2023c',
  undici: '5.26.3',
  unicode: '15.0',
  uv: '1.46.0',
  uvwasi: '0.0.19',
  v8: '11.3.244.8-node.16',
  zlib: '1.2.13'
}`;
      } else if (npmCmd === 'list') {
        output = `webos-project@3.0.0 /home/user
├── @types/react@18.2.0
├── @types/node@20.9.0
├── react@18.2.0
├── typescript@5.2.2  
├── vite@4.5.0
├── tailwindcss@3.3.0
└── lucide-react@0.292.0`;
      } else if (npmCmd === 'start') {
        output = `> webos-project@3.0.0 start
> vite

  VITE v4.5.0  ready in 423 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help`;
      } else {
        output = `npm ${npmCmd}
Usage: npm <command>

npm install        install all the dependencies in the local node_modules folder
npm install <pkg>  install package
npm list           list installed packages
npm start          start the application
npm run <script>   run arbitrary package scripts
npm version        show version info`;
      }
    } else if (cmd.startsWith('node ')) {
      const file = args[1] || 'app.js';
      if (file.endsWith('.js')) {
        output = `Hello World from ${file}!
WebOS Node.js Runtime v20.9.0
Application executed successfully.`;
      } else {
        output = `node: can't open file '${file}': No such file or directory`;
      }
    } else if (cmd.startsWith('python ') || cmd.startsWith('python3 ')) {
      const file = args[1] || 'app.py';
      if (file.endsWith('.py')) {
        output = `Python 3.11.5 (main, Aug 24 2023, 15:18:16) [GCC 13.2.1 20230801] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> Hello from ${file}!
>>> WebOS Python Runtime initialized
>>> Execution completed successfully`;
      } else {
        output = `python: can't open file '${file}': [Errno 2] No such file or directory`;
      }
    } else if (cmd.startsWith('echo ')) {
      output = command.substring(5);
    } else if (cmd === 'serve-website') {
      output = `🌐 NeonTech Website Console View
=====================================

    ███╗   ██╗███████╗ ██████╗ ███╗   ██╗████████╗███████╗ ██████╗██╗  ██╗
    ████╗  ██║██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝██╔════╝██╔════╝██║  ██║
    ██╔██╗ ██║█████╗  ██║   ██║██╔██╗ ██║   ██║   █████╗  ██║     ███████║
    ██║╚██╗██║██╔══╝  ██║   ██║██║╚██╗██║   ██║   ██╔══╝  ██║     ██╔══██║
    ██║ ╚████║███████╗╚██████╔╝██║ ╚████║   ██║   ███████╗╚██████╗██║  ██║
    ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═╝

                    🚀 FUTURE OF DIGITAL INNOVATION 🚀

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏠 HOME SECTION
   Welcome to NeonTech - Where innovation meets design
   Transforming ideas into digital reality with cutting-edge technology

🔧 FEATURES
   ⚡ Lightning Fast Performance
   🔐 Enterprise Security
   ☁️  Cloud Integration
   📱 Mobile Responsive
   🎨 Modern UI/UX Design
   🚀 Scalable Architecture

📊 STATISTICS
   ├─ 50,000+ Users Worldwide
   ├─ 99.9% Uptime Guarantee
   ├─ 24/7 Support Available
   └─ 1000+ Projects Completed

👥 ABOUT US
   Leading digital innovation company specializing in:
   • Web Development & Design
   • Mobile App Development
   • Cloud Solutions
   • AI & Machine Learning
   • DevOps & Infrastructure

📞 CONTACT INFORMATION
   📧 Email: contact@neontech.com
   📱 Phone: +1 (555) 123-4567
   🌐 Website: https://neontech.com
   📍 Address: 123 Innovation Drive, Tech City

🔗 SOCIAL MEDIA
   📘 Facebook: /neontech
   🐦 Twitter: @neontech
   💼 LinkedIn: /company/neontech
   📷 Instagram: @neontech_official

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💻 Website served successfully in console mode
🎯 All content displayed above with interactive ASCII design
✨ Full website experience delivered through terminal interface`;
    } else if (cmd === 'history') {
      output = commandHistory.map((cmd, i) => `${String(i + 1).padStart(4)} ${cmd}`).join('\n');
    } else if (cmd.startsWith('killall ')) {
      const process = args[1];
      output = process ? `killall: ${process}: no process found` : 'killall: no process specified';
    } else if (cmd === 'pacman') {
      // Launch Pac-Man game
      output = `Starting Pac-Man...

    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    █  PAC-MAN Classic Arcade Game v1.0  █
    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

🟡 Launching graphical Pac-Man interface...
🎮 Use arrow keys or WASD to move
🟠 Eat power pellets to turn ghosts blue
👻 Avoid ghosts or eat them when vulnerable

Opening Pac-Man window...`;
      
      // Launch the Pac-Man app
      setTimeout(() => {
        // Trigger window manager to open Pac-Man
        const event = new CustomEvent('openApp', { detail: { appId: 'pacman' } });
        window.dispatchEvent(event);
      }, 1000);
    } else if (cmd === 'emulator') {
      // Launch Educational Gaming Emulator
      output = `Starting Educational Gaming Emulator...

    ███████╗██████╗ ██╗   ██╗     ██████╗  █████╗ ███╗   ███╗███████╗███████╗
    ██╔════╝██╔══██╗██║   ██║    ██╔════╝ ██╔══██╗████╗ ████║██╔════╝██╔════╝
    █████╗  ██║  ██║██║   ██║    ██║  ███╗███████║██╔████╔██║█████╗  ███████╗
    ██╔══╝  ██║  ██║██║   ██║    ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  ╚════██║
    ███████╗██████╔╝╚██████╔╝    ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗███████║
    ╚══════╝╚═════╝  ╚═════╝      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝

📚 Learn programming through classic games
🎮 Available: Snake, Pong, Breakout, Tetris, Maze Solver
🧠 Educational features: Algorithm visualization, code examples
⚡ Interactive tutorials and programming concepts

Launching emulator interface...`;
      
      // Launch the Educational Emulator
      setTimeout(() => {
        const event = new CustomEvent('openApp', { detail: { appId: 'retro-emulator' } });
        window.dispatchEvent(event);
      }, 1000);
    } else if (cmd === 'code') {
      // Launch WebOS IDE
      output = `Starting WebOS IDE...

    ██╗    ██╗███████╗██████╗  ██████╗ ███████╗    ██╗██████╗ ███████╗
    ██║    ██║██╔════╝██╔══██╗██╔═══██╗██╔════╝    ██║██╔══██╗██╔════╝
    ██║ █╗ ██║█████╗  ██████╔╝██║   ██║███████╗    ██║██║  ██║█████╗  
    ██║███╗██║██╔══╝  ██╔══██╗██║   ██║╚════██║    ██║██║  ██║██╔══╝  
    ╚███╔███╔╝███████╗██████╔╝╚██████╔╝███████║    ██║██████╔╝███████╗
     ╚══╝╚══╝ ╚══════╝╚═════╝  ╚═════╝ ╚══════╝    ╚═╝╚═════╝ ╚══════╝

💻 Professional development environment
📝 Multi-language support: JavaScript, TypeScript, Python, CSS, HTML
🔧 Integrated terminal and debugging tools
📁 Project management and file explorer
🎯 Version control with Git integration

Loading IDE interface...`;
      
      // Launch the IDE
      setTimeout(() => {
        const event = new CustomEvent('openApp', { detail: { appId: 'ide' } });
        window.dispatchEvent(event);
      }, 1000);
    } else if (cmd === 'vmmanager') {
      // Launch Virtual Machine Manager
      output = `Starting Virtual Machine Manager...

    ██╗   ██╗██╗██████╗ ████████╗██╗   ██╗ █████╗ ██╗         ██╗   ██╗███╗   ███╗
    ██║   ██║██║██╔══██╗╚══██╔══╝██║   ██║██╔══██╗██║         ██║   ██║████╗ ████║
    ██║   ██║██║██████╔╝   ██║   ██║   ██║███████║██║         ██║   ██║██╔████╔██║
    ╚██╗ ██╔╝██║██╔══██╗   ██║   ██║   ██║██╔══██║██║         ╚██╗ ██╔╝██║╚██╔╝██║
     ╚████╔╝ ██║██║  ██║   ██║   ╚██████╔╝██║  ██║███████╗     ╚████╔╝ ██║ ╚═╝ ██║
      ╚═══╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝      ╚═══╝  ╚═╝     ╚═╝

🖥️ Advanced virtualization platform
🐧 Run Ubuntu, Windows, macOS, Alpine Linux
⚡ Hardware acceleration support
🔧 Complete VM lifecycle management
📊 Real-time performance monitoring
🌐 Virtual networking capabilities

Initializing hypervisor...`;
      
      // Launch the Virtual Machine Manager
      setTimeout(() => {
        const event = new CustomEvent('openApp', { detail: { appId: 'virtual-machine' } });
        window.dispatchEvent(event);
      }, 1000);
    } else if (cmd === 'downloads' || cmd === 'download') {
      // Launch Download Manager
      output = `Starting Download Manager...

    ██████╗  ██████╗ ██╗    ██╗███╗   ██╗██╗      ██████╗  █████╗ ██████╗ 
    ██╔══██╗██╔═══██╗██║    ██║████╗  ██║██║     ██╔═══██╗██╔══██╗██╔══██╗
    ██║  ██║██║   ██║██║ █╗ ██║██╔██╗ ██║██║     ██║   ██║███████║██║  ██║
    ██║  ██║██║   ██║██║███╗██║██║╚██╗██║██║     ██║   ██║██╔══██║██║  ██║
    ██████╔╝╚██████╔╝╚███╔███╔╝██║ ╚████║███████╗╚██████╔╝██║  ██║██████╔╝
    ╚═════╝  ╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝ 

📥 Multi-threaded download manager
⏸️ Pause/resume downloads
📋 Queue management
📊 Real-time progress monitoring
🗂️ Automatic file type detection
🚀 Optimized transfer speeds

Loading download interface...`;
      
      // Launch the Download Manager
      setTimeout(() => {
        const event = new CustomEvent('openApp', { detail: { appId: 'download-manager' } });
        window.dispatchEvent(event);
      }, 1000);
    } else if (cmd === 'installwebos') {
      output = `WebOS Installation Wizard
═══════════════════════════════════════════════════════

██╗    ██╗███████╗██████╗  ██████╗ ███████╗
██║    ██║██╔════╝██╔══██╗██╔═══██╗██╔════╝
██║ █╗ ██║█████╗  ██████╔╝██║   ██║███████╗
██║███╗██║██╔══╝  ██╔══██╗██║   ██║╚════██║
╚███╔███╔╝███████╗██████╔╝╚██████╔╝███████║
 ╚══╝╚══╝ ╚══════╝╚═════╝  ╚═════╝ ╚══════╝

Installation Status: ✅ COMPLETE
Version: 3.0.0 Professional Edition

✅ Kernel modules loaded
✅ Desktop environment initialized  
✅ Package manager configured
✅ Office suite installed
✅ Browser engine enabled
✅ Terminal enhanced

Welcome to WebOS! Your system is ready.
Type 'help' for available commands.`;
    } else if (cmd === 'exit') {
      output = 'Terminal session ended. Use Ctrl+Alt+T to open a new terminal.';
    } else if (cmd === 'free' || cmd === 'free -h') {
      output = `               total        used        free      shared  buff/cache   available
Mem:           7.7Gi       2.1Gi       3.4Gi       301Mi       2.3Gi       5.1Gi
Swap:          2.0Gi          0B       2.0Gi`;
    } else if (cmd === 'df' || cmd === 'df -h') {
      output = `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       512G   89G  423G  18% /
/dev/sdb1       2.0T  650G  1.4T  32% /home
/dev/sdc1       4.0T  1.2T  2.8T  30% /media/storage
/dev/sdd1        64G   23G   41G  36% /media/usb
tmpfs           7.7G     0  7.7G   0% /dev/shm
tmpfs           7.7G  8.0K  7.7G   1% /tmp

Total Storage: 6.6TB (1.96TB used, 4.64TB available)`;
    } else {
      output = `bash: ${command}: command not found

Did you mean:
${getSuggestion(command)}

Type 'help' for available commands.`;
    }

    const outputLine: TerminalLine = {
      type: cmd === 'exit' ? 'error' : 'output',
      content: output,
      timestamp: new Date()
    };

    setLines(prev => [...prev, outputLine]);
    
    // Add to command history
    if (command.trim()) {
      setCommandHistory(prev => [...prev, command.trim()]);
    }
  };

  const getSuggestion = (command: string): string => {
    const commands = ['help', 'clear', 'ls', 'pwd', 'cd', 'mkdir', 'touch', 'cat', 'date', 'whoami', 'uptime', 'ps', 'top', 'ping', 'curl', 'wget', 'ssh', 'git', 'npm', 'node', 'python', 'echo', 'history', 'killall', 'exit', 'installwebos', 'free', 'df'];
    const similar = commands.find(cmd => 
      cmd.toLowerCase().includes(command.toLowerCase().substring(0, 2)) || 
      command.toLowerCase().includes(cmd.toLowerCase().substring(0, 2))
    );
    return similar || 'help';
  };

  const commands = {
    help: () => [
      'WebOS Terminal - Command Reference',
      '═══════════════════════════════════════════════════════════',
      '',
      'SYSTEM INFORMATION:',
      '  help        - Show this help message',
      '  clear       - Clear the terminal screen',
      '  whoami      - Display current user',
      '  uname       - System kernel information', 
      '  neofetch    - Detailed system info with ASCII art',
      '  uptime      - System uptime and load',
      '  date        - Display current date and time',
      '  history     - Show command history',
      '',
      'FILE SYSTEM:',
      '  ls          - List directory contents',
      '  pwd         - Print working directory',
      '  cd          - Change directory',
      '  mkdir       - Create directories',
      '  touch       - Create files',
      '  cat         - Display file contents',
      '  tree        - Display directory tree',
      '',
      'SYSTEM MONITORING:',
      '  ps          - Show running processes',
      '  top         - Real-time process monitor',
      '  free        - Display memory usage',
      '  df          - Display filesystem usage',
      '  lscpu       - CPU information',
      '  lsblk       - List block devices',
      '',
      'NETWORK:',
      '  ping        - Test network connectivity',
      '  curl        - Transfer data from servers',
      '  wget        - Download files from web',
      '  netstat     - Display network connections',
      '  ifconfig    - Configure network interface',
      '  ip          - Show/manipulate routing',
      '',
      'PACKAGE MANAGEMENT:',
      '  pacman      - Arch Linux package manager',
      '  yay         - AUR helper',
      '  flatpak     - Flatpak package manager',
      '',
      'DEVELOPMENT:',
      '  git         - Version control system',
      '  node        - JavaScript runtime',
      '  npm         - Node package manager',
      '  python      - Python interpreter',
      '  code        - Launch IDE',
      '  vim         - Text editor',
      '  nano        - Simple text editor',
      '',
      'SYSTEM CONTROL:',
      '  systemctl   - System service control',
      '  journalctl  - View system logs',
      '  mount       - Mount filesystems',
      '  umount      - Unmount filesystems',
      '  killall     - Kill processes by name',
      '',
      'APPLICATIONS:',
      '  browser     - Launch web browser',
      '  downloads   - Launch download manager',
      '  emulator    - Launch retro emulator',
      '  vmmanager   - Launch virtual machine manager',
      '  roblox      - Launch Roblox platform',
      '',
      'SYSTEM MANAGEMENT:',
      '  installwebos - WebOS installation wizard',
      '  reboot      - Restart the system',
      '  shutdown    - Power off the system',
      '  exit        - Close terminal session',
      '',
      'HIDDEN COMMANDS:',
      '  matrix      - Enter the Matrix',
      '  hack        - Hacker simulator',
      '  cowsay      - ASCII cow messages',
      '  fortune     - Random fortune cookies',
      '  cmatrix     - Matrix rain effect',
      '',
      'Type any command for detailed help or usage examples.'
    ],
    clear: () => {
      setLines([]);
      return [];
    },
    ls: () => [
      'total 8',
      'drwxr-xr-x 2 user user 4096 Dec  2 14:24 Desktop',
      'drwxr-xr-x 2 user user 4096 Dec  2 14:24 Documents',
      'drwxr-xr-x 2 user user 4096 Dec  2 14:24 Downloads',
      'drwxr-xr-x 2 user user 4096 Dec  2 14:24 Music',
      'drwxr-xr-x 2 user user 4096 Dec  2 14:24 Pictures',
      'drwxr-xr-x 2 user user 4096 Dec  2 14:24 Videos'
    ],
    pwd: () => ['/home/user'],
    whoami: () => ['user'],
    uname: () => ['Linux desktop 6.6.8-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux'],
    neofetch: () => [
      '                   -`                    user@desktop',
      '                  .o+`                   -------------',
      '                 `ooo/                   OS: Arch Linux x86_64',
      '                `+oooo:                  Host: Virtual Machine',
      '               `+oooooo:                 Kernel: 6.6.8-arch1-1',
      '               -+oooooo+:                Uptime: 2 hours, 24 mins',
      '             `/:-:++oooo+:               Packages: 1247 (pacman)',
      '            `/++++/+++++++:              Shell: bash 5.2.15',
      '           `/++++++++++++++:             Resolution: 1920x1080',
      '          `/+++ooooooooo++++/            DE: Custom Desktop',
      '         ./ooosssso++osssssso+`          WM: Custom Window Manager',
      '        .oossssso-````/ossssss+`         Theme: Arch [GTK3]',
      '       -osssssso.      :ssssssso.        Icons: Arch [GTK3]',
      '      :osssssss/        osssso+++.       Terminal: web-terminal',
      '     /ossssssss/        +ssssooo/-       CPU: Virtual CPU',
      '   `/ossssso+/:-        -:/+osssso+-     Memory: 8192MB',
      '  `+sso+:-`                 `.-/+oso:    ',
      ' `++:.                           `-/+/   ',
      ' .`                                 `/   '
    ],
    pacman: (args: string[]) => {
      if (args.length === 0) {
        return ['usage: pacman <operation> [...]'];
      }
      if (args[0] === '-Syu') {
        return [
          ':: Synchronizing package databases...',
          ' core is up to date',
          ' extra is up to date',
          ' community is up to date',
          ':: Starting full system upgrade...',
          'there is nothing to do'
        ];
      }
      if (args[0] === '-Q') {
        return ['Package database contains 1247 packages'];
      }
      return ['Invalid pacman operation. Try "pacman -Syu" or "pacman -Q"'];
    },
    systemctl: (args: string[]) => {
      if (args.length === 0) {
        return ['Usage: systemctl [OPTIONS...] COMMAND [UNIT...]'];
      }
      if (args[0] === 'status') {
        return [
          '● desktop - Web Desktop Environment',
          '   Loaded: loaded (/etc/systemd/system/desktop.service; enabled)',
          '   Active: active (running) since ' + new Date().toLocaleString(),
          '     Main PID: 1234 (desktop)',
          '      Tasks: 12 (limit: 4915)',
          '     Memory: 256.8M',
          '        CPU: 5.432s'
        ];
      }
      return ['Unit not found or invalid command'];
    },
    ps: () => [
      '  PID TTY          TIME CMD',
      ' 1234 tty1     00:00:05 desktop',
      ' 1235 tty1     00:00:01 file-manager',
      ' 1236 tty1     00:00:00 terminal',
      ' 1237 tty1     00:00:00 bash'
    ],
    free: () => [
      '               total        used        free      shared  buff/cache   available',
      'Mem:         8388608     2097152     4194304           0     2097152     6291456',
      'Swap:        2097152           0     2097152'
    ],
    df: () => [
      'Filesystem     1K-blocks    Used Available Use% Mounted on',
      '/dev/vda1       20971520 8388608  12582912  41% /',
      'tmpfs            4194304       0   4194304   0% /dev/shm',
      'tmpfs            4194304    1024   4193280   1% /run'
    ],
    'reset-install': () => {
      localStorage.removeItem('archInstalled');
      location.reload();
      return ['Resetting installation... Please wait for reboot.'];
    },
    // Hidden discovery commands
    'find': (args: string[]) => {
      if (args.length === 0) {
        return ['find: missing operand', 'Try "find /system" or "find /boot"'];
      }
      if (args[0] === '/system' || args[0] === '/boot') {
        return [
          '/system/bin/bash',
          '/system/bin/install',
          '/system/boot/kernel.img',
          '/system/boot/webos-installer',
          '/system/sbin/installwebOS',
          '/system/lib/libwebos.so'
        ];
      }
      if (args[0] === '/usr') {
        return [
          '/usr/bin/webos-setup',
          '/usr/sbin/system-installer',
          '/usr/share/webos/installer.sh'
        ];
      }
      return ['find: no matches found'];
    },
    'locate': (args: string[]) => {
      if (args.length === 0) {
        return ['locate: missing search term'];
      }
      if (args[0].includes('install') || args[0].includes('webos')) {
        return [
          '/system/sbin/installwebOS',
          '/usr/bin/webos-setup',
          '/boot/webos-installer'
        ];
      }
      return ['locate: no matches found'];
    },
    'which': (args: string[]) => {
      if (args.length === 0) {
        return ['which: missing command name'];
      }
      if (args[0] === 'installwebOS') {
        return ['/system/sbin/installwebOS'];
      }
      const commonCommands: Record<string, string> = {
        'bash': '/bin/bash',
        'ls': '/bin/ls',
        'cat': '/bin/cat',
        'grep': '/bin/grep',
        'find': '/usr/bin/find',
        'locate': '/usr/bin/locate'
      };
      return [commonCommands[args[0]] || `which: no ${args[0]} in PATH`];
    },
    'cat': (args: string[]) => {
      if (args.length === 0) {
        return ['cat: missing file operand'];
      }
      if (args[0] === '/etc/motd' || args[0] === '/etc/issue') {
        return [
          'Welcome to the WebOS Installation Environment',
          '',
          'This is a minimal boot environment for system installation.',
          'To install WebOS, run the system installer located in /system/sbin/',
          '',
          'For help, try running diagnostic commands or explore the filesystem.'
        ];
      }
      if (args[0] === '/proc/cmdline') {
        return ['root=/dev/ram0 init=/sbin/init console=tty0 installmode=1'];
      }
      if (args[0] === '/boot/grub/menu.lst') {
        return [
          'title WebOS Installation',
          'root (hd0,0)',
          'kernel /boot/vmlinuz-webos',
          'initrd /boot/initrd-webos.img'
        ];
      }
      return [`cat: ${args[0]}: No such file or directory`];
    },
    'lsblk': () => [
      'NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT',
      'sda      8:0    0   20G  0 disk',
      '├─sda1   8:1    0    1G  0 part /boot',
      '└─sda2   8:2    0   19G  0 part',
      'sr0     11:0    1    4G  0 rom  /media/cdrom'
    ],
    'mount': () => [
      '/dev/sda1 on /boot type ext4 (rw,relatime)',
      'tmpfs on /tmp type tmpfs (rw,nosuid,nodev)',
      'proc on /proc type proc (rw,nosuid,nodev,noexec)',
      'sysfs on /sys type sysfs (rw,nosuid,nodev,noexec)',
      '/dev/sr0 on /media/cdrom type iso9660 (ro,relatime)'
    ],
    'env': () => [
      'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
      'HOME=/root',
      'TERM=xterm-256color',
      'SHELL=/bin/bash',
      'USER=root',
      'INSTALL_MODE=1',
      'WEBOS_VERSION=1.0'
    ],
    'installWebOS': () => {
      // Hidden alias for the main installer
      return ['Loading WebOS installer...', 'Please use the main "installwebOS" command.'];
    },
    ping: (args: string[]) => {
      const target = args[0] || 'localhost';
      return [
        `PING ${target} (127.0.0.1) 56(84) bytes of data.`,
        `64 bytes from ${target} (127.0.0.1): icmp_seq=1 ttl=64 time=0.045 ms`,
        `64 bytes from ${target} (127.0.0.1): icmp_seq=2 ttl=64 time=0.039 ms`,
        `64 bytes from ${target} (127.0.0.1): icmp_seq=3 ttl=64 time=0.042 ms`,
        '',
        `--- ${target} ping statistics ---`,
        `3 packets transmitted, 3 received, 0% packet loss, time 2043ms`,
        `rtt min/avg/max/mdev = 0.039/0.042/0.045/0.002 ms`
      ];
    },
    curl: (args: string[]) => {
      if (args.length === 0) {
        return ['curl: missing URL'];
      }
      const url = args[0];
      return [
        `curl: (6) Could not resolve host: ${url}`,
        'Note: Network access is simulated in this environment'
      ];
    },
    wget: (args: string[]) => {
      if (args.length === 0) {
        return ['wget: missing URL'];
      }
      const url = args[0];
      return [
        `--${new Date().toISOString().slice(0, 19)}--  ${url}`,
        'Resolving host... failed: Name or service not known.',
        'Note: Network access is simulated in this environment'
      ];
    },
    netstat: () => [
      'Active Internet connections (w/o servers)',
      'Proto Recv-Q Send-Q Local Address           Foreign Address         State',
      'tcp        0      0 localhost:5000          localhost:54321         ESTABLISHED',
      'tcp        0      0 localhost:3000          localhost:45678         ESTABLISHED'
    ],
    ifconfig: () => [
      'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536',
      '        inet 127.0.0.1  netmask 255.0.0.0',
      '        inet6 ::1  prefixlen 128  scopeid 0x10<host>',
      '        loop  txqueuelen 1000  (Local Loopback)',
      '',
      'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500',
      '        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255',
      '        ether 02:42:ac:11:00:02  txqueuelen 0  (Ethernet)'
    ],
    top: () => [
      'top - ' + new Date().toLocaleTimeString() + ' up 2:47,  1 user,  load average: 0.08, 0.03, 0.01',
      'Tasks: 124 total,   1 running, 123 sleeping,   0 stopped,   0 zombie',
      '%Cpu(s):  0.3 us,  0.7 sy,  0.0 ni, 99.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st',
      'MiB Mem :   8192.0 total,   4096.0 free,   2048.0 used,   2048.0 buff/cache',
      'MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   6144.0 avail Mem',
      '',
      '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
      ' 1234 html      20   0  123456  12345   1234 S   0.3   0.2   0:05.67 desktop',
      ' 1235 html      20   0   98765   9876    987 S   0.0   0.1   0:01.23 terminal'
    ],
    htop: () => [
      'htop is not installed. Try: pacman -S htop',
      'Alternative: use "top" command'
    ],
    ssh: (args: string[]) => {
      if (args.length === 0) {
        return ['usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] destination [command]'];
      }
      return [
        `ssh: connect to host ${args[0]} port 22: Network is unreachable`,
        'Note: SSH access is simulated in this environment'
      ];
    },
    git: (args: string[]) => {
      if (args.length === 0) {
        return [
          'usage: git [--version] [-C <path>] [-c <name>=<value>]',
          '           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]',
          '           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]',
          '           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]',
          '           <command> [<args>]'
        ];
      }
      if (args[0] === 'status') {
        return [
          'fatal: not a git repository (or any of the parent directories): .git'
        ];
      }
      if (args[0] === 'clone') {
        return [
          'fatal: repository does not exist',
          'Note: Git operations are simulated in this environment'
        ];
      }
      return [`git: '${args[0]}' is not a git command.`];
    },
    node: (args: string[]) => {
      if (args.length === 0) {
        return [
          'Welcome to Node.js v18.17.0.',
          'Type ".help" for more information.',
          '> // Interactive mode not available in terminal'
        ];
      }
      return [`node: can't open file '${args[0]}'`];
    },
    npm: (args: string[]) => {
      if (args.length === 0) {
        return [
          'npm <command>',
          '',
          'Usage:',
          'npm install        install all the dependencies in your project',
          'npm test           run this project\'s tests',
          'npm run <command>  run the script named <command>'
        ];
      }
      return [`npm ERR! Unknown command: "${args[0]}"`];
    },
    python: (args: string[]) => {
      if (args.length === 0) {
        return [
          'Python 3.11.0 (main, Oct 24 2022, 18:26:48) [GCC 12.2.0] on linux',
          'Type "help", "copyright", "credits" or "license" for more information.',
          '>>> # Interactive mode not available in terminal'
        ];
      }
      return [`python: can't open file '${args[0]}': [Errno 2] No such file or directory`];
    },
    // Additional commands
    uptime: () => [
      ` ${new Date().toLocaleTimeString()} up 2:47,  1 user,  load average: 0.08, 0.03, 0.01`
    ],
    date: () => [new Date().toString()],
    history: () => commandHistory.slice(-20).map((cmd, i) => `${i + 1}  ${cmd}`),
    cd: (args: string[]) => {
      const dir = args[0] || '~';
      return [`cd: changed directory to ${dir}`];
    },
    mkdir: (args: string[]) => {
      if (args.length === 0) {
        return ['mkdir: missing operand'];
      }
      return [`mkdir: created directory '${args[0]}'`];
    },
    touch: (args: string[]) => {
      if (args.length === 0) {
        return ['touch: missing file operand'];
      }
      return [`touch: created file '${args[0]}'`];
    },
    tree: () => [
      '.',
      '├── Desktop',
      '├── Documents',
      '├── Downloads',
      '├── Music',
      '├── Pictures',
      '├── Videos',
      '└── .config',
      '    ├── webos',
      '    └── applications'
    ],
    lscpu: () => [
      'Architecture:        x86_64',
      'CPU op-mode(s):      32-bit, 64-bit',
      'Byte Order:          Little Endian',
      'Address sizes:       48 bits physical, 48 bits virtual',
      'CPU(s):              8',
      'On-line CPU(s) list: 0-7',
      'Thread(s) per core:  2',
      'Core(s) per socket:  4',
      'Socket(s):           1',
      'NUMA node(s):        1',
      'Vendor ID:           AuthenticAMD',
      'CPU family:          23',
      'Model:               113',
      'Model name:          AMD Ryzen 7 3700X 8-Core Processor',
      'Stepping:            0',
      'CPU MHz:             3593.324',
      'BogoMIPS:            7186.64',
      'Hypervisor vendor:   KVM',
      'Virtualization type: full'
    ],
    ip: (args: string[]) => {
      if (args.length === 0 || args[0] === 'addr') {
        return [
          '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN',
          '    inet 127.0.0.1/8 scope host lo',
          '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP',
          '    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0'
        ];
      }
      return [`ip: command not recognized: ${args[0]}`];
    },
    yay: (args: string[]) => {
      if (args.length === 0) {
        return ['Yay v11.3.2 - libalpm v13.0.2'];
      }
      return ['yay: AUR helper - packages not available in simulation'];
    },
    flatpak: (args: string[]) => {
      if (args.length === 0) {
        return ['Usage: flatpak [OPTION…] COMMAND'];
      }
      if (args[0] === 'list') {
        return ['No applications installed'];
      }
      return ['flatpak: Flatpak not configured in this environment'];
    },
    vim: () => [
      'Vim - Vi IMproved 9.0 (2022 Jun 28)',
      'Terminal vim interface not available in web environment',
      'Use the built-in text editor instead'
    ],
    nano: () => [
      'GNU nano, version 6.4',
      'Terminal nano interface not available in web environment',
      'Use the built-in text editor instead'
    ],
    journalctl: () => [
      '-- Logs begin at ' + new Date(Date.now() - 86400000).toISOString() + ' --',
      new Date().toISOString() + ' webos systemd[1]: Started WebOS Desktop Environment.',
      new Date().toISOString() + ' webos systemd[1]: Started Network Manager.',
      new Date().toISOString() + ' webos systemd[1]: Reached target Multi-User System.'
    ],
    umount: (args: string[]) => {
      if (args.length === 0) {
        return ['umount: no filesystem specified'];
      }
      return [`umount: ${args[0]} unmounted`];
    },
    killall: (args: string[]) => {
      if (args.length === 0) {
        return ['killall: no process name specified'];
      }
      return [`killall: no process found for ${args[0]}`];
    },
    // Application launchers
    browser: () => {
      setTimeout(() => {
        const event = new CustomEvent('openApp', { detail: { appId: 'browser' } });
        window.dispatchEvent(event);
      }, 1000);
      return ['Starting web browser...'];
    },
    emulator: () => {
      setTimeout(() => {
        const event = new CustomEvent('openApp', { detail: { appId: 'retro-emulator' } });
        window.dispatchEvent(event);
      }, 1000);
      return ['Starting retro emulator...'];
    },
    roblox: () => {
      setTimeout(() => {
        const event = new CustomEvent('openApp', { detail: { appId: 'roblox' } });
        window.dispatchEvent(event);
      }, 1000);
      return ['Starting Roblox platform...'];
    },
    // System management
    reboot: () => {
      return ['System restart initiated... (simulated)'];
    },
    shutdown: () => {
      return ['System shutdown initiated... (simulated)'];
    },
    // Hidden/Fun commands
    matrix: () => [
      'Wake up, Neo...',
      'The Matrix has you...',
      'Follow the white rabbit.',
      '',
      '01001000 01100101 01101100 01101100 01101111',
      '01001110 01100101 01101111'
    ],
    hack: () => [
      'INITIATING HACK SEQUENCE...',
      '[████████████████████████████████] 100%',
      '',
      'ACCESSING MAINFRAME...',
      'BYPASSING FIREWALL...',
      'DOWNLOADING DATABASE...',
      '',
      'HACK COMPLETE!',
      'Just kidding :) This is just a terminal simulator.'
    ],
    cowsay: (args: string[]) => {
      const message = args.join(' ') || 'Hello, WebOS!';
      const border = '_'.repeat(message.length + 2);
      return [
        ` ${border}`,
        `< ${message} >`,
        ` ${'-'.repeat(message.length + 2)}`,
        '        \\   ^__^',
        '         \\  (oo)\\_______',
        '            (__)\\       )\\/\\',
        '                ||----w |',
        '                ||     ||'
      ];
    },
    fortune: () => {
      const fortunes = [
        'The best way to predict the future is to invent it.',
        'Life is what happens while you are making other plans.',
        'In the middle of difficulty lies opportunity.',
        'It is during our darkest moments that we must focus to see the light.',
        'Success is not final, failure is not fatal: it is the courage to continue that counts.',
        'The only impossible journey is the one you never begin.',
        'In WebOS, all commands are possible.',
        'Sometimes the terminal knows more than you think.'
      ];
      return [fortunes[Math.floor(Math.random() * fortunes.length)]];
    },
    cmatrix: () => [
      'cmatrix - terminal Matrix effect',
      'Press Ctrl+C to stop (simulation)',
      '',
      '01001001 01001001 01001001 01001001',
      '11011101 11011101 11011101 11011101',
      '00110011 00110011 00110011 00110011',
      '10101010 10101010 10101010 10101010',
      '',
      'Matrix effect would be running...'
    ]
  };

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    // Add command to history
    setCommandHistory(prev => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    // Add command line to output
    const commandLine: TerminalLine = {
      type: 'command',
      content: `[${localStorage.getItem('webos-username') || 'html'}@javascriptiso ~]$ ${trimmedCmd}`,
      timestamp: new Date()
    };

    const parts = trimmedCmd.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    let output: string[] = [];

    if (commands[command as keyof typeof commands]) {
      const commandFunc = commands[command as keyof typeof commands];
      if (typeof commandFunc === 'function') {
        output = commandFunc(args);
      }
    } else {
      output = [`bash: ${command}: command not found`];
    }

    const outputLines: TerminalLine[] = output.map(line => ({
      type: line.startsWith('bash:') ? 'error' : 'output',
      content: line,
      timestamp: new Date()
    }));

    if (command === 'clear') {
      // Clear command already handled in the function
      return;
    }

    setLines(prev => [...prev, commandLine, ...outputLines]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentCommand);
      setCurrentCommand('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion for commands
      const availableCommands = Object.keys(commands);
      const matches = availableCommands.filter(cmd => cmd.startsWith(currentCommand));
      if (matches.length === 1) {
        setCurrentCommand(matches[0]);
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="h-full bg-background text-foreground font-mono text-sm flex flex-col">
      <div 
        ref={terminalRef}
        className="flex-1 overflow-auto p-3 space-y-1"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, index) => (
          <div key={index} className={`whitespace-pre-wrap ${
            line.type === 'command' ? 'text-primary' : 
            line.type === 'error' ? 'text-destructive' : 
            'text-foreground'
          }`}>
            {line.content}
          </div>
        ))}
        
        <div className="flex">
          <span className="text-primary">
            [{localStorage.getItem('webos-username') || 'html'}@javascriptiso ~]$ 
          </span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-foreground ml-1"
            autoFocus
          />
          <span className="animate-pulse">█</span>
        </div>
      </div>
    </div>
  );
};