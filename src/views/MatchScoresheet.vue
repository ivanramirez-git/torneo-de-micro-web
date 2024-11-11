<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto py-6 px-4">
      <!-- Header -->
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold">Planilla Oficial de Juego</h1>
        <div class="mt-4 flex items-center justify-center gap-4">
          <Button v-if="!match?.horaFinPartido" label="Finalizar Partido" severity="danger" @click="endMatch" />
          <div class="text-xl">
            Tiempo: {{ getCurrentPeriod }} - {{ formatMatchTime }}
          </div>
        </div>
      </div>

      <!-- Teams -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Local Team -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <img :src="getTeam(match?.equipoLocalId)?.escudoUrl" :alt="getTeam(match?.equipoLocalId)?.nombre"
                class="w-16 h-16 object-contain" />
              <h2 class="text-2xl font-bold" :style="{ color: getTeam(match?.equipoLocalId)?.color }">
                {{ getTeam(match?.equipoLocalId)?.nombre }}
              </h2>
            </div>
            <div class="text-4xl font-bold">
              {{ getTeamStats(match?.equipoLocalId)?.goles || 0 }}
            </div>
          </div>

          <!-- Players Table -->
          <table class="w-full">
            <thead>
              <tr class="text-left border-b">
                <th class="py-2">No.</th>
                <th>Nombre</th>
                <th class="text-center">Goles</th>
                <th class="text-center">Faltas</th>
                <th class="text-center">Amarillas</th>
                <th class="text-center">Rojas</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="player in getTeamPlayers(match?.equipoLocalId)" :key="player.id" class="border-b">
                <td class="py-2">{{ player.numero }}</td>
                <td>{{ player.nombre }}</td>
                <td class="text-center">{{ getPlayerStats(player.id)?.goles || 0 }}</td>
                <td class="text-center">{{ getPlayerStats(player.id)?.faltas || 0 }}</td>
                <td class="text-center">{{ getPlayerStats(player.id)?.tarjetasAmarillas || 0 }}</td>
                <td class="text-center">{{ getPlayerStats(player.id)?.tarjetasRojas || 0 }}</td>
                <td>
                  <div class="flex justify-center gap-1">
                    <Button icon="pi pi-star" severity="success" text rounded @click="addGoal(player)"
                      :disabled="!isMatchActive" />
                    <Button icon="pi pi-ban" severity="danger" text rounded @click="addFoul(player)"
                      :disabled="!isMatchActive" />
                    <Button icon="pi pi-ticket" severity="warning" text rounded @click="showCardDialog(player)"
                      :disabled="!isMatchActive" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Visitor Team -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <img :src="getTeam(match?.equipoVisitanteId)?.escudoUrl" :alt="getTeam(match?.equipoVisitanteId)?.nombre"
                class="w-16 h-16 object-contain" />
              <h2 class="text-2xl font-bold" :style="{ color: getTeam(match?.equipoVisitanteId)?.color }">
                {{ getTeam(match?.equipoVisitanteId)?.nombre }}
              </h2>
            </div>
            <div class="text-4xl font-bold">
              {{ getTeamStats(match?.equipoVisitanteId)?.goles || 0 }}
            </div>
          </div>

          <!-- Players Table -->
          <table class="w-full">
            <thead>
              <tr class="text-left border-b">
                <th class="py-2">No.</th>
                <th>Nombre</th>
                <th class="text-center">Goles</th>
                <th class="text-center">Faltas</th>
                <th class="text-center">Amarillas</th>
                <th class="text-center">Rojas</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="player in getTeamPlayers(match?.equipoVisitanteId)" :key="player.id" class="border-b">
                <td class="py-2">{{ player.numero }}</td>
                <td>{{ player.nombre }}</td>
                <td class="text-center">{{ getPlayerStats(player.id)?.goles || 0 }}</td>
                <td class="text-center">{{ getPlayerStats(player.id)?.faltas || 0 }}</td>
                <td class="text-center">{{ getPlayerStats(player.id)?.tarjetasAmarillas || 0 }}</td>
                <td class="text-center">{{ getPlayerStats(player.id)?.tarjetasRojas || 0 }}</td>
                <td>
                  <div class="flex justify-center gap-1">
                    <Button icon="pi pi-star" severity="success" text rounded @click="addGoal(player)"
                      :disabled="!isMatchActive" />
                    <Button icon="pi pi-ban" severity="danger" text rounded @click="addFoul(player)"
                      :disabled="!isMatchActive" />
                    <Button icon="pi pi-ticket" severity="warning" text rounded @click="showCardDialog(player)"
                      :disabled="!isMatchActive" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Match Summary -->
      <div class="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h3 class="text-xl font-bold mb-4">Resumen del Partido</h3>
        <div class="text-center text-2xl font-bold">
          {{ getTeam(match?.equipoLocalId)?.nombre }} {{ getTeamStats(match?.equipoLocalId)?.goles || 0 }} -
          {{ getTeamStats(match?.equipoVisitanteId)?.goles || 0 }} {{ getTeam(match?.equipoVisitanteId)?.nombre }}
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <Dialog v-model:visible="cardDialog" header="Asignar Tarjeta" modal>
      <div class="space-y-4">
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Tipo de Tarjeta</label>
          <div class="mt-2 space-x-4">
            <Button label="Amarilla" severity="warning" @click="assignCard('yellow')" />
            <Button label="Azul" severity="info" @click="assignCard('blue')" />
            <Button label="Roja" severity="danger" @click="assignCard('red')" />
          </div>
        </div>
      </div>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import api from '../stores/api';

