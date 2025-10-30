<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestión de Grupos</h1>
      <Button 
        label="Nuevo Grupo" 
        icon="pi pi-plus" 
        @click="openDialog()" 
        class="p-button-primary"
      />
    </div>

    <!-- Filtro por Torneo -->
    <div class="mb-4 flex items-center gap-3">
      <label for="tournamentFilter" class="font-semibold">Filtrar por Torneo:</label>
      <Dropdown
        id="tournamentFilter"
        v-model="selectedTournament"
        :options="tournaments"
        optionLabel="nombre"
        optionValue="id"
        placeholder="Todos los torneos"
        @change="onTournamentChange"
        class="w-64"
      />
    </div>

    <DataTable 
      :value="groups" 
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
      <Column field="faseTorneoId" header="Fase de Torneo" sortable>
        <template #body="slotProps">
          {{ getPhaseName(slotProps.data.faseTorneoId) }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Dropdown 
            v-model="filterModel.value"
            :options="tournamentPhases"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccionar fase"
            @change="filterCallback()"
          />
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
              @click="editGroup(slotProps.data)"
              class="p-button-text p-button-warning"
            />
            <Button 
              icon="pi pi-trash" 
              @click="confirmDelete(slotProps.data)"
              class="p-button-text p-button-danger"
            />
            <Button 
              icon="pi pi-users" 
              @click="manageTeams(slotProps.data)"
              class="p-button-text p-button-info"
              tooltip="Gestionar Equipos"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Dialog para agregar/editar grupo -->
    <Dialog 
      v-model:visible="dialogVisible" 
      :header="editMode ? 'Editar Grupo' : 'Nuevo Grupo'"
      modal
      class="p-fluid"
    >
      <div class="p-field mb-4">
        <label for="nombre" class="font-bold mb-2 block">Nombre</label>
        <InputText 
          id="nombre" 
          v-model="groupForm.nombre" 
          required 
          autofocus
          class="w-full"
        />
      </div>
      <div class="p-field mb-4">
        <label for="faseTorneoId" class="font-bold mb-2 block">Fase de Torneo</label>
        <Dropdown
          id="faseTorneoId"
          v-model="groupForm.faseTorneoId"
          :options="tournamentPhases"
          optionLabel="nombre"
          optionValue="id"
          placeholder="Seleccione una fase"
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
            :label="editMode ? 'Actualizar' : 'Crear'" 
            icon="pi pi-check" 
            @click="saveGroup" 
            class="p-button-primary"
          />
        </div>
      </template>
    </Dialog>

    <!-- Dialog para gestionar equipos -->
    <Dialog 
      v-model:visible="teamsDialogVisible" 
      :header="selectedGroup ? `Equipos del Grupo: ${selectedGroup.nombre}` : 'Equipos del Grupo'"
      modal
      maximizable
      style="width: 90vw"
      :contentStyle="{ padding: '0' }"
    >
      <div v-if="selectedGroup" class="p-6">
        <!-- Título Equipos Disponibles -->
        <div class="mb-4">
          <h3 class="text-lg font-bold text-gray-800 mb-3">
            <i class="pi pi-list mr-2"></i>Equipos Disponibles
          </h3>
          <p class="text-sm text-gray-600 mb-4">Selecciona los equipos que deseas agregar al grupo</p>
        </div>

        <!-- Tabla de Equipos Disponibles -->
        <DataTable
          :value="availableTeams"
          v-model:selection="selectedTeams"
          dataKey="id"
          :rows="10"
          paginator
          selectionMode="multiple"
          :rowsPerPageOptions="[10, 20, 50]"
          class="mb-6 p-datatable-striped"
          responsiveLayout="scroll"
          :globalFilterFields="['nombre']"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span class="text-sm font-semibold">{{ availableTeams.length }} equipos disponibles</span>
            </div>
          </template>

          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          
          <Column field="nombre" header="Nombre" sortable>
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.nombre }}</span>
            </template>
          </Column>
          
          <Column field="color" header="Color" style="width: 20%">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <div 
                  class="w-6 h-6 rounded-full border border-gray-300 shadow-sm" 
                  :style="{ backgroundColor: '#' + slotProps.data.color }"
                  :title="slotProps.data.color"
                ></div>
                <span class="text-sm font-mono text-gray-600">#{{ slotProps.data.color }}</span>
              </div>
            </template>
          </Column>

          <template #emptyMessage>
            <div class="text-center py-8">
              <i class="pi pi-inbox text-3xl text-gray-400 mb-2"></i>
              <p class="text-gray-500">Todos los equipos han sido asignados a este grupo</p>
            </div>
          </template>
        </DataTable>

        <!-- Divisor -->
        <Divider align="center">
          <div class="flex items-center gap-2">
            <i class="pi pi-arrow-down text-sm text-gray-400"></i>
            <span class="text-sm font-semibold text-gray-700">Equipos Asignados</span>
            <i class="pi pi-arrow-down text-sm text-gray-400"></i>
          </div>
        </Divider>

        <!-- Título Equipos Asignados -->
        <div class="mb-4">
          <h3 class="text-lg font-bold text-gray-800 mb-3">
            <i class="pi pi-check-circle mr-2 text-green-600"></i>Equipos Asignados
          </h3>
        </div>

        <!-- Tabla de Equipos Asignados -->
        <DataTable
          :value="groupTeams"
          dataKey="id"
          :rows="10"
          paginator
          :rowsPerPageOptions="[10, 20, 50]"
          class="p-datatable-striped"
          responsiveLayout="scroll"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span class="text-sm font-semibold">{{ groupTeams.length }} equipos asignados</span>
            </div>
          </template>

          <Column field="nombre" header="Nombre" sortable>
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.nombre }}</span>
            </template>
          </Column>
          
          <Column field="color" header="Color" style="width: 20%">
            <template #body="slotProps">
              <div class="flex items-center gap-2">
                <div 
                  class="w-6 h-6 rounded-full border border-gray-300 shadow-sm" 
                  :style="{ backgroundColor: '#' + slotProps.data.color }"
                  :title="slotProps.data.color"
                ></div>
                <span class="text-sm font-mono text-gray-600">#{{ slotProps.data.color }}</span>
              </div>
            </template>
          </Column>
          
          <Column header="Acciones" style="width: 10%">
            <template #body="slotProps">
              <Button
                icon="pi pi-trash"
                @click="removeTeamFromGroup(slotProps.data)"
                class="p-button-text p-button-danger p-button-sm"
                title="Eliminar equipo"
              />
            </template>
          </Column>

          <template #emptyMessage>
            <div class="text-center py-8">
              <i class="pi pi-inbox text-3xl text-gray-400 mb-2"></i>
              <p class="text-gray-500">No hay equipos asignados a este grupo</p>
            </div>
          </template>
        </DataTable>
      </div>
      <template #footer>
        <div class="flex justify-between items-center bg-gray-50 -mx-6 -mb-6 px-6 py-4 border-t border-gray-200">
          <div class="text-sm text-gray-600">
            <span v-if="selectedTeams.length > 0" class="font-semibold text-blue-600">
              {{ selectedTeams.length }} equipo(s) seleccionado(s)
            </span>
            <span v-else class="text-gray-500">
              Selecciona equipos para agregarlos
            </span>
          </div>
          <div class="flex justify-end gap-3">
            <Button 
              label="Cerrar" 
              icon="pi pi-times" 
              @click="teamsDialogVisible = false" 
              class="p-button-outlined"
              severity="secondary"
            />
            <Button 
              label="Agregar Seleccionados" 
              icon="pi pi-plus" 
              @click="addTeamsToGroup" 
              class="p-button-primary"
              :disabled="!selectedTeams.length"
              :loading="false"
            />
          </div>
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
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

