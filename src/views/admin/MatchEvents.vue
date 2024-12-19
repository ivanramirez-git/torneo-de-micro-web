<template>
    <div class="min-h-screen bg-gray-100">
        <div class="max-w-7xl mx-auto py-6 px-4">

            <!-- Header -->
            <MatchHeader :match="match" :teams="teams" :stats="playerStats" />

            <!-- Match Summary -->
            <MatchSummary :match="match" :teams="teams" :stats="playerStats" />

            <!-- Match Controls -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">

                <div class="text-center mb-6">
                    <Button v-if="!match?.horaInicioPrimerTiempo" label="Iniciar Partido" severity="success"
                        @click="startMatch" />
                    <Button v-if="match?.horaInicioPrimerTiempo && !match?.horaFinPrimerTiempo"
                        label="Finalizar Primer Tiempo" severity="warning" @click="endFirstHalf" />
                    <Button v-if="match?.horaFinPrimerTiempo && !match?.horaInicioSegundoTiempo"
                        label="Iniciar Segundo Tiempo" severity="success" @click="startSecondHalf" />
                    <Button v-if="match?.horaInicioSegundoTiempo && !match?.horaFinSegundoTiempo"
                        label="Finalizar Segundo Tiempo" severity="warning" @click="endSecondHalf" />
                    <Button
                        v-if="match?.horaFinSegundoTiempo && !match?.horaInicioTiempoExtra1 && !match?.grupo?.faseTorneo?.permiteEmpates"
                        label="Iniciar Tiempo Extra 1" severity="success" @click="startExtraTime1" />
                    <Button v-if="match?.horaInicioTiempoExtra1 && !match?.horaFinTiempoExtra1"
                        label="Finalizar Tiempo Extra 1" severity="warning" @click="endExtraTime1" />
                    <Button v-if="match?.horaFinTiempoExtra1 && !match?.horaInicioTiempoExtra2"
                        label="Iniciar Tiempo Extra 2" severity="success" @click="startExtraTime2" />
                    <Button v-if="match?.horaInicioTiempoExtra2 && !match?.horaFinTiempoExtra2"
                        label="Finalizar Tiempo Extra 2" severity="warning" @click="endExtraTime2" />
                    <Button v-if="match?.horaFinTiempoExtra2 && !match?.horaInicioPenales" label="Iniciar Penales"
                        severity="success" @click="startPenalties" />
                    <Button v-if="match?.horaInicioPenales && !match?.horaFinPenales" label="Finalizar Penales"
                        severity="warning" @click="endPenalties" />
                    <Button v-if="match?.horaInicioSegundoTiempo && !match?.horaFinPartido" label="Finalizar Partido"
                        severity="danger" @click="endMatch"
                        :disabled="!match?.mvpEquipoLocalId || !match?.mvpEquipoVisitanteId" />
                    <MatchTimer :startTime="getCurrentPeriodStartTime" :period="currentPeriod"
                        :isActive="isMatchActive" />
                </div>

                <!-- MVP Selection -->
                <div class="mt-4 max-w-md mx-auto grid grid-cols-2 gap-4">
                    <!-- Contenedor para MVP del equipo local -->
                    <div class="flex flex-col">
                        <h3 class="text-lg font-medium mb-2">🏆 MVP del Partido Equipo Local</h3>
                        <Dropdown v-model="selectedMvpEquipoLocal" :options="allPlayersLocal" optionLabel="nombre"
                            optionValue="id" placeholder="Seleccionar MVP Equipo Local" class="w-full"
                            @change="updateMvp" />
                    </div>

                    <!-- Contenedor para MVP del equipo visitante -->
                    <div class="flex flex-col">
                        <h3 class="text-lg font-medium mb-2">🏆 MVP del Partido Equipo Visitante</h3>
                        <Dropdown v-model="selectedMvpEquipoVisitante" :options="allPlayersVisitante"
                            optionLabel="nombre" optionValue="id" placeholder="Seleccionar MVP Equipo Visitante"
                            class="w-full" @change="updateMvp" />
                    </div>
                </div>

            </div>

            <!-- Teams -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Local Team -->
                <TeamStats :match="match" :team="getTeam(match?.equipoLocalId)"
                    :players="getTeamPlayers(match?.equipoLocalId)" :stats="getTeamStats(match?.equipoLocalId)"
                    :player-stats="playerStats" :time-requests="getTeamTimeRequests(match?.equipoLocalId)"
                    :isActive="isMatchActive" @goal="addGoal" @foul="addFoul" @card="saveCard"
                    @requestTime="requestTime" />

                <!-- Visitor Team -->
                <TeamStats :match="match" :team="getTeam(match?.equipoVisitanteId)"
                    :players="getTeamPlayers(match?.equipoVisitanteId)" :stats="getTeamStats(match?.equipoVisitanteId)"
                    :player-stats="playerStats" :time-requests="getTeamTimeRequests(match?.equipoVisitanteId)"
                    :isActive="isMatchActive" @goal="addGoal" @foul="addFoul" @card="saveCard"
                    @requestTime="requestTime" />
            </div>
        </div>

        <!-- Penalty Sheet -->
        <PenaltySheet v-if="match?.horaFinTiempoExtra2 && !match?.grupo?.faseTorneo?.permiteEmpates" :match="match"
            :teams="teams" @savePenalty="savePenalty" :players="players" />


        <!-- Dialogs -->
        <EventDialogs v-model:goalDialog="goalDialog" v-model:foulDialog="foulDialog" v-model:cardDialog="cardDialog"
            v-model:timeRequestDialog="timeRequestDialog" v-model:penaltyDialog="penaltyDialog" :match="match"
            :teams="teams" :players="players" :selectedCardType="selectedCardType" @saveGoal="saveGoal"
            @saveFoul="saveFoul" @saveCard="saveCard" @saveTimeRequest="saveTimeRequest" @savePenalty="savePenalty" />

        <Toast />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import type { Match, Team, Player, MatchStatistics, SolicitudTiempo } from '../../interfaces';
