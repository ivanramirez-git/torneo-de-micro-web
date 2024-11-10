<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Fases de Torneos</h1>
      <Button 
        label="Nueva Fase" 
        icon="pi pi-plus" 
        @click="openDialog()" 
        :disabled="!selectedTournamentId"
        class="p-button-primary"
      />
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Torneo:</label>
        <Dropdown
          v-model="selectedTournamentId"
          :options="tournaments"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Seleccionar torneo"
          class="w-full md:w-auto"
        />
      </div>

      <DataTable 
        :value="phases" 
        :loading="loading"
        dataKey="id"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 20, 50]"
        filterDisplay="menu"
        :filters="filters"
        class="p-datatable-lg"
      >
        <Column field="nombre" header="Nombre" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" @input="filterCallback()" />
          </template>
        </Column>
        <Column field="equiposClasificadosPorGrupo" header="Equipos Clasificados" sortable>
          <template #filter="{ filterModel, filterCallback }">
            <InputNumber v-model="filterModel.value" @input="filterCallback()" />
          </template>
        </Column>
        <Column field="permiteEmpates" header="Permite Empates" sortable>
          <template #body="slotProps">
            <i :class="slotProps.data.permiteEmpates ? 'pi pi-check text-green-500' : 'pi pi-times text-red-500'"></i>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <TriStateCheckbox v-model="filterModel.value" @change="filterCallback()" />
          </template>
        </Column>
        <Column field="createdAt" header="Fecha Creación" sortable>
          <template #body="slotProps">
            {{ new Date(slotProps.data.createdAt).toLocaleDateString() }}
          </template>
        </Column>
        <Column header="Acciones" :exportable="false" style="min-width:12rem">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button 
                icon="pi pi-pencil" 
                @click="editPhase(slotProps.data)"
                class="p-button-text p-button-warning"
                tooltip="Editar"
              />
              <Button 
                icon="pi pi-trash" 
                @click="confirmDelete(slotProps.data)"
                class="p-button-text p-button-danger"
                tooltip="Eliminar"
              />
              <Button 
                icon="pi pi-users" 
                @click="navigateToGroups(slotProps.data.id)"
                class="p-button-text p-button-info"
                tooltip="Gestionar Grupos"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog para agregar/editar fase -->
    <Dialog 
      v-model:visible="dialogVisible" 
      :header="editMode ? 'Editar Fase' : 'Nueva Fase'" 
      modal
      class="p-fluid"
    >
      <div class="p-field mb-4">
        <label for="nombre" class="font-bold mb-2 block">Nombre</label>
        <InputText 
          id="nombre" 
          v-model="phaseForm.nombre" 
          required 
          autofocus
          class="w-full"
        />
      </div>
      <div class="p-field mb-4">
        <label for="equiposClasificadosPorGrupo" class="font-bold mb-2 block">Equipos clasificados por grupo</label>
        <InputNumber 
          id="equiposClasificadosPorGrupo"
          v-model="phaseForm.equiposClasificadosPorGrupo" 
          required
          :min="1"
          class="w-full"
        />
      </div>
      <div class="p-field">
        <div class="flex items-center">
          <Checkbox 
            id="permiteEmpates"
            v-model="phaseForm.permiteEmpates" 
            :binary="true"
          />
          <label for="permiteEmpates" class="ml-2">Permite empates</label>
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
            :label="editMode ? 'Actualizar' : 'Crear'" 
            icon="pi pi-check" 
            @click="savePhase" 
            class="p-button-primary"
          />
        </div>
      </template>
    </Dialog>

    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';
import api from '../../stores/api';

// Components
import Button from 'primevue/button';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import TriStateCheckbox from 'primevue/tristatecheckbox';
import Toast from 'primevue/toast';

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

// State
const tournaments = ref([]);
const phases = ref([]);
const loading = ref(true);
const dialogVisible = ref(false);
const selectedTournamentId = ref('');
const editMode = ref(false);

const filters = ref({
  nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
  equiposClasificadosPorGrupo: { value: null, matchMode: FilterMatchMode.EQUALS },
  permiteEmpates: { value: null, matchMode: FilterMatchMode.EQUALS },
  createdAt: { value: null, matchMode: FilterMatchMode.DATE_IS }
});

const phaseForm = ref({
  nombre: '',
  equiposClasificadosPorGrupo: 1,
  permiteEmpates: false,
  torneoId: ''
});

// Methods
const loadTournaments = async () => {
  try {
    const response = await api.get('/torneos');
    tournaments.value = response.data;
  } catch (error) {
    console.error('Error loading tournaments:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los torneos'
    });
  }
};

const loadPhases = async () => {
  if (!selectedTournamentId.value) {
    phases.value = [];
    return;
  }
  
  loading.value = true;
  try {
    const response = await api.get(`/torneos/${selectedTournamentId.value}/fase-torneos`);
    phases.value = response.data;
  } catch (error) {
    console.error('Error loading phases:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las fases'
    });
  } finally {
    loading.value = false;
  }
};

const openDialog = () => {
  editMode.value = false;
  phaseForm.value = {
    nombre: '',
    equiposClasificadosPorGrupo: 1,
    permiteEmpates: false,
    torneoId: selectedTournamentId.value
  };
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  phaseForm.value = {
    nombre: '',
    equiposClasificadosPorGrupo: 1,
    permiteEmpates: false,
    torneoId: selectedTournamentId.value
  };
};

const savePhase = async () => {
  try {
    if (!phaseForm.value.nombre || phaseForm.value.equiposClasificadosPorGrupo < 1) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    if (editMode.value) {
      await api.patch(`/fase-torneos/${phaseForm.value.id}`, phaseForm.value);
    } else {
      await api.post('/fase-torneos', phaseForm.value);
    }
    
    await loadPhases();
    closeDialog();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Fase ${editMode.value ? 'actualizada' : 'creada'} correctamente`
    });
  } catch (error) {
    console.error('Error saving phase:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo ${editMode.value ? 'actualizar' : 'crear'} la fase`
    });
  }
};

const editPhase = (phase) => {
  editMode.value = true;
  phaseForm.value = { ...phase };
  dialogVisible.value = true;
};

const confirmDelete = (phase) => {
  confirm.require({
    message: '¿Está seguro de eliminar esta fase?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deletePhase(phase.id)
  });
};

const deletePhase = async (id: string) => {
  try {
    await api.delete(`/fase-torneos/${id}`);
    await loadPhases();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Fase eliminada correctamente'
    });
  } catch (error) {
    console.error('Error deleting phase:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar la fase'
    });
  }
};

const navigateToGroups = (phaseId: string) => {
  router.push(`/admin/groups/${phaseId}`);
};

watch(selectedTournamentId, () => {
  loadPhases();
});

onMounted(() => {
  loadTournaments();
});
</script>