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

// Save Timer Settings
saveTimerBtn.addEventListener('click', async () => {
    const settings = await Storage.getOne('settings');
    settings.focusTime = parseInt(focusTimeInput.value) || 25;
    settings.shortBreak = parseInt(shortBreakInput.value) || 5;
    settings.longBreak = parseInt(longBreakInput.value) || 15;

    await Storage.set({ settings });
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

async function addSite() {
    const url = newSiteInput.value.trim();
    if (!url) return;

    // Simple clean (remove http/www)
    let domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];

    const settings = await Storage.getOne('settings');
    const whitelist = settings.whitelist || [];

    if (!whitelist.includes(domain)) {
        whitelist.push(domain);
        settings.whitelist = whitelist;
        await Storage.set({ settings });
        renderWhitelist(whitelist);
        newSiteInput.value = '';
    }
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
        li.innerHTML = `
      <span>${domain}</span>
      <button class="delete-btn" data-domain="${domain}">Remove</button>
    `;
        whitelistContainer.appendChild(li);
    });

    // Re-attach listeners for delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            removeSite(e.target.dataset.domain);
        });
    });
}

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
