import { FC, useState, useRef, useEffect } from 'react';

interface InstallerLine {
  type: 'system' | 'input' | 'error' | 'success';
  content: string;
  timestamp: Date;
}

interface ArchInstallerProps {
  onInstallComplete: () => void;
}

export const ArchInstaller: FC<ArchInstallerProps> = ({ onInstallComplete }) => {
  const [lines, setLines] = useState<InstallerLine[]>([
    {
      type: 'system',
      content: 'WebOS Installation Macromedia v4.0',
      timestamp: new Date()
    },
    {
      type: 'system',
      content: '',
      timestamp: new Date()
    },
    {
      type: 'system',
      content: 'Booting from WebOS Installation Macromedia...',
      timestamp: new Date()
    },
    {
      type: 'system',
      content: 'Loading kernel modules... [OK]',
      timestamp: new Date()
    },
    {
      type: 'system',
      content: 'Initializing hardware... [OK]',
      timestamp: new Date()
    },
    {
      type: 'system',
      content: 'Starting network services... [OK]',
      timestamp: new Date()
    },
    {
      type: 'system',
      content: '',
      timestamp: new Date()
    },
    {
      type: 'system',
      content: 'Welcome to WebOS Installation Environment',
      timestamp: new Date()
    },
    {
      type: 'system',
      content: 'Ready for installation - Type "help" for available commands',
      timestamp: new Date()
    },
    {
      type: 'system',
      content: '',
      timestamp: new Date()
    },
    {
      type: 'input',
      content: 'root@webos-installer:~#',
      timestamp: new Date()
    }
  ]);
  
  const [currentCommand, setCurrentCommand] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installStep, setInstallStep] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const installSteps = [
    'Partitioning disk...',
    'Creating filesystem...',
    'Installing base system...',
    'Setting up bootloader...',
    'Configuring system...',
    'Installation complete!'
  ];

  const showLoadingAnimation = (callback: () => void) => {
    const loadingFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let frameIndex = 0;
    let loadingCount = 0;
    
    const loadingLine: InstallerLine = {
      type: 'system',
      content: `${loadingFrames[0]} Initializing installation...`,
      timestamp: new Date()
    };
    
    setLines(prev => [...prev, loadingLine]);
    
    const animationInterval = setInterval(() => {
      frameIndex = (frameIndex + 1) % loadingFrames.length;
      loadingCount++;
      
      setLines(prev => {
        const newLines = [...prev];
        const lastLine = newLines[newLines.length - 1];
        if (lastLine.content.includes('Initializing installation')) {
          newLines[newLines.length - 1] = {
            ...lastLine,
            content: `${loadingFrames[frameIndex]} Initializing installation...`
          };
        }
        return newLines;
      });
      
      if (loadingCount >= 20) { // About 2 seconds
        clearInterval(animationInterval);
        setLines(prev => {
          const newLines = [...prev];
          newLines[newLines.length - 1] = {
            ...newLines[newLines.length - 1],
            content: '✓ Installation initialized'
          };
          return newLines;
        });
        
        setTimeout(() => {
          callback();
        }, 300);
      }
    }, 100);
  };

  const simulateBumblebeeInstall = () => {
    const bumblebeeLines: InstallerLine[] = [
      {
        type: 'system',
        content: '=== Bumblebee OS Installation ===',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: 'The Ubuntu-based operating system made by BumblebeeOS Team and owned by WebOS',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '',
        timestamp: new Date()
      },
      {
        type: 'success',
        content: 'BUMBLEBEE OS INSTALLATION MODE',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: 'This installation provides:',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '• Ubuntu 22.04 LTS base with Bumblebee',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '• GNOME desktop environment with custom themes',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '• Snap and APT package management',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '• Enhanced gaming and multimedia support',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '• Developer tools and productivity applications',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '• Automatic driver installation and optimization',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '',
        timestamp: new Date()
      }
    ];
    
    setLines(prev => [...prev, ...bumblebeeLines]);
    
    let step = 0;
    const bumblebeeSteps = [
      { msg: '✓ Verifying system compatibility', delay: 700 },
      { msg: '✓ Downloading Ubuntu 22.04 LTS base image', delay: 1200 },
      { msg: '✓ Extracting Bumblebee OS components', delay: 900 },
      { msg: '✓ Setting up partition scheme (/, /home, swap)', delay: 800 },
      { msg: '✓ Installing base Ubuntu system', delay: 1500 },
      { msg: '✓ Configuring GNOME desktop environment', delay: 1000 },
      { msg: '✓ Installing Bumblebee theme and customizations', delay: 800 },
      { msg: '✓ Setting up package repositories (apt, snap)', delay: 600 },
      { msg: '✓ Installing multimedia codecs and drivers', delay: 900 },
      { msg: '✓ Configuring gaming optimizations', delay: 700 },
      { msg: '✓ Installing productivity suite (LibreOffice, Firefox)', delay: 800 },
      { msg: '✓ Setting up development environment', delay: 600 },
      { msg: '✓ Configuring automatic updates', delay: 500 },
      { msg: '✓ Installing Bumblebee welcome application', delay: 400 },
      { msg: '', delay: 300 },
      { msg: 'BUMBLEBEE OS INSTALLATION COMPLETE', delay: 500 },
      { msg: 'System: Ubuntu-based Bumblebee OS with GNOME desktop', delay: 200 },
      { msg: 'Features: Gaming optimized, multimedia ready, developer friendly', delay: 200 },
      { msg: 'Type "reboot" to start Bumblebee OS', delay: 0 }
    ];
    
    const executeStep = () => {
      if (step < bumblebeeSteps.length) {
        const stepInfo = bumblebeeSteps[step];
        setTimeout(() => {
          setLines(prev => [...prev, {
            type: step >= bumblebeeSteps.length - 4 ? 'success' : 'system',
            content: stepInfo.msg,
            timestamp: new Date()
          }]);
          step++;
          executeStep();
        }, stepInfo.delay);
      } else {
        // Launch Bumblebee OS instead of completing installation
        localStorage.setItem('bumblebee-active', 'true');
        
        setTimeout(() => {
          setLines(prev => [...prev, {
            type: 'system',
            content: '',
            timestamp: new Date()
          }, {
            type: 'success',
            content: 'Starting Bumblebee OS...',
            timestamp: new Date()
          }, {
            type: 'system',
            content: 'Loading Ubuntu-based desktop environment',
            timestamp: new Date()
          }]);
          
          // Launch Bumblebee OS after 2 seconds
          setTimeout(() => {
            window.location.reload(); // This will trigger Bumblebee OS to load
          }, 2000);
        }, 1000);
      }
    };
    
    setTimeout(executeStep, 1000);
  };

  const simulateQuickInstall = () => {
    const quickLines: InstallerLine[] = [
      {
        type: 'system',
        content: '=== WebOS Quick Installation ===',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: 'Fast automated setup with minimal configuration',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: 'WARNING: Quick provides limited access to system files',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: 'Advanced features and customization will be restricted',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '',
        timestamp: new Date()
      }
    ];
    
    setLines(prev => [...prev, ...quickLines]);
    
    let step = 0;
    const quickSteps = [
      { msg: '✓ Auto-partitioning disk (/dev/sda)', delay: 800 },
      { msg: '✓ Installing base WebOS system (minimal edition)', delay: 1200 },
      { msg: '✓ Setting up essential services only', delay: 600 },
      { msg: '✓ Configuring basic bootloader', delay: 500 },
      { msg: '✓ Creating limited user account', delay: 400 },
      { msg: '✓ Installing essential apps only', delay: 700 },
      { msg: '', delay: 300 },
      { msg: 'QUICK INSTALLATION COMPLETE', delay: 500 },
      { msg: 'System Features: Basic desktop, limited file access, essential apps', delay: 200 },
      { msg: 'Missing: Advanced system tools, developer access, customization', delay: 200 },
      { msg: 'Type "reboot" to start WebOS with limited functionality', delay: 0 }
    ];
    
    const executeStep = () => {
      if (step < quickSteps.length) {
        const stepInfo = quickSteps[step];
        setTimeout(() => {
          setLines(prev => [...prev, {
            type: step >= quickSteps.length - 4 ? 'success' : 'system',
            content: stepInfo.msg,
            timestamp: new Date()
          }]);
          step++;
          executeStep();
        }, stepInfo.delay);
      } else {
        // Set installation type for app filtering but don't auto-complete
        localStorage.setItem('webos-installation-type', 'quick');
        localStorage.setItem('archInstalled', 'true');
        
        // Add prompt to manually reboot instead of auto-completing
        setTimeout(() => {
          setLines(prev => [...prev, {
            type: 'system',
            content: '',
            timestamp: new Date()
          }, {
            type: 'input',
            content: 'root@webos-installer:~#',
            timestamp: new Date()
          }]);
        }, 1000);
      }
    };
    
    setTimeout(executeStep, 1000);
  };

  const simulateCustomInstall = () => {
    const customLines: InstallerLine[] = [
      {
        type: 'system',
        content: '=== WebOS Custom Installation ===',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: 'Advanced WebOS installation requiring manual configuration',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '',
        timestamp: new Date()
      },
      {
        type: 'success',
        content: 'ADVANCED CONFIGURATION MODE ENABLED',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: 'This installation requires manual setup of:',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '• Display server and window manager',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '• Desktop environment configuration',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '• Login manager and session management',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '• Application installation and dependencies',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '• User accounts and permissions',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '• Network and system services',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '',
        timestamp: new Date()
      }
    ];
    
    setLines(prev => [...prev, ...customLines]);
    
    let step = 0;
    const customSteps = [
      { msg: '✓ Initializing advanced partitioning scheme', delay: 800 },
      { msg: '✓ Creating /boot (512MB), / (15GB), /home (4GB), swap (512MB)', delay: 600 },
      { msg: '✓ Installing minimal WebOS base system', delay: 1200 },
      { msg: '✓ Setting up package management system', delay: 700 },
      { msg: '✓ Installing development tools and compilers', delay: 900 },
      { msg: '✓ Configuring bootloader with advanced options', delay: 500 },
      { msg: '✓ Setting up user account framework', delay: 400 },
      { msg: '✓ Installing basic system utilities', delay: 600 },
      { msg: '✓ Enabling advanced terminal access', delay: 500 },
      { msg: '✓ Setting up network configuration framework', delay: 400 },
      { msg: '', delay: 300 },
      { msg: 'WEBOS CUSTOM BASE INSTALLATION COMPLETE', delay: 500 },
      { msg: 'System: Minimal WebOS with advanced configuration access', delay: 200 },
      { msg: 'Next: Configure display server and desktop manually', delay: 200 },
      { msg: 'Type "reboot" to start WebOS configuration system', delay: 0 }
    ];
    
    const executeStep = () => {
      if (step < customSteps.length) {
        const stepInfo = customSteps[step];
        setTimeout(() => {
          setLines(prev => [...prev, {
            type: step >= customSteps.length - 4 ? 'success' : 'system',
            content: stepInfo.msg,
            timestamp: new Date()
          }]);
          step++;
          executeStep();
        }, stepInfo.delay);
      } else {
        // Set installation type for custom manual configuration
        localStorage.setItem('webos-installation-type', 'webos-custom');
        localStorage.setItem('webos-console-mode', 'true');
        
        // Add final console prompt for WebOS custom users
        setTimeout(() => {
          setLines(prev => [...prev, {
            type: 'system',
            content: '',
            timestamp: new Date()
          }, {
            type: 'error',
            content: 'CRITICAL: WebOS Custom installation requires MANUAL CONFIGURATION',
            timestamp: new Date()
          }, {
            type: 'system',
            content: 'Base system installed. Desktop environment NOT CONFIGURED.',
            timestamp: new Date()
          }, {
            type: 'system',
            content: 'WARNING: System is INCOMPLETE and UNUSABLE without manual setup.',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '',
            timestamp: new Date()
          }, {
            type: 'system',
            content: 'REQUIRED COMMANDS (MUST BE EXECUTED IN EXACT ORDER):',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '1. webos-init-system (initialize base system)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '2. webos-config-kernel (configure kernel modules)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '3. webos-setup-drivers (setup hardware drivers)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '4. webos-install display-server',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '5. webos-configure-graphics (configure graphics stack)', 
            timestamp: new Date()
          }, {
            type: 'system',
            content: '6. webos-install desktop-environment',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '7. webos-setup-audio (configure audio system)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '8. webos-install login-manager',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '9. webos-configure-permissions (setup user permissions)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '10. webos-install applications',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '11. webos-setup-services (enable system services)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '12. webos-finalize-install (finalize installation)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '13. start-desktop',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '',
            timestamp: new Date()
          }, {
            type: 'error',
            content: 'FAILURE TO FOLLOW ORDER WILL CORRUPT INSTALLATION',
            timestamp: new Date()
          }, {
            type: 'input',
            content: 'root@webos-custom:~#',
            timestamp: new Date()
          }]);
        }, 1000);
      }
    };
    
    setTimeout(executeStep, 1000);
  };

  const simulateArchInstall = () => {
    const archLines: InstallerLine[] = [
      {
        type: 'system',
        content: '=== Arch Linux Base Installation ===',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: 'Installing Arch Linux System becasue you guess will cry',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: 'This installation provides:',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '• Pure Arch Linux base system',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '• Complete terminal access with pacman package manager',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '• Full Linux command line interface',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '• Advanced system administration capabilities',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '',
        timestamp: new Date()
      }
    ];
    
    setLines(prev => [...prev, ...archLines]);
    
    let step = 0;
    const archSteps = [
      { msg: '✓ Verifying boot mode (UEFI detected)', delay: 600 },
      { msg: '✓ Updating system clock via NTP', delay: 500 },
      { msg: '✓ Partitioning /dev/sda (GPT scheme)', delay: 800 },
      { msg: '✓ Formatting /dev/sda1 as EFI (FAT32)', delay: 600 },
      { msg: '✓ Formatting /dev/sda2 as root (ext4)', delay: 700 },
      { msg: '✓ Mounting filesystems (/mnt)', delay: 400 },
      { msg: '✓ Installing base packages via pacstrap', delay: 1200 },
      { msg: '  - base linux linux-firmware', delay: 800 },
      { msg: '  - vim nano networkmanager', delay: 600 },
      { msg: '✓ Generating /etc/fstab', delay: 500 },
      { msg: '✓ Setting up chroot environment', delay: 400 },
      { msg: '✓ Configuring timezone and locale', delay: 600 },
      { msg: '✓ Setting hostname: archlinux-webos', delay: 300 },
      { msg: '✓ Installing GRUB bootloader', delay: 800 },
      { msg: '✓ Enabling NetworkManager service', delay: 400 },
      { msg: '', delay: 300 },
      { msg: 'ARCH LINUX INSTALLATION COMPLETE', delay: 500 },
      { msg: 'System: Minimal Arch Linux with terminal access', delay: 200 },
      { msg: 'Next: Configure desktop environment manually via pacman', delay: 200 },
      { msg: 'Type "arch-guide" to get the installation guide', delay: 0 }
    ];
    
    const executeStep = () => {
      if (step < archSteps.length) {
        const stepInfo = archSteps[step];
        setTimeout(() => {
          setLines(prev => [...prev, {
            type: step >= archSteps.length - 4 ? 'success' : 'system',
            content: stepInfo.msg,
            timestamp: new Date()
          }]);
          step++;
          executeStep();
        }, stepInfo.delay);
      } else {
        // Set installation type for Arch system - requires manual setup
        localStorage.setItem('webos-installation-type', 'arch');
        localStorage.setItem('arch-console-mode', 'true');
        
        // Add final console prompt for Arch users
        setTimeout(() => {
          setLines(prev => [...prev, {
            type: 'system',
            content: '',
            timestamp: new Date()
          }, {
            type: 'error',
            content: 'CRITICAL: Arch Linux base system installed - NO DESKTOP ENVIRONMENT',
            timestamp: new Date()
          }, {
            type: 'system',
            content: 'System is COMPLETELY UNUSABLE without manual configuration.',
            timestamp: new Date()
          }, {
            type: 'system',
            content: 'WARNING: One wrong command will BREAK EVERYTHING.',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '',
            timestamp: new Date()
          }, {
            type: 'system',
            content: 'MANDATORY SETUP SEQUENCE (EXACT ORDER REQUIRED):',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '1. pacman -Syu (update system - MUST be first)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '2. pacman -S base-devel (install build tools)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '3. pacman -S linux-headers (install kernel headers)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '4. pacman -S networkmanager (install network manager)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '5. systemctl enable NetworkManager (enable networking)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '6. pacman -S xorg-server xorg-xinit (install X server)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '7. pacman -S xf86-video-vesa (install video drivers)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '8. pacman -S xf86-input-libinput (install input drivers)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '9. pacman -S pulseaudio pulseaudio-alsa (install audio)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '10. pacman -S plasma-meta (install KDE desktop)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '11. pacman -S kde-applications (install KDE apps)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '12. pacman -S sddm (install display manager)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '13. systemctl enable sddm (enable login manager)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '14. useradd -m -G wheel user (create user account)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '15. passwd user (set user password)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '16. pacman -S sudo (install sudo package)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '17. visudo (edit sudo permissions)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '18. systemctl enable pulseaudio (enable audio service)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '19. mkinitcpio -P (rebuild initramfs)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '20. startx (start desktop)',
            timestamp: new Date()
          }, {
            type: 'system',
            content: '',
            timestamp: new Date()
          }, {
            type: 'error',
            content: 'SKIP ANY STEP = SYSTEM CORRUPTION AND COMPLETE REINSTALL REQUIRED',
            timestamp: new Date()
          }, {
            type: 'system',
            content: 'Commands must be executed in EXACT order. No exceptions.',
            timestamp: new Date()
          }, {
            type: 'input',
            content: 'root@archlinux:~#',
            timestamp: new Date()
          }]);
        }, 1000);
      }
    };
    
    setTimeout(executeStep, 1000);
  };

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    const isArchMode = localStorage.getItem('arch-console-mode') === 'true';
    const isWebOSCustomMode = localStorage.getItem('webos-console-mode') === 'true';
    
    let prompt = 'root@webos-installer:~#';
    if (isArchMode) {
      prompt = 'root@archlinux:~#';
    } else if (isWebOSCustomMode) {
      prompt = 'root@webos-custom:~#';
    }
    
    const commandLine: InstallerLine = {
      type: 'input',
      content: `${prompt} ${trimmedCmd}`,
      timestamp: new Date()
    };

    if (trimmedCmd === 'installwebOS') {
      setLines(prev => [...prev, commandLine]);
      startInstallation();
    } else if (trimmedCmd === 'help' || trimmedCmd === '--help') {
      const helpLines: InstallerLine[] = [
        commandLine,
        {
          type: 'system',
          content: 'WebOS Installation Commands:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'INSTALLATION OPTIONS:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  installwebOS          - Interactive WebOS installation',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  install-webos-quick   - Quick install (limited features)',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  install-webos-custom  - Custom install (full access)',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  install-arch          - Arch Linux base installation',
          timestamp: new Date()
        },
        {
          type: 'system',
            content: '  install-bumblebee     - Bumblebee OS (Ubuntu-based)',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  check-requirements    - Verify system compatibility',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'SYSTEM INFORMATION:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  lsblk                 - List block devices',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  fdisk -l              - List disk partitions',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  lscpu                 - Show CPU information',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  free -h               - Show memory usage',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  df -h                 - Show disk usage',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  uname -a              - Show system information',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'NETWORK COMMANDS:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  ip link               - Show network interfaces',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  ip addr               - Show IP addresses',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  ping google.com       - Test network connectivity',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'For detailed installation guide: man installwebOS',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'ADVANCED COMMANDS:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  grub-install          - Install bootloader',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  mkinitcpio -P         - Generate initramfs',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  timedatectl           - Configure system time',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  locale-gen            - Generate locales',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  hwclock --systohc     - Set hardware clock',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'RECOVERY:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  fix-installation      - Fix broken installations and reset system',
          timestamp: new Date()
        }
      ];
      setLines(prev => [...prev, ...helpLines]);
    } else if (trimmedCmd === 'help' && localStorage.getItem('webos-console-mode') === 'true') {
      const webosHelpLines: InstallerLine[] = [
        commandLine,
        {
          type: 'system',
          content: 'WEBOS CUSTOM INSTALLATION COMMANDS',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '===================================',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'Installation Guide:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '1. webos-install display-server',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '2. webos-install desktop-environment',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '3. webos-install login-manager',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '4. webos-install applications',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '5. start-desktop',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'Other Commands:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  webos-guide (detailed installation guide)',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  ls, cat, chmod, rm, mount, fdisk -l',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  ps aux, free -h, top, journalctl',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  systemctl, timedatectl, hwclock',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  fix-installation (reset all configurations)',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  exit (return to installer)',
          timestamp: new Date()
        }
      ];
      setLines(prev => [...prev, ...webosHelpLines]);
    } else if (trimmedCmd === 'webos-guide' && localStorage.getItem('webos-console-mode') === 'true') {
      const webosGuideLines: InstallerLine[] = [
        commandLine,
        {
          type: 'system',
          content: 'WebOS Custom Post-Installation Guide',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '====================================',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '1. Install display server:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   webos-install display-server',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '2. Install desktop environment:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   webos-install desktop-environment',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '3. Install login manager:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   webos-install login-manager',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '4. Install applications:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   webos-install applications',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '5. Start desktop environment:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   start-desktop',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'IMPORTANT: Install components in order. Each step depends on the previous one.',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'Commands will fail if dependencies are missing.',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'TROUBLESHOOTING:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '• If commands show ERROR, check installation order',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '• Use "fix-installation" to reset all configurations',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '• Use "help" to see all available commands',
          timestamp: new Date()
        }
      ];
      setLines(prev => [...prev, ...webosGuideLines]);
    } else if (trimmedCmd === 'wiki') {
      const wikiLines: InstallerLine[] = [
        commandLine,
        {
          type: 'system',
          content: '════════════════════════════════════════════════════════════════',
          timestamp: new Date()
        },
        {
          type: 'success',
          content: '              WEBOS INSTALLATION WIKI',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '════════════════════════════════════════════════════════════════',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '1. INSTALLATION COMMANDS',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '──────────────────────────',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'install-webos-quick      Quick WebOS installation (recommended)',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  • Automatic installation with basic features',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  • Ready-to-use desktop environment',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  • Standard applications included',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'install-webos-custom     Advanced WebOS with manual configuration',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  • Requires step-by-step setup via console commands',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  • Commands: webos-install display-server/desktop-environment/login-manager/applications',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  • Use "webos-guide" for detailed instructions',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  • Complete with "start-desktop"',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'install-bumblebee        Bumblebee OS (Ubuntu-based)',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  • Ubuntu 22.04 LTS base system',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  • GNOME desktop with custom themes',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  • Gaming optimizations and multimedia support',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  • Developer tools and productivity apps',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'install-arch             Arch Linux installation (expert)',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  • Minimal base system installation',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  • Manual configuration required for desktop',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  • Commands: pacman -S package-name, systemctl enable/start',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  • Use "arch-guide" for step-by-step instructions',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '2. ARCH LINUX CONSOLE COMMANDS',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '─────────────────────────────────────────────────',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'pacman -S base-devel     Install development tools',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'pacman -S networkmanager Install network management',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'pacman -S xorg-server xorg-xinit  Install X display server',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'pacman -S plasma-desktop kde-applications  Install KDE desktop',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'pacman -S sddm           Install display manager',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'systemctl enable sddm    Enable display manager',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'systemctl start sddm     Start graphical login',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'startx                   Start desktop manually (alternative)',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '3. WEBOS CUSTOM CONSOLE COMMANDS',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '─────────────────────────────────────────────────────────────',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'webos-install display-server     Install Wayland display server',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'webos-install desktop-environment Install WebOS shell and compositor',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'webos-install login-manager      Install WebOS login system',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'webos-install applications       Install core applications',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'start-desktop                    Launch WebOS desktop',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '4. SYSTEM ADMINISTRATION COMMANDS',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '─────────────────────────────────',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'ls, cat, chmod, rm       File operations',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'mount, fdisk -l          Disk and filesystem management',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'ps aux, free -h, top     System monitoring',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'journalctl               View system logs',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'timedatectl, hwclock     Time and date management',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'useradd, passwd          User management',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'nano, vim                Text editors',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '5. UTILITY COMMANDS',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '──────────────────',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'help                     Show basic command overview',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'wiki                     Show this comprehensive reference',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'arch-guide               Detailed Arch Linux installation guide',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'webos-guide              Detailed WebOS custom installation guide',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'check-requirements       Verify system compatibility',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'lsblk                    List storage devices',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'fix-installation         Reset all configurations and start fresh',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'exit                     Return to main installer',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'reboot                   Complete installation and start system',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '6. INSTALLATION FLOW EXAMPLES',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '─────────────────────────────',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'Quick WebOS: install-webos-quick → reboot',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'Bumblebee: install-bumblebee → reboot',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'Custom WebOS: install-webos-custom → webos-install display-server →',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  webos-install desktop-environment → webos-install login-manager →',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  webos-install applications → start-desktop',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'Arch Linux: install-arch → pacman -S base-devel → pacman -S networkmanager →',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  pacman -S xorg-server xorg-xinit → pacman -S plasma-desktop →',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '  pacman -S sddm → systemctl enable sddm → systemctl start sddm',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '════════════════════════════════════════════════════════════════',
          timestamp: new Date()
        },
        {
          type: 'success',
          content: '            END OF WIKI :D - Use "help" for quick reference',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '════════════════════════════════════════════════════════════════',
          timestamp: new Date()
        }
      ];
      setLines(prev => [...prev, ...wikiLines]);
    } else if (trimmedCmd === 'fix-installation') {
      const fixLines: InstallerLine[] = [
        commandLine,
        {
          type: 'system',
          content: 'WebOS Installation Recovery Tool',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '=================================',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'Diagnosing system state...',
          timestamp: new Date()
        },
        {
          type: 'success',
          content: '✓ Checking filesystem integrity',
          timestamp: new Date()
        },
        {
          type: 'success',
          content: '✓ Verifying partition table',
          timestamp: new Date()
        },
        {
          type: 'success',
          content: '✓ Clearing temporary files',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'Resetting installation environment...',
          timestamp: new Date()
        },
        {
          type: 'success',
          content: '✓ Package cache cleared',
          timestamp: new Date()
        },
        {
          type: 'success',
          content: '✓ Installation locks removed',
          timestamp: new Date()
        },
        {
          type: 'success',
          content: '✓ System state restored to clean state',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'success',
          content: 'RECOVERY COMPLETE: System ready for fresh installation',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'You can now run any installation command safely.',
          timestamp: new Date()
        }
      ];
      
      setLines(prev => [...prev, ...fixLines]);
      
      // Clear any problematic states
      localStorage.removeItem('arch-console-mode');
      localStorage.removeItem('webos-installation-type');
      localStorage.removeItem('installation-corrupted');
      localStorage.removeItem('arch-desktop-corrupted');
      localStorage.removeItem('arch-networkmanager-installed');
      localStorage.removeItem('arch-basedevel-installed');
      localStorage.removeItem('arch-bootloader-broken');
      localStorage.removeItem('arch-system-corrupted');
      localStorage.removeItem('arch-xorg-installed');
      localStorage.removeItem('arch-sddm-installed');
      localStorage.removeItem('arch-sddm-enabled');
      localStorage.removeItem('arch-plasma-installed');
      localStorage.removeItem('arch-permissions-broken');
      localStorage.removeItem('webos-display-installed');
      localStorage.removeItem('webos-desktop-installed');
      localStorage.removeItem('webos-login-installed');
      localStorage.removeItem('webos-apps-installed');
      
    } else if (trimmedCmd === 'install-webos-quick') {
      setLines(prev => [...prev, commandLine]);
      showLoadingAnimation(() => simulateQuickInstall());
    } else if (trimmedCmd === 'install-webos-custom') {
      setLines(prev => [...prev, commandLine]);
      showLoadingAnimation(() => simulateCustomInstall());
    } else if (trimmedCmd === 'install-bumblebee') {
      setLines(prev => [...prev, commandLine]);
      showLoadingAnimation(() => simulateBumblebeeInstall());
    } else if (trimmedCmd === 'install-arch') {
      setLines(prev => [...prev, commandLine]);
      showLoadingAnimation(() => simulateArchInstall());
    } else if (trimmedCmd === 'check-requirements') {
      const reqLines: InstallerLine[] = [
        commandLine,
        {
          type: 'system',
          content: 'WebOS System Requirements Check',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '================================',
          timestamp: new Date()
        },
        {
          type: 'success',
          content: '✓ CPU: x86_64 architecture detected',
          timestamp: new Date()
        },
        {
          type: 'success',
          content: '✓ RAM: 8GB available (4GB minimum required)',
          timestamp: new Date()
        },
        {
          type: 'success',
          content: '✓ Storage: 20GB available (10GB minimum required)',
          timestamp: new Date()
        },
        {
          type: 'success',
          content: '✓ Network: Internet connection active',
          timestamp: new Date()
        },
        {
          type: 'success',
          content: '✓ Graphics: Hardware acceleration supported',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'success',
          content: 'System Status: READY FOR WEBOS INSTALLATION',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'Run "installwebOS" to begin installation process.',
          timestamp: new Date()
        }
      ];
      setLines(prev => [...prev, ...reqLines]);
    } else if (trimmedCmd === 'lsblk') {
      const lsblkLines: InstallerLine[] = [
        commandLine,
        {
          type: 'system',
          content: 'NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: 'sda      8:0    0   20G  0 disk',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '├─sda1   8:1    0  512M  0 part',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '└─sda2   8:2    0 19.5G  0 part',
          timestamp: new Date()
        }
      ];
      setLines(prev => [...prev, ...lsblkLines]);
    } else if (trimmedCmd === 'webos-init-system' && localStorage.getItem('webos-console-mode') === 'true') {
      if (localStorage.getItem('webos-system-corrupted')) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'SYSTEM CORRUPTED: Cannot initialize.',
          timestamp: new Date()
        }]);
        return;
      }
      
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Initializing WebOS base system...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Loading kernel modules...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Setting up system directories...',
        timestamp: new Date()
      }, {
        type: 'success',
        content: 'Base system initialized successfully',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'NEXT: Run "webos-config-kernel" immediately.',
        timestamp: new Date()
      }]);
      localStorage.setItem('webos-system-initialized', 'true');
    } else if (trimmedCmd === 'webos-config-kernel' && localStorage.getItem('webos-console-mode') === 'true') {
      if (!localStorage.getItem('webos-system-initialized')) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'FATAL: Base system not initialized.',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'Must run "webos-init-system" first.',
          timestamp: new Date()
        }]);
        localStorage.setItem('webos-system-corrupted', 'true');
        return;
      }
      
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Configuring kernel modules...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Loading graphics drivers...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Configuring hardware support...',
        timestamp: new Date()
      }, {
        type: 'success',
        content: 'Kernel configuration complete',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'NEXT: Run "webos-setup-drivers" immediately.',
        timestamp: new Date()
      }]);
      localStorage.setItem('webos-kernel-configured', 'true');
    } else if (trimmedCmd === 'webos-setup-drivers' && localStorage.getItem('webos-console-mode') === 'true') {
      if (!localStorage.getItem('webos-kernel-configured')) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'FATAL: Kernel not configured.',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'Must run "webos-config-kernel" first.',
          timestamp: new Date()
        }]);
        localStorage.setItem('webos-system-corrupted', 'true');
        return;
      }
      
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Setting up hardware drivers...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Installing GPU drivers...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Configuring input devices...',
        timestamp: new Date()
      }, {
        type: 'success',
        content: 'Hardware drivers configured',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'NEXT: Run "webos-install display-server" immediately.',
        timestamp: new Date()
      }]);
      localStorage.setItem('webos-drivers-setup', 'true');
    } else if (trimmedCmd === 'webos-configure-graphics' && localStorage.getItem('webos-console-mode') === 'true') {
      if (!localStorage.getItem('webos-display-installed')) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'FATAL: Display server not installed.',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'Cannot configure graphics without display server.',
          timestamp: new Date()
        }]);
        localStorage.setItem('webos-system-corrupted', 'true');
        return;
      }
      
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Configuring graphics stack...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Setting up GPU acceleration...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Configuring display resolution...',
        timestamp: new Date()
      }, {
        type: 'success',
        content: 'Graphics configuration complete',
        timestamp: new Date()
      }]);
      localStorage.setItem('webos-graphics-configured', 'true');
    } else if (trimmedCmd === 'webos-setup-audio' && localStorage.getItem('webos-console-mode') === 'true') {
      if (!localStorage.getItem('webos-desktop-installed')) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'FATAL: Desktop environment not installed.',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'Cannot setup audio without desktop.',
          timestamp: new Date()
        }]);
        localStorage.setItem('webos-system-corrupted', 'true');
        return;
      }
      
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Setting up audio system...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Configuring audio drivers...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Setting up sound cards...',
        timestamp: new Date()
      }, {
        type: 'success',
        content: 'Audio system configured',
        timestamp: new Date()
      }]);
      localStorage.setItem('webos-audio-setup', 'true');
    } else if (trimmedCmd === 'webos-configure-permissions' && localStorage.getItem('webos-console-mode') === 'true') {
      if (!localStorage.getItem('webos-login-installed')) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'FATAL: Login manager not installed.',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'Cannot configure permissions without login manager.',
          timestamp: new Date()
        }]);
        localStorage.setItem('webos-system-corrupted', 'true');
        return;
      }
      
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Configuring user permissions...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Setting up access controls...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Configuring security policies...',
        timestamp: new Date()
      }, {
        type: 'success',
        content: 'Permissions configured',
        timestamp: new Date()
      }]);
      localStorage.setItem('webos-permissions-configured', 'true');
    } else if (trimmedCmd === 'webos-setup-services' && localStorage.getItem('webos-console-mode') === 'true') {
      if (!localStorage.getItem('webos-apps-installed')) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'FATAL: Applications not installed.',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'Cannot setup services without applications.',
          timestamp: new Date()
        }]);
        localStorage.setItem('webos-system-corrupted', 'true');
        return;
      }
      
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Setting up system services...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Enabling background services...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Configuring startup programs...',
        timestamp: new Date()
      }, {
        type: 'success',
        content: 'Services configured',
        timestamp: new Date()
      }]);
      localStorage.setItem('webos-services-setup', 'true');
    } else if (trimmedCmd === 'webos-finalize-install' && localStorage.getItem('webos-console-mode') === 'true') {
      if (!localStorage.getItem('webos-services-setup')) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'FATAL: Services not configured.',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'Cannot finalize without all services.',
          timestamp: new Date()
        }]);
        localStorage.setItem('webos-system-corrupted', 'true');
        return;
      }
      
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Finalizing installation...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Running system checks...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Optimizing performance...',
        timestamp: new Date()
      }, {
        type: 'success',
        content: 'Installation finalized',
        timestamp: new Date()
      }]);
      localStorage.setItem('webos-install-finalized', 'true');
    } else if (trimmedCmd.startsWith('webos-install ') && localStorage.getItem('webos-console-mode') === 'true') {
      const packages = trimmedCmd.substring(14).trim();
      
      if (packages.includes('display-server')) {
        const displayLines: InstallerLine[] = [
          commandLine,
          {
            type: 'system',
            content: 'Installing WebOS display server...',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Packages: wayland-server wayland-compositor',
            timestamp: new Date()
          },
          {
            type: 'success',
            content: 'Display server installed successfully',
            timestamp: new Date()
          }
        ];
        setLines(prev => [...prev, ...displayLines]);
        localStorage.setItem('webos-display-installed', 'true');
      } else if (packages.includes('desktop-environment')) {
        const hasDisplay = localStorage.getItem('webos-display-installed') === 'true';
        
        if (!hasDisplay) {
          setLines(prev => [...prev, commandLine, {
            type: 'error',
            content: 'ERROR',
            timestamp: new Date()
          }]);
        } else {
          const desktopLines: InstallerLine[] = [
            commandLine,
            {
              type: 'system',
              content: 'Installing WebOS desktop environment...',
              timestamp: new Date()
            },
            {
              type: 'system',
              content: 'Packages: webos-shell webos-compositor webos-apps',
              timestamp: new Date()
            },
            {
              type: 'success',
              content: 'Desktop environment installed successfully',
              timestamp: new Date()
            }
          ];
          setLines(prev => [...prev, ...desktopLines]);
          localStorage.setItem('webos-desktop-installed', 'true');
        }
      } else if (packages.includes('login-manager')) {
        const loginLines: InstallerLine[] = [
          commandLine,
          {
            type: 'system',
            content: 'Installing WebOS login manager...',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Packages: webos-greeter webos-session',
            timestamp: new Date()
          },
          {
            type: 'success',
            content: 'Login manager installed successfully',
            timestamp: new Date()
          }
        ];
        setLines(prev => [...prev, ...loginLines]);
        localStorage.setItem('webos-login-installed', 'true');
      } else if (packages.includes('applications')) {
        const appLines: InstallerLine[] = [
          commandLine,
          {
            type: 'system',
            content: 'Installing WebOS applications...',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Packages: browser terminal filemanager calculator',
            timestamp: new Date()
          },
          {
            type: 'success',
            content: 'Applications installed successfully',
            timestamp: new Date()
          }
        ];
        setLines(prev => [...prev, ...appLines]);
        localStorage.setItem('webos-apps-installed', 'true');
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
      }
    } else if (trimmedCmd === 'pacman -Syu' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: ':: Synchronizing package databases...',
        timestamp: new Date()
      }, {
        type: 'system', 
        content: ' core is up to date',
        timestamp: new Date()
      }, {
        type: 'system',
        content: ' extra is up to date', 
        timestamp: new Date()
      }, {
        type: 'system',
        content: ' community is up to date',
        timestamp: new Date()
      }, {
        type: 'system',
        content: ':: Starting full system upgrade...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'resolving dependencies...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'looking for conflicting packages...',
        timestamp: new Date()
      }, {
        type: 'success',
        content: 'there is nothing to do',
        timestamp: new Date()
      }]);
      localStorage.setItem('arch-system-updated', 'true');
    } else if (trimmedCmd.startsWith('pacman -S ') && localStorage.getItem('arch-console-mode') === 'true') {
      const packages = trimmedCmd.substring(10).trim();
      
      // Check if system update was done first - CRITICAL ORDER REQUIREMENT
      if (!localStorage.getItem('arch-system-updated')) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'FATAL ERROR: System not updated. Installation corrupted.',
          timestamp: new Date()
        }, {
          type: 'error', 
          content: 'Must run "pacman -Syu" FIRST or system will be unstable.',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'SYSTEM CORRUPTION DETECTED. Complete reinstall required.',
          timestamp: new Date()
        }]);
        localStorage.setItem('arch-system-corrupted', 'true');
        return;
      }
      
      // Check for system corruption flag
      if (localStorage.getItem('arch-system-corrupted')) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'SYSTEM CORRUPTED: Cannot install packages.',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'Installation order was violated earlier.',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'COMPLETE REINSTALL REQUIRED.',
          timestamp: new Date()
        }]);
        return;
      }
      
      if (packages.includes('base-devel')) {
        const baseDevLines: InstallerLine[] = [
          commandLine,
          {
            type: 'system',
            content: 'resolving dependencies...',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'looking for conflicting packages...',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: '',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Packages (24) autoconf-2.71-4  automake-1.16.5-2  binutils-2.40-4',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: '             bison-3.8.2-5  fakeroot-1.31-2  flex-2.6.4-5',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: '             gcc-13.1.1-1  libtool-2.4.7-5  m4-1.4.19-3',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: '             make-4.4.1-2  patch-2.7.6-8  pkgconf-1.9.5-1',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: '',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Total Download Size:   156.2 MiB',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Total Installed Size:  823.4 MiB',
            timestamp: new Date()
          },
          {
            type: 'success',
            content: '(24/24) installing base-devel                    [######################] 100%',
            timestamp: new Date()
          },
          {
            type: 'success',
            content: 'Development tools installation complete!',
            timestamp: new Date()
          }
        ];
        setLines(prev => [...prev, ...baseDevLines]);
        localStorage.setItem('arch-basedevel-installed', 'true');
      } else if (packages.includes('networkmanager')) {
        const networkLines: InstallerLine[] = [
          commandLine,
          {
            type: 'system',
            content: 'resolving dependencies...',
            timestamp: new Date()
          },
          {
            type: 'success',
            content: '(1/1) installing networkmanager               [######################] 100%',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Enable network service: systemctl enable NetworkManager',
            timestamp: new Date()
          }
        ];
        setLines(prev => [...prev, ...networkLines]);
        localStorage.setItem('arch-networkmanager-installed', 'true');
      } else if (packages.includes('xorg-server') || packages.includes('xorg-xinit')) {
        const xorgLines: InstallerLine[] = [
          commandLine,
          {
            type: 'system',
            content: 'resolving dependencies...',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'looking for conflicting packages...',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Packages (35) xorg-server-21.1.11-1  xorg-xinit-1.4.2-1',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Total Download Size:   15.2 MiB',
            timestamp: new Date()
          },
          {
            type: 'success',
            content: '(35/35) installing xorg-server               [######################] 100%',
            timestamp: new Date()
          }
        ];
        setLines(prev => [...prev, ...xorgLines]);
        localStorage.setItem('arch-xorg-installed', 'true');
      } else if (packages.includes('sddm')) {
        const sddmLines: InstallerLine[] = [
          commandLine,
          {
            type: 'system',
            content: 'resolving dependencies...',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Packages (8) sddm-0.20.0-3  qt5-declarative-5.15.12-1',
            timestamp: new Date()
          },
          {
            type: 'success',
            content: '(8/8) installing sddm                        [######################] 100%',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Enable with: systemctl enable sddm',
            timestamp: new Date()
          }
        ];
        setLines(prev => [...prev, ...sddmLines]);
        localStorage.setItem('arch-sddm-installed', 'true');
      } else if (packages.includes('plasma-desktop') || packages.includes('kde-applications')) {
        const plasmaLines: InstallerLine[] = [
          commandLine,
          {
            type: 'system',
            content: 'resolving dependencies...',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'looking for conflicting packages...',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Packages (200+) plasma-desktop-5.27.10-1  kde-applications-meta-1.0-1',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Total Download Size:   1.2 GiB',
            timestamp: new Date()
          },
          {
            type: 'success',
            content: '(200+/200+) installing plasma-desktop         [######################] 100%',
            timestamp: new Date()
          }
        ];
        setLines(prev => [...prev, ...plasmaLines]);
        localStorage.setItem('arch-plasma-installed', 'true');
      } else if (packages.includes('firefox') || packages.includes('chromium')) {
        const browserName = packages.includes('firefox') ? 'firefox' : 'chromium';
        const browserLines: InstallerLine[] = [
          commandLine,
          {
            type: 'system',
            content: 'resolving dependencies...',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'looking for conflicting packages...',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: `Packages (45) ${browserName}-121.0-1  nss-3.96-1  gtk3-3.24.38-1`,
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Total Download Size:   89.3 MiB',
            timestamp: new Date()
          },
          {
            type: 'success',
            content: `(45/45) installing ${browserName}                  [######################] 100%`,
            timestamp: new Date()
          }
        ];
        setLines(prev => [...prev, ...browserLines]);
      } else if (packages.includes('xorg') && packages.includes('plasma-desktop')) {
        // Check if networkmanager was installed first - common bug trigger
        const hasNetworkManager = localStorage.getItem('arch-networkmanager-installed') === 'true';
        const hasBaseDevel = localStorage.getItem('arch-basedevel-installed') === 'true';
        
        const installLines: InstallerLine[] = [
          commandLine,
          {
            type: 'system',
            content: 'resolving dependencies...',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'looking for conflicting packages...',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: '',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Packages (127) accountsservice-22.07.5-2  appstream-0.16.4-1',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: '              bluedevil-5.27.10-1  breeze-5.27.10-1',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: '              drkonqi-5.27.10-1  kde-gtk-config-5.27.10-1',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: '              plasma-desktop-5.27.10-1  xorg-server-21.1.11-1',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: '',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Total Download Size:   0.87 GiB',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: 'Total Installed Size:  3.21 GiB',
            timestamp: new Date()
          },
          {
            type: 'system',
            content: '',
            timestamp: new Date()
          }
        ];
        
        setLines(prev => [...prev, ...installLines]);
        
        // Simulate installation process with potential issues
        setTimeout(() => {
          const proceedLines: InstallerLine[] = [
            {
              type: 'system',
              content: ':: Proceed with installation? [Y/n] Y',
              timestamp: new Date()
            },
            {
              type: 'system',
              content: ':: Retrieving packages...',
              timestamp: new Date()
            },
            {
              type: 'success',
              content: ' xorg-server-21.1.11-1-x86_64      2.1 MiB  1024 KiB/s 00:02',
              timestamp: new Date()
            },
            {
              type: 'success',
              content: ' plasma-desktop-5.27.10-1-x86_64  45.2 MiB  1024 KiB/s 00:45',
              timestamp: new Date()
            },
            {
              type: 'system',
              content: ':: Installing packages...',
              timestamp: new Date()
            }
          ];
          setLines(prev => [...prev, ...proceedLines]);
          
          setTimeout(() => {
            if (!hasNetworkManager || !hasBaseDevel) {
              // Installation completes but with dependency warnings
              const problemLines: InstallerLine[] = [
                {
                  type: 'success',
                  content: '(127/127) installing plasma-desktop              [######################] 100%',
                  timestamp: new Date()
                },
                {
                  type: 'system',
                  content: '',
                  timestamp: new Date()
                },
                {
                  type: 'error',
                  content: 'WARNING: Missing critical dependencies detected',
                  timestamp: new Date()
                },
                {
                  type: 'system',
                  content: '',
                  timestamp: new Date()
                },
                {
                  type: 'system',
                  content: 'Desktop environment installed with warnings.',
                  timestamp: new Date()
                },
                {
                  type: 'system',
                  content: 'Run "fix-installation" if desktop fails to start.',
                  timestamp: new Date()
                }
              ];
              
              // Add specific error messages based on missing dependencies
              const additionalErrors: InstallerLine[] = [];
              
              if (!hasNetworkManager) {
                additionalErrors.push({
                  type: 'error' as const,
                  content: 'ERROR',
                  timestamp: new Date()
                });
              }
              
              if (!hasBaseDevel) {
                additionalErrors.push({
                  type: 'error' as const,
                  content: 'ERROR',
                  timestamp: new Date()
                });
              }
              
              // Insert error messages after the warning line
              const finalLines = [
                ...problemLines.slice(0, 4),
                ...additionalErrors,
                ...problemLines.slice(4)
              ];
              
              setLines(prev => [...prev, ...finalLines]);
              localStorage.setItem('arch-desktop-corrupted', 'true');
            } else {
              const completeLines: InstallerLine[] = [
                {
                  type: 'success',
                  content: '(127/127) installing plasma-desktop              [######################] 100%',
                  timestamp: new Date()
                },
                {
                  type: 'system',
                  content: '',
                  timestamp: new Date()
                },
                {
                  type: 'success',
                  content: 'KDE Plasma Desktop installation complete!',
                  timestamp: new Date()
                },
                {
                  type: 'system',
                  content: 'Enable display manager: systemctl enable sddm',
                  timestamp: new Date()
                },
                {
                  type: 'system',
                  content: 'Start desktop session: systemctl start sddm',
                  timestamp: new Date()
                },
                {
                  type: 'system',
                  content: 'Or type "startx" to launch desktop environment.',
                  timestamp: new Date()
                }
              ];
              setLines(prev => [...prev, ...completeLines]);
            }
          }, 3000);
        }, 2000);
        
      } else {
        // Regular package installation
        const installLines: InstallerLine[] = [
          commandLine,
          {
            type: 'system',
            content: `resolving dependencies...`,
            timestamp: new Date()
          },
          {
            type: 'system',
            content: `looking for conflicting packages...`,
            timestamp: new Date()
          },
          {
            type: 'success',
            content: `(1/1) installing ${packages}                 [######################] 100%`,
            timestamp: new Date()
          }
        ];
        setLines(prev => [...prev, ...installLines]);
      }
    } else if (trimmedCmd === 'start-desktop' && localStorage.getItem('webos-console-mode') === 'true') {
      const hasDisplay = localStorage.getItem('webos-display-installed') === 'true';
      const hasDesktop = localStorage.getItem('webos-desktop-installed') === 'true';
      const hasLogin = localStorage.getItem('webos-login-installed') === 'true';
      
      if (!hasDisplay) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
      } else if (!hasDesktop) {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: 'Starting display server...',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
      } else if (!hasLogin) {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: 'Starting WebOS desktop...',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'success',
          content: 'Starting WebOS Desktop Environment...',
          timestamp: new Date()
        }, {
          type: 'system',
          content: 'Loading WebOS shell and applications...',
          timestamp: new Date()
        }]);
        
        setTimeout(() => {
          localStorage.removeItem('webos-console-mode');
          localStorage.setItem('webos-installation-type', 'custom');
          onInstallComplete();
        }, 3000);
      }
    } else if (trimmedCmd === 'startx' && localStorage.getItem('arch-console-mode') === 'true') {
      const hasXorg = localStorage.getItem('arch-xorg-installed') === 'true';
      const hasPlasma = localStorage.getItem('arch-plasma-installed') === 'true';
      const isCorrupted = localStorage.getItem('arch-desktop-corrupted') === 'true';
      
      if (!hasXorg) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
      } else if (!hasPlasma) {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: 'Starting X server...',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
      } else if (isCorrupted) {
        const errorLines: InstallerLine[] = [
          commandLine,
          {
            type: 'system',
            content: 'Starting X server...',
            timestamp: new Date()
          },
          {
            type: 'error',
            content: 'ERROR',
            timestamp: new Date()
          }
        ];
        setLines(prev => [...prev, ...errorLines]);
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'success',
          content: 'Starting KDE Plasma Desktop Environment...',
          timestamp: new Date()
        }, {
          type: 'system',
          content: 'Loading desktop session...',
          timestamp: new Date()
        }]);
        
        setTimeout(() => {
          localStorage.removeItem('arch-console-mode');
          localStorage.setItem('webos-installation-type', 'arch-desktop');
          onInstallComplete();
        }, 3000);
      }
    } else if (trimmedCmd === 'systemctl start sddm' && localStorage.getItem('arch-console-mode') === 'true') {
      const hasSddm = localStorage.getItem('arch-sddm-installed') === 'true';
      const sddmEnabled = localStorage.getItem('arch-sddm-enabled') === 'true';
      const hasXorg = localStorage.getItem('arch-xorg-installed') === 'true';
      const hasPlasma = localStorage.getItem('arch-plasma-installed') === 'true';
      
      if (!hasSddm) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
      } else if (!sddmEnabled) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
      } else if (!hasXorg || !hasPlasma) {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: 'Starting Simple Desktop Display Manager...',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'success',
          content: 'Starting Simple Desktop Display Manager...',
          timestamp: new Date()
        }, {
          type: 'success',
          content: 'SDDM started successfully',
          timestamp: new Date()
        }, {
          type: 'system',
          content: 'Login screen available',
          timestamp: new Date()
        }]);
        
        setTimeout(() => {
          localStorage.removeItem('arch-console-mode');
          localStorage.setItem('webos-installation-type', 'arch-desktop');
          onInstallComplete();
        }, 3000);
      }
    } else if (trimmedCmd.startsWith('systemctl ') && localStorage.getItem('arch-console-mode') === 'true') {
      const parts = trimmedCmd.split(' ');
      const action = parts[1];
      const service = parts[2] || '';
      
      if (action === 'enable' && service === 'NetworkManager') {
        setLines(prev => [...prev, commandLine, {
          type: 'success',
          content: 'Created symlink /etc/systemd/system/multi-user.target.wants/NetworkManager.service',
          timestamp: new Date()
        }, {
          type: 'system',
          content: 'Network service enabled - will start on boot',
          timestamp: new Date()
        }]);
      } else if (action === 'enable' && service === 'sddm') {
        const hasSddm = localStorage.getItem('arch-sddm-installed') === 'true';
        
        if (!hasSddm) {
          setLines(prev => [...prev, commandLine, {
            type: 'error',
            content: 'ERROR',
            timestamp: new Date()
          }]);
        } else {
          setLines(prev => [...prev, commandLine, {
            type: 'success',
            content: 'Created symlink /etc/systemd/system/display-manager.service',
            timestamp: new Date()
          }, {
            type: 'system',
            content: 'Display manager enabled - will start on boot',
            timestamp: new Date()
          }]);
          localStorage.setItem('arch-sddm-enabled', 'true');
        }
      } else if (action === 'start' && service === 'NetworkManager') {
        setLines(prev => [...prev, commandLine, {
          type: 'success',
          content: 'NetworkManager started successfully',
          timestamp: new Date()
        }, {
          type: 'system',
          content: 'Network connectivity restored',
          timestamp: new Date()
        }]);
      } else if (action === 'status') {
        const statusLines: InstallerLine[] = [
          commandLine,
          {
            type: 'system',
            content: `● ${service || 'system'}.service - Service Status`,
            timestamp: new Date()
          },
          {
            type: 'success',
            content: '   Loaded: loaded (/usr/lib/systemd/system)',
            timestamp: new Date()
          },
          {
            type: 'success',
            content: '   Active: active (running) since now',
            timestamp: new Date()
          }
        ];
        setLines(prev => [...prev, ...statusLines]);
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: 'systemctl [enable|disable|start|stop|status] [service]',
          timestamp: new Date()
        }]);
      }
    } else if (trimmedCmd === 'pacman' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'usage:  pacman <operation> [...]',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'operations:',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '    pacman -S <pkg>      install package',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '    pacman -R <pkg>      remove package',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '    pacman -Syu          upgrade system',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '    pacman -Q            list installed packages',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '    pacman -Ss <query>   search packages',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'pacman -Q' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'linux 6.6.8.arch1-1',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'base 3-2',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'linux-firmware 20231211.2b92df7-1',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'networkmanager 1.44.2-3',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd.startsWith('pacman -Ss ') && localStorage.getItem('arch-console-mode') === 'true') {
      const query = trimmedCmd.substring(11).trim();
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: `extra/${query} 1.0.0-1`,
        timestamp: new Date()
      }, {
        type: 'system',
        content: `    Package containing ${query}`,
        timestamp: new Date()
      }]);
    } else if (trimmedCmd.startsWith('pacman -R ') && localStorage.getItem('arch-console-mode') === 'true') {
      const package_name = trimmedCmd.substring(10).trim();
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: `checking dependencies...`,
        timestamp: new Date()
      }, {
        type: 'system',
        content: `Packages (1) ${package_name}-1.0.0-1`,
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Total Removed Size:  12.34 MiB',
        timestamp: new Date()
      }, {
        type: 'success',
        content: `removing ${package_name}...`,
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'lscpu' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Architecture:            x86_64',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'CPU op-mode(s):          32-bit, 64-bit',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'CPU(s):                  8',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Model name:              Intel(R) Core(TM) i7-9700K',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'lsblk' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'sda      8:0    0   500G  0 disk',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '├─sda1   8:1    0   512M  0 part /boot',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '└─sda2   8:2    0 499.5G  0 part /',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'free -h' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: '              total        used        free      shared  buff/cache   available',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Mem:           16Gi       2.1Gi        12Gi       145Mi       1.8Gi        13Gi',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Swap:         8.0Gi          0B       8.0Gi',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'df -h' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Filesystem      Size  Used Avail Use% Mounted on',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '/dev/sda2       490G  8.2G  456G   2% /',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '/dev/sda1       511M   31M  481M   7% /boot',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'ip addr' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '    inet 127.0.0.1/8 scope host lo',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '2: enp3s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '    inet 192.168.1.100/24 brd 192.168.1.255 scope global enp3s0',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'fdisk -l' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Disk /dev/sda: 500 GiB, 536870912000 bytes, 1048576000 sectors',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Disk model: Samsung SSD 980',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Units: sectors of 1 * 512 = 512 bytes',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Sector size (logical/physical): 512 bytes / 512 bytes',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'I/O size (minimum/optimal): 512 bytes / 512 bytes',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Disklabel type: gpt',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Device       Start        End    Sectors   Size Type',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '/dev/sda1     2048    1050623    1048576   512M EFI System',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '/dev/sda2  1050624 1048575999 1047525376 499.5G Linux filesystem',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'uname -a' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Linux archlinux 6.6.8-arch1-1 #1 SMP PREEMPT_DYNAMIC Mon, 18 Dec 2023 22:21:31 +0000 x86_64 GNU/Linux',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'ip link' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '2: enp3s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd.startsWith('ping ') && localStorage.getItem('arch-console-mode') === 'true') {
      const target = trimmedCmd.substring(5).trim();
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: `PING ${target} (8.8.8.8) 56(84) bytes of data.`,
        timestamp: new Date()
      }, {
        type: 'system',
        content: `64 bytes from ${target} (8.8.8.8): icmp_seq=1 ttl=55 time=12.4 ms`,
        timestamp: new Date()
      }, {
        type: 'system',
        content: `64 bytes from ${target} (8.8.8.8): icmp_seq=2 ttl=55 time=11.8 ms`,
        timestamp: new Date()
      }, {
        type: 'system',
        content: `64 bytes from ${target} (8.8.8.8): icmp_seq=3 ttl=55 time=13.1 ms`,
        timestamp: new Date()
      }, {
        type: 'system',
        content: '^C',
        timestamp: new Date()
      }, {
        type: 'system',
        content: `--- ${target} ping statistics ---`,
        timestamp: new Date()
      }, {
        type: 'success',
        content: '3 packets transmitted, 3 received, 0% packet loss, time 2003ms',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'grub-install' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Installing for x86_64-efi platform.',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Installation finished. No error reported.',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'mkinitcpio -P' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: '==> Building image from preset: /etc/mkinitcpio.d/linux.preset: \'default\'',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '  -> -k /boot/vmlinuz-linux -c /etc/mkinitcpio.conf -g /boot/initramfs-linux.img',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '==> Starting build: 6.6.8-arch1-1',
        timestamp: new Date()
      }, {
        type: 'success',
        content: '==> Build complete.',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'timedatectl' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: '                      Local time: Mon 2024-01-15 19:30:45 UTC',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '                  Universal time: Mon 2024-01-15 19:30:45 UTC',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '                        RTC time: Mon 2024-01-15 19:30:45',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '                       Time zone: UTC (UTC, +0000)',
        timestamp: new Date()
      }, {
        type: 'success',
        content: '       Network time on: yes',
        timestamp: new Date()
      }, {
        type: 'success',
        content: 'NTP synchronized: yes',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'locale-gen' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Generating locales...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '  en_US.UTF-8... done',
        timestamp: new Date()
      }, {
        type: 'success',
        content: 'Generation complete.',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'ls' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'bin  boot  dev  etc  home  lib  lib64  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd.startsWith('ls ') && localStorage.getItem('arch-console-mode') === 'true') {
      const path = trimmedCmd.substring(3).trim();
      if (path === '/boot') {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: 'grub  initramfs-linux-fallback.img  initramfs-linux.img  vmlinuz-linux',
          timestamp: new Date()
        }]);
      } else if (path === '/etc') {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: 'passwd  shadow  group  hostname  hosts  fstab  locale.conf  vconsole.conf',
          timestamp: new Date()
        }]);
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: 'file1  file2  directory1',
          timestamp: new Date()
        }]);
      }
    } else if (trimmedCmd.startsWith('cat ') && localStorage.getItem('arch-console-mode') === 'true') {
      const file = trimmedCmd.substring(4).trim();
      if (file === '/etc/hostname') {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: 'archlinux',
          timestamp: new Date()
        }]);
      } else if (file === '/etc/locale.conf') {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: 'LANG=en_US.UTF-8',
          timestamp: new Date()
        }]);
      } else if (file === '/proc/cpuinfo') {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: 'processor\t: 0',
          timestamp: new Date()
        }, {
          type: 'system',
          content: 'vendor_id\t: GenuineIntel',
          timestamp: new Date()
        }, {
          type: 'system',
          content: 'cpu family\t: 6',
          timestamp: new Date()
        }, {
          type: 'system',
          content: 'model name\t: Intel(R) Core(TM) i7-9700K CPU @ 3.60GHz',
          timestamp: new Date()
        }]);
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: 'Sample file content',
          timestamp: new Date()
        }]);
      }
    } else if (trimmedCmd === 'ps aux' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'root           1  0.0  0.1 169444 11456 ?        Ss   19:30   0:01 /sbin/init',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'root           2  0.0  0.0      0     0 ?        S    19:30   0:00 [kthreadd]',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'root         125  0.0  0.0  32892  3456 ?        Ss   19:30   0:00 systemd-networkd',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'top' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'top - 19:30:45 up 5 min,  1 user,  load average: 0.08, 0.12, 0.06',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Tasks: 125 total,   1 running, 124 sleeping,   0 stopped,   0 zombie',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '%Cpu(s):  2.1 us,  1.2 sy,  0.0 ni, 96.5 id,  0.2 wa,  0.0 hi,  0.0 si,  0.0 st',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'MiB Mem :  16384.0 total,  13245.6 free,   2156.2 used,    982.2 buff/cache',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '    1 root      20   0  169444  11456   8192 S   0.0   0.1   0:01.23 systemd',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'mount' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: '/dev/sda2 on / type ext4 (rw,relatime)',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '/dev/sda1 on /boot type vfat (rw,relatime,fmask=0022,dmask=0022,codepage=437,iocharset=ascii,shortname=mixed,utf8,errors=remount-ro)',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'proc on /proc type proc (rw,nosuid,nodev,noexec,relatime)',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'sysfs on /sys type sysfs (rw,nosuid,nodev,noexec,relatime)',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd.startsWith('chmod ') && localStorage.getItem('arch-console-mode') === 'true') {
      const parts = trimmedCmd.split(' ');
      if (parts.length >= 3) {
        setLines(prev => [...prev, commandLine]);
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: 'chmod: missing operand',
          timestamp: new Date()
        }, {
          type: 'system',
          content: 'Try \'chmod --help\' for more information.',
          timestamp: new Date()
        }]);
      }
    } else if (trimmedCmd.startsWith('rm ') && localStorage.getItem('arch-console-mode') === 'true') {
      const file = trimmedCmd.substring(3).trim();
      setLines(prev => [...prev, commandLine]);
    } else if (trimmedCmd === 'hwclock' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: '2024-01-15 19:30:45.123456+00:00',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'useradd' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'usage: useradd [options] username',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'example: useradd -m -G wheel user',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd.startsWith('useradd ') && localStorage.getItem('arch-console-mode') === 'true') {
      const parts = trimmedCmd.split(' ');
      const username = parts[parts.length - 1];
      
      setLines(prev => [...prev, commandLine, {
        type: 'success',
        content: `User '${username}' created successfully`,
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Set password with: passwd ' + username,
        timestamp: new Date()
      }]);
    } else if (trimmedCmd.startsWith('passwd ') && localStorage.getItem('arch-console-mode') === 'true') {
      const username = trimmedCmd.split(' ')[1];
      
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: `Changing password for user ${username}.`,
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'New password: ********',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Retype new password: ********',
        timestamp: new Date()
      }, {
        type: 'success',
        content: 'passwd: password updated successfully',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'arch-guide' && localStorage.getItem('arch-console-mode') === 'true') {
      const guideLines: InstallerLine[] = [
        commandLine,
        {
          type: 'system',
          content: 'Arch Linux Post-Installation Guide',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '==================================',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '1. Install development tools:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   pacman -S base-devel',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '2. Setup networking:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   pacman -S networkmanager',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   systemctl enable NetworkManager',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '3. Install display server:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   pacman -S xorg-server xorg-xinit',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '4. Install desktop environment:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   pacman -S plasma-desktop kde-applications',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '5. Install display manager:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   pacman -S sddm',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   systemctl enable sddm',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '6. Configure user account:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   useradd -m -G wheel username',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   passwd username',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   echo "username ALL=(ALL) ALL" >> /etc/sudoers',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '7. Install applications:',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   pacman -S firefox chromium konsole dolphin',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '8. Start display manager: systemctl start sddm',
          timestamp: new Date()
        },
        {
          type: 'system',
          content: '   OR start manually: startx',
          timestamp: new Date()
        }
      ];
      setLines(prev => [...prev, ...guideLines]);
    } else if (trimmedCmd === 'grub-install' && localStorage.getItem('arch-console-mode') === 'true') {
      const hasDesktop = localStorage.getItem('arch-desktop-corrupted') === 'true' || 
                        localStorage.getItem('arch-networkmanager-installed') === 'true';
      
      if (!hasDesktop) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
        localStorage.setItem('arch-bootloader-broken', 'true');
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'success',
          content: 'Installing for x86_64-efi platform',
          timestamp: new Date()
        }, {
          type: 'success',
          content: 'Installation finished. No error reported.',
          timestamp: new Date()
        }]);
      }
    } else if (trimmedCmd === 'mkinitcpio -P' && localStorage.getItem('arch-console-mode') === 'true') {
      const hasBaseDevel = localStorage.getItem('arch-basedevel-installed') === 'true';
      
      if (!hasBaseDevel) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: '==> Building image from preset: /etc/mkinitcpio.d/linux.preset',
          timestamp: new Date()
        }, {
          type: 'success',
          content: '==> Image generation successful',
          timestamp: new Date()
        }]);
      }
    } else if (trimmedCmd === 'timedatectl' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: '               Local time: Mon 2024-01-15 19:30:15 UTC',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '           Universal time: Mon 2024-01-15 19:30:15 UTC',
        timestamp: new Date()
      }, {
        type: 'system',
        content: '                 RTC time: Mon 2024-01-15 19:30:15',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'locale-gen' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Generating locales...',
        timestamp: new Date()
      }, {
        type: 'success',
        content: '  en_US.UTF-8... done',
        timestamp: new Date()
      }, {
        type: 'success',
        content: 'Generation complete.',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'hwclock --systohc' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'success',
        content: 'Hardware clock synced to system time',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd.startsWith('mount ') && localStorage.getItem('arch-console-mode') === 'true') {
      const mountTarget = trimmedCmd.split(' ')[1] || '';
      const isCorrupted = Math.random() < 0.2; // 20% chance of mount error
      
      if (isCorrupted) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'success',
          content: `Mounted ${mountTarget}`,
          timestamp: new Date()
        }]);
      }
    } else if (trimmedCmd === 'fdisk -l' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Disk /dev/sda: 20 GiB, 21474836480 bytes, 41943040 sectors',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Units: sectors of 1 * 512 = 512 bytes',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Sector size (logical/physical): 512 bytes / 512 bytes',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'I/O size (minimum/optimal): 512 bytes / 512 bytes',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd.startsWith('pacman -R ') && localStorage.getItem('arch-console-mode') === 'true') {
      const packages = trimmedCmd.substring(10).trim();
      const isSystemPackage = packages.includes('base') || packages.includes('linux') || packages.includes('systemd');
      
      if (isSystemPackage) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
        localStorage.setItem('arch-system-corrupted', 'true');
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'success',
          content: `removing ${packages}...`,
          timestamp: new Date()
        }]);
      }
    } else if (trimmedCmd.startsWith('chmod ') && localStorage.getItem('arch-console-mode') === 'true') {
      const args = trimmedCmd.split(' ');
      const permissions = args[1];
      const file = args[2] || '';
      
      const isDangerous = permissions === '000' || file.includes('/etc/') || file.includes('/boot/');
      
      if (isDangerous) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
        localStorage.setItem('arch-permissions-broken', 'true');
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'success',
          content: `permissions changed: ${file}`,
          timestamp: new Date()
        }]);
      }
    } else if (trimmedCmd.startsWith('rm -rf ') && localStorage.getItem('arch-console-mode') === 'true') {
      const target = trimmedCmd.substring(7).trim();
      const isSystemPath = target.includes('/') || target === '*' || target.includes('boot') || target.includes('etc');
      
      if (isSystemPath) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
        localStorage.setItem('arch-system-corrupted', 'true');
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'success',
          content: `removed: ${target}`,
          timestamp: new Date()
        }]);
      }
    } else if (trimmedCmd === 'ip addr' && localStorage.getItem('arch-console-mode') === 'true') {
      const hasNetwork = localStorage.getItem('arch-networkmanager-installed') === 'true';
      
      if (!hasNetwork) {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536',
          timestamp: new Date()
        }, {
          type: 'system',
          content: '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500',
          timestamp: new Date()
        }, {
          type: 'system',
          content: '    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0',
          timestamp: new Date()
        }]);
      }
    } else if ((trimmedCmd.startsWith('nano ') || trimmedCmd.startsWith('vim ')) && localStorage.getItem('arch-console-mode') === 'true') {
      const editor = trimmedCmd.split(' ')[0];
      const file = trimmedCmd.split(' ')[1] || '';
      const hasBaseDevel = localStorage.getItem('arch-basedevel-installed') === 'true';
      
      if (!hasBaseDevel && Math.random() < 0.5) {
        setLines(prev => [...prev, commandLine, {
          type: 'error',
          content: 'ERROR',
          timestamp: new Date()
        }]);
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: `Opening ${file} with ${editor}...`,
          timestamp: new Date()
        }, {
          type: 'system',
          content: 'Press Ctrl+X to exit (simulated)',
          timestamp: new Date()
        }]);
      }
    } else if (trimmedCmd === 'ps aux' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'root         1  0.0  0.1 169504 11584 ?        Ss   00:00   0:01 /sbin/init',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'root        42  0.0  0.0  21524  3584 tty1     Ss+  00:00   0:00 bash',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'free -h' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: '               total        used        free      shared  buff/cache   available',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Mem:           7.8Gi       1.2Gi       5.9Gi        84Mi       687Mi       6.3Gi',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Swap:          2.0Gi          0B       2.0Gi',
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'journalctl --since today' && localStorage.getItem('arch-console-mode') === 'true') {
      const hasErrors = localStorage.getItem('arch-desktop-corrupted') === 'true' || 
                       localStorage.getItem('arch-system-corrupted') === 'true';
      
      if (hasErrors) {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: 'Jan 15 19:30:15 archlinux systemd[1]: Started Load Kernel Modules.',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'Jan 15 19:30:16 archlinux kernel: ERROR',
          timestamp: new Date()
        }, {
          type: 'error',
          content: 'Jan 15 19:30:17 archlinux systemd[1]: ERROR',
          timestamp: new Date()
        }]);
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: 'Jan 15 19:30:15 archlinux systemd[1]: Started Load Kernel Modules.',
          timestamp: new Date()
        }, {
          type: 'system',
          content: 'Jan 15 19:30:16 archlinux systemd[1]: Reached target System Initialization.',
          timestamp: new Date()
        }]);
      }
    } else if (trimmedCmd === 'clear') {
      const isArchMode = localStorage.getItem('arch-console-mode') === 'true';
      const prompt = isArchMode ? 'root@archlinux:~#' : 'root@webos-installer:~#';
      
      setLines([{
        type: 'input',
        content: prompt,
        timestamp: new Date()
      }]);
    } else if (trimmedCmd === 'reboot') {
      const isArchMode = localStorage.getItem('arch-console-mode') === 'true';
      
      if (isArchMode) {
        setLines(prev => [...prev, commandLine, {
          type: 'system',
          content: 'Arch Linux does not have a desktop environment installed.',
          timestamp: new Date()
        }, {
          type: 'system',
          content: 'Install a desktop environment first: pacman -S xorg plasma-desktop',
          timestamp: new Date()
        }, {
          type: 'system',
          content: 'Or type "exit" to return to installer.',
          timestamp: new Date()
        }]);
      } else {
        setLines(prev => [...prev, commandLine, {
          type: 'success',
          content: 'Rebooting into WebOS...',
          timestamp: new Date()
        }]);
        setTimeout(() => {
          onInstallComplete();
        }, 2000);
      }
    } else if (trimmedCmd === 'exit' && localStorage.getItem('arch-console-mode') === 'true') {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Returning to installation environment...',
        timestamp: new Date()
      }]);
      localStorage.removeItem('arch-console-mode');
      setTimeout(() => {
        setLines([{
          type: 'input',
          content: 'root@webos-installer:~#',
          timestamp: new Date()
        }]);
      }, 1000);
    } else if (trimmedCmd === 'reboot' && (localStorage.getItem('arch-console-mode') === 'true' || localStorage.getItem('webos-console-mode') === 'true')) {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Rebooting system...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Shutting down services...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Unmounting filesystems...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'System halted.',
        timestamp: new Date()
      }]);
      
      setTimeout(() => {
        // Check if system is properly installed
        const isArchInstalled = localStorage.getItem('archInstalled') === 'true';
        const isWebOSInstalled = localStorage.getItem('webosInstalled') === 'true';
        
        if (isArchInstalled || isWebOSInstalled) {
          // Clear console modes and redirect to desktop with loading screen
          localStorage.removeItem('arch-console-mode');
          localStorage.removeItem('webos-console-mode');
          onInstallComplete();
        } else {
          // Return to installer if not properly installed
          setLines(prev => [...prev, {
            type: 'error',
            content: 'BOOT FAILURE: No operating system installed.',
            timestamp: new Date()
          }, {
            type: 'system',
            content: 'Returning to installer...',
            timestamp: new Date()
          }]);
          
          setTimeout(() => {
            localStorage.removeItem('arch-console-mode');
            localStorage.removeItem('webos-console-mode');
            setCurrentCommand('');
            setLines([]);
          }, 2000);
        }
      }, 3000);
    } else if (trimmedCmd === 'exit' && (localStorage.getItem('arch-console-mode') === 'true' || localStorage.getItem('webos-console-mode') === 'true')) {
      setLines(prev => [...prev, commandLine, {
        type: 'system',
        content: 'Exiting console...',
        timestamp: new Date()
      }, {
        type: 'system',
        content: 'Returning to installer menu',
        timestamp: new Date()
      }]);
      
      setTimeout(() => {
        localStorage.removeItem('arch-console-mode');
        localStorage.removeItem('webos-console-mode');
        setCurrentCommand('');
        setLines([]);
      }, 1500);
    } else {
      const errorLine: InstallerLine = {
        type: 'error',
        content: `bash: ${trimmedCmd}: command not found`,
        timestamp: new Date()
      };
      setLines(prev => [...prev, commandLine, errorLine]);
    }
  };

  const startInstallation = () => {
    setIsInstalling(true);
    setInstallStep(0);
    
    const logoLines: InstallerLine[] = [
      {
        type: 'system',
        content: '',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '   ┌────────────────────────────────────┐',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '   │                                    │',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '   │           WebOS v4.0               │',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '   │     HTML/JavaScript Desktop       │',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '   │                                    │',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '   │            </>                     │',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '   │                                    │',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '   └────────────────────────────────────┘',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: '',
        timestamp: new Date()
      },
      {
        type: 'system',
        content: 'Starting interactive WebOS installation...',
        timestamp: new Date()
      }
    ];
    
    setLines(prev => [...prev, ...logoLines]);
  };

  useEffect(() => {
    if (isInstalling && installStep < installSteps.length) {
      const timer = setTimeout(() => {
        const stepLine: InstallerLine = {
          type: installStep === installSteps.length - 1 ? 'success' : 'system',
          content: installSteps[installStep],
          timestamp: new Date()
        };
        
        setLines(prev => [...prev, stepLine]);
        
        if (installStep === installSteps.length - 1) {
          setTimeout(() => {
            const completeLine: InstallerLine = {
              type: 'success',
              content: 'WebOS installation complete!',
              timestamp: new Date()
            };
            setLines(prev => [...prev, completeLine, {
              type: 'system',
              content: 'Type "reboot" to start WebOS desktop environment.',
              timestamp: new Date()
            }, {
              type: 'system',
              content: '',
              timestamp: new Date()
            }, {
              type: 'input',
              content: 'root@webos-installer:~#',
              timestamp: new Date()
            }]);
            
            // Set installation flag but don't auto-complete
            localStorage.setItem('archInstalled', 'true');
            localStorage.setItem('webos-installation-type', 'standard');
            setIsInstalling(false);
          }, 1000);
        }
        
        setInstallStep(prev => prev + 1);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isInstalling, installStep, installSteps.length, onInstallComplete]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isInstalling) {
      executeCommand(currentCommand);
      setCurrentCommand('');
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full bg-black text-green-400 font-mono text-sm">
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
      >
        {lines.map((line, index) => (
          <div key={index} className="flex items-start space-x-2">
            <span className="text-green-600 text-xs min-w-[80px]">
              {formatTime(line.timestamp)}
            </span>
            <span className={`flex-1 ${
              line.type === 'error' ? 'text-red-400' :
              line.type === 'success' ? 'text-green-300' :
              line.type === 'input' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {line.content}
            </span>
          </div>
        ))}
        
        {!isInstalling && (
          <div className="flex items-center space-x-2">
            <span className="text-green-600 text-xs min-w-[80px]">
              {formatTime(new Date())}
            </span>
            <span className="text-yellow-400">
              {localStorage.getItem('arch-console-mode') === 'true' ? 'root@archlinux:~#' : 'root@webos-installer:~#'}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-green-400 outline-none border-none"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
};