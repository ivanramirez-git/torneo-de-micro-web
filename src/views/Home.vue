<template>
  <div class="min-h-screen bg-gray-100 py-4 px-2 sm:py-8 sm:px-4">
    <div class="max-w-7xl mx-auto">

      <!-- Tournament Sections -->
      <div class="space-y-6 sm:space-y-12">
        <div v-for="tournament in tournaments" :key="tournament.id" class="rounded-lg p-4 sm:p-6"
          :style="{ backgroundColor: `${tournament.color}15` }">

          <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" :style="{ color: tournament.color }">
            {{ tournament.nombre }}
          </h2>
          <!-- Tournament Phases and Groups -->
          <div class="space-y-6">
            <div v-for="phase in getTournamentPhases(tournament.id)" :key="phase.id"
              class="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
              <h3 class="text-lg font-semibold mb-4">{{ phase.nombre }}</h3>

              <!-- Groups in Phase -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GroupStandingsTable v-for="group in getPhaseGroups(phase.id)" :key="group.id" :groupName="group.nombre"
                  :standings="getGroupStats(group.id)" :getTeamName="getTeamName" :getTeamCrest="getTeamCrest" />
              </div>
            </div>
          </div>

          <!-- Statistics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

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
          <div class="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4">📅 Partidos</h3>

            <!-- Upcoming Matches -->

            <div class="mb-6">
              <h4 class="text-md font-medium mb-3">Próximos Partidos</h4>
              <div class="space-y-4">
                <div v-for="match in getUpcomingMatches(tournament.id)" :key="match.id"
                  class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-2 sm:mb-0">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 sm:mb-0">
                      <span class="text-sm text-gray-500">{{ formatDate(match.fechaProgramacion) }}</span>
                      <span class="text-sm text-gray-500">{{ formatTime(match.horaProgramacion) }}</span>
                    </div>
                    <div class="flex items-center justify-between sm:justify-start space-x-2">
                      <span class="font-medium">{{ getTeamName(match.equipoLocalId) }}</span>
                      <span class="text-sm">vs</span>
                      <span class="font-medium">{{ getTeamName(match.equipoVisitanteId) }}</span>
                    </div>
                  </div>
                  <span class="text-sm text-gray-500 mt-1 sm:mt-0">{{ match.lugar?.nombre }}</span>
                </div>
              </div>
            </div>

            <!-- Previous Matches -->
            <div class="mb-6">
              <h4 class="text-md font-medium mb-3">Partidos Anteriores</h4>
              <div class="space-y-4">
                <div v-for="match in getPreviousMatches(tournament.id)" :key="match.id"
                  class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-2 sm:mb-0">
                    <span class="text-sm text-gray-500 mb-1 sm:mb-0">{{ formatDate(match.fechaProgramacion) }}</span>
                    <div class="flex items-center justify-between sm:justify-start space-x-2">
                      <span class="font-medium">{{ getTeamName(match.equipoLocalId) }}</span>
                      <span class="font-bold">{{ getMatchScore(match) }}</span>
                      <span class="font-medium">{{ getTeamName(match.equipoVisitanteId) }}</span>
                    </div>
                  </div>
                  <StatusBadge :match="match" />
                </div>
              </div>
            </div>
          </div>

          <!-- Statistics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">



            <!-- Least Scored Against -->
            <LeastScoredAgainstCard :matches="getTournamentMatches(tournament.id)" :teams="teams" />

            <!-- Team Fouls Card -->
            <TeamFoulsCard :matches="getTournamentMatches(tournament.id)" :teams="teams" />
          </div>

          <!-- Dirty Players -->
          <div class="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 class="text-lg font-semibold mb-4">🚫 Jugadores más Sucios</h3>
            <div class="space-y-3">
              <div v-for="player in getDirtyPlayers(tournament.id)" :key="player.id"
                class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
                <div class="flex flex-col sm:flex-row sm:items-center mb-1 sm:mb-0">
                  <span class="font-medium mr-2">{{ player.nombre }}</span>
                  <span class="text-sm text-gray-500">({{ getTeamName(player.equipoId) }})</span>
                </div>
                <div class="flex items-center space-x-2 mt-1 sm:mt-0">
                  <span v-if="player.tarjetasRojas" class="text-red-500">🟥 {{ player.tarjetasRojas }}</span>
                  <span v-if="player.tarjetasAzules" class="text-blue-500">🟦 {{ player.tarjetasAzules }}</span>
                  <span v-if="player.tarjetasAmarillas" class="text-yellow-500">🟨 {{ player.tarjetasAmarillas
                    }}</span>
                  <span v-if="player.faltas" class="text-gray-500">🛑 {{ player.faltas }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import StatusBadge from '../components/matches/StatusBadge.vue';
import LeastScoredAgainstCard from '../components/matches/LeastScoredAgainstCard.vue';
import GroupStandingsTable from '../components/matches/GroupStandingsTable.vue';
import TeamFoulsCard from '../components/matches/TeamFoulsCard.vue';
import MvpStatsCard from '../components/matches/MvpStatsCard.vue';
import api from '../stores/api';
import { Match } from '../interfaces';

// State
const tournaments = ref([]);
const teams = ref([]);
const players = ref([]);
const matches = ref([]);
const phases = ref([]);
const groups = ref([]);
const teamGroups = ref([]);
const matchStats = ref([]);

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
      api.get('/torneos'),
      api.get('/equipos'),
      api.get('/jugadores'),
      api.get('/partidos', {
        params: {
          filter: {
            include: [
              'grupo',
              'lugar',
              'estadisticasPartido',
              'solicitudesTiempo',
              'penales'
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
  const tournamentMatches = matches.value;

  const matchIds = tournamentMatches.map(m => m.id);
  const relevantStats = matchStats.value.filter(s => matchIds.includes(s.partidoId));

  const playerStats = {};
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
    playerStats[stat.jugadorId].tarjetasRojas += stat.tarjetasRojas || 0;
    playerStats[stat.jugadorId].tarjetasAzules += stat.tarjetasAzules || 0;
    playerStats[stat.jugadorId].tarjetasAmarillas += stat.tarjetasAmarillas || 0;
    playerStats[stat.jugadorId].faltas += stat.faltas || 0;
  });

  return Object.values(playerStats)
    .map(stats => ({
      ...stats,
      ...players.value.find(p => p.id === stats.id)
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
  const tournamentMatches = matches.value.filter(m => {
    const phase = phases.value.find(p => p.torneoId === tournamentId);
    const group = groups.value.find(g => g.faseTorneoId === phase?.id);
    return true;
  });

  const matchIds = tournamentMatches.map(m => m.id);
  const relevantStats = matchStats.value.filter(s => matchIds.includes(s.partidoId));

  const playerStats = {};
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
  return matches.value.filter(m => {
    const phase = phases.value.find(p => p.torneoId === tournamentId);
    const group = groups.value.find(g => g.faseTorneoId === phase?.id);
    return true;
  });
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

  return matches.value
    .filter(m => {
      const phase = phases.value.find(p => p.torneoId === tournamentId);
      return getMatchStatus(m) === 'Finished';
    })
    .sort((a, b) => new Date(b.fechaProgramacion).getTime() - new Date(a.fechaProgramacion).getTime())
    .slice(0, 15);
};

const getUpcomingMatches = (tournamentId: string) => {

  return matches.value
    .filter(m => {
      const phase = phases.value.find(p => p.torneoId === tournamentId);
      return (getMatchStatus(m) === 'Upcoming' || getMatchStatus(m) === 'Ongoing' || getMatchStatus(m) === 'Scheduled');
    })
    .sort((a, b) => new Date(a.fechaProgramacion).getTime() - new Date(b.fechaProgramacion).getTime())
    .slice(0, 15);
};


const getTournamentPhases = (tournamentId: string) => {
  return phases.value.filter(p => p.torneoId === tournamentId);
};

const getPhaseGroups = (phaseId: string) => {
  return groups.value.filter(g => g.faseTorneoId === phaseId);
};

const getGroupStats = (groupId: string) => {
  const groupTeamIds = teamGroups.value
    .filter(tg => tg.grupoId === groupId)
    .map(tg => tg.equipoId);

  const groupMatches = matches.value.filter(
    m => m.grupoId === groupId && m.horaInicioPrimerTiempo
  );

  return groupTeamIds
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
        puntosDisciplinarios: 0,
        points: 0
      };

      teamMatches.forEach((match: Match) => {
        const isLocal = match.equipoLocalId === teamId;
        const localGoals =
          match.estadisticasPartido
            ?.filter(s => s.equipoId === match.equipoLocalId)
            .reduce((sum, s) => sum + (s.goles || 0), 0) || 0;
        const visitorGoals =
          match.estadisticasPartido
            ?.filter(s => s.equipoId === match.equipoVisitanteId)
            .reduce((sum, s) => sum + (s.goles || 0), 0) || 0;

        // Calcular puntos disciplinarios
        const teamStats = match.estadisticasPartido?.filter(s => s.equipoId === teamId);
        stats.puntosDisciplinarios += teamStats?.reduce(
          (sum, s) =>
            sum +
            (s.faltas || 0) * 1 +
            (s.tarjetasAmarillas || 0) * 3 +
            (s.tarjetasAzules || 0) * 8 +
            (s.tarjetasRojas || 0) * 10,
          0
        );

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
    .sort((a, b) => {
      // Criterios de clasificación
      if (b.points !== a.points) return b.points - a.points;
      if (a.puntosDisciplinarios !== b.puntosDisciplinarios) return a.puntosDisciplinarios - b.puntosDisciplinarios;
      return b.goalsFor - a.goalsFor; // Más goles es mejor
    });
};

onMounted(loadData);
</script>