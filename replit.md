# Enhanced Snake Game Application

## Overview

This is a full-stack web application featuring an enhanced Snake game built with modern technologies. The project combines a React-based frontend with a Node.js/Express backend, supporting both classic Snake gameplay and advanced features like 3D graphics, multiple game modes, and comprehensive UI components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom component library
- **3D Graphics**: React Three Fiber for potential 3D game enhancements
- **State Management**: Zustand for lightweight, reactive state management
- **Component Library**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: Hot reload with Vite integration
- **API Structure**: RESTful routes with `/api` prefix

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via DATABASE_URL)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon Database serverless driver

## Key Components

### Game Logic
- **Core Game**: Canvas-based Snake game with smooth animations
- **Game Modes**: Classic, Time Attack, and Obstacle modes
- **Features**: Particle effects, gradient visuals, mobile controls
- **Audio**: Comprehensive sound system with background music and effects
- **Storage**: Local storage for settings, high scores, and statistics

### UI System
- **Game Interface**: Overlay UI with score display, controls, and settings
- **Mobile Support**: Touch controls with direction pad
- **Themes**: Multiple visual themes (dark, neon, retro)
- **Modals**: Start screen, game over, pause, and settings screens

### State Management
- **Game State**: Phase management (ready, playing, ended)
- **Audio State**: Sound control and mute functionality
- **Settings**: Persistent user preferences

### Component Architecture
- **Shared Components**: Reusable UI components in `/client/src/components/ui/`
- **Game Components**: Game-specific logic in `/client/src/`
- **Utilities**: Helper functions and hooks

## Data Flow

### Game Flow
1. User starts on ready screen
2. Game transitions to playing phase
3. Canvas renders game state with smooth animations
4. Particle system handles visual effects
5. Game ends and transitions to end phase
6. Statistics and high scores are saved locally

### Audio Flow
1. Audio system initializes on first user interaction
2. Background music loops during gameplay
3. Sound effects trigger on game events
4. Mute state persists across sessions

### Settings Flow
1. User preferences stored in localStorage
2. Settings applied to game configuration
3. Theme changes update CSS variables
4. Grid size and speed affect game mechanics

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React 18, React DOM, React Three Fiber
- **UI Libraries**: Radix UI components, Lucide icons
- **State Management**: Zustand with selectors
- **Styling**: Tailwind CSS, class variance authority
- **Utilities**: clsx, date-fns, cmdk

### Backend Dependencies
- **Server**: Express.js with TypeScript support
- **Database**: Drizzle ORM, Neon serverless driver
- **Development**: tsx for TypeScript execution
- **Session**: PostgreSQL session store

### Development Tools
- **Build**: Vite with React plugin
- **TypeScript**: Strict configuration with path mapping
- **Database**: Drizzle Kit for migrations
- **Bundling**: esbuild for server bundling

## Deployment Strategy

### Build Process
1. Frontend builds to `dist/public` via Vite
2. Server bundles to `dist/index.js` via esbuild
3. Production serves static files from Express

### Environment Requirements
- **Node.js**: ES modules support
- **Database**: PostgreSQL via DATABASE_URL
- **Environment**: Production mode for optimizations

### Development Workflow
1. `npm run dev` starts development server with hot reload
2. `npm run db:push` applies database schema changes
3. `npm run build` creates production bundle
4. `npm start` runs production server

### Database Management
- Schema defined in `/shared/schema.ts`
- Migrations stored in `/migrations` directory
- Database URL configured via environment variable
- Drizzle Kit handles schema synchronization

The application is designed for easy deployment to platforms like Replit, with development and production modes clearly separated and comprehensive error handling throughout the stack.