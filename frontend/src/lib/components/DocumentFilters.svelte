<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
    
    export let filters = {
      search: '',
      type: 'all',
      startDate: '',
      endDate: ''
    };
  
    function handleSubmit() {
      dispatch('filterChange', filters);
    }
  </script>
  
  <div class="space-y-4 p-4 bg-gray-50 rounded-lg">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
        <input
          id="search"
          type="text"
          bind:value={filters.search}
          placeholder="Nombre o contenido..."
          class="w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
        <select
          id="type"
          bind:value={filters.type}
          class="w-full px-3 py-2 border rounded-md"
        >
          <option value="all">Todos</option>
          <option value="TRANSFERENCIA">Transferencia</option>
          <option value="SIDEPP">SIDEPP</option>
        </select>
      </div>
      <div>
        <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Desde</label>
        <input
          id="startDate"
          type="date"
          bind:value={filters.startDate}
          class="w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
        <div class="flex space-x-2">
          <input
            id="endDate"
            type="date"
            bind:value={filters.endDate}
            class="flex-1 px-3 py-2 border rounded-md"
          />
          <button
            on:click={handleSubmit}
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Filtrar
          </button>
        </div>
      </div>
    </div>
  </div>