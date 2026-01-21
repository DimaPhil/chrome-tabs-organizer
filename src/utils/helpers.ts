import { FALLBACK_FAVICON } from './constants';

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function handleFaviconError(e: React.SyntheticEvent<HTMLImageElement>): void {
  e.currentTarget.src = FALLBACK_FAVICON;
}
