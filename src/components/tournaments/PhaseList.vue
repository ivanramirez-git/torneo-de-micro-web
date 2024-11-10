<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div v-for="phase in phases" :key="phase.id" class="border rounded-lg p-4">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-lg font-semibold">{{ phase.nombre }}</h3>
          <p class="text-sm text-gray-600">
            Equipos clasificados por grupo: {{ phase.equiposClasificadosPorGrupo }}
          </p>
          <p class="text-sm text-gray-600">
            {{ phase.permiteEmpates ? 'Permite empates' : 'No permite empates' }}
          </p>
        </div>
        <div class="flex space-x-2">
          <button @click="$emit('edit', phase)" class="text-blue-600 hover:text-blue-800">
            Editar
          </button>
          <button @click="$emit('delete', phase.id)" class="text-red-600 hover:text-red-800">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FaseTorneo } from '../../interfaces';

defineProps<{
  phases: FaseTorneo[];
}>();

defineEmits<{
  (e: 'edit', phase: FaseTorneo): void;
  (e: 'delete', id: string): void;
}>();
</script>