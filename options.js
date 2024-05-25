document.addEventListener('DOMContentLoaded', () => {
  const intervalInput = document.getElementById('interval');
  chrome.storage.sync.get('interval', (data) => {
    if (data.interval) {
      intervalInput.value = data.interval;
    }
  });

  document.getElementById('save').addEventListener('click', () => {
    const interval = parseInt(intervalInput.value);
    chrome.storage.sync.set({ interval }, () => {
      alert('Configuración guardada');
    });
  });
});
