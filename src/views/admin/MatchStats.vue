<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Estadísticas de Partidos</h1>
      <Button 
        label="Nueva Estadística" 
        icon="pi pi-plus" 
        @click="openDialog()" 
        class="p-button-primary"
      />
    </div>

    <DataTable 
      :value="stats" 
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
      <Column field="goles" header="Goles" sortable></Column>
      <Column field="faltas" header="Faltas" sortable></Column>
      <Column field="tarjetasAmarillas" header="T. Amarillas" sortable></Column>
      <Column field="tarjetasRojas" header="T. Rojas" sortable></Column>
      <Column header="Acciones" :exportable="false" style="min-width:8rem">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button 
              icon="pi pi-pencil" 
              @click="editStats(slotProps.data)"
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

    <!-- Dialog para agregar/editar estadísticas -->
    <Dialog 
      v-model:visible="dialogVisible" 
      :header="editMode ? 'Editar Estadísticas' : 'Nuevas Estadísticas'"
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
      <div class="grid grid-cols-2 gap-4">
        <div class="p-field">
          <label for="goles" class="font-bold mb-2 block">Goles</label>
          <InputNumber 
            id="goles" 
            v-model="formData.goles" 
            :min="0"
            class="w-full"
          />
        </div>
        <div class="p-field">
          <label for="faltas" class="font-bold mb-2 block">Faltas</label>
          <InputNumber 
            id="faltas" 
            v-model="formData.faltas" 
            :min="0"
            class="w-full"
          />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4 mt-4">
        <div class="p-field">
          <label for="tarjetasAzules" class="font-bold mb-2 block">T. Azules</label>
          <InputNumber 
            id="tarjetasAzules" 
            v-model="formData.tarjetasAzules" 
            :min="0"
            class="w-full"
          />
        </div>
        <div class="p-field">
          <label for="tarjetasAmarillas" class="font-bold mb-2 block">T. Amarillas</label>
          <InputNumber 
            id="tarjetasAmarillas" 
            v-model="formData.tarjetasAmarillas" 
            :min="0"
            class="w-full"
          />
        </div>
        <div class="p-field">
          <label for="tarjetasRojas" class="font-bold mb-2 block">T. Rojas</label>
          <InputNumber 
            id="tarjetasRojas" 
            v-model="formData.tarjetasRojas" 
            :min="0"
            class="w-full"
          />
        </div>
      </div>
      <div class="p-field mt-4">
        <label for="sanciones" class="font-bold mb-2 block">Sanciones</label>
        <Textarea 
          id="sanciones" 
          v-model="formData.sanciones" 
          rows="3"
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
            @click="saveStats" 
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
import Textarea from 'primevue/textarea';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

const confirm = useConfirm();
const toast = useToast();

// State
const stats = ref([]);
const matches = ref([]);
const loading = ref(true);
const dialogVisible = ref(false);
const editMode = ref(false);

const filters = ref({
  partidoId: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const formData = ref({
  partidoId: null,
  goles: 0,
  faltas: 0,
  sanciones: '',
  tarjetasAzules: 0,
  tarjetasAmarillas: 0,
  tarjetasRojas: 0
});

// Methods
const loadStats = async () => {
  try {
    loading.value = true;
    const response = await api.get('/estadisticas-partido');
    stats.value = response.data;
  } catch (error) {
    console.error('Error loading stats:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las estadísticas'
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
      description: `${match.fechaProgramacion} - ${match.equipoLocalId} vs ${match.equipoVisitanteId}`
    }));
  } catch (error) {
    console.error('Error loading matches:', error);
  }
};

const getMatchDescription = (matchId: string) => {
  const match = matches.value.find(m => m.id === matchId);
  return match ? match.description : 'Partido no encontrado';
};

const openDialog = () => {
  editMode.value = false;
  formData.value = {
    partidoId: null,
    goles: 0,
    faltas: 0,
    sanciones: '',
    tarjetasAzules: 0,
    tarjetasAmarillas: 0,
    tarjetasRojas: 0
  };
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  formData.value = {
    partidoId: null,
    goles: 0,
    faltas: 0,
    sanciones: '',
    tarjetasAzules: 0,
    tarjetasAmarillas: 0,
    tarjetasRojas: 0
  };
};

const editStats = (stat) => {
  editMode.value = true;
  formData.value = { ...stat };
  dialogVisible.value = true;
};

const saveStats = async () => {
  try {
    if (!formData.value.partidoId) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor seleccione un partido'
      });
      return;
    }

    if (editMode.value) {
      await api.patch(`/estadisticas-partido/${formData.value.id}`, formData.value);
    } else {
      await api.post('/estadisticas-partido', formData.value);
    }
    
    await loadStats();
    closeDialog();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Estadísticas ${editMode.value ? 'actualizadas' : 'guardadas'} correctamente`
    });
  } catch (error) {
    console.error('Error saving stats:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudieron ${editMode.value ? 'actualizar' : 'guardar'} las estadísticas`
    });
  }
};

const confirmDelete = (stat) => {
  confirm.require({
    message: '¿Está seguro de que desea eliminar estas estadísticas?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteStats(stat.id)
  });
};

const deleteStats = async (id) => {
  try {
    await api.delete(`/estadisticas-partido/${id}`);
    await loadStats();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Estadísticas eliminadas correctamente'
    });
  } catch (error) {
    console.error('Error deleting stats:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron eliminar las estadísticas'
    });
  }
};

onMounted(() => {
  loadStats();
  loadMatches();
});
</script>