import React, { createContext, useContext, useEffect, ReactNode } from 'react';

// Types for analytics events
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export interface EcommerceEvent {
  event_name: 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'view_item' | 'begin_checkout' | 'view_cart';
  currency: string;
  value?: number;
  items: {
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
    brand?: string;
    variant?: string;
  }[];
  transaction_id?: string;
}

export interface UserProperties {
  user_id?: string;
  customer_lifetime_value?: number;
  preferred_category?: string;
  total_orders?: number;
  registration_date?: string;
}

interface AnalyticsContextType {
  trackEvent: (event: AnalyticsEvent) => void;
  trackEcommerce: (event: EcommerceEvent) => void;
  trackPageView: (page: string, title?: string) => void;
  setUserProperties: (properties: UserProperties) => void;
  identify: (userId: string, properties?: UserProperties) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: ReactNode;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  hotjarId?: string;
  enableInDevelopment?: boolean;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
  googleAnalyticsId = process.env.REACT_APP_GA_MEASUREMENT_ID,
  facebookPixelId = process.env.REACT_APP_FACEBOOK_PIXEL_ID,
  hotjarId = process.env.REACT_APP_HOTJAR_ID,
  enableInDevelopment = false,
}) => {
  const isEnabled = process.env.NODE_ENV === 'production' || enableInDevelopment;

  useEffect(() => {
    if (!isEnabled) return;

    // Initialize Google Analytics
    if (googleAnalyticsId) {
      initializeGoogleAnalytics(googleAnalyticsId);
    }

    // Initialize Facebook Pixel
    if (facebookPixelId) {
      initializeFacebookPixel(facebookPixelId);
    }

    // Initialize Hotjar
    if (hotjarId) {
      initializeHotjar(hotjarId);
    }
  }, [googleAnalyticsId, facebookPixelId, hotjarId, isEnabled]);

  const trackEvent = (event: AnalyticsEvent) => {
    if (!isEnabled) {
      console.log('Analytics Event (Dev):', event);
      return;
    }

    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters,
      });
    }

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('trackCustom', event.event, {
        category: event.category,
        action: event.action,
        label: event.label,
        value: event.value,
        ...event.custom_parameters,
      });
    }
  };

  const trackEcommerce = (event: EcommerceEvent) => {
    if (!isEnabled) {
      console.log('Ecommerce Event (Dev):', event);
      return;
    }

    // Google Analytics 4 Enhanced Ecommerce
    if (window.gtag) {
      window.gtag('event', event.event_name, {
        currency: event.currency,
        value: event.value,
        items: event.items,
        transaction_id: event.transaction_id,
      });
    }

    // Facebook Pixel Ecommerce Events
    if (window.fbq) {
      const fbEventMap = {
        purchase: 'Purchase',
        add_to_cart: 'AddToCart',
        remove_from_cart: 'RemoveFromCart',
        view_item: 'ViewContent',
        begin_checkout: 'InitiateCheckout',
        view_cart: 'ViewCart',
      };

      window.fbq('track', fbEventMap[event.event_name], {
        currency: event.currency,
        value: event.value,
        content_ids: event.items.map(item => item.item_id),
        contents: event.items.map(item => ({
          id: item.item_id,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    }
  };

  const trackPageView = (page: string, title?: string) => {
    if (!isEnabled) {
      console.log('Page View (Dev):', { page, title });
      return;
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('config', googleAnalyticsId!, {
        page_path: page,
        page_title: title,
      });
    }

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  };

  const setUserProperties = (properties: UserProperties) => {
    if (!isEnabled) {
      console.log('User Properties (Dev):', properties);
      return;
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('config', googleAnalyticsId!, {
        user_properties: properties,
      });
    }
  };

  const identify = (userId: string, properties?: UserProperties) => {
    if (!isEnabled) {
      console.log('User Identify (Dev):', { userId, properties });
      return;
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('config', googleAnalyticsId!, {
        user_id: userId,
        user_properties: properties,
      });
    }

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('init', facebookPixelId!, {
        external_id: userId,
      });
    }
  };

  const value: AnalyticsContextType = {
    trackEvent,
    trackEcommerce,
    trackPageView,
    setUserProperties,
    identify,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

// Helper functions to initialize tracking scripts
const initializeGoogleAnalytics = (measurementId: string) => {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: any[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_path: window.location.pathname,
  });
};

const initializeFacebookPixel = (pixelId: string) => {
  window.fbq = function(...args: any[]) {
    if (window.fbq.callMethod) {
      window.fbq.callMethod.apply(window.fbq, args);
    } else {
      window.fbq.queue.push(args);
    }
  };
  window.fbq.push = window.fbq;
  window.fbq.loaded = true;
  window.fbq.version = '2.0';
  window.fbq.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
};

const initializeHotjar = (hotjarId: string) => {
  window.hj = function(...args: any[]) {
    (window.hj.q = window.hj.q || []).push(args);
  };
  window._hjSettings = { hjid: parseInt(hotjarId), hjsv: 6 };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://static.hotjar.com/c/hotjar-${hotjarId}.js?sv=6`;
  document.head.appendChild(script);
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: any;
    hj: any;
    _hjSettings: { hjid: number; hjsv: number };
  }
}
