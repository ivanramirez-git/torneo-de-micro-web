<template>
    <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 class="text-lg font-medium mb-4">Planilla de Penaltis</h3>
        <div class="grid grid-cols-2 gap-4">
            <div v-for="team in getCurrentTeams()" :key="team.id" class="flex flex-row">
                <h4 class="text-md font-medium mb-2">{{ team.nombre }}</h4>
                <Button label="Gol" icon="pi pi-fw pi-check" class="p-button-success p-button-sm"
                    @click="$emit('savePenalty', { team, goal: true })">⚽️</Button>
                <Button label="Fallo" icon="pi pi-fw pi-times" class="p-button-danger p-button-sm ml-2"
                    @click="$emit('savePenalty', { team, goal: false })">❌</Button>
            </div>
        </div>
        <div class="mt-6">
            <h4 class="text-md font-medium mb-2">Resumen de Penaltis</h4>
            <div v-for="team in getCurrentTeams()" :key="team.id" class="mb-4">
                <h5 class="text-sm font-medium">{{ team.nombre }}</h5>
                <ul>
                    <li v-for="penalty in getPenaltiesByTeam(team.id)" :key="penalty.id">
                        {{ penalty.jugadorNombre }} - {{ penalty.gol ? 'Gol' : 'Fallo' }}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { defineProps, defineEmits, ref, onMounted } from 'vue';
import type { Match, Team, Player, Penalty } from '../../interfaces';
import api from '../../stores/api';

const props = defineProps<{
    match: Match;
    teams: Team[];
    players: Player[];
}>();

defineEmits<{
    (e: 'savePenalty', data: { team: Team; goal: boolean }): void;
}>();

const penalties = ref<Penalty[]>([]);

const getTeamPlayers = (teamId?: string): Player[] => {
    if (!teamId) return [];
    return props.players.filter(p => p.equipoId === teamId);
};

const getCurrentTeams = () => {
    return props.teams.filter(t => t.id === props.match.equipoLocalId || t.id === props.match.equipoVisitanteId).sort((a, b) => a.id === props.match.equipoLocalId ? -1 : 1);
};

const getPenaltiesByTeam = (teamId: string) => {
    return penalties.value.filter(p => p.equipoId === teamId);
};

const loadPenalties = async () => {
    try {
        const response = await api.get(`/penales`, {
            params: {
                filter: {
                    where: {
                        partidoId: props.match.id
                    }
                }
            }
        });
        penalties.value = response.data;
    } catch (error) {
        console.error('Error loading penalties:', error);
    }
};


onMounted(() => {
    loadPenalties();
});
</script>
