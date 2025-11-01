<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <AppHeader />
    
    <div class="py-4 px-2 sm:py-8 sm:px-4">
      <div class="max-w-7xl mx-auto">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="text-xl text-gray-600">Cargando torneo...</div>
        </div>

        <!-- Tournament Not Found -->
        <div v-else-if="!tournament" class="flex flex-col items-center justify-center h-64">
          <div class="text-xl text-gray-600 mb-4">Torneo no encontrado</div>
          <router-link to="/" class="text-blue-600 hover:text-blue-800">Volver al inicio</router-link>
        </div>

        <!-- Tournament Content -->
        <div v-else>
          <!-- Tournament Header -->
          <div class="mb-6">
            <router-link to="/" class="text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Volver a torneos
            </router-link>
            <h1 class="text-3xl sm:text-4xl font-bold" :style="{ color: formatColor(tournament.color) }">
              {{ tournament.nombre }}
            </h1>
          </div>

          <!-- Tournament Content -->
          <div :style="{ backgroundColor: `${formatColor(tournament.color)}15` }" class="rounded-lg p-4 sm:p-6">
            
            <!-- Tournament Phases and Groups -->
            <div class="space-y-6">
              <div v-for="phase in tournamentPhases" :key="phase.id" class="p-4 sm:p-6 mb-6 bg-white rounded-lg shadow">
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
                  <div v-for="player in topScorers" :key="player.id"
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
              <MvpStatsCard :matches="tournamentMatches" :teams="teams" :players="players" />
            </div>

            <!-- Matches Section -->
            <div class="space-y-6">
              <!-- Upcoming Matches -->
              <div class="bg-white rounded-lg shadow p-4 sm:p-6">
                <h3 class="text-lg font-semibold mb-4">📅 Próximos Partidos</h3>

                <div class="space-y-4">
                  <div v-for="match in paginatedUpcomingMatches" :key="match.id"
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
                <div v-if="totalPagesUpcoming > 1" class="flex items-center justify-center gap-2 mt-6">
                  <button 
                    @click="previousPageUpcoming"
                    :disabled="currentPageUpcoming === 1"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Anterior
                  </button>
                  <span class="text-sm text-gray-600">
                    Página {{ currentPageUpcoming }} de {{ totalPagesUpcoming }}
                  </span>
                  <button 
                    @click="nextPageUpcoming"
                    :disabled="currentPageUpcoming === totalPagesUpcoming"
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
                  <div v-for="match in paginatedPreviousMatches" :key="match.id"
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
                <div v-if="totalPagesPrevious > 1" class="flex items-center justify-center gap-2 mt-6">
                  <button 
                    @click="previousPagePrevious"
                    :disabled="currentPagePrevious === 1"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Anterior
                  </button>
                  <span class="text-sm text-gray-600">
                    Página {{ currentPagePrevious }} de {{ totalPagesPrevious }}
                  </span>
                  <button 
                    @click="nextPagePrevious"
                    :disabled="currentPagePrevious === totalPagesPrevious"
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
                  <div v-for="match in paginatedMatches" :key="match.id"
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
                <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
                  <button 
                    @click="previousPage"
                    :disabled="currentPage === 1"
                    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Anterior
                  </button>
                  <span class="text-sm text-gray-600">
                    Página {{ currentPage }} de {{ totalPages }}
                  </span>
                  <button 
                    @click="nextPage"
                    :disabled="currentPage === totalPages"
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
              <LeastScoredAgainstCard :matches="tournamentMatches" :teams="tournamentTeams" />

              <!-- Team Fouls Card -->
              <TeamFoulsCard :matches="tournamentMatches" :teams="tournamentTeams" />
            </div>

            <!-- Dirty Players -->
            <div class="bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 class="text-lg font-semibold mb-4">🚫 Jugadores más Sucios</h3>
              <div class="space-y-3">
                <div v-for="player in dirtyPlayers" :key="player.id"
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
        </div>
      </div>
    </div>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import StatusBadge from '../components/matches/StatusBadge.vue';
import LeastScoredAgainstCard from '../components/matches/LeastScoredAgainstCard.vue';
import GroupStandingsTable from '../components/matches/GroupStandingsTable.vue';
import PlayoffMatchSummary from '../components/matches/PlayoffMatchSummary.vue';
import TeamFoulsCard from '../components/matches/TeamFoulsCard.vue';
import MvpStatsCard from '../components/matches/MvpStatsCard.vue';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import api from '../stores/api';
import { Match } from '../interfaces';
import { trackEvent, trackTournamentEvent } from '../utils/analytics';

