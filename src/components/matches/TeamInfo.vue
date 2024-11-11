<template>
    <div v-if="team" class="flex items-center space-x-2">
        <img v-if="team.escudoUrl" :src="team.escudoUrl" :alt="team.nombre" class="w-6 h-6 object-contain" />
        <span :style="{ color: team.color }">{{ team.nombre }}</span>
    </div>
    <span v-else class="text-gray-400">Equipo no encontrado</span>
</template>

<script setup lang="ts">
import type { Team } from '../../interfaces';

defineProps<{
    team?: Team;
}>();
</script>