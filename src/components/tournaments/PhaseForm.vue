<template>
  <form @submit.prevent="$emit('submit', form)" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Nombre</label>
      <input v-model="form.nombre" type="text" required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Equipos clasificados por grupo</label>
      <input v-model.number="form.equiposClasificadosPorGrupo" type="number" required min="1"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
    </div>
    <div class="flex items-center">
      <input v-model="form.permiteEmpates" type="checkbox" class="rounded border-gray-300 text-blue-600" />
      <label class="ml-2 text-sm font-medium text-gray-700">Permite empates</label>
    </div>
    <div class="flex justify-end space-x-2">
      <Button label="Cancelar" @click="$emit('cancel')" class="p-button-secondary" />
      <Button type="submit" :label="isEditing ? 'Actualizar' : 'Crear'" class="p-button-primary" />
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from 'primevue/button';
import type { FaseTorneo } from '../../interfaces';

const props = defineProps<{
  phase?: FaseTorneo;
  isEditing: boolean;
}>();

const form = ref({
  nombre: '',
  equiposClasificadosPorGrupo: 1,
  permiteEmpates: false
});

watch(() => props.phase, (newPhase) => {
  if (newPhase) {
    form.value = {
      nombre: newPhase.nombre,
      equiposClasificadosPorGrupo: newPhase.equiposClasificadosPorGrupo,
      permiteEmpates: newPhase.permiteEmpates
    };
  } else {
    form.value = {
      nombre: '',
      equiposClasificadosPorGrupo: 1,
      permiteEmpates: false
    };
  }
}, { immediate: true });

defineEmits<{
  (e: 'submit', form: { nombre: string; equiposClasificadosPorGrupo: number; permiteEmpates: boolean }): void;
  (e: 'cancel'): void;
}>();
</script>