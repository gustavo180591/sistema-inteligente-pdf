<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher<{
    save: { institucion: InstitucionData };
    cancel: void;
  }>();
  
  export let institucion: InstitucionData | null = null;
  export let isEditing = false;
  
  interface InstitucionData {
    id?: string;
    nombre: string;
    cuit: string;
    direccion: string;
    telefono: string;
    email: string;
    responsable: string;
    tipo: 'ESCUELA' | 'COOPERATIVA' | 'FUNDACION' | 'OTRO';
    estado: 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA';
  }
  
  let formData: InstitucionData = {
    nombre: '',
    cuit: '',
    direccion: '',
    telefono: '',
    email: '',
    responsable: '',
    tipo: 'ESCUELA',
    estado: 'ACTIVA'
  };
  
  let errors: Record<string, string> = {};
  let isSubmitting = false;
  
  // Inicializar formulario si estamos editando
  $: if (institucion && isEditing) {
    formData = { ...institucion };
  }
  
  function validateForm(): boolean {
    errors = {};
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.cuit.trim()) {
      errors.cuit = 'El CUIT es requerido';
    } else if (!/^\d{2}-\d{8}-\d{1}$/.test(formData.cuit)) {
      errors.cuit = 'El CUIT debe tener el formato XX-XXXXXXXX-X';
    }
    
    if (!formData.responsable.trim()) {
      errors.responsable = 'El responsable es requerido';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }
    
    return Object.keys(errors).length === 0;
  }
  
  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }
    
    isSubmitting = true;
    
    try {
      dispatch('save', { institucion: formData });
    } catch (error) {
      console.error('Error saving institucion:', error);
    } finally {
      isSubmitting = false;
    }
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
  
  function formatCUIT(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 2) {
      input.value = value;
    } else if (value.length <= 10) {
      input.value = value.slice(0, 2) + '-' + value.slice(2);
    } else {
      input.value = value.slice(0, 2) + '-' + value.slice(2, 10) + '-' + value.slice(10, 11);
    }
    
    formData.cuit = input.value;
  }
</script>

<div class="bg-white shadow rounded-lg p-6">
  <div class="mb-6">
    <h3 class="text-lg font-medium text-gray-900">
      {isEditing ? 'Editar Institución' : 'Nueva Institución'}
    </h3>
    <p class="text-sm text-gray-600">
      {isEditing ? 'Modifica los datos de la institución' : 'Completa los datos de la nueva institución'}
    </p>
  </div>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <!-- Nombre de la Institución -->
    <div>
      <label for="nombre" class="block text-sm font-medium text-gray-700">
        Nombre de la Institución *
      </label>
      <input
        id="nombre"
        type="text"
        bind:value={formData.nombre}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {errors.nombre ? 'border-red-300' : ''}"
        placeholder="Ej: Escuela Primaria N° 123"
      />
      {#if errors.nombre}
        <p class="mt-1 text-sm text-red-600">{errors.nombre}</p>
      {/if}
    </div>
    
    <!-- CUIT -->
    <div>
      <label for="cuit" class="block text-sm font-medium text-gray-700">
        CUIT *
      </label>
      <input
        id="cuit"
        type="text"
        value={formData.cuit}
        on:input={formatCUIT}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {errors.cuit ? 'border-red-300' : ''}"
        placeholder="XX-XXXXXXXX-X"
        maxlength="13"
      />
      {#if errors.cuit}
        <p class="mt-1 text-sm text-red-600">{errors.cuit}</p>
      {/if}
    </div>
    
    <!-- Tipo de Institución -->
    <div>
      <label for="tipo" class="block text-sm font-medium text-gray-700">
        Tipo de Institución
      </label>
      <select
        id="tipo"
        bind:value={formData.tipo}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="ESCUELA">Escuela</option>
        <option value="COOPERATIVA">Cooperativa</option>
        <option value="FUNDACION">Fundación</option>
        <option value="OTRO">Otro</option>
      </select>
    </div>
    
    <!-- Responsable -->
    <div>
      <label for="responsable" class="block text-sm font-medium text-gray-700">
        Responsable *
      </label>
      <input
        id="responsable"
        type="text"
        bind:value={formData.responsable}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {errors.responsable ? 'border-red-300' : ''}"
        placeholder="Nombre y apellido del responsable"
      />
      {#if errors.responsable}
        <p class="mt-1 text-sm text-red-600">{errors.responsable}</p>
      {/if}
    </div>
    
    <!-- Dirección -->
    <div>
      <label for="direccion" class="block text-sm font-medium text-gray-700">
        Dirección
      </label>
      <input
        id="direccion"
        type="text"
        bind:value={formData.direccion}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        placeholder="Dirección completa"
      />
    </div>
    
    <!-- Teléfono -->
    <div>
      <label for="telefono" class="block text-sm font-medium text-gray-700">
        Teléfono
      </label>
      <input
        id="telefono"
        type="tel"
        bind:value={formData.telefono}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        placeholder="(011) 1234-5678"
      />
    </div>
    
    <!-- Email -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">
        Email
      </label>
      <input
        id="email"
        type="email"
        bind:value={formData.email}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {errors.email ? 'border-red-300' : ''}"
        placeholder="responsable@institucion.edu.ar"
      />
      {#if errors.email}
        <p class="mt-1 text-sm text-red-600">{errors.email}</p>
      {/if}
    </div>
    
    <!-- Estado -->
    <div>
      <label for="estado" class="block text-sm font-medium text-gray-700">
        Estado
      </label>
      <select
        id="estado"
        bind:value={formData.estado}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="ACTIVA">Activa</option>
        <option value="INACTIVA">Inactiva</option>
        <option value="SUSPENDIDA">Suspendida</option>
      </select>
    </div>
    
    <!-- Botones -->
    <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
      <button
        type="button"
        on:click={handleCancel}
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if isSubmitting}
          <span class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Guardando...
          </span>
        {:else}
          {isEditing ? 'Actualizar' : 'Crear'} Institución
        {/if}
      </button>
    </div>
  </form>
</div> 