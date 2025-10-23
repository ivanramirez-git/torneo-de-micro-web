/**
 * Google Analytics 4 Utility Functions
 * Provides helper functions for tracking events, page views, and user interactions
 * Only sends data in production domain (micro.freeloz.com)
 */

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Check if we're in production domain
 */
const isProduction = (): boolean => {
  return window.location.hostname === 'micro.freeloz.com';
};

/**
 * Send a custom event to Google Analytics
 * @param eventName - Name of the event
 * @param eventParams - Additional parameters for the event
 */
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (!isProduction()) {
    console.log('[Analytics - Dev Mode]', eventName, eventParams);
    return;
  }
  
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  } else {
    console.warn('Google Analytics not loaded');
  }
};

/**
 * Track page views manually (useful for SPAs)
 * @param pagePath - The path of the page
 * @param pageTitle - The title of the page
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (!isProduction()) {
    console.log('[Analytics - Dev Mode] Page View:', pagePath, pageTitle);
    return;
  }
  
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      page_location: window.location.href,
    });
  }
};

/**
 * Track user interactions with specific elements
 * @param elementName - Name of the element
 * @param action - Action performed (click, view, etc.)
 * @param category - Category of the interaction
 */
export const trackInteraction = (elementName: string, action: string, category?: string) => {
  trackEvent('interaction', {
    element_name: elementName,
    action,
    category: category || 'general',
  });
};

/**
 * Track tournament-related events
 */
export const trackTournamentEvent = (action: string, tournamentName?: string, additionalData?: Record<string, any>) => {
  trackEvent('tournament_event', {
    action,
    tournament_name: tournamentName,
    ...additionalData,
  });
};

/**
 * Track match-related events
 */
export const trackMatchEvent = (action: string, matchId?: string | number, additionalData?: Record<string, any>) => {
  trackEvent('match_event', {
    action,
    match_id: matchId,
    ...additionalData,
  });
};

/**
 * Track player-related events
 */
export const trackPlayerEvent = (action: string, playerId?: string | number, additionalData?: Record<string, any>) => {
  trackEvent('player_event', {
    action,
    player_id: playerId,
    ...additionalData,
  });
};

/**
 * Track team-related events
 */
export const trackTeamEvent = (action: string, teamId?: string | number, additionalData?: Record<string, any>) => {
  trackEvent('team_event', {
    action,
    team_id: teamId,
    ...additionalData,
  });
};

/**
 * Track search events
 */
export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

/**
 * Track form submissions
 */
export const trackFormSubmit = (formName: string, success: boolean, errorMessage?: string) => {
  trackEvent('form_submit', {
    form_name: formName,
    success,
    error_message: errorMessage,
  });
};

/**
 * Track file downloads
 */
export const trackDownload = (fileName: string, fileType?: string) => {
  trackEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
  });
};

/**
 * Track video/media interactions
 */
export const trackMediaEvent = (action: string, mediaName?: string, duration?: number) => {
  trackEvent('media_interaction', {
    action,
    media_name: mediaName,
    duration,
  });
};

/**
 * Track scroll depth (useful for heatmap-like analysis)
 */
export const trackScrollDepth = (percentage: number) => {
  trackEvent('scroll_depth', {
    scroll_percentage: percentage,
  });
};

/**
 * Track time on page
 */
export const trackTimeOnPage = (timeInSeconds: number, pagePath: string) => {
  trackEvent('time_on_page', {
    time_seconds: timeInSeconds,
    page_path: pagePath,
  });
};

/**
 * Track button clicks with enhanced data
 */
export const trackButtonClick = (buttonName: string, location?: string, additionalData?: Record<string, any>) => {
  trackEvent('button_click', {
    button_name: buttonName,
    button_location: location,
    ...additionalData,
  });
};

/**
 * Track navigation events (menu clicks, etc.)
 */
export const trackNavigation = (destination: string, source?: string) => {
  trackEvent('navigation', {
    destination,
    source: source || 'unknown',
  });
};

/**
 * Track errors
 */
export const trackError = (errorMessage: string, errorType?: string, fatal?: boolean) => {
  trackEvent('error', {
    error_message: errorMessage,
    error_type: errorType || 'general',
    fatal: fatal || false,
  });
};

/**
 * Track user engagement (for calculating engagement metrics)
 */
export const trackEngagement = (engagementType: string, value?: number) => {
  trackEvent('engagement', {
    engagement_type: engagementType,
    value,
  });
};

/**
 * Setup scroll depth tracking
 * Tracks when user scrolls to 25%, 50%, 75%, and 90% of the page
 */
export const setupScrollTracking = () => {
  const scrollDepths = [25, 50, 75, 90];
  const trackedDepths = new Set<number>();

  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;

    scrollDepths.forEach((depth) => {
      if (scrollPercentage >= depth && !trackedDepths.has(depth)) {
        trackedDepths.add(depth);
        trackScrollDepth(depth);
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

/**
 * Setup time on page tracking
 * Tracks time spent on page before user leaves
 */
export const setupTimeTracking = (pagePath: string) => {
  const startTime = Date.now();

  const trackTime = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    trackTimeOnPage(timeSpent, pagePath);
  };

  // Track on page unload
  window.addEventListener('beforeunload', trackTime);

  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', trackTime);
  };
};

/**
 * Track clicks on specific elements (for heatmap-like analysis)
 */
export const setupClickTracking = (selector?: string) => {
  const handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const elementInfo = {
      tag: target.tagName,
      id: target.id,
      class: target.className,
      text: target.innerText?.substring(0, 50) || '',
      x: event.clientX,
      y: event.clientY,
    };

    trackEvent('element_click', elementInfo);
  };

  const element = selector ? document.querySelector(selector) : document;
  element?.addEventListener('click', handleClick as EventListener);

  // Return cleanup function
  return () => {
    element?.removeEventListener('click', handleClick as EventListener);
  };
};

/**
 * Enhanced user engagement tracking
 * Tracks various engagement signals automatically
 */
export const setupEngagementTracking = () => {
  let isEngaged = false;
  let engagementStartTime = 0;

  const markEngaged = () => {
    if (!isEngaged) {
      isEngaged = true;
      engagementStartTime = Date.now();
      trackEngagement('session_start');
    }
  };

  const trackEngagementTime = () => {
    if (isEngaged) {
      const engagementTime = Math.round((Date.now() - engagementStartTime) / 1000);
      trackEngagement('session_time', engagementTime);
    }
  };

  // Mark as engaged on various interactions
  document.addEventListener('click', markEngaged, { passive: true });
  document.addEventListener('scroll', markEngaged, { passive: true });
  document.addEventListener('keydown', markEngaged, { passive: true });

  // Track engagement time on unload
  window.addEventListener('beforeunload', trackEngagementTime);

  // Return cleanup function
  return () => {
    document.removeEventListener('click', markEngaged);
    document.removeEventListener('scroll', markEngaged);
    document.removeEventListener('keydown', markEngaged);
    window.removeEventListener('beforeunload', trackEngagementTime);
  };
};

export default {
  trackEvent,
  trackPageView,
  trackInteraction,
  trackTournamentEvent,
  trackMatchEvent,
  trackPlayerEvent,
  trackTeamEvent,
  trackSearch,
  trackFormSubmit,
  trackDownload,
  trackMediaEvent,
  trackScrollDepth,
  trackTimeOnPage,
  trackButtonClick,
  trackNavigation,
  trackError,
  trackEngagement,
  setupScrollTracking,
  setupTimeTracking,
  setupClickTracking,
  setupEngagementTracking,
};
