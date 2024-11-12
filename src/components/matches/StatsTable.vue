<template>
    <DataTable :value="stats" :loading="loading" dataKey="id" paginator :rows="10" :rowsPerPageOptions="[10, 20, 50]"
        filterDisplay="menu" :filters="filters" class="p-datatable-lg">
        <Column field="createdAt" header="Fecha Creación" sortable>
            <template #body="slotProps">
                {{ formatDateTime(slotProps.data.createdAt) }}
            </template>
        </Column>
        <Column field="partidoId" header="Partido" sortable>
            <template #body="slotProps">
                <MatchInfo :match="getMatch(slotProps.data.partidoId)" />
            </template>
        </Column>
        <Column field="equipoId" header="Equipo" sortable>
            <template #body="slotProps">
                <TeamInfo :team="getTeam(slotProps.data.equipoId)" />
            </template>
        </Column>
        <Column field="jugadorId" header="Jugador" sortable>
            <template #body="slotProps">
                <PlayerInfo :player="getPlayer(slotProps.data.jugadorId)" />
            </template>
        </Column>
        <Column field="goles" header="Goles" sortable></Column>
        <Column field="faltas" header="Faltas" sortable></Column>
        <Column field="tarjetasAmarillas" header="T. Amarillas" sortable></Column>
        <Column field="tarjetasAzules" header="T. Azules" sortable></Column>
        <Column field="tarjetasRojas" header="T. Rojas" sortable></Column>
        <Column field="sanciones" header="Sanciones">
            <template #body="slotProps">
                <span :title="slotProps.data.sanciones">
                    {{ truncateText(slotProps.data.sanciones, 50) }}
                </span>
            </template>
        </Column>

        <Column header="Acciones" :exportable="false" style="min-width:8rem">
            <template #body="slotProps">
                <div class="flex gap-2">
                    <Button icon="pi pi-pencil" @click="$emit('edit', slotProps.data)"
                        class="p-button-text p-button-warning" tooltip="Editar" />
                    <Button icon="pi pi-trash" @click="$emit('delete', slotProps.data)"
                        class="p-button-text p-button-danger" tooltip="Eliminar" />
                </div>
            </template>
        </Column>
    </DataTable>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import type { MatchStatistics, Match, Team, Player } from '../../interfaces';

// Components
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import MatchInfo from './MatchInfo.vue';
import TeamInfo from './TeamInfo.vue';
import PlayerInfo from './PlayerInfo.vue';

const props = defineProps<{
    stats: MatchStatistics[];
    matches: Match[];
    teams: Team[];
    players: Player[];
    loading: boolean;
}>();

defineEmits<{
    (e: 'edit', stat: MatchStatistics): void;
    (e: 'delete', stat: MatchStatistics): void;
}>();

const filters = ref({
    partidoId: { value: null, matchMode: FilterMatchMode.EQUALS },
    equipoId: { value: null, matchMode: FilterMatchMode.EQUALS },
    jugadorId: { value: null, matchMode: FilterMatchMode.EQUALS },
    createdAt: { value: null, matchMode: FilterMatchMode.DATE_IS }
});

const getMatch = (matchId: string): Match | undefined => {
    return props.matches.find(m => m.id === matchId);
};

const getTeam = (teamId: string): Team | undefined => {
    return props.teams.find(t => t.id === teamId);
};

const getPlayer = (playerId: string): Player | undefined => {
    return props.players.find(p => p.id === playerId);
};

const truncateText = (text: string | undefined, maxLength: number): string => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const formatDateTime = (date: string | Date): string => {
    return new Date(date).toLocaleString();
};
</script>