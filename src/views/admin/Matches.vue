<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Partidos</h1>
      <Button label="Programar Partido" icon="pi pi-plus" @click="openDialog()" class="p-button-primary" />
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <DataTable :value="matches" :loading="loading" dataKey="id" paginator :rows="10"
        :rowsPerPageOptions="[10, 20, 50]" filterDisplay="menu" :filters="filters" class="p-datatable-lg">
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
            <div class="flex items-center">
              <img v-if="getTeam(slotProps.data.equipoLocalId)?.escudoUrl"
                :src="getTeam(slotProps.data.equipoLocalId)?.escudoUrl"
                :alt="getTeam(slotProps.data.equipoLocalId)?.nombre" class="w-8 h-8 object-contain mr-2" />
              <span :style="{ color: getTeam(slotProps.data.equipoLocalId)?.color }">
                {{ getTeam(slotProps.data.equipoLocalId)?.nombre }}
              </span>
            </div>
          </template>
        </Column>
        <Column field="equipoVisitanteId" header="Equipo Visitante" sortable>
          <template #body="slotProps">
            <div class="flex items-center">
              <img v-if="getTeam(slotProps.data.equipoVisitanteId)?.escudoUrl"
                :src="getTeam(slotProps.data.equipoVisitanteId)?.escudoUrl"
                :alt="getTeam(slotProps.data.equipoVisitanteId)?.nombre" class="w-8 h-8 object-contain mr-2" />
              <span :style="{ color: getTeam(slotProps.data.equipoVisitanteId)?.color }">
                {{ getTeam(slotProps.data.equipoVisitanteId)?.nombre }}
              </span>
            </div>
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
        <Column header="Estado" :exportable="false">
          <template #body="slotProps">
            <StatusBadge :match="slotProps.data" />
          </template>
        </Column>
        <Column header="Acciones" :exportable="false" style="min-width:8rem">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button icon="pi pi-pencil" @click="editMatch(slotProps.data)" class="p-button-text p-button-warning"
                tooltip="Editar" />
              <Button icon="pi pi-trash" @click="confirmDelete(slotProps.data)" class="p-button-text p-button-danger"
                tooltip="Eliminar" />
              <Button icon="pi pi-list" @click="goToMatchEvents(slotProps.data.id)" class="p-button-text p-button-info"
                tooltip="Gestionar Eventos" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

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
            optionValue="id" placeholder="Seleccione equipo local" class="w-full" :disabled="!matchForm.grupoId"
            required />
        </div>
        <div class="p-field">
          <label for="equipoVisitanteId" class="font-bold mb-2 block">Equipo Visitante</label>
          <Dropdown id="equipoVisitanteId" v-model="matchForm.equipoVisitanteId" :options="groupTeams"
            optionLabel="nombre" optionValue="id" placeholder="Seleccione equipo visitante" class="w-full"
            :disabled="!matchForm.grupoId" required />
        </div>
      </div>

      <div class="p-field mt-4">
        <label for="lugarId" class="font-bold mb-2 block">Lugar</label>
        <Dropdown id="lugarId" v-model="matchForm.lugarId" :options="venues" optionLabel="nombre" optionValue="id"
          placeholder="Seleccione lugar" class="w-full" required />
      </div>

      <div v-if="!editMode" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div class="p-field">
          <label for="capitanEquipoLocalId" class="font-bold mb-2 block">Capitán Local</label>
          <Dropdown id="capitanEquipoLocalId" v-model="matchForm.capitanEquipoLocalId"
            :options="getTeamPlayers(matchForm.equipoLocalId)" optionLabel="nombre" optionValue="id"
            placeholder="Seleccione capitán" class="w-full" :disabled="!matchForm.equipoLocalId" />
        </div>
        <div class="p-field">
          <label for="capitanEquipoVisitanteId" class="font-bold mb-2 block">Capitán Visitante</label>
          <Dropdown id="capitanEquipoVisitanteId" v-model="matchForm.capitanEquipoVisitanteId"
            :options="getTeamPlayers(matchForm.equipoVisitanteId)" optionLabel="nombre" optionValue="id"
            placeholder="Seleccione capitán" class="w-full" :disabled="!matchForm.equipoVisitanteId" />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" icon="pi pi-times" @click="closeDialog" class="p-button-text" />
          <Button :label="editMode ? 'Actualizar' : 'Guardar'" icon="pi pi-check" @click="saveMatch"
            class="p-button-primary" />
        </div>
      </template>
    </Dialog>

    <ConfirmDialog />
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';
import type { Match, Team, Group, Venue, Player, TeamGroup } from '../../interfaces';
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
import StatusBadge from '../../components/matches/StatusBadge.vue';

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

