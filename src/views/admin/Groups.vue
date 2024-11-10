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
    >
      <div v-if="selectedGroup" class="p-4">
        <DataTable
          :value="availableTeams"
          v-model:selection="selectedTeams"
          dataKey="id"
          :rows="10"
          paginator
          selectionMode="multiple"
          class="mb-4"
        >
          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          <Column field="nombre" header="Nombre" sortable></Column>
          <Column field="color" header="Color">
            <template #body="slotProps">
              <div class="flex items-center">
                <div class="w-4 h-4 rounded-full mr-2" :style="{ backgroundColor: slotProps.data.color }"></div>
                {{ slotProps.data.color }}
              </div>
            </template>
          </Column>
        </DataTable>

        <Divider align="center">
          <span class="text-sm">Equipos Asignados</span>
        </Divider>

        <DataTable
          :value="groupTeams"
          dataKey="id"
          :rows="10"
          paginator
        >
          <Column field="nombre" header="Nombre" sortable></Column>
          <Column field="color" header="Color">
            <template #body="slotProps">
              <div class="flex items-center">
                <div class="w-4 h-4 rounded-full mr-2" :style="{ backgroundColor: slotProps.data.color }"></div>
                {{ slotProps.data.color }}
              </div>
            </template>
          </Column>
          <Column header="Acciones" style="width: 8rem">
            <template #body="slotProps">
              <Button
                icon="pi pi-trash"
                @click="removeTeamFromGroup(slotProps.data)"
                class="p-button-text p-button-danger p-button-sm"
              />
            </template>
          </Column>
        </DataTable>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button 
            label="Cerrar" 
            icon="pi pi-times" 
            @click="teamsDialogVisible = false" 
            class="p-button-text"
          />
          <Button 
            label="Agregar Seleccionados" 
            icon="pi pi-plus" 
            @click="addTeamsToGroup" 
            class="p-button-primary"
            :disabled="!selectedTeams.length"
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
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

const confirm = useConfirm();
const toast = useToast();

// State
const groups = ref([]);
const tournamentPhases = ref([]);
const loading = ref(true);
const dialogVisible = ref(false);
const editMode = ref(false);
const teamsDialogVisible = ref(false);
const selectedGroup = ref(null);
const availableTeams = ref([]);
const groupTeams = ref([]);
const selectedTeams = ref([]);

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
    const [allTeamsResponse, groupTeamsResponse] = await Promise.all([
      api.get('/equipos'),
      api.get(`/grupos/${selectedGroup.value.id}/equipo-grupos`)
    ]);
    
    groupTeams.value = groupTeamsResponse.data;
    const groupTeamIds = new Set(groupTeams.value.map(t => t.id));
    availableTeams.value = allTeamsResponse.data.filter(t => !groupTeamIds.has(t.id));
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
});
</script>