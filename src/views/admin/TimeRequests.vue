<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Solicitudes de Tiempo</h1>
      <Button 
        label="Nueva Solicitud" 
        icon="pi pi-plus" 
        @click="openDialog()" 
        class="p-button-primary"
      />
    </div>

    <DataTable 
      :value="timeRequests" 
      :loading="loading"
      dataKey="id"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      filterDisplay="menu"
      :filters="filters"
      class="p-datatable-lg"
    >
      <Column field="partidoId" header="Partido" sortable>
        <template #body="slotProps">
          {{ getMatchDescription(slotProps.data.partidoId) }}
        </template>
      </Column>
      <Column field="periodo" header="Periodo" sortable></Column>
      <Column field="minuto" header="Minuto" sortable>
        <template #body="slotProps">
          {{ formatTime(slotProps.data.minuto) }}
        </template>
      </Column>
      <Column field="createdAt" header="Fecha Creación" sortable>
        <template #body="slotProps">
          {{ new Date(slotProps.data.createdAt).toLocaleDateString() }}
        </template>
      </Column>
      <Column header="Acciones" :exportable="false" style="min-width:8rem">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button 
              icon="pi pi-pencil" 
              @click="editTimeRequest(slotProps.data)"
              class="p-button-text p-button-warning"
            />
            <Button 
              icon="pi pi-trash" 
              @click="confirmDelete(slotProps.data)"
              class="p-button-text p-button-danger"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Dialog para agregar/editar solicitud -->
    <Dialog 
      v-model:visible="dialogVisible" 
      :header="editMode ? 'Editar Solicitud' : 'Nueva Solicitud'"
      modal
      class="p-fluid"
    >
      <div class="p-field mb-4">
        <label for="partidoId" class="font-bold mb-2 block">Partido</label>
        <Dropdown
          id="partidoId"
          v-model="formData.partidoId"
          :options="matches"
          optionLabel="description"
          optionValue="id"
          placeholder="Seleccione un partido"
          class="w-full"
        />
      </div>
      <div class="p-field mb-4">
        <label for="periodo" class="font-bold mb-2 block">Periodo</label>
        <InputNumber 
          id="periodo" 
          v-model="formData.periodo" 
          :min="1"
          :max="4"
          class="w-full"
        />
      </div>
      <div class="p-field mb-4">
        <label for="minuto" class="font-bold mb-2 block">Minuto</label>
        <Calendar
          id="minuto"
          v-model="formData.minuto"
          timeOnly
          class="w-full"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button 
            label="Cancelar" 
            icon="pi pi-times" 
            @click="closeDialog" 
            class="p-button-text"
          />
          <Button 
            :label="editMode ? 'Actualizar' : 'Guardar'" 
            icon="pi pi-check" 
            @click="saveTimeRequest" 
            class="p-button-primary"
          />
        </div>
      </template>
    </Dialog>

    <ConfirmDialog></ConfirmDialog>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';
import api from '../../stores/api';

// Components
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

const confirm = useConfirm();
const toast = useToast();

// State
const timeRequests = ref([]);
const matches = ref([]);
const loading = ref(true);
const dialogVisible = ref(false);
const editMode = ref(false);

const filters = ref({
  partidoId: { value: null, matchMode: FilterMatchMode.EQUALS },
  periodo: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const formData = ref({
  partidoId: null,
  periodo: 1,
  minuto: null
});

// Methods
const loadTimeRequests = async () => {
  try {
    loading.value = true;
    const response = await api.get('/solicitudes-tiempo');
    timeRequests.value = response.data;
  } catch (error) {
    console.error('Error loading time requests:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las solicitudes de tiempo'
    });
  } finally {
    loading.value = false;
  }
};

const loadMatches = async () => {
  try {
    const response = await api.get('/partidos');
    matches.value = response.data.map(match => ({
      ...match,
      description: `${new Date(match.fechaProgramacion).toLocaleDateString()} - ${match.equipoLocalId} vs ${match.equipoVisitanteId}`
    }));
  } catch (error) {
    console.error('Error loading matches:', error);
  }
};

const getMatchDescription = (matchId: string) => {
  const match = matches.value.find(m => m.id === matchId);
  return match ? match.description : 'Partido no encontrado';
};

const formatTime = (time: string) => {
  return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const openDialog = () => {
  editMode.value = false;
  formData.value = {
    partidoId: null,
    periodo: 1,
    minuto: null
  };
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  formData.value = {
    partidoId: null,
    periodo: 1,
    minuto: null
  };
};

const editTimeRequest = (timeRequest) => {
  editMode.value = true;
  formData.value = {
    ...timeRequest,
    minuto: new Date(timeRequest.minuto)
  };
  dialogVisible.value = true;
};

const saveTimeRequest = async () => {
  try {
    if (!formData.value.partidoId || !formData.value.minuto) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    if (editMode.value) {
      await api.patch(`/solicitudes-tiempo/${formData.value.id}`, formData.value);
    } else {
      await api.post('/solicitudes-tiempo', formData.value);
    }
    
    await loadTimeRequests();
    closeDialog();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Solicitud ${editMode.value ? 'actualizada' : 'creada'} correctamente`
    });
  } catch (error) {
    console.error('Error saving time request:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo ${editMode.value ? 'actualizar' : 'crear'} la solicitud`
    });
  }
};

const confirmDelete = (timeRequest) => {
  confirm.require({
    message: '¿Está seguro de que desea eliminar esta solicitud?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteTimeRequest(timeRequest.id)
  });
};

const deleteTimeRequest = async (id) => {
  try {
    await api.delete(`/solicitudes-tiempo/${id}`);
    await loadTimeRequests();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Solicitud eliminada correctamente'
    });
  } catch (error) {
    console.error('Error deleting time request:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar la solicitud'
    });
  }
};

onMounted(() => {
  loadTimeRequests();
  loadMatches();
});
</script>