const route = useRoute();

// State
const tournament = ref<any>(null);
const teams = ref([]);
const players = ref([]);
const matches = ref([]);
const phases = ref([]);
const groups = ref([]);
const teamGroups = ref([]);
const matchStats = ref([]);
const loading = ref(true);

// Pagination state
const currentPage = ref(1);
const currentPageUpcoming = ref(1);
const currentPagePrevious = ref(1);
const MATCHES_PER_PAGE = 20;
const MATCHES_PER_PAGE_SMALL = 10;

// Computed properties for tournament
const tournamentPhases = computed(() => {
  if (!tournament.value) return [];
  return phases.value.filter((phase: any) => phase.torneoId === tournament.value.id).reverse();
});

const tournamentGroups = computed(() => {
  return groups.value.filter((group: any) =>
    tournamentPhases.value.some((phase: any) => group.faseTorneoId === phase.id)
  );
});

const tournamentMatches = computed(() => {
  return matches.value.filter((match: any) =>
    tournamentGroups.value.some((group: any) => group.id === match.grupoId)
  );
});

const tournamentTeamIds = computed(() => {
  return teamGroups.value
    .filter((tg: any) => tournamentGroups.value.some((group: any) => group.id === tg.grupoId))
    .map((tg: any) => tg.equipoId);
});

const tournamentTeams = computed(() => {
  return teams.value.filter((team: any) => tournamentTeamIds.value.includes(team.id));
});

// Top Scorers
const topScorers = computed(() => {
  const matchIds = tournamentMatches.value.map((m: any) => m.id);
  const relevantStats = matchStats.value.filter((stat: any) =>
    matchIds.includes(stat.partidoId) && tournamentTeamIds.value.includes(stat.equipoId)
  );

  const playerStats: { [key: string]: { id: string; equipoId: string; goles: number } } = {};

  relevantStats.forEach((stat: any) => {
    if (!playerStats[stat.jugadorId]) {
      playerStats[stat.jugadorId] = {
        id: stat.jugadorId,
        equipoId: stat.equipoId,
        goles: 0
      };
    }
    playerStats[stat.jugadorId].goles += stat.goles || 0;
  });

  return Object.values(playerStats)
    .map(stats => ({
      ...stats,
      ...players.value.find((p: any) => p.id === stats.id)
    }))
    .filter(player => player.goles > 0)
    .sort((a, b) => b.goles - a.goles)
    .slice(0, 15);
});

// Dirty Players
const dirtyPlayers = computed(() => {
  const matchIds = tournamentMatches.value.map((m: any) => m.id);
  const relevantStats = matchStats.value.filter((stat: any) => matchIds.includes(stat.partidoId));

  const playerStats: { [key: string]: { id: string; equipoId: string; tarjetasRojas: number; tarjetasAzules: number; tarjetasAmarillas: number; faltas: number } } = {};

  relevantStats.forEach((stat: any) => {
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

    playerStats[stat.jugadorId].tarjetasRojas += stat.tarjetasRojas || 0;
    playerStats[stat.jugadorId].tarjetasAzules += stat.tarjetasAzules || 0;
    playerStats[stat.jugadorId].tarjetasAmarillas += stat.tarjetasAmarillas || 0;
    playerStats[stat.jugadorId].faltas += stat.faltas || 0;
  });

  return Object.values(playerStats)
    .map(stats => ({
      ...stats,
      ...players.value.find((player: any) => player.id === stats.id)
    }))
    .filter(player => player.tarjetasRojas > 0 || player.tarjetasAzules > 0 ||
      player.tarjetasAmarillas > 0 || player.faltas > 0)
    .sort((a, b) => (
      (b.tarjetasRojas * 10000 + b.tarjetasAzules * 1000 + b.tarjetasAmarillas * 100 + b.faltas) -
      (a.tarjetasRojas * 10000 + a.tarjetasAzules * 1000 + a.tarjetasAmarillas * 100 + a.faltas)
    ))
    .slice(0, 1000);
});

