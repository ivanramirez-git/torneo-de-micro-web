<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <h1 class="text-4xl font-bold text-center mb-12">Copa navideña 🎄 2024</h1>

      <!-- Tournament Sections -->
      <div v-for="tournament in tournaments" :key="tournament.id" class="mb-12 rounded-lg p-6"
        :style="{ backgroundColor: `${tournament.color}15` }">
        <h2 class="text-2xl font-bold mb-6" :style="{ color: tournament.color }">
          {{ tournament.nombre }}
        </h2>

        <!-- Matches Section -->
        <div class="bg-white rounded-lg shadow p-6 mb-8">
          <h3 class="text-lg font-semibold mb-4">📅 Partidos</h3>

          <!-- Previous Matches -->
          <div class="mb-6">
            <h4 class="text-md font-medium mb-3">Partidos Anteriores</h4>
            <div class="space-y-4">
              <div v-for="match in getPreviousMatches(tournament.id)" :key="match.id"
                class="flex items-center justify-between border-b pb-2">
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-gray-500">{{ formatDate(match.fechaProgramacion) }}</span>
                  <span class="font-medium">{{ getTeamName(match.equipoLocalId) }}</span>
                  <span class="font-bold">{{ getMatchScore(match) }}</span>
                  <span class="font-medium">{{ getTeamName(match.equipoVisitanteId) }}</span>
                </div>
                <StatusBadge :match="match" />
              </div>
            </div>
          </div>

          <!-- Upcoming Matches -->
          <div>
            <h4 class="text-md font-medium mb-3">Próximos Partidos</h4>
            <div class="space-y-4">
              <div v-for="match in getUpcomingMatches(tournament.id)" :key="match.id"
                class="flex items-center justify-between border-b pb-2">
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-gray-500">{{ formatDate(match.fechaProgramacion) }}</span>
                  <span class="font-medium">{{ getTeamName(match.equipoLocalId) }}</span>
                  <span class="text-sm">vs</span>
                  <span class="font-medium">{{ getTeamName(match.equipoVisitanteId) }}</span>
                </div>
                <span class="text-sm text-gray-500">{{ formatTime(match.horaProgramacion) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tournament Phases and Groups -->
        <div class="space-y-6">
          <div v-for="phase in getTournamentPhases(tournament.id)" :key="phase.id"
            class="bg-white rounded-lg shadow p-6 mb-8">
            <h3 class="text-lg font-semibold mb-4">{{ phase.nombre }}</h3>

            <!-- Groups in Phase -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="group in getPhaseGroups(phase.id)" :key="group.id" class="border rounded-lg p-4">
                <h4 class="font-medium mb-3">{{ group.nombre }}</h4>
                <table class="w-full">
                  <thead>
                    <tr class="text-left text-sm">
                      <th class="pb-2">Equipo</th>
                      <th class="pb-2 text-center">PJ</th>
                      <th class="pb-2 text-center">PG</th>
                      <th class="pb-2 text-center">PE</th>
                      <th class="pb-2 text-center">PP</th>
                      <th class="pb-2 text-center">GF</th>
                      <th class="pb-2 text-center">GC</th>
                      <th class="pb-2 text-center">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="stats in getGroupStats(group.id)" :key="stats.teamId" class="border-t">
                      <td class="py-2">{{ getTeamName(stats.teamId) }}</td>
                      <td class="py-2 text-center">{{ stats.played }}</td>
                      <td class="py-2 text-center">{{ stats.won }}</td>
                      <td class="py-2 text-center">{{ stats.drawn }}</td>
                      <td class="py-2 text-center">{{ stats.lost }}</td>
                      <td class="py-2 text-center">{{ stats.goalsFor }}</td>
                      <td class="py-2 text-center">{{ stats.goalsAgainst }}</td>
                      <td class="py-2 text-center font-bold">{{ stats.points }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>


        <!-- Least Scored Against -->
        <div class="mb-8">
          <LeastScoredAgainstCard :matches="getTournamentMatches(tournament.id)" :teams="teams" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">


          <!-- Top Scorers -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">⚽ Goleadores</h3>
            <div class="space-y-4">
              <div v-for="player in getTopScorers(tournament.id)" :key="player.id"
                class="flex items-center justify-between border-b pb-2">
                <div class="flex items-center">
                  <span class="font-medium">{{ player.nombre }}</span>
                  <span class="text-sm text-gray-500 ml-2">({{ getTeamName(player.equipoId) }})</span>
                </div>
                <div class="flex items-center">
                  <span class="font-bold">{{ player.goles }} goles</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Dirty Players -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold mb-4">🚫 Jugadores más Sucios</h3>
            <div class="space-y-4">
              <div v-for="player in getDirtyPlayers(tournament.id)" :key="player.id"
                class="flex items-center justify-between border-b pb-2">
                <div class="flex items-center">
                  <span class="font-medium">{{ player.nombre }}</span>
                  <span class="text-sm text-gray-500 ml-2">({{ getTeamName(player.equipoId) }})</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span v-if="player.tarjetasRojas" class="text-red-500">🟥 {{ player.tarjetasRojas }}</span>
                  <span v-if="player.tarjetasAzules" class="text-blue-500">🟦 {{ player.tarjetasAzules }}</span>
                  <span v-if="player.tarjetasAmarillas" class="text-yellow-500">🟨 {{ player.tarjetasAmarillas }}</span>
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
import api from '../stores/api';

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
      api.get('/partidos',
        {
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

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

const formatTime = (time: string): string => {
  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getMatchScore = (match: any): string => {

  console.log(match);

  const localStats = match.estadisticasPartido?.filter(s => s.equipoId === match.equipoLocalId);
  const visitorStats = match.estadisticasPartido?.filter(s => s.equipoId === match.equipoVisitanteId);

  const localGoals = localStats?.reduce((sum, stat) => sum + (stat.goles || 0), 0) || 0;
  const visitorGoals = visitorStats?.reduce((sum, stat) => sum + (stat.goles || 0), 0) || 0;

  return `${localGoals} - ${visitorGoals}`;
};

// Tournament-specific data getters
const getDirtyPlayers = (tournamentId: string) => {
  // Get all matches for this tournament
  const tournamentMatches = matches.value.filter(m => {
    const phase = phases.value.find(p => p.torneoId === tournamentId);
    const group = groups.value.find(g => g.faseTorneoId === phase?.id);
    return m.grupoId === group?.id;
  });

  // Get all stats for these matches
  const matchIds = tournamentMatches.map(m => m.id);
  const relevantStats = matchStats.value.filter(s => matchIds.includes(s.partidoId));

  // Aggregate player stats
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

  // Convert to array and add player details
  return Object.values(playerStats)
    .map(stats => ({
      ...stats,
      ...players.value.find(p => p.id === stats.id)
    }))
    .filter(player => player.tarjetasRojas > 0 || player.tarjetasAzules > 0 ||
      player.tarjetasAmarillas > 0 || player.faltas > 0)
    .sort((a, b) => (
      (b.tarjetasRojas * 3 + b.tarjetasAzules * 2 + b.tarjetasAmarillas + b.faltas * 0.5) -
      (a.tarjetasRojas * 3 + a.tarjetasAzules * 2 + a.tarjetasAmarillas + a.faltas * 0.5)
    ))
    .slice(0, 5);
};

const getTopScorers = (tournamentId: string) => {
  // Similar to getDirtyPlayers, but for goals
  const tournamentMatches = matches.value.filter(m => {
    const phase = phases.value.find(p => p.torneoId === tournamentId);
    const group = groups.value.find(g => g.faseTorneoId === phase?.id);
    return m.grupoId === group?.id;
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
    .slice(0, 5);
};

const getTournamentMatches = (tournamentId: string) => {
  return matches.value.filter(m => {
    const phase = phases.value.find(p => p.torneoId === tournamentId);
    const group = groups.value.find(g => g.faseTorneoId === phase?.id);
    return m.grupoId === group?.id;
  });
};

const getPreviousMatches = (tournamentId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return matches.value
    .filter(m => {
      const phase = phases.value.find(p => p.torneoId === tournamentId);
      const group = groups.value.find(g => g.faseTorneoId === phase?.id);
      const matchDate = new Date(m.fechaProgramacion);
      matchDate.setHours(0, 0, 0, 0);
      return m.grupoId === group?.id && matchDate < today;
    })
    .sort((a, b) => new Date(b.fechaProgramacion).getTime() - new Date(a.fechaProgramacion).getTime())
    .slice(0, 5);
};

const getUpcomingMatches = (tournamentId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);


  return matches.value
    .filter(m => {
      const phase = phases.value.find(p => p.torneoId === tournamentId);
      const group = groups.value.find(g => g.faseTorneoId === phase?.id);
      const matchDate = new Date(m.fechaProgramacion);
      matchDate.setHours(0, 0, 0, 0);
      return m.grupoId === group?.id && matchDate >= today;
    })
    .sort((a, b) => new Date(a.fechaProgramacion).getTime() - new Date(b.fechaProgramacion).getTime())
    .slice(0, 5);
};

const getTournamentPhases = (tournamentId: string) => {
  return phases.value.filter(p => p.torneoId === tournamentId);
};

const getPhaseGroups = (phaseId: string) => {
  return groups.value.filter(g => g.faseTorneoId === phaseId);
};

const getGroupStats = (groupId: string) => {
  // Get all teams in the group
  const groupTeamIds = teamGroups.value
    .filter(tg => tg.grupoId === groupId)
    .map(tg => tg.equipoId);

  // Get all matches for this group
  const groupMatches = matches.value.filter(m => m.grupoId === groupId);

  // Calculate stats for each team
  return groupTeamIds.map(teamId => {
    const teamMatches = groupMatches.filter(m =>
      m.equipoLocalId === teamId || m.equipoVisitanteId === teamId
    );

    let stats = {
      teamId,
      played: teamMatches.length,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0
    };

    teamMatches.forEach(match => {
      const isLocal = match.equipoLocalId === teamId;
      const localGoals = match.estadisticasPartido
        ?.filter(s => s.equipoId === match.equipoLocalId)
        .reduce((sum, s) => sum + (s.goles || 0), 0) || 0;
      const visitorGoals = match.estadisticasPartido
        ?.filter(s => s.equipoId === match.equipoVisitanteId)
        .reduce((sum, s) => sum + (s.goles || 0), 0) || 0;

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
  }).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const goalDiffA = a.goalsFor - a.goalsAgainst;
    const goalDiffB = b.goalsFor - b.goalsAgainst;
    if (goalDiffB !== goalDiffA) return goalDiffB - goalDiffA;
    return b.goalsFor - a.goalsFor;
  });
};

onMounted(loadData);
</script>