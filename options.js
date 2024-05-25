document.addEventListener('DOMContentLoaded', function() {
  const userLang = navigator.language || navigator.userLanguage;
  const supportedLangs = ['en', 'es'];

  chrome.storage.sync.get(['language', 'autoDetectLanguage'], function(data) {
    let lang = data.language || getSupportedLanguage(userLang, supportedLangs);
    const autoDetectLanguage = data.autoDetectLanguage !== undefined ? data.autoDetectLanguage : true;
    
    if (!autoDetectLanguage) {
      lang = data.language;
    } else {
      lang = getSupportedLanguage(userLang, supportedLangs);
    }
    
    setLanguage(lang);
    loadInterval();

    document.getElementById('save').addEventListener('click', function() {
      const interval = document.getElementById('interval').value;
      chrome.storage.sync.set({ interval: interval }, function() {
        showNotification(lang, 'notification-saved');
      });
    });

    document.getElementById('back-button').addEventListener('click', function() {
      window.location.href = 'popup.html';
    });

    document.getElementById('interval').addEventListener('input', function() {
      updateIntervalDisplay();
    });
  });
});

function getSupportedLanguage(userLang, supportedLangs) {
  const lang = userLang.split('-')[0]; // Extract language code (e.g., 'en' from 'en-US')
  return supportedLangs.includes(lang) ? lang : 'en'; // Default to English if not supported
}

function setLanguage(lang) {
  fetch(`languages/${lang}.json`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('title').textContent = data['options-title'];
      document.getElementById('interval-label').textContent = data['options-interval-label'];
      document.getElementById('save').textContent = data['options-save-button'];
      localStorage.setItem('language', lang);
      chrome.storage.sync.set({ language: lang });
    })
    .catch(error => console.error('Error loading language file:', error));
}

function showNotification(lang, messageKey) {
  fetch(`languages/${lang}.json`)
    .then(response => response.json())
    .then(data => {
      const message = data[messageKey];
      const notification = document.getElementById('notification');
      notification.textContent = message;
      notification.style.display = 'block';
      setTimeout(() => {
        notification.style.display = 'none';
      }, 3000);
    })
    .catch(error => console.error('Error loading notification message:', error));
}

function loadInterval() {
  chrome.storage.sync.get({ interval: 60 }, function(data) {
    document.getElementById('interval').value = data.interval;
    updateIntervalDisplay();
  });
}

function updateIntervalDisplay() {
  const interval = document.getElementById('interval').value;
  let displayText = '';

  if (interval < 60) {
    displayText = `${interval} seconds`;
  } else if (interval < 3600) {
    const minutes = (interval / 60).toFixed(2);
    displayText = `${minutes} minutes`;
  } else {
    const hours = (interval / 3600).toFixed(2);
    displayText = `${hours} hours`;
  }

  document.getElementById('interval-display').textContent = displayText;
}
