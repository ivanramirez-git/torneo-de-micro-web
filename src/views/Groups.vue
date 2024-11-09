<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Groups</h1>
      <Button label="Create Group" @click="showDialog = true" />
    </div>

    <DataTable :value="groups" :loading="loading" stripedRows>
      <Column field="nombre" header="Name"></Column>
      <Column field="fasesTorneoId" header="Tournament Phase"></Column>
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" severity="info" text @click="editGroup(slotProps.data)" />
            <Button icon="pi pi-trash" severity="danger" text @click="deleteGroup(slotProps.data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="showDialog" :header="editMode ? 'Edit Group' : 'Create Group'" modal>
      <div class="flex flex-col gap-4">
        <div>
          <label class="block mb-1">Name</label>
          <InputText v-model="form.nombre" class="w-full" />
        </div>
        <div>
          <label class="block mb-1">Tournament Phase</label>
          <Dropdown v-model="form.fasesTorneoId" :options="tournaments" optionLabel="nombre" optionValue="id" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" @click="closeDialog" text />
        <Button :label="editMode ? 'Update' : 'Create'" @click="saveGroup" />
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
const groups = ref([])
const tournaments = ref([])

const form = ref({
  nombre: '',
  fasesTorneoId: null
})

onMounted(async () => {
  await Promise.all([
    fetchGroups(),
    fetchTournaments()
  ])
})

async function fetchGroups() {
  loading.value = true
  try {
    const response = await tournamentService.getGroups()
    groups.value = response.data
  } catch (error) {
    console.error('Error fetching groups:', error)
  }
  loading.value = false
}

async function fetchTournaments() {
  try {
    const response = await tournamentService.getTournaments()
    tournaments.value = response.data
  } catch (error) {
    console.error('Error fetching tournaments:', error)
  }
}

function editGroup(group: any) {
  form.value = { ...group }
  editMode.value = true
  showDialog.value = true
}

async function saveGroup() {
  try {
    if (editMode.value) {
      await tournamentService.updateGroup(form.value.id, form.value)
    } else {
      await tournamentService.createGroup(form.value)
    }
    await fetchGroups()
    closeDialog()
  } catch (error) {
    console.error('Error saving group:', error)
  }
}

async function deleteGroup(id: string) {
  try {
    await tournamentService.deleteGroup(id)
    await fetchGroups()
  } catch (error) {
    console.error('Error deleting group:', error)
  }
}

function closeDialog() {
  showDialog.value = false
  editMode.value = false
  form.value = {
    nombre: '',
    fasesTorneoId: null
  }
}
</script>