// Function to get the current language from localStorage
function getCurrentLanguage() {
    let language = localStorage.getItem('language');
    if (!language) {
        language = 'de'; // Default to German
        localStorage.setItem('language', language);
    }
    return language;
}

// Function to set the language in localStorage and reload the page
function setLanguage(languageCode) {
    localStorage.setItem('language', languageCode);
    location.reload(); // Reload the page to apply new language settings
}

// Function to apply translations to the page
function applyTranslations(languageData) {
    // Handle page title
    const pageTitleElement = document.querySelector('head title[data-translate]');
    if (pageTitleElement) {
        const titleKey = pageTitleElement.dataset.translate;
        if (languageData[titleKey]) {
            document.title = languageData[titleKey];
        }
    }

    // Handle other translatable elements (textContent)
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.dataset.translate;
        if (languageData[key]) {
            if (element.tagName.toLowerCase() !== 'title') {
                 element.textContent = languageData[key];
            }
        }
    });

    // Handle translatable placeholder attributes
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.dataset.translatePlaceholder;
        if (languageData[key]) {
            element.placeholder = languageData[key];
        }
    });
}

// Asynchronous function to load translations
async function loadTranslations() {
    const currentLanguage = getCurrentLanguage();
    const filePath = `locales/${currentLanguage}.json`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            console.error(`Error loading translation file: ${response.statusText} (path: ${filePath})`);
            if (currentLanguage !== 'de') {
                console.log('Attempting to load default language (de)...');
                const fallbackResponse = await fetch('locales/de.json');
                if (!fallbackResponse.ok) {
                    console.error('Failed to load default language file (de.json).');
                    window.languageData = {}; // Set to empty object or some default
                    return;
                }
                const fallbackData = await fallbackResponse.json();
                window.languageData = fallbackData; // Expose fallback data globally
                applyTranslations(fallbackData);
            } else {
                window.languageData = {}; // Set to empty object if default 'de' fails
            }
            return;
        }
        const jsonData = await response.json();
        window.languageData = jsonData; // Expose loaded language data globally
        applyTranslations(jsonData);
    } catch (error) {
        console.error('Error fetching or parsing translation file:', error);
        window.languageData = {}; // Set to empty object on error
    }
}


// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', async function() { // Made async
    // Load and apply translations first to make languageData available
    await loadTranslations(); // Wait for translations to be loaded

    const languageToggle = document.getElementById('language-toggle');
    if (languageToggle) {
        languageToggle.checked = getCurrentLanguage() === 'en';
        languageToggle.addEventListener('change', function() {
            if (this.checked) {
                setLanguage('en');
            } else {
                setLanguage('de');
            }
        });
    }

    // Other DOM manipulations that might depend on languageData can now safely access it
    // For example, if chart labels or other dynamic text were set here,
    // they would use window.languageData which is now populated.
});
