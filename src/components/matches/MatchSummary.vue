<template>
    <div class="mt-8 bg-white rounded-lg shadow-lg p-6 mb-6">
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
}>();

const getTeamName = (teamId?: string): string => {
    if (!teamId) return '';
    const team = props.teams.find(t => t.id === teamId);
    return team?.nombre || '';
};


const getTeamStats = (teamId?: string): MatchStatistics | undefined => {
    if (!teamId) return undefined;
    let todasEstadisticas: MatchStatistics[] = props.match?.estadisticasPartido;

    // Sumar todas las estadísticas de un equipo
    let stats = todasEstadisticas?.filter(s => s.equipoId === teamId);
    let totalStats = stats?.reduce((acc, stat) => {
        return {
            goles: acc.goles + stat.goles,
            faltas: acc.faltas + stat.faltas,
            tarjetasAzules: acc.tarjetasAzules + stat.tarjetasAzules,
            tarjetasAmarillas: acc.tarjetasAmarillas + stat.tarjetasAmarillas,
            tarjetasRojas: acc.tarjetasRojas + stat.tarjetasRojas
        };
    }, { goles: 0, faltas: 0, tarjetasAzules: 0, tarjetasAmarillas: 0, tarjetasRojas: 0 });

    return totalStats;
};
</script>