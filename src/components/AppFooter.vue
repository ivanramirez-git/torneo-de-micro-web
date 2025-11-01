<template>
  <footer class="bg-gray-800 text-white mt-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- About Section -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Copa Navideña 🎄</h3>
          <p class="text-gray-300 text-sm">
            Torneo de microfútbol en Tame, Arauca. Síguenos para mantenerte actualizado con los resultados, estadísticas y próximos partidos.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <router-link to="/" class="text-gray-300 hover:text-white transition-colors">
                Inicio
              </router-link>
            </li>
            <li>
              <router-link to="/matches" class="text-gray-300 hover:text-white transition-colors">
                Partidos
              </router-link>
            </li>
            <li>
              <router-link to="/login" class="text-gray-300 hover:text-white transition-colors">
                Admin
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Contacto</h3>
          <p class="text-gray-300 text-sm mb-2">
            📍 Tame, Arauca, Colombia
          </p>
          <p class="text-gray-300 text-sm">
            ⚽ Microfútbol en Tame
          </p>
        </div>
      </div>

      <div class="border-t border-gray-700 mt-8 pt-8 text-center">
        <p class="text-sm text-gray-400">
          © {{ currentYear }} Freeloz. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>
