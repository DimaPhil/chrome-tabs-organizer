import { useRef } from 'react';
import { Input } from '@/components/common';
import { useSearchShortcut, useEscapeKey } from '@/hooks';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on "/" key
  useSearchShortcut(() => {
    inputRef.current?.focus();
  });

  // Clear on Escape (when focused)
  useEscapeKey(() => {
    if (document.activeElement === inputRef.current) {
      if (value) {
        onClear();
      } else {
        inputRef.current?.blur();
      }
    }
  });

  return (
    <div className="relative max-w-md">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search tabs... (press /)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
