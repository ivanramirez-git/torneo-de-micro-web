<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Players</h1>
      <Button label="Create Player" @click="showDialog = true" />
    </div>

    <DataTable :value="players" :loading="loading" stripedRows>
      <Column field="nombre" header="Name"></Column>
      <Column field="numero" header="Number"></Column>
      <Column field="equiposId" header="Team"></Column>
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" severity="info" text @click="editPlayer(slotProps.data)" />
            <Button icon="pi pi-trash" severity="danger" text @click="deletePlayer(slotProps.data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="showDialog" :header="editMode ? 'Edit Player' : 'Create Player'" modal>
      <div class="flex flex-col gap-4">
        <div>
          <label class="block mb-1">Name</label>
          <InputText v-model="form.nombre" class="w-full" />
        </div>
        <div>
          <label class="block mb-1">Number</label>
          <InputNumber v-model="form.numero" class="w-full" />
        </div>
        <div>
          <label class="block mb-1">Team</label>
          <Dropdown v-model="form.equiposId" :options="teams" optionLabel="nombre" optionValue="id" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" @click="closeDialog" text />
        <Button :label="editMode ? 'Update' : 'Create'" @click="savePlayer" />
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
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'

const store = useTournamentStore()
const showDialog = ref(false)
const editMode = ref(false)
const loading = ref(false)
const players = ref([])
const teams = ref([])

const form = ref({
  nombre: '',
  numero: null,
  equiposId: null
})

onMounted(async () => {
  await Promise.all([
    fetchPlayers(),
    fetchTeams()
  ])
})

async function fetchPlayers() {
  loading.value = true
  try {
    const response = await tournamentService.getPlayers()
    players.value = response.data
  } catch (error) {
    console.error('Error fetching players:', error)
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

function editPlayer(player: any) {
  form.value = { ...player }
  editMode.value = true
  showDialog.value = true
}

async function savePlayer() {
  try {
    if (editMode.value) {
      await tournamentService.updatePlayer(form.value.id, form.value)
    } else {
      await tournamentService.createPlayer(form.value)
    }
    await fetchPlayers()
    closeDialog()
  } catch (error) {
    console.error('Error saving player:', error)
  }
}

async function deletePlayer(id: string) {
  try {
    await tournamentService.deletePlayer(id)
    await fetchPlayers()
  } catch (error) {
    console.error('Error deleting player:', error)
  }
}

function closeDialog() {
  showDialog.value = false
  editMode.value = false
  form.value = {
    nombre: '',
    numero: null,
    equiposId: null
  }
}
</script>