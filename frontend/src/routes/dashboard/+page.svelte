<script lang="ts">
    import { onMount } from 'svelte';
    import AnalyticsCharts from '$lib/components/AnalyticsCharts.svelte';
    import DocumentFilters from '$lib/components/DocumentFilters.svelte';
    import RecentDocuments from '$lib/components/RecentDocuments.svelte';
    import StatsOverview from '$lib/components/StatsOverview.svelte';
  
    let chartData = {
      labels: [],
      datasets: []
    };
    let filters = {
      search: '',
      type: 'all',
      startDate: '',
      endDate: ''
    };
  
    async function loadAnalytics() {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
  
      const response = await fetch(`/api/analytics?${params}`);
      const data = await response.json();
      chartData = data;
    }
  
    function handleFilter(event) {
      filters = { ...filters, ...event.detail };
      loadAnalytics();
    }
  
    onMount(() => {
      loadAnalytics();
    });
  </script>
  
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-bold text-gray-900">Dashboard de Documentos</h1>
    
    <DocumentFilters on:filter={handleFilter} {filters} />
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Análisis de Documentos</h2>
          <AnalyticsCharts data={chartData} />
        </div>
      </div>
      
      <div class="space-y-6">
        <StatsOverview />
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Acciones Rápidas</h2>
          <div class="space-y-3">
            <button class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Exportar a Excel
            </button>
            <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Generar Reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  
    <div class="bg-white p-6 rounded-lg shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Documentos Recientes</h2>
        <button 
          class="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
          on:click={loadAnalytics}
        >
          Actualizar
        </button>
      </div>
      <RecentDocuments />
    </div>
  </div>