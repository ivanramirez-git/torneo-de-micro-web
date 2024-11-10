<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Partidos</h1>
      <Button label="Programar Partido" icon="pi pi-plus" @click="openDialog()" class="p-button-primary" />
    </div>

    <DataTable :value="matches" :loading="loading" dataKey="id" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]"
      filterDisplay="menu" :filters="filters" class="p-datatable-lg">
      <Column field="fechaProgramacion" header="Fecha" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.fechaProgramacion) }}
        </template>
      </Column>
      <Column field="horaProgramacion" header="Hora" sortable>
        <template #body="slotProps">
          {{ formatTime(slotProps.data.horaProgramacion) }}
        </template>
      </Column>
      <Column field="equipoLocalId" header="Equipo Local" sortable>
        <template #body="slotProps">
          {{ getTeamName(slotProps.data.equipoLocalId) }}
        </template>
      </Column>
      <Column field="equipoVisitanteId" header="Equipo Visitante" sortable>
        <template #body="slotProps">
          {{ getTeamName(slotProps.data.equipoVisitanteId) }}
        </template>
      </Column>
      <Column field="grupoId" header="Grupo" sortable>
        <template #body="slotProps">
          {{ getGroupName(slotProps.data.grupoId) }}
        </template>
      </Column>
      <Column field="lugarId" header="Lugar" sortable>
        <template #body="slotProps">
          {{ getVenueName(slotProps.data.lugarId) }}
        </template>
      </Column>
      <Column header="Acciones" :exportable="false" style="min-width:8rem">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" @click="editMatch(slotProps.data)" class="p-button-text p-button-warning" />
            <Button icon="pi pi-trash" @click="confirmDelete(slotProps.data)" class="p-button-text p-button-danger" />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Dialog para agregar/editar partido -->
    <Dialog v-model:visible="dialogVisible" :header="editMode ? 'Editar Partido' : 'Programar Partido'" modal
      class="p-fluid">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-field">
          <label for="fechaProgramacion" class="font-bold mb-2 block">Fecha</label>
          <Calendar id="fechaProgramacion" v-model="matchForm.fechaProgramacion" dateFormat="yy-mm-dd" :showIcon="true"
            class="w-full" required />
        </div>
        <div class="p-field">
          <label for="horaProgramacion" class="font-bold mb-2 block">Hora</label>
          <Calendar id="horaProgramacion" v-model="matchForm.horaProgramacion" timeOnly :showIcon="true" class="w-full"
            required />
        </div>
      </div>

      <div class="p-field mt-4">
        <label for="grupoId" class="font-bold mb-2 block">Grupo</label>
        <Dropdown id="grupoId" v-model="matchForm.grupoId" :options="groups" optionLabel="nombre" optionValue="id"
          placeholder="Seleccione grupo" class="w-full" required @change="loadGroupTeams" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div class="p-field">
          <label for="equipoLocalId" class="font-bold mb-2 block">Equipo Local</label>
          <Dropdown id="equipoLocalId" v-model="matchForm.equipoLocalId" :options="groupTeams" optionLabel="nombre"
            optionValue="id" placeholder="Seleccione equipo local" class="w-full" required
            :disabled="!matchForm.grupoId" />
        </div>
        <div class="p-field">
          <label for="equipoVisitanteId" class="font-bold mb-2 block">Equipo Visitante</label>
          <Dropdown id="equipoVisitanteId" v-model="matchForm.equipoVisitanteId" :options="groupTeams"
            optionLabel="nombre" optionValue="id" placeholder="Seleccione equipo visitante" class="w-full" required
            :disabled="!matchForm.grupoId" />
        </div>
      </div>

      <div class="p-field mt-4">
        <label for="lugarId" class="font-bold mb-2 block">Lugar</label>
        <Dropdown id="lugarId" v-model="matchForm.lugarId" :options="venues" optionLabel="nombre" optionValue="id"
          placeholder="Seleccione lugar" class="w-full" required />
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" @click="closeDialog" class="p-button-text" />
          <Button :label="editMode ? 'Actualizar' : 'Guardar'" icon="pi pi-check" @click="saveMatch"
            class="p-button-primary" />
        </div>
      </template>
    </Dialog>

    <ConfirmDialog></ConfirmDialog>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';
import api from '../../stores/api';

// Components
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Toast from 'primevue/toast';

const confirm = useConfirm();
const toast = useToast();

// State
const matches = ref([]);
const teams = ref([]);
const groupTeams = ref([]);
const groups = ref([]);
const venues = ref([]);
const loading = ref(true);
const dialogVisible = ref(false);
const editMode = ref(false);

