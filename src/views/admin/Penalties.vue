<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Penales</h1>
      <Button label="Nuevo Penal" icon="pi pi-plus" @click="openDialog()" class="p-button-primary" />
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <DataTable :value="penalties" :loading="loading" dataKey="id" paginator :rows="10"
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
        <Column field="gol" header="Resultado" sortable>
          <template #body="slotProps">
            <Tag :severity="slotProps.data.gol ? 'success' : 'danger'"
              :value="slotProps.data.gol ? 'Gol' : 'Fallado'" />
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <TriStateCheckbox v-model="filterModel.value" @change="filterCallback()" />
          </template>
        </Column>
        <Column field="createdAt" header="Fecha" sortable>
          <template #body="slotProps">
            {{ formatDateTime(slotProps.data.createdAt) }}
          </template>
        </Column>
        <Column header="Acciones" :exportable="false" style="min-width:8rem">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button icon="pi pi-pencil" @click="editPenalty(slotProps.data)" class="p-button-text p-button-warning"
                tooltip="Editar" />
              <Button icon="pi pi-trash" @click="confirmDelete(slotProps.data)" class="p-button-text p-button-danger"
                tooltip="Eliminar" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog para agregar/editar penal -->
    <Dialog v-model:visible="dialogVisible" :header="editMode ? 'Editar Penal' : 'Nuevo Penal'" modal class="p-fluid">
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
      <div class="p-field">
        <label class="font-bold mb-2 block">Resultado</label>
        <div class="flex gap-4">
          <div class="flex items-center">
            <RadioButton v-model="formData.gol" :value="true" inputId="gol-si" />
            <label for="gol-si" class="ml-2">Gol</label>
          </div>
          <div class="flex items-center">
            <RadioButton v-model="formData.gol" :value="false" inputId="gol-no" />
            <label for="gol-no" class="ml-2">Fallado</label>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" @click="closeDialog" class="p-button-text" />
          <Button :label="editMode ? 'Actualizar' : 'Guardar'" icon="pi pi-check" @click="savePenalty"
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
import type { Penalty, Match, Team } from '../../interfaces';
import api from '../../stores/api';

// Components
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import RadioButton from 'primevue/radiobutton';
import TriStateCheckbox from 'primevue/tristatecheckbox';
import Tag from 'primevue/tag';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import MatchInfo from '../../components/matches/MatchInfo.vue';
import TeamInfo from '../../components/matches/TeamInfo.vue';

const confirm = useConfirm();
const toast = useToast();

// State
const penalties = ref<Penalty[]>([]);
const matches = ref<Match[]>([]);
const teams = ref<Team[]>([]);
const availableTeams = ref<Team[]>([]);
const loading = ref(true);
const dialogVisible = ref(false);
const editMode = ref(false);

const filters = ref({
  partidoId: { value: null, matchMode: FilterMatchMode.EQUALS },
  equipoId: { value: null, matchMode: FilterMatchMode.EQUALS },
  gol: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const formData = ref<Partial<Penalty>>({
  partidoId: '',
  equipoId: '',
  gol: true
});

// Computed
const formattedMatches = computed(() => {
  return matches.value
    .filter(match => match.horaInicioPenales && !match.horaFinPenales)
    .map(match => {
      const localTeam = teams.value.find(t => t.id === match.equipoLocalId);
      const visitorTeam = teams.value.find(t => t.id === match.equipoVisitanteId);

      return {
        id: match.id,
        description: `${new Date(match.fechaProgramacion).toLocaleDateString()} - ${localTeam?.nombre || 'Local'} vs ${visitorTeam?.nombre || 'Visitante'}`
      };
    });
});

// Methods
const loadPenalties = async () => {
  try {
    loading.value = true;
    const response = await api.get('/penales');
    penalties.value = response.data;
  } catch (error) {
    console.error('Error loading penalties:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los penales'
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

const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString();
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
    gol: true
  };
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  formData.value = {
    partidoId: '',
    equipoId: '',
    gol: true
  };
};

const editPenalty = (penalty: Penalty) => {
  editMode.value = true;
  formData.value = { ...penalty };
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

  const match = matches.value.find(m => m.id === formData.value.partidoId);
  if (!match?.horaInicioPenales) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'El partido seleccionado no está en fase de penales'
    });
    return false;
  }

  if (match.horaFinPenales) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'La tanda de penales ya ha finalizado'
    });
    return false;
  }

  return true;
};

const savePenalty = async () => {
  try {
    if (!validateForm()) return;

    if (editMode.value) {
      await api.patch(`/penales/${formData.value.id}`, formData.value);
    } else {
      await api.post('/penales', formData.value);
    }

    await loadPenalties();
    closeDialog();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Penal ${editMode.value ? 'actualizado' : 'registrado'} correctamente`
    });
  } catch (error) {
    console.error('Error saving penalty:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo ${editMode.value ? 'actualizar' : 'registrar'} el penal`
    });
  }
};

const confirmDelete = (penalty: Penalty) => {
  confirm.require({
    message: '¿Está seguro de que desea eliminar este penal?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deletePenalty(penalty.id)
  });
};

const deletePenalty = async (id: string) => {
  try {
    await api.delete(`/penales/${id}`);
    await loadPenalties();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Penal eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting penalty:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el penal'
    });
  }
};

// Initial data load
loadPenalties();
loadMatches();
loadTeams();
</script>