import Storage from '../utils/storage.js';

// Elements
const focusTimeInput = document.getElementById('focusTime');
const shortBreakInput = document.getElementById('shortBreak');
const longBreakInput = document.getElementById('longBreak');
const saveTimerBtn = document.getElementById('saveTimerBtn');

const newSiteInput = document.getElementById('newSite');
const addSiteBtn = document.getElementById('addSiteBtn');
const whitelistContainer = document.getElementById('whitelist');
const toast = document.getElementById('toast');

// Load settings
document.addEventListener('DOMContentLoaded', async () => {
    const result = await Storage.getOne('settings');

    focusTimeInput.value = result.focusTime;
    shortBreakInput.value = result.shortBreak;
    longBreakInput.value = result.longBreak;

    renderWhitelist(result.whitelist || []);
});

// Helper function to validate time inputs
function validateTime(value, defaultValue, min = 1, max = 120) {
    const parsed = parseInt(value);
    if (isNaN(parsed) || parsed < min || parsed > max) {
        return defaultValue;
    }
    return parsed;
}

// Save Timer Settings
saveTimerBtn.addEventListener('click', async () => {
    const settings = await Storage.getOne('settings');

    // Validate inputs with appropriate ranges
    settings.focusTime = validateTime(focusTimeInput.value, 25, 1, 120);
    settings.shortBreak = validateTime(shortBreakInput.value, 5, 1, 30);
    settings.longBreak = validateTime(longBreakInput.value, 15, 1, 60);

    // Update UI to show validated values
    focusTimeInput.value = settings.focusTime;
    shortBreakInput.value = settings.shortBreak;
    longBreakInput.value = settings.longBreak;

    await Storage.set({ settings });
    showToast('Timer settings saved');
});

// Test Sound logic
const testSoundBtn = document.getElementById('testSoundBtn');
if (testSoundBtn) {
    testSoundBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'TEST_SOUND' });
        // Visual feedback
        const originalText = testSoundBtn.textContent;
        testSoundBtn.textContent = 'PLAYING...';
        setTimeout(() => testSoundBtn.textContent = originalText, 2000);
    });
}

// Whitelist Logic
addSiteBtn.addEventListener('click', addSite);
newSiteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addSite();
});

// Extract domain from URL or validate domain string
function extractDomain(input) {
    try {
        // Try to parse as URL first
        const url = new URL(input.startsWith('http') ? input : `https://${input}`);
        return url.hostname;
    } catch {
        // Fallback: assume it's already a domain
        const cleaned = input.trim().toLowerCase();
        // Basic domain validation (allows localhost and IP addresses)
        if (/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*(\.[a-z]{2,})?$/.test(cleaned) || cleaned === 'localhost') {
            return cleaned;
        }
        return null;
    }
}

async function addSite() {
    const url = newSiteInput.value.trim();
    if (!url) return;

    const domain = extractDomain(url);
    if (!domain) {
        showToast('Invalid domain format');
        return;
    }

    const settings = await Storage.getOne('settings');
    const whitelist = settings.whitelist || [];

    if (whitelist.includes(domain)) {
        showToast('Domain already whitelisted');
        return;
    }

    whitelist.push(domain);
    settings.whitelist = whitelist;
    await Storage.set({ settings });
    renderWhitelist(whitelist);
    newSiteInput.value = '';
    showToast(`Added ${domain} to whitelist`);
}

async function removeSite(domain) {
    const settings = await Storage.getOne('settings');
    settings.whitelist = settings.whitelist.filter(d => d !== domain);
    await Storage.set({ settings });
    renderWhitelist(settings.whitelist);
}

function renderWhitelist(list) {
    whitelistContainer.innerHTML = '';
    list.forEach(domain => {
        const li = document.createElement('li');
        li.className = 'whitelist-item';

        // Safe: textContent escapes HTML automatically
        const span = document.createElement('span');
        span.textContent = domain;

        const button = document.createElement('button');
        button.className = 'delete-btn';
        button.textContent = 'Remove';
        button.dataset.domain = domain; // Safe: data attributes are escaped
        button.addEventListener('click', () => removeSite(domain));

        li.appendChild(span);
        li.appendChild(button);
        whitelistContainer.appendChild(li);
    });
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
