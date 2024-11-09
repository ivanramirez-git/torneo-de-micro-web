import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api-micro.freeloz.com'
})

export const tournamentService = {
  // Tournament endpoints
  getTournaments: () => api.get('/fases-torneos'),
  createTournament: (data: any) => api.post('/fases-torneos', data),
  updateTournament: (id: string, data: any) => api.patch(`/fases-torneos/${id}`, data),
  deleteTournament: (id: string) => api.delete(`/fases-torneos/${id}`),

  // Teams endpoints
  getTeams: () => api.get('/equipos'),
  createTeam: (data: any) => api.post('/equipos', data),
  updateTeam: (id: string, data: any) => api.patch(`/equipos/${id}`, data),
  deleteTeam: (id: string) => api.delete(`/equipos/${id}`),

  // Players endpoints
  getPlayers: () => api.get('/jugadores'),
  createPlayer: (data: any) => api.post('/jugadores', data),
  updatePlayer: (id: string, data: any) => api.patch(`/jugadores/${id}`, data),
  deletePlayer: (id: string) => api.delete(`/jugadores/${id}`),

  // Schedule endpoints
  getSchedule: () => api.get('/cronogramas'),
  createSchedule: (data: any) => api.post('/cronogramas', data),
  updateSchedule: (id: string, data: any) => api.patch(`/cronogramas/${id}`, data),
  deleteSchedule: (id: string) => api.delete(`/cronogramas/${id}`),

  // Groups endpoints
  getGroups: () => api.get('/grupos'),
  createGroup: (data: any) => api.post('/grupos', data),
  updateGroup: (id: string, data: any) => api.patch(`/grupos/${id}`, data),
  deleteGroup: (id: string) => api.delete(`/grupos/${id}`),

  // Matches endpoints
  getMatches: () => api.get('/partidos'),
  createMatch: (data: any) => api.post('/partidos', data),
  updateMatch: (id: string, data: any) => api.patch(`/partidos/${id}`, data),
  deleteMatch: (id: string) => api.delete(`/partidos/${id}`)
}

export default api