<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Match List -->
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gestión de Partidos</h1>
      </div>

      <!-- Date sections -->
      <div class="space-y-8">
        <!-- Today's Matches -->
        <div v-if="todayMatches.length > 0" class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Partidos de Hoy</h2>
          <div class="space-y-4">
            <MatchCard 
              v-for="match in todayMatches" 
              :key="match.id" 
              :match="match"
              :teams="teams"
              @click="goToMatch(match.id)"
            />
          </div>
        </div>

        <!-- Upcoming Matches -->
        <div v-if="upcomingMatches.length > 0" class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Próximos Partidos</h2>
          <div class="space-y-4">
            <MatchCard 
              v-for="match in upcomingMatches" 
              :key="match.id" 
              :match="match"
              :teams="teams"
              @click="goToMatch(match.id)"
            />
          </div>
        </div>

        <!-- Past Matches -->
        <div v-if="pastMatches.length > 0" class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Partidos Anteriores</h2>
          <div class="space-y-4">
            <MatchCard 
              v-for="match in pastMatches" 
              :key="match.id" 
              :match="match"
              :teams="teams"
              @click="goToMatch(match.id)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../stores/api';
import MatchCard from '../../components/matches/MatchCard.vue';

const router = useRouter();
const matches = ref([]);
const teams = ref([]);
const loading = ref(true);

// Computed properties for match sections
const todayMatches = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return matches.value.filter(match => {
    const matchDate = new Date(match.fechaProgramacion);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate.getTime() === today.getTime();
  });
});

const upcomingMatches = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return matches.value.filter(match => {
    const matchDate = new Date(match.fechaProgramacion);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate.getTime() > today.getTime();
  }).sort((a, b) => new Date(a.fechaProgramacion) - new Date(b.fechaProgramacion));
});

const pastMatches = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return matches.value.filter(match => {
    const matchDate = new Date(match.fechaProgramacion);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate.getTime() < today.getTime();
  }).sort((a, b) => new Date(b.fechaProgramacion) - new Date(a.fechaProgramacion));
});

// Methods
const loadMatches = async () => {
  try {
    const response = await api.get('/partidos', {
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

const goToMatch = (matchId: string) => {
  router.push(`/admin/match/${matchId}`);
};

onMounted(async () => {
  loading.value = true;
  await Promise.all([loadMatches(), loadTeams()]);
  loading.value = false;
});
</script>