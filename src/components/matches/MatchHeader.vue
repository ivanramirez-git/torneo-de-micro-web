<template>
    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl font-bold">
                {{ getTeamName(match?.equipoLocalId) }} vs {{ getTeamName(match?.equipoVisitanteId) }}
            </h1>
            <StatusBadge v-if="match" :match="match" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <p class="text-gray-600">
                    <i class="pi pi-calendar mr-2"></i>
                    {{ match ? formatDate(match.fechaProgramacion) : '' }}
                </p>
                <p class="text-gray-600">
                    <i class="pi pi-clock mr-2"></i>
                    {{ match ? formatTime(match.horaProgramacion) : '' }}
                </p>
            </div>
            <div>
                <p class="text-gray-600">
                    <i class="pi pi-map-marker mr-2"></i>
                    {{ match?.lugar?.nombre || 'Lugar por definir' }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Match, Team } from '../../interfaces';
import StatusBadge from './StatusBadge.vue';

const props = defineProps<{
    match?: Match;
    teams: Team[];
}>();

const getTeamName = (teamId?: string): string => {
    if (!teamId) return '';
    const team = props.teams.find(t => t.id === teamId);
    return team?.nombre || '';
};

const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString();
};

const formatTime = (time: string | Date): string => {
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>