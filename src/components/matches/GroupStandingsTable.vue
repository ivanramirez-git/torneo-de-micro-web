<template>
    <div class="border rounded-lg p-4 overflow-x-auto">
        <h4 class="font-medium mb-3">{{ groupName }}</h4>
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="text-left text-sm">
                        <th class="sticky left-0 bg-white pb-2 pl-4 sm:pl-0 w-12">Pos</th>
                        <th class="pb-2 text-center">Detalles</th>
                        <th class="sticky left-12 bg-white pb-2 w-12 sm:w-auto">Equipo</th>
                        <th class="pb-2 text-center">Pts</th>
                        <th class="pb-2 text-center">PJ</th>
                        <th class="pb-2 text-center">PG</th>
                        <th class="pb-2 text-center">PE</th>
                        <th class="pb-2 text-center">PP</th>
                        <th class="pb-2 text-center">GF</th>
                        <th class="pb-2 text-center">GC</th>
                        <th class="pb-2 text-center">DG</th>
                        <th class="pb-2 text-center">Faltas</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(stats, index) in standings" :key="stats.teamId">
                        <!-- Team Row -->
                        <tr class="border-t hover:bg-gray-50">
                            <td
                                class="sticky left-0 bg-white py-2 pl-4 sm:pl-0 font-bold text-gray-500 w-12 text-center">
                                {{ index + 1 }}
                            </td>
                            <td class="py-2 text-center">
                                <button @click="togglePlayerStats(stats.teamId)"
                                    class="p-2 rounded-full hover:bg-gray-200 transition-colors">
                                    <i class="pi"
                                        :class="[expandedTeams.includes(stats.teamId) ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
                                </button>
                            </td>
                            <td class="sticky left-12 bg-white py-2 w-12 sm:w-auto">
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
                        <tr v-if="expandedTeams.includes(stats.teamId)" class="bg-gray-50">
                            <td colspan="12" class="py-4 px-4">
                                <div class="overflow-x-auto">
                                    <table class="w-full">
                                        <thead>
                                            <tr class="text-sm text-gray-600">
                                                <th class="text-left py-2">#</th>
                                                <th class="text-left py-2">Jugador</th>
                                                <th class="text-center py-2">⚽ Goles</th>
                                                <th class="text-center py-2">🛑 Faltas</th>
                                                <th class="text-center py-2">🟨 Amarillas</th>
                                                <th class="text-center py-2">🟦 Azules</th>
                                                <th class="text-center py-2">🟥 Rojas</th>
                                                <th class="text-center py-2">🏆 MVP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="player in getTeamPlayers(stats.teamId)" :key="player.id"
                                                class="border-t border-gray-200">
                                                <td class="py-2">{{ player.numero }}</td>
                                                <td class="py-2">{{ player.nombre }}</td>
                                                <td class="text-center py-2">{{ player.stats.goles }}</td>
                                                <td class="text-center py-2">{{ player.stats.faltas }}</td>
                                                <td class="text-center py-2">{{ player.stats.tarjetasAmarillas }}</td>
                                                <td class="text-center py-2">{{ player.stats.tarjetasAzules }}</td>
                                                <td class="text-center py-2">{{ player.stats.tarjetasRojas }}</td>
                                                <td class="text-center py-2">{{ player.stats.mvp }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import type { Player, Match } from '../../interfaces';

const props = defineProps<{
    standings: Array<any>;
    groupName: string;
    getTeamName: (teamId: string) => string;
    getTeamCrest: (teamId: string) => string;
    players?: Player[];
    matchStats?: any[];
    matches?: Match[];
}>();

const expandedTeams = ref<string[]>([]);

// Función para expandir/colapsar filas de detalles
const togglePlayerStats = (teamId: string) => {
    const index = expandedTeams.value.indexOf(teamId);
    if (index === -1) {
        expandedTeams.value.push(teamId);
    } else {
        expandedTeams.value.splice(index, 1);
    }
};

// Contar MVPs de un jugador en un equipo
const getPlayerMvpCount = (playerId: string, teamId: string): number => {
    if (!props.matches) return 0;

    return props.matches.filter(match => {
        const isMvpLocal = match.mvpEquipoLocalId === playerId && match.equipoLocalId === teamId;
        const isMvpVisitor = match.mvpEquipoVisitanteId === playerId && match.equipoVisitanteId === teamId;
        return isMvpLocal || isMvpVisitor;
    }).length;
};

// Obtener jugadores del equipo con estadísticas
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

        // Agregar conteo de MVP
        const mvpCount = getPlayerMvpCount(player.id, teamId);

        return {
            ...player,
            stats: {
                ...stats,
                mvp: mvpCount,
            },
        };
    }).sort((a, b) => {
        // Ordenar por goles y luego por MVPs
        if (b.stats.goles !== a.stats.goles) {
            return b.stats.goles - a.stats.goles;
        }
        return b.stats.mvp - a.stats.mvp;
    });
};
</script>
