<template>
    <div class=" bg-white border rounded-lg p-4 overflow-x-auto">
        <h4 class="font-medium mb-3">{{ groupName }}</h4>
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="text-left text-sm">
                        <th class="sticky pb-2">#</th>
                        <th class="sticky pb-2 sm:w-auto">
                            <span class="hidden sm:inline">Equipo</span>
                            <span class="sm:hidden">Equi</span>
                        </th>
                        <th class="pb-2 text-center">P</th>
                        <th class="pb-2 text-center">PJ</th>
                        <th class="pb-2 text-center">PG</th>
                        <th class="pb-2 text-center">PE</th>
                        <th class="pb-2 text-center">PP</th>
                        <th class="pb-2 text-center">GF</th>
                        <th class="pb-2 text-center">GC</th>
                        <th class="pb-2 text-center">DG</th>
                        <th class="pb-2 text-center">F</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(stats, index) in standings" :key="stats.teamId">
                        <!-- Team Row -->
                        <tr @click="togglePlayerStats(stats.teamId)" :class="getRowClass(index)" class="group">
                            <td class="sticky py-2 font-bold  text-center">
                                {{ index + 1 }}
                            </td>
                            <td class="sticky py-2 sm:w-auto">
                                <div class="flex items-center">
                                    <img v-if="getTeamCrest(stats.teamId)" :src="getTeamCrest(stats.teamId)"
                                        :alt="getTeamName(stats.teamId)" class="w-8 h-8 object-contain" />
                                    <span class="hidden sm:inline ml-2 truncate max-w-xs">
                                        {{ getTeamName(stats.teamId) }}
                                    </span>
                                </div>
                            </td>
                            <td class="py-2 text-center font-bold">{{ stats.points }}</td>
                            <td class="py-2 text-center">{{ stats.played }}</td>
                            <td class="py-2 text-center">{{ stats.won }}</td>
                            <td class="py-2 text-center">{{ stats.drawn }}</td>
                            <td class="py-2 text-center">{{ stats.lost }}</td>
                            <td class="py-2 text-center">{{ stats.goalsFor }}</td>
                            <td class="py-2 text-center">{{ stats.goalsAgainst }}</td>
                            <td class="py-2 text-center">{{ stats.goalsFor - stats.goalsAgainst }}</td>
                            <td class="py-2 text-center">{{ stats.puntosDisciplinarios }}</td>
                        </tr>


                        <!-- Player Stats Row -->
                        <transition name="fade" mode="out-in">
                            <tr v-if="expandedTeams.includes(stats.teamId)" :class="getRowClass(index)">
                                <td colspan="12" class="py-4 px-4">
                                    <div class="overflow-x-auto">
                                        <table class="w-full">
                                            <thead>
                                                <tr class="text-sm text-gray-600">
                                                    <th class="text-left py-2">Jugador</th>
                                                    <th class="text-center py-2">⚽ </th>
                                                    <th class="text-center py-2">🏆 </th>
                                                    <th class="text-center py-2">🟥 </th>
                                                    <th class="text-center py-2">🟦 </th>
                                                    <th class="text-center py-2">🟨 </th>
                                                    <th class="text-center py-2">🛑 </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="player in getTeamPlayers(stats.teamId)" :key="player.id"
                                                    class="border-t border-gray-200">
                                                    <td class="py-2">{{ player.nombre }}</td>
                                                    <td class="text-center py-2">{{ player.stats.goles }}</td>
                                                    <td class="text-center py-2">{{ player.stats.mvp }}</td>
                                                    <td class="text-center py-2">{{ player.stats.tarjetasRojas }}</td>
                                                    <td class="text-center py-2">{{ player.stats.tarjetasAzules }}</td>
                                                    <td class="text-center py-2">{{ player.stats.tarjetasAmarillas }}
                                                    </td>
                                                    <td class="text-center py-2">{{ player.stats.faltas }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        </transition>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>
<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease, height 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    height: 0;
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
    height: auto;
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Player, Match, Group, TournamentPhase } from '../../interfaces';

const props = defineProps<{
    standings: Array<any>;
    phase: TournamentPhase;
    group: Group;
    getTeamName: (teamId: string) => string;
    getTeamCrest: (teamId: string) => string;
    players?: Player[];
    matchStats?: any[];
    matches?: Match[];
}>();

