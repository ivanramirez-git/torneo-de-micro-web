<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Equipos en Grupos</h1>
      <Button 
        label="Nueva Asignación" 
        icon="pi pi-plus" 
        @click="openDialog()" 
        class="p-button-primary"
      />
    </div>

    <DataTable 
      :value="teamGroups" 
      :loading="loading"
      dataKey="id"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      filterDisplay="menu"
      :filters="filters"
      class="p-datatable-lg"
    >
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
      <Column field="grupoId" header="Grupo" sortable>
        <template #body="slotProps">
          {{ getGroupName(slotProps.data.grupoId) }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Dropdown 
            v-model="filterModel.value"
            :options="groups"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccionar grupo"
            @change="filterCallback()"
          />
        </template>
      </Column>
      <Column field="createdAt" header="Fecha Asignación" sortable>
        <template #body="slotProps">
          {{ new Date(slotProps.data.createdAt).toLocaleDateString() }}
        </template>
      </Column>
      <Column header="Acciones" :exportable="false" style="min-width:8rem">
        <template #body="slotProps">
          <Button 
            icon="pi pi-trash" 
            @click="confirmDelete(slotProps.data)"
            class="p-button-text p-button-danger"
          />
        </template>
      </Column>
    </DataTable>

    <!-- Dialog para agregar asignación -->
    <Dialog 
      v-model:visible="dialogVisible" 
      header="Nueva Asignación"
      modal
      class="p-fluid"
    >
      <div class="p-field mb-4">
        <label for="equipoId" class="font-bold mb-2 block">Equipo</label>
        <Dropdown
          id="equipoId"
          v-model="formData.equipoId"
          :options="teams"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Seleccione un equipo"
          class="w-full"
        />
      </div>
      <div class="p-field mb-4">
        <label for="grupoId" class="font-bold mb-2 block">Grupo</label>
        <Dropdown
          id="grupoId"
          v-model="formData.grupoId"
          :options="groups"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Seleccione un grupo"
          class="w-full"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button 
            label="Cancelar" 
            icon="pi pi-times" 
            @click="closeDialog" 
            class="p-button-text"
          />
          <Button 
            label="Guardar" 
            icon="pi pi-check" 
            @click="saveTeamGroup" 
            class="p-button-primary"
          />
        </div>
      </template>
    </Dialog>

    <ConfirmDialog />
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';
import type { TeamGroup, Team, Group } from '../../interfaces';
import api from '../../stores/api';

// Components
import Button from 'primevue/button';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Toast from 'primevue/toast';

const confirm = useConfirm();
const toast = useToast();

// State
const teamGroups = ref<TeamGroup[]>([]);
const teams = ref<Team[]>([]);
const groups = ref<Group[]>([]);
const loading = ref(true);
const dialogVisible = ref(false);

const filters = ref({
  equipoId: { value: null, matchMode: FilterMatchMode.EQUALS },
  grupoId: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const formData = ref({
  equipoId: '',
  grupoId: ''
});

// Methods
const loadTeamGroups = async () => {
  try {
    loading.value = true;
    const response = await api.get('/equipos-grupo');
    teamGroups.value = response.data;
  } catch (error) {
    console.error('Error loading team groups:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las asignaciones'
    });
  } finally {
    loading.value = false;
  }
};

const loadTeams = async () => {
  try {
    const response = await api.get('/equipos');
    teams.value = response.data;
  } catch (error) {
    console.error('Error loading teams:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los equipos'
    });
  }
};

const loadGroups = async () => {
  try {
    const response = await api.get('/grupos');
    groups.value = response.data;
  } catch (error) {
    console.error('Error loading groups:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los grupos'
    });
  }
};

const getTeamName = (teamId: string): string => {
  const team = teams.value.find(t => t.id === teamId);
  return team ? team.nombre : 'Equipo no encontrado';
};

const getGroupName = (groupId: string): string => {
  const group = groups.value.find(g => g.id === groupId);
  return group ? group.nombre : 'Grupo no encontrado';
};

const openDialog = () => {
  formData.value = {
    equipoId: '',
    grupoId: ''
  };
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  formData.value = {
    equipoId: '',
    grupoId: ''
  };
};

const saveTeamGroup = async () => {
  try {
    if (!formData.value.equipoId || !formData.value.grupoId) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor seleccione un equipo y un grupo'
      });
      return;
    }

    await api.post('/equipos-grupo', formData.value);
    await loadTeamGroups();
    closeDialog();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Asignación creada correctamente'
    });
  } catch (error) {
    console.error('Error saving team group:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo crear la asignación'
    });
  }
};

const confirmDelete = (teamGroup: TeamGroup) => {
  confirm.require({
    message: '¿Está seguro de que desea eliminar esta asignación?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteTeamGroup(teamGroup.id)
  });
};

const deleteTeamGroup = async (id: string) => {
  try {
    await api.delete(`/equipos-grupo/${id}`);
    await loadTeamGroups();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Asignación eliminada correctamente'
    });
  } catch (error) {
    console.error('Error deleting team group:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar la asignación'
    });
  }
};

onMounted(() => {
  loadTeamGroups();
  loadTeams();
  loadGroups();
});
</script>