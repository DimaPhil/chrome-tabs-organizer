import type { Tab } from '@/types';
import { formatRelativeTime, truncateUrl, getDomain } from '@/utils';

interface TabTooltipProps {
  tab: Tab;
}

export function TabTooltip({ tab }: TabTooltipProps) {
  return (
    <div className="max-w-sm p-3 bg-card border border-border rounded-lg shadow-xl">
      {/* Title */}
      <div className="font-medium text-card-foreground text-sm mb-1">{tab.title}</div>

      {/* URL */}
      <div className="text-xs text-muted-foreground mb-2 break-all">{truncateUrl(tab.url, 80)}</div>

      {/* Details */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          <span className="text-foreground font-medium">Domain:</span> {getDomain(tab.url)}
        </span>
        {tab.lastAccessed && (
          <span>
            <span className="text-foreground font-medium">Last accessed:</span>{' '}
            {formatRelativeTime(tab.lastAccessed)}
          </span>
        )}
        {tab.pinned && (
          <span className="text-primary font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 002 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 002-2V5z" />
            </svg>
            Pinned
          </span>
        )}
        {tab.active && (
          <span className="text-green-500 font-medium flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Active
          </span>
        )}
      </div>
    </div>
  );
}
