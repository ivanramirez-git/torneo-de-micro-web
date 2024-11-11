<template>
    <div class="grid grid-cols-3 gap-4">
        <!-- Goals -->
        <button
            class="p-4 rounded-lg bg-green-100 hover:bg-green-200 transition-colors flex flex-col items-center justify-center"
            @click="$emit('goal')" :disabled="!isActive">
            <span class="text-2xl">⚽</span>
            <span class="text-sm mt-1">Gol</span>
        </button>

        <!-- Fouls -->
        <button
            class="p-4 rounded-lg bg-red-100 hover:bg-red-200 transition-colors flex flex-col items-center justify-center"
            @click="$emit('foul')" :disabled="!isActive">
            <span class="text-2xl">🛑</span>
            <span class="text-sm mt-1">Falta</span>
        </button>

        <!-- Yellow Card -->
        <button
            class="p-4 rounded-lg bg-yellow-100 hover:bg-yellow-200 transition-colors flex flex-col items-center justify-center"
            @click="$emit('card', 'yellow')" :disabled="!isActive">
            <span class="text-2xl">🟨</span>
            <span class="text-sm mt-1">Amarilla</span>
        </button>

        <!-- Blue Card -->
        <button
            class="p-4 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors flex flex-col items-center justify-center"
            @click="$emit('card', 'blue')" :disabled="!isActive">
            <span class="text-2xl">🟦</span>
            <span class="text-sm mt-1">Azul</span>
        </button>

        <!-- Red Card -->
        <button
            class="p-4 rounded-lg bg-red-100 hover:bg-red-200 transition-colors flex flex-col items-center justify-center"
            @click="$emit('card', 'red')" :disabled="!isActive">
            <span class="text-2xl">🟥</span>
            <span class="text-sm mt-1">Roja</span>
        </button>

        <!-- Time Request -->
        <button
            class="p-4 rounded-lg bg-purple-100 hover:bg-purple-200 transition-colors flex flex-col items-center justify-center"
            @click="$emit('timeRequest')" :disabled="!isActive || hasRequestedTime">
            <span class="text-2xl">⏰</span>
            <span class="text-sm mt-1">Tiempo</span>
        </button>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    isActive: boolean;
    hasRequestedTime: boolean;
}>();

defineEmits<{
    (e: 'goal'): void;
    (e: 'foul'): void;
    (e: 'card', type: 'yellow' | 'blue' | 'red'): void;
    (e: 'timeRequest'): void;
}>();
</script>