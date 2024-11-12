<template>
    <div class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-xl font-bold mb-4">🏆 MVPs del Torneo</h3>
        <div class="space-y-4">
            <div v-for="(player, index) in sortedPlayers" :key="player.id" class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <span class="text-lg font-bold text-gray-500">{{ index + 1 }}</span>
                    <div class="flex flex-col">
                        <span class="font-semibold">{{ player.nombre }}</span>
                        <span class="text-sm text-gray-500">{{ getTeamName(player.equipoId) }}</span>
                    </div>
                </div>
                <div class="text-center">
                    <span class="text-sm text-gray-500">MVPs</span>
                    <p class="text-xl font-bold">{{ player.mvpCount }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Match, Team, Player } from '../../interfaces';

const props = defineProps<{
    matches: Match[];
    teams: Team[];
    players: Player[];
}>();

interface PlayerMvpStats {
    id: string;
    nombre: string;
    equipoId: string;
    mvpCount: number;
}

const getTeamName = (teamId: string): string => {
    const team = props.teams.find(t => t.id === teamId);
    return team?.nombre || '';
};

const sortedPlayers = computed(() => {
    const playerStats = new Map<string, PlayerMvpStats>();

    // Initialize player stats
    props.players.forEach(player => {
        playerStats.set(player.id, {
            id: player.id,
            nombre: player.nombre,
            equipoId: player.equipoId,
            mvpCount: 0
        });
    });

    // Count MVPs from matches
    props.matches.forEach(match => {
        if (match.mvpEquipoLocalId) {
            const player = playerStats.get(match.mvpEquipoLocalId);
            if (player) player.mvpCount++;
        }
        if (match.mvpEquipoVisitanteId) {
            const player = playerStats.get(match.mvpEquipoVisitanteId);
            if (player) player.mvpCount++;
        }
    });

    // Convert to array and sort by MVP count
    return Array.from(playerStats.values())
        .filter(player => player.mvpCount > 0)
        .sort((a, b) => b.mvpCount - a.mvpCount)
        .slice(0, 5);
});
</script>