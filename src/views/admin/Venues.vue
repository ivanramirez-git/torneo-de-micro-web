<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gestión de Lugares</h1>
      <Button 
        label="Nuevo Lugar" 
        icon="pi pi-plus" 
        @click="openDialog()" 
        class="p-button-primary"
      />
    </div>

    <DataTable 
      :value="venues" 
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
      <Column field="direccion" header="Dirección" sortable>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" @input="filterCallback()" />
        </template>
      </Column>
      <Column field="capacidad" header="Capacidad" sortable>
        <template #body="slotProps">
          {{ slotProps.data.capacidad.toLocaleString() }} personas
        </template>
      </Column>
      <Column field="descripcion" header="Descripción">
        <template #body="slotProps">
          <span :title="slotProps.data.descripcion">
            {{ truncateText(slotProps.data.descripcion, 50) }}
          </span>
        </template>
      </Column>
      <Column header="Acciones" :exportable="false" style="min-width:8rem">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button 
              icon="pi pi-pencil" 
              @click="editVenue(slotProps.data)"
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

    <!-- Dialog para agregar/editar lugar -->
    <Dialog 
      v-model:visible="dialogVisible" 
      :header="editMode ? 'Editar Lugar' : 'Nuevo Lugar'"
      modal
      class="p-fluid"
    >
      <div class="p-field mb-4">
        <label for="nombre" class="font-bold mb-2 block">Nombre</label>
        <InputText 
          id="nombre" 
          v-model="venueForm.nombre" 
          required 
          autofocus
          class="w-full"
        />
      </div>
      <div class="p-field mb-4">
        <label for="direccion" class="font-bold mb-2 block">Dirección</label>
        <InputText 
          id="direccion" 
          v-model="venueForm.direccion" 
          required
          class="w-full"
        />
      </div>
      <div class="p-field mb-4">
        <label for="capacidad" class="font-bold mb-2 block">Capacidad</label>
        <InputNumber 
          id="capacidad" 
          v-model="venueForm.capacidad" 
          required
          min="0"
          class="w-full"
        />
      </div>
      <div class="p-field mb-4">
        <label for="descripcion" class="font-bold mb-2 block">Descripción</label>
        <Textarea 
          id="descripcion" 
          v-model="venueForm.descripcion" 
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
            :label="editMode ? 'Actualizar' : 'Crear'" 
            icon="pi pi-check" 
            @click="saveVenue" 
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
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

const confirm = useConfirm();
const toast = useToast();

// State
const venues = ref([]);
const loading = ref(true);
const dialogVisible = ref(false);
const editMode = ref(false);

const filters = ref({
  nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
  direccion: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const venueForm = ref({
  nombre: '',
  direccion: '',
  capacidad: 0,
  descripcion: ''
});

// Methods
const loadVenues = async () => {
  try {
    loading.value = true;
    const response = await api.get('/lugares');
    venues.value = response.data;
  } catch (error) {
    console.error('Error loading venues:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los lugares'
    });
  } finally {
    loading.value = false;
  }
};

const openDialog = () => {
  editMode.value = false;
  venueForm.value = {
    nombre: '',
    direccion: '',
    capacidad: 0,
    descripcion: ''
  };
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  venueForm.value = {
    nombre: '',
    direccion: '',
    capacidad: 0,
    descripcion: ''
  };
};

const editVenue = (venue) => {
  editMode.value = true;
  venueForm.value = { ...venue };
  dialogVisible.value = true;
};

const saveVenue = async () => {
  try {
    if (!venueForm.value.nombre || !venueForm.value.direccion || venueForm.value.capacidad < 0) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos correctamente'
      });
      return;
    }

    if (editMode.value) {
      await api.patch(`/lugares/${venueForm.value.id}`, venueForm.value);
    } else {
      await api.post('/lugares', venueForm.value);
    }
    
    await loadVenues();
    closeDialog();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Lugar ${editMode.value ? 'actualizado' : 'creado'} correctamente`
    });
  } catch (error) {
    console.error('Error saving venue:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `No se pudo ${editMode.value ? 'actualizar' : 'crear'} el lugar`
    });
  }
};

const confirmDelete = (venue) => {
  confirm.require({
    message: '¿Está seguro de que desea eliminar este lugar?',
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteVenue(venue.id)
  });
};

const deleteVenue = async (id) => {
  try {
    await api.delete(`/lugares/${id}`);
    await loadVenues();
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Lugar eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting venue:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar el lugar'
    });
  }
};

const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

onMounted(loadVenues);
</script>