const groupName = props.group.nombre;
const numberOfQualifiedTeams = props.phase.equiposClasificadosPorGrupo;
const expandedTeams = ref<string[]>([]);

// Calculate total matches per team
const totalMatchesPerTeam = computed(() => {
    return props.standings.length - 1;
});

// Calculate if a team is mathematically eliminated or qualified
const getTeamStatus = (currentTeamIndex: number) => {
    const currentTeam = props.standings[currentTeamIndex];
    const totalTeamMatches = totalMatchesPerTeam.value;

    // Calcular puntos máximos posibles para el equipo actual
    const remainingMatches = totalTeamMatches - currentTeam.played;
    const maxPossiblePoints = currentTeam.points + (remainingMatches * 3);

    // Ordenar equipos por puntos para identificar el umbral de clasificación
    const sortedTeams = [...props.standings].sort((a, b) => b.points - a.points);
    const qualificationThreshold = sortedTeams[numberOfQualifiedTeams - 1]?.points || 0;

    // Clasificado matemáticamente
    const teamsBelowThatCanCatchUp = props.standings.slice(currentTeamIndex + 1).filter(team => {
        const teamRemainingMatches = totalTeamMatches - team.played;
        const teamMaxPoints = team.points + (teamRemainingMatches * 3);
        return teamMaxPoints >= currentTeam.points;
    }).length;

    if (teamsBelowThatCanCatchUp < numberOfQualifiedTeams - currentTeamIndex) {
        return 'qualified'; // Clasificado matemáticamente
    }

    // Eliminado matemáticamente
    const teamsBetterThanMaxPoints = props.standings.filter(team => team.points > maxPossiblePoints).length;
    if (teamsBetterThanMaxPoints >= numberOfQualifiedTeams) {
        return 'eliminated'; // Eliminado matemáticamente
    }

    // Si no está clasificado ni eliminado
    return 'competing';
};



// Update the row class function
const getRowClass = (index: number) => {
    const status = getTeamStatus(index);
    const baseClasses = 'border-t hover:bg-gray-50 cursor-pointer';

    switch (status) {
        case 'eliminated':
            return `${baseClasses} bg-red-50`; // Fila roja
        case 'qualified':
            return `${baseClasses} bg-green-50`; // Fila verde
        case 'competing':
        default:
            return baseClasses; // Sin color adicional
    }
};


// Rest of your existing functions...
const togglePlayerStats = (teamId: string) => {
    const index = expandedTeams.value.indexOf(teamId);
    if (index === -1) {
        expandedTeams.value.push(teamId);
    } else {
        expandedTeams.value.splice(index, 1);
    }
};

const getPlayerMvpCount = (playerId: string, teamId: string): number => {
    if (!props.matches || props.matches.length === 0) return 0;

    return props.matches.reduce((count, match) => {
        const isMvpLocal = match.mvpEquipoLocalId === playerId && match.equipoLocalId === teamId;
        const isMvpVisitor = match.mvpEquipoVisitanteId === playerId && match.equipoVisitanteId === teamId;
        return count + (isMvpLocal || isMvpVisitor ? 1 : 0);
    }, 0);
};

const getTeamPlayers = (teamId: string) => {
    if (!props.players) return [];

    const teamPlayers = props.players.filter(player => player.equipoId === teamId);

    return teamPlayers.map(player => {
        const playerStats = props.matchStats?.filter(stat => stat.jugadorId === player.id) || [];
        const stats = playerStats.reduce(
            (acc, curr) => ({
                goles: acc.goles + (curr.goles || 0),
                faltas: acc.faltas + (curr.faltas || 0),
                tarjetasAmarillas: acc.tarjetasAmarillas + (curr.tarjetasAmarillas || 0),
                tarjetasAzules: acc.tarjetasAzules + (curr.tarjetasAzules || 0),
                tarjetasRojas: acc.tarjetasRojas + (curr.tarjetasRojas || 0),
            }),
            {
                goles: 0,
                faltas: 0,
                tarjetasAmarillas: 0,
                tarjetasAzules: 0,
                tarjetasRojas: 0,
            }
        );

        return {
            ...player,
            stats: {
                ...stats,
                mvp: getPlayerMvpCount(player.id, teamId),
            },
        };
    }).sort((a, b) => {
        if (b.stats.goles !== a.stats.goles) {
            return b.stats.goles - a.stats.goles;
        }
        return b.stats.mvp - a.stats.mvp;
    });
};
</script>