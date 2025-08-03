<script lang="ts">
    import { onMount } from 'svelte';
    import { Chart, registerables } from 'chart.js';
    import 'chartjs-adapter-date-fns';
  
    Chart.register(...registerables);
  
    export let data: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string[];
        borderColor: string[];
        borderWidth: number;
      }>;
    };
  
    let chart: Chart;
    let canvas: HTMLCanvasElement;
  
    onMount(() => {
      if (canvas) {
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
      return () => chart?.destroy();
    });
  
    $: if (chart) {
      chart.data = data;
      chart.update();
    }
  </script>
  
  <div class="h-96">
    <canvas bind:this={canvas}></canvas>
  </div>