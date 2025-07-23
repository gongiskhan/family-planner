# PLANNING.md - Family Task Manager Project Plan

## 🎯 Vision & Mission

### Mission Statement
Eliminate household task distribution conflicts through an objective, data-driven system that promotes partnership equity and family harmony.

### Product Vision
Create a transparent, fair, and efficient family responsibility management system that automatically assigns tasks based on objective scoring, ensuring both partners feel heard and valued in their contributions.

### Success Criteria
- **Objective Fairness**: Tasks assigned based on effort/time/stress scoring
- **Transparency**: Clear visibility into who does what and why
- **Efficiency**: Quick task management without lengthy discussions
- **Partnership**: Both partners participate in all household areas
- **Quality**: 100% test coverage ensuring reliability

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Client (React SPA)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   UI Components │  │  State Mgmt     │  │  Business Logic │  │
│  │   (Liquid Glass)│  │  (Context+      │  │  (Task Calc,    │  │
│  │                 │  │   useReducer)   │  │   Assignment)   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    File System API                          │
├─────────────────────────────────────────────────────────────┤
│                    Local File Storage                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │     tasks.json  │  │  settings.json  │  │   backups/      │  │
│  │                 │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture
```
App
├── Providers/
│   ├── TaskProvider (State Management)
│   ├── ThemeProvider (Liquid Glass Theming)
│   └── FileSystemProvider (Data Persistence)
├── Layouts/
│   ├── DesktopLayout (Sidebar + Main)
│   └── MobileLayout (Stack + Bottom Nav)
├── Features/
│   ├── TaskManagement/
│   │   ├── TaskList
│   │   ├── TaskCard
│   │   ├── TaskForm
│   │   └── TaskCalculator
│   ├── PointSystem/
│   │   ├── PointInput
│   │   ├── AssignmentDisplay
│   │   └── MonthlySummary
│   └── CategoryManagement/
└── Shared/
    ├── UI/ (Liquid Glass Components)
    ├── Hooks/
    ├── Utils/
    └── Types/
```

### Data Flow
```
User Input → State Update → Calculation Engine → Assignment Logic → File Save → UI Update
     ↑                                                                              ↓
     └─────────────── Real-time Feedback Loop ──────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend Core
- **React 18.2+**: Latest with Concurrent Features
- **TypeScript 5.0+**: Strict type checking
- **Vite 4.0+**: Fast development and build
- **React Router 6**: Client-side routing

### Styling & UI
- **Tailwind CSS 3.3+**: Utility-first styling
- **Headless UI**: Accessible component primitives
- **Framer Motion**: 60fps animations
- **Lucide React**: Consistent iconography

### State Management
- **React Context**: Global state
- **useReducer**: Complex state logic
- **React Hook Form**: Form state management
- **Zustand**: If Context becomes unwieldy

### Data & Persistence
- **Node.js**: File system operations
- **fs/promises**: Async file operations
- **JSON**: Data serialization format
- **Date-fns**: Date manipulation

### Testing Stack
- **Playwright 1.40+**: E2E testing (CRITICAL)
- **@playwright/test**: Test runner
- **Jest 29+**: Unit testing
- **React Testing Library**: Component testing
- **MSW**: API mocking (if needed)
- **Axe-core**: Accessibility testing

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **Lint-staged**: Pre-commit linting
- **TypeScript**: Compile-time checks

### Build & Deployment
- **Vite**: Build tool
- **Electron**: Desktop app wrapper (future)
- **Docker**: Containerization (optional)

## 🎨 Apple Liquid Glass Design System

### Core Principles
- **Depth & Layering**: Multiple glass layers with varying opacity
- **Blur Effects**: Backdrop filters for glassmorphism
- **Smooth Animations**: 60fps spring-based transitions
- **Dynamic Colors**: Adaptive color schemes
- **Consistent Spacing**: 4px base unit scaling

### Design Tokens
```typescript
// Glass Effect Variables
export const glassTokens = {
  blur: {
    sm: 'blur(8px)',
    md: 'blur(16px)', 
    lg: 'blur(24px)',
    xl: 'blur(32px)'
  },
  opacity: {
    light: 0.8,
    medium: 0.6,
    heavy: 0.4
  },
  borders: {
    glass: '1px solid rgba(255, 255, 255, 0.2)',
    dark: '1px solid rgba(255, 255, 255, 0.1)'
  },
  shadows: {
    glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
    elevated: '0 16px 64px rgba(0, 0, 0, 0.15)'
  }
};
```

### Component Specifications
```typescript
// Glass Card System
interface GlassCardProps {
  variant: 'default' | 'elevated' | 'floating';
  blur: 'sm' | 'md' | 'lg' | 'xl';
  opacity: number;
  children: ReactNode;
}

// Glass Button System  
interface GlassButtonProps {
  variant: 'primary' | 'secondary' | 'destructive';
  size: 'sm' | 'md' | 'lg';
  state: 'default' | 'hover' | 'active' | 'disabled';
}
```

### Responsive Design Strategy
- **Mobile First**: Start with mobile constraints
- **Progressive Enhancement**: Add desktop features
- **Touch Targets**: 44px minimum interactive elements
- **Gesture Support**: Swipe, drag, pinch interactions

## 🗂️ File System Strategy

### Directory Structure
```
/family-task-manager
├── data/
│   └── families/
│       └── {family-id}/
│           ├── tasks.json
│           ├── settings.json
│           ├── history.json
│           └── backups/
│               ├── tasks-2025-01-15.json
│               ├── tasks-2025-01-14.json
│               └── ...
├── src/
├── tests/
└── docs/
```

### Data Models
```typescript
// tasks.json structure
interface TaskDataFile {
  version: string;
  familyId: string;
  lastModified: string;
  tasks: Task[];
  categories: Category[];
  metadata: {
    totalTasks: number;
    lastBackup: string;
    checksum: string;
  };
}

