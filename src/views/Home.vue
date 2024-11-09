<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">Tournament Management System</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <router-link v-for="item in menuItems" :key="item.path" :to="item.path"
        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 class="text-xl font-semibold mb-2">{{ item.name }}</h2>
        <p class="text-gray-600">{{ item.description }}</p>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
const menuItems = [
  {
    name: 'Tournaments',
    path: '/tournaments',
    description: 'Create and manage tournaments'
  },
  {
    name: 'Teams',
    path: '/teams',
    description: 'Manage teams and their information'
  },
  {
    name: 'Players',
    path: '/players',
    description: 'Handle player registrations and details'
  },
  {
    name: 'Schedule',
    path: '/schedule',
    description: 'View and manage tournament schedules'
  },
  {
    name: 'Groups',
    path: '/groups',
    description: 'Organize teams into groups'
  },
  {
    name: 'Matches',
    path: '/matches',
    description: 'Track match results and statistics'
  }
]
</script>