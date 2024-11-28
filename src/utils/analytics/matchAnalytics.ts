import { trackEvent } from './baseAnalytics'
import { EVENT_IDS, EVENT_CATEGORIES } from './constants'

export const trackMatchEvent = {
    goal: (teamName: string, playerName: string, minute: number) => {
        trackEvent(EVENT_IDS.MATCH, EVENT_CATEGORIES.MATCH.GOAL, 1, {
            teamName,
            playerName,
            minute,
            timestamp: new Date().toISOString()
        })
    },

    foul: (teamName: string, playerName: string, minute: number) => {
        trackEvent(EVENT_IDS.MATCH, EVENT_CATEGORIES.MATCH.FOUL, 1, {
            teamName,
            playerName,
            minute,
            timestamp: new Date().toISOString()
        })
    },

    card: (teamName: string, playerName: string, cardType: string, minute: number) => {
        trackEvent(EVENT_IDS.MATCH, EVENT_CATEGORIES.MATCH.CARD, 1, {
            teamName,
            playerName,
            cardType,
            minute,
            timestamp: new Date().toISOString()
        })
    },

    matchStart: (matchId: string, homeTeam: string, awayTeam: string) => {
        trackEvent(EVENT_IDS.MATCH, EVENT_CATEGORIES.MATCH.MATCH_START, 1, {
            matchId,
            homeTeam,
            awayTeam,
            timestamp: new Date().toISOString()
        })
    },

    matchEnd: (matchId: string, homeTeam: string, awayTeam: string, score: string) => {
        trackEvent(EVENT_IDS.MATCH, EVENT_CATEGORIES.MATCH.MATCH_END, 1, {
            matchId,
            homeTeam,
            awayTeam,
            score,
            timestamp: new Date().toISOString()
        })
    },

    mvpSelection: (matchId: string, playerName: string, teamName: string) => {
        trackEvent(EVENT_IDS.MATCH, EVENT_CATEGORIES.MATCH.MVP_SELECTED, 1, {
            matchId,
            playerName,
            teamName,
            timestamp: new Date().toISOString()
        })
    }
}