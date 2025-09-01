import { useCallback } from 'react';
import { useAnalytics } from './AnalyticsProvider';

export const useEcommerceAnalytics = () => {
  const { trackEcommerce, trackEvent } = useAnalytics();

  const trackProductView = useCallback((product: {
    id: string;
    name: string;
    category: string;
    price: number;
    brand?: string;
    variant?: string;
  }) => {
    trackEcommerce({
      event_name: 'view_item',
      currency: 'INR',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        category: product.category,
        quantity: 1,
        price: product.price,
        brand: product.brand,
        variant: product.variant,
      }]
    });

    trackEvent({
      event: 'product_view',
      category: 'ecommerce',
      action: 'view_product',
      label: product.name,
      value: product.price,
      custom_parameters: {
        product_id: product.id,
        product_category: product.category,
        product_brand: product.brand,
      }
    });
  }, [trackEcommerce, trackEvent]);

  const trackAddToCart = useCallback((product: {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    brand?: string;
    variant?: string;
  }) => {
    trackEcommerce({
      event_name: 'add_to_cart',
      currency: 'INR',
      value: product.price * product.quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        category: product.category,
        quantity: product.quantity,
        price: product.price,
        brand: product.brand,
        variant: product.variant,
      }]
    });

    trackEvent({
      event: 'add_to_cart',
      category: 'ecommerce',
      action: 'add_to_cart',
      label: product.name,
      value: product.price * product.quantity,
      custom_parameters: {
        product_id: product.id,
        quantity: product.quantity,
      }
    });
  }, [trackEcommerce, trackEvent]);

  const trackRemoveFromCart = useCallback((product: {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    brand?: string;
  }) => {
    trackEcommerce({
      event_name: 'remove_from_cart',
      currency: 'INR',
      value: product.price * product.quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        category: product.category,
        quantity: product.quantity,
        price: product.price,
        brand: product.brand,
      }]
    });

    trackEvent({
      event: 'remove_from_cart',
      category: 'ecommerce',
      action: 'remove_from_cart',
      label: product.name,
      value: product.price * product.quantity,
    });
  }, [trackEcommerce, trackEvent]);

  const trackBeginCheckout = useCallback((items: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    brand?: string;
  }>, totalValue: number) => {
    trackEcommerce({
      event_name: 'begin_checkout',
      currency: 'INR',
      value: totalValue,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        brand: item.brand,
      }))
    });

    trackEvent({
      event: 'begin_checkout',
      category: 'ecommerce',
      action: 'begin_checkout',
      value: totalValue,
      custom_parameters: {
        items_count: items.length,
        total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      }
    });
  }, [trackEcommerce, trackEvent]);

  const trackPurchase = useCallback((order: {
    orderId: string;
    items: Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      quantity: number;
      brand?: string;
    }>;
    totalValue: number;
    currency?: string;
    shipping?: number;
    tax?: number;
    couponCode?: string;
  }) => {
    trackEcommerce({
      event_name: 'purchase',
      currency: order.currency || 'INR',
      value: order.totalValue,
      transaction_id: order.orderId,
      items: order.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        brand: item.brand,
      }))
    });

    trackEvent({
      event: 'purchase',
      category: 'ecommerce',
      action: 'purchase',
      value: order.totalValue,
      custom_parameters: {
        order_id: order.orderId,
        items_count: order.items.length,
        shipping_cost: order.shipping,
        tax_amount: order.tax,
        coupon_code: order.couponCode,
      }
    });
  }, [trackEcommerce, trackEvent]);

  const trackSearch = useCallback((searchTerm: string, resultsCount: number) => {
    trackEvent({
      event: 'search',
      category: 'engagement',
      action: 'search',
      label: searchTerm,
      value: resultsCount,
      custom_parameters: {
        search_term: searchTerm,
        results_count: resultsCount,
      }
    });
  }, [trackEvent]);

  const trackFilterUsage = useCallback((filterType: string, filterValue: string) => {
    trackEvent({
      event: 'filter_usage',
      category: 'engagement',
      action: 'use_filter',
      label: `${filterType}: ${filterValue}`,
      custom_parameters: {
        filter_type: filterType,
        filter_value: filterValue,
      }
    });
  }, [trackEvent]);

  const trackRecommendationClick = useCallback((product: {
    id: string;
    name: string;
    recommendationType: string;
    position: number;
  }) => {
    trackEvent({
      event: 'recommendation_click',
      category: 'engagement',
      action: 'click_recommendation',
      label: product.name,
      value: product.position,
      custom_parameters: {
        product_id: product.id,
        recommendation_type: product.recommendationType,
        position: product.position,
      }
    });
  }, [trackEvent]);

  const trackWishlistAdd = useCallback((product: {
    id: string;
    name: string;
    category: string;
    price: number;
  }) => {
    trackEvent({
      event: 'add_to_wishlist',
      category: 'engagement',
      action: 'add_to_wishlist',
      label: product.name,
      value: product.price,
      custom_parameters: {
        product_id: product.id,
        product_category: product.category,
      }
    });
  }, [trackEvent]);

  const trackUserRegistration = useCallback((method: 'email' | 'google' | 'facebook') => {
    trackEvent({
      event: 'sign_up',
      category: 'user',
      action: 'register',
      label: method,
      custom_parameters: {
        method,
      }
    });
  }, [trackEvent]);

  const trackUserLogin = useCallback((method: 'email' | 'google' | 'facebook') => {
    trackEvent({
      event: 'login',
      category: 'user',
      action: 'login',
      label: method,
      custom_parameters: {
        method,
      }
    });
  }, [trackEvent]);

  const trackNewsletterSignup = useCallback((location: string) => {
    trackEvent({
      event: 'newsletter_signup',
      category: 'engagement',
      action: 'newsletter_signup',
      label: location,
      custom_parameters: {
        signup_location: location,
      }
    });
  }, [trackEvent]);

  const trackSocialShare = useCallback((platform: string, content: string) => {
    trackEvent({
      event: 'share',
      category: 'engagement',
      action: 'social_share',
      label: platform,
      custom_parameters: {
        platform,
        content_type: content,
      }
    });
  }, [trackEvent]);

  return {
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackBeginCheckout,
    trackPurchase,
    trackSearch,
    trackFilterUsage,
    trackRecommendationClick,
    trackWishlistAdd,
    trackUserRegistration,
    trackUserLogin,
    trackNewsletterSignup,
    trackSocialShare,
  };
};

// Performance tracking hook
export const usePerformanceAnalytics = () => {
  const { trackEvent } = useAnalytics();

  const trackPageLoad = useCallback((pageName: string, loadTime: number) => {
    trackEvent({
      event: 'page_performance',
      category: 'performance',
      action: 'page_load',
      label: pageName,
      value: Math.round(loadTime),
      custom_parameters: {
        page_name: pageName,
        load_time_ms: loadTime,
      }
    });
  }, [trackEvent]);

  const trackApiCall = useCallback((endpoint: string, duration: number, status: number) => {
    trackEvent({
      event: 'api_performance',
      category: 'performance',
      action: 'api_call',
      label: endpoint,
      value: Math.round(duration),
      custom_parameters: {
        endpoint,
        duration_ms: duration,
        status_code: status,
      }
    });
  }, [trackEvent]);

  const trackError = useCallback((errorType: string, errorMessage: string, pageName?: string) => {
    trackEvent({
      event: 'error',
      category: 'error',
      action: errorType,
      label: errorMessage,
      custom_parameters: {
        error_type: errorType,
        error_message: errorMessage,
        page_name: pageName,
      }
    });
  }, [trackEvent]);

  return {
    trackPageLoad,
    trackApiCall,
    trackError,
  };
};
