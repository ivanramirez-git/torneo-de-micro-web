<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Torneos</h1>
      <Button 
        label="Nuevo Torneo" 
        icon="pi pi-plus" 
        @click="showAddDialog = true" 
        class="p-button-primary"
      />
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <DataTable 
        :value="tournaments" 
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
          <template #body="slotProps">
            <span :style="{ color: slotProps.data.color }">{{ slotProps.data.nombre }}</span>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" @input="filterCallback()" />
          </template>
        </Column>
        <Column field="color" header="Color" sortable>
          <template #body="slotProps">
            <div class="flex items-center">
              <div class="w-4 h-4 rounded-full mr-2" :style="{ backgroundColor: slotProps.data.color }"></div>
              {{ slotProps.data.color }}
            </div>
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
                @click="editTournament(slotProps.data)"
                class="p-button-text p-button-warning"
                tooltip="Editar"
              />
              <Button 
                icon="pi pi-trash" 
                @click="deleteTournament(slotProps.data.id)"
                class="p-button-text p-button-danger"
                tooltip="Eliminar"
              />
              <Button 
                icon="pi pi-sitemap" 
                @click="selectTournament(slotProps.data)"
                class="p-button-text p-button-info"
                tooltip="Gestionar Fases"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Sección de Fases -->
    <div v-if="selectedTournament" class="mt-8 bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">
          Fases del Torneo: {{ selectedTournament.nombre }}
        </h2>
        <Button 
          label="Agregar Fase" 
          icon="pi pi-plus" 
          @click="showAddPhaseDialog = true" 
          class="p-button-primary"
        />
      </div>

      <DataTable 
        :value="phases" 
        :loading="loadingPhases"
        dataKey="id"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 20, 50]"
        class="p-datatable-lg"
      >
        <Column field="nombre" header="Nombre" sortable></Column>
        <Column field="equiposClasificadosPorGrupo" header="Equipos Clasificados" sortable></Column>
        <Column field="permiteEmpates" header="Permite Empates" sortable>
          <template #body="slotProps">
            <i :class="slotProps.data.permiteEmpates ? 'pi pi-check text-green-500' : 'pi pi-times text-red-500'"></i>
          </template>
        </Column>
        <Column header="Acciones" :exportable="false" style="min-width:8rem">
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
                @click="deletePhase(slotProps.data.id)"
                class="p-button-text p-button-danger"
                tooltip="Eliminar"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog para torneo -->
    <Dialog 
      v-model:visible="showAddDialog" 
      :header="editingTournament ? 'Editar Torneo' : 'Nuevo Torneo'" 
      modal
      class="p-fluid"
    >
      <div class="p-field mb-4">
        <label for="nombre" class="font-bold mb-2 block">Nombre</label>
        <InputText 
          id="nombre" 
          v-model="tournamentForm.nombre" 
          required 
          autofocus
          class="w-full"
        />
      </div>
      <div class="p-field">
        <label for="color" class="font-bold mb-2 block">Color</label>
        <ColorPicker 
          id="color"
          v-model="tournamentForm.color" 
          class="w-full"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button 
            label="Cancelar" 
            icon="pi pi-times" 
            @click="showAddDialog = false" 
            class="p-button-text"
          />
          <Button 
            :label="editingTournament ? 'Actualizar' : 'Crear'" 
            icon="pi pi-check" 
            @click="saveTournament" 
            class="p-button-primary"
          />
        </div>
      </template>
    </Dialog>

    <!-- Dialog para fase -->
    <Dialog 
      v-model:visible="showAddPhaseDialog" 
      :header="editingPhase ? 'Editar Fase' : 'Nueva Fase'" 
      modal
      class="p-fluid"
    >
      <div class="p-field mb-4">
        <label for="phaseNombre" class="font-bold mb-2 block">Nombre</label>
        <InputText 
          id="phaseNombre" 
          v-model="phaseForm.nombre" 
          required 
          class="w-full"
        />
      </div>
      <div class="p-field mb-4">
        <label for="equiposClasificados" class="font-bold mb-2 block">Equipos clasificados por grupo</label>
        <InputNumber 
          id="equiposClasificados"
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
            @click="showAddPhaseDialog = false" 
            class="p-button-text"
          />
          <Button 
            :label="editingPhase ? 'Actualizar' : 'Crear'" 
            icon="pi pi-check" 
            @click="savePhase" 
            class="p-button-primary"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from 'primevue/api';
