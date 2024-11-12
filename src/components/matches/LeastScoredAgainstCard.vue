<template>
    <div class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-xl font-bold mb-4">🥅 Portería Menos Vencida</h3>
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
                        <span class="text-sm text-gray-500">GC</span>
                        <p class="text-xl font-bold">{{ team.goalsAgainst }}</p>
                    </div>
                    <div class="text-center">
                        <span class="text-sm text-gray-500">P</span>
                        <p class="text-xl font-bold">{{ team.matchesPlayed }}</p>
                    </div>
                    <div class="text-center">
                        <span class="text-sm text-gray-500">Promedio</span>
                        <p class="text-xl font-bold">
                            <!-- Mostrar '-' si no ha jugado partidos -->
                            <span v-if="team.matchesPlayed > 0">
                                {{ (team.goalsAgainst / team.matchesPlayed).toFixed(2) }}
                            </span>
                            <span v-else>
                                -
                            </span>
                        </p>
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
    goalsAgainst: number;
    matchesPlayed: number;
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
            goalsAgainst: 0,
            matchesPlayed: 0
        });
    });

    // Calcular estadísticas a partir de los partidos
    props.matches.forEach(match => {
        if (!match.estadisticasPartido) return;

        // Obtener estadísticas de cada equipo en el partido
        const localTeamStats = teamStats.get(match.equipoLocalId);
        const visitorTeamStats = teamStats.get(match.equipoVisitanteId);

        if (localTeamStats && visitorTeamStats) {
            // Calcular goles en contra para cada equipo
            const goalsAgainstLocal = match.estadisticasPartido
                .filter(s => s.equipoId === match.equipoVisitanteId)
                .reduce((sum, s) => sum + (s.goles || 0), 0);

            const goalsAgainstVisitor = match.estadisticasPartido
                .filter(s => s.equipoId === match.equipoLocalId)
                .reduce((sum, s) => sum + (s.goles || 0), 0);

            // Actualizar estadísticas
            localTeamStats.goalsAgainst += goalsAgainstLocal;
            localTeamStats.matchesPlayed++;

            visitorTeamStats.goalsAgainst += goalsAgainstVisitor;
            visitorTeamStats.matchesPlayed++;
        }
    });

    // Convertir a array y ordenar
    return Array.from(teamStats.values())
        .sort((a, b) => {
            // Si ambos equipos han jugado partidos, comparar por promedio
            if (a.matchesPlayed > 0 && b.matchesPlayed > 0) {
                const avgA = a.goalsAgainst / a.matchesPlayed;
                const avgB = b.goalsAgainst / b.matchesPlayed;
                return avgA - avgB;
            }
            // Si solo uno ha jugado partidos, el que ha jugado va primero
            if (a.matchesPlayed > 0) return -1;
            if (b.matchesPlayed > 0) return 1;
            // Si ninguno ha jugado partidos, mantener el orden original
            return 0;
        });
});
</script>