const filters = ref({
  fechaProgramacion: { value: null, matchMode: FilterMatchMode.DATE_IS },
  equipoLocalId: { value: null, matchMode: FilterMatchMode.EQUALS },
  equipoVisitanteId: { value: null, matchMode: FilterMatchMode.EQUALS },
  grupoId: { value: null, matchMode: FilterMatchMode.EQUALS },
  lugarId: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const matchForm = ref({
  fechaProgramacion: null as Date | null,
  horaProgramacion: null as Date | null,
  equipoLocalId: '',
  equipoVisitanteId: '',
  grupoId: '',
  lugarId: ''
});

// Methods
const loadMatches = async () => {
  try {
    loading.value = true;
    const response = await api.get('/partidos');
    matches.value = response.data;
  } catch (error) {
    console.error('Error loading matches:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los partidos'
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

const loadGroupTeams = async () => {
  if (!matchForm.value.grupoId) {
    groupTeams.value = [];
    return;
  }

  try {
    const response = await api.get(`/grupos/${matchForm.value.grupoId}/equipo-grupos`);
    const teamIds = response.data.map((eg: any) => eg.equipoId);
    groupTeams.value = teams.value.filter(t => teamIds.includes(t.id));
  } catch (error) {
    console.error('Error loading group teams:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los equipos del grupo'
    });
  }
};

const loadVenues = async () => {
  try {
    const response = await api.get('/lugares');
    venues.value = response.data;
  } catch (error) {
    console.error('Error loading venues:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los lugares'
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

const getVenueName = (venueId: string): string => {
  const venue = venues.value.find(v => v.id === venueId);
  return venue ? venue.nombre : 'Lugar no encontrado';
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

const formatTime = (time: string): string => {
  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const openDialog = () => {
  editMode.value = false;
  matchForm.value = {
    fechaProgramacion: null,
    horaProgramacion: null,
    equipoLocalId: '',
    equipoVisitanteId: '',
    grupoId: '',
    lugarId: ''
  };
  groupTeams.value = [];
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  matchForm.value = {
    fechaProgramacion: null,
    horaProgramacion: null,
    equipoLocalId: '',
    equipoVisitanteId: '',
    grupoId: '',
    lugarId: ''
  };
  groupTeams.value = [];
};

const editMatch = (match) => {
  editMode.value = true;
  matchForm.value = {
    ...match,
    fechaProgramacion: new Date(match.fechaProgramacion),
    horaProgramacion: new Date(match.horaProgramacion)
  };
  loadGroupTeams();
  dialogVisible.value = true;
};

const validateForm = () => {
  if (!matchForm.value.fechaProgramacion || !matchForm.value.horaProgramacion) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'La fecha y hora son requeridas'
    });
    return false;
  }

  if (!matchForm.value.equipoLocalId || !matchForm.value.equipoVisitanteId) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Debe seleccionar ambos equipos'
    });
    return false;
  }

  if (!matchForm.value.grupoId) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Debe seleccionar un grupo'
    });
    return false;
  }

  if (matchForm.value.equipoLocalId === matchForm.value.equipoVisitanteId) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Los equipos local y visitante no pueden ser el mismo'
    });
    return false;
  }

  // Verificar si ya existe un partido con la misma combinación de equipos y grupo
  const existingMatch = matches.value.find(match =>
    match.id !== matchForm.value.id && // Excluir el partido actual en caso de edición
    match.grupoId === matchForm.value.grupoId &&
    ((match.equipoLocalId === matchForm.value.equipoLocalId &&
      match.equipoVisitanteId === matchForm.value.equipoVisitanteId) ||
      (match.equipoLocalId === matchForm.value.equipoVisitanteId &&
        match.equipoVisitanteId === matchForm.value.equipoLocalId))
  );

  if (existingMatch) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Ya existe un partido programado entre estos equipos en este grupo'
    });
    return false;
  }

  return true;
};

const saveMatch = async () => {
  try {
    if (!validateForm()) return;

    const matchData = {
      fechaProgramacion: matchForm.value.fechaProgramacion,
      horaProgramacion: matchForm.value.horaProgramacion,
      equipoLocalId: matchForm.value.equipoLocalId,
      equipoVisitanteId: matchForm.value.equipoVisitanteId,
      grupoId: matchForm.value.grupoId,
      lugarId: matchForm.value.lugarId
    };

    if (editMode.value) {
      await api.patch(`/partidos/${matchForm.value.id}`, matchData);
    } else {
      await api.post('/partidos', matchData);
    }

    await loadMatches();
    closeDialog();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Partido ${editMode.value ? 'actualizado' : 'creado'} correctamente`
    });
  } catch (error) {
    console.error('Error saving match:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo ${editMode.value ? 'actualizar' : 'crear'} el partido`
    });
  }
};

const confirmDelete = (match) => {
  confirm.require({
    message: '¿Está seguro de que desea eliminar este partido?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteMatch(match.id)
  });
};

const deleteMatch = async (id: string) => {
  try {
    await api.delete(`/partidos/${id}`);
    await loadMatches();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Partido eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting match:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el partido'
    });
  }
};

onMounted(() => {
  loadMatches();
  loadTeams();
  loadGroups();
  loadVenues();
});
</script>