<script lang="ts">
  import { onMount } from 'svelte';
  import { PrismaClient } from '@prisma/client';
  
  const prisma = new PrismaClient();
  
  export let filters = {
    search: '',
    type: 'all',
    startDate: '',
    endDate: ''
  };

  let documents = [];
  let isLoading = true;

  async function loadDocuments() {
    if (typeof window === 'undefined') return; // Solo ejecutar en el cliente
    
    isLoading = true;
    
    try {
      // Por ahora, usar datos de ejemplo para evitar errores de API
      documents = [
        {
          id: '1',
          nombreArchivo: 'listado1.pdf',
          tipo: 'SIDEPP',
          fechaCarga: new Date().toISOString(),
          estado: 'PROCESADO'
        },
        {
          id: '2',
          nombreArchivo: 'sidep.pdf',
          tipo: 'TRANSFERENCIA',
          fechaCarga: new Date().toISOString(),
          estado: 'PROCESADO'
        }
      ];
    } catch (error) {
      console.error('Error loading documents:', error);
      documents = [];
    } finally {
      isLoading = false;
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-AR');
  }

  onMount(() => {
    loadDocuments();
  });

  // Remover la reactividad problemática por ahora
  // $: if (filters && typeof window !== 'undefined') {
  //   loadDocuments();
  // }
</script>

<div class="overflow-x-auto">
  {#if isLoading}
    <div class="text-center py-4">Cargando documentos...</div>
  {:else if documents.length === 0}
    <div class="text-center py-4 text-gray-500">No se encontraron documentos</div>
  {:else}
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Nombre
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Tipo
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Fecha
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Estado
          </th>
          <th class="relative px-6 py-3">
            <span class="sr-only">Acciones</span>
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each documents as doc}
          <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{doc.nombreArchivo}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                {doc.tipo === 'TRANSFERENCIA' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">
                {doc.tipo}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {formatDate(doc.fechaCarga)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${doc.estado === 'PROCESADO' ? 'bg-green-100 text-green-800' : 
                  doc.estado === 'ERROR' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'}`}>
                {doc.estado}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <a href={`/documents/${doc.id}`} class="text-blue-600 hover:text-blue-900">Ver</a>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>