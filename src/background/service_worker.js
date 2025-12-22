import Storage from '../utils/storage.js';
import TimerManager from './timer_manager.js';

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
    await Storage.init();
    console.log('Focus Flow installed');
});

// Initialize timer manager (alarms etc)
TimerManager.init();

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'focus-timer-tick') {
        TimerManager.handleTick();
    }
});

// Listen for messages from Popup/Content
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
