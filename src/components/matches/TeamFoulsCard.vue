<template>
    <div class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-xl font-bold mb-4">🛑 Estadísticas Disciplinarias por Equipo</h3>
        <div class="space-y-4">
            <div v-for="(team, index) in sortedTeams" :key="team.id" class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <span class="text-lg font-bold text-gray-500">{{ index + 1 }}</span>
                    <img v-if="team.escudoUrl" :src="team.escudoUrl" :alt="team.nombre"
                        class="w-8 h-8 object-contain" />
                    <span :style="{ color: team.color }" class="font-semibold">{{ team.nombre }}</span>
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
                        <span class="text-sm text-gray-500">F</span>
                        <p class="text-xl font-bold">{{ team.fouls }}</p>
                    </div>
                    <div class="text-center">
                        <span class="text-sm text-gray-500">P</span>
                        <p class="text-xl font-bold">{{ team.matchesPlayed }}</p>
                    </div>
                    <div class="text-center">
                        <span class="text-sm text-gray-500">Promedio Faltas</span>
                        <p class="text-xl font-bold">{{ (team.fouls / (team.matchesPlayed || 1)).toFixed(1) }}</p>
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
}

const sortedTeams = computed(() => {
    const teamStats = new Map<string, TeamStats>();

    // Initialize team stats
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
            matchesPlayed: 0
        });
    });

    // Calculate fouls from matches
    props.matches.forEach(match => {
        // Only consider matches that have started
        if (!match.horaInicioPrimerTiempo || !match.estadisticasPartido) return;

        // Count fouls for each team
        match.estadisticasPartido.forEach(stat => {
            const teamStat = teamStats.get(stat.equipoId);
            if (teamStat) {
                teamStat.fouls += stat.faltas || 0;
            }
        });

        // Increment matches played
        const localTeam = teamStats.get(match.equipoLocalId);
        const visitorTeam = teamStats.get(match.equipoVisitanteId);
        if (localTeam) localTeam.matchesPlayed++;
        if (visitorTeam) visitorTeam.matchesPlayed++;
    });

    // Calculate cards based on fouls
    teamStats.forEach(team => {
        team.tarjetasAmarillas = Math.floor(team.fouls / 3);
        team.tarjetasAzules = Math.floor(team.fouls / 8);
        team.tarjetasRojas = Math.floor(team.fouls / 10);
    });

    // Convert to array and sort by total disciplinary points per match
    return Array.from(teamStats.values())
        .sort((a, b) => {
            const pointsA =
                (a.tarjetasRojas * 3 + a.tarjetasAzules * 2 + a.tarjetasAmarillas + a.fouls * 0.5) /
                (a.matchesPlayed || 1);
            const pointsB =
                (b.tarjetasRojas * 3 + b.tarjetasAzules * 2 + b.tarjetasAmarillas + b.fouls * 0.5) /
                (b.matchesPlayed || 1);
            return pointsB - pointsA;
        });
});
</script>