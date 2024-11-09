<template>
  <nav class="bg-gray-800 text-white p-4">
    <div class="container mx-auto flex justify-between items-center">
      <router-link to="/" class="text-xl font-bold">Tournament Manager</router-link>
      <div class="flex space-x-4">
        <router-link v-for="item in menuItems" :key="item.path" :to="item.path" 
          class="hover:text-gray-300 transition-colors">
          {{ item.name }}
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const menuItems = [
  { name: 'Tournaments', path: '/tournaments' },
  { name: 'Teams', path: '/teams' },
  { name: 'Players', path: '/players' },
  { name: 'Schedule', path: '/schedule' },
  { name: 'Groups', path: '/groups' },
  { name: 'Matches', path: '/matches' }
]
</script>