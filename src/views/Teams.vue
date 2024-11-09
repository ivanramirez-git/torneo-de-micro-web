<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Teams</h1>
      <Button label="Create Team" @click="showDialog = true" />
    </div>

    <DataTable :value="teams" :loading="loading" stripedRows>
      <Column field="nombre" header="Name"></Column>
      <Column field="color" header="Color"></Column>
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" severity="info" text @click="editTeam(slotProps.data)" />
            <Button icon="pi pi-trash" severity="danger" text @click="deleteTeam(slotProps.data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="showDialog" :header="editMode ? 'Edit Team' : 'Create Team'" modal>
      <div class="flex flex-col gap-4">
        <div>
          <label class="block mb-1">Name</label>
          <InputText v-model="form.nombre" class="w-full" />
        </div>
        <div>
          <label class="block mb-1">Color</label>
          <InputText v-model="form.color" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" @click="closeDialog" text />
        <Button :label="editMode ? 'Update' : 'Create'" @click="saveTeam" />
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

const store = useTournamentStore()
const showDialog = ref(false)
const editMode = ref(false)
const loading = ref(false)
const teams = ref([])

const form = ref({
  id: '',
  nombre: '',
  color: ''
})

onMounted(async () => {
  await fetchTeams()
})

async function fetchTeams() {
  loading.value = true
  try {
    const response = await tournamentService.getTeams()
    teams.value = response.data
  } catch (error) {
    console.error('Error fetching teams:', error)
  }
  loading.value = false
}

function editTeam(team: any) {
  form.value = { ...team }
  editMode.value = true
  showDialog.value = true
}

async function saveTeam() {
  try {
    if (editMode.value) {
      await tournamentService.updateTeam(form.value.id, form.value)
    } else {
      await tournamentService.createTeam(form.value)
    }
    await fetchTeams()
    closeDialog()
  } catch (error) {
    console.error('Error saving team:', error)
  }
}

async function deleteTeam(id: string) {
  try {
    await tournamentService.deleteTeam(id)
    await fetchTeams()
  } catch (error) {
    console.error('Error deleting team:', error)
  }
}

function closeDialog() {
  showDialog.value = false
  editMode.value = false
  form.value = {
    id: '',
    nombre: '',
    color: ''
  }
}
</script>