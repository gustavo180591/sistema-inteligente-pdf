<script>
  import { onMount } from 'svelte';
  import FileUpload from '$lib/components/FileUpload.svelte';
  import StatsOverview from '$lib/components/StatsOverview.svelte';
  import RecentDocuments from '$lib/components/RecentDocuments.svelte';
  
  let stats = {
    totalProcessed: 0,
    processedThisMonth: 0,
    pendingReview: 0,
    errorCount: 0
  };
  
  let recentDocuments = [];
  
  onMount(async () => {
    // Fetch initial data
    await loadDashboardData();
  });
  
  async function loadDashboardData() {
    try {
      // TODO: Replace with actual API calls
      // const response = await fetch('/api/dashboard');
      // const data = await response.json();
      // stats = data.stats;
      // recentDocuments = data.recentDocuments;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }
  
  function handleUploadComplete() {
    // Refresh data after successful upload
    loadDashboardData();
  }
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900">Sistema de Procesamiento de PDF</h1>
    </div>
  </header>

  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Stats Overview -->
    <div class="mb-8">
      <StatsOverview {stats} />
    </div>
    
    <!-- Two Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column - File Upload -->
      <div class="lg:col-span-2">
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Cargar Documentos</h2>
          <FileUpload on:complete={handleUploadComplete} />
        </div>
        
        <!-- Recent Activity -->
        <div class="mt-6 bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h2>
          <RecentDocuments documents={recentDocuments} />
        </div>
      </div>
      
      <!-- Right Column - Quick Stats -->
      <div class="lg:col-span-1">
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Resumen Rápido</h2>
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium text-gray-500">Documentos por Procesar</p>
              <p class="text-2xl font-semibold text-gray-900">{stats.pendingReview}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Total Procesados</p>
              <p class="text-2xl font-semibold text-gray-900">{stats.totalProcessed}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Errores</p>
              <p class="text-2xl font-semibold text-red-600">{stats.errorCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
