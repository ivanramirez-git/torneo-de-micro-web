<!-- src/components/matches/MatchPeriodControls.vue -->
<template>
    <div class="space-y-4">
        <h3 class="text-lg font-medium mb-4">⏱️ Control de Tiempos</h3>

        <!-- First Half -->
        <div class="flex items-center justify-between">
            <span>Primer Tiempo</span>
            <div class="space-x-2">
                <Button v-if="!match?.horaInicioPrimerTiempo" label="Iniciar" icon="pi pi-play" severity="success"
                    @click="$emit('startFirstHalf')" />
                <Button v-if="match?.horaInicioPrimerTiempo && !match?.horaFinPrimerTiempo" label="Finalizar"
                    icon="pi pi-stop" severity="danger" @click="$emit('endFirstHalf')" />
            </div>
        </div>

        <!-- Second Half -->
        <div class="flex items-center justify-between">
            <span>Segundo Tiempo</span>
            <div class="space-x-2">
                <Button v-if="canStartSecondHalf" label="Iniciar" icon="pi pi-play" severity="success"
                    @click="$emit('startSecondHalf')" />
                <Button v-if="match?.horaInicioSegundoTiempo && !match?.horaFinSegundoTiempo" label="Finalizar"
                    icon="pi pi-stop" severity="danger" @click="$emit('endSecondHalf')" />
            </div>
        </div>

        <!-- Extra Time 1 -->
        <div v-if="showExtraTime" class="flex items-center justify-between">
            <span>Tiempo Extra 1</span>
            <div class="space-x-2">
                <Button v-if="canStartExtraTime1" label="Iniciar" icon="pi pi-play" severity="success"
                    @click="$emit('startExtraTime1')" />
                <Button v-if="match?.horaInicioTiempoExtra1 && !match?.horaFinTiempoExtra1" label="Finalizar"
                    icon="pi pi-stop" severity="danger" @click="$emit('endExtraTime1')" />
            </div>
        </div>

        <!-- Extra Time 2 -->
        <div v-if="showExtraTime" class="flex items-center justify-between">
            <span>Tiempo Extra 2</span>
            <div class="space-x-2">
                <Button v-if="canStartExtraTime2" label="Iniciar" icon="pi pi-play" severity="success"
                    @click="$emit('startExtraTime2')" />
                <Button v-if="match?.horaInicioTiempoExtra2 && !match?.horaFinTiempoExtra2" label="Finalizar"
                    icon="pi pi-stop" severity="danger" @click="$emit('endExtraTime2')" />
            </div>
        </div>

        <!-- Penalties -->
        <div v-if="showPenalties" class="flex items-center justify-between">
            <span>Penales</span>
            <div class="space-x-2">
                <Button v-if="canStartPenalties" label="Iniciar" icon="pi pi-play" severity="success"
                    @click="$emit('startPenalties')" />
                <Button v-if="match?.horaInicioPenales && !match?.horaFinPenales" label="Finalizar" icon="pi pi-stop"
                    severity="danger" @click="$emit('endPenalties')" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Match } from '../../interfaces';
import Button from 'primevue/button';

const props = defineProps<{
    match?: Match;
    showExtraTime: boolean;
    showPenalties: boolean;
    canStartSecondHalf: boolean;
    canStartExtraTime1: boolean;
    canStartExtraTime2: boolean;
    canStartPenalties: boolean;
}>();

defineEmits<{
    (e: 'startFirstHalf'): void;
    (e: 'endFirstHalf'): void;
    (e: 'startSecondHalf'): void;
    (e: 'endSecondHalf'): void;
    (e: 'startExtraTime1'): void;
    (e: 'endExtraTime1'): void;
    (e: 'startExtraTime2'): void;
    (e: 'endExtraTime2'): void;
    (e: 'startPenalties'): void;
    (e: 'endPenalties'): void;
}>();
</script>