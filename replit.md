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

## Recent Changes: Latest modifications with dates

### July 19, 2025 - Migration & Special Abilities Enhancement
- **Dragon Ball Z Characters**: Son Goku (player) vs Vegeta (AI enemy)
- **Glowing Neon Laser Saber**: Enhanced start animation with cyan/green glowing saber
- **Vegeta AI Snake**: Royal blue Saiyan Prince with electric blue aura and aggressive behavior
- **Fixed Collision System**: Proper game over when Vegeta collides with Son Goku
- **Start Animation**: Added cinematic snake-biting-controller animation before home screen
- **AI Enemy Snake**: Implemented intelligent AI opponent with chase/avoid behaviors  
- **Wave Motion Mechanics**: Snake tail moves with wave function when growing
- **Enhanced Growth System**: Food eating triggers multi-segment growth with visual effects
- **Competitive Scoring**: Vegeta can win by reaching target score first, creating race-to-win gameplay
- **Start Animation**: Added cinematic snake-biting-controller animation before home screen
- **AI Enemy Snake**: Implemented intelligent AI opponent with chase/avoid behaviors  
- **Wave Motion Mechanics**: Snake tail moves with wave function when growing
- **Enhanced Growth System**: Food eating triggers multi-segment growth with visual effects
- **Comprehensive Integration**: All features working together seamlessly

### July 19, 2025 - Special Abilities & Sound Enhancement Update
- **Enhanced Audio System**: Added sound effects for start animation (bite, explosion, whoosh)
- **Goku Special Abilities**: 
  - Speed Boost (Space key): 2.5x speed multiplier for 2 seconds, 5-second cooldown
  - Power Ball (Shift key): Launches energy projectile that damages Vegeta on hit
- **Vegeta AI Abilities**:
  - Aggressive Mode: Auto-activated AI ability with increased speed and aggression
  - Power Ball Defense: AI can use similar abilities for balanced gameplay
- **Visual Effects**: 
  - Golden Super Saiyan glow during speed boost
  - Power ball trails and explosion effects
  - Enhanced particle systems for all abilities
- **Sound Integration**: All abilities trigger appropriate sound effects
- **Collision System**: Power balls can hit and damage opponent snakes
- **Dynamic Coloring**: Snake colors change based on active abilities

### July 19, 2025 - Migration & Error Fixes
- **Successful Migration**: Migrated project from Replit Agent to standard Replit environment
- **Error Resolution**: Fixed undefined property access errors in special abilities system
- **Null Safety**: Added proper null checks for snake segments and game objects
- **Power Ball System**: Fixed auto power ball exchange system with proper target validation
- **Client/Server Separation**: Ensured proper security practices and separation of concerns
- **Performance**: Resolved FPS issues and improved game stability

### July 19, 2025 - Advanced AI Combat & Start Animation Enhancement
- **Dodge Mechanics**: Start animation now features snake dodging laser saber attacks with dramatic evasive movement
- **Enhanced Theme Music**: Dragon Ball Z background music with increased intensity and faster playback rate
- **Smart AI Power Ball System**: Vegeta uses strategic power ball attacks based on Goku's ability usage patterns
- **Quick Exchange Mode**: After first power ball exchange, Vegeta enters rapid-fire mode for intense combat
- **Predictive AI Targeting**: Vegeta predicts Goku's movement patterns for accurate power ball launches
- **Combat Integration**: Goku's special abilities trigger Vegeta's AI learning system
- **Visual Power Ball Trails**: AI power balls render with golden energy trails and explosion effects
- **Special Abilities System**: Goku speed boost (Space key) and power ball attacks (Shift key)  
- **Enhanced Sound Effects**: Start animation sound effects, power-up sounds, and ability activation sounds
- **Power Ball Combat**: Goku can launch energy attacks at Vegeta AI with visual trails and collision detection
- **Speed Boost Mechanics**: Goku gains temporary speed increase with visual golden aura effects
- **Audio Integration**: Bite, explosion, whoosh, and special ability sound effects added

### July 20, 2025 - Saiyan Tail Enhancement & Pure HTML/CSS/JS Conversion
- **Saiyan Tails Added**: Both Goku and Vegeta now have authentic Saiyan tails with unique designs
- **Goku's Tail**: Brown fuzzy tail with wave motion, curved design, and fur texture details
- **Vegeta's Tail**: Royal dark gray tail with spiky tip, S-curve design, and blue aura when using abilities
- **Tail Animation**: Tails sway naturally with wave motion and respond to character movement
- **Standalone Conversion**: Successfully converted from React/Node.js to pure HTML, CSS, JavaScript
- **File Structure**: Created index.html with embedded CSS and modular JS files in /js directory
- **Client-Side Only**: Removed all server dependencies, making game fully client-side
- **Audio Integration**: Copied sound files and updated paths for standalone operation  
- **Enhanced Features**: Preserved all Dragon Ball Z features, special abilities, and AI opponent
- **Mobile Support**: Maintained touch controls and responsive design
- **Local Storage**: Game settings and scores saved locally in browser
- **Offline Ready**: Game works completely offline without server requirements

### July 19, 2025 - Project Migration to Replit Environment
- **Migration Completed**: Successfully migrated from Replit Agent to standard Replit environment
- **Server Architecture**: Express.js server running on port 5000 with proper client/server separation
- **Security Implementation**: Robust security practices with separated client and server code
- **Vite Integration**: Hot module replacement and development tooling working correctly
- **Game Functionality**: All enhanced Snake game features preserved and working properly
- **TypeScript Support**: Full TypeScript compilation and type checking maintained
- **Package Management**: All dependencies installed and configured for Replit environment
- **Workflow Configuration**: Start Game workflow properly configured and running

## Enhanced Game Features

### Start Screen Animation
- Custom canvas animation showing snake attacking game controller
- Particle effects and controller damage visualization
- Smooth transition to main menu after completion

### AI Enemy Snake
- Intelligent pathfinding and decision making
- Dynamic behavior based on player proximity
- Collision detection with player snake
- Visual distinction with red coloring and wave motion

### Wave Motion System  
- Mathematical sine wave function for tail segments
- Amplitude increases when eating food
- Smooth, organic movement patterns
- Applied to both player and AI snakes

### Enhanced Growth Mechanics
- Growth queue system for delayed segment addition
- Multiple segments added per food consumption
- Visual wave amplitude scaling with snake size
- Particle effects on food consumption