<template>
    <div class="min-h-screen bg-gray-100">
        <div class="max-w-7xl mx-auto py-6 px-4">
            <!-- Header -->
            <div class="text-center mb-6">
                <h1 class="text-3xl font-bold">Planilla Oficial de Juego</h1>
                <div class="mt-4 flex items-center justify-center gap-4">
                    <Button v-if="!match?.horaFinPartido" label="Finalizar Partido" severity="danger" @click="endMatch"
                        :disabled="!match?.mvpId" />
                    <MatchTimer :startTime="getCurrentPeriodStartTime" :period="currentPeriod"
                        :isActive="isMatchActive" />
                </div>

                <!-- MVP Selection -->
                <div class="mt-4 max-w-md mx-auto">
                    <h3 class="text-lg font-medium mb-2">🏆 MVP del Partido</h3>
                    <Dropdown v-model="selectedMvp" :options="allPlayers" optionLabel="nombre" optionValue="id"
                        placeholder="Seleccionar MVP" class="w-full" @change="updateMvp" />
                </div>

                <!-- Match Controls -->
                <div v-if="!match?.horaFinPartido" class="mt-4 flex justify-center gap-4">
                    <!-- First Half -->
                    <Button v-if="!match?.horaInicioPrimerTiempo" label="Iniciar Primer Tiempo" icon="pi pi-play"
                        @click="startFirstHalf" />
                    <Button v-if="match?.horaInicioPrimerTiempo && !match?.horaFinPrimerTiempo"
                        label="Finalizar Primer Tiempo" icon="pi pi-stop" severity="danger" @click="endFirstHalf" />

                    <!-- Second Half -->
                    <Button v-if="canStartSecondHalf" label="Iniciar Segundo Tiempo" icon="pi pi-play"
                        @click="startSecondHalf" />
                    <Button v-if="match?.horaInicioSegundoTiempo && !match?.horaFinSegundoTiempo"
                        label="Finalizar Segundo Tiempo" icon="pi pi-stop" severity="danger" @click="endSecondHalf" />

                    <!-- Extra Time Controls (only if draws are not allowed) -->
                    <template v-if="!allowsDraws">
                        <!-- Extra Time 1 -->
                        <Button v-if="canStartExtraTime1" label="Iniciar T.Extra 1" icon="pi pi-play"
                            @click="startExtraTime1" />
                        <Button v-if="match?.horaInicioTiempoExtra1 && !match?.horaFinTiempoExtra1"
                            label="Finalizar T.Extra 1" icon="pi pi-stop" severity="danger" @click="endExtraTime1" />

                        <!-- Extra Time 2 -->
                        <Button v-if="canStartExtraTime2" label="Iniciar T.Extra 2" icon="pi pi-play"
                            @click="startExtraTime2" />
                        <Button v-if="match?.horaInicioTiempoExtra2 && !match?.horaFinTiempoExtra2"
                            label="Finalizar T.Extra 2" icon="pi pi-stop" severity="danger" @click="endExtraTime2" />

                        <!-- Penalties -->
                        <Button v-if="canStartPenalties" label="Iniciar Penales" icon="pi pi-play"
                            @click="startPenalties" />
                        <Button v-if="match?.horaInicioPenales && !match?.horaFinPenales" label="Finalizar Penales"
                            icon="pi pi-stop" severity="danger" @click="endPenalties" />
                    </template>
                </div>
            </div>

            <!-- Teams -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Local Team -->
                <TeamStats :team="getTeam(match?.equipoLocalId)" :players="getTeamPlayers(match?.equipoLocalId)"
                    :stats="getTeamStats(match?.equipoLocalId)" :player-stats="playerStats" :is-active="isMatchActive"
                    @goal="addGoal" @foul="addFoul" @card="showCardDialog" @request-time="requestTime" />

                <!-- Visitor Team -->
                <TeamStats :team="getTeam(match?.equipoVisitanteId)" :players="getTeamPlayers(match?.equipoVisitanteId)"
                    :stats="getTeamStats(match?.equipoVisitanteId)" :player-stats="playerStats"
                    :is-active="isMatchActive" @goal="addGoal" @foul="addFoul" @card="showCardDialog"
                    @request-time="requestTime" />
            </div>

            <!-- Match Summary -->
            <div class="mt-8 bg-white rounded-lg shadow-lg p-6">
                <h3 class="text-xl font-bold mb-4">Resumen del Partido</h3>
                <div class="text-center text-2xl font-bold">
                    {{ getTeam(match?.equipoLocalId)?.nombre }} {{ getTeamStats(match?.equipoLocalId)?.goles || 0 }} -
                    {{ getTeamStats(match?.equipoVisitanteId)?.goles || 0 }} {{
                        getTeam(match?.equipoVisitanteId)?.nombre }}
                </div>
            </div>
        </div>

        <!-- Dialogs -->
        <Dialog v-model:visible="cardDialog" header="Asignar Tarjeta" modal>
            <div class="space-y-4">
                <div class="p-field">
                    <label class="block text-sm font-medium text-gray-700">Tipo de Tarjeta</label>
                    <div class="mt-2 space-x-4">
                        <Button label="Amarilla" severity="warning" @click="assignCard('yellow')" />
                        <Button label="Azul" severity="info" @click="assignCard('blue')" />
                        <Button label="Roja" severity="danger" @click="assignCard('red')" />
                    </div>
                </div>
            </div>
        </Dialog>

        <!-- Time Request Dialog -->
        <Dialog v-model:visible="timeRequestDialog" header="Solicitud de Tiempo" modal>
            <div class="space-y-4">
                <div class="p-field">
                    <label class="block text-sm font-medium text-gray-700">Periodo</label>
                    <InputNumber v-model="timeRequestForm.periodo" :min="1" :max="4" class="w-full" />
                </div>
            </div>
            <template #footer>
                <Button label="Cancelar" icon="pi pi-times" @click="closeTimeRequestDialog" class="p-button-text" />
                <Button label="Guardar" icon="pi pi-check" @click="saveTimeRequest" autofocus />
            </template>
        </Dialog>

        <Toast />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import type { Match, Team, Player } from '../../interfaces';