// State
const matches = ref<Match[]>([]);
const teams = ref<Team[]>([]);
const groupTeams = ref<Team[]>([]);
const groups = ref<Group[]>([]);
const venues = ref<Venue[]>([]);
const players = ref<Player[]>([]);
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

const matchForm = ref<Partial<Match>>({
  fechaProgramacion: null as unknown as Date,
  horaProgramacion: null as unknown as Date,
  equipoLocalId: '',
  equipoVisitanteId: '',
  grupoId: '',
  lugarId: '',
  capitanEquipoLocalId: '',
  capitanEquipoVisitanteId: ''
});

// Methods
const loadMatches = async () => {
  try {
    loading.value = true;
    const response = await api.get('/partidos', {
      params: {
        filter: {
          order: [
            'createdAt DESC'
          ]
        }
      }
    });
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

const loadPlayers = async () => {
  try {
    const response = await api.get('/jugadores');
    players.value = response.data;
  } catch (error) {
    console.error('Error loading players:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los jugadores'
    });
  }
};

const loadGroupTeams = async () => {
  if (!matchForm.value.grupoId) {
    groupTeams.value = [];
    return;
  }

  try {
    // First get the team-group relationships
    const response = await api.get(`/grupos/${matchForm.value.grupoId}/equipo-grupos`);
    const teamGroups: TeamGroup[] = response.data;

    // Then get the actual teams using the relationships
    const teamIds = teamGroups.map(tg => tg.equipoId);
    groupTeams.value = teams.value.filter(team => teamIds.includes(team.id));
  } catch (error) {
    console.error('Error loading group teams:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los equipos del grupo'
    });
  }
};

const getTeam = (teamId: string): Team | undefined => {
  return teams.value.find(t => t.id === teamId);
};

const getTeamPlayers = (teamId: string): Player[] => {
  if (!teamId) return [];
  return players.value.filter(p => p.equipoId === teamId);
};

const getGroupName = (groupId: string): string => {
  const group = groups.value.find(g => g.id === groupId);
  return group ? group.nombre : 'Grupo no encontrado';
};

const getVenueName = (venueId: string): string => {
  const venue = venues.value.find(v => v.id === venueId);
  return venue ? venue.nombre : 'Lugar no encontrado';
};

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString();
};

const formatTime = (time: string | Date): string => {
  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const openDialog = () => {
  editMode.value = false;
  matchForm.value = {
    fechaProgramacion: new Date(),
    horaProgramacion: new Date(),
    equipoLocalId: '',
    equipoVisitanteId: '',
    grupoId: '',
    lugarId: '',
    capitanEquipoLocalId: '',
    capitanEquipoVisitanteId: ''
  };
  groupTeams.value = [];
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  matchForm.value = {
    fechaProgramacion: new Date(),
    horaProgramacion: new Date(),
    equipoLocalId: '',
    equipoVisitanteId: '',
    grupoId: '',
    lugarId: '',
    capitanEquipoLocalId: '',
    capitanEquipoVisitanteId: ''
  };
  groupTeams.value = [];
};

const editMatch = (match: Match) => {
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

  // Nueva validación: verificar si el partido ya existe en el mismo grupo
  const existingMatch = matches.value.find(match =>
    match.grupoId === matchForm.value.grupoId &&
    (
      (match.equipoLocalId === matchForm.value.equipoLocalId &&
        match.equipoVisitanteId === matchForm.value.equipoVisitanteId) ||
      (match.equipoLocalId === matchForm.value.equipoVisitanteId &&
        match.equipoVisitanteId === matchForm.value.equipoLocalId)
    )
  );

  if (existingMatch) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Este partido ya existe en el grupo y no puede ser programado nuevamente.'
    });
    return false;
  }



  return true;
};

const saveMatch = async () => {
  try {
    if (!validateForm()) return;

    const matchData = {
      ...matchForm.value,
      fechaProgramacion: matchForm.value.fechaProgramacion,
      horaProgramacion: matchForm.value.horaProgramacion
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

const confirmDelete = (match: Match) => {
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

const goToMatchEvents = (matchId: string) => {
  router.push(`/admin/match-events/${matchId}`);
};

onMounted(() => {
  loadMatches();
  loadTeams();
  loadGroups();
  loadVenues();
  loadPlayers();
});
</script>