// File System Service
interface FileSystemService {
  save(familyId: string, data: TaskDataFile): Promise<void>;
  load(familyId: string): Promise<TaskDataFile>;
  backup(familyId: string): Promise<string>;
  restore(familyId: string, backupId: string): Promise<void>;
  validate(data: TaskDataFile): boolean;
}
```

### Backup Strategy
- **Automatic**: Create backup on significant changes (>10 tasks modified)
- **Daily**: Scheduled backup at end of day
- **Retention**: Keep 30 days of backups
- **Validation**: Checksum verification on load

## 🧪 Testing Strategy (CRITICAL)

### Test Pyramid
```
                    E2E Tests (Playwright)
                  ├─ User Workflows
                  ├─ Cross-browser
                  └─ Accessibility
              
            Integration Tests
          ├─ Component Integration  
          ├─ File System Operations
          └─ Business Logic Flows

      Unit Tests (Jest + RTL)
    ├─ Components
    ├─ Hooks  
    ├─ Utils
    └─ Business Logic
```

### Test Coverage Requirements
- **E2E Coverage**: 100% user workflow paths
- **Unit Coverage**: 80% minimum code coverage
- **Integration**: All API boundaries tested
- **Visual**: Regression testing for UI changes
- **Performance**: Load time and interaction benchmarks

### Critical Test Categories
1. **Task Management Flow**: CRUD operations
2. **Point Calculation**: All frequency scenarios  
3. **Assignment Logic**: Edge cases and ties
4. **Data Persistence**: Save/load/backup operations
5. **Responsive Design**: Mobile/desktop transitions
6. **Accessibility**: Keyboard navigation, screen readers

### Quality Gates (MANDATORY)
- ✅ **100% Playwright test pass rate**
- ✅ **Zero accessibility violations** 
- ✅ **Cross-browser compatibility**
- ✅ **Mobile responsiveness verified**
- ✅ **Performance benchmarks met**

## 🛠️ Required Tools List

### Development Environment
```bash
# Core Tools
node: ^18.17.0
npm: ^9.6.7
git: ^2.40.0

# Editors & Extensions
vscode: ^1.80.0
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Playwright Test for VSCode
  - TypeScript Importer
  - Auto Rename Tag

# Browsers for Testing
chrome: ^115.0.0
firefox: ^116.0.0  
safari: ^16.5.0 (macOS)
edge: ^115.0.0
```

### Package Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "react-hook-form": "^7.45.0",
    "@headlessui/react": "^1.7.17",
    "framer-motion": "^10.12.0",
    "lucide-react": "^0.263.1",
    "clsx": "^2.0.0",
    "tailwind-merge": "^1.14.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@types/react": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "eslint-plugin-playwright": "^0.15.3",
    "tailwindcss": "^3.3.0",
    "vite": "^4.4.5",
    "vitest": "^0.34.0"
  }
}
```

### System Requirements
- **OS**: macOS 12+, Windows 10+, Ubuntu 20.04+
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 5GB for dependencies and tools
- **Network**: Stable connection for package installs

## 📋 Development Workflow

### Git Strategy
- **Main Branch**: Production-ready code
- **Feature Branches**: `feature/task-management`, `feature/glass-ui`
- **Testing Branch**: `test/playwright-setup`
- **Commit Convention**: Conventional Commits

### Development Process
1. **Feature Planning**: Define requirements and tests
2. **Test Writing**: Create failing E2E tests first
3. **Implementation**: Build feature to pass tests
4. **Code Review**: Peer review with test validation
5. **Integration**: Merge only with 100% test pass
6. **Deployment**: Automated with quality gates

### Quality Assurance Process
1. **Pre-commit**: Lint, format, unit tests
2. **Pre-push**: Full test suite execution
3. **CI/CD**: Automated testing on multiple browsers
4. **Release**: Manual verification of all quality gates

## 🎯 Success Metrics

### Technical KPIs
- **Test Coverage**: 100% E2E, 80%+ unit
- **Performance**: <2s load time, <100ms interactions
- **Accessibility**: WCAG 2.1 AA compliance
- **Cross-browser**: 95%+ compatibility

### User Experience KPIs  
- **Task Addition**: <30 seconds end-to-end
- **Point Calculation**: Real-time (<100ms) updates
- **Mobile Usability**: Seamless touch interactions
- **Data Reliability**: Zero data loss incidents

### Business KPIs
- **Fair Distribution**: Balanced monthly points
- **User Adoption**: Daily active usage
- **Conflict Resolution**: Reduced household discussions
- **System Trust**: Consistent rule application

## 🚀 Next Steps

1. **Environment Setup**: Install tools and dependencies
2. **Project Bootstrap**: Create React + TypeScript + Tailwind setup
3. **Testing Foundation**: Configure Playwright test framework
4. **Glass UI System**: Build core design components
5. **File System**: Implement local data persistence
6. **Feature Development**: Build according to TASKS.md milestones

Remember: **Quality is non-negotiable**. Every feature must have 100% test coverage and pass all quality gates before moving to the next milestone.