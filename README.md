# WebOS - Modern Desktop Operating System

A comprehensive web-based desktop operating system that emulates a Linux desktop environment entirely in the browser. WebOS features a complete window manager, file system, application ecosystem, user management, and desktop environment that mimics modern Linux distributions like Arch Linux.

![WebOS Desktop](https://img.shields.io/badge/Platform-Web-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## Features

### Complete Desktop Environment
- **Advanced Window Manager**: Hyprland-style automatic tiling with dragging, resizing, minimizing, and maximizing
- **Multi-Workspace Support**: Virtual desktops with seamless window organization
- **Interactive Desktop**: Right-click context menus, desktop icons, and file operations
- **Modern Taskbar**: Running applications display with workspace controls

### Installation & User Management
- **Arch Linux Installation Simulation**: Complete installation wizard with animated terminal output
- **Multi-User System**: Secure user accounts with authentication and session management
- **User Switching**: Fast user switching with login animations
- **Factory Reset**: Complete system reset functionality

### Advanced File System
- **Hierarchical Structure**: Complete folder organization with unlimited nesting
- **Database Persistence**: All files stored securely in PostgreSQL
- **File Operations**: Create, edit, delete, move, and organize files and folders
- **Cloud Integration**: Built-in cloud storage interface

## Application Ecosystem

### Core Applications
- **Terminal Emulator** - Full Linux command support with bash/zsh/fish simulation
- **File Manager** - Complete file system navigation (thunar/nautilus style)
- **Web Browser** - Tabbed browsing with bookmarks (Firefox/Chromium)
- **Text Editor** - Code editing with syntax highlighting (vim/nano/gedit)

### Productivity Suite
- **Email Client** - Message management and composition
- **Calendar** - Event scheduling with date picker
- **Download Manager** - File download tracking
- **Settings** - System configuration and customization

### Development Tools
- **Package Manager** - Arch Linux style package management (pacman/yay)
- **Developer Tools** - Advanced development utilities
- **Color Palette Editor** - Design tools for developers
- **System Monitor** - Real-time performance metrics

### Entertainment & Media
- **Call of Duty Simulator** - Gaming experience with achievements
- **Media Players** - Audio and video playback support
- **Achievement System** - Progress tracking and unlockable rewards

## Quick Start

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database (or use included Neon serverless setup)

### Installation

1. **Clone and Install**
   ```bash
   git clone https://github.com/ptsdcat/WebOS.git
   cd webos
   npm install
   ```

2. **Database Setup**
   ```bash
   npm run db:push
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access WebOS**
   Open `http://localhost:5000` in your browser

### Production Deployment

```bash
npm run build
npm start
```

## Usage Guide

### First Boot Experience
1. **Installation Wizard** - Follow the Arch Linux-style setup process
2. **User Account Creation** - Set up your primary user account
3. **Desktop Exploration** - Try clicking desktop icons and applications
4. **Window Management** - Open multiple apps and arrange windows

### Essential Features to Explore

#### Terminal Commands
```bash
ls              # List directory contents
pwd             # Show current directory
cat filename    # Display file contents
ps aux          # Show running processes
pacman -S app   # Install packages (Arch mode)
```

#### File Management
- **Create Folders**: Right-click desktop or use file manager
- **Upload Files**: Drag and drop or use file dialogs
- **Edit Text Files**: Use built-in text editor
- **Organize Content**: Move files between folders

#### Window Operations
- **Drag Windows**: Click and drag title bars
- **Resize**: Drag from window corners and edges
- **Minimize/Maximize**: Use window control buttons
- **Auto-Tiling**: Windows automatically arrange in Hyprland style

#### Workspace Management
- **Switch Workspaces**: Use workspace controls in taskbar
- **Move Windows**: Drag windows between workspaces
- **Organize Tasks**: Separate work into different virtual desktops

## Architecture Overview

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend uses a modern React-based Single Page Application (SPA) architecture with TypeScript:

- **Component Architecture**: Modular component design with clear separation between desktop, window management, and individual applications
- **State Management**: React hooks-based state management with local storage persistence for user settings and application data
- **Routing**: Wouter library for client-side routing with dynamic route handling
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Window Management**: Custom window manager with drag-and-drop, resizing, minimizing, and workspace management
- **Theme System**: Dynamic theming with CSS variables supporting dark/light modes and custom color palettes

### Backend Architecture
Express.js server providing API endpoints and serving the React application:

- **API Layer**: RESTful API with Express middleware for request handling and error management
- **File Storage**: Mock file system implementation with localStorage persistence for demo purposes
- **Proxy Services**: Advanced proxy utilities for external API integration with rate limiting and request queuing
- **WebSocket Support**: Real-time communication capabilities for system monitoring and notifications

### Database Layer
PostgreSQL database with Drizzle ORM for type-safe database operations:

- **Schema Design**: User accounts, file system hierarchy, and OS settings with proper relationships
- **ORM Integration**: Drizzle ORM provides type-safe queries and migrations
- **Connection Management**: Neon serverless PostgreSQL with connection pooling

### Application Ecosystem
Comprehensive application suite mimicking a real desktop environment:

- **Core Apps**: Terminal emulator, file manager, web browser, text editor, calculator
- **Productivity**: Email client, calendar, download manager, cloud storage
- **Development**: Developer tools, package manager, color palette editor
- **Entertainment**: Games, media players, achievement system
- **System**: Settings, account management, system monitoring

### User Experience Features
- **Installation Simulation**: Arch Linux-style installation process with animated terminal output
- **Authentication**: Multi-user support with login screens and user switching
- **Desktop Environment**: Draggable icons, right-click context menus, workspace management
- **Sound System**: Comprehensive audio feedback for user interactions
- **Accessibility**: Keyboard shortcuts, screen reader support, and responsive design

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting for user data and file system storage
- **Drizzle Kit**: Database migrations and schema management

### UI and Styling
- **Radix UI**: Accessible component primitives for dialogs, dropdowns, and form elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography
- **Framer Motion**: Animation library for smooth transitions and interactions

### Development Tools
- **Vite**: Build tool and development server with hot module replacement
- **TypeScript**: Type safety and enhanced development experience
- **ESBuild**: Fast JavaScript bundler for production builds

### External APIs (Optional)
- **YouTube API**: Video content integration for media applications
- **Weather APIs**: Real-time weather data for dashboard widgets
- **Cryptocurrency APIs**: Market data for crypto tracking applications
- **News APIs**: Content aggregation for news and information feeds

### Browser APIs
- **Web Audio API**: Sound generation and audio feedback system
- **Local Storage**: Client-side data persistence for user preferences and application data
- **File System Access API**: Enhanced file operations where supported
- **WebSocket API**: Real-time communication for system monitoring

The architecture emphasizes modularity, type safety, and user experience while maintaining the flexibility to add new applications and features. The system is designed to work entirely in the browser while providing hooks for server-side data persistence and external service integration.

## Development

### Project Structure
```
webos/
├── client/src/           # Frontend React application
│   ├── components/       # Reusable UI components
│   │   ├── desktop/      # Desktop environment
│   │   ├── window/       # Window management
│   │   ├── apps/         # Individual applications
│   │   └── ui/           # Shadcn/ui components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   └── types/            # TypeScript definitions
├── server/               # Backend Express.js server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── db.ts             # Database connection
├── shared/               # Shared TypeScript types
│   └── schema.ts         # Database schema (Drizzle)
└── vite.config.ts        # Build configuration
```

### Adding New Applications

1. **Create Application Component**
   ```typescript
   // client/src/components/apps/MyApp.tsx
   export const MyApp: FC = () => {
     return (
       <div className="p-4">
         <h1>My Custom Application</h1>
         {/* Your app content */}
       </div>
     );
   };
   ```

2. **Register in Desktop**
   ```typescript
   // Add to getDefaultDesktopApps in Desktop.tsx
   { 
     id: 'my-app', 
     name: 'My App', 
     icon: 'app-icon', 
     description: 'My custom application' 
   }
   ```

3. **Add to App Launcher**
   ```typescript
   // Update AppLauncher.tsx to handle the new app
   case 'my-app':
     return <MyApp />;
   ```

### Database Schema Changes

1. **Update Schema**
   ```typescript
   // shared/schema.ts
   export const newTable = pgTable("new_table", {
     id: serial("id").primaryKey(),
     // Add your columns
   });
   ```

2. **Update Storage Interface**
   ```typescript
   // server/storage.ts
   export interface IStorage {
     // Add new methods
   }
   ```

3. **Push Changes**
   ```bash
   npm run db:push
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

### Environment Variables

Create a `.env` file for development:
```env
DATABASE_URL=your_postgresql_connection_string
```

## Customization

### Themes
WebOS supports dynamic theming with CSS variables:
- **Dark/Light Modes**: Automatic system detection or manual toggle
- **Color Palettes**: Customizable accent colors and backgrounds

### Sound System
- **UI Feedback**: Button clicks, window operations, notifications
- **System Sounds**: Login, logout, error notifications
- **Customizable**: Enable/disable in settings

### Desktop Customization
- **Wallpapers**: Multiple background options
- **Icon Arrangement**: Drag and drop desktop icons
- **Workspace Configuration**: Customize virtual desktop behavior

## API Reference

### Window Management
```typescript
// Create new window
const windowId = createWindow('app-id', 'Window Title', 'icon-name');

// Window operations
minimizeWindow(windowId);
maximizeWindow(windowId);
closeWindow(windowId);
focusWindow(windowId);
```

### File System
```typescript
// File operations
const files = await storage.getUserFiles(userId, parentId);
const newFile = await storage.createFile(fileData);
await storage.updateFile(fileId, updates);
await storage.deleteFile(fileId);
```

### User Management
```typescript
// User operations
const user = await storage.createUser(userData);
const settings = await storage.getUserSettings(userId);
await storage.updateUserSettings(userId, settingsData);
```

## Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### Development Guidelines

- **Code Style**: Use TypeScript for all new code
- **Components**: Follow React hooks patterns and functional components
- **Styling**: Use Tailwind CSS utility classes and Shadcn/ui components
- **Testing**: Ensure responsive design across different screen sizes
- **Database**: Use Drizzle ORM for all database operations

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Follow configured linting rules
- **Prettier**: Consistent code formatting
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Inspiration**: Modern Linux desktop environments (GNOME, KDE, Hyprland)
- **Design**: Arch Linux installation process and package management
- **Technology**: React ecosystem and modern web standards
- **Community**: Open source contributors and the web development community

## Support

For support, feature requests, or bug reports:
- Open an issue on GitHub
- Join our community discussions
- Check the documentation for common questions

- I tried my best on the websites and stuff

