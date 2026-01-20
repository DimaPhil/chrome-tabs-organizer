# Chrome Tabs Organizer

A Chrome extension that replaces the new tab page with an interactive dashboard for organizing and navigating browser tabs.

## Project Overview

This extension organizes tabs into user-defined categories with a grid-of-grids layout. Features include:
- Drag-and-drop tab organization
- Search with keyboard shortcut (/)
- Category management (create, rename, delete)
- Dark/light mode (follows system)
- URL memory (remembers category assignments)

## Tech Stack

- **Language**: TypeScript (strict mode)
- **UI**: React 18
- **Styling**: Tailwind CSS
- **Build**: Vite
- **DnD**: @dnd-kit/core
- **Extension**: Chrome Manifest V3

## Project Structure

```
src/
├── newtab/          # New tab page entry point
├── background/      # Service worker
├── components/      # React components
│   ├── Dashboard/   # Main dashboard
│   ├── Category/    # Category components
│   ├── Tab/         # Tab components
│   ├── DragDrop/    # DnD components
│   ├── Search/      # Search components
│   ├── Navigation/  # Breadcrumb, etc.
│   └── common/      # Button, Input, Modal
├── hooks/           # Custom React hooks
├── services/        # Chrome API wrappers
├── store/           # State management (Context + Reducer)
├── types/           # TypeScript types
├── utils/           # Utilities and constants
└── styles/          # Global CSS
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# TypeScript check
npm run typecheck

# Lint (ESLint)
npm run lint
npm run lint:fix

# Format (Prettier)
npm run format
npm run format:check

# Run all CI checks
npm run ci
```

## Loading the Extension

1. Run `npm run build`
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` folder

## Git Hooks

Pre-commit hook runs `npm run ci` (typecheck + lint + format:check).

Install hooks: `npm run prepare` (automatic on `npm install`)

## Release Process

1. Update version in `package.json` and `public/manifest.json`
2. Create and push a tag: `git tag v1.0.0 && git push origin v1.0.0`
3. GitHub Action creates a release with the extension ZIP

## Architecture Notes

### State Management
Uses React Context + useReducer pattern. State includes:
- `tabs`: Current window tabs
- `categories`: User categories
- `assignments`: Tab → Category mapping
- `currentView`: 'all' or { categoryId }
- `searchQuery`: Current search

### Storage
Primary: `chrome.storage.sync` (syncs across devices)
Fallback: `chrome.storage.local` (if sync fails)

### Categorization Strategy Pattern
`categorizationService.ts` uses strategy pattern for extensibility:
- `ManualCategorization` (current)
- Future: `RuleBasedCategorization`, `AICategorization`

## Key Files

- `src/store/AppContext.tsx` - Main state provider
- `src/services/storageService.ts` - Storage abstraction
- `src/services/tabService.ts` - Chrome tabs API wrapper
- `src/components/DragDrop/DragDropDashboard.tsx` - Main DnD logic
- `public/manifest.json` - Extension manifest

## Testing the Extension

1. **New tab test**: Open new tab → Dashboard appears
2. **Categorization**: Drag tab to category → Persists after refresh
3. **Navigation**: Click category → Expanded view → Esc → Returns
4. **Search**: Press `/` → Type → Tabs filter
5. **Context menu**: Right-click tab → All actions work
6. **Persistence**: Close browser → Reopen → State preserved
7. **Theme**: Toggle system dark mode → UI updates
