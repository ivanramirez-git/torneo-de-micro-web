<template>
    <div class="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-xl font-bold mb-4">📊 Resumen del Partido</h3>
        <div class="text-center text-2xl font-bold">
            {{ getTeamName(match?.equipoLocalId) }} {{ getTeamStats(match?.equipoLocalId)?.goles || 0 }} -
            {{ getTeamStats(match?.equipoVisitanteId)?.goles || 0 }} {{ getTeamName(match?.equipoVisitanteId) }}
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Match, Team, MatchStatistics } from '../../interfaces';

const props = defineProps<{
    match?: Match;
    teams: Team[];
    stats: MatchStatistics[];
}>();

const getTeamName = (teamId?: string): string => {
    if (!teamId) return '';
    const team = props.teams.find(t => t.id === teamId);
    return team?.nombre || '';
};

const getTeamStats = (teamId?: string): MatchStatistics | undefined => {
    if (!teamId) return undefined;
    return props.stats.find(s => s.equipoId === teamId);
};
</script>