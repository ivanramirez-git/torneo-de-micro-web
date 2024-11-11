<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Solicitudes de Tiempo</h1>
      <Button label="Nueva Solicitud" icon="pi pi-plus" @click="openDialog()" class="p-button-primary" />
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <DataTable :value="timeRequests" :loading="loading" dataKey="id" paginator :rows="10"
        :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu" :filters="filters" class="p-datatable-lg">
        <Column field="partidoId" header="Partido" sortable>
          <template #body="slotProps">
            <MatchInfo :match="getMatch(slotProps.data.partidoId)" :teams="teams" />
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Dropdown v-model="filterModel.value" :options="formattedMatches" optionLabel="description" optionValue="id"
              placeholder="Seleccionar partido" @change="filterCallback()" />
          </template>
        </Column>
        <Column field="equipoId" header="Equipo" sortable>
          <template #body="slotProps">
            <TeamInfo :team="getTeam(slotProps.data.equipoId)" />
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <Dropdown v-model="filterModel.value" :options="teams" optionLabel="nombre" optionValue="id"
              placeholder="Seleccionar equipo" @change="filterCallback()" />
          </template>
        </Column>
        <Column field="periodo" header="Periodo" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputNumber v-model="filterModel.value" @input="filterCallback()" :min="1" :max="4" />
          </template>
        </Column>
        <Column field="minuto" header="Minuto" sortable>
          <template #body="slotProps">
            {{ formatTime(slotProps.data.minuto) }}
          </template>
        </Column>
        <Column field="createdAt" header="Fecha Creación" sortable>
          <template #body="slotProps">
            {{ formatDate(slotProps.data.createdAt) }}
          </template>
        </Column>
        <Column header="Acciones" :exportable="false" style="min-width:8rem">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button icon="pi pi-pencil" @click="editTimeRequest(slotProps.data)"
                class="p-button-text p-button-warning" tooltip="Editar" />
              <Button icon="pi pi-trash" @click="confirmDelete(slotProps.data)" class="p-button-text p-button-danger"
                tooltip="Eliminar" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog para agregar/editar solicitud -->
    <Dialog v-model:visible="dialogVisible" :header="editMode ? 'Editar Solicitud' : 'Nueva Solicitud'" modal
      class="p-fluid">
      <div class="p-field mb-4">
        <label for="partidoId" class="font-bold mb-2 block">Partido</label>
        <Dropdown id="partidoId" v-model="formData.partidoId" :options="formattedMatches" optionLabel="description"
          optionValue="id" placeholder="Seleccione un partido" class="w-full" @change="loadTeamsForMatch" />
      </div>
      <div class="p-field mb-4">
        <label for="equipoId" class="font-bold mb-2 block">Equipo</label>
        <Dropdown id="equipoId" v-model="formData.equipoId" :options="availableTeams" optionLabel="nombre"
          optionValue="id" placeholder="Seleccione un equipo" class="w-full" :disabled="!formData.partidoId" />
      </div>
      <div class="p-field mb-4">
        <label for="periodo" class="font-bold mb-2 block">Periodo</label>
        <InputNumber id="periodo" v-model="formData.periodo" :min="1" :max="4" class="w-full" />
      </div>
      <div class="p-field mb-4">
        <label for="minuto" class="font-bold mb-2 block">Minuto</label>
        <Calendar id="minuto" v-model="formData.minuto" timeOnly :showSeconds="true" class="w-full" />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" @click="closeDialog" class="p-button-text" />
          <Button :label="editMode ? 'Actualizar' : 'Guardar'" icon="pi pi-check" @click="saveTimeRequest"
            class="p-button-primary" />
        </div>
      </template>
    </Dialog>

    <ConfirmDialog />
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';
import type { TimeRequest, Match, Team } from '../../interfaces';
import api from '../../stores/api';

// Components
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import MatchInfo from '../../components/matches/MatchInfo.vue';
import TeamInfo from '../../components/matches/TeamInfo.vue';

const confirm = useConfirm();
const toast = useToast();

// State
const timeRequests = ref<TimeRequest[]>([]);
const matches = ref<Match[]>([]);
const teams = ref<Team[]>([]);
const availableTeams = ref<Team[]>([]);
const loading = ref(true);
const dialogVisible = ref(false);
const editMode = ref(false);