import api from '../../stores/api';

// Components
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Toast from 'primevue/toast';
import MatchHeader from '../../components/matches/MatchHeader.vue';
import MatchTimer from '../../components/matches/MatchTimer.vue';
import QuickActions from '../../components/matches/QuickActions.vue';
import TeamStats from '../../components/matches/TeamStats.vue';
import MatchSummary from '../../components/matches/MatchSummary.vue';
import EventDialogs from '../../components/matches/EventDialogs.vue';
import PenaltySheet from '../../components/matches/PenaltySheet.vue'; // Importar el nuevo componente


const route = useRoute();
const toast = useToast();

// State
const match = ref<Match | null>(null);
const teams = ref<Team[]>([]);
const players = ref<Player[]>([]);
const playerStats = ref<MatchStatistics[]>([]);
const timeRequests = ref<SolicitudTiempo[]>([]);
const loading = ref(true);
const selectedMvpEquipoLocal = ref<string | null>(null);
const selectedMvpEquipoVisitante = ref<string | null>(null);

// Dialog states
const goalDialog = ref(false);
const foulDialog = ref(false);
const cardDialog = ref(false);
const timeRequestDialog = ref(false);
const penaltyDialog = ref(false);
const selectedCardType = ref<'yellow' | 'blue' | 'red'>('yellow');

