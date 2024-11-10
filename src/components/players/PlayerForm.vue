<template>
  <form @submit.prevent="$emit('submit', form)" class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-field">
        <label for="nombre" class="font-bold mb-2 block">Nombre</label>
        <InputText 
          id="nombre" 
          v-model="form.nombre" 
          required 
          class="w-full"
        />
      </div>
      <div class="p-field">
        <label for="numero" class="font-bold mb-2 block">Número</label>
        <InputNumber 
          id="numero" 
          v-model="form.numero" 
          required
          :min="1"
          :max="99"
          class="w-full"
        />
      </div>
    </div>

    <div class="p-field">
      <label for="equipoId" class="font-bold mb-2 block">Equipo</label>
      <Dropdown
        id="equipoId"
        v-model="form.equipoId"
        :options="teams"
        optionLabel="nombre"
        optionValue="id"
        placeholder="Seleccione un equipo"
        required
        class="w-full"
      />
    </div>

    <div class="flex justify-end gap-2">
      <Button 
        label="Cancelar" 
        @click="$emit('cancel')" 
        class="p-button-text"
      />
      <Button 
        type="submit" 
        :label="isEditing ? 'Actualizar' : 'Crear'" 
        class="p-button-primary"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Player, Team } from '../../interfaces';

// Components
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';

const props = defineProps<{
  player?: Player;
  teams: Team[];
  isEditing: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', form: Partial<Player>): void;
  (e: 'cancel'): void;
}>();

const form = ref<Partial<Player>>({
  nombre: '',
  numero: 1,
  equipoId: ''
});

watch(() => props.player, (newPlayer) => {
  if (newPlayer) {
    form.value = { ...newPlayer };
  } else {
    form.value = {
      nombre: '',
      numero: 1,
      equipoId: ''
    };
  }
}, { immediate: true });
</script>