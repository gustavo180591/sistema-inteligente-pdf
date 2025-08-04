<script lang="ts">
  type StatCard = {
    name: string;
    value: number;
    change: string;
    changeType: 'increase' | 'decrease' | 'error' | 'neutral';
    icon: string;
    color: string;
  };

  type Stats = {
    totalProcessed: number;
    processedThisMonth: number;
    pendingReview: number;
    errorCount: number;
    previousMonthProcessed?: number;
  };

  export let stats: Stats = {
    totalProcessed: 0,
    processedThisMonth: 0,
    pendingReview: 0,
    errorCount: 0,
    previousMonthProcessed: 0
  };
  
  // Format numbers with thousands separator
  function formatNumber(num: number): string {
    return new Intl.NumberFormat('es-AR').format(num);
  }
  
  // Calculate percentage change
  function getPercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Get stat cards configuration
  let statCards: StatCard[] = [];
  
  // Simplificar la reactividad para evitar errores
  function updateStatCards() {
    statCards = [
      {
        name: 'Total Procesados',
        value: stats.totalProcessed,
        change: stats.totalProcessed > 0 ? `${getPercentageChange(stats.totalProcessed, 0)}%` : '0%',
        changeType: stats.totalProcessed > 0 ? 'increase' : 'neutral',
        icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        color: 'bg-blue-500'
      },
      {
        name: 'Este Mes',
        value: stats.processedThisMonth,
        change: stats.processedThisMonth > 0 ? 
          `${getPercentageChange(stats.processedThisMonth, stats.previousMonthProcessed || 0)}%` : '0%',
        changeType: stats.processedThisMonth > (stats.previousMonthProcessed || 0) ? 'increase' : 
                  stats.processedThisMonth < (stats.previousMonthProcessed || 0) ? 'decrease' : 'neutral',
        icon: 'M13 7h2m0 0v2m0-2h-2m2 6h-4.5a1.5 1.5 0 100 3h3a1.5 1.5 0 010 3H11m6-3V9m-6 6h2',
        color: 'bg-green-500'
      },
      {
        name: 'Pendientes',
        value: stats.pendingReview,
        change: stats.pendingReview > 0 ? `${stats.pendingReview}` : '0',
        changeType: stats.pendingReview > 0 ? 'decrease' : 'neutral',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'bg-yellow-500'
      },
      {
        name: 'Errores',
        value: stats.errorCount,
        change: stats.errorCount > 0 ? `${stats.errorCount}` : '0',
        changeType: stats.errorCount > 0 ? 'error' : 'neutral',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        color: 'bg-red-500'
      }
    ];
  }
  
  // Actualizar las tarjetas cuando cambien las estadísticas
  $: if (stats) {
    updateStatCards();
  }
</script>

<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
  {#each statCards as stat}
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class={`h-12 w-12 rounded-md ${stat.color} text-white flex items-center justify-center`}>
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d={stat.icon}
                />
              </svg>
            </div>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </dt>
              <dd>
                <div class="text-lg font-medium text-gray-900">
                  {stat.value.toLocaleString()}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-5 py-3">
        <div class="text-sm flex items-center">
          {#if stat.changeType === 'increase'}
            <svg class="h-4 w-4 text-green-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
            <span class="font-medium text-green-600">
              {stat.change} más que el mes pasado
            </span>
          {:else if stat.changeType === 'decrease'}
            <svg class="h-4 w-4 text-yellow-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            <span class="font-medium text-yellow-600">
              {stat.change} menos que el mes pasado
            </span>
          {:else if stat.changeType === 'error'}
            <svg class="h-4 w-4 text-red-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="font-medium text-red-600">
              {stat.change} {stat.value === 1 ? 'error' : 'errores'} por revisar
            </span>
          {:else}
            <span class="font-medium text-gray-500">
              <span class="inline-flex items-center">
                <svg class="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
                </svg>
                Sin cambios
              </span>
            </span>
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>
