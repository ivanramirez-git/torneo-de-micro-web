// Analytics Event IDs
export const EVENT_IDS = {
    MATCH: 'match-events-id', // Replace with your actual event ID
    USER: 'user-events-id',   // Replace with your actual event ID
    TEAM: 'team-events-id',   // Replace with your actual event ID
    TOURNAMENT: 'tournament-events-id', // Replace with your actual event ID
    ENGAGEMENT: 'engagement-events-id', // Replace with your actual event ID
    PERFORMANCE: 'performance-events-id' // Replace with your actual event ID
}

// Event Categories
export const EVENT_CATEGORIES = {
    MATCH: {
        GOAL: 'Goal Scored',
        FOUL: 'Foul Committed',
        CARD: 'Card Given',
        SUBSTITUTION: 'Player Substitution',
        TIME_REQUEST: 'Time Request',
        MATCH_START: 'Match Started',
        MATCH_END: 'Match Ended',
        MVP_SELECTED: 'MVP Selected'
    },
    USER: {
        LOGIN: 'User Login',
        LOGOUT: 'User Logout',
        AUTH_ERROR: 'Authentication Error'
    },
    NAVIGATION: {
        PAGE_VIEW: 'Page Viewed',
        ROUTE_CHANGE: 'Route Changed'
    }
}