<script lang="ts">
  export let documents: Array<{
    id: string;
    filename: string;
    type: 'TRANSFER' | 'INVOICE' | 'RECEIPT' | string;
    status: 'PROCESSED' | 'PENDING' | 'ERROR' | 'PROCESSING';
    processedAt: string;
    url?: string;
  }> = [];
  
  // Format date to a readable format
  function formatDate(dateString: string): string {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('es-AR', options);
  }
  
  // Define types for status and document
  type DocumentStatus = 'PROCESSED' | 'PENDING' | 'ERROR' | 'PROCESSING';
  type DocumentType = 'TRANSFER' | 'INVOICE' | 'RECEIPT' | string;
  
  // Get status color based on document status
  function getStatusColor(status: DocumentStatus): string {
    const statusMap: Record<DocumentStatus, string> = {
      'PROCESSED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'ERROR': 'bg-red-100 text-red-800',
      'PROCESSING': 'bg-blue-100 text-blue-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }
  
  // Get status text in Spanish
  function getStatusText(status: DocumentStatus): string {
    const statusText: Record<DocumentStatus, string> = {
      'PROCESSED': 'Procesado',
      'PENDING': 'Pendiente',
      'ERROR': 'Error',
      'PROCESSING': 'Procesando'
    };
    return statusText[status] || status;
  }
  
  // Get document icon based on type
  function getDocumentIcon(type: DocumentType): string {
    const icons: Record<string, string> = {
      'TRANSFER': 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
      'INVOICE': 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'RECEIPT': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
    };
    return icons[type] || 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
  }
</script>

<div class="flow-root">
  {#if documents.length === 0}
    <div class="text-center py-8">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Sin documentos recientes</h3>
      <p class="mt-1 text-sm text-gray-500">
        Comienza subiendo un archivo PDF para procesarlo.
      </p>
    </div>
  {:else}
    <ul class="-mb-8">
      {#each documents as doc, i}
        <li>
          <div class="relative pb-8">
            {#if i !== documents.length - 1}
              <span
                class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                aria-hidden="true"
              ></span>
            {/if}
            <div class="relative flex space-x-3">
              <div>
                <span
                  class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white"
                >
                  <svg
                    class="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d={getDocumentIcon(doc.type)}
                    />
                  </svg>
                </span>
              </div>
              <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                <div>
                  <p class="text-sm text-gray-800 truncate max-w-xs">
                    {doc.filename}
                  </p>
                  <div class="mt-1 text-sm text-gray-500">
                    {formatDate(doc.processedAt)}
                  </div>
                </div>
                <div class="whitespace-nowrap text-right text-sm">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {getStatusText(doc.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
