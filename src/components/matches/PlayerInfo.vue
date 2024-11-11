<template>
    <div v-if="player" class="flex items-center space-x-2">
        <span class="text-sm font-medium">#{{ player.numero }}</span>
        <span>{{ player.nombre }}</span>
    </div>
    <span v-else class="text-gray-400">Jugador no encontrado</span>
</template>

<script setup lang="ts">
import type { Player } from '../../interfaces';

defineProps<{
    player?: Player;
}>();
</script>