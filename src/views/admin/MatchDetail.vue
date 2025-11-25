<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Match Header -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-bold">
            {{ getTeamName(match?.equipoLocalId) }} vs {{ getTeamName(match?.equipoVisitanteId) }}
          </h1>
          <StatusBadge v-if="match" :match="match" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-gray-600">
              <i class="pi pi-calendar mr-2"></i>
              {{ match ? formatDate(match.fechaProgramacion) : '' }}
            </p>
            <p class="text-gray-600">
              <i class="pi pi-clock mr-2"></i>
              {{ match ? formatTime(match.horaProgramacion) : '' }}
            </p>
          </div>
          <div>
            <p class="text-gray-600">
              <i class="pi pi-map-marker mr-2"></i>
              {{ match?.lugar?.nombre || 'Lugar por definir' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Match Controls -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Control del Partido</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Time Controls -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium">Tiempos de Juego</h3>

            <!-- First Half -->
            <div class="flex items-center justify-between">
              <span>Primer Tiempo</span>
              <div class="space-x-2">
                <Button v-if="!match?.horaInicioPrimerTiempo" label="Iniciar" icon="pi pi-play"
                  @click="startFirstHalf" />
                <Button v-if="match?.horaInicioPrimerTiempo && !match?.horaFinPrimerTiempo" label="Finalizar"
                  icon="pi pi-stop" severity="danger" @click="endFirstHalf" />
              </div>
            </div>

            <!-- Second Half -->
            <div class="flex items-center justify-between">
              <span>Segundo Tiempo</span>
              <div class="space-x-2">
                <Button v-if="canStartSecondHalf" label="Iniciar" icon="pi pi-play" @click="startSecondHalf" />
                <Button v-if="match?.horaInicioSegundoTiempo && !match?.horaFinSegundoTiempo" label="Finalizar"
                  icon="pi pi-stop" severity="danger" @click="endSecondHalf" />
              </div>
            </div>

            <!-- Extra Time 1 -->
            <div v-if="showExtraTime" class="flex items-center justify-between">
              <span>Tiempo Extra 1</span>
              <div class="space-x-2">
                <Button v-if="canStartExtraTime1" label="Iniciar" icon="pi pi-play" @click="startExtraTime1" />
                <Button v-if="match?.horaInicioTiempoExtra1 && !match?.horaFinTiempoExtra1" label="Finalizar"
                  icon="pi pi-stop" severity="danger" @click="endExtraTime1" />
              </div>
            </div>

            <!-- Extra Time 2 -->
            <div v-if="showExtraTime" class="flex items-center justify-between">
              <span>Tiempo Extra 2</span>
              <div class="space-x-2">
                <Button v-if="canStartExtraTime2" label="Iniciar" icon="pi pi-play" @click="startExtraTime2" />
                <Button v-if="match?.horaInicioTiempoExtra2 && !match?.horaFinTiempoExtra2" label="Finalizar"
                  icon="pi pi-stop" severity="danger" @click="endExtraTime2" />
              </div>
            </div>

            <!-- Penalties -->
            <div v-if="showPenalties" class="flex items-center justify-between">
              <span>Penales</span>
              <div class="space-x-2">
                <Button v-if="canStartPenalties" label="Iniciar" icon="pi pi-play" @click="startPenalties" />
                <Button v-if="match?.horaInicioPenales && !match?.horaFinPenales" label="Finalizar" icon="pi pi-stop"
                  severity="danger" @click="endPenalties" />
              </div>
            </div>
          </div>

          <!-- Match Actions -->
          <div class="space-y-4">
            <h3 class="text-lg font-medium">Acciones</h3>

            <div class="space-y-2">
              <Button label="Solicitar Tiempo" icon="pi pi-clock" class="w-full" @click="requestTime"
                :disabled="!isMatchInProgress" />

              <Button label="Registrar Gol" icon="pi pi-star" class="w-full" @click="showGoalDialog"
                :disabled="!isMatchInProgress" />

              <Button label="Registrar Tarjeta" icon="pi pi-ticket" class="w-full" @click="showCardDialog"
                :disabled="!isMatchInProgress" />

              <Button v-if="showPenalties && match?.horaInicioPenales" label="Registrar Penal" icon="pi pi-flag"
                class="w-full" @click="showPenaltyDialog" />
            </div>
          </div>

          <!-- Sanctions -->
          <div v-if="match" class="col-span-1 md:col-span-2 border-t pt-4 mt-2">
            <h3 class="text-lg font-medium text-red-600 mb-3">Sanciones</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center p-3 bg-red-50 rounded-lg border border-red-100">
                <Checkbox v-model="match.equipoLocalSancionado" :binary="true" @change="updateSanctions" inputId="sanction-local" />
                <label for="sanction-local" class="ml-2 cursor-pointer select-none">
                  Sancionar a <span class="font-semibold">{{ getTeamName(match?.equipoLocalId) }}</span>
                  <span class="block text-xs text-gray-500 mt-1">No sumará puntos en este partido</span>
                </label>
              </div>
              <div class="flex items-center p-3 bg-red-50 rounded-lg border border-red-100">
                <Checkbox v-model="match.equipoVisitanteSancionado" :binary="true" @change="updateSanctions" inputId="sanction-visitor" />
                <label for="sanction-visitor" class="ml-2 cursor-pointer select-none">
                  Sancionar a <span class="font-semibold">{{ getTeamName(match?.equipoVisitanteId) }}</span>
                  <span class="block text-xs text-gray-500 mt-1">No sumará puntos en este partido</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Match Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Team A Stats -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">{{ getTeamName(match?.equipoLocalId) }}</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span>Goles</span>
              <span class="text-2xl font-bold">{{ getTeamStats(match?.equipoLocalId)?.goles || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Faltas</span>
              <span>{{ getTeamStats(match?.equipoLocalId)?.faltas || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Tarjetas Amarillas</span>
              <span>{{ getTeamStats(match?.equipoLocalId)?.tarjetasAmarillas || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Tarjetas Azules</span>
              <span>{{ getTeamStats(match?.equipoLocalId)?.tarjetasAzules || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Tarjetas Rojas</span>
              <span>{{ getTeamStats(match?.equipoLocalId)?.tarjetasRojas || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Team B Stats -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">{{ getTeamName(match?.equipoVisitanteId) }}</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span>Goles</span>
              <span class="text-2xl font-bold">{{ getTeamStats(match?.equipoVisitanteId)?.goles || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Faltas</span>
              <span>{{ getTeamStats(match?.equipoVisitanteId)?.faltas || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Tarjetas Amarillas</span>
              <span>{{ getTeamStats(match?.equipoVisitanteId)?.tarjetasAmarillas || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Tarjetas Azules</span>
              <span>{{ getTeamStats(match?.equipoVisitanteId)?.tarjetasAzules || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Tarjetas Rojas</span>
              <span>{{ getTeamStats(match?.equipoVisitanteId)?.tarjetasRojas || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <Dialog v-model:visible="timeRequestDialog" header="Solicitud de Tiempo" modal>
      <div class="space-y-4">
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Periodo</label>
          <InputNumber v-model="timeRequestForm.periodo" :min="1" :max="4" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="timeRequestDialog = false" class="p-button-text" />
        <Button label="Guardar" icon="pi pi-check" @click="saveTimeRequest" autofocus />
      </template>
    </Dialog>

    <Dialog v-model:visible="goalDialog" header="Registrar Gol" modal>
      <div class="space-y-4">
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Equipo</label>
          <Dropdown v-model="goalForm.teamId" :options="[
            { id: match?.equipoLocalId, name: getTeamName(match?.equipoLocalId) },
            { id: match?.equipoVisitanteId, name: getTeamName(match?.equipoVisitanteId) }
          ]" optionLabel="name" optionValue="id" placeholder="Seleccione un equipo" class="w-full" />
        </div>
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Jugador</label>
          <Dropdown v-model="goalForm.playerId" :options="getTeamPlayers(goalForm.teamId)" optionLabel="nombre"
            optionValue="id" placeholder="Seleccione un jugador" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="goalDialog = false" class="p-button-text" />
        <Button label="Guardar" icon="pi pi-check" @click="saveGoal" autofocus />
      </template>
    </Dialog>

    <Dialog v-model:visible="cardDialog" header="Registrar Tarjeta" modal>
      <div class="space-y-4">
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Equipo</label>
          <Dropdown v-model="cardForm.teamId" :options="[
            { id: match?.equipoLocalId, name: getTeamName(match?.equipoLocalId) },
            { id: match?.equipoVisitanteId, name: getTeamName(match?.equipoVisitanteId) }
          ]" optionLabel="name" optionValue="id" placeholder="Seleccione un equipo" class="w-full" />
        </div>
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Jugador</label>
          <Dropdown v-model="cardForm.playerId" :options="getTeamPlayers(cardForm.teamId)" optionLabel="nombre"
            optionValue="id" placeholder="Seleccione un jugador" class="w-full" />
        </div>
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Tipo de Tarjeta</label>
          <Dropdown v-model="cardForm.type" :options="[
            { value: 'yellow', label: 'Amarilla' },
            { value: 'blue', label: 'Azul' },
            { value: 'red', label: 'Roja' }
          ]" optionLabel="label" optionValue="value" placeholder="Seleccione el tipo" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="cardDialog = false" class="p-button-text" />
        <Button label="Guardar" icon="pi pi-check" @click="saveCard" autofocus />
      </template>
    </Dialog>

    <Dialog v-model:visible="penaltyDialog" header="Registrar Penal" modal>
      <div class="space-y-4">
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Equipo</label>
          <Dropdown v-model="penaltyForm.teamId" :options="[
            { id: match?.equipoLocalId, name: getTeamName(match?.equipoLocalId) },
            { id: match?.equipoVisitanteId, name: getTeamName(match?.equipoVisitanteId) }
          ]" optionLabel="name" optionValue="id" placeholder="Seleccione un equipo" class="w-full" />
        </div>
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Jugador</label>
          <Dropdown v-model="penaltyForm.playerId" :options="getTeamPlayers(penaltyForm.teamId)" optionLabel="nombre"
            optionValue="id" placeholder="Seleccione un jugador" class="w-full" />
        </div>
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Resultado</label>
          <div class="flex gap-4">
            <div class="flex items-center">
              <RadioButton v-model="penaltyForm.gol" :value="true" inputId="gol-si" />
              <label for="gol-si" class="ml-2">Gol</label>
            </div>
            <div class="flex items-center">
              <RadioButton v-model="penaltyForm.gol" :value="false" inputId="gol-no" />
              <label for="gol-no" class="ml-2">Fallado</label>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" @click="penaltyDialog = false" class="p-button-text" />
        <Button label="Guardar" icon="pi pi-check" @click="savePenalty" autofocus />
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import api from '../../stores/api';
import StatusBadge from '../../components/matches/StatusBadge.vue';

// Components
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import RadioButton from 'primevue/radiobutton';
import Toast from 'primevue/toast';

const route = useRoute();
const toast = useToast();

// State
const match = ref(null);
const teams = ref([]);
const players = ref([]);
const loading = ref(true);

// Dialog states
const timeRequestDialog = ref(false);
const goalDialog = ref(false);
const cardDialog = ref(false);
const penaltyDialog = ref(false);

// Form states
const timeRequestForm = ref({
  periodo: 1
});

const goalForm = ref({
  teamId: '',
  playerId: ''
});

const cardForm = ref({
  teamId: '',
  playerId: '',
  type: ''
});

const penaltyForm = ref({
  teamId: '',
  playerId: '',
  gol: true
});

// Computed properties
const isMatchInProgress = computed(() => {
  return match.value?.horaInicioPrimerTiempo && !match.value?.horaFinPartido;
});

const canStartSecondHalf = computed(() => {
  return match.value?.horaFinPrimerTiempo && !match.value?.horaInicioSegundoTiempo;
});

const showExtraTime = computed(() => {
  return !match.value?.permiteEmpates;
});

const canStartExtraTime1 = computed(() => {
  return match.value?.horaFinSegundoTiempo && !match.value?.horaInicioTiempoExtra1;
});

const canStartExtraTime2 = computed(() => {
  return match.value?.horaFinTiempoExtra1 && !match.value?.horaInicioTiempoExtra2;
});

const showPenalties = computed(() => {
  return !match.value?.permiteEmpates;
});

const canStartPenalties = computed(() => {
  if (match.value?.horaFinSegundoTiempo) {
    if (showExtraTime.value) {
      return match.value?.horaFinTiempoExtra2 && !match.value?.horaInicioPenales;
    }
    return !match.value?.horaInicioPenales;
  }
  return false;
});

// Methods
const loadMatch = async () => {
  try {
    const response = await api.get(`/partidos/${route.params.id}`, {
      params: {
        filter: {
          include: [
            'grupo',
            'lugar',
            'estadisticasPartido',
            'solicitudesTiempo',
            'penales'
          ]
        }
      }
    });
    match.value = response.data;

    if (match.value?.grupo?.faseTorneoId) {
      try {
        const faseResponse = await api.get(`/fase-torneos/${match.value.grupo.faseTorneoId}`);
        match.value.grupo.faseTorneo = faseResponse.data;
      } catch (error) {
        console.error('Error loading tournament phase:', error);
      }
    }
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
      api.get(`/equip os/${match.value?.equipoLocalId}/jugadores`),
      api.get(`/equipos/${match.value?.equipoVisitanteId}/jugadores`)
    ]);
    players.value = [...localTeamPlayers.data, ...visitorTeamPlayers.data];
  } catch (error) {
    console.error('Error loading players:', error);
  }
};

const getTeamName = (teamId: string) => {
  const team = teams.value.find(t => t.id === teamId);
  return team ? team.nombre : 'Equipo no encontrado';
};

const getTeamPlayers = (teamId: string) => {
  return players.value.filter(p => p.equipoId === teamId);
};

const getTeamStats = (teamId: string) => {
  return match.value?.estadisticasPartido?.find(s => s.equipoId === teamId);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const formatTime = (time: string) => {
  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Match control methods
const startFirstHalf = async () => {
  try {
    await api.patch(`/partidos/${match.value.id}`, {
      horaInicioPrimerTiempo: new Date()
    });
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Primer tiempo iniciado'
    });
  } catch (error) {
    console.error('Error starting first half:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo iniciar el primer tiempo'
    });
  }
};

const endFirstHalf = async () => {
  try {
    await api.patch(`/partidos/${match.value.id}`, {
      horaFinPrimerTiempo: new Date()
    });
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Primer tiempo finalizado'
    });
  } catch (error) {
    console.error('Error ending first half:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo finalizar el primer tiempo'
    });
  }
};

const startSecondHalf = async () => {
  try {
    await api.patch(`/partidos/${match.value.id}`, {
      horaInicioSegundoTiempo: new Date()
    });
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Segundo tiempo iniciado'
    });
  } catch (error) {
    console.error('Error starting second half:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo iniciar el segundo tiempo'
    });
  }
};

const endSecondHalf = async () => {
  try {
    const updates: any = {
      horaFinSegundoTiempo: new Date()
    };

    // If match allows ties and scores are equal, end the match
    if (match.value.permiteEmpates) {
      const localStats = getTeamStats(match.value.equipoLocalId);
      const visitorStats = getTeamStats(match.value.equipoVisitanteId);

      if (localStats?.goles === visitorStats?.goles) {
        updates.horaFinPartido = new Date();
      }
    }

    await api.patch(`/partidos/${match.value.id}`, updates);
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Segundo tiempo finalizado'
    });
  } catch (error) {
    console.error('Error ending second half:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo finalizar el segundo tiempo'
    });
  }
};

const startExtraTime1 = async () => {
  try {
    await api.patch(`/partidos/${match.value.id}`, {
      horaInicioTiempoExtra1: new Date()
    });
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Primer tiempo extra iniciado'
    });
  } catch (error) {
    console.error('Error starting extra time 1:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo iniciar el primer tiempo extra'
    });
  }
};

const endExtraTime1 = async () => {
  try {
    await api.patch(`/partidos/${match.value.id}`, {
      horaFinTiempoExtra1: new Date()
    });
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Primer tiempo extra finalizado'
    });
  } catch (error) {
    console.error('Error ending extra time 1:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo finalizar el primer tiempo extra'
    });
  }
};

