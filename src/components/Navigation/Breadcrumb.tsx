import type { Category } from '@/types';

interface BreadcrumbProps {
  currentCategory?: Category;
  onNavigateHome: () => void;
}

export function Breadcrumb({ currentCategory, onNavigateHome }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      <button
        onClick={onNavigateHome}
        className={`transition-smooth ${
          currentCategory
            ? 'text-muted-foreground hover:text-foreground'
            : 'text-foreground font-medium'
        }`}
      >
        All Categories
      </button>
      {currentCategory && (
        <>
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-foreground font-medium">{currentCategory.name}</span>
        </>
      )}
    </nav>
  );
}
