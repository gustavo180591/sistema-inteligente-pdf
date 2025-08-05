<script lang="ts">
  import { onMount } from 'svelte';
  import StatsOverview from '$lib/components/StatsOverview.svelte';
  import DocumentFilters from '$lib/components/DocumentFilters.svelte';
  import AnalyticsCharts from '$lib/components/AnalyticsCharts.svelte';
  import RecentDocuments from '$lib/components/RecentDocuments.svelte';
  
  // Estado del dashboard
  let activeTab = 'overview';
  let stats = {
    totalInstituciones: 0,
    totalSocios: 0,
    totalAportes: 0,
    totalTransferencias: 0,
    aportesPendientes: 0,
    montoTotal: 0
  };
  
  let recentDocuments = [];
  let isLoading = true;
  
  // Tabs disponibles
  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'instituciones', label: 'Instituciones', icon: '🏫' },
    { id: 'socios', label: 'Socios', icon: '👥' },
    { id: 'aportes', label: 'Aportes', icon: '💰' },
    { id: 'transferencias', label: 'Transferencias', icon: '🏦' },
    { id: 'reportes', label: 'Reportes', icon: '📋' }
  ];
  
  onMount(async () => {
    await loadDashboardData();
  });
  
  async function loadDashboardData() {
    try {
      isLoading = true;
      // TODO: Reemplazar con llamadas reales a la API
      // const response = await fetch('/api/dashboard');
      // const data = await response.json();
      // stats = data.stats;
      // recentDocuments = data.recentDocuments;
      
      // Datos de ejemplo
      stats = {
        totalInstituciones: 15,
        totalSocios: 234,
        totalAportes: 1247,
        totalTransferencias: 89,
        aportesPendientes: 23,
        montoTotal: 1250000
      };
      
      recentDocuments = [
        {
          id: '1',
          nombreArchivo: 'listado_enero_2024.pdf',
          tipo: 'SIDEPP',
          estado: 'PROCESADO',
          fechaCarga: new Date('2024-01-15'),
          institucion: 'Escuela Primaria N° 123'
        },
        {
          id: '2',
          nombreArchivo: 'transferencia_banco.pdf',
          tipo: 'TRANSFERENCIA',
          estado: 'VALIDADO',
          fechaCarga: new Date('2024-01-14'),
          monto: 45000
        }
      ];
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      isLoading = false;
    }
  }
  
  function handleTabChange(tabId: string) {
    activeTab = tabId;
  }
  
  function handleFilterChange(filters: any) {
    // Aplicar filtros según la pestaña activa
    console.log('Applying filters:', filters);
  }
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">SIDEPP Digital</h1>
          <p class="text-gray-600">Plataforma de Gestión Integral de Socios y Aportes Sindicales</p>
        </div>
        <div class="flex space-x-3">
          <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            📤 Cargar Documentos
          </button>
          <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            📋 Generar Reporte
          </button>
        </div>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <!-- Tabs Navigation -->
    <div class="mb-6">
      <nav class="flex space-x-8 border-b border-gray-200">
        {#each tabs as tab}
          <button
            class="py-2 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === tab.id 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
            on:click={() => handleTabChange(tab.id)}
          >
            <span class="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        {/each}
      </nav>
    </div>

    {#if isLoading}
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    {:else}
      <!-- Overview Tab -->
      {#if activeTab === 'overview'}
        <div class="space-y-6">
          <!-- Stats Overview -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span class="text-white text-lg">🏫</span>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Instituciones</dt>
                      <dd class="text-lg font-medium text-gray-900">{stats.totalInstituciones}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span class="text-white text-lg">👥</span>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Socios Activos</dt>
                      <dd class="text-lg font-medium text-gray-900">{stats.totalSocios}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span class="text-white text-lg">💰</span>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Aportes Pendientes</dt>
                      <dd class="text-lg font-medium text-gray-900">{stats.aportesPendientes}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span class="text-white text-lg">💵</span>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Monto Total</dt>
                      <dd class="text-lg font-medium text-gray-900">${stats.montoTotal.toLocaleString()}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts and Analytics -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Aportes por Mes</h3>
              <AnalyticsCharts />
            </div>
            
            <div class="bg-white shadow rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Instituciones por Estado</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Activas</span>
                  <span class="text-sm font-medium text-green-600">12</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Pendientes</span>
                  <span class="text-sm font-medium text-yellow-600">3</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Inactivas</span>
                  <span class="text-sm font-medium text-red-600">0</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
            <RecentDocuments documents={recentDocuments} />
          </div>
        </div>
      {/if}

      <!-- Instituciones Tab -->
      {#if activeTab === 'instituciones'}
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Gestión de Instituciones</h3>
              <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                ➕ Nueva Institución
              </button>
            </div>
          </div>
          
          <div class="p-6">
            <DocumentFilters on:filterChange={handleFilterChange} />
            
            <!-- Tabla de instituciones -->
            <div class="mt-6 overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institución</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CUIT</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Socios</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">Escuela Primaria N° 123</div>
                      <div class="text-sm text-gray-500">Responsable: Juan Pérez</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">20-12345678-9</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">45</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Activa
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button class="text-blue-600 hover:text-blue-900 mr-3">Ver</button>
                      <button class="text-green-600 hover:text-green-900 mr-3">Editar</button>
                      <button class="text-red-600 hover:text-red-900">Eliminar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      {/if}

      <!-- Socios Tab -->
      {#if activeTab === 'socios'}
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Gestión de Socios</h3>
              <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                ➕ Nuevo Socio
              </button>
            </div>
          </div>
          
          <div class="p-6">
            <DocumentFilters on:filterChange={handleFilterChange} />
            
            <!-- Tabla de socios -->
            <div class="mt-6 overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Socio</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Legajo</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institución</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Aporte</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">María González</div>
                      <div class="text-sm text-gray-500">DNI: 12345678</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">12345</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Escuela Primaria N° 123</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Enero 2024</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button class="text-blue-600 hover:text-blue-900 mr-3">Ver</button>
                      <button class="text-green-600 hover:text-green-900 mr-3">Editar</button>
                      <button class="text-red-600 hover:text-red-900">Suspender</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      {/if}

      <!-- Aportes Tab -->
      {#if activeTab === 'aportes'}
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Control de Aportes</h3>
              <div class="flex space-x-3">
                <button class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                  ⚠️ Aportes Pendientes
                </button>
                <button class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  ✅ Conciliar
                </button>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <DocumentFilters on:filterChange={handleFilterChange} />
            
            <!-- Tabla de aportes -->
            <div class="mt-6 overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Socio</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transferencia</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">María González</div>
                      <div class="text-sm text-gray-500">Escuela Primaria N° 123</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Enero 2024</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$3,500</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Pagado
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">TR-2024-001</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button class="text-blue-600 hover:text-blue-900 mr-3">Ver</button>
                      <button class="text-green-600 hover:text-green-900 mr-3">Conciliar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      {/if}

      <!-- Transferencias Tab -->
      {#if activeTab === 'transferencias'}
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Control de Transferencias</h3>
              <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                🔍 Validar Transferencias
              </button>
            </div>
          </div>
          
          <div class="p-6">
            <DocumentFilters on:filterChange={handleFilterChange} />
            
            <!-- Tabla de transferencias -->
            <div class="mt-6 overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CBU Origen</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CBU Destino</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">15/01/2024</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$45,000</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1234567890123456789012</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">9876543210987654321098</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Validada
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button class="text-blue-600 hover:text-blue-900 mr-3">Ver</button>
                      <button class="text-green-600 hover:text-green-900 mr-3">Conciliar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      {/if}

      <!-- Reportes Tab -->
      {#if activeTab === 'reportes'}
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Generación de Reportes</h3>
              <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                📊 Nuevo Reporte
              </button>
            </div>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Reporte por Institución -->
              <div class="border border-gray-200 rounded-lg p-6">
                <h4 class="text-lg font-medium text-gray-900 mb-4">📋 Reporte por Institución</h4>
                <p class="text-sm text-gray-600 mb-4">Genera un reporte detallado de una institución específica con todos sus socios y aportes.</p>
                <button class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Generar
                </button>
              </div>

              <!-- Reporte Mensual -->
              <div class="border border-gray-200 rounded-lg p-6">
                <h4 class="text-lg font-medium text-gray-900 mb-4">📅 Reporte Mensual</h4>
                <p class="text-sm text-gray-600 mb-4">Reporte consolidado de todos los aportes y transferencias de un mes específico.</p>
                <button class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Generar
                </button>
              </div>

              <!-- Reporte de Conciliación -->
              <div class="border border-gray-200 rounded-lg p-6">
                <h4 class="text-lg font-medium text-gray-900 mb-4">⚖️ Reporte de Conciliación</h4>
                <p class="text-sm text-gray-600 mb-4">Compara aportes declarados con transferencias recibidas para detectar diferencias.</p>
                <button class="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                  Generar
                </button>
              </div>

              <!-- Reporte de Socios -->
              <div class="border border-gray-200 rounded-lg p-6">
                <h4 class="text-lg font-medium text-gray-900 mb-4">👥 Reporte de Socios</h4>
                <p class="text-sm text-gray-600 mb-4">Lista completa de socios con su estado actual y historial de aportes.</p>
                <button class="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Generar
                </button>
              </div>

              <!-- Reporte de Auditoría -->
              <div class="border border-gray-200 rounded-lg p-6">
                <h4 class="text-lg font-medium text-gray-900 mb-4">🔍 Reporte de Auditoría</h4>
                <p class="text-sm text-gray-600 mb-4">Reporte detallado para auditorías externas con toda la documentación.</p>
                <button class="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Generar
                </button>
              </div>

              <!-- Exportar Datos -->
              <div class="border border-gray-200 rounded-lg p-6">
                <h4 class="text-lg font-medium text-gray-900 mb-4">📤 Exportar Datos</h4>
                <p class="text-sm text-gray-600 mb-4">Exporta los datos en formato Excel o CSV para análisis externos.</p>
                <button class="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </main>
</div>