// Match lists
const upcomingMatches = computed(() => {
  return tournamentMatches.value
    .filter((match: any) => ['Upcoming', 'Ongoing', 'Scheduled'].includes(getMatchStatus(match)))
    .sort((a: any, b: any) => new Date(a.fechaProgramacion).getTime() - new Date(b.fechaProgramacion).getTime());
});

const previousMatches = computed(() => {
  return tournamentMatches.value
    .filter((match: any) => getMatchStatus(match) === 'Finished')
    .sort((a: any, b: any) => new Date(b.fechaProgramacion).getTime() - new Date(a.fechaProgramacion).getTime());
});

const allMatches = computed(() => {
  return tournamentMatches.value
    .sort((a: any, b: any) => new Date(b.fechaProgramacion).getTime() - new Date(a.fechaProgramacion).getTime());
});

// Paginated lists
const paginatedUpcomingMatches = computed(() => {
  const startIndex = (currentPageUpcoming.value - 1) * MATCHES_PER_PAGE_SMALL;
  const endIndex = startIndex + MATCHES_PER_PAGE_SMALL;
  return upcomingMatches.value.slice(startIndex, endIndex);
});

const paginatedPreviousMatches = computed(() => {
  const startIndex = (currentPagePrevious.value - 1) * MATCHES_PER_PAGE_SMALL;
  const endIndex = startIndex + MATCHES_PER_PAGE_SMALL;
  return previousMatches.value.slice(startIndex, endIndex);
});

const paginatedMatches = computed(() => {
  const startIndex = (currentPage.value - 1) * MATCHES_PER_PAGE;
  const endIndex = startIndex + MATCHES_PER_PAGE;
  return allMatches.value.slice(startIndex, endIndex);
});

// Pagination totals
const totalPagesUpcoming = computed(() => Math.ceil(upcomingMatches.value.length / MATCHES_PER_PAGE_SMALL));
const totalPagesPrevious = computed(() => Math.ceil(previousMatches.value.length / MATCHES_PER_PAGE_SMALL));
const totalPages = computed(() => Math.ceil(allMatches.value.length / MATCHES_PER_PAGE));

