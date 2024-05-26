let cleanupIntervalId = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  startTabCleanupInterval();
});

// Función para cerrar pestañas en blanco con manejo de errores
function closeBlankTabs() {
  console.log('Attempting to close blank tabs');
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.url === 'about:blank') {
        console.log(`Closing tab with id ${tab.id}`);
        chrome.tabs.remove(tab.id, () => {
          if (chrome.runtime.lastError) {
            console.error(`Error removing tab with id ${tab.id}: ${chrome.runtime.lastError.message}`);
          }
        });
      }
    });
  });
}

// Escuchar mensajes para cerrar pestañas en blanco
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'closeBlankTabs') {
    closeBlankTabs();
    sendResponse({status: 'Tabs closed'});
  } else if (request.action === 'resetCleanupInterval') {
    resetCleanupInterval();
    sendResponse({status: 'Cleanup interval reset'});
  }
});

// Cerrar pestañas en blanco periódicamente según el intervalo almacenado
function startTabCleanupInterval() {
  chrome.storage.sync.get({ interval: 600 }, (items) => {
    const interval = items.interval * 1000; // Convertir segundos a milisegundos
    console.log(`Starting tab cleanup interval: ${items.interval} seconds`);
    if (cleanupIntervalId !== null) {
      clearInterval(cleanupIntervalId);
    }
    cleanupIntervalId = setInterval(closeBlankTabs, interval);
  });
}

function resetCleanupInterval() {
  console.log('Resetting cleanup interval');
  startTabCleanupInterval();
}

// Iniciar el intervalo cuando se carga el script de fondo
startTabCleanupInterval();
