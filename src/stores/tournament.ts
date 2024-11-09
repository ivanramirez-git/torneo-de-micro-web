import { defineStore } from 'pinia'
import { tournamentService } from '../services/api'

export const useTournamentStore = defineStore('tournament', {
  state: () => ({
    tournaments: [],
    teams: [],
    players: [],
    schedule: [],
    groups: [],
    matches: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchTournaments() {
      try {
        this.loading = true
        const response = await tournamentService.getTournaments()
        this.tournaments = response.data
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },

    async fetchTeams() {
      try {
        this.loading = true
        const response = await tournamentService.getTeams()
        this.teams = response.data
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },

    async fetchPlayers() {
      try {
        this.loading = true
        const response = await tournamentService.getPlayers()
        this.players = response.data
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    }
  }
})