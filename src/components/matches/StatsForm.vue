<template>
    <form @submit.prevent="$emit('submit', form)" class="space-y-4">
        <div class="p-field">
            <label for="partidoId" class="font-bold mb-2 block">Partido</label>
            <Dropdown id="partidoId" v-model="form.partidoId" :options="formattedMatches" optionLabel="description"
                optionValue="id" placeholder="Seleccione un partido" class="w-full" required
                @change="loadTeamsForMatch" />
        </div>

        <div class="p-field">
            <label for="equipoId" class="font-bold mb-2 block">Equipo</label>
            <Dropdown id="equipoId" v-model="form.equipoId" :options="availableTeams" optionLabel="nombre"
                optionValue="id" placeholder="Seleccione un equipo" class="w-full" required :disabled="!form.partidoId"
                @change="loadPlayersForTeam" />
        </div>

        <div class="p-field">
            <label for="jugadorId" class="font-bold mb-2 block">Jugador</label>
            <Dropdown id="jugadorId" v-model="form.jugadorId" :options="availablePlayers" optionLabel="nombre"
                optionValue="id" placeholder="Seleccione un jugador" class="w-full" required
                :disabled="!form.equipoId" />
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="p-field">
                <label for="goles" class="font-bold mb-2 block">Goles</label>
                <InputNumber id="goles" v-model="form.goles" :min="0" class="w-full" />
            </div>
            <div class="p-field">
                <label for="faltas" class="font-bold mb-2 block">Faltas</label>
                <InputNumber id="faltas" v-model="form.faltas" :min="0" class="w-full" />
            </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
            <div class="p-field">
                <label for="tarjetasAzules" class="font-bold mb-2 block">T. Azules</label>
                <InputNumber id="tarjetasAzules" v-model="form.tarjetasAzules" :min="0" class="w-full" />
            </div>
            <div class="p-field">
                <label for="tarjetasAmarillas" class="font-bold mb-2 block">T. Amarillas</label>
                <InputNumber id="tarjetasAmarillas" v-model="form.tarjetasAmarillas" :min="0" class="w-full" />
            </div>
            <div class="p-field">
                <label for="tarjetasRojas" class="font-bold mb-2 block">T. Rojas</label>
                <InputNumber id="tarjetasRojas" v-model="form.tarjetasRojas" :min="0" class="w-full" />
            </div>
        </div>

        <div class="p-field">
            <label for="sanciones" class="font-bold mb-2 block">Sanciones</label>
            <Textarea id="sanciones" v-model="form.sanciones" rows="3" class="w-full" />
        </div>

        <div class="flex justify-end gap-2">
            <Button label="Cancelar" @click="$emit('cancel')" class="p-button-text" />
            <Button type="submit" :label="isEditing ? 'Actualizar' : 'Guardar'" class="p-button-primary" />
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { MatchStatistics, Match, Team, Player } from '../../interfaces';

// Components
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';

const props = defineProps<{
    stat?: MatchStatistics;
    matches: Match[];
    teams: Team[];
    players: Player[];
    isEditing: boolean;
}>();

const emit = defineEmits<{
    (e: 'submit', form: Partial<MatchStatistics>): void;
    (e: 'cancel'): void;
}>();

const form = ref<Partial<MatchStatistics>>({
    partidoId: '',
    equipoId: '',
    jugadorId: '',
    goles: 0,
    faltas: 0,
    tarjetasAzules: 0,
    tarjetasAmarillas: 0,
    tarjetasRojas: 0,
    sanciones: ''
});

const availableTeams = ref<Team[]>([]);
const availablePlayers = ref<Player[]>([]);

// Format matches for the dropdown
const formattedMatches = computed(() => {
    return props.matches.map(match => {
        const localTeam = props.teams.find(t => t.id === match.equipoLocalId);
        const visitorTeam = props.teams.find(t => t.id === match.equipoVisitanteId);

        return {
            id: match.id,
            description: `${new Date(match.fechaProgramacion).toLocaleDateString()} - ${localTeam?.nombre || 'Local'} vs ${visitorTeam?.nombre || 'Visitante'}`
        };
    });
});

watch(() => props.stat, (newStat) => {
    if (newStat) {
        form.value = { ...newStat };
        loadTeamsForMatch();
        loadPlayersForTeam();
    } else {
        form.value = {
            partidoId: '',
            equipoId: '',
            jugadorId: '',
            goles: 0,
            faltas: 0,
            tarjetasAzules: 0,
            tarjetasAmarillas: 0,
            tarjetasRojas: 0,
            sanciones: ''
        };
    }
}, { immediate: true });

const loadTeamsForMatch = () => {
    if (!form.value.partidoId) {
        availableTeams.value = [];
        return;
    }

    const match = props.matches.find(m => m.id === form.value.partidoId);
    if (match) {
        availableTeams.value = props.teams.filter(t =>
            t.id === match.equipoLocalId || t.id === match.equipoVisitanteId
        );
    }
};

const loadPlayersForTeam = () => {
    if (!form.value.equipoId) {
        availablePlayers.value = [];
        return;
    }

    availablePlayers.value = props.players.filter(p => p.equipoId === form.value.equipoId);
};
</script>