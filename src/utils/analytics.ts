import * as ackeeTracker from 'ackee-tracker'

const server = import.meta.env.VITE_ACKEE_SERVER
const domainId = import.meta.env.VITE_ACKEE_DOMAIN_ID

// Create Ackee instance with detailed tracking
const instance = ackeeTracker.create(server, {
    detailed: true,
    ignoreLocalhost: false
})

// Track page views
export const trackPageView = () => {
    const attributes = ackeeTracker.attributes(true)

    return instance.record(domainId, {
        ...attributes,
        siteLocation: window.location.href,
        siteReferrer: document.referrer,
        siteLanguage: navigator.language,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        deviceMemory: (navigator as any).deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        platform: navigator.platform,
        vendor: navigator.vendor,
        userAgent: navigator.userAgent,
        doNotTrack: navigator.doNotTrack,
        timestamp: new Date().toISOString()
    })
}

// Track custom events
export const trackEvent = (eventId: string, key: string, value: number = 1) => {
    return instance.action(eventId, { key, value })
}

// Track user engagement
export const trackEngagement = (eventId: string) => {
    // Time on page
    let timeOnPage = 0
    const interval = setInterval(() => {
        timeOnPage += 5
        trackEvent(eventId, 'Time on Page (seconds)', timeOnPage)
    }, 5000)

    // Scroll depth
    let maxScroll = 0
    document.addEventListener('scroll', () => {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        )
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent
            trackEvent(eventId, 'Max Scroll Depth (%)', scrollPercent)
        }
    })

    // Click tracking
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        if (target.tagName === 'BUTTON' || target.tagName === 'A') {
            trackEvent(eventId, `Click: ${target.textContent?.trim() || target.tagName}`)
        }
    })

    return () => {
        clearInterval(interval)
    }
}

// Track performance metrics
export const trackPerformance = (eventId: string) => {
    if (window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType('paint')

        const metrics = {
            'Page Load Time': navigation.loadEventEnd - navigation.startTime,
            'DOM Content Loaded': navigation.domContentLoadedEventEnd - navigation.startTime,
            'First Paint': paint.find(p => p.name === 'first-paint')?.startTime || 0,
            'First Contentful Paint': paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
        }

        Object.entries(metrics).forEach(([key, value]) => {
            trackEvent(eventId, key, value)
        })
    }
}