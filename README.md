# Chrome Tabs Organizer

A Chrome extension that replaces the new tab page with an interactive dashboard for organizing and navigating your browser tabs.

## Motivation

If you're like me and have 100+ tabs open at any time, finding the right tab becomes a nightmare. Chrome's built-in tab management is minimal, and switching between tabs requires either remembering where they are or scrolling through an endless tab bar.

**Tabs Organizer** solves this by:
- Giving you a bird's-eye view of all your tabs organized by category
- Letting you drag-and-drop tabs into meaningful groups
- Remembering your categorization so tabs stay organized across browser restarts
- Providing instant search to find any tab in seconds

## Features

- **Dashboard View** - Grid layout showing all categories with their tabs at a glance
- **7 Default Categories** - Work, AI, Trading, Social, Entertainment, Learning, and Uncategorized
- **Drag & Drop** - Move tabs between categories, reorder categories, reorder tabs within categories
- **Persistent Memory** - Categorizations are saved by URL, so reopening the same page puts it back in the right category
- **Quick Search** - Press `/` to search across all tabs by title or URL
- **Tab Actions** - Right-click any tab to switch to it, open in new tab, close, pin, or move to another category
- **Dark/Light Mode** - Automatically follows your system preference
- **Keyboard Navigation** - Press `Escape` to go back from category view

## Installation

### From Source (Developer Mode)

1. Clone the repository:
   ```bash
   git clone https://github.com/DimaPhil/chrome-tabs-organizer.git
   cd chrome-tabs-organizer
   ```

2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

3. Load in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from the project

4. Open a new tab to see the dashboard!

### From Release

1. Download the latest `tabs-organizer-vX.X.X.zip` from [Releases](https://github.com/DimaPhil/chrome-tabs-organizer/releases)
2. Extract the ZIP file
3. Open `chrome://extensions`
4. Enable "Developer mode"
5. Click "Load unpacked"
6. Select the extracted folder

## Usage

### Organizing Tabs

- **Drag tabs** from one category to another to categorize them
- **Click a category** to see all its tabs in an expanded view
- **Drag categories** to reorder them on the dashboard
- **Click "+ Add New Category"** to create custom categories

### Finding Tabs

- Press `/` or click the search bar to search
- Type to filter tabs by title or URL
- Matching tabs are highlighted, others are dimmed

### Tab Actions

Right-click any tab to:
- **Switch to** - Activate this tab in Chrome
- **Open in new tab** - Open the same URL in a new tab
- **Close** - Close the tab
- **Pin/Unpin** - Toggle pin status
- **Move to...** - Move to a different category

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `Escape` | Clear search / Go back to dashboard |

## Development

```bash
# Install dependencies
npm install

# Run development server (with hot reload)
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck

# Lint
npm run lint

# Format code
npm run format
```

## Tech Stack

- **TypeScript** - Type-safe code
- **React 18** - UI components
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **@dnd-kit** - Drag and drop
- **Chrome Manifest V3** - Extension APIs

## License

MIT