import api from '../../stores/api';

// Components
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Toast from 'primevue/toast';
import TeamStats from '../../components/matches/TeamStats.vue';
import MatchTimer from '../../components/matches/MatchTimer.vue';

const route = useRoute();
const toast = useToast();

// State
const match = ref<Match | null>(null);
const teams = ref<Team[]>([]);
const players = ref<Player[]>([]);
const playerStats = ref([]);
const loading = ref(true);
const selectedMvp = ref<string | null>(null);

// Dialog states
const cardDialog = ref(false);
const timeRequestDialog = ref(false);
const selectedPlayer = ref<any>(null);
const selectedTeam = ref<Team | null>(null);

const timeRequestForm = ref({
    periodo: 1,
    equipoId: '',
    partidoId: ''
});

// Computed
const isMatchActive = computed(() => {
    return match.value?.horaInicioPrimerTiempo && !match.value?.horaFinPartido;
});

const allowsDraws = computed(() => {
    return match.value?.grupo?.faseTorneo?.permiteEmpates ?? false;
});

const currentPeriod = computed(() => {
    if (!match.value) return '';

    if (match.value.horaInicioPenales) return 'penalties';
    if (match.value.horaInicioTiempoExtra2) return 'extra2';
    if (match.value.horaInicioTiempoExtra1) return 'extra1';
    if (match.value.horaInicioSegundoTiempo) return 'second';
    if (match.value.horaInicioPrimerTiempo) return 'first';

    return '';
});

const getCurrentPeriodStartTime = computed(() => {
    if (!match.value) return undefined;

    if (match.value.horaInicioPenales) return match.value.horaInicioPenales;
    if (match.value.horaInicioTiempoExtra2) return match.value.horaInicioTiempoExtra2;
    if (match.value.horaInicioTiempoExtra1) return match.value.horaInicioTiempoExtra1;
    if (match.value.horaInicioSegundoTiempo) return match.value.horaInicioSegundoTiempo;
    if (match.value.horaInicioPrimerTiempo) return match.value.horaInicioPrimerTiempo;

    return undefined;
});

const canStartSecondHalf = computed(() => {
    return match.value?.horaFinPrimerTiempo && !match.value?.horaInicioSegundoTiempo;
});

const canStartExtraTime1 = computed(() => {
    if (allowsDraws.value) return false;
    return match.value?.horaFinSegundoTiempo && !match.value?.horaInicioTiempoExtra1;
});

const canStartExtraTime2 = computed(() => {
    if (allowsDraws.value) return false;
    return match.value?.horaFinTiempoExtra1 && !match.value?.horaInicioTiempoExtra2;
});

const canStartPenalties = computed(() => {
    if (allowsDraws.value) return false;
    if (match.value?.horaFinSegundoTiempo) {
        if (!allowsDraws.value) {
            return match.value?.horaFinTiempoExtra2 && !match.value?.horaInicioPenales;
        }
        return !match.value?.horaInicioPenales;
    }
    return false;
});