const confirm = useConfirm();
const toast = useToast();

// State
const groups = ref([]);
const allGroups = ref([]);
const tournaments = ref([]);
const phases = ref([]);
const tournamentPhases = ref([]);
const loading = ref(true);
const dialogVisible = ref(false);
const editMode = ref(false);
const teamsDialogVisible = ref(false);
const selectedGroup = ref(null);
const availableTeams = ref([]);
const groupTeams = ref([]);
const selectedTeams = ref([]);
const selectedTournament = ref('');

const filters = ref({
  nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
  faseTorneoId: { value: null, matchMode: FilterMatchMode.EQUALS }
});

const groupForm = ref({
  nombre: '',
  faseTorneoId: null
});

// Methods
const loadGroups = async () => {
  try {
    loading.value = true;
    const response = await api.get('/grupos');
    allGroups.value = response.data;
    groups.value = response.data;
  } catch (error) {
    console.error('Error loading groups:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los grupos'
    });
  } finally {
    loading.value = false;
  }
};

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

const loadPhasesData = async () => {
  try {
    const response = await api.get('/fase-torneos');
    phases.value = response.data;
  } catch (error) {
    console.error('Error loading phases:', error);
  }
};

const onTournamentChange = () => {
  if (!selectedTournament.value) {
    groups.value = allGroups.value;
  } else {
    // Get phases for selected tournament
    const phasesInTournament = phases.value.filter((p: any) => p.torneoId === selectedTournament.value);
    const phaseIds = phasesInTournament.map((p: any) => p.id);
    
    console.log('Selected Tournament:', selectedTournament.value);
    console.log('Phases in tournament:', phasesInTournament);
    console.log('Phase IDs:', phaseIds);
    console.log('All groups:', allGroups.value);
    
    // Filter groups by phase IDs
    const filtered = allGroups.value.filter((g: any) => phaseIds.includes(g.faseTorneoId));
    console.log('Filtered groups:', filtered);
    
    groups.value = filtered;
  }
};

