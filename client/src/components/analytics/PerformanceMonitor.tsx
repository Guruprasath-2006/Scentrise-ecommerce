import React, { useEffect } from 'react';
import { usePerformanceAnalytics } from './useEcommerceAnalytics';

interface PerformanceMonitorProps {
  pageName: string;
  enableWebVitals?: boolean;
  enableResourceTiming?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  pageName,
  enableWebVitals = true,
  enableResourceTiming = false,
}) => {
  const { trackPageLoad, trackError } = usePerformanceAnalytics();

  useEffect(() => {
    // Track page load performance
    const trackLoadPerformance = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;

          trackPageLoad(pageName, loadTime);

          // Track additional metrics
          if (enableWebVitals) {
            trackWebVitals(pageName);
          }

          if (enableResourceTiming) {
            trackResourcePerformance();
          }
        }
      }
    };

    // Wait for the page to fully load before measuring
    if (document.readyState === 'complete') {
      setTimeout(trackLoadPerformance, 100);
    } else {
      window.addEventListener('load', () => {
        setTimeout(trackLoadPerformance, 100);
      });
    }

    // Track JavaScript errors
    const handleError = (event: ErrorEvent) => {
      trackError('javascript_error', event.message, pageName);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError('promise_rejection', String(event.reason), pageName);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [pageName, enableWebVitals, enableResourceTiming, trackPageLoad, trackError]);

  return null; // This component doesn't render anything
};

// Function to track Core Web Vitals
const trackWebVitals = (pageName: string) => {
  // This would typically use the web-vitals library
  // For now, we'll use basic Performance API measurements
  
  if (typeof window !== 'undefined' && window.performance) {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          if (lastEntry) {
            console.log(`LCP for ${pageName}:`, lastEntry.startTime);
            // You can track this with your analytics
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            const fid = entry.processingStart - entry.startTime;
            console.log(`FID for ${pageName}:`, fid);
            // You can track this with your analytics
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          console.log(`CLS for ${pageName}:`, clsValue);
          // You can track this with your analytics
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

      } catch (error) {
        console.warn('Performance monitoring not supported:', error);
      }
    }
  }
};

// Function to track resource loading performance
const trackResourcePerformance = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    // Group resources by type
    const resourceGroups: Record<string, PerformanceResourceTiming[]> = {
      images: [],
      scripts: [],
      stylesheets: [],
      fonts: [],
      other: []
    };

    resources.forEach((resource) => {
      const name = resource.name.toLowerCase();
      
      if (name.includes('.jpg') || name.includes('.png') || name.includes('.gif') || name.includes('.webp')) {
        resourceGroups.images.push(resource);
      } else if (name.includes('.js')) {
        resourceGroups.scripts.push(resource);
      } else if (name.includes('.css')) {
        resourceGroups.stylesheets.push(resource);
      } else if (name.includes('.woff') || name.includes('.ttf')) {
        resourceGroups.fonts.push(resource);
      } else {
        resourceGroups.other.push(resource);
      }
    });

    // Log performance metrics for each resource type
    Object.entries(resourceGroups).forEach(([type, resources]) => {
      if (resources.length > 0) {
        const totalDuration = resources.reduce((sum, resource) => {
          return sum + (resource.responseEnd - resource.fetchStart);
        }, 0);
        
        const averageDuration = totalDuration / resources.length;
        
        console.log(`${type} resources:`, {
          count: resources.length,
          totalDuration: Math.round(totalDuration),
          averageDuration: Math.round(averageDuration)
        });
      }
    });
  }
};

export default PerformanceMonitor;

// Hook for manual performance tracking
export const usePerformanceTracker = () => {
  const { trackPageLoad, trackApiCall } = usePerformanceAnalytics();

  const startTimer = () => {
    return performance.now();
  };

  const endTimer = (startTime: number, operation: string, category: 'api' | 'page' | 'interaction' = 'interaction') => {
    const duration = performance.now() - startTime;
    
    switch (category) {
      case 'api':
        trackApiCall(operation, duration, 200); // Assuming success, you can pass actual status
        break;
      case 'page':
        trackPageLoad(operation, duration);
        break;
      default:
        console.log(`${operation} took ${Math.round(duration)}ms`);
    }
    
    return duration;
  };

  return {
    startTimer,
    endTimer,
  };
};
