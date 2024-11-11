<template>
  <div class="min-h-screen bg-gray-100">
    <nav v-if="!isLoginPage" class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <router-link to="/" class="flex items-center">
              <span class="text-xl font-bold">Copa navideña 🎄 2024</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Match Management Buttons -->
            <router-link to="/matches"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Tabla de Partidos
            </router-link>
            <router-link to="/matches/scoresheet"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Planillar Partidos
            </router-link>

            <!-- Admin Navigation -->
            <template v-if="authStore.isAuthenticated">
              <router-link to="/admin"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">
                Panel Admin
              </router-link>
              <button @click="logout" class="ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Cerrar Sesión
              </button>
            </template>
            <template v-else>
              <router-link to="/login" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Iniciar Sesión
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <router-view></router-view>
    </main>

    <footer class="bg-white shadow-lg mt-8">
      <div class="max-w-7xl mx-auto py-4 px-4">
        <p class="text-center text-gray-600">© 2024 Freeloz. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const route = useRoute();

const isLoginPage = computed(() => route.path === '/login');

const logout = () => {
  authStore.logout();
};
</script>