// Performance configuration constants
export const PERFORMANCE_CONFIG = {
  // Cache settings
  CACHE: {
    AGENTS_TTL: 5 * 60 * 1000, // 5 minutes
    DEFAULT_TTL: 2 * 60 * 1000, // 2 minutes
    STALE_WHILE_REVALIDATE: true,
  },

  // API settings
  API: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },

  // UI settings
  UI: {
    DEBOUNCE_DELAY: 300, // 300ms
    THROTTLE_DELAY: 100, // 100ms
    ANIMATION_DURATION: 200, // 200ms
    LAZY_LOAD_THRESHOLD: 100, // 100px
  },

  // Memory management
  MEMORY: {
    MAX_CACHE_ENTRIES: 50,
    CLEANUP_INTERVAL: 10 * 60 * 1000, // 10 minutes
  },
} as const;

// Performance monitoring utilities
export const performanceMonitor = {
  // Mark performance points
  mark: (name: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(name);
    }
  },

  // Measure performance between marks
  measure: (name: string, startMark: string, endMark?: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        window.performance.measure(name, startMark, endMark);
        const measure = window.performance.getEntriesByName(name)[0];
        return measure?.duration || 0;
      } catch (error) {
        console.warn('Performance measurement failed:', error);
        return 0;
      }
    }
    return 0;
  },

  // Clear performance marks and measures
  clear: (name?: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      if (name) {
        window.performance.clearMarks(name);
        window.performance.clearMeasures(name);
      } else {
        window.performance.clearMarks();
        window.performance.clearMeasures();
      }
    }
  },

  // Get performance entries
  getEntries: (type?: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      return type 
        ? window.performance.getEntriesByType(type)
        : window.performance.getEntries();
    }
    return [];
  },
};

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = PERFORMANCE_CONFIG.UI.DEBOUNCE_DELAY
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number = PERFORMANCE_CONFIG.UI.THROTTLE_DELAY
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}
