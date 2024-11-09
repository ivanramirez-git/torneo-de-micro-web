<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Matches</h1>
      <Button label="Create Match" @click="showDialog = true" />
    </div>

    <DataTable :value="matches" :loading="loading" stripedRows>
      <Column field="fecha" header="Date">
        <template #body="slotProps">
          {{ new Date(slotProps.data.fecha).toLocaleDateString() }}
        </template>
      </Column>
      <Column field="lugar" header="Location"></Column>
      <Column field="equipoLocalId" header="Home Team"></Column>
      <Column field="equipoVisitanteId" header="Away Team"></Column>
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" severity="info" text @click="editMatch(slotProps.data)" />
            <Button icon="pi pi-trash" severity="danger" text @click="deleteMatch(slotProps.data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="showDialog" :header="editMode ? 'Edit Match' : 'Create Match'" modal>
      <div class="flex flex-col gap-4">
        <div>
          <label class="block mb-1">Date</label>
          <Calendar v-model="form.fecha" dateFormat="yy-mm-dd" class="w-full" />
        </div>
        <div>
          <label class="block mb-1">Location</label>
          <InputText v-model="form.lugar" class="w-full" />
        </div>
        <div>
          <label class="block mb-1">Home Team</label>
          <Dropdown v-model="form.equipoLocalId" :options="teams" optionLabel="nombre" optionValue="id" class="w-full" />
        </div>
        <div>
          <label class="block mb-1">Away Team</label>
          <Dropdown v-model="form.equipoVisitanteId" :options="teams" optionLabel="nombre" optionValue="id" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" @click="closeDialog" text />
        <Button :label="editMode ? 'Update' : 'Create'" @click="saveMatch" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTournamentStore } from '../stores/tournament'
import { tournamentService } from '../services/api'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'

const store = useTournamentStore()
const showDialog = ref(false)
const editMode = ref(false)
const loading = ref(false)
const matches = ref([])
const teams = ref([])

const form = ref({
  fecha: null,
  lugar: '',
  equipoLocalId: null,
  equipoVisitanteId: null
})

onMounted(async () => {
  await Promise.all([
    fetchMatches(),
    fetchTeams()
  ])
})

async function fetchMatches() {
  loading.value = true
  try {
    const response = await tournamentService.getMatches()
    matches.value = response.data
  } catch (error) {
    console.error('Error fetching matches:', error)
  }
  loading.value = false
}

async function fetchTeams() {
  try {
    const response = await tournamentService.getTeams()
    teams.value = response.data
  } catch (error) {
    console.error('Error fetching teams:', error)
  }
}

function editMatch(match: any) {
  form.value = {
    ...match,
    fecha: new Date(match.fecha)
  }
  editMode.value = true
  showDialog.value = true
}

async function saveMatch() {
  try {
    const matchData = {
      ...form.value,
      fecha: form.value.fecha?.toISOString()
    }
    
    if (editMode.value) {
      await tournamentService.updateMatch(form.value.id, matchData)
    } else {
      await tournamentService.createMatch(matchData)
    }
    await fetchMatches()
    closeDialog()
  } catch (error) {
    console.error('Error saving match:', error)
  }
}

async function deleteMatch(id: string) {
  try {
    await tournamentService.deleteMatch(id)
    await fetchMatches()
  } catch (error) {
    console.error('Error deleting match:', error)
  }
}

function closeDialog() {
  showDialog.value = false
  editMode.value = false
  form.value = {
    fecha: null,
    lugar: '',
    equipoLocalId: null,
    equipoVisitanteId: null
  }
}
</script>