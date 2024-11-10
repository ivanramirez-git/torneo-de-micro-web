<template>
  <div 
    class="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm text-gray-500">
            {{ formatDate(match.fechaProgramacion) }}
          </span>
          <span class="text-sm text-gray-500">
            {{ formatTime(match.horaProgramacion) }}
          </span>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="text-right flex-1">
              <span class="font-semibold">{{ getTeamName(match.equipoLocalId) }}</span>
            </div>
            <div class="text-2xl font-bold text-gray-700">vs</div>
            <div class="flex-1">
              <span class="font-semibold">{{ getTeamName(match.equipoVisitanteId) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="ml-4">
        <button 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Ir al partido
        </button>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
      <div>
        <i class="pi pi-map-marker mr-1"></i>
        {{ match.lugar?.nombre || 'Lugar por definir' }}
      </div>
      <div>
        <StatusBadge :match="match" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import StatusBadge from './StatusBadge.vue';

const props = defineProps({
  match: {
    type: Object,
    required: true
  },
  teams: {
    type: Array,
    required: true
  }
});

defineEmits(['click']);

const getTeamName = (teamId: string) => {
  const team = props.teams.find(t => t.id === teamId);
  return team ? team.nombre : 'Equipo no encontrado';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const formatTime = (time: string) => {
  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>