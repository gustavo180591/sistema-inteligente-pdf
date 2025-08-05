<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher<{
    generate: { reporte: ReporteConfig };
    cancel: void;
  }>();
  
  export let instituciones: InstitucionOption[] = [];
  export let periodos: string[] = [];
  
  interface ReporteConfig {
    tipo: TipoReporte;
    nombre: string;
    parametros: {
      institucionId?: string;
      periodo?: string;
      fechaDesde?: string;
      fechaHasta?: string;
      formato: 'PDF' | 'EXCEL' | 'CSV';
      incluirDetalles: boolean;
    };
  }
  
  interface InstitucionOption {
    id: string;
    nombre: string;
    cuit: string;
  }
  
  type TipoReporte = 'INSTITUCION' | 'SOCIO' | 'APORTE' | 'TRANSFERENCIA' | 'CONCILIACION' | 'GENERAL';
  
  const tiposReporte = [
    {
      id: 'INSTITUCION',
      nombre: 'Reporte por Institución',
      descripcion: 'Reporte detallado de una institución específica con todos sus socios y aportes',
      icon: '📋',
      requiereInstitucion: true,
      requierePeriodo: false
    },
    {
      id: 'SOCIO',
      nombre: 'Reporte de Socios',
      descripcion: 'Lista completa de socios con su estado actual y historial de aportes',
      icon: '👥',
      requiereInstitucion: false,
      requierePeriodo: false
    },
    {
      id: 'APORTE',
      nombre: 'Reporte de Aportes',
      descripcion: 'Reporte consolidado de todos los aportes de un período específico',
      icon: '💰',
      requiereInstitucion: false,
      requierePeriodo: true
    },
    {
      id: 'TRANSFERENCIA',
      nombre: 'Reporte de Transferencias',
      descripcion: 'Control de transferencias bancarias y su estado de conciliación',
      icon: '🏦',
      requiereInstitucion: false,
      requierePeriodo: true
    },
    {
      id: 'CONCILIACION',
      nombre: 'Reporte de Conciliación',
      descripcion: 'Compara aportes declarados con transferencias recibidas',
      icon: '⚖️',
      requiereInstitucion: false,
      requierePeriodo: true
    },
    {
      id: 'GENERAL',
      nombre: 'Reporte General',
      descripcion: 'Reporte completo del sistema con estadísticas y resúmenes',
      icon: '📊',
      requiereInstitucion: false,
      requierePeriodo: false
    }
  ];
  
  let config: ReporteConfig = {
    tipo: 'INSTITUCION',
    nombre: '',
    parametros: {
      institucionId: '',
      periodo: '',
      fechaDesde: '',
      fechaHasta: '',
      formato: 'PDF',
      incluirDetalles: true
    }
  };
  
  let errors: Record<string, string> = {};
  let isGenerating = false;
  let selectedTipo = tiposReporte[0];
  
  $: {
    selectedTipo = tiposReporte.find(t => t.id === config.tipo) || tiposReporte[0];
    config.nombre = selectedTipo.nombre;
  }
  
  function validateForm(): boolean {
    errors = {};
    
    if (!config.nombre.trim()) {
      errors.nombre = 'El nombre del reporte es requerido';
    }
    
    if (selectedTipo.requiereInstitucion && !config.parametros.institucionId) {
      errors.institucionId = 'Debe seleccionar una institución';
    }
    
    if (selectedTipo.requierePeriodo && !config.parametros.periodo) {
      errors.periodo = 'Debe seleccionar un período';
    }
    
    if (config.parametros.fechaDesde && config.parametros.fechaHasta) {
      if (new Date(config.parametros.fechaDesde) > new Date(config.parametros.fechaHasta)) {
        errors.fechas = 'La fecha desde no puede ser mayor que la fecha hasta';
      }
    }
    
    return Object.keys(errors).length === 0;
  }
  
  async function handleGenerate() {
    if (!validateForm()) {
      return;
    }
    
    isGenerating = true;
    
    try {
      dispatch('generate', { reporte: config });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      isGenerating = false;
    }
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
  
  function getCurrentPeriod() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
</script>

<div class="bg-white shadow rounded-lg p-6">
  <div class="mb-6">
    <h3 class="text-lg font-medium text-gray-900">Generar Reporte</h3>
    <p class="text-sm text-gray-600">Selecciona el tipo de reporte y configura los parámetros</p>
  </div>
  
  <form on:submit|preventDefault={handleGenerate} class="space-y-6">
    <!-- Tipo de Reporte -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-3">
        Tipo de Reporte *
      </label>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        {#each tiposReporte as tipo}
          <button
            type="button"
            class="p-4 border rounded-lg text-left transition-colors {config.tipo === tipo.id 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'}"
            on:click={() => config.tipo = tipo.id as TipoReporte}
          >
            <div class="flex items-center">
              <span class="text-2xl mr-3">{tipo.icon}</span>
              <div>
                <h4 class="font-medium text-gray-900">{tipo.nombre}</h4>
                <p class="text-sm text-gray-600">{tipo.descripcion}</p>
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>
    
    <!-- Nombre del Reporte -->
    <div>
      <label for="nombre" class="block text-sm font-medium text-gray-700">
        Nombre del Reporte *
      </label>
      <input
        id="nombre"
        type="text"
        bind:value={config.nombre}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {errors.nombre ? 'border-red-300' : ''}"
        placeholder="Ej: Reporte de Aportes - Enero 2024"
      />
      {#if errors.nombre}
        <p class="mt-1 text-sm text-red-600">{errors.nombre}</p>
      {/if}
    </div>
    
    <!-- Institución (si aplica) -->
    {#if selectedTipo.requiereInstitucion}
      <div>
        <label for="institucionId" class="block text-sm font-medium text-gray-700">
          Institución *
        </label>
        <select
          id="institucionId"
          bind:value={config.parametros.institucionId}
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
    {/if}
    
    <!-- Período (si aplica) -->
    {#if selectedTipo.requierePeriodo}
      <div>
        <label for="periodo" class="block text-sm font-medium text-gray-700">
          Período *
        </label>
        <select
          id="periodo"
          bind:value={config.parametros.periodo}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm {errors.periodo ? 'border-red-300' : ''}"
        >
          <option value="">Seleccionar período</option>
          {#each periodos as periodo}
            <option value={periodo}>{periodo}</option>
          {/each}
          <option value="custom">Período personalizado</option>
        </select>
        {#if errors.periodo}
          <p class="mt-1 text-sm text-red-600">{errors.periodo}</p>
        {/if}
      </div>
    {/if}
    
    <!-- Fechas personalizadas -->
    {#if config.parametros.periodo === 'custom'}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="fechaDesde" class="block text-sm font-medium text-gray-700">
            Fecha Desde
          </label>
          <input
            id="fechaDesde"
            type="date"
            bind:value={config.parametros.fechaDesde}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label for="fechaHasta" class="block text-sm font-medium text-gray-700">
            Fecha Hasta
          </label>
          <input
            id="fechaHasta"
            type="date"
            bind:value={config.parametros.fechaHasta}
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
      {#if errors.fechas}
        <p class="text-sm text-red-600">{errors.fechas}</p>
      {/if}
    {/if}
    
    <!-- Formato de Exportación -->
    <div>
      <label for="formato" class="block text-sm font-medium text-gray-700">
        Formato de Exportación
      </label>
      <select
        id="formato"
        bind:value={config.parametros.formato}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="PDF">PDF (Recomendado)</option>
        <option value="EXCEL">Excel (.xlsx)</option>
        <option value="CSV">CSV (.csv)</option>
      </select>
    </div>
    
    <!-- Opciones Adicionales -->
    <div>
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={config.parametros.incluirDetalles}
          class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <span class="ml-2 text-sm text-gray-700">Incluir detalles y desgloses</span>
      </label>
    </div>
    
    <!-- Vista Previa -->
    <div class="bg-gray-50 rounded-lg p-4">
      <h4 class="text-sm font-medium text-gray-900 mb-2">Vista Previa del Reporte</h4>
      <div class="text-sm text-gray-600 space-y-1">
        <p><strong>Tipo:</strong> {selectedTipo.nombre}</p>
        <p><strong>Nombre:</strong> {config.nombre}</p>
        {#if config.parametros.institucionId}
          <p><strong>Institución:</strong> {instituciones.find(i => i.id === config.parametros.institucionId)?.nombre}</p>
        {/if}
        {#if config.parametros.periodo && config.parametros.periodo !== 'custom'}
          <p><strong>Período:</strong> {config.parametros.periodo}</p>
        {/if}
        {#if config.parametros.fechaDesde && config.parametros.fechaHasta}
          <p><strong>Rango:</strong> {config.parametros.fechaDesde} a {config.parametros.fechaHasta}</p>
        {/if}
        <p><strong>Formato:</strong> {config.parametros.formato}</p>
        <p><strong>Detalles:</strong> {config.parametros.incluirDetalles ? 'Sí' : 'No'}</p>
      </div>
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
        disabled={isGenerating}
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if isGenerating}
          <span class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generando...
          </span>
        {:else}
          📊 Generar Reporte
        {/if}
      </button>
    </div>
  </form>
</div> 