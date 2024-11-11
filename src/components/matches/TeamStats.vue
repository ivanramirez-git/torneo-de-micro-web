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
                {{ totalTeamGoals }}
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
                    <td class="text-center">{{ getPlayerStats(player.id).goles }}</td>
                    <td class="text-center">{{ getPlayerStats(player.id).faltas }}</td>
                    <td class="text-center">{{ getPlayerStats(player.id).tarjetasAmarillas }}</td>
                    <td class="text-center">{{ getPlayerStats(player.id).tarjetasAzules }}</td>
                    <td class="text-center">{{ getPlayerStats(player.id).tarjetasRojas }}</td>
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
import { computed } from 'vue';
import type { Team, Player, MatchStatistics, SolicitudTiempo, Match } from '../../interfaces';

let props = defineProps<{
    match?: Match;
    team?: Team;
    players: Player[];
    timeRequests: SolicitudTiempo[];
    isActive: boolean;
}>();

console.log('match', props.match);
console.log('team', props.team);

defineEmits<{
    (e: 'goal', data: { player: Player; team: Team }): void;
    (e: 'foul', data: { player: Player; team: Team }): void;
    (e: 'card', data: { player: Player; team: Team; type: 'yellow' | 'blue' | 'red' }): void;
    (e: 'requestTime', team: Team): void;
}>();

const getPlayerStats = (playerId: string): {
    goles: number;
    faltas: number;
    tarjetasAmarillas: number;
    tarjetasAzules: number;
    tarjetasRojas: number;
} => {
    if (!props.match || !props.match.estadisticasPartido) {
        return {
            goles: 0,
            faltas: 0,
            tarjetasAmarillas: 0,
            tarjetasAzules: 0,
            tarjetasRojas: 0,
        };
    }

    const stats = props.match.estadisticasPartido.filter(
        (s) => s.jugadorId === playerId && s.equipoId === props.team?.id
    );

    const totalStats = stats.reduce(
        (acc, stat) => {
            return {
                goles: acc.goles + (stat.goles || 0),
                faltas: acc.faltas + (stat.faltas || 0),
                tarjetasAmarillas: acc.tarjetasAmarillas + (stat.tarjetasAmarillas || 0),
                tarjetasAzules: acc.tarjetasAzules + (stat.tarjetasAzules || 0),
                tarjetasRojas: acc.tarjetasRojas + (stat.tarjetasRojas || 0),
            };
        },
        { goles: 0, faltas: 0, tarjetasAmarillas: 0, tarjetasAzules: 0, tarjetasRojas: 0 }
    );

    return totalStats;
};

const totalTeamGoals = computed(() => {
    if (!props.match || !props.match.estadisticasPartido || !props.team) return 0;

    return props.match.estadisticasPartido
        .filter((stat) => stat.equipoId === props.team?.id)
        .reduce((acc, stat) => acc + (stat.goles || 0), 0);
});
</script>
