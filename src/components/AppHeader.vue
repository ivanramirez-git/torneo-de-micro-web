<template>
  <nav class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-2">
            <span class="text-2xl">⚽</span>
            <span class="text-xl font-bold text-gray-900">Copa Navideña 🎄</span>
          </router-link>
        </div>
        <div class="flex items-center space-x-4">
          <router-link
            v-if="isAuthenticated"
            to="/admin"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
          >
            Panel Admin
          </router-link>
          <button
            v-if="isAuthenticated"
            @click="handleLogout"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Cerrar Sesión
          </button>
          <router-link
            v-else
            to="/login"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Iniciar Sesión
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>
