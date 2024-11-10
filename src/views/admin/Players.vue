<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Jugadores</h1>
      <Button 
        label="Nuevo Jugador" 
        icon="pi pi-plus" 
        @click="showDialog()" 
        class="p-button-primary"
      />
    </div>

    <PlayerList
      :players="players"
      :teams="teams"
      :loading="loading"
      @edit="editPlayer"
      @delete="confirmDelete"
    />

    <Dialog 
      v-model:visible="dialogVisible" 
      :header="editingPlayer ? 'Editar Jugador' : 'Nuevo Jugador'"
      modal
      class="p-fluid"
    >
      <PlayerForm
        :player="editingPlayer"
        :teams="teams"
        :is-editing="!!editingPlayer"
        @submit="savePlayer"
        @cancel="closeDialog"
      />
    </Dialog>

    <ConfirmDialog />
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import type { Player, Team } from '../../interfaces';
import api from '../../stores/api';

// Components
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import PlayerList from '../../components/players/PlayerList.vue';
import PlayerForm from '../../components/players/PlayerForm.vue';

const confirm = useConfirm();
const toast = useToast();

// State
const players = ref<Player[]>([]);
const teams = ref<Team[]>([]);
const loading = ref(true);
const dialogVisible = ref(false);
const editingPlayer = ref<Player | null>(null);

// Methods
const loadPlayers = async () => {
  try {
    loading.value = true;
    const response = await api.get('/jugadores');
    players.value = response.data;
  } catch (error) {
    console.error('Error loading players:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los jugadores'
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

const showDialog = () => {
  editingPlayer.value = null;
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  editingPlayer.value = null;
};

const editPlayer = (player: Player) => {
  editingPlayer.value = player;
  dialogVisible.value = true;
};

const savePlayer = async (formData: Partial<Player>) => {
  try {
    if (editingPlayer.value) {
      await api.patch(`/jugadores/${editingPlayer.value.id}`, formData);
    } else {
      await api.post('/jugadores', formData);
    }
    
    await loadPlayers();
    closeDialog();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Jugador ${editingPlayer.value ? 'actualizado' : 'creado'} correctamente`
    });
  } catch (error) {
    console.error('Error saving player:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo ${editingPlayer.value ? 'actualizar' : 'crear'} el jugador`
    });
  }
};

const confirmDelete = (player: Player) => {
  confirm.require({
    message: '¿Está seguro de que desea eliminar este jugador?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deletePlayer(player.id)
  });
};

const deletePlayer = async (id: string) => {
  try {
    await api.delete(`/jugadores/${id}`);
    await loadPlayers();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Jugador eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting player:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el jugador'
    });
  }
};

onMounted(() => {
  loadPlayers();
  loadTeams();
});
</script>