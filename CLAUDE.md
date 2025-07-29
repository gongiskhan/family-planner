# CLAUDE.md - Family Task Manager Development Guide

## Project Overview

You are building a **Family Task Manager** - a React application that helps couples fairly distribute household and childcare responsibilities through an objective scoring system. This guide provides context for all development sessions.

## Core Concept

**Problem**: Couples struggle with fair distribution of household tasks and childcare responsibilities, leading to conflicts and feelings of inequity.

**Solution**: Objective point-based system where both partners score tasks (0-50) based on time/energy/stress. The person with the lowest score gets assigned the task automatically.

## Target Users

- **Primary**: Gonçalo and Marília (dual-income couple with Laura, 1.5 years, and Diogo, 5 years)
- **Secondary**: Similar couples seeking structured household management

## Key Technical Requirements

### Technology Stack
- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with Apple Liquid Glass UI
- **State**: React Context + useReducer
- **Storage**: Local file system (Node.js backend)
- **Testing**: Playwright for E2E, Jest for unit tests
- **Build**: Vite
- **Package Manager**: npm

### Critical Architecture Decisions

1. **Local File Storage**: All data saves to file system, NOT external APIs
2. **Apple Liquid Glass UI**: Glassmorphism effects, backdrop blur, depth layers
3. **Mobile-First**: Responsive design with card-based mobile view
4. **100% Test Coverage**: Mandatory Playwright E2E tests that must pass before any feature completion

## Core Data Model

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  frequency: TaskFrequency; // 8x/day to annual
  points: {
    goncalo: number;    // 0-50 scale
    marilia: number;    // 0-50 scale
  };
  assignment?: 'goncalo' | 'marilia' | 'tie';
  monthlyPoints: number; // Auto-calculated
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

type TaskFrequency = '8x/dia' | '6x/dia' | '4x/dia' | '3x/dia' | '2x/dia' 
  | 'diária' | 'dias alternados' | 'semanal' | 'quinzenal' | 'mensal' 
  | 'bimestral' | 'trimestral' | 'semestral' | 'anual';
