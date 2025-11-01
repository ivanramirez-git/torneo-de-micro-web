<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <!-- Header -->
    <AppHeader />

    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 sm:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
          ⚽ Bienvenidos a Copa Navideña 🎄
        </h1>
        <p class="text-xl sm:text-2xl mb-8 text-blue-100">
          Torneo de Microfútbol en Tame, Arauca
        </p>
        <p class="text-lg sm:text-xl max-w-3xl mx-auto text-blue-50">
          Consulta los resultados, estadísticas, clasificaciones y próximos partidos de tus equipos favoritos
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="text-xl text-gray-600">Cargando torneos...</div>
      </div>

      <!-- Tournaments List -->
      <div v-else>
        <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Torneos Disponibles</h2>
        
        <div v-if="tournaments.length === 0" class="text-center py-12">
          <p class="text-xl text-gray-600">No hay torneos disponibles en este momento</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <router-link
            v-for="tournament in tournaments"
            :key="tournament.id"
            :to="`/torneo/${tournament.id}`"
            class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
          >
            <div
              class="h-32 flex items-center justify-center text-white font-bold text-2xl transition-transform duration-300 group-hover:scale-105"
              :style="{ backgroundColor: formatColor(tournament.color) }"
            >
              {{ tournament.nombre }}
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>📅 {{ formatDate(tournament.createdAt) }}</span>
              </div>
              <button
                class="w-full py-2 px-4 rounded-md text-white font-medium transition-colors hover:opacity-90"
                :style="{
                  backgroundColor: formatColor(tournament.color)
                }"
              >
                Ver Torneo →
              </button>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Features Section -->
      <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white rounded-lg shadow-md p-6 text-center">
          <div class="text-4xl mb-4">📊</div>
          <h3 class="text-xl font-semibold mb-2">Estadísticas en Vivo</h3>
          <p class="text-gray-600">
            Consulta goleadores, asistencias, tarjetas y más estadísticas de cada torneo
          </p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6 text-center">
          <div class="text-4xl mb-4">🏆</div>
          <h3 class="text-xl font-semibold mb-2">Tablas de Posiciones</h3>
          <p class="text-gray-600">
            Sigue la clasificación de tu equipo favorito en tiempo real
          </p>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6 text-center">
          <div class="text-4xl mb-4">⚽</div>
          <h3 class="text-xl font-semibold mb-2">Resultados y Próximos Partidos</h3>
          <p class="text-gray-600">
            Mantente al día con todos los partidos jugados y por jugar
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import api from '../stores/api';
import { trackEvent } from '../utils/analytics';

// State
const tournaments = ref<any[]>([]);
const loading = ref(true);

// Data loading
const loadTournaments = async () => {
  try {
    loading.value = true;
    const response = await api.get('/torneos', {
      params: {
        filter: {
          order: 'createdAt DESC'
        }
      }
    });
    tournaments.value = response.data;
    
    // Track home page view
    trackEvent('home_page_loaded', {
      tournaments_count: tournaments.value.length
    });
  } catch (error) {
    console.error('Error loading tournaments:', error);
  } finally {
    loading.value = false;
  }
};

// Helper functions
const formatColor = (color: string): string => {
  if (!color) return '#000000';
  return color.startsWith('#') ? color : `#${color}`;
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

onMounted(() => {
  loadTournaments();
});
</script>
