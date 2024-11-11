<template>
    <div v-if="match" class="flex items-center space-x-2">
        <span class="text-gray-600">{{ formatDate(match.fechaProgramacion) }}</span>
        <span class="text-gray-400">|</span>
        <span>{{ getTeamName(match.equipoLocalId) }} vs {{ getTeamName(match.equipoVisitanteId) }}</span>
    </div>
    <span v-else class="text-gray-400">Partido no encontrado</span>
</template>

<script setup lang="ts">
import type { Match } from '../../interfaces';

const props = defineProps<{
    match?: Match;
}>();

const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString();
};

const getTeamName = (teamId: string): string => {
    // This should be improved by passing teams as props
    // For now, just show the ID
    return teamId;
};
</script>