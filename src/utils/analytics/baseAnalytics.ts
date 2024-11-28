import * as ackeeTracker from 'ackee-tracker'

const server = import.meta.env.VITE_ACKEE_SERVER
const domainId = import.meta.env.VITE_ACKEE_DOMAIN_ID

// Create Ackee instance with detailed tracking
const instance = ackeeTracker.create(server, {
    detailed: true,
    ignoreLocalhost: false
})

// Enhanced event tracking with additional context
export const trackEvent = (
    eventId: string,
    key: string,
    value: number = 1,
    attributes: Record<string, any> = {}
) => {
    const enhancedAttributes = {
        ...attributes,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
    }

    console.debug('Tracking event:', { eventId, key, value, attributes: enhancedAttributes })

    return instance.action(eventId, {
        key: `${key} | ${JSON.stringify(enhancedAttributes)}`,
        value
    })
}

// Page view tracking
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
        timestamp: new Date().toISOString()
    })
}