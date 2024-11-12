<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Estadísticas de Partidos</h1>
      <Button label="Nueva Estadística" icon="pi pi-plus" @click="openDialog()" class="p-button-primary" />
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <StatsTable :stats="stats" :matches="matches" :teams="teams" :players="players" :loading="loading"
        @edit="editStats" @delete="confirmDelete" />
    </div>

    <!-- Dialog para agregar/editar estadísticas -->
    <Dialog v-model:visible="dialogVisible" :header="editMode ? 'Editar Estadísticas' : 'Nuevas Estadísticas'" modal
      class="p-fluid">
      <StatsForm :stat="editingStat" :matches="matches" :teams="teams" :players="players" :is-editing="editMode"
        @submit="saveStats" @cancel="closeDialog" />
    </Dialog>

    <ConfirmDialog />
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import type { MatchStatistics, Match, Team, Player } from '../../interfaces';
import api from '../../stores/api';

// Components
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import StatsTable from '../../components/matches/StatsTable.vue';
import StatsForm from '../../components/matches/StatsForm.vue';

const confirm = useConfirm();
const toast = useToast();

// State
const stats = ref<MatchStatistics[]>([]);
const matches = ref<Match[]>([]);
const teams = ref<Team[]>([]);
const players = ref<Player[]>([]);
const loading = ref(true);
const dialogVisible = ref(false);
const editMode = ref(false);
const editingStat = ref<MatchStatistics | undefined>();

// Methods
const loadStats = async () => {
  try {
    loading.value = true;
    const response = await api.get('/estadisticas-partido');
    stats.value = response.data;
  } catch (error) {
    console.error('Error loading stats:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las estadísticas'
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
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los partidos'
    });
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

const openDialog = () => {
  editMode.value = false;
  editingStat.value = undefined;
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  editMode.value = false;
  editingStat.value = undefined;
};

const editStats = (stat: MatchStatistics) => {
  editMode.value = true;
  editingStat.value = stat;
  dialogVisible.value = true;
};

const saveStats = async (formData: Partial<MatchStatistics>) => {
  try {
    if (editMode.value && editingStat.value) {
      await api.patch(`/estadisticas-partido/${editingStat.value.id}`, formData);
    } else {
      await api.post('/estadisticas-partido', formData);
    }

    await loadStats();
    closeDialog();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Estadísticas ${editMode.value ? 'actualizadas' : 'guardadas'} correctamente`
    });
  } catch (error) {
    console.error('Error saving stats:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudieron ${editMode.value ? 'actualizar' : 'guardar'} las estadísticas`
    });
  }
};

const confirmDelete = (stat: MatchStatistics) => {
  confirm.require({
    message: '¿Está seguro de que desea eliminar estas estadísticas?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteStats(stat.id)
  });
};

const deleteStats = async (id: string) => {
  try {
    await api.delete(`/estadisticas-partido/${id}`);
    await loadStats();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Estadísticas eliminadas correctamente'
    });
  } catch (error) {
    console.error('Error deleting stats:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron eliminar las estadísticas'
    });
  }
};

onMounted(() => {
  loadStats();
  loadMatches();
  loadTeams();
  loadPlayers();
});
</script>