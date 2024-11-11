<template>
    <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
                <img v-if="team?.escudoUrl" :src="team.escudoUrl" :alt="team.nombre" class="w-16 h-16 object-contain" />
                <div>
                    <h2 class="text-2xl font-bold" :style="{ color: team?.color }">
                        {{ team?.nombre || 'Equipo' }}
                    </h2>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-sm text-gray-500">
                            Tiempos solicitados: {{ timeRequests.length }}/2
                        </span>
                        <button v-if="timeRequests.length < 2 && isActive"
                            class="text-sm text-blue-600 hover:text-blue-800" @click="$emit('requestTime', team)">
                            Solicitar tiempo
                        </button>
                    </div>
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
                    <th class="text-center">🟦</th>
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
                    <td class="text-center">{{ getPlayerStats(player.id)?.tarjetasAzules || 0 }}</td>
                    <td class="text-center">{{ getPlayerStats(player.id)?.tarjetasRojas || 0 }}</td>
                    <td>
                        <div class="flex justify-center gap-1">
                            <button class="p-1 rounded hover:bg-gray-100" @click="$emit('goal', { player, team })"
                                :disabled="!isActive" title="Marcar gol">
                                ⚽
                            </button>
                            <button class="p-1 rounded hover:bg-gray-100" @click="$emit('foul', { player, team })"
                                :disabled="!isActive" title="Marcar falta">
                                🛑
                            </button>
                            <button class="p-1 rounded hover:bg-gray-100"
                                @click="$emit('card', { player, team, type: 'yellow' })" :disabled="!isActive"
                                title="Tarjeta amarilla">
                                🟨
                            </button>
                            <button class="p-1 rounded hover:bg-gray-100"
                                @click="$emit('card', { player, team, type: 'blue' })" :disabled="!isActive"
                                title="Tarjeta azul">
                                🟦
                            </button>
                            <button class="p-1 rounded hover:bg-gray-100"
                                @click="$emit('card', { player, team, type: 'red' })" :disabled="!isActive"
                                title="Tarjeta roja">
                                🟥
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import type { Team, Player, MatchStatistics, SolicitudTiempo } from '../../interfaces';

let props =
    defineProps<{
        team?: Team;
        players: Player[];
        stats?: MatchStatistics;
        playerStats: MatchStatistics[];
        timeRequests: SolicitudTiempo[];
        isActive: boolean;
    }>();

defineEmits<{
    (e: 'goal', data: { player: Player; team: Team }): void;
    (e: 'foul', data: { player: Player; team: Team }): void;
    (e: 'card', data: { player: Player; team: Team; type: 'yellow' | 'blue' | 'red' }): void;
    (e: 'requestTime', team: Team): void;
}>();

const getPlayerStats = (playerId: string): MatchStatistics | undefined => {
    return props.playerStats.find(s => s.jugadorId === playerId);
};


</script>