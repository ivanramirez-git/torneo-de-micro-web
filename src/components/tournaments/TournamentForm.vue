<template>
  <form @submit.prevent="$emit('submit', form)" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Nombre</label>
      <input v-model="form.nombre" type="text" required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Color</label>
      <input v-model="form.color" type="color" class="mt-1 block w-full" />
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
import type { Torneo } from '../../interfaces';

const props = defineProps<{
  tournament?: Torneo;
  isEditing: boolean;
}>();

const form = ref({
  nombre: '',
  color: '#000000'
});

watch(() => props.tournament, (newTournament) => {
  if (newTournament) {
    form.value = { ...newTournament };
  } else {
    form.value = { nombre: '', color: '#000000' };
  }
}, { immediate: true });

defineEmits<{
  (e: 'submit', form: { nombre: string; color: string }): void;
  (e: 'cancel'): void;
}>();
</script>