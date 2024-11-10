<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Penales</h1>
      <Button 
        label="Nuevo Penal" 
        icon="pi pi-plus" 
        @click="openDialog()" 
        class="p-button-primary"
      />
    </div>

    <DataTable 
      :value="penalties" 
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
      <Column field="gol" header="Gol" sortable>
        <template #body="slotProps">
          <i :class="slotProps.data.gol ? 'pi pi-check text-green-500' : 'pi pi-times text-red-500'"></i>
        </template>
      </Column>
      <Column field="createdAt" header="Fecha" sortable>
        <template #body="slotProps">
          {{ new Date(slotProps.data.createdAt).toLocaleDateString() }}
        </template>
      </Column>
      <Column header="Acciones" :exportable="false" style="min-width:8rem">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button 
              icon="pi pi-pencil" 
              @click="editPenalty(slotProps.data)"
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

    <!-- Dialog para agregar/editar penal -->
    <Dialog 
      v-model:visible="dialogVisible" 
      :header="editMode ? 'Editar Penal' : 'Nuevo Penal'"
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
        <label class="font-bold mb-2 block">¿Fue gol?</label>
        <div class="flex gap-4">
          <div class="flex items-center">
            <RadioButton 
              v-model="formData.gol" 
              :value="true"
              inputId="gol-si"
            />
            <label for="gol-si" class="ml-2">Sí</label>
          </div>
          <div class="flex items-center">
            <RadioButton 
              v-model="formData.gol" 
              :value="false"
              inputId="gol-no"
            />
            <label for="gol-no" class="ml-2">No</label>
          </div>
        </div>
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
            @click="savePenalty" 
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
import RadioButton from 'primevue/radiobutton';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

const confirm = useConfirm();
const toast = useToast();

// State
const penalties = ref([]);
const matches = ref([]);
const loading = ref(true);
const dialogVisible = ref(false);
const editMode = ref(false);

const filters = ref({
  partidoId: { value: null, matchMode: FilterMatchMode.EQUALS },
  gol: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const formData = ref({
  partidoId: null,
  gol: true
});

// Methods
const loadPenalties = async () => {
  try {
    loading.value = true;
    const response = await api.get('/penales');
    penalties.value = response.data;
  } catch (error) {
    console.error('Error loading penalties:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los penales'
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

const openDialog = () => {
  editMode.value = false;
  formData.value = {
    partidoId: null,
    gol: true
  };
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  formData.value = {
    partidoId: null,
    gol: true
  };
};

const editPenalty = (penalty) => {
  editMode.value = true;
  formData.value = { ...penalty };
  dialogVisible.value = true;
};

const savePenalty = async () => {
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
      await api.patch(`/penales/${formData.value.id}`, formData.value);
    } else {
      await api.post('/penales', formData.value);
    }
    
    await loadPenalties();
    closeDialog();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Penal ${editMode.value ? 'actualizado' : 'registrado'} correctamente`
    });
  } catch (error) {
    console.error('Error saving penalty:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo ${editMode.value ? 'actualizar' : 'registrar'} el penal`
    });
  }
};

const confirmDelete = (penalty) => {
  confirm.require({
    message: '¿Está seguro de que desea eliminar este penal?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deletePenalty(penalty.id)
  });
};

const deletePenalty = async (id) => {
  try {
    await api.delete(`/penales/${id}`);
    await loadPenalties();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Penal eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting penalty:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el penal'
    });
  }
};

onMounted(() => {
  loadPenalties();
  loadMatches();
});
</script>