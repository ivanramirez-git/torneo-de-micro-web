<template>
    <!-- Goal Dialog -->
    <Dialog 
      v-model:visible="goalDialogModel" 
      header="Registrar Gol" 
      modal
      class="p-fluid"
    >
      <div class="space-y-4">
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Equipo</label>
          <Dropdown
            v-model="goalForm.teamId"
            :options="availableTeams"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccione un equipo"
            class="w-full"
          />
        </div>
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Jugador</label>
          <Dropdown
            v-model="goalForm.playerId"
            :options="getTeamPlayers(goalForm.teamId)"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccione un jugador"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          @click="closeGoalDialog" 
          class="p-button-text" 
        />
        <Button 
          label="Guardar" 
          icon="pi pi-check" 
          @click="saveGoal" 
          autofocus 
        />
      </template>
    </Dialog>
  
    <!-- Foul Dialog -->
    <Dialog 
      v-model:visible="foulDialogModel" 
      header="Registrar Falta" 
      modal
      class="p-fluid"
    >
      <div class="space-y-4">
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Equipo</label>
          <Dropdown
            v-model="foulForm.teamId"
            :options="availableTeams"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccione un equipo"
            class="w-full"
          />
        </div>
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Jugador</label>
          <Dropdown
            v-model="foulForm.playerId"
            :options="getTeamPlayers(foulForm.teamId)"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccione un jugador"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          @click="closeFoulDialog" 
          class="p-button-text" 
        />
        <Button 
          label="Guardar" 
          icon="pi pi-check" 
          @click="saveFoul" 
          autofocus 
        />
      </template>
    </Dialog>
  
    <!-- Card Dialog -->
    <Dialog 
      v-model:visible="cardDialogModel" 
      header="Registrar Tarjeta" 
      modal
      class="p-fluid"
    >
      <div class="space-y-4">
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Equipo</label>
          <Dropdown
            v-model="cardForm.teamId"
            :options="availableTeams"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccione un equipo"
            class="w-full"
          />
        </div>
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Jugador</label>
          <Dropdown
            v-model="cardForm.playerId"
            :options="getTeamPlayers(cardForm.teamId)"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccione un jugador"
            class="w-full"
          />
        </div>
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Tipo de Tarjeta</label>
          <div class="flex gap-4 mt-2">
            <Button 
              label="🟨 Amarilla"
              severity="warning"
              :outlined="selectedCardType !== 'yellow'"
              @click="selectedCardType = 'yellow'"
            />
            <Button 
              label="🟦 Azul"
              severity="info"
              :outlined="selectedCardType !== 'blue'"
              @click="selectedCardType = 'blue'"
            />
            <Button 
              label="🟥 Roja"
              severity="danger"
              :outlined="selectedCardType !== 'red'"
              @click="selectedCardType = 'red'"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          @click="closeCardDialog" 
          class="p-button-text" 
        />
        <Button 
          label="Guardar" 
          icon="pi pi-check" 
          @click="saveCard" 
          autofocus 
        />
      </template>
    </Dialog>
  
    <!-- Time Request Dialog -->
    <Dialog 
      v-model:visible="timeRequestDialogModel" 
      header="Solicitud de Tiempo" 
      modal
      class="p-fluid"
    >
      <div class="space-y-4">
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Equipo</label>
          <Dropdown
            v-model="timeRequestForm.teamId"
            :options="availableTeams"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccione un equipo"
            class="w-full"
          />
        </div>
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Periodo</label>
          <InputNumber 
            v-model="timeRequestForm.periodo" 
            :min="1" 
            :max="4" 
            class="w-full" 
          />
        </div>
      </div>
      <template #footer>
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          @click="closeTimeRequestDialog" 
          class="p-button-text" 
        />
        <Button 
          label="Guardar" 
          icon="pi pi-check" 
          @click="saveTimeRequest" 
          autofocus 
        />
      </template>
    </Dialog>
  
    <!-- Penalty Dialog -->
    <Dialog 
      v-model:visible="penaltyDialogModel" 
      header="Registrar Penal" 
      modal
      class="p-fluid"
    >
      <div class="space-y-4">
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Equipo</label>
          <Dropdown
            v-model="penaltyForm.teamId"
            :options="availableTeams"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccione un equipo"
            class="w-full"
          />
        </div>
        <div class="p-field">
          <label class="block text-sm font-medium text-gray-700">Resultado</label>
          <div class="flex gap-4 mt-2">
            <div class="flex items-center">
              <RadioButton 
                v-model="penaltyForm.gol" 
                :value="true"
                inputId="gol-si"
              />
              <label for="gol-si" class="ml-2">⚽ Gol</label>
            </div>
            <div class="flex items-center">
              <RadioButton 
                v-model="penaltyForm.gol" 
                :value="false"
                inputId="gol-no"
              />
              <label for="gol-no" class="ml-2">❌ Fallado</label>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          @click="closePenaltyDialog" 
          class="p-button-text" 
        />
        <Button 
          label="Guardar" 
          icon="pi pi-check" 
          @click="savePenalty" 
          autofocus 
        />
      </template>
    </Dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import type { Match, Team, Player } from '../../interfaces';
  
  // Components
  import Button from 'primevue/button';
  import Dialog from 'primevue/dialog';
  import Dropdown from 'primevue/dropdown';
  import InputNumber from 'primevue/inputnumber';
  import RadioButton from 'primevue/radiobutton';
  
  const props = defineProps<{
    modelValue?: boolean;
    goalDialog?: boolean;
    foulDialog?: boolean;
    cardDialog?: boolean;
    timeRequestDialog?: boolean;
    penaltyDialog?: boolean;
    match?: Match;
    teams: Team[];
    players: Player[];
    selectedCardType?: 'yellow' | 'blue' | 'red';
  }>();
  
  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'update:goalDialog', value: boolean): void;
    (e: 'update:foulDialog', value: boolean): void;
    (e: 'update:cardDialog', value: boolean): void;
    (e: 'update:timeRequestDialog', value: boolean): void;
    (e: 'update:penaltyDialog', value: boolean): void;
    (e: 'saveGoal', data: { teamId: string; playerId: string }): void;
    (e: 'saveFoul', data: { teamId: string; playerId: string }): void;
    (e: 'saveCard', data: { teamId: string; playerId: string }): void;
    (e: 'saveTimeRequest', data: { teamId: string; periodo: number }): void;
    (e: 'savePenalty', data: { teamId: string; gol: boolean }): void;
  }>();
  
  // Form states
  const goalForm = ref({
    teamId: '',
    playerId: ''
  });
  
  const foulForm = ref({
    teamId: '',
    playerId: ''
  });
  
  const cardForm = ref({
    teamId: '',
    playerId: ''
  });
  
  const timeRequestForm = ref({
    teamId: '',
    periodo: 1
  });
  
  const penaltyForm = ref({
    teamId: '',
    gol: true
  });
  
  // Dialog models
  const goalDialogModel = computed({
    get: () => props.goalDialog || false,
    set: (value) => emit('update:goalDialog', value)
  });
  
  const foulDialogModel = computed({
    get: () => props.foulDialog || false,
    set: (value) => emit('update:foulDialog', value)
  });
  
  const cardDialogModel = computed({
    get: () => props.cardDialog || false,
    set: (value) => emit('update:cardDialog', value)
  });
  
  const timeRequestDialogModel = computed({
    get: () => props.timeRequestDialog || false,
    set: (value) => emit('update:timeRequestDialog', value)
  });
  
  const penaltyDialogModel = computed({
    get: () => props.penaltyDialog || false,
    set: (value) => emit('update:penaltyDialog', value)
  });
  
  // Available teams for the match
  const availableTeams = computed(() => {
    if (!props.match) return [];
    return props.teams.filter(t => 
      t.id === props.match?.equipoLocalId || 
      t.id === props.match?.equipoVisitanteId
    );
  });
  
  // Helper methods
  const getTeamPlayers = (teamId: string): Player[] => {
    if (!teamId) return [];
    return props.players.filter(p => p.equipoId === teamId);
  };
  
  // Dialog actions
  const closeGoalDialog = () => {
    goalForm.value = { teamId: '', playerId: '' };
    emit('update:goalDialog', false);
  };
  
  const closeFoulDialog = () => {
    foulForm.value = { teamId: '', playerId: '' };
    emit('update:foulDialog', false);
  };
  
  const closeCardDialog = () => {
    cardForm.value = { teamId: '', playerId: '' };
    emit('update:cardDialog', false);
  };
  
  const closeTimeRequestDialog = () => {
    timeRequestForm.value = { teamId: '', periodo: 1 };
    emit('update:timeRequestDialog', false);
  };
  
  const closePenaltyDialog = () => {
    penaltyForm.value = { teamId: '', gol: true };
    emit('update:penaltyDialog', false);
  };
  
  // Save actions
  const saveGoal = () => {
    emit('saveGoal', goalForm.value);
    closeGoalDialog();
  };
  
  const saveFoul = () => {
    emit('saveFoul', foulForm.value);
    closeFoulDialog();
  };
  
  const saveCard = () => {
    emit('saveCard', cardForm.value);
    closeCardDialog();
  };
  
  const saveTimeRequest = () => {
    emit('saveTimeRequest', timeRequestForm.value);
    closeTimeRequestDialog();
  };
  
  const savePenalty = () => {
    emit('savePenalty', penaltyForm.value);
    closePenaltyDialog();
  };
  </script>