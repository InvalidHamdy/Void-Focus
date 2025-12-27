import Storage from '../utils/storage.js';
import TimerManager from './timer_manager.js';

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
    await Storage.init();
    console.log('Focus Flow installed');

    // Inject content script into existing tabs
    try {
        const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
        for (const tab of tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['src/content/blocker.js']
            }).catch(err => console.log('Injection failed for tab:', tab.id, err));
        }
    } catch (e) {
        console.error('Failed to inject into existing tabs:', e);
    }
});

// Initialize timer manager (alarms etc)
TimerManager.init();

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'focus-timer-tick') {
        TimerManager.handleTick();
    }
});

// Listen for messages from Popup/Content/Options
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle test sound request
    if (message.type === 'TEST_SOUND') {
        TimerManager.playAudio();
        return false;
    }

    // Handle timer actions
    if (message.action === 'startTimer') {
        TimerManager.startTimer(message.type).then(() => sendResponse({ success: true }));
        return true; // Keep channel open
    } else if (message.action === 'stopTimer') {
        TimerManager.stopTimer().then(() => sendResponse({ success: true }));
        return true;
    } else if (message.action === 'getTimerState') {
        Storage.getOne('timerState').then(state => sendResponse(state));
        return true;
    }
});