const loadTournamentPhases = async () => {
  try {
    const response = await api.get('/fase-torneos');
    tournamentPhases.value = response.data;
  } catch (error) {
    console.error('Error loading tournament phases:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las fases del torneo'
    });
  }
};

const getPhaseName = (phaseId: string) => {
  const phase = tournamentPhases.value.find(p => p.id === phaseId);
  return phase ? phase.nombre : 'No asignada';
};

const openDialog = () => {
  editMode.value = false;
  groupForm.value = {
    nombre: '',
    faseTorneoId: null
  };
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  groupForm.value = {
    nombre: '',
    faseTorneoId: null
  };
};

const editGroup = (group) => {
  editMode.value = true;
  groupForm.value = { ...group };
  dialogVisible.value = true;
};

const saveGroup = async () => {
  try {
    if (!groupForm.value.nombre || !groupForm.value.faseTorneoId) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    if (editMode.value) {
      await api.patch(`/grupos/${groupForm.value.id}`, groupForm.value);
    } else {
      await api.post('/grupos', groupForm.value);
    }
    
    await loadGroups();
    closeDialog();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Grupo ${editMode.value ? 'actualizado' : 'creado'} correctamente`
    });
  } catch (error) {
    console.error('Error saving group:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo ${editMode.value ? 'actualizar' : 'crear'} el grupo`
    });
  }
};

const confirmDelete = (group) => {
  confirm.require({
    message: '¿Está seguro de que desea eliminar este grupo?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteGroup(group.id)
  });
};

const deleteGroup = async (id) => {
  try {
    await api.delete(`/grupos/${id}`);
    await loadGroups();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Grupo eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el grupo'
    });
  }
};

const manageTeams = async (group) => {
  selectedGroup.value = group;
  teamsDialogVisible.value = true;
  await loadTeamsForGroup();
};

const loadTeamsForGroup = async () => {
  if (!selectedGroup.value) return;
  
  try {
    // Obtener la fase del grupo para filtrar por torneo
    const phase = tournamentPhases.value.find((p: any) => p.id === (selectedGroup.value as any).faseTorneoId);
    const tournamentId = phase?.torneoId;
    
    // Obtener todos los equipos del torneo
    let allTeams = [];
    if (tournamentId) {
      // Obtener todos los equipos y filtrar por los que pertenecen a este torneo
      const allTeamsResponse = await api.get('/equipos');
      // Obtener equipos-torneo para saber cuáles pertenecen a este torneo
      const tournamentTeamsResponse = await api.get(`/torneos/${tournamentId}/equipos`).catch(() => ({ data: [] }));
      const tournamentTeamIds = new Set((tournamentTeamsResponse.data as any[]).map((t: any) => t.id));
      
      // Si hay equipos del torneo, usarlos; si no, usar todos
      allTeams = tournamentTeamIds.size > 0 
        ? (allTeamsResponse.data as any[]).filter((t: any) => tournamentTeamIds.has(t.id))
        : allTeamsResponse.data;
    } else {
      const allTeamsResponse = await api.get('/equipos');
      allTeams = allTeamsResponse.data;
    }
    
    // Obtener equipos asignados al grupo (solo IDs)
    const groupTeamsResponse = await api.get(`/grupos/${(selectedGroup.value as any).id}/equipo-grupos`);
    // IMPORTANTE: El API devuelve {id, grupoId, equipoId, ...}
    // 'id' es el ID de la relación equipo-grupo
    // 'equipoId' es el ID del equipo real
    const groupTeamIds = new Set((groupTeamsResponse.data as any[]).map((t: any) => t.equipoId || t.id));
    
    // Hacer JOIN manual: obtener datos completos de equipos asignados
    const completeGroupTeams = (allTeams as any[]).filter((t: any) => groupTeamIds.has(t.id));
    (groupTeams as any).value = completeGroupTeams;
    
    // Filtrar equipos disponibles (todos del torneo menos los asignados)
    (availableTeams as any).value = (allTeams as any[]).filter((t: any) => !groupTeamIds.has(t.id));
    
    console.log('Torneo ID:', tournamentId);
    console.log('Equipos del torneo:', allTeams.length);
    console.log('Equipos asignados:', groupTeams.value.length);
    console.log('Equipos disponibles:', (availableTeams as any).value.length);
    console.log('Datos de equipos asignados:', groupTeams.value);
  } catch (error) {
    console.error('Error loading teams:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar los equipos'
    });
  }
};

