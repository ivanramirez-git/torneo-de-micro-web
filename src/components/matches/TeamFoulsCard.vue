<template>
    <div class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-xl font-bold mb-4">🛑 Estadísticas Disciplinarias por Equipo</h3>
        <div class="space-y-4">
            <div v-for="(team, index) in sortedTeams" :key="team.id"
                class="flex items-center justify-around sm:justify-between">
                <div class="flex items-center space-x-3">
                    <span class="text-lg font-bold text-gray-500">{{ index + 1 }}</span>
                    <img v-if="team.escudoUrl" :src="team.escudoUrl" :alt="team.nombre"
                        class="w-8 h-8 object-contain" />
                    <span :style="{ color: team.color }" class="font-semibold hidden sm:inline">
                        {{ team.nombre }}
                    </span>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="text-center">
                        <span class="text-sm text-gray-500">🟥</span>
                        <p class="text-xl font-bold">{{ team.tarjetasRojas }}</p>
                    </div>
                    <div class="text-center">
                        <span class="text-sm text-gray-500">🟦</span>
                        <p class="text-xl font-bold">{{ team.tarjetasAzules }}</p>
                    </div>
                    <div class="text-center">
                        <span class="text-sm text-gray-500">🟨</span>
                        <p class="text-xl font-bold">{{ team.tarjetasAmarillas }}</p>
                    </div>
                    <div class="text-center">
                        <span class="text-sm text-gray-500">🛑</span>
                        <p class="text-xl font-bold">{{ team.fouls }}</p>
                    </div>
                    <div class="text-center">
                        <span class="text-sm text-gray-500">PJ</span>
                        <p class="text-xl font-bold">{{ team.matchesPlayed }}</p>
                    </div>
                    <div class="text-center">
                        <span class="text-sm text-gray-500">Puntos Disciplinarios</span>
                        <p class="text-xl font-bold ">{{ team.puntosDisciplinarios }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Match, Team } from '../../interfaces';

const props = defineProps<{
    matches: Match[];
    teams: Team[];
}>();

interface TeamStats {
    id: string;
    nombre: string;
    color: string;
    escudoUrl?: string;
    fouls: number;
    tarjetasRojas: number;
    tarjetasAzules: number;
    tarjetasAmarillas: number;
    matchesPlayed: number;
    puntosDisciplinarios: number;
}

const sortedTeams = computed(() => {
    const teamStats = new Map<string, TeamStats>();

    // Inicializar estadísticas de equipos
    props.teams.forEach(team => {
        teamStats.set(team.id, {
            id: team.id,
            nombre: team.nombre,
            color: team.color,
            escudoUrl: team.escudoUrl,
            fouls: 0,
            tarjetasRojas: 0,
            tarjetasAzules: 0,
            tarjetasAmarillas: 0,
            matchesPlayed: 0,
            puntosDisciplinarios: 0
        });
    });

    // Calcular estadísticas de tarjetas y faltas directamente desde los partidos
    props.matches.forEach(match => {
        // Solo considerar partidos que han comenzado
        if (!match.horaInicioPrimerTiempo || !match.estadisticasPartido) return;

        // Acumular faltas y tarjetas de cada equipo en el partido
        match.estadisticasPartido.forEach(stat => {
            const teamStat = teamStats.get(stat.equipoId);
            if (teamStat) {
                teamStat.fouls += stat.faltas || 0;
                teamStat.tarjetasRojas += stat.tarjetasRojas || 0;
                teamStat.tarjetasAzules += stat.tarjetasAzules || 0;
                teamStat.tarjetasAmarillas += stat.tarjetasAmarillas || 0;

                // Calcular puntos disciplinarios
                teamStat.puntosDisciplinarios +=
                    (stat.faltas || 0) * 1 +
                    (stat.tarjetasAmarillas || 0) * 3 +
                    (stat.tarjetasAzules || 0) * 8 +
                    (stat.tarjetasRojas || 0) * 10;
            }
        });

        // Incrementar partidos jugados
        const localTeam = teamStats.get(match.equipoLocalId);
        const visitorTeam = teamStats.get(match.equipoVisitanteId);
        if (localTeam) localTeam.matchesPlayed++;
        if (visitorTeam) visitorTeam.matchesPlayed++;
    });

    // Convertir a array y ordenar por puntos disciplinarios
    return Array.from(teamStats.values())
        .sort((a, b) => b.puntosDisciplinarios - a.puntosDisciplinarios);
});
</script>
