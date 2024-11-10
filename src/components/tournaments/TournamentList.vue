<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div v-for="tournament in tournaments" :key="tournament.id" 
         class="border rounded-lg p-4 hover:shadow-lg transition-shadow"
         :class="{ 'border-blue-500': selectedTournamentId === tournament.id }">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-semibold" :style="{ color: tournament.color }">
            {{ tournament.nombre }}
          </h3>
          <p class="text-sm text-gray-500">
            Creado: {{ new Date(tournament.createdAt).toLocaleDateString() }}
          </p>
        </div>
        <div class="flex space-x-2">
          <button @click="$emit('edit', tournament)" class="text-blue-600 hover:text-blue-800">
            Editar
          </button>
          <button @click="$emit('delete', tournament.id)" class="text-red-600 hover:text-red-800">
            Eliminar
          </button>
        </div>
      </div>
      <div class="mt-4">
        <button @click="$emit('select', tournament)" 
                class="text-sm text-blue-600 hover:text-blue-800">
          Gestionar Fases
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Torneo } from '../../interfaces';

defineProps<{
  tournaments: Torneo[];
  selectedTournamentId?: string;
}>();

defineEmits<{
  (e: 'edit', tournament: Torneo): void;
  (e: 'delete', id: string): void;
  (e: 'select', tournament: Torneo): void;
}>();
</script>