// Components
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';

const route = useRoute();
const toast = useToast();

// State
const match = ref(null);
const teams = ref([]);
const players = ref([]);
const playerStats = ref([]);
const loading = ref(true);
const cardDialog = ref(false);
const selectedPlayer = ref(null);

// Computed
const isMatchActive = computed(() => {
  return match.value?.horaInicioPrimerTiempo && !match.value?.horaFinPartido;
});

const getCurrentPeriod = computed(() => {
  if (!match.value) return '';

  if (match.value.horaInicioPenales) return 'Penales';
  if (match.value.horaInicioTiempoExtra2) return 'T.Extra 2';
  if (match.value.horaInicioTiempoExtra1) return 'T.Extra 1';
  if (match.value.horaInicioSegundoTiempo) return '2/2';
  if (match.value.horaInicioPrimerTiempo) return '1/2';

  return 'No iniciado';
});

const formatMatchTime = computed(() => {
  // Implementation of match time formatting
  return '00:00';
});

// Methods
const loadMatch = async () => {
  try {
    const response = await api.get(`/partidos/${route.params.id}`, {
      params: {
        filter: {
          include: [
            'lugar',
            'estadisticasPartido',
            'solicitudesTiempo',
            'penales'
          ]
        }
      }
    });
    match.value = response.data;
  } catch (error) {
    console.error('Error loading match:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cargar el partido'
    });
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

const loadPlayers = async () => {
  try {
    const [localTeamPlayers, visitorTeamPlayers] = await Promise.all([
      api.get(`/equipos/${match.value?.equipoLocalId}/jugadores`),
      api.get(`/equipos/${match.value?.equipoVisitanteId}/jugadores`)
    ]);
    players.value = [...localTeamPlayers.data, ...visitorTeamPlayers.data];
  } catch (error) {
    console.error('Error loading players:', error);
  }
};

const getTeam = (teamId: string) => {
  return teams.value.find(t => t.id === teamId);
};

const getTeamPlayers = (teamId: string) => {
  return players.value.filter(p => p.equipoId === teamId);
};

const getTeamStats = (teamId: string) => {
  return match.value?.estadisticasPartido?.find(s => s.equipoId === teamId);
};

const getPlayerStats = (playerId: string) => {
  return playerStats.value.find(s => s.jugadorId === playerId);
};

const addGoal = async (player) => {
  console.log('Adding goal 1:', player);
  try {
    await api.post(`/partidos/${match.value.id}/estadistica-partidos`, {
      equipoId: player.equipoId,
      jugadorId: player.id,
      goles: 1
    });
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Gol registrado'
    });
  } catch (error) {
    console.error('Error adding goal:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo registrar el gol'
    });
  }
};

const addFoul = async (player) => {
  try {
    await api.post(`/partidos/${match.value.id}/estadistica-partidos`, {
      equipoId: player.equipoId,
      jugadorId: player.id,
      faltas: 1
    });
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Falta registrada'
    });
  } catch (error) {
    console.error('Error adding foul:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo registrar la falta'
    });
  }
};

const showCardDialog = (player) => {
  selectedPlayer.value = player;
  cardDialog.value = true;
};

const assignCard = async (type: 'yellow' | 'blue' | 'red') => {
  try {
    const update: any = {
      equipoId: selectedPlayer.value.equipoId,
      jugadorId: selectedPlayer.value.id
    };

    switch (type) {
      case 'yellow':
        update.tarjetasAmarillas = 1;
        break;
      case 'blue':
        update.tarjetasAzules = 1;
        break;
      case 'red':
        update.tarjetasRojas = 1;
        break;
    }

    await api.post(`/partidos/${match.value.id}/estadistica-partidos`, update);
    cardDialog.value = false;
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Tarjeta registrada'
    });
  } catch (error) {
    console.error('Error assigning card:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo registrar la tarjeta'
    });
  }
};

const endMatch = async () => {
  try {
    await api.patch(`/partidos/${match.value.id}`, {
      horaFinPartido: new Date()
    });
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Partido finalizado'
    });
  } catch (error) {
    console.error('Error ending match:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo finalizar el partido'
    });
  }
};

onMounted(async () => {
  loading.value = true;
  await Promise.all([loadMatch(), loadTeams()]);
  if (match.value) {
    await loadPlayers();
  }
  loading.value = false;
});
</script>