<template>
    <div class="bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-xl font-bold mb-4">🥅 Portería Menos Vencida</h3>
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
                        <span class="text-sm text-gray-500">Goles en contra</span>
                        <p class="text-xl font-bold">{{ team.goalsAgainst }}</p>
                    </div>
                    <div class="text-center">
                        <span class="text-sm text-gray-500">Partidos</span>
                        <p class="text-xl font-bold">{{ team.matchesPlayed }}</p>
                    </div>
                    <div class="text-center">
                        <span class="text-sm text-gray-500">Promedio</span>
                        <p class="text-xl font-bold">{{ (team.goalsAgainst / (team.matchesPlayed || 1)).toFixed(2) }}
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

    // Initialize team stats
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

    // Calculate stats from matches
    props.matches.forEach(match => {
        if (!match.estadisticasPartido) return;

        // Get goals for each team in the match
        const localGoals = match.estadisticasPartido
            .filter(s => s.equipoId === match.equipoVisitanteId)
            .reduce((sum, s) => sum + (s.goles || 0), 0);

        const visitorGoals = match.estadisticasPartido
            .filter(s => s.equipoId === match.equipoLocalId)
            .reduce((sum, s) => sum + (s.goles || 0), 0);

        // Update local team stats
        const localTeam = teamStats.get(match.equipoLocalId);
        if (localTeam) {
            localTeam.goalsAgainst += visitorGoals;
            localTeam.matchesPlayed++;
        }

        // Update visitor team stats
        const visitorTeam = teamStats.get(match.equipoVisitanteId);
        if (visitorTeam) {
            visitorTeam.goalsAgainst += localGoals;
            visitorTeam.matchesPlayed++;
        }
    });

    // Convert to array and sort
    return Array.from(teamStats.values())
        .sort((a, b) => {
            const avgA = a.goalsAgainst / (a.matchesPlayed || 1);
            const avgB = b.goalsAgainst / (b.matchesPlayed || 1);
            return avgA - avgB;
        });
});
</script>