const allPlayers = computed(() => {
    return players.value.filter(p =>
        p.equipoId === match.value?.equipoLocalId ||
        p.equipoId === match.value?.equipoVisitanteId
    );
});

// Methods
const loadMatch = async () => {
    try {
        const response = await api.get(`/partidos/${route.params.id}`, {
            params: {
                filter: JSON.stringify({
                    include: [
                        {
                            relation: "grupo",
                            scope: {
                                include: [
                                    {
                                        relation: "faseTorneo"
                                    }
                                ]
                            }
                        },
                        {
                            relation: "lugar"
                        },
                        {
                            relation: "estadisticasPartido"
                        },
                        {
                            relation: "solicitudesTiempo"
                        },
                        {
                            relation: "penales"
                        }
                    ]
                })
            }
        });

        match.value = response.data;
        selectedMvp.value = match.value.mvpId || null;
    } catch (error) {
        console.error('Error loading match:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el partido'
        });
    }
};

const loadTeams = async () => {
    try {
        const response = await api.get('/equipos');
        teams.value = response.data;
    } catch (error) {
        console.error('Error loading teams:', error);
    }
};

const loadPlayers = async () => {
    try {
        const [localTeamPlayers, visitorTeamPlayers] = await Promise.all([
            api.get(`/equipos/${match.value?.equipoLocalId}/jugadores`),
            api.get(`/equipos/${match.value?.equipoVisitanteId}/jugadores`)
        ]);
        players.value = [...localTeamPlayers.data, ...visitorTeamPlayers.data];
    } catch (error) {
        console.error('Error loading players:', error);
    }
};

const getTeam = (teamId?: string): Team | undefined => {
    if (!teamId) return undefined;
    return teams.value.find(t => t.id === teamId);
};

const getTeamPlayers = (teamId?: string): Player[] => {
    if (!teamId) return [];
    return players.value.filter(p => p.equipoId === teamId);
};

const getTeamStats = (teamId?: string): any => {
    if (!teamId) return undefined;
    return match.value?.estadisticasPartido?.find(s => s.equipoId === teamId);
};

// Match period controls
const startFirstHalf = async () => {
    try {
        await api.patch(`/partidos/${match.value?.id}`, {
            horaInicioPrimerTiempo: new Date()
        });
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Primer tiempo iniciado'
        });
    } catch (error) {
        console.error('Error starting first half:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo iniciar el primer tiempo'
        });
    }
};

const endFirstHalf = async () => {
    try {
        await api.patch(`/partidos/${match.value?.id}`, {
            horaFinPrimerTiempo: new Date()
        });
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Primer tiempo finalizado'
        });
    } catch (error) {
        console.error('Error ending first half:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo finalizar el primer tiempo'
        });
    }
};

const startSecondHalf = async () => {
    try {
        await api.patch(`/partidos/${match.value?.id}`, {
            horaInicioSegundoTiempo: new Date()
        });
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Segundo tiempo iniciado'
        });
    } catch (error) {
        console.error('Error starting second half:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo iniciar el segundo tiempo'
        });
    }
};

const endSecondHalf = async () => {
    try {
        const updates: any = {
            horaFinSegundoTiempo: new Date()
        };

        // If match allows ties and scores are equal, end the match
        if (allowsDraws.value) {
            const localStats = getTeamStats(match.value?.equipoLocalId);
            const visitorStats = getTeamStats(match.value?.equipoVisitanteId);

            if (localStats?.goles === visitorStats?.goles) {
                updates.horaFinPartido = new Date();
            }
        }

        await api.patch(`/partidos/${match.value?.id}`, updates);
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Segundo tiempo finalizado'
        });
    } catch (error) {
        console.error('Error ending second half:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo finalizar el segundo tiempo'
        });
    }
};

const startExtraTime1 = async () => {
    try {
        await api.patch(`/partidos/${match.value?.id}`, {
            horaInicioTiempoExtra1: new Date()
        });
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Primer tiempo extra iniciado'
        });
    } catch (error) {
        console.error('Error starting extra time 1:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo iniciar el primer tiempo extra'
        });
    }
};

const endExtraTime1 = async () => {
    try {
        await api.patch(`/partidos/${match.value?.id}`, {
            horaFinTiempoExtra1: new Date()
        });
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Primer tiempo extra finalizado'
        });
    } catch (error) {
        console.error('Error ending extra time 1:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo finalizar el primer tiempo extra'
        });
    }
};

