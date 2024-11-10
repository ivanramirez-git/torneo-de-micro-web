<template>
  <DataTable 
    :value="players" 
    :loading="loading"
    dataKey="id"
    paginator
    :rows="10"
    :rowsPerPageOptions="[10, 20, 50]"
    filterDisplay="menu"
    :filters="filters"
    class="p-datatable-lg"
  >
    <Column field="nombre" header="Nombre" sortable>
      <template #filter="{ filterModel, filterCallback }">
        <InputText v-model="filterModel.value" @input="filterCallback()" />
      </template>
    </Column>
    <Column field="numero" header="Número" sortable>
      <template #filter="{ filterModel, filterCallback }">
        <InputNumber v-model="filterModel.value" @input="filterCallback()" />
      </template>
    </Column>
    <Column field="equipoId" header="Equipo" sortable>
      <template #body="slotProps">
        {{ getTeamName(slotProps.data.equipoId) }}
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <Dropdown 
          v-model="filterModel.value"
          :options="teams"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Seleccionar equipo"
          @change="filterCallback()"
        />
      </template>
    </Column>
    <Column header="Acciones" :exportable="false" style="min-width:8rem">
      <template #body="slotProps">
        <div class="flex gap-2">
          <Button 
            icon="pi pi-pencil" 
            @click="$emit('edit', slotProps.data)"
            class="p-button-text p-button-warning"
          />
          <Button 
            icon="pi pi-trash" 
            @click="$emit('delete', slotProps.data)"
            class="p-button-text p-button-danger"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Player, Team } from '../../interfaces';
import { FilterMatchMode } from 'primevue/api';

// Components
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';

const props = defineProps<{
  players: Player[];
  teams: Team[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'edit', player: Player): void;
  (e: 'delete', player: Player): void;
}>();

const filters = ref({
  nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
  numero: { value: null, matchMode: FilterMatchMode.EQUALS },
  equipoId: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const getTeamName = (teamId: string): string => {
  const team = props.teams.find(t => t.id === teamId);
  return team ? team.nombre : 'Equipo no encontrado';
};
</script>