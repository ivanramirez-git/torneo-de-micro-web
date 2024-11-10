<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto py-6 px-4">
      <h1 class="text-3xl font-bold mb-8">Tabla de Partidos</h1>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Torneo</label>
            <Dropdown
              v-model="selectedTournament"
              :options="tournaments"
              optionLabel="nombre"
              placeholder="Seleccionar torneo"
              class="w-full"
              @change="loadPhases"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fase</label>
            <Dropdown
              v-model="selectedPhase"
              :options="phases"
              optionLabel="nombre"
              placeholder="Seleccionar fase"
              class="w-full"
              @change="loadGroups"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
            <Dropdown
              v-model="selectedGroup"
              :options="groups"
              optionLabel="nombre"
              placeholder="Seleccionar grupo"
              class="w-full"
              @change="loadMatches"
            />
          </div>
        </div>
      </div>

      <!-- Match Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Local
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resultado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visitante
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lugar
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="match in matches" :key="match.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(match.fechaProgramacion) }}
                <br>
                {{ formatTime(match.horaProgramacion) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img 
                    :src="getTeam(match.equipoLocalId)?.escudoUrl" 
                    :alt="getTeam(match.equipoLocalId)?.nombre"
                    class="w-8 h-8 object-contain mr-2"
                  />
                  <span :style="{ color: getTeam(match.equipoLocalId)?.color }">
                    {{ getTeam(match.equipoLocalId)?.nombre }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center font-bold">
                {{ getTeamStats(match.equipoLocalId, match)?.goles || 0 }} - 
                {{ getTeamStats(match.equipoVisitanteId, match)?.goles || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img 
                    :src="getTeam(match.equipoVisitanteId)?.escudoUrl" 
                    :alt="getTeam(match.equipoVisitanteId)?.nombre"
                    class="w-8 h-8 object-contain mr-2"
                  />
                  <span :style="{ color: getTeam(match.equipoVisitanteId)?.color }">
                    {{ getTeam(match.equipoVisitanteId)?.nombre }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ match.lugar?.nombre }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <StatusBadge :match="match" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../stores/api';
import StatusBadge from '../../components/matches/StatusBadge.vue';
import Dropdown from 'primevue/dropdown';

// State
const tournaments = ref([]);
const phases = ref([]);
const groups = ref([]);
const matches = ref([]);
const teams = ref([]);

const selectedTournament = ref(null);
const selectedPhase = ref(null);
const selectedGroup = ref(null);

// Methods
const loadTournaments = async () => {
  try {
    const response = await api.get('/torneos');
    tournaments.value = response.data;
  } catch (error) {
    console.error('Error loading tournaments:', error);
  }
};

const loadPhases = async () => {
  if (!selectedTournament.value) return;
  
  try {
    const response = await api.get(`/torneos/${selectedTournament.value.id}/fase-torneos`);
    phases.value = response.data;
    selectedPhase.value = null;
    selectedGroup.value = null;
    groups.value = [];
    matches.value = [];
  } catch (error) {
    console.error('Error loading phases:', error);
  }
};

const loadGroups = async () => {
  if (!selectedPhase.value) return;
  
  try {
    const response = await api.get(`/fase-torneos/${selectedPhase.value.id}/grupos`);
    groups.value = response.data;
    selectedGroup.value = null;
    matches.value = [];
  } catch (error) {
    console.error('Error loading groups:', error);
  }
};

const loadMatches = async () => {
  if (!selectedGroup.value) return;
  
  try {
    const response = await api.get(`/grupos/${selectedGroup.value.id}/partidos`, {
      params: {
        filter: {
          include: [
            'lugar',
            'estadisticasPartido'
          ]
        }
      }
    });
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

const getTeam = (teamId: string) => {
  return teams.value.find(t => t.id === teamId);
};

const getTeamStats = (teamId: string, match: any) => {
  return match.estadisticasPartido?.find(s => s.equipoId === teamId);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const formatTime = (time: string) => {
  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(async () => {
  await Promise.all([loadTournaments(), loadTeams()]);
});
</script>