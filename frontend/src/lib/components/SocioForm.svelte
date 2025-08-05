<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher<{
    save: { socio: SocioData };
    cancel: void;
  }>();
  
  export let socio: SocioData | null = null;
  export let isEditing = false;
  export let instituciones: InstitucionOption[] = [];
  
  interface SocioData {
    id?: string;
    legajo: string;
    nombre: string;
    apellido: string;
    documento: string;
    cbu: string;
    email: string;
    telefono: string;
    institucionId: string;
    estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'RETIRADO';
  }
  
  interface InstitucionOption {
    id: string;
    nombre: string;
    cuit: string;
  }
  
  let formData: SocioData = {
    legajo: '',
    nombre: '',
    apellido: '',
    documento: '',
    cbu: '',
    email: '',
    telefono: '',
    institucionId: '',
    estado: 'ACTIVO'
  };
  
  let errors: Record<string, string> = {};
  let isSubmitting = false;
  
  // Inicializar formulario si estamos editando
  $: if (socio && isEditing) {
    formData = { ...socio };
  }
  
  function validateForm(): boolean {
    errors = {};
    
    if (!formData.legajo.trim()) {
      errors.legajo = 'El legajo es requerido';
    }
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es requerido';
    }
    
    if (!formData.documento.trim()) {
      errors.documento = 'El documento es requerido';
    } else if (!/^\d{7,8}$/.test(formData.documento.replace(/\D/g, ''))) {
      errors.documento = 'El documento debe tener 7 u 8 dígitos';
    }
    
    if (!formData.institucionId) {
      errors.institucionId = 'Debe seleccionar una institución';
    }
    
    if (formData.cbu && !/^\d{22}$/.test(formData.cbu.replace(/\D/g, ''))) {
      errors.cbu = 'El CBU debe tener 22 dígitos';
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
      // Limpiar formato de documento y CBU
      const cleanData = {
        ...formData,
        documento: formData.documento.replace(/\D/g, ''),
        cbu: formData.cbu.replace(/\D/g, '')
      };
      
      dispatch('save', { socio: cleanData });
    } catch (error) {
      console.error('Error saving socio:', error);
    } finally {
      isSubmitting = false;
    }
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
  
  function formatDocument(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 8) {
      input.value = value;
    }
    
    formData.documento = input.value;
  }
  
  function formatCBU(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 22) {
      input.value = value;
    }
    
    formData.cbu = input.value;
  }
  
  function formatPhone(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 10) {
      if (value.length >= 6) {
        input.value = `(${value.slice(0, 4)}) ${value.slice(4, 8)}-${value.slice(8)}`;
      } else if (value.length >= 4) {
        input.value = `(${value.slice(0, 4)}) ${value.slice(4)}`;
      } else {
        input.value = value;
      }
    }
    
    formData.telefono = input.value;
  }
</script>

<div class="bg-white shadow rounded-lg p-6">
  <div class="mb-6">
    <h3 class="text-lg font-medium text-gray-900">
      {isEditing ? 'Editar Socio' : 'Nuevo Socio'}
    </h3>
    <p class="text-sm text-gray-600">
      {isEditing ? 'Modifica los datos del socio' : 'Completa los datos del nuevo socio'}
    </p>
  </div>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <!-- Legajo -->
    <div>
      <label for="legajo" class="block text-sm font-medium text-gray-700">
        Número de Legajo *
      </label>
      <input
        id="legajo"
        type="text"
        bind:value={formData.legajo}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {errors.legajo ? 'border-red-300' : ''}"
        placeholder="Ej: 12345"
      />
      {#if errors.legajo}
        <p class="mt-1 text-sm text-red-600">{errors.legajo}</p>
      {/if}
    </div>
    
    <!-- Nombre -->
    <div>
      <label for="nombre" class="block text-sm font-medium text-gray-700">
        Nombre *
      </label>
      <input
        id="nombre"
        type="text"
        bind:value={formData.nombre}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {errors.nombre ? 'border-red-300' : ''}"
        placeholder="Nombre del socio"
      />
      {#if errors.nombre}
        <p class="mt-1 text-sm text-red-600">{errors.nombre}</p>
      {/if}
    </div>
    
    <!-- Apellido -->
    <div>
      <label for="apellido" class="block text-sm font-medium text-gray-700">
        Apellido *
      </label>
      <input
        id="apellido"
        type="text"
        bind:value={formData.apellido}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {errors.apellido ? 'border-red-300' : ''}"
        placeholder="Apellido del socio"
      />
      {#if errors.apellido}
        <p class="mt-1 text-sm text-red-600">{errors.apellido}</p>
      {/if}
    </div>
    
    <!-- Documento -->
    <div>
      <label for="documento" class="block text-sm font-medium text-gray-700">
        DNI/CUIL *
      </label>
      <input
        id="documento"
        type="text"
        value={formData.documento}
        on:input={formatDocument}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {errors.documento ? 'border-red-300' : ''}"
        placeholder="12345678"
        maxlength="8"
      />
      {#if errors.documento}
        <p class="mt-1 text-sm text-red-600">{errors.documento}</p>
      {/if}
    </div>
    
    <!-- Institución -->
    <div>
      <label for="institucionId" class="block text-sm font-medium text-gray-700">
        Institución *
      </label>
      <select
        id="institucionId"
        bind:value={formData.institucionId}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {errors.institucionId ? 'border-red-300' : ''}"
      >
        <option value="">Seleccionar institución</option>
        {#each instituciones as institucion}
          <option value={institucion.id}>
            {institucion.nombre} - {institucion.cuit}
          </option>
        {/each}
      </select>
      {#if errors.institucionId}
        <p class="mt-1 text-sm text-red-600">{errors.institucionId}</p>
      {/if}
    </div>
    
    <!-- CBU -->
    <div>
      <label for="cbu" class="block text-sm font-medium text-gray-700">
        CBU
      </label>
      <input
        id="cbu"
        type="text"
        value={formData.cbu}
        on:input={formatCBU}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {errors.cbu ? 'border-red-300' : ''}"
        placeholder="1234567890123456789012"
        maxlength="22"
      />
      {#if errors.cbu}
        <p class="mt-1 text-sm text-red-600">{errors.cbu}</p>
      {/if}
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
        placeholder="socio@email.com"
      />
      {#if errors.email}
        <p class="mt-1 text-sm text-red-600">{errors.email}</p>
      {/if}
    </div>
    
    <!-- Teléfono -->
    <div>
      <label for="telefono" class="block text-sm font-medium text-gray-700">
        Teléfono
      </label>
      <input
        id="telefono"
        type="tel"
        value={formData.telefono}
        on:input={formatPhone}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        placeholder="(011) 1234-5678"
        maxlength="15"
      />
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
        <option value="ACTIVO">Activo</option>
        <option value="INACTIVO">Inactivo</option>
        <option value="SUSPENDIDO">Suspendido</option>
        <option value="RETIRADO">Retirado</option>
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
          {isEditing ? 'Actualizar' : 'Crear'} Socio
        {/if}
      </button>
    </div>
  </form>
</div> 