const startExtraTime2 = async () => {
  try {
    await api.patch(`/partidos/${match.value.id}`, {
      horaInicioTiempoExtra2: new Date()
    });
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Segundo tiempo extra iniciado'
    });
  } catch (error) {
    console.error('Error starting extra time 2:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo iniciar el segundo tiempo extra'
    });
  }
};

const endExtraTime2 = async () => {
  try {
    await api.patch(`/partidos/${match.value.id}`, {
      horaFinTiempoExtra2: new Date()
    });
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Segundo tiempo extra finalizado'
    });
  } catch (error) {
    console.error('Error ending extra time 2:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo finalizar el segundo tiempo extra'
    });
  }
};

const startPenalties = async () => {
  try {
    await api.patch(`/partidos/${match.value.id}`, {
      horaInicioPenales: new Date()
    });
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Penales iniciados'
    });
  } catch (error) {
    console.error('Error starting penalties:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron iniciar los penales'
    });
  }
};

const endPenalties = async () => {
  try {
    await api.patch(`/partidos/${match.value.id}`, {
      horaFinPenales: new Date(),
      horaFinPartido: new Date()
    });
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Penales finalizados'
    });
  } catch (error) {
    console.error('Error ending penalties:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron finalizar los penales'
    });
  }
};

// Match actions
const requestTime = () => {
  timeRequestDialog.value = true;
};

