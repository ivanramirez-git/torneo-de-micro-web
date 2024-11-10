<template>
  <span 
    class="px-2 py-1 text-xs font-semibold rounded-full"
    :class="statusClass"
  >
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  match: {
    type: Object,
    required: true
  }
});

const getMatchStatus = () => {
  const now = new Date();
  const matchDate = new Date(props.match.fechaProgramacion);
  
  if (props.match.horaFinPartido) {
    return 'finished';
  }
  
  if (props.match.horaInicioPrimerTiempo) {
    return 'in_progress';
  }
  
  if (matchDate > now) {
    return 'scheduled';
  }
  
  return 'pending';
};

const statusClass = computed(() => {
  const status = getMatchStatus();
  switch (status) {
    case 'finished':
      return 'bg-gray-100 text-gray-800';
    case 'in_progress':
      return 'bg-green-100 text-green-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
});

const statusText = computed(() => {
  const status = getMatchStatus();
  switch (status) {
    case 'finished':
      return 'Finalizado';
    case 'in_progress':
      return 'En Progreso';
    case 'scheduled':
      return 'Programado';
    default:
      return 'Pendiente';
  }
});
</script>