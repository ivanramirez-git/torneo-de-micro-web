<template>
    <div class="border rounded-lg p-4 overflow-x-auto">
        <h4 class="font-medium mb-3">{{ groupName }}</h4>
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="text-left text-sm">
                        <th class="sticky left-0 bg-white pb-2 pl-4 sm:pl-0 w-12">Pos</th>
                        <th class="sticky left-12 bg-white pb-2 w-12 sm:w-auto">Equipo</th>
                        <th class="pb-2 text-center">Pts</th>
                        <th class="pb-2 text-center">Pts Disc.</th>
                        <th class="pb-2 text-center">DG</th>
                        <th class="pb-2 text-center">PJ</th>
                        <th class="pb-2 text-center">PG</th>
                        <th class="pb-2 text-center">PE</th>
                        <th class="pb-2 text-center">PP</th>
                        <th class="pb-2 text-center">GF</th>
                        <th class="pb-2 text-center">GC</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(stats, index) in standings" :key="stats.teamId" class="border-t">
                        <td class="sticky left-0 bg-white py-2 pl-4 sm:pl-0 font-bold text-gray-500 w-12">
                            {{ index + 1 }}
                        </td>
                        <td class="sticky left-12 bg-white py-2 w-12 sm:w-auto">
                            <div class="flex items-center">
                                <img v-if="getTeamCrest(stats.teamId)" :src="getTeamCrest(stats.teamId)"
                                    :alt="getTeamName(stats.teamId)" class="w-8 h-8 object-contain" />
                                <span class="hidden sm:inline ml-2 truncate max-w-xs">
                                    {{ getTeamName(stats.teamId) }}
                                </span>
                            </div>
                        </td>
                        <td class="py-2 text-center font-bold">{{ stats.points }}</td>
                        <td class="py-2 text-center">{{ stats.puntosDisciplinarios }}</td>
                        <td class="py-2 text-center">{{ stats.goalsFor - stats.goalsAgainst }}</td>
                        <td class="py-2 text-center">{{ stats.played }}</td>
                        <td class="py-2 text-center">{{ stats.won }}</td>
                        <td class="py-2 text-center">{{ stats.drawn }}</td>
                        <td class="py-2 text-center">{{ stats.lost }}</td>
                        <td class="py-2 text-center">{{ stats.goalsFor }}</td>
                        <td class="py-2 text-center">{{ stats.goalsAgainst }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
    standings: Array<any>;
    groupName: string;
    getTeamName: (teamId: string) => string;
    getTeamCrest: (teamId: string) => string;
}>();
</script>