const addTeamsToGroup = async () => {
  if (!selectedGroup.value || !selectedTeams.value.length) return;

  try {
    await Promise.all(
      selectedTeams.value.map(team =>
        api.post(`/grupos/${selectedGroup.value.id}/equipo-grupos`, {
          equipoId: team.id
        })
      )
    );
    
    await loadTeamsForGroup();
    selectedTeams.value = [];
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Equipos agregados correctamente'
    });
  } catch (error) {
    console.error('Error adding teams:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al agregar equipos al grupo'
    });
  }
};

const removeTeamFromGroup = async (team) => {
  if (!selectedGroup.value) return;

  try {
    await api.delete(`/grupos/${selectedGroup.value.id}/equipo-grupos/${team.id}`);
    await loadTeamsForGroup();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Equipo removido correctamente'
    });
  } catch (error) {
    console.error('Error removing team:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al remover el equipo del grupo'
    });
  }
};

onMounted(() => {
  loadGroups();
  loadTournamentPhases();
  loadTournaments();
  loadPhasesData();
});
</script>

<style scoped>
/* Estilos para las tablas dentro del modal de equipos */
:deep(.p-datatable) {
  font-size: 0.95rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f3f4f6;
  color: #1f2937;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
  padding: 0.75rem;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  border-bottom: 1px solid #e5e7eb;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.75rem;
  color: #4b5563;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f9fafb;
}

:deep(.p-datatable .p-datatable-tbody > tr.p-highlight) {
  background-color: #dbeafe;
  color: #1e40af;
}

:deep(.p-datatable .p-datatable-tbody > tr.p-highlight > td) {
  color: #1e40af;
}

/* Estilos para checkboxes */
:deep(.p-checkbox .p-checkbox-box) {
  border: 2px solid #d1d5db;
  border-radius: 4px;
}

:deep(.p-checkbox .p-checkbox-box.p-highlight) {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* Estilos para paginación */
:deep(.p-paginator) {
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  padding: 0.75rem;
}

:deep(.p-paginator .p-paginator-current) {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Estilos para divider */
:deep(.p-divider) {
  margin: 1.5rem 0;
  border-color: #e5e7eb;
}

:deep(.p-divider .p-divider-content) {
  background-color: white;
  padding: 0 1rem;
}

/* Estilos para mensaje vacío */
:deep(.p-datatable .p-datatable-emptymessage > tr > td) {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

/* Estilos para botones en modal */
:deep(.p-button) {
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
}

:deep(.p-button-primary) {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

:deep(.p-button-primary:hover:not(:disabled)) {
  background-color: #2563eb;
  border-color: #2563eb;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
}

:deep(.p-button-primary:disabled) {
  background-color: #d1d5db;
  border-color: #d1d5db;
  opacity: 0.6;
  cursor: not-allowed;
}

:deep(.p-button-outlined) {
  border: 2px solid #d1d5db;
  color: #4b5563;
}

:deep(.p-button-outlined:hover:not(:disabled)) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

/* Estilos para header del modal */
:deep(.p-dialog .p-dialog-header) {
  background-color: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  padding: 1.25rem 1.5rem;
}

:deep(.p-dialog .p-dialog-header .p-dialog-title) {
  font-weight: 700;
  color: #1f2937;
  font-size: 1.125rem;
}

/* Estilos para contenido del modal */
:deep(.p-dialog .p-dialog-content) {
  padding: 1.5rem;
  background-color: white;
}

/* Tooltip */
:deep(.p-tooltip) {
  font-size: 0.875rem;
}

:deep(.p-tooltip.p-tooltip-top .p-tooltip-text) {
  background-color: #1f2937;
  color: white;
  border-radius: 4px;
}
</style>