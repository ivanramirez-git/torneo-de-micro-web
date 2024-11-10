<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar for larger screens -->
    <aside class="hidden md:block w-64 bg-white shadow-md h-screen fixed">
      <div class="p-4">
        <h2 class="text-xl font-bold text-gray-800">Panel Admin</h2>
      </div>
      <nav class="mt-4 overflow-y-auto h-[calc(100vh-5rem)]">
        <div class="space-y-1">
          <!-- Torneos Section -->
          <div class="px-3 py-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Torneos
            </h3>
            <div class="space-y-1 mt-2">
              <router-link
                v-for="item in tournamentItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                :class="{ 'bg-blue-50 text-blue-600': isCurrentRoute(item.path) }"
              >
                <i :class="item.icon" class="mr-3"></i>
                {{ item.name }}
              </router-link>
            </div>
          </div>

          <!-- Equipos Section -->
          <div class="px-3 py-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Equipos
            </h3>
            <div class="space-y-1 mt-2">
              <router-link
                v-for="item in teamItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                :class="{ 'bg-blue-50 text-blue-600': isCurrentRoute(item.path) }"
              >
                <i :class="item.icon" class="mr-3"></i>
                {{ item.name }}
              </router-link>
            </div>
          </div>

          <!-- Partidos Section -->
          <div class="px-3 py-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Partidos
            </h3>
            <div class="space-y-1 mt-2">
              <router-link
                v-for="item in matchItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                :class="{ 'bg-blue-50 text-blue-600': isCurrentRoute(item.path) }"
              >
                <i :class="item.icon" class="mr-3"></i>
                {{ item.name }}
              </router-link>
            </div>
          </div>

          <!-- Configuración Section -->
          <div class="px-3 py-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Configuración
            </h3>
            <div class="space-y-1 mt-2">
              <router-link
                v-for="item in configItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                :class="{ 'bg-blue-50 text-blue-600': isCurrentRoute(item.path) }"
              >
                <i :class="item.icon" class="mr-3"></i>
                {{ item.name }}
              </router-link>
            </div>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Mobile drawer -->
    <div class="md:hidden">
      <div class="bg-white shadow-md p-4 flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-800">Panel Admin</h2>
        <button @click="showMobileMenu = !showMobileMenu" class="text-gray-500 hover:text-gray-700">
          <i class="pi pi-bars text-xl"></i>
        </button>
      </div>

      <div v-if="showMobileMenu" 
           class="fixed inset-0 bg-gray-600 bg-opacity-50 z-40"
           @click="showMobileMenu = false">
      </div>

      <div v-if="showMobileMenu"
           class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 overflow-y-auto"
           :class="{ 'translate-x-0': showMobileMenu, '-translate-x-full': !showMobileMenu }">
        <div class="p-4 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">Panel Admin</h2>
          <button @click="showMobileMenu = false" class="text-gray-500 hover:text-gray-700">
            <i class="pi pi-times text-xl"></i>
          </button>
        </div>
        
        <!-- Mobile Navigation -->
        <nav class="mt-4">
          <!-- Torneos Section -->
          <div class="px-3 py-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Torneos
            </h3>
            <div class="space-y-1 mt-2">
              <router-link
                v-for="item in tournamentItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                :class="{ 'bg-blue-50 text-blue-600': isCurrentRoute(item.path) }"
                @click="showMobileMenu = false"
              >
                <i :class="item.icon" class="mr-3"></i>
                {{ item.name }}
              </router-link>
            </div>
          </div>

          <!-- Equipos Section -->
          <div class="px-3 py-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Equipos
            </h3>
            <div class="space-y-1 mt-2">
              <router-link
                v-for="item in teamItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                :class="{ 'bg-blue-50 text-blue-600': isCurrentRoute(item.path) }"
                @click="showMobileMenu = false"
              >
                <i :class="item.icon" class="mr-3"></i>
                {{ item.name }}
              </router-link>
            </div>
          </div>

          <!-- Partidos Section -->
          <div class="px-3 py-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Partidos
            </h3>
            <div class="space-y-1 mt-2">
              <router-link
                v-for="item in matchItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                :class="{ 'bg-blue-50 text-blue-600': isCurrentRoute(item.path) }"
                @click="showMobileMenu = false"
              >
                <i :class="item.icon" class="mr-3"></i>
                {{ item.name }}
              </router-link>
            </div>
          </div>

          <!-- Configuración Section -->
          <div class="px-3 py-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Configuración
            </h3>
            <div class="space-y-1 mt-2">
              <router-link
                v-for="item in configItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                :class="{ 'bg-blue-50 text-blue-600': isCurrentRoute(item.path) }"
                @click="showMobileMenu = false"
              >
                <i :class="item.icon" class="mr-3"></i>
                {{ item.name }}
              </router-link>
            </div>
          </div>
        </nav>
      </div>
    </div>

    <!-- Main content -->
    <main class="md:ml-64 min-h-screen">
      <div class="p-6">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const showMobileMenu = ref(false);

// Tournament related items
const tournamentItems = [
  { 
    path: '/admin/tournaments',
    name: 'Torneos',
    icon: 'pi pi-trophy'
  },
  { 
    path: '/admin/tournament-phases',
    name: 'Fases de Torneo',
    icon: 'pi pi-sitemap'
  },
  { 
    path: '/admin/groups',
    name: 'Grupos',
    icon: 'pi pi-th-large'
  }
];

// Team related items
const teamItems = [
  { 
    path: '/admin/teams',
    name: 'Equipos',
    icon: 'pi pi-users'
  },
  { 
    path: '/admin/players',
    name: 'Jugadores',
    icon: 'pi pi-user'
  },
  { 
    path: '/admin/team-groups',
    name: 'Equipos en Grupos',
    icon: 'pi pi-table'
  }
];

// Match related items
const matchItems = [
  { 
    path: '/admin/matches',
    name: 'Partidos',
    icon: 'pi pi-calendar'
  },
  { 
    path: '/admin/match-stats',
    name: 'Estadísticas',
    icon: 'pi pi-chart-bar'
  },
  { 
    path: '/admin/time-requests',
    name: 'Solicitudes de Tiempo',
    icon: 'pi pi-clock'
  },
  { 
    path: '/admin/penalties',
    name: 'Penales',
    icon: 'pi pi-flag'
  }
];

// Configuration items
const configItems = [
  { 
    path: '/admin/venues',
    name: 'Lugares',
    icon: 'pi pi-map-marker'
  }
];

const isCurrentRoute = (path: string) => {
  return route.path === path;
};
</script>