// Computed
const isMatchActive = computed(() => {
    return match.value?.horaInicioPrimerTiempo && !match.value?.horaFinPartido;
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

const allPlayersLocal = computed(() => {
    return players.value.filter(p =>
        p.equipoId === match.value?.equipoLocalId
    );
});
const allPlayersVisitante = computed(() => {
    return players.value.filter(p =>
        p.equipoId === match.value?.equipoVisitanteId
    );
});

const hasRequestedTimeInCurrentPeriod = computed(() => {
    const currentPeriodValue = getCurrentPeriod();
    return timeRequests.value.some(tr => tr.periodo === currentPeriodValue);
});

// Methods
const loadMatch = async () => {
    try {
        const response = await api.get(`/partidos/${route.params.id}`, {
            params: {
                filter: {
                    include: [
                        'grupo',
                        'lugar',
                        'estadisticasPartido',
                        'solicitudesTiempo',
                        'penales'
                    ]
                }
            }
        });
        match.value = response.data;
        selectedMvpEquipoLocal.value = match.value?.mvpEquipoLocalId;
        selectedMvpEquipoVisitante.value = match.value?.mvpEquipoVisitanteId;

        // Load related data
        await Promise.all([
            loadTeams(),
            loadPlayers(),
            loadTimeRequests()
        ]);
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

const loadTimeRequests = async () => {
    try {
        const response = await api.get(`/partidos/${match.value?.id}/solicitud-tiempos`);
        timeRequests.value = response.data;
    } catch (error) {
        console.error('Error loading time requests:', error);
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

const getTeamStats = (teamId?: string): MatchStatistics | undefined => {
    if (!teamId) return undefined;
    return match.value?.estadisticasPartido?.find(s => s.equipoId === teamId);
};

const getTeamTimeRequests = (teamId?: string): SolicitudTiempo[] => {
    if (!teamId) return [];
    return timeRequests.value.filter(tr => tr.equipoId === teamId);
};

const getCurrentPeriod = (): number => {
    if (!match.value) return 0;

    if (match.value.horaInicioPenales) return 4;
    if (match.value.horaInicioTiempoExtra2) return 4;
    if (match.value.horaInicioTiempoExtra1) return 3;
    if (match.value.horaInicioSegundoTiempo) return 2;
    if (match.value.horaInicioPrimerTiempo) return 1;

    return 0;
};

// Event handlers
const showGoalDialog = () => {
    goalDialog.value = true;
};

const showFoulDialog = () => {
    foulDialog.value = true;
};

const showCardDialog = (type: 'yellow' | 'blue' | 'red') => {
    selectedCardType.value = type;
    cardDialog.value = true;
};

const requestTime = async (team: Team) => {
    try {
        await api.post(`/partidos/${match.value?.id}/solicitud-tiempos`, {
            equipoId: team.id,
            periodo: getCurrentPeriod(),
            minuto: new Date()
        });

        await loadTimeRequests();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Tiempo solicitado correctamente'
        });
    } catch (error) {
        console.error('Error requesting time:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo solicitar el tiempo'
        });
    }
};

const addGoal = async ({ player, team }) => {
    try {
        await api.post(`/partidos/${match.value?.id}/estadistica-partidos`, {
            equipoId: team.id,
            jugadorId: player.id,
            goles: 1
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
        await api.post(`/partidos/${match.value?.id}/estadistica-partidos`, {
            equipoId: team.id,
            jugadorId: player.id,
            faltas: 1
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

const saveCard = async ({ player, team, type }) => {
    try {
        const update: any = {
            equipoId: team.id,
            jugadorId: player.id
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

        await api.post(`/partidos/${match.value?.id}/estadistica-partidos`, update);
        await loadMatch();
        cardDialog.value = false;
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Tarjeta registrada'
        });
    } catch (error) {
        console.error('Error saving card:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar la tarjeta'
        });
    }
};

const updateMvp = async () => {
    if (!match.value) return;

    try {
        await api.patch(`/partidos/${match.value.id}`, {
            mvpEquipoLocalId: selectedMvpEquipoLocal.value,
            mvpEquipoVisitanteId: selectedMvpEquipoVisitante.value
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

const startMatch = async () => {
    try {
        await api.patch(`/partidos/${match.value?.id}`, {
            horaInicioPrimerTiempo: new Date()
        });
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Partido iniciado'
        });
    } catch (error) {
        console.error('Error starting match:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo iniciar el partido'
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
        await api.patch(`/partidos/${match.value?.id}`, {
            horaFinSegundoTiempo: new Date()
        });
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
            detail: 'Tiempo extra 1 iniciado'
        });
    } catch (error) {
        console.error('Error starting extra time 1:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo iniciar el tiempo extra 1'
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
            detail: 'Tiempo extra 1 finalizado'
        });
    } catch (error) {
        console.error('Error ending extra time 1:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo finalizar el tiempo extra 1'
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
            detail: 'Tiempo extra 2 iniciado'
        });
    } catch (error) {
        console.error('Error starting extra time 2:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo iniciar el tiempo extra 2'
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
            detail: 'Tiempo extra 2 finalizado'
        });
    } catch (error) {
        console.error('Error ending extra time 2:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo finalizar el tiempo extra 2'
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
            horaFinPenales: new Date()
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

const endMatch = async () => {
    if (!match.value?.mvpEquipoLocalId || !match.value?.mvpEquipoVisitanteId) {
        toast.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Debe seleccionar un MVP antes de finalizar el partido'
        });
        return;
    }

    try {
        const updates: any = {
            horaFinPartido: new Date()
        };

        // Si el partido permite empates, finalizar todos los periodos
        if (match.value.grupo?.faseTorneo?.permiteEmpates) {
            updates.horaFinPrimerTiempo = updates.horaFinPartido;
            updates.horaFinSegundoTiempo = updates.horaFinPartido;
            updates.horaFinTiempoExtra1 = updates.horaFinPartido;
            updates.horaFinTiempoExtra2 = updates.horaFinPartido;
            updates.horaFinPenales = updates.horaFinPartido;
        }

        await api.patch(`/partidos/${match.value.id}`, updates);
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

const savePenalty = async ({ player, team, goal }) => {
    try {
        await api.post('/penales', {
            gol: goal,
            partidoId: match.value?.id,
            equipoId: team.id
        });
        await loadMatch();
        toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Penal registrado'
        });
    } catch (error) {
        console.error('Error saving penalty:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar el penal'
        });
    }
};

onMounted(async () => {
    loading.value = true;
    await loadMatch();
    loading.value = false;
});
</script>