// Data loading
const loadData = async () => {
  try {
    loading.value = true;
    const tournamentId = route.params.id as string;

    const [
      tournamentRes,
      teamsRes,
      playersRes,
      matchesRes,
      phasesRes,
      groupsRes,
      teamGroupsRes,
      statsRes
    ] = await Promise.all([
      api.get(`/torneos/${tournamentId}`),
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

    tournament.value = tournamentRes.data;
    teams.value = teamsRes.data;
    players.value = playersRes.data;
    matches.value = matchesRes.data;
    phases.value = phasesRes.data;
    groups.value = groupsRes.data;
    teamGroups.value = teamGroupsRes.data;
    matchStats.value = statsRes.data;

    // Track tournament view
    trackTournamentEvent('view_tournament', tournament.value.nombre);
  } catch (error) {
    console.error('Error loading tournament data:', error);
    tournament.value = null;
  } finally {
    loading.value = false;
  }
};

// Helper functions
const getTeamName = (teamId: string): string => {
  const team = teams.value.find((t: any) => t.id === teamId);
  return team?.nombre || '';
};

const getTeamCrest = (teamId: string): string => {
  const team = teams.value.find((t: any) => t.id === teamId);
  return team?.escudoUrl || '';
};

const formatColor = (color: string): string => {
  if (!color) return '#000000';
  return color.startsWith('#') ? color : `#${color}`;
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

const formatTime = (time: string): string => {
  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getMatchScore = (match: any): string => {
  const localStats = match.estadisticasPartido?.filter((s: any) => s.equipoId === match.equipoLocalId);
  const visitorStats = match.estadisticasPartido?.filter((s: any) => s.equipoId === match.equipoVisitanteId);

  const localGoals = localStats?.reduce((sum: number, stat: any) => sum + (stat.goles || 0), 0) || 0;
  const visitorGoals = visitorStats?.reduce((sum: number, stat: any) => sum + (stat.goles || 0), 0) || 0;

  return `${localGoals} - ${visitorGoals}`;
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

// Pagination functions
const nextPageUpcoming = () => {
  if (currentPageUpcoming.value < totalPagesUpcoming.value) {
    currentPageUpcoming.value++;
    trackEvent('upcoming_matches_pagination', {
      tournament_id: tournament.value?.id,
      page: currentPageUpcoming.value,
      action: 'next'
    });
  }
};

const previousPageUpcoming = () => {
  if (currentPageUpcoming.value > 1) {
    currentPageUpcoming.value--;
    trackEvent('upcoming_matches_pagination', {
      tournament_id: tournament.value?.id,
      page: currentPageUpcoming.value,
      action: 'previous'
    });
  }
};

const nextPagePrevious = () => {
  if (currentPagePrevious.value < totalPagesPrevious.value) {
    currentPagePrevious.value++;
    trackEvent('previous_matches_pagination', {
      tournament_id: tournament.value?.id,
      page: currentPagePrevious.value,
      action: 'next'
    });
  }
};

const previousPagePrevious = () => {
  if (currentPagePrevious.value > 1) {
    currentPagePrevious.value--;
    trackEvent('previous_matches_pagination', {
      tournament_id: tournament.value?.id,
      page: currentPagePrevious.value,
      action: 'previous'
    });
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    trackEvent('matches_pagination', {
      tournament_id: tournament.value?.id,
      page: currentPage.value,
      action: 'next'
    });
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    trackEvent('matches_pagination', {
      tournament_id: tournament.value?.id,
      page: currentPage.value,
      action: 'previous'
    });
  }
};

const getPhaseGroups = (phaseId: string) => {
  return groups.value.filter((group: any) => group.faseTorneoId === phaseId);
};

const getGroupStats = (groupId: string) => {
  const groupTeamIds = teamGroups.value
    .filter((tg: any) => tg.grupoId === groupId)
    .map((tg: any) => tg.equipoId);

  const groupMatches = matches.value.filter(
    (m: any) => m.grupoId === groupId && (m.horaInicioPrimerTiempo || m.horaFinPartido)
  );

  const disciplinaryPointsMap: { [teamId: string]: number } = {};

  teamGroups.value.forEach((tg: any) => {
    const teamId = tg.equipoId;
    const allTeamMatches = matches.value.filter(
      (m: any) => m.horaInicioPrimerTiempo && (m.equipoLocalId === teamId || m.equipoVisitanteId === teamId)
    );

    let totalDisciplinaryPoints = 0;
    allTeamMatches.forEach((match: Match) => {
      const teamStats = match.estadisticasPartido?.filter((s: any) => s.equipoId === teamId);
      if (teamStats) {
        totalDisciplinaryPoints += teamStats.reduce(
          (sum: number, s: any) =>
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
    .map((teamId: string) => {
      const teamMatches = groupMatches.filter(
        (m: any) => m.equipoLocalId === teamId || m.equipoVisitanteId === teamId
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

      teamMatches.forEach((match: Match) => {
        const isLocal = match.equipoLocalId === teamId;
        const localGoals =
          match.estadisticasPartido
            ?.filter((s: any) => s.equipoId === match.equipoLocalId)
            .reduce((sum: number, s: any) => sum + (s.goles || 0), 0) || 0;
        const visitorGoals =
          match.estadisticasPartido
            ?.filter((s: any) => s.equipoId === match.equipoVisitanteId)
            .reduce((sum: number, s: any) => sum + (s.goles || 0), 0) || 0;

        if (isLocal) {
          stats.goalsFor += localGoals;
          stats.goalsAgainst += visitorGoals;
        } else {
          stats.goalsFor += visitorGoals;
          stats.goalsAgainst += localGoals;
        }

        if (localGoals > visitorGoals) {
          if (isLocal) {
            stats.won++;
            stats.points += 3;
          } else {
            stats.lost++;
          }
        } else if (localGoals < visitorGoals) {
          if (isLocal) {
            stats.lost++;
          } else {
            stats.won++;
            stats.points += 3;
          }
        } else {
          stats.drawn++;
          stats.points += 1;
        }
      });

      return stats;
    })
    .sort((a: any, b: any) => {
      if (b.points !== a.points) return b.points - a.points;
      if (a.puntosDisciplinarios !== b.puntosDisciplinarios) return a.puntosDisciplinarios - b.puntosDisciplinarios;
      return b.goalsFor - a.goalsFor;
    });

  return groupTeamStats;
};

const getGroupMatch = (groupId: string) => {
  return matches.value.find((m: any) => m.grupoId === groupId);
};

onMounted(() => {
  loadData();
});
</script>