const filters = ref({
  partidoId: { value: null, matchMode: FilterMatchMode.EQUALS },
  equipoId: { value: null, matchMode: FilterMatchMode.EQUALS },
  periodo: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const formData = ref<Partial<TimeRequest>>({
  partidoId: '',
  equipoId: '',
  periodo: 1,
  minuto: new Date()
});

// Computed
const formattedMatches = computed(() => {
  return matches.value.map(match => {
    const localTeam = teams.value.find(t => t.id === match.equipoLocalId);
    const visitorTeam = teams.value.find(t => t.id === match.equipoVisitanteId);

    return {
      id: match.id,
      description: `${new Date(match.fechaProgramacion).toLocaleDateString()} - ${localTeam?.nombre || 'Local'} vs ${visitorTeam?.nombre || 'Visitante'}`
    };
  });
});

// Methods
const loadTimeRequests = async () => {
  try {
    loading.value = true;
    const response = await api.get('/solicitudes-tiempo');
    timeRequests.value = response.data;
  } catch (error) {
    console.error('Error loading time requests:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las solicitudes de tiempo'
    });
  } finally {
    loading.value = false;
  }
};

const loadMatches = async () => {
  try {
    const response = await api.get('/partidos');
    matches.value = response.data;
  } catch (error) {
    console.error('Error loading matches:', error);
  }
};

const loadTeams = async () => {
  try {
    const response = await api.get('/equipos');
    teams.value = response.data;
  } catch (error) {
    console.error('Error loading teams:', error);
  }
};

const getMatch = (matchId: string): Match | undefined => {
  return matches.value.find(m => m.id === matchId);
};

const getTeam = (teamId: string): Team | undefined => {
  return teams.value.find(t => t.id === teamId);
};

const formatTime = (time: string | Date): string => {
  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString();
};

const loadTeamsForMatch = () => {
  if (!formData.value.partidoId) {
    availableTeams.value = [];
    return;
  }

  const match = matches.value.find(m => m.id === formData.value.partidoId);
  if (match) {
    availableTeams.value = teams.value.filter(t =>
      t.id === match.equipoLocalId || t.id === match.equipoVisitanteId
    );
  }
};

const openDialog = () => {
  editMode.value = false;
  formData.value = {
    partidoId: '',
    equipoId: '',
    periodo: 1,
    minuto: new Date()
  };
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  formData.value = {
    partidoId: '',
    equipoId: '',
    periodo: 1,
    minuto: new Date()
  };
};

const editTimeRequest = (timeRequest: TimeRequest) => {
  editMode.value = true;
  formData.value = { ...timeRequest };
  loadTeamsForMatch();
  dialogVisible.value = true;
};

const validateForm = (): boolean => {
  if (!formData.value.partidoId) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Debe seleccionar un partido'
    });
    return false;
  }

  if (!formData.value.equipoId) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Debe seleccionar un equipo'
    });
    return false;
  }

  if (!formData.value.periodo || formData.value.periodo < 1 || formData.value.periodo > 4) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'El periodo debe estar entre 1 y 4'
    });
    return false;
  }

  return true;
};

const saveTimeRequest = async () => {
  try {
    if (!validateForm()) return;

    if (editMode.value) {
      await api.patch(`/solicitudes-tiempo/${formData.value.id}`, formData.value);
    } else {
      await api.post('/solicitudes-tiempo', formData.value);
    }

    await loadTimeRequests();
    closeDialog();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Solicitud ${editMode.value ? 'actualizada' : 'creada'} correctamente`
    });
  } catch (error) {
    console.error('Error saving time request:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo ${editMode.value ? 'actualizar' : 'crear'} la solicitud`
    });
  }
};

const confirmDelete = (timeRequest: TimeRequest) => {
  confirm.require({
    message: '¿Está seguro de que desea eliminar esta solicitud?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteTimeRequest(timeRequest.id)
  });
};

const deleteTimeRequest = async (id: string) => {
  try {
    await api.delete(`/solicitudes-tiempo/${id}`);
    await loadTimeRequests();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Solicitud eliminada correctamente'
    });
  } catch (error) {
    console.error('Error deleting time request:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar la solicitud'
    });
  }
};

// Initial data load
loadTimeRequests();
loadMatches();
loadTeams();
</script>