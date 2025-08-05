<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  // Solo importar Chart.js en el cliente para evitar errores de SSR
  let Chart: any;
  let chart: any;
  let canvas: HTMLCanvasElement;
  
  export let data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }>;
  } = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [{
      label: 'Aportes',
      data: [12000, 19000, 15000, 25000, 22000, 30000],
      backgroundColor: ['rgba(59, 130, 246, 0.5)'],
      borderColor: ['rgba(59, 130, 246, 1)'],
      borderWidth: 1
    }]
  };
  
  onMount(async () => {
    if (browser && canvas) {
      // Importar Chart.js dinámicamente solo en el cliente
      const { Chart: ChartJS, registerables } = await import('chart.js');
      await import('chartjs-adapter-date-fns');
      
      ChartJS.register(...registerables);
      Chart = ChartJS;
      
      chart = new Chart(canvas, {
        type: 'bar',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' },
            tooltip: { mode: 'index', intersect: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
    
    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  });
  
  $: if (chart && data) {
    chart.data = data;
    chart.update();
  }
</script>

<div class="h-96">
  <canvas bind:this={canvas}></canvas>
</div>