import { useToast } from 'primevue/usetoast';
import api from '../../stores/api';

// Components
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import ColorPicker from 'primevue/colorpicker';
import Toast from 'primevue/toast';

const toast = useToast();

// State
const tournaments = ref([]);
const phases = ref([]);
const loading = ref(true);
const loadingPhases = ref(false);
const showAddDialog = ref(false);
const showAddPhaseDialog = ref(false);
const editingTournament = ref(null);
const editingPhase = ref(null);
const selectedTournament = ref(null);

const filters = ref({
  nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
  color: { value: null, matchMode: FilterMatchMode.CONTAINS },
  createdAt: { value: null, matchMode: FilterMatchMode.DATE_IS }
});

const tournamentForm = ref({
  nombre: '',
  color: '#000000'
});

const phaseForm = ref({
  nombre: '',
  equiposClasificadosPorGrupo: 1,
  permiteEmpates: false
});

// Methods
const loadTournaments = async () => {
  try {
    loading.value = true;
    const response = await api.get('/torneos');
    tournaments.value = response.data;
  } catch (error) {
    console.error('Error loading tournaments:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los torneos'
    });
  } finally {
    loading.value = false;
  }
};

const loadTournamentPhases = async (tournamentId: string) => {
  loadingPhases.value = true;
  try {
    const response = await api.get(`/torneos/${tournamentId}/fase-torneos`);
    phases.value = response.data;
  } catch (error) {
    console.error('Error loading phases:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las fases del torneo'
    });
  } finally {
    loadingPhases.value = false;
  }
};

const saveTournament = async () => {
  try {
    if (!tournamentForm.value.nombre) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El nombre es requerido'
      });
      return;
    }

    if (editingTournament.value) {
      await api.patch(`/torneos/${editingTournament.value.id}`, tournamentForm.value);
    } else {
      await api.post('/torneos', tournamentForm.value);
    }
    
    await loadTournaments();
    showAddDialog.value = false;
    resetTournamentForm();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Torneo ${editingTournament.value ? 'actualizado' : 'creado'} correctamente`
    });
  } catch (error) {
    console.error('Error saving tournament:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo ${editingTournament.value ? 'actualizar' : 'crear'} el torneo`
    });
  }
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

    const phaseData = {
      ...phaseForm.value,
      torneoId: selectedTournament.value.id
    };

    if (editingPhase.value) {
      await api.patch(`/fase-torneos/${editingPhase.value.id}`, phaseData);
    } else {
      await api.post('/fase-torneos', phaseData);
    }
    
    if (selectedTournament.value) {
      await loadTournamentPhases(selectedTournament.value.id);
    }
    
    showAddPhaseDialog.value = false;
    resetPhaseForm();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Fase ${editingPhase.value ? 'actualizada' : 'creada'} correctamente`
    });
  } catch (error) {
    console.error('Error saving phase:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo ${editingPhase.value ? 'actualizar' : 'crear'} la fase`
    });
  }
};

const editTournament = (tournament) => {
  editingTournament.value = tournament;
  tournamentForm.value = { ...tournament };
  showAddDialog.value = true;
};

const editPhase = (phase) => {
  editingPhase.value = phase;
  phaseForm.value = { ...phase };
  showAddPhaseDialog.value = true;
};

const deleteTournament = async (id: string) => {
  if (confirm('¿Está seguro de eliminar este torneo?')) {
    try {
      await api.delete(`/torneos/${id}`);
      await loadTournaments();
      if (selectedTournament.value?.id === id) {
        selectedTournament.value = null;
        phases.value = [];
      }
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Torneo eliminado correctamente'
      });
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo eliminar el torneo'
      });
    }
  }
};

const deletePhase = async (id: string) => {
  if (confirm('¿Está seguro de eliminar esta fase?')) {
    try {
      await api.delete(`/fase-torneos/${id}`);
      if (selectedTournament.value) {
        await loadTournamentPhases(selectedTournament.value.id);
      }
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
  }
};

const selectTournament = (tournament) => {
  selectedTournament.value = tournament;
  loadTournamentPhases(tournament.id);
};

const resetTournamentForm = () => {
  editingTournament.value = null;
  tournamentForm.value = {
    nombre: '',
    color: '#000000'
  };
};

const resetPhaseForm = () => {
  editingPhase.value = null;
  phaseForm.value = {
    nombre: '',
    equiposClasificadosPorGrupo: 1,
    permiteEmpates: false
  };
};

onMounted(loadTournaments);
</script>