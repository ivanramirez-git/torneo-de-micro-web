<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <!-- Header -->
    <AppHeader />

    <!-- Hero Section with Background Image -->
    <div class="relative bg-gradient-to-r from-blue-900/90 to-blue-800/90 text-white overflow-hidden">
      <!-- Background Image -->
      <div class="absolute inset-0 z-0">
        <img 
          src="/fotos/2024/final-mujeres-2024-1.png" 
          alt="Final Copa Navideña 2024" 
          class="w-full h-full object-cover opacity-30"
        />
      </div>
      
      <!-- Content -->
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            🎄 Copa Navideña Distrito Los Libertadores ⚽
          </h1>
          <p class="text-xl sm:text-2xl mb-4 text-blue-100 drop-shadow">
            Malvinas, Tame - Arauca
          </p>
          <p class="text-lg sm:text-xl max-w-3xl mx-auto text-blue-50 drop-shadow mb-8">
            Un espacio que reúne a nuestra comunidad en torno al deporte, la amistad y la alegría del fin de año
          </p>
          <button 
            @click="scrollToTournaments"
            class="inline-block bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg animate-pulse hover:bg-green-600 transition-colors cursor-pointer"
          >
            🏆 ¡Torneo 2025 en Curso!
          </button>
        </div>
      </div>
    </div>

    <!-- News Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">📰 Últimas Noticias</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <!-- News Card 1 - Torneo 2025 Iniciado -->
        <div class="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
          <img 
            src="/fotos/2025/reunion-inicial-torneo-2025-1.png" 
            alt="Reunión inicial Copa Navideña 2025" 
            class="w-full h-64 object-cover"
          />
          <div class="p-6">
            <div class="flex items-center text-sm text-gray-500 mb-2">
              <span>📅 Octubre 2025</span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">
              🎄⚽ Iniciamos la planificación de la Copa Navideña 2025
            </h3>
            <p class="text-gray-700 mb-4 leading-relaxed">
              Iniciamos la planificación de la Copa Navideña Distrito Libertadores 2025 en Malvinas 🏞. 
              Un espacio que cada año reúne a nuestra comunidad en torno al deporte, la amistad y la alegría del fin de año. 🙌✨
            </p>
            <p class="text-gray-700 mb-4 leading-relaxed">
              Auguramos muchos éxitos a los equipos y a los organizadores, e invitamos a toda la comunidad a participar 
              con entusiasmo y espíritu deportivo. ¡Que esta nueva edición de la #CopaNavideña sea ejemplo de unión y convivencia! 🥅🏆
            </p>
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-blue-600">#CopaNavideña #Malvinas #Tame</span>
              <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                ✅ En Curso
              </span>
            </div>
          </div>
        </div>

        <!-- News Card 2 - Final 2024 -->
        <div class="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
          <img 
            src="/fotos/2024/final-mujeres-2024-2.png" 
            alt="Final Torneo Femenino 2024" 
            class="w-full h-64 object-cover"
          />
          <div class="p-6">
            <div class="flex items-center text-sm text-gray-500 mb-2">
              <span>📅 Diciembre 2024</span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">
              #EnTerritorio 🫂⚽ Final de la Copa Navideña 2024
            </h3>
            <p class="text-gray-700 mb-4 leading-relaxed">
              Nos fuimos en familia a participar en la final de la Copa Navideña del Distrito Los Libertadores, 
              en el centro poblado Malvinas de Tame.
            </p>
            <p class="text-gray-700 mb-4 leading-relaxed">
              Un espacio en el que compartimos con la comunidad, demostrando que el deporte nos une y aleja a los 
              niños, niñas y jóvenes de la violencia. 🏆✨
            </p>
            <p class="text-gray-700 mb-4 leading-relaxed">
              ¡Felicitaciones a todos los equipos participantes por su dedicación y espíritu deportivo!
            </p>
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-blue-600">#EnTerritorio #DeporteQueUne</span>
              <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                Finalizado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <div class="text-xl text-gray-600">Cargando torneos...</div>
      </div>

      <!-- Tournaments List -->
      <div v-else class="mb-16" id="tournaments-section">
        <h2 class="text-3xl font-bold text-gray-900 mb-2 text-center">🏆 Torneos Disponibles</h2>
        <p class="text-center text-gray-600 mb-8">Selecciona un torneo para ver estadísticas, clasificaciones y resultados</p>
        
        <div v-if="tournaments.length === 0" class="text-center py-12">
          <p class="text-xl text-gray-600">No hay torneos disponibles en este momento</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <router-link
            v-for="tournament in tournaments"
            :key="tournament.id"
            :to="`/torneo/${tournament.id}`"
            class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1"
          >
            <div
              class="h-40 flex items-center justify-center text-white font-bold text-xl transition-transform duration-300 group-hover:scale-105"
              :style="{ backgroundColor: formatColor(tournament.color) }"
            >
              <span class="text-center px-4">{{ tournament.nombre }}</span>
            </div>
            <div class="p-4">
              <div class="flex items-center justify-center text-sm text-gray-600 mb-3">
                <span>📅 {{ formatDate(tournament.createdAt) }}</span>
              </div>
              <button
                class="w-full py-2 px-4 rounded-md text-white font-medium transition-all hover:opacity-90 hover:shadow-md"
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

      <!-- Community Impact Section -->
      <div class="mb-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 sm:p-12 text-white shadow-xl">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold mb-4">💙 El Deporte Nos Une</h2>
          <p class="text-xl text-blue-100 max-w-3xl mx-auto">
            La Copa Navideña es más que un torneo, es un espacio de convivencia que aleja a nuestros 
            niños, niñas y jóvenes de la violencia, promoviendo valores de amistad, respeto y comunidad.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div class="text-4xl mb-3">👨‍👩‍👧‍👦</div>
            <h3 class="text-xl font-bold mb-2">Comunidad Unida</h3>
            <p class="text-blue-100">Familias y vecinos juntos en cada partido</p>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div class="text-4xl mb-3">🎯</div>
            <h3 class="text-xl font-bold mb-2">Valores Deportivos</h3>
            <p class="text-blue-100">Respeto, disciplina y trabajo en equipo</p>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div class="text-4xl mb-3">🌟</div>
            <h3 class="text-xl font-bold mb-2">Futuro Prometedor</h3>
            <p class="text-blue-100">Oportunidades para nuestros jóvenes talentos</p>
          </div>
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

const scrollToTournaments = () => {
  const tournamentsSection = document.getElementById('tournaments-section');
  if (tournamentsSection) {
    tournamentsSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
};

onMounted(() => {
  loadTournaments();
});
</script>
