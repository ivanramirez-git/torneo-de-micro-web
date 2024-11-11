<template>
    <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
                <img v-if="team?.escudoUrl" :src="team.escudoUrl" :alt="team.nombre" class="w-16 h-16 object-contain" />
                <div class="flex items-center gap-2">
                    <h2 class="text-2xl font-bold" :style="{ color: team?.color }">
                        {{ team?.nombre || 'Equipo' }}
                    </h2>
                    <Button icon="pi pi-clock" severity="secondary" @click="$emit('requestTime', team)"
                        :disabled="!isActive" tooltip="Solicitar tiempo" />
                </div>
            </div>
            <div class="text-4xl font-bold">
                {{ stats?.goles || 0 }}
            </div>
        </div>

        <table class="w-full">
            <thead>
                <tr class="text-left border-b">
                    <th class="py-2">No.</th>
                    <th>Nombre</th>
                    <th class="text-center">⚽</th>
                    <th class="text-center">🛑</th>
                    <th class="text-center">🟨</th>
                    <th class="text-center">🟥</th>
                    <th class="text-center">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="player in players" :key="player.id" class="border-b hover:bg-gray-50">
                    <td class="py-2">{{ player.numero }}</td>
                    <td>{{ player.nombre }}</td>
                    <td class="text-center">{{ getPlayerStats(player.id)?.goles || 0 }}</td>
                    <td class="text-center">{{ getPlayerStats(player.id)?.faltas || 0 }}</td>
                    <td class="text-center">{{ getPlayerStats(player.id)?.tarjetasAmarillas || 0 }}</td>
                    <td class="text-center">{{ getPlayerStats(player.id)?.tarjetasRojas || 0 }}</td>
                    <td class="text-center">
                        <div class="flex justify-center gap-1">
                            <Button icon="pi pi-star" severity="success" text rounded
                                @click="$emit('goal', { player, team })" :disabled="!isActive" tooltip="Marcar gol" />
                            <Button icon="pi pi-ban" severity="danger" text rounded
                                @click="$emit('foul', { player, team })" :disabled="!isActive" tooltip="Marcar falta" />
                            <Button icon="pi pi-ticket" severity="warning" text rounded
                                @click="$emit('card', { player, team })" :disabled="!isActive"
                                tooltip="Mostrar tarjeta" />
                            <Button icon="pi pi-eye" severity="info" text rounded @click="showPlayerStats(player)"
                                tooltip="Ver estadísticas" />
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Player Stats Dialog -->
        <Dialog v-model:visible="playerStatsDialog" :header="`Estadísticas de ${selectedPlayer?.nombre || ''}`" modal>
            <div class="space-y-4" v-if="selectedPlayer">
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 bg-gray-50 rounded">
                        <h4 class="font-semibold mb-2">Goles</h4>
                        <p class="text-2xl">{{ getPlayerStats(selectedPlayer.id)?.goles || 0 }}</p>
                    </div>
                    <div class="p-4 bg-gray-50 rounded">
                        <h4 class="font-semibold mb-2">Faltas</h4>
                        <p class="text-2xl">{{ getPlayerStats(selectedPlayer.id)?.faltas || 0 }}</p>
                    </div>
                    <div class="p-4 bg-gray-50 rounded">
                        <h4 class="font-semibold mb-2">Tarjetas Amarillas</h4>
                        <p class="text-2xl">{{ getPlayerStats(selectedPlayer.id)?.tarjetasAmarillas || 0 }}</p>
                    </div>
                    <div class="p-4 bg-gray-50 rounded">
                        <h4 class="font-semibold mb-2">Tarjetas Rojas</h4>
                        <p class="text-2xl">{{ getPlayerStats(selectedPlayer.id)?.tarjetasRojas || 0 }}</p>
                    </div>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Team, Player, MatchStatistics } from '../../interfaces';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

const props = defineProps<{
    team?: Team;
    players: Player[];
    stats?: MatchStatistics;
    playerStats: MatchStatistics[];
    isActive: boolean;
}>();

defineEmits<{
    (e: 'goal', data: { player: Player; team: Team }): void;
    (e: 'foul', data: { player: Player; team: Team }): void;
    (e: 'card', data: { player: Player; team: Team }): void;
    (e: 'requestTime', team: Team): void;
}>();

const playerStatsDialog = ref(false);
const selectedPlayer = ref<Player | null>(null);

const getPlayerStats = (playerId: string): MatchStatistics | undefined => {
    return props.playerStats.find(s => s.jugadorId === playerId);
};

const showPlayerStats = (player: Player) => {
    selectedPlayer.value = player;
    playerStatsDialog.value = true;
};
</script>