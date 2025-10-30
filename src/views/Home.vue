<template>
  <div class="min-h-screen bg-gray-100 py-4 px-2 sm:py-8 sm:px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Tournament Sections with Accordion -->
      <div class="space-y-6 sm:space-y-8">
        <Accordion :multiple="true">
          <AccordionTab v-for="tournament in tournaments" :key="tournament.id" @click="handleTournamentExpand(tournament.nombre)">
            <template #header>
              <div class="flex items-center gap-2" :style="{ color: formatColor(tournament.color) }">
                <span class="text-xl sm:text-2xl font-bold">{{ tournament.nombre }}</span>
              </div>
            </template>

            <div :style="{ backgroundColor: `${formatColor(tournament.color)}15` }">

              <!-- Tournament Phases and Groups -->
              <div class="space-y-6">
                <div v-for="phase in getTournamentPhases(tournament.id)" :key="phase.id" class=" p-4 sm:p-6 mb-6">
                  <h3 class="text-lg font-semibold mb-4">{{ phase.nombre }}</h3>

                  <!-- Groups in Phase -->
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <template v-for="group in getPhaseGroups(phase.id)" :key="group.id">
                      <GroupStandingsTable v-if="phase.permiteEmpates" :group="group"
                        :standings="getGroupStats(group.id)" :getTeamName="getTeamName" :getTeamCrest="getTeamCrest"
                        :players="players" :matchStats="matchStats" :matches="matches" :phase="phase" />
                      <PlayoffMatchSummary v-else :match="getGroupMatch(group.id)" :group="group" :phase="phase"
                        :getTeamName="getTeamName" :getTeamCrest="getTeamCrest" :players="players"
                        :matchStats="matchStats" />
                    </template>
                  </div>
                </div>
              </div>

              <!-- Statistics Cards -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-6">
                <!-- Top Scorers -->
                <div class="bg-white rounded-lg shadow p-4 sm:p-6">
                  <h3 class="text-lg font-semibold mb-4">⚽ Goleadores</h3>
                  <div class="space-y-3">
                    <div v-for="player in getTopScorers(tournament.id)" :key="player.id"
                      class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
                      <div class="flex flex-col sm:flex-row sm:items-center mb-1 sm:mb-0">
                        <span class="font-medium mr-2">{{ player.nombre }}</span>
                        <span class="text-sm text-gray-500">({{ getTeamName(player.equipoId) }})</span>
                      </div>
                      <span class="font-bold">{{ player.goles }} goles</span>
                    </div>
                  </div>
                </div>

                <!-- MVP Stats Card -->
                <MvpStatsCard :matches="getTournamentMatches(tournament.id)" :teams="teams" :players="players" />
              </div>

              <!-- Matches Section -->
              <div class="space-y-6">
                <!-- Upcoming Matches -->
                <div class="bg-white rounded-lg shadow p-4 sm:p-6">
                  <h3 class="text-lg font-semibold mb-4">📅 Próximos Partidos</h3>

                  <div class="space-y-4">
                    <div v-for="match in getPaginatedUpcomingMatches(tournament.id)" :key="match.id"
                      class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3">
                      <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-2 sm:mb-0">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 sm:mb-0">
                          <span class="text-sm text-gray-500">
                            {{ formatDate(match.fechaProgramacion) }}
                          </span>
                          <span class="text-sm text-gray-500">
                            {{ formatTime(match.horaProgramacion) }}
                          </span>
                        </div>
                        <div class="flex items-center justify-between sm:justify-start space-x-2">
                          <span class="font-medium">{{ getTeamName(match.equipoLocalId) }}</span>
                          <span v-if="match.horaFinPartido" class="font-bold">{{ getMatchScore(match) }}</span>
                          <span v-else class="text-sm">vs</span>
                          <span class="font-medium">
                            {{ getTeamName(match.equipoVisitanteId) }}
                          </span>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-500">
                          {{ match.lugar?.nombre }}
                        </span>
                        <StatusBadge :match="match" />
                      </div>
                    </div>
                  </div>

                  <!-- Pagination Controls -->
                  <div v-if="getTotalPagesUpcoming(tournament.id) > 1" class="flex items-center justify-center gap-2 mt-6">
                    <button 
                      @click="previousPageUpcoming(tournament.id)"
                      :disabled="getCurrentPageUpcoming(tournament.id) === 1"
                      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Anterior
                    </button>
                    <span class="text-sm text-gray-600">
                      Página {{ getCurrentPageUpcoming(tournament.id) }} de {{ getTotalPagesUpcoming(tournament.id) }}
                    </span>
                    <button 
                      @click="nextPageUpcoming(tournament.id)"
                      :disabled="getCurrentPageUpcoming(tournament.id) === getTotalPagesUpcoming(tournament.id)"
                      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>

                <!-- Previous Matches -->
                <div class="bg-white rounded-lg shadow p-4 sm:p-6">
                  <h3 class="text-lg font-semibold mb-4">🏁 Partidos Anteriores</h3>

                  <div class="space-y-4">
                    <div v-for="match in getPaginatedPreviousMatches(tournament.id)" :key="match.id"
                      class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3">
                      <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-2 sm:mb-0">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 sm:mb-0">
                          <span class="text-sm text-gray-500">
                            {{ formatDate(match.fechaProgramacion) }}
                          </span>
                          <span class="text-sm text-gray-500">
                            {{ formatTime(match.horaProgramacion) }}
                          </span>
                        </div>
                        <div class="flex items-center justify-between sm:justify-start space-x-2">
                          <span class="font-medium">{{ getTeamName(match.equipoLocalId) }}</span>
                          <span v-if="match.horaFinPartido" class="font-bold">{{ getMatchScore(match) }}</span>
                          <span v-else class="text-sm">vs</span>
                          <span class="font-medium">
                            {{ getTeamName(match.equipoVisitanteId) }}
                          </span>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-500">
                          {{ match.lugar?.nombre }}
                        </span>
                        <StatusBadge :match="match" />
                      </div>
                    </div>
                  </div>

                  <!-- Pagination Controls -->
                  <div v-if="getTotalPagesPrevious(tournament.id) > 1" class="flex items-center justify-center gap-2 mt-6">
                    <button 
                      @click="previousPagePrevious(tournament.id)"
                      :disabled="getCurrentPagePrevious(tournament.id) === 1"
                      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Anterior
                    </button>
                    <span class="text-sm text-gray-600">
                      Página {{ getCurrentPagePrevious(tournament.id) }} de {{ getTotalPagesPrevious(tournament.id) }}
                    </span>
                    <button 
                      @click="nextPagePrevious(tournament.id)"
                      :disabled="getCurrentPagePrevious(tournament.id) === getTotalPagesPrevious(tournament.id)"
                      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>

                <!-- All Matches -->
                <div class="bg-white rounded-lg shadow p-4 sm:p-6">
                  <h3 class="text-lg font-semibold mb-4">📅 Todos los Partidos</h3>

                  <!-- All Matches Paginated -->
                  <div class="space-y-4">
                    <div v-for="match in getPaginatedMatches(tournament.id)" :key="match.id"
                      class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3">
                      <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-2 sm:mb-0">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 sm:mb-0">
                          <span class="text-sm text-gray-500">
                            {{ formatDate(match.fechaProgramacion) }}
                          </span>
                          <span class="text-sm text-gray-500">
                            {{ formatTime(match.horaProgramacion) }}
                          </span>
                        </div>
                        <div class="flex items-center justify-between sm:justify-start space-x-2">
                          <span class="font-medium">{{ getTeamName(match.equipoLocalId) }}</span>
                          <span v-if="match.horaFinPartido" class="font-bold">{{ getMatchScore(match) }}</span>
                          <span v-else class="text-sm">vs</span>
                          <span class="font-medium">
                            {{ getTeamName(match.equipoVisitanteId) }}
                          </span>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-500">
                          {{ match.lugar?.nombre }}
                        </span>
                        <StatusBadge :match="match" />
                      </div>
                    </div>
                  </div>

                  <!-- Pagination Controls -->
                  <div v-if="getTotalPages(tournament.id) > 1" class="flex items-center justify-center gap-2 mt-6">
                    <button 
                      @click="previousPage(tournament.id)"
                      :disabled="getCurrentPage(tournament.id) === 1"
                      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Anterior
                    </button>
                    <span class="text-sm text-gray-600">
                      Página {{ getCurrentPage(tournament.id) }} de {{ getTotalPages(tournament.id) }}
                    </span>
                    <button 
                      @click="nextPage(tournament.id)"
                      :disabled="getCurrentPage(tournament.id) === getTotalPages(tournament.id)"
                      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              </div>

              <!-- Statistics Cards -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <!-- Least Scored Against -->
                <LeastScoredAgainstCard :matches="getTournamentMatches(tournament.id)"
                  :teams="getTeamsByTournament(tournament.id)" />

                <!-- Team Fouls Card -->
                <TeamFoulsCard :matches="getTournamentMatches(tournament.id)"
                  :teams="getTeamsByTournament(tournament.id)" />
              </div>

              <!-- Dirty Players -->
              <div class="bg-white rounded-lg shadow p-4 sm:p-6">
                <h3 class="text-lg font-semibold mb-4">🚫 Jugadores más Sucios</h3>
                <div class="space-y-3">
                  <div v-for="player in getDirtyPlayers(tournament.id)" :key="player.id"
                    class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
                    <div class="flex flex-col sm:flex-row sm:items-center mb-1 sm:mb-0">
                      <span class="font-medium mr-2">{{ player.nombre }}</span>
                      <span class="text-sm text-gray-500">
                        ({{ getTeamName(player.equipoId) }})
                      </span>
                    </div>
                    <div class="flex items-center space-x-2 mt-1 sm:mt-0">
                      <span v-if="player.tarjetasRojas" class="text-red-500">
                        🟥 {{ player.tarjetasRojas }}
                      </span>
                      <span v-if="player.tarjetasAzules" class="text-blue-500">
                        🟦 {{ player.tarjetasAzules }}
                      </span>
                      <span v-if="player.tarjetasAmarillas" class="text-yellow-500">
                        🟨 {{ player.tarjetasAmarillas }}
                      </span>
                      <span v-if="player.faltas" class="text-gray-500">
                        🛑 {{ player.faltas }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </AccordionTab>
        </Accordion>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import StatusBadge from '../components/matches/StatusBadge.vue';
import LeastScoredAgainstCard from '../components/matches/LeastScoredAgainstCard.vue';
import GroupStandingsTable from '../components/matches/GroupStandingsTable.vue';
import PlayoffMatchSummary from '../components/matches/PlayoffMatchSummary.vue';
import TeamFoulsCard from '../components/matches/TeamFoulsCard.vue';
import MvpStatsCard from '../components/matches/MvpStatsCard.vue';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import api from '../stores/api';
import { Match } from '../interfaces';
import { trackEvent, trackTournamentEvent } from '../utils/analytics';

// State
const tournaments = ref([]);
const teams = ref([]);
const players = ref([]);
const matches = ref([]);
const phases = ref([]);
const groups = ref([]);
const teamGroups = ref([]);
const matchStats = ref([]);

// Pagination state - Map to store current page for each tournament and section
const currentPages = ref<Record<string, number>>({});
const currentPagesUpcoming = ref<Record<string, number>>({});
const currentPagesPrevious = ref<Record<string, number>>({});
const MATCHES_PER_PAGE = 20;
const MATCHES_PER_PAGE_SMALL = 10;

// Data loading
const loadData = async () => {
  try {
    const [
      tournamentsRes,
      teamsRes,
      playersRes,
      matchesRes,
      phasesRes,
      groupsRes,
      teamGroupsRes,
      statsRes
    ] = await Promise.all([
      api.get('/torneos', {
        params: {
          filter: {
            order: 'createdAt DESC'
          }
        }
      }),
      api.get('/equipos'),
      api.get('/jugadores'),
      api.get('/partidos', {
        params: {
          filter: {
            include: [
              { relation: 'grupo' },
              { relation: 'lugar' },
              { relation: 'estadisticasPartido' },
              { relation: 'solicitudesTiempo' },
              { relation: 'penales' }
            ]
          }
        }
      }),
      api.get('/fase-torneos'),
      api.get('/grupos'),
      api.get('/equipos-grupo'),
      api.get('/estadisticas-partido')
    ]);

    tournaments.value = tournamentsRes.data;
    teams.value = teamsRes.data;
    players.value = playersRes.data;
    matches.value = matchesRes.data;
    phases.value = phasesRes.data;
    groups.value = groupsRes.data;
    teamGroups.value = teamGroupsRes.data;
    matchStats.value = statsRes.data;
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

// Helper functions
const getTeamName = (teamId: string): string => {
  const team = teams.value.find(t => t.id === teamId);
  return team?.nombre || '';
};

const getTeamCrest = (teamId: string): string => {
  const team = teams.value.find(t => t.id === teamId);
  return team?.escudoUrl || '';
};

const formatColor = (color: string): string => {
  if (!color) return '#000000';
  // Si el color no empieza con #, agregarlo
  return color.startsWith('#') ? color : `#${color}`;
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

const formatTime = (time: string): string => {
  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getMatchScore = (match: any): string => {
  const localStats = match.estadisticasPartido?.filter(s => s.equipoId === match.equipoLocalId);
  const visitorStats = match.estadisticasPartido?.filter(s => s.equipoId === match.equipoVisitanteId);

  const localGoals = localStats?.reduce((sum, stat) => sum + (stat.goles || 0), 0) || 0;
  const visitorGoals = visitorStats?.reduce((sum, stat) => sum + (stat.goles || 0), 0) || 0;

  return `${localGoals} - ${visitorGoals}`;
};

// Tournament-specific data getters
const getDirtyPlayers = (tournamentId: string) => {
  // Filtrar fases que pertenecen al torneo actual
  const tournamentPhases = phases.value.filter(phase => phase.torneoId === tournamentId);

  // Filtrar grupos que pertenecen a las fases del torneo actual
  const tournamentGroups = groups.value.filter(group =>
    tournamentPhases.some(phase => group.faseTorneoId === phase.id)
  );

  // Filtrar partidos que pertenecen a los grupos del torneo actual
  const tournamentMatches = matches.value.filter(match =>
    tournamentGroups.some(group => group.id === match.grupoId)
  );

  // Obtener IDs de los partidos del torneo actual
  const matchIds = tournamentMatches.map(match => match.id);

  // Filtrar estadísticas relevantes únicamente para los partidos del torneo actual
  const relevantStats = matchStats.value.filter(stat => matchIds.includes(stat.partidoId));

  // Calcular estadísticas de jugadores
  const playerStats: { [key: string]: { id: string; equipoId: string; tarjetasRojas: number; tarjetasAzules: number; tarjetasAmarillas: number; faltas: number } } = {};

  relevantStats.forEach(stat => {
    if (!playerStats[stat.jugadorId]) {
      playerStats[stat.jugadorId] = {
        id: stat.jugadorId,
        equipoId: stat.equipoId,
        tarjetasRojas: 0,
        tarjetasAzules: 0,
        tarjetasAmarillas: 0,
        faltas: 0
      };
    }

    // Acumular estadísticas del jugador
    playerStats[stat.jugadorId].tarjetasRojas += stat.tarjetasRojas || 0;
    playerStats[stat.jugadorId].tarjetasAzules += stat.tarjetasAzules || 0;
    playerStats[stat.jugadorId].tarjetasAmarillas += stat.tarjetasAmarillas || 0;
    playerStats[stat.jugadorId].faltas += stat.faltas || 0;
  });

  // Combinar estadísticas del jugador con datos adicionales y filtrar jugadores relevantes
  return Object.values(playerStats)
    .map(stats => ({
      ...stats,
      ...players.value.find(player => player.id === stats.id)
    }))
    .filter(player => player.tarjetasRojas > 0 || player.tarjetasAzules > 0 ||
      player.tarjetasAmarillas > 0 || player.faltas > 0)
    .sort((a, b) => (
      (b.tarjetasRojas * 10000 + b.tarjetasAzules * 1000 + b.tarjetasAmarillas * 100 + b.faltas) -
      (a.tarjetasRojas * 10000 + a.tarjetasAzules * 1000 + a.tarjetasAmarillas * 100 + a.faltas)
    ))
    .slice(0, 1000);
};


const getTopScorers = (tournamentId: string) => {
  // Fases del torneo
  const tournamentPhases = phases.value.filter(phase => phase.torneoId === tournamentId);

  // Grupos dentro de las fases del torneo
  const tournamentGroups = groups.value.filter(group =>
    tournamentPhases.some(phase => group.faseTorneoId === phase.id)
  );

  // Equipos que participan en los grupos del torneo
  const tournamentTeamIds = teamGroups.value
    .filter(tg => tournamentGroups.some(group => group.id === tg.grupoId))
    .map(tg => tg.equipoId);

  // Partidos del torneo
  const tournamentMatches = matches.value.filter(match =>
    tournamentGroups.some(group => group.id === match.grupoId)
  );

  const matchIds = tournamentMatches.map(m => m.id);

  // Filtrar estadísticas solo de jugadores de equipos del torneo
  const relevantStats = matchStats.value.filter(stat =>
    matchIds.includes(stat.partidoId) && tournamentTeamIds.includes(stat.equipoId)
  );

  const playerStats: { [key: string]: { id: string; equipoId: string; goles: number } } = {};

  // Acumular estadísticas por jugador
  relevantStats.forEach(stat => {
    if (!playerStats[stat.jugadorId]) {
      playerStats[stat.jugadorId] = {
        id: stat.jugadorId,
        equipoId: stat.equipoId,
        goles: 0
      };
    }
    playerStats[stat.jugadorId].goles += stat.goles || 0;
  });

  // Combinar información del jugador y ordenar por goles
  return Object.values(playerStats)
    .map(stats => ({
      ...stats,
      ...players.value.find(p => p.id === stats.id)
    }))
    .filter(player => player.goles > 0)
    .sort((a, b) => b.goles - a.goles)
    .slice(0, 15);
};

const getTournamentMatches = (tournamentId: string) => {
  // Filtrar las fases que pertenecen al torneo actual
  const tournamentPhases = phases.value.filter(phase => phase.torneoId === tournamentId);

  // Filtrar los grupos que pertenecen a las fases del torneo actual
  const tournamentGroups = groups.value.filter(group =>
    tournamentPhases.some(phase => group.faseTorneoId === phase.id)
  );

  // Filtrar los partidos que pertenecen a los grupos del torneo actual
  return matches.value.filter(match =>
    tournamentGroups.some(group => group.id === match.grupoId)
  );
};


const getTeamsByTournament = (tournamentId: string) => {
  const tournamentPhases = phases.value.filter(phase => phase.torneoId === tournamentId);
  const tournamentGroups = groups.value.filter(group =>
    tournamentPhases.some(phase => group.faseTorneoId === phase.id)
  );

  const tournamentTeamIds = teamGroups.value
    .filter(tg => tournamentGroups.some(group => group.id === tg.grupoId))
    .map(tg => tg.equipoId);

  return teams.value.filter(team => tournamentTeamIds.includes(team.id));
};

const getMatchStatus = (match: Match): string => {
  const now = new Date();
  const matchDateTime = new Date(match.fechaProgramacion);
  const matchTime = new Date(match.horaProgramacion);

  if (matchDateTime > now || (matchDateTime.toDateString() === now.toDateString() && matchTime > now)) {
    return 'Upcoming';
  } else if (match.horaInicioPrimerTiempo && !match.horaFinPartido) {
    return 'Ongoing';
  } else if (match.horaFinPartido) {
    return 'Finished';
  } else {
    return 'Scheduled';
  }
};

const getPreviousMatches = (tournamentId: string) => {
  // Obtener fases del torneo
  const tournamentPhases = phases.value.filter(phase => phase.torneoId === tournamentId);

  // Obtener grupos de las fases del torneo
  const tournamentGroups = groups.value.filter(group =>
    tournamentPhases.some(phase => group.faseTorneoId === phase.id)
  );

  // Filtrar partidos de los grupos del torneo que estén terminados
  return matches.value
    .filter(match =>
      tournamentGroups.some(group => group.id === match.grupoId) &&
      getMatchStatus(match) === 'Finished'
    )
    .sort((a, b) => new Date(b.fechaProgramacion).getTime() - new Date(a.fechaProgramacion).getTime());
};

const getPaginatedPreviousMatches = (tournamentId: string) => {
  const allMatches = getPreviousMatches(tournamentId);
  const currentPage = currentPagesPrevious.value[tournamentId] || 1;
  const startIndex = (currentPage - 1) * MATCHES_PER_PAGE_SMALL;
  const endIndex = startIndex + MATCHES_PER_PAGE_SMALL;
  
  return allMatches.slice(startIndex, endIndex);
};

const getTotalPagesPrevious = (tournamentId: string) => {
  const allMatches = getPreviousMatches(tournamentId);
  return Math.ceil(allMatches.length / MATCHES_PER_PAGE_SMALL);
};

const getCurrentPagePrevious = (tournamentId: string) => {
  return currentPagesPrevious.value[tournamentId] || 1;
};

const nextPagePrevious = (tournamentId: string) => {
  const totalPages = getTotalPagesPrevious(tournamentId);
  const currentPage = getCurrentPagePrevious(tournamentId);
  if (currentPage < totalPages) {
    currentPagesPrevious.value[tournamentId] = currentPage + 1;
    trackEvent('previous_matches_pagination', {
      tournament_id: tournamentId,
      page: currentPagesPrevious.value[tournamentId],
      action: 'next'
    });
  }
};

const previousPagePrevious = (tournamentId: string) => {
  const currentPage = getCurrentPagePrevious(tournamentId);
  if (currentPage > 1) {
    currentPagesPrevious.value[tournamentId] = currentPage - 1;
    trackEvent('previous_matches_pagination', {
      tournament_id: tournamentId,
      page: currentPagesPrevious.value[tournamentId],
      action: 'previous'
    });
  }
};

const getUpcomingMatches = (tournamentId: string) => {
  // Obtener fases del torneo
  const tournamentPhases = phases.value.filter(phase => phase.torneoId === tournamentId);

  // Obtener grupos de las fases del torneo
  const tournamentGroups = groups.value.filter(group =>
    tournamentPhases.some(phase => group.faseTorneoId === phase.id)
  );

  // Filtrar partidos de los grupos del torneo que estén próximos
  return matches.value
    .filter(match =>
      tournamentGroups.some(group => group.id === match.grupoId) &&
      ['Upcoming', 'Ongoing', 'Scheduled'].includes(getMatchStatus(match))
    )
    .sort((a, b) => new Date(a.fechaProgramacion).getTime() - new Date(b.fechaProgramacion).getTime());
};

const getPaginatedUpcomingMatches = (tournamentId: string) => {
  const allMatches = getUpcomingMatches(tournamentId);
  const currentPage = currentPagesUpcoming.value[tournamentId] || 1;
  const startIndex = (currentPage - 1) * MATCHES_PER_PAGE_SMALL;
  const endIndex = startIndex + MATCHES_PER_PAGE_SMALL;
  
  return allMatches.slice(startIndex, endIndex);
};

const getTotalPagesUpcoming = (tournamentId: string) => {
  const allMatches = getUpcomingMatches(tournamentId);
  return Math.ceil(allMatches.length / MATCHES_PER_PAGE_SMALL);
};

const getCurrentPageUpcoming = (tournamentId: string) => {
  return currentPagesUpcoming.value[tournamentId] || 1;
};

const nextPageUpcoming = (tournamentId: string) => {
  const totalPages = getTotalPagesUpcoming(tournamentId);
  const currentPage = getCurrentPageUpcoming(tournamentId);
  if (currentPage < totalPages) {
    currentPagesUpcoming.value[tournamentId] = currentPage + 1;
    trackEvent('upcoming_matches_pagination', {
      tournament_id: tournamentId,
      page: currentPagesUpcoming.value[tournamentId],
      action: 'next'
    });
  }
};

const previousPageUpcoming = (tournamentId: string) => {
  const currentPage = getCurrentPageUpcoming(tournamentId);
  if (currentPage > 1) {
    currentPagesUpcoming.value[tournamentId] = currentPage - 1;
    trackEvent('upcoming_matches_pagination', {
      tournament_id: tournamentId,
      page: currentPagesUpcoming.value[tournamentId],
      action: 'previous'
    });
  }
};

// Pagination functions
const getAllTournamentMatches = (tournamentId: string) => {
  const tournamentPhases = phases.value.filter(phase => phase.torneoId === tournamentId);
  const tournamentGroups = groups.value.filter(group =>
    tournamentPhases.some(phase => group.faseTorneoId === phase.id)
  );

  return matches.value
    .filter(match => tournamentGroups.some(group => group.id === match.grupoId))
    .sort((a, b) => new Date(b.fechaProgramacion).getTime() - new Date(a.fechaProgramacion).getTime());
};

const getPaginatedMatches = (tournamentId: string) => {
  const allMatches = getAllTournamentMatches(tournamentId);
  const currentPage = currentPages.value[tournamentId] || 1;
  const startIndex = (currentPage - 1) * MATCHES_PER_PAGE;
  const endIndex = startIndex + MATCHES_PER_PAGE;
  
  return allMatches.slice(startIndex, endIndex);
};

const getTotalPages = (tournamentId: string) => {
  const allMatches = getAllTournamentMatches(tournamentId);
  return Math.ceil(allMatches.length / MATCHES_PER_PAGE);
};

const getCurrentPage = (tournamentId: string) => {
  return currentPages.value[tournamentId] || 1;
};

const nextPage = (tournamentId: string) => {
  const totalPages = getTotalPages(tournamentId);
  const currentPage = getCurrentPage(tournamentId);
  if (currentPage < totalPages) {
    currentPages.value[tournamentId] = currentPage + 1;
    trackEvent('matches_pagination', {
      tournament_id: tournamentId,
      page: currentPages.value[tournamentId],
      action: 'next'
    });
  }
};

const previousPage = (tournamentId: string) => {
  const currentPage = getCurrentPage(tournamentId);
  if (currentPage > 1) {
    currentPages.value[tournamentId] = currentPage - 1;
    trackEvent('matches_pagination', {
      tournament_id: tournamentId,
      page: currentPages.value[tournamentId],
      action: 'previous'
    });
  }
};

const getTournamentPhases = (tournamentId: string) => {
  return phases.value.filter(phase => phase.torneoId === tournamentId).reverse();
};

const getPhaseGroups = (phaseId: string) => {
  return groups.value.filter(group => group.faseTorneoId === phaseId);
};

const getGroupStats = (groupId: string) => {
  const groupTeamIds = teamGroups.value
    .filter(tg => tg.grupoId === groupId)
    .map(tg => tg.equipoId);

  const groupMatches = matches.value.filter(
    m => m.grupoId === groupId && (m.horaInicioPrimerTiempo || m.horaFinPartido)
  );

  // Precalcular puntos disciplinarios para todos los equipos
  const disciplinaryPointsMap: { [teamId: string]: number } = {};

  teamGroups.value.forEach(tg => {
    const teamId = tg.equipoId;

    // Obtener todas las coincidencias del equipo en todo el torneo
    const allTeamMatches = matches.value.filter(
      m => m.horaInicioPrimerTiempo && (m.equipoLocalId === teamId || m.equipoVisitanteId === teamId)
    );

    // Calcular puntos disciplinarios totales
    let totalDisciplinaryPoints = 0;

    allTeamMatches.forEach((match: Match) => {
      const teamStats = match.estadisticasPartido?.filter(s => s.equipoId === teamId);
      if (teamStats) {
        totalDisciplinaryPoints += teamStats.reduce(
          (sum, s) =>
            sum +
            (s.faltas || 0) * 1 +
            (s.tarjetasAmarillas || 0) * 3 +
            (s.tarjetasAzules || 0) * 8 +
            (s.tarjetasRojas || 0) * 10,
          0
        );
      }
    });

    disciplinaryPointsMap[teamId] = totalDisciplinaryPoints;
  });

  const groupTeamStats = groupTeamIds
    .map(teamId => {
      const teamMatches = groupMatches.filter(
        m => m.equipoLocalId === teamId || m.equipoVisitanteId === teamId
      );

      let stats = {
        teamId,
        played: teamMatches.length,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        fouls: 0,
        puntosDisciplinarios: disciplinaryPointsMap[teamId] || 0,
        points: 0
      };

      // DEBUG: Log para cada equipo
      const teamName = getTeamName(teamId);
      console.log(`\n📊 === Calculando puntos para ${teamName} (${teamId}) ===`);
      console.log(`Partidos del grupo para este equipo: ${teamMatches.length}`);

      teamMatches.forEach((match: Match, index: number) => {
        const isLocal = match.equipoLocalId === teamId;
        const localGoals =
          match.estadisticasPartido
            ?.filter(s => s.equipoId === match.equipoLocalId)
            .reduce((sum, s) => sum + (s.goles || 0), 0) || 0;
        const visitorGoals =
          match.estadisticasPartido
            ?.filter(s => s.equipoId === match.equipoVisitanteId)
            .reduce((sum, s) => sum + (s.goles || 0), 0) || 0;

        const oppositeTeamId = isLocal ? match.equipoVisitanteId : match.equipoLocalId;
        const oppositeTeamName = getTeamName(oppositeTeamId);

        if (isLocal) {
          stats.goalsFor += localGoals;
          stats.goalsAgainst += visitorGoals;
        } else {
          stats.goalsFor += visitorGoals;
          stats.goalsAgainst += localGoals;
        }

        let pointsThisMatch = 0;
        if (localGoals > visitorGoals) {
          if (isLocal) {
            stats.won++;
            stats.points += 3;
            pointsThisMatch = 3;
          } else {
            stats.lost++;
            pointsThisMatch = 0;
          }
        } else if (localGoals < visitorGoals) {
          if (isLocal) {
            stats.lost++;
            pointsThisMatch = 0;
          } else {
            stats.won++;
            stats.points += 3;
            pointsThisMatch = 3;
          }
        } else {
          stats.drawn++;
          stats.points += 1;
          pointsThisMatch = 1;
        }

        console.log(`  Partido ${index + 1}: ${teamName} (${isLocal ? 'Local' : 'Visitante'}) ${isLocal ? localGoals + '-' + visitorGoals : visitorGoals + '-' + localGoals} vs ${oppositeTeamName} → +${pointsThisMatch} puntos`);
      });

      console.log(`📈 Total: ${stats.points} puntos, ${stats.won}V-${stats.drawn}E-${stats.lost}D, GF:${stats.goalsFor} GC:${stats.goalsAgainst}`);
      console.log(`===================================\n`);

      return stats;
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (a.puntosDisciplinarios !== b.puntosDisciplinarios) return a.puntosDisciplinarios - b.puntosDisciplinarios;
      return b.goalsFor - a.goalsFor;
    });

  return groupTeamStats;
};

const getGroupMatch = (groupId: string) => {
  return matches.value.find(m => m.grupoId === groupId);
};

// Tracking de expansión de acordeón de torneo
const handleTournamentExpand = (tournamentName: string) => {
  trackTournamentEvent('expand_tournament_accordion', tournamentName);
};

onMounted(() => {
  loadData();
  // Track home page view
  trackEvent('home_page_loaded', {
    tournaments_count: tournaments.value.length
  });
});
</script>

<style scoped>
:deep(.p-accordion-header-link) {
  background-color: white !important;
  border: none !important;
  border-radius: 0.5rem !important;
  margin-bottom: 0.5rem !important;
}

:deep(.p-accordion-content) {
  border: none !important;
  padding: 1rem !important;
}

:deep(.p-accordion-tab) {
  margin-bottom: 1rem !important;
}
</style>