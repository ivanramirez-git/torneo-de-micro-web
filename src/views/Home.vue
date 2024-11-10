<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center mb-8">Torneos de Fútbol</h1>
    <div v-if="loading" class="text-center">
      <p>Cargando torneos...</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="tournament in tournaments" :key="tournament.id"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h2 class="text-2xl font-bold mb-4" :style="{ color: tournament.color }">
          {{ tournament.nombre }}
        </h2>
        <div class="mt-4">
          <p class="text-gray-600">Creado: {{ new Date(tournament.createdAt).toLocaleDateString() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const tournaments = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await axios.get('https://api-micro.freeloz.com/torneos');
    tournaments.value = response.data;
  } catch (error) {
    console.error('Error fetching tournaments:', error);
  } finally {
    loading.value = false;
  }
});
</script>