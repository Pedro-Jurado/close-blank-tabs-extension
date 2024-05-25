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
