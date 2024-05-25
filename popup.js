document.addEventListener('DOMContentLoaded', function() {
  const userLang = navigator.language || navigator.userLanguage;
  const supportedLangs = ['en', 'es'];

  chrome.storage.sync.get(['language', 'autoDetectLanguage', 'interval'], function(data) {
    let lang = data.language || getSupportedLanguage(userLang, supportedLangs);
    const autoDetectLanguage = data.autoDetectLanguage !== undefined ? data.autoDetectLanguage : true;

    if (!autoDetectLanguage) {
      lang = data.language;
    } else {
      lang = getSupportedLanguage(userLang, supportedLangs);
    }

    setLanguage(lang);
    const interval = data.interval || 60;
    updateIntervalDisplay(interval);
    startCountdown(interval);

    document.getElementById('lang-en').addEventListener('click', () => selectLanguage('en'));
    document.getElementById('lang-es').addEventListener('click', () => selectLanguage('es'));
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
      document.getElementById('title').textContent = data['title'];
      document.getElementById('description').textContent = data['description'];
      document.getElementById('settings-link').textContent = data['settings-link'];
      localStorage.setItem('language', lang);
      chrome.storage.sync.set({ language: lang });
    })
    .catch(error => console.error('Error loading language file:', error));
}

function selectLanguage(lang) {
  setLanguage(lang);
  chrome.storage.sync.set({ language: lang, autoDetectLanguage: false });
}

function updateIntervalDisplay(interval) {
  const intervalDisplay = document.getElementById('interval-display');
  if (interval < 60) {
    intervalDisplay.textContent = `${interval} seconds`;
  } else if (interval < 3600) {
    const minutes = (interval / 60).toFixed(2);
    intervalDisplay.textContent = `${minutes} minutes`;
  } else {
    const hours = (interval / 3600).toFixed(2);
    intervalDisplay.textContent = `${hours} hours`;
  }
}

function startCountdown(interval) {
  const endTime = Date.now() + interval * 1000;
  updateCountdown(endTime);

  setInterval(() => {
    updateCountdown(endTime);
  }, 1000);
}

function updateCountdown(endTime) {
  const timeRemainingDisplay = document.getElementById('time-remaining');
  const now = Date.now();
  const timeRemaining = Math.max(0, endTime - now);

  const seconds = Math.floor((timeRemaining / 1000) % 60);
  const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
  const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);

  let displayText = '';
  if (hours > 0) {
    displayText = `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    displayText = `${minutes}m ${seconds}s`;
  } else {
    displayText = `${seconds}s`;
  }

  timeRemainingDisplay.textContent = displayText;
}
