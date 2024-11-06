// utils/debounce.ts
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
  
    function debounced(...args: Parameters<T>) {
      const later = () => {
        timeoutId = undefined;
        func(...args);
      };
  
      clearTimeout(timeoutId);
      timeoutId = setTimeout(later, wait);
    }
  
    debounced.cancel = () => {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    };
  
    return debounced;
  }
