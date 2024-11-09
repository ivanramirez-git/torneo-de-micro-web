<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Tournaments</h1>
      <Button label="Create Tournament" @click="showDialog = true" />
    </div>

    <DataTable :value="tournaments" :loading="loading" stripedRows>
      <Column field="nombre" header="Name"></Column>
      <Column field="tipo" header="Type"></Column>
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" severity="info" text @click="editTournament(slotProps.data)" />
            <Button icon="pi pi-trash" severity="danger" text @click="deleteTournament(slotProps.data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="showDialog" :header="editMode ? 'Edit Tournament' : 'Create Tournament'" modal>
      <div class="flex flex-col gap-4">
        <div>
          <label class="block mb-1">Name</label>
          <InputText v-model="form.nombre" class="w-full" />
        </div>
        <div>
          <label class="block mb-1">Type</label>
          <Dropdown v-model="form.tipo" :options="tournamentTypes" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" @click="closeDialog" text />
        <Button :label="editMode ? 'Update' : 'Create'" @click="saveTournament" />
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
import Dropdown from 'primevue/dropdown'

const store = useTournamentStore()
const showDialog = ref(false)
const editMode = ref(false)
const loading = ref(false)
const tournaments = ref([])

const form = ref({
  nombre: '',
  tipo: ''
})

const tournamentTypes = ['fase de grupos', 'eliminatoria']

onMounted(async () => {
  await fetchTournaments()
})

async function fetchTournaments() {
  loading.value = true
  try {
    const response = await tournamentService.getTournaments()
    tournaments.value = response.data
  } catch (error) {
    console.error('Error fetching tournaments:', error)
  }
  loading.value = false
}

function editTournament(tournament: any) {
  form.value = { ...tournament }
  editMode.value = true
  showDialog.value = true
}

async function saveTournament() {
  try {
    if (editMode.value) {
      await tournamentService.updateTournament(form.value.id, form.value)
    } else {
      await tournamentService.createTournament(form.value)
    }
    await fetchTournaments()
    closeDialog()
  } catch (error) {
    console.error('Error saving tournament:', error)
  }
}

async function deleteTournament(id: string) {
  try {
    await tournamentService.deleteTournament(id)
    await fetchTournaments()
  } catch (error) {
    console.error('Error deleting tournament:', error)
  }
}

function closeDialog() {
  showDialog.value = false
  editMode.value = false
  form.value = {
    nombre: '',
    tipo: ''
  }
}
</script>