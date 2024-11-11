<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestión de Equipos</h1>
      <Button
        label="Nuevo Equipo"
        icon="pi pi-plus"
        @click="openDialog()"
        class="p-button-primary"
      />
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <DataTable 
        :value="teams" 
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
            <div class="flex items-center">
              <img 
                v-if="slotProps.data.escudoUrl" 
                :src="slotProps.data.escudoUrl" 
                :alt="slotProps.data.nombre"
                class="w-8 h-8 mr-2 object-contain"
              />
              {{ slotProps.data.nombre }}
            </div>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" @input="filterCallback()" />
          </template>
        </Column>
        <Column field="color" header="Color" sortable>
          <template #body="slotProps">
            <div class="flex items-center">
                <div class="w-6 h-6 rounded-full border border-gray-200" :style="{ backgroundColor: '#' + slotProps.data.color }"></div>
            </div>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <InputText v-model="filterModel.value" @input="filterCallback()" />
          </template>
        </Column>
        <Column field="escudoUrl" header="Escudo" sortable>
          <template #body="slotProps">
            <img 
              v-if="slotProps.data.escudoUrl" 
              :src="slotProps.data.escudoUrl" 
              :alt="slotProps.data.nombre"
              class="w-12 h-12 object-contain"
            />
            <span v-else class="text-gray-400">Sin escudo</span>
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
                @click="editTeam(slotProps.data)"
                class="p-button-text p-button-warning"
                tooltip="Editar"
              />
              <Button 
                icon="pi pi-trash" 
                @click="confirmDelete(slotProps.data)"
                class="p-button-text p-button-danger"
                tooltip="Eliminar"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Dialog para agregar/editar equipo -->
    <Dialog 
      v-model:visible="dialogVisible" 
      :header="editMode ? 'Editar Equipo' : 'Nuevo Equipo'" 
      modal
      class="p-fluid"
    >
      <div class="p-field mb-4">
        <label for="nombre" class="font-bold mb-2 block">Nombre</label>
        <InputText 
          id="nombre" 
          v-model="teamForm.nombre" 
          required 
          autofocus
          class="w-full"
        />
      </div>
      <div class="p-field mb-4">
        <label for="color" class="font-bold mb-2 block">Color</label>
        <ColorPicker
          id="color"
          v-model="teamForm.color"
          class="w-full"
        />
      </div>
      <div class="p-field mb-4">
        <label for="escudoUrl" class="font-bold mb-2 block">URL del Escudo</label>
        <InputText 
          id="escudoUrl" 
          v-model="teamForm.escudoUrl" 
          placeholder="https://ejemplo.com/escudo.png"
          class="w-full"
        />
        <small class="text-gray-500">URL de la imagen del escudo del equipo</small>
      </div>
      <div v-if="teamForm.escudoUrl" class="mb-4">
        <label class="font-bold mb-2 block">Vista previa</label>
        <img 
          :src="teamForm.escudoUrl" 
          :alt="teamForm.nombre"
          class="w-24 h-24 object-contain border rounded p-2"
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
            @click="saveTeam" 
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
import { ref, onMounted } from 'vue';
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
import InputText from 'primevue/inputtext';
import ColorPicker from 'primevue/colorpicker';
import Toast from 'primevue/toast';

const confirm = useConfirm();
const toast = useToast();

// State
const teams = ref([]);
const loading = ref(true);
const dialogVisible = ref(false);
const editMode = ref(false);

const filters = ref({
  nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
  color: { value: null, matchMode: FilterMatchMode.CONTAINS },
  escudoUrl: { value: null, matchMode: FilterMatchMode.CONTAINS },
  createdAt: { value: null, matchMode: FilterMatchMode.DATE_IS }
});

const teamForm = ref({
  nombre: '',
  color: '#000000',
  escudoUrl: ''
});

// Methods
const loadTeams = async () => {
  try {
    loading.value = true;
    const response = await api.get('/equipos');
    teams.value = response.data;
  } catch (error) {
    console.error('Error loading teams:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los equipos'
    });
  } finally {
    loading.value = false;
  }
};

const openDialog = () => {
  editMode.value = false;
  teamForm.value = {
    nombre: '',
    color: '#000000',
    escudoUrl: ''
  };
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  teamForm.value = {
    nombre: '',
    color: '#000000',
    escudoUrl: ''
  };
};

const editTeam = (team) => {
  editMode.value = true;
  teamForm.value = { ...team };
  dialogVisible.value = true;
};

const saveTeam = async () => {
  try {
    if (!teamForm.value.nombre) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El nombre es requerido'
      });
      return;
    }

    if (teamForm.value.escudoUrl && !isValidUrl(teamForm.value.escudoUrl)) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La URL del escudo no es válida'
      });
      return;
    }

    if (editMode.value) {
      await api.patch(`/equipos/${teamForm.value.id}`, teamForm.value);
    } else {
      await api.post('/equipos', teamForm.value);
    }
    
    await loadTeams();
    closeDialog();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Equipo ${editMode.value ? 'actualizado' : 'creado'} correctamente`
    });
  } catch (error) {
    console.error('Error saving team:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo ${editMode.value ? 'actualizar' : 'crear'} el equipo`
    });
  }
};

const confirmDelete = (team) => {
  confirm.require({
    message: '¿Está seguro de eliminar este equipo?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteTeam(team.id)
  });
};

const deleteTeam = async (id: string) => {
  try {
    await api.delete(`/equipos/${id}`);
    await loadTeams();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Equipo eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el equipo'
    });
  }
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

onMounted(loadTeams);
</script>