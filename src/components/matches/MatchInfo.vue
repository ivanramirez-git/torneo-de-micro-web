<template>
    <div v-if="match" class="flex items-center space-x-2">
        <span class="text-gray-600">{{ formatDate(match.fechaProgramacion) }}</span>
        <span class="text-gray-400">|</span>
        <span>{{ getTeamName(match.equipoLocalId) }} vs {{ getTeamName(match.equipoVisitanteId) }}</span>
    </div>
    <span v-else class="text-gray-400">Partido no encontrado</span>
</template>

<script setup lang="ts">
import type { Match, Team } from '../../interfaces';

const props = defineProps<{
    match?: Match;
    teams?: Team[];
}>();

console.log('match', props.match);
console.log('teams', props.teams);

const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString();
};

const getTeamName = (teamId: string): Promise<string> => {
    return teamId;
};

</script>