import { useState, useRef, useCallback } from 'react';

interface TooltipPosition {
  x: number;
  y: number;
}

interface UseTooltipPositionOptions {
  delay?: number;
  enabled?: boolean;
}

interface UseTooltipPositionReturn {
  isVisible: boolean;
  position: TooltipPosition;
  elementRef: React.RefObject<HTMLDivElement>;
  handlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
}

export function useTooltipPosition(
  options: UseTooltipPositionOptions = {}
): UseTooltipPositionReturn {
  const { delay = 400, enabled = true } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const onMouseEnter = useCallback(() => {
    if (!enabled) return;

    hoverTimeoutRef.current = setTimeout(() => {
      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        const spaceBelow = window.innerHeight - rect.bottom;
        const y = spaceBelow > 200 ? rect.bottom + 8 : rect.top - 8;
        setPosition({ x: rect.left, y });
      }
      setIsVisible(true);
    }, delay);
  }, [delay, enabled]);

  const onMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    position,
    elementRef,
    handlers: {
      onMouseEnter,
      onMouseLeave,
    },
  };
}