const startExtraTime2 = async () => {
    try {
        await api.patch(`/partidos/${match.value?.id}`, {
            horaInicioTiempoExtra2: new Date()
        });
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Segundo tiempo extra iniciado'
        });
    } catch (error) {
        console.error('Error starting extra time 2:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo iniciar el segundo tiempo extra'
        });
    }
};

const endExtraTime2 = async () => {
    try {
        await api.patch(`/partidos/${match.value?.id}`, {
            horaFinTiempoExtra2: new Date()
        });
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Segundo tiempo extra finalizado'
        });
    } catch (error) {
        console.error('Error ending extra time 2:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo finalizar el segundo tiempo extra'
        });
    }
};

const startPenalties = async () => {
    try {
        await api.patch(`/partidos/${match.value?.id}`, {
            horaInicioPenales: new Date()
        });
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Penales iniciados'
        });
    } catch (error) {
        console.error('Error starting penalties:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron iniciar los penales'
        });
    }
};

const endPenalties = async () => {
    try {
        await api.patch(`/partidos/${match.value?.id}`, {
            horaFinPenales: new Date(),
            horaFinPartido: new Date()
        });
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Penales finalizados'
        });
    } catch (error) {
        console.error('Error ending penalties:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron finalizar los penales'
        });
    }
};

const addGoal = async ({ player, team }) => {
    try {
        await api.post(`/estadisticas-partido`, {
            goles: 1,
            partidoId: match.value?.id,
            equipoId: team.id,
            jugadorId: player.id
        });
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Gol registrado'
        });
    } catch (error) {
        console.error('Error adding goal:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar el gol'
        });
    }
};

const addFoul = async ({ player, team }) => {
    try {
        await api.post(`/estadisticas-partido`, {
            faltas: 1,
            partidoId: match.value?.id,
            equipoId: team.id,
            jugadorId: player.id
        });
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Falta registrada'
        });
    } catch (error) {
        console.error('Error adding foul:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar la falta'
        });
    }
};

const showCardDialog = ({ player, team }) => {
    selectedPlayer.value = player;
    selectedTeam.value = team;
    cardDialog.value = true;
};

const assignCard = async (type: 'yellow' | 'blue' | 'red') => {
    try {
        const update: any = {
            partidoId: match.value?.id,
            equipoId: selectedTeam.value?.id,
            jugadorId: selectedPlayer.value?.id
        };

        switch (type) {
            case 'yellow':
                update.tarjetasAmarillas = 1;
                break;
            case 'blue':
                update.tarjetasAzules = 1;
                break;
            case 'red':
                update.tarjetasRojas = 1;
                break;
        }

        await api.post(`/estadisticas-partido`, update);
        cardDialog.value = false;
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Tarjeta registrada'
        });
    } catch (error) {
        console.error('Error assigning card:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar la tarjeta'
        });
    }
};

const requestTime = (team: Team) => {
    timeRequestForm.value = {
        periodo: 1,
        equipoId: team.id,
        partidoId: match.value?.id || ''
    };
    timeRequestDialog.value = true;
};

const closeTimeRequestDialog = () => {
    timeRequestDialog.value = false;
    timeRequestForm.value = {
        periodo: 1,
        equipoId: '',
        partidoId: ''
    };
};

const saveTimeRequest = async () => {
    try {
        await api.post(`/solicitudes-tiempo`, timeRequestForm.value);
        closeTimeRequestDialog();
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Solicitud de tiempo registrada'
        });
    } catch (error) {
        console.error('Error saving time request:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar la solicitud de tiempo'
        });
    }
};

const updateMvp = async () => {
    if (!match.value) return;

    try {
        await api.patch(`/partidos/${match.value.id}`, {
            mvpId: selectedMvp.value
        });
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'MVP actualizado'
        });
    } catch (error) {
        console.error('Error updating MVP:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el MVP'
        });
    }
};

const endMatch = async () => {
    if (!match.value?.mvpId) {
        toast.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Debe seleccionar un MVP antes de finalizar el partido'
        });
        return;
    }

    try {
        await api.patch(`/partidos/${match.value.id}`, {
            horaFinPartido: new Date()
        });
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Partido finalizado'
        });
    } catch (error) {
        console.error('Error ending match:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo finalizar el partido'
        });
    }
};

onMounted(async () => {
    loading.value = true;
    await Promise.all([loadMatch(), loadTeams()]);
    if (match.value) {
        await loadPlayers();
    }
    loading.value = false;
});
</script>