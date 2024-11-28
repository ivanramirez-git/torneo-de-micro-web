import { trackEvent } from './baseAnalytics'
import { EVENT_IDS, EVENT_CATEGORIES } from './constants'

export const trackUserEvent = {
    login: (success: boolean, errorMessage?: string) => {
        if (success) {
            trackEvent(EVENT_IDS.USER, EVENT_CATEGORIES.USER.LOGIN, 1, {
                timestamp: new Date().toISOString()
            })
        } else {
            trackEvent(EVENT_IDS.USER, EVENT_CATEGORIES.USER.AUTH_ERROR, 1, {
                errorMessage,
                timestamp: new Date().toISOString()
            })
        }
    },

    logout: () => {
        trackEvent(EVENT_IDS.USER, EVENT_CATEGORIES.USER.LOGOUT, 1, {
            timestamp: new Date().toISOString()
        })
    }
}