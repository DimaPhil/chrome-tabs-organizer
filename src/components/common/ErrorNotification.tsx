import { useEffect, useState } from 'react';
import type { AppError } from '@/store/actions';
import { cn } from '@/utils';

interface ErrorNotificationProps {
  error: AppError | null;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function ErrorNotification({
  error,
  onDismiss,
  autoDismissMs = 5000,
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for animation
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [error, autoDismissMs, onDismiss]);

  if (!error) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 max-w-sm bg-destructive text-destructive-foreground rounded-lg shadow-lg p-4 transition-all duration-300 z-50',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{error.message}</p>
          {error.code && <p className="text-xs opacity-75 mt-1">Error code: {error.code}</p>}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
