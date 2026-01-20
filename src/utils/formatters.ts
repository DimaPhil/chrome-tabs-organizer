export function formatRelativeTime(timestamp: number | undefined): string {
  if (!timestamp) return '';

  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ago`;
  }
  if (hours > 0) {
    return `${hours}h ago`;
  }
  if (minutes > 0) {
    return `${minutes}m ago`;
  }
  return 'Just now';
}

export function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;

  try {
    const parsed = new URL(url);
    const domain = parsed.hostname;
    const path = parsed.pathname;

    if (domain.length + path.length > maxLength) {
      return domain + path.slice(0, maxLength - domain.length - 3) + '...';
    }
    return domain + path;
  } catch {
    return url.slice(0, maxLength - 3) + '...';
  }
}

export function truncateTitle(title: string, maxLength: number = 30): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength - 3) + '...';
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
