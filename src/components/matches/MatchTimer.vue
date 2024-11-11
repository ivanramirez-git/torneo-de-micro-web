<template>
    <div class="text-2xl font-bold">
        {{ currentPeriodText }} - {{ formattedTime }}
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';

const props = defineProps<{
    startTime?: Date;
    period: string;
    isActive: boolean;
}>();

const seconds = ref(0);
const timer = ref<number | null>(null);

const currentPeriodText = computed(() => {
    switch (props.period) {
        case 'first': return '1/2';
        case 'second': return '2/2';
        case 'extra1': return 'T.Extra 1';
        case 'extra2': return 'T.Extra 2';
        case 'penalties': return 'Penales';
        default: return 'No iniciado';
    }
});

const formattedTime = computed(() => {
    const minutes = Math.floor(seconds.value / 60);
    const secs = seconds.value % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});

const startTimer = () => {
    if (props.startTime && props.isActive) {
        const startTimeMs = new Date(props.startTime).getTime();
        const currentTimeMs = Date.now();
        seconds.value = Math.floor((currentTimeMs - startTimeMs) / 1000);

        timer.value = window.setInterval(() => {
            seconds.value++;
        }, 1000);
    }
};

const stopTimer = () => {
    if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
    }
};

onMounted(() => {
    startTimer();
});

onUnmounted(() => {
    stopTimer();
});

watch(() => props.startTime, () => {
    stopTimer();
    startTimer();
});

watch(() => props.isActive, (newValue) => {
    if (newValue) {
        startTimer();
    } else {
        stopTimer();
    }
});
</script>