<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Schedule</h1>
      <Button label="Create Schedule" @click="showDialog = true" />
    </div>

    <DataTable :value="schedules" :loading="loading" stripedRows>
      <Column field="fecha" header="Date">
        <template #body="slotProps">
          {{ new Date(slotProps.data.fecha).toLocaleDateString() }}
        </template>
      </Column>
      <Column field="hora" header="Time">
        <template #body="slotProps">
          {{ new Date(slotProps.data.hora).toLocaleTimeString() }}
        </template>
      </Column>
      <Column header="Actions">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" severity="info" text @click="editSchedule(slotProps.data)" />
            <Button icon="pi pi-trash" severity="danger" text @click="deleteSchedule(slotProps.data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="showDialog" :header="editMode ? 'Edit Schedule' : 'Create Schedule'" modal>
      <div class="flex flex-col gap-4">
        <div>
          <label class="block mb-1">Date</label>
          <Calendar v-model="form.fecha" dateFormat="yy-mm-dd" class="w-full" />
        </div>
        <div>
          <label class="block mb-1">Time</label>
          <Calendar v-model="form.hora" timeOnly class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" @click="closeDialog" text />
        <Button :label="editMode ? 'Update' : 'Create'" @click="saveSchedule" />
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
import Calendar from 'primevue/calendar'

const store = useTournamentStore()
const showDialog = ref(false)
const editMode = ref(false)
const loading = ref(false)
const schedules = ref([])

const form = ref({
  fecha: null,
  hora: null,
  partidosId: null
})

onMounted(async () => {
  await fetchSchedules()
})

async function fetchSchedules() {
  loading.value = true
  try {
    const response = await tournamentService.getSchedule()
    schedules.value = response.data
  } catch (error) {
    console.error('Error fetching schedules:', error)
  }
  loading.value = false
}

function editSchedule(schedule: any) {
  form.value = {
    ...schedule,
    fecha: new Date(schedule.fecha),
    hora: new Date(schedule.hora)
  }
  editMode.value = true
  showDialog.value = true
}

async function saveSchedule() {
  try {
    const scheduleData = {
      ...form.value,
      fecha: form.value.fecha?.toISOString(),
      hora: form.value.hora?.toISOString()
    }
    
    if (editMode.value) {
      await tournamentService.updateSchedule(form.value.id, scheduleData)
    } else {
      await tournamentService.createSchedule(scheduleData)
    }
    await fetchSchedules()
    closeDialog()
  } catch (error) {
    console.error('Error saving schedule:', error)
  }
}

async function deleteSchedule(id: string) {
  try {
    await tournamentService.deleteSchedule(id)
    await fetchSchedules()
  } catch (error) {
    console.error('Error deleting schedule:', error)
  }
}

function closeDialog() {
  showDialog.value = false
  editMode.value = false
  form.value = {
    fecha: null,
    hora: null,
    partidosId: null
  }
}
</script>