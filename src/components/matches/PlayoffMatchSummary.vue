<template>
    <div class="bg-white border rounded-lg p-4">
        <h4 class="font-medium mb-3">{{ groupName }}</h4>

        <!-- Match Score -->
        <div class="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-4">
                <img v-if="getTeamCrest(match?.equipoLocalId)" :src="getTeamCrest(match?.equipoLocalId)"
                    :alt="getTeamName(match?.equipoLocalId)" class="w-12 h-12 object-contain" />
                <span class="hidden sm:inline text-lg font-semibold">{{ getTeamName(match?.equipoLocalId) }}</span>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold">
                    {{ getTeamGoals(match?.equipoLocalId) }} - {{ getTeamGoals(match?.equipoVisitanteId) }}
                </div>
                <div v-if="match?.horaFinPartido" class="text-sm text-gray-500">
                    <span v-if="match?.horaFinTiempoExtra2">Tiempo Extra</span>
                    <br>
                    <span v-if="match?.horaFinPenales">Penales</span>
                    <div v-if="penaltySummary" class="text-sm text-gray-500">
                        {{ penaltySummary.local }} - {{ penaltySummary.visitante }}
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <span class="hidden sm:inline text-lg font-semibold">{{ getTeamName(match?.equipoVisitanteId) }}</span>
                <img v-if="getTeamCrest(match?.equipoVisitanteId)" :src="getTeamCrest(match?.equipoVisitanteId)"
                    :alt="getTeamName(match?.equipoVisitanteId)" class="w-12 h-12 object-contain" />
            </div>
        </div>

        <!-- Match Details -->
        <div class="space-y-4">
            <!-- Match Info -->
            <div class="flex justify-between text-sm text-gray-600 mb-4">
                <div>
                    <i class="pi pi-calendar mr-1"></i>
                    {{ formatDate(match?.fechaProgramacion) }}
                </div>
                <div>
                    <i class="pi pi-map-marker mr-1"></i>
                    {{ match?.lugar?.nombre }}
                </div>
            </div>

            <!-- Match Events Timeline -->
            <div class="space-y-2">
                <div v-for="event in sortedMatchEvents" :key="event.id"
                    class="flex items-center py-2 border-b border-gray-100">
                    <div class="w-16 text-sm text-gray-500">
                        {{ formatEventTime(event.createdAt) }}
                    </div>
                    <div class="flex-1 flex items-center">
                        <span class="mr-2">
                            {{ getEventIcon(event) }}
                        </span>
                        <span>
                            <span class="font-medium">{{ getPlayerName(event.jugadorId) }}</span>
                            {{ getEventDescription(event) }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Team Statistics -->
            <div class="grid grid-cols-3 gap-4 mt-6 text-center">
                <div>
                    <div class="text-2xl font-bold">{{ getTeamStats(match?.equipoLocalId)?.faltas || 0 }}</div>
                    <div class="text-sm text-gray-600">Faltas</div>
                </div>
                <div>
                    <div class="text-2xl font-bold">{{ getTeamStats(match?.equipoLocalId)?.tarjetasAmarillas || 0 }}
                    </div>
                    <div class="text-sm text-gray-600">Amarillas</div>
                </div>
                <div>
                    <div class="text-2xl font-bold">{{ getTeamStats(match?.equipoLocalId)?.tarjetasRojas || 0 }}</div>
                    <div class="text-sm text-gray-600">Rojas</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Match, Team, Player, Group, TournamentPhase, MatchStatistics } from '../../interfaces';

const props = defineProps<{
    match?: Match;
    group: Group;
    phase: TournamentPhase;
    getTeamName: (teamId: string) => string;
    getTeamCrest: (teamId: string) => string;
    players?: Player[];
    matchStats?: MatchStatistics[];
}>();

const groupName = props.group.nombre;

const getTeamGoals = (teamId?: string): number => {
    if (!teamId || !props.match?.estadisticasPartido) return 0;
    return props.match.estadisticasPartido
        .filter(stat => stat.equipoId === teamId)
        .reduce((sum, stat) => sum + (stat.goles || 0), 0);
};

const getTeamStats = (teamId?: string) => {
    if (!teamId || !props.match?.estadisticasPartido) return null;
    return props.match.estadisticasPartido.find(stat => stat.equipoId === teamId);
};

const getPlayerName = (playerId: string): string => {
    const player = props.players?.find(p => p.id === playerId);
    return player?.nombre || '';
};

const sortedMatchEvents = computed(() => {
    if (!props.match?.estadisticasPartido) return [];

    return [...props.match.estadisticasPartido]
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
});

const formatDate = (date?: string | Date): string => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
};

const formatEventTime = (date?: string | Date): string => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getEventIcon = (event: MatchStatistics): string => {
    if (event.goles) return '⚽';
    if (event.tarjetasRojas) return '🟥';
    if (event.tarjetasAzules) return '🟦';
    if (event.tarjetasAmarillas) return '🟨';
    if (event.faltas) return '🛑';
    return '';
};

const getEventDescription = (event: MatchStatistics): string => {
    if (event.goles) return 'marcó un gol';
    if (event.tarjetasRojas) return 'recibió tarjeta roja';
    if (event.tarjetasAzules) return 'recibió tarjeta azul';
    if (event.tarjetasAmarillas) return 'recibió tarjeta amarilla';
    if (event.faltas) return 'cometió una falta';
    return '';
};

const penaltySummary = ref<{ local: number, visitante: number } | null>(null);

const fetchPenaltySummary = async () => {
    if (!props.match?.id) return;
    try {
        const response = await fetch('https://api-micro.freeloz.com/penales');
        const penalties = await response.json();
        const matchPenalties = penalties.filter((penalty: any) => penalty.partidoId === props.match.id);
        const localPenalties = matchPenalties.filter((penalty: any) => penalty.equipoId === props.match?.equipoLocalId && penalty.gol).length;
        const visitantePenalties = matchPenalties.filter((penalty: any) => penalty.equipoId === props.match?.equipoVisitanteId && penalty.gol).length;
        penaltySummary.value = { local: localPenalties, visitante: visitantePenalties };
    } catch (error) {
        console.error('Error fetching penalty summary:', error);
    }
};

onMounted(() => {
    if (props.match?.horaFinPenales) {
        fetchPenaltySummary();
    }
});
</script>