const saveTimeRequest = async () => {
  try {
    await api.post(`/partidos/${match.value.id}/solicitud-tiempos`, {
      periodo: timeRequestForm.value.periodo,
      minuto: new Date()
    });
    timeRequestDialog.value = false;
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Solicitud de tiempo registrada'
    });
  } catch (error) {
    console.error('Error saving time request:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo registrar la solicitud de tiempo'
    });
  }
};

const showGoalDialog = () => {
  goalForm.value = {
    teamId: '',
    playerId: ''
  };
  goalDialog.value = true;
};

const saveGoal = async () => {

  try {
    await api.post(`/partidos/${match.value.id}/estadistica-partidos`, {
      equipoId: goalForm.value.teamId,
      jugadorId: goalForm.value.playerId,
      goles: 1
    });
    goalDialog.value = false;
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Gol registrado'
    });
  } catch (error) {
    console.error('Error saving goal:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo registrar el gol'
    });
  }
};

const showCardDialog = () => {
  cardForm.value = {
    teamId: '',
    playerId: '',
    type: ''
  };
  cardDialog.value = true;
};

const saveCard = async () => {
  try {
    const update: any = {
      equipoId: cardForm.value.teamId,
      jugadorId: cardForm.value.playerId
    };

    switch (cardForm.value.type) {
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
    console.error('Error saving card:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo registrar la tarjeta'
    });
  }
};

const showPenaltyDialog = () => {
  penaltyForm.value = {
    teamId: '',
    playerId: '',
    gol: true
  };
  penaltyDialog.value = true;
};

const savePenalty = async () => {
  try {
    await api.post(`/partidos/${match.value.id}/penals`, {
      equipoId: penaltyForm.value.teamId,
      jugadorId: penaltyForm.value.playerId,
      gol: penaltyForm.value.gol
    });

    if (penaltyForm.value.gol) {
      await api.post(`/partidos/${match.value.id}/estadistica-partidos`, {
        equipoId: penaltyForm.value.teamId,
        jugadorId: penaltyForm.value.playerId,
        goles: 1
      });
    }

    penaltyDialog.value = false;
    await loadMatch();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Penal registrado'
    });
  } catch (error) {
    console.error('Error saving penalty:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo registrar el penal'
    });
  }
};

const updateSanctions = async () => {
  if (!match.value) return;
  try {
    await api.patch(`/partidos/${match.value.id}`, {
      equipoLocalSancionado: match.value.equipoLocalSancionado,
      equipoVisitanteSancionado: match.value.equipoVisitanteSancionado
    });
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Sanciones actualizadas'
    });
  } catch (error) {
    console.error('Error updating sanctions:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron actualizar las sanciones'
    });
    await loadMatch();
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