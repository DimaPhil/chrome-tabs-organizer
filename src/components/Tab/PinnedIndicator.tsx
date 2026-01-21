import { cn } from '@/utils';

interface PinnedIndicatorProps {
  size?: 'sm' | 'md';
}

export function PinnedIndicator({ size = 'sm' }: PinnedIndicatorProps) {
  const containerClasses = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const iconClasses = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <div
      className={cn(
        'absolute -top-1 -left-1 bg-primary rounded-full flex items-center justify-center',
        containerClasses
      )}
    >
      <svg
        className={cn('text-primary-foreground', iconClasses)}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 002 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 002-2V5z" />
      </svg>
    </div>
  );
}