```

## Business Logic Rules

### Point Calculation
Tasks are scored 0-50 by both partners. Monthly points calculated as:
```
Monthly Points = Task Points × Frequency Multiplier
```

### Frequency Multipliers
- 8x/day: 240 (8 × 30)
- 6x/day: 180 (6 × 30)  
- 4x/day: 120 (4 × 30)
- 3x/day: 90 (3 × 30)
- 2x/day: 60 (2 × 30)
- Daily: 30 (1 × 30)
- Alternate days: 15
- Weekly: 4
- Biweekly: 2
- Monthly: 1
- Bimonthly: 0.5
- Quarterly: 0.33
- Semiannual: 0.17
- Annual: 0.08

### Assignment Logic
1. **Lowest Score Wins**: Person with lower points gets the task
2. **Ties**: Marked as "Decide" status for manual resolution
3. **Override**: Manual assignment capability
4. **Real-time**: Updates immediately when points change

## Pre-configured Task Categories (80+ tasks)

### 👶 Laura Care (1.5 years) - 23 tasks
- Daily feeding routines (breakfast, lunch, dinner, snacks)
- Diaper changes (6-8x daily)
- Bathing, hygiene, safety supervision
- Sleep routines, development activities
- Medical appointments and care

### 👦 Diogo Care (5 years) - 19 tasks  
- Meal supervision, school transportation
- Homework assistance, educational activities
- Personal hygiene supervision
- Medical/dental care coordination

### 🏠 Household Coordination - 10 tasks
- Daily meal planning for dinner
- Domestic staff management and oversight
- Quality control, specialized cleaning coordination

### 💰 Financial & Administrative - 14 tasks
- Domestic staff payroll and compliance
- Property maintenance contracts (pool, garden)
- Insurance, tax, and budget management

### 🛒 Shopping & Logistics - 7 tasks
### 🚗 Transportation & Vehicles - 7 tasks
### 👕 Clothing Management - 4 tasks
### 👨‍👩‍👧‍👦 Family Development - 8 tasks

## UI/UX Requirements

### Apple Liquid Glass Design System
```scss
// Key visual elements
.glass-card {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### Responsive Breakpoints
- **Mobile**: 0-767px (card-based layout)
- **Tablet**: 768-1023px 
- **Desktop**: 1024px+ (table + sidebar layout)

### Key UI Components
- **Desktop**: Rules sidebar (200px) + data table
- **Mobile**: Card-based layout with touch gestures
- **Both**: Real-time point calculations, drag-and-drop reordering

## Development Principles

### Testing Requirements (CRITICAL)
- **100% Playwright test pass rate** required before feature completion
- **E2E test coverage** for all user workflows
- **Unit tests** for business logic and components
- **Visual regression tests** for UI consistency
- **Accessibility tests** for WCAG 2.1 AA compliance

### Test-Driven Development Process
1. **Red**: Write failing E2E test for new feature
2. **Green**: Implement minimum code to pass test
3. **Refactor**: Optimize while maintaining test passes
4. **Iterate**: Fix bugs until 100% test pass rate achieved

### File System Storage
```
/data
  /families
    /{family-id}
      /tasks.json
      /settings.json
      /history.json
      /backups/
```

## Common Development Scenarios

### Adding New Task
1. Write Playwright test for task creation flow
2. Implement UI components with Liquid Glass styling
3. Add business logic for point calculation
4. Ensure file system persistence
5. Verify mobile responsiveness
6. Run full test suite until 100% pass

### Modifying Point Calculation
1. Write test cases for edge scenarios
2. Update calculation logic
3. Ensure real-time UI updates
4. Test across all frequency types
5. Verify assignment logic correctness

### UI Component Development
1. Follow Liquid Glass design patterns
2. Ensure mobile-first responsive design
3. Implement proper touch targets (44px minimum)
4. Add smooth 60fps animations
5. Test across all target browsers

## Quality Gates

Before considering any feature complete:
- ✅ **100% Playwright E2E tests passing**
- ✅ **80%+ unit test coverage**
- ✅ **Zero accessibility violations**
- ✅ **Mobile responsiveness verified**
- ✅ **Cross-browser compatibility confirmed**
- ✅ **Performance benchmarks met** (<2s load, <100ms interactions)

## Common Pitfalls to Avoid

1. **Skipping Tests**: Never implement features without corresponding E2E tests
2. **External Dependencies**: Keep all data local - no external APIs
3. **Performance Issues**: Maintain 60fps animations and fast interactions
4. **Accessibility Oversights**: Ensure keyboard navigation and screen reader support
5. **Mobile UX**: Don't just shrink desktop UI - design mobile-specific interactions

## Session Context

## 📋 Current Development Status (Updated)

### ✅ **COMPLETED FEATURES**
- **Foundation**: React + TypeScript + Vite setup with Tailwind CSS
- **Apple Liquid Glass UI**: Core components (GlassCard, GlassButton, GlassInput, GlassSelect)
- **Task Management**: Complete CRUD with TaskForm, TaskList, TaskCard components
- **Business Logic**: All 13 frequency multipliers and point calculation engine
- **State Management**: TaskContext with useReducer and auto-save functionality
- **File System**: Complete data persistence with backup/restore capabilities
- **Testing**: Playwright E2E tests (12/14 passing - 86% success rate)

### 🚧 **IN PROGRESS**
- **Mobile Responsiveness**: Basic responsive design implemented, needs touch interactions
- **Advanced UI**: Modal and navigation components needed

### ❌ **TODO - Next Priorities**
1. **GlassModal component** with proper z-index layering
2. **GlassNavigation** for sidebar and mobile nav
3. **Bulk task operations** (multi-select, batch edit/delete)
4. **Data visualization** components for analytics dashboard
5. **Mobile touch interactions** and gesture support
6. **Pagination** for large task lists
7. **Drag-and-drop** functionality for task reordering

### 🎯 **Quality Gates Status**
- ✅ **TypeScript**: Zero compilation errors
- ✅ **Build Process**: Production build successful
- ✅ **E2E Tests**: 86% pass rate (12/14 tests)
- ✅ **Core Functionality**: Task management working end-to-end
- ❌ **100% Test Coverage**: Need to add more comprehensive test scenarios

## Session Context Guidelines

When starting any development session:
1. **Review current test status** - Currently 12/14 tests passing, aim for 100%
2. **Identify which milestone/feature** - Currently on Milestone 3 (Mobile & Advanced Features)
3. **Ensure Apple Liquid Glass design consistency** - Core components done, need Modal/Navigation
4. **Verify file system storage implementation** - ✅ Working with localStorage fallback
5. **Test mobile responsiveness** - ✅ Basic responsive, needs touch interactions

### 🔧 **Known Technical Debt**
- **ESLint Configuration**: Needs TypeScript parser setup (currently simplified)
- **Missing Components**: GlassModal, GlassNavigation not yet implemented
- **Performance**: No virtual scrolling for large lists yet
- **Mobile UX**: Touch gestures and mobile-specific interactions needed
- **Error Boundaries**: Need more robust error handling in production

Remember: **Quality over speed**. It's better to fully complete fewer features with 100% test coverage than rush through features with failing tests.

## References

- **PRD**: Full product requirements document
- **PLANNING.md**: Architecture and technology decisions
- **TASKS.md**: Detailed milestone breakdown
- **Playwright Docs**: https://playwright.dev
- **Apple HIG**: https://developer.apple.com/design/human-interface-guidelines/