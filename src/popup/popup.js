import Storage from '../utils/storage.js';

// DOM Elements
const timeDisplay = document.getElementById('time');
const statusIndicator = document.getElementById('statusIndicator');
const startControls = document.getElementById('startControls');
const runningControls = document.getElementById('runningControls');
const startFocusBtn = document.getElementById('startFocus');
const startShortBreakBtn = document.getElementById('startShortBreak');
const startLongBreakBtn = document.getElementById('startLongBreak');
const stopTimerBtn = document.getElementById('stopTimer');
const settingsBtn = document.getElementById('settingsBtn');
const sessionCount = document.getElementById('sessionCount');

let updateInterval;

// Init
document.addEventListener('DOMContentLoaded', async () => {
    await updateUI();
    // Poll for updates every second to keep UI in sync
    updateInterval = setInterval(updateUI, 1000);
});

// Event Listeners
startFocusBtn.addEventListener('click', () => startTimer('focus'));
startShortBreakBtn.addEventListener('click', () => startTimer('short_break'));
startLongBreakBtn.addEventListener('click', () => startTimer('long_break'));
stopTimerBtn.addEventListener('click', stopTimer);
settingsBtn.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('src/options/options.html'));
    }
});

async function startTimer(type) {
    // Send message to background
    await chrome.runtime.sendMessage({ action: 'startTimer', type });
    updateUI();
}

async function stopTimer() {
    await chrome.runtime.sendMessage({ action: 'stopTimer' });
    updateUI();
}

async function updateUI() {
    const settings = await Storage.getOne('settings');
    const timerState = await Storage.getOne('timerState');
    const stats = await Storage.getOne('stats');

    sessionCount.textContent = stats.sessionsCompleted || 0;

    if (timerState.status === 'idle') {
        // Show start controls
        startControls.classList.remove('hidden');
        runningControls.classList.add('hidden');
        statusIndicator.textContent = 'Idle';
        statusIndicator.style.color = '#94a3b8';
        statusIndicator.style.background = 'rgba(148, 163, 184, 0.2)';

        // Display default focus time
        timeDisplay.textContent = formatTime(settings.focusTime * 60);

    } else {
        // Timer Running
        startControls.classList.add('hidden');
        runningControls.classList.remove('hidden');

        const statusText = timerState.status.replace('_', ' ');
        statusIndicator.textContent = statusText;

        // Color coding
        if (timerState.status === 'focus') {
            statusIndicator.style.color = '#818cf8';
            statusIndicator.style.background = 'rgba(99, 102, 241, 0.2)';
        } else {
            statusIndicator.style.color = '#22c55e'; // Green for breaks
            statusIndicator.style.background = 'rgba(34, 197, 94, 0.2)';
        }

        // Calculate time left
        const now = Date.now();
        let timeLeft = Math.max(0, Math.ceil((timerState.endTime - now) / 1000));
        timeDisplay.textContent = formatTime(timeLeft);

        if (timeLeft === 0) {
            // Logic handled by background, but UI update catches it here
            // Ideally background flips state to idle when done
        }
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}
