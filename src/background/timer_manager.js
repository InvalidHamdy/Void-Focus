import Storage from '../utils/storage.js';

class TimerManager {
    constructor() {
        this.alarmName = 'focus-timer-tick';
    }

    async init() {
        // Check state on startup
        const state = await Storage.getOne('timerState');
        if (state.status !== 'idle' && state.endTime) {
            // If timer was running, check if it finished while inactive
            if (Date.now() >= state.endTime) {
                await this.handleTimerComplete();
            } else {
                // Resume alarm if missing (browser restart)
                const alarm = await chrome.alarms.get(this.alarmName);
                if (!alarm) {
                    chrome.alarms.create(this.alarmName, { periodInMinutes: 1 / 60 }); // Every second check
                }
            }
        }
    }

    async startTimer(type) {
        const settings = await Storage.getOne('settings');
        let durationMinutes = 25;

        if (type === 'focus') durationMinutes = settings.focusTime;
        else if (type === 'short_break') durationMinutes = settings.shortBreak;
        else if (type === 'long_break') durationMinutes = settings.longBreak;

        const duration = durationMinutes * 60 * 1000;
        const startTime = Date.now();
        const endTime = startTime + duration;

        const newState = {
            status: type,
            startTime,
            endTime,
            duration
        };

        await Storage.set({ timerState: newState });
        chrome.alarms.create(this.alarmName, { periodInMinutes: 1 / 60 });
        this.updateBadge(durationMinutes + 'm');
    }

    async stopTimer() {
        await Storage.set({
            timerState: {
                status: 'idle',
                endTime: null,
                startTime: null,
                duration: 0
            }
        });
        chrome.alarms.clear(this.alarmName);
        chrome.action.setBadgeText({ text: '' });
    }

    async handleTick() {
        const state = await Storage.getOne('timerState');
        if (state.status === 'idle') {
            chrome.alarms.clear(this.alarmName);
            return;
        }

        const timeLeft = state.endTime - Date.now();
        if (timeLeft <= 0) {
            await this.handleTimerComplete();
        } else {
            // Update badge every minute roughly
            const minutesLeft = Math.ceil(timeLeft / 60000);
            this.updateBadge(minutesLeft + 'm');
        }
    }

    async handleTimerComplete() {
        const state = await Storage.getOne('timerState');

        // Notify user
        let title = "Time's up!";
        let message = "Timer finished.";

        if (state.status === 'focus') {
            title = "Focus Session Complete";
            message = "Great job! Time for a break.";

            // Update stats
            const stats = await Storage.getOne('stats');
            stats.sessionsCompleted = (stats.sessionsCompleted || 0) + 1;
            await Storage.set({ stats });

        } else {
            title = "Break Over";
            message = "Ready to focus again?";
        }

        chrome.notifications.create({
            type: 'basic',
            iconUrl: '../../assets/icons/icon128.png',
            title: title,
            message: message,
            priority: 2
        });

        // Trigger Audio via Offscreen
        await this.playAudio();

        await this.stopTimer();
    }

    async playAudio() {
        // Create offscreen document if it doesn't exist
        // We use a try/catch pattern which is more robust than checking for contexts
        // because the context check can yield false negatives during rapid switching.
        try {
            await chrome.offscreen.createDocument({
                url: 'src/offscreen/offscreen.html',
                reasons: ['AUDIO_PLAYBACK'],
                justification: 'Notification sound for timer completion',
            });
        } catch (error) {
            // Ignore error if document already exists
            if (!error.message.startsWith('Only a single offscreen')) {
                console.error(error);
            }
        }

        // Send message to play sound
        // No arbitrary delay needed if we assume it exists or was just created
        chrome.runtime.sendMessage({ type: 'PLAY_SOUND' });
    }

    updateBadge(text) {
        chrome.action.setBadgeText({ text: text });
        chrome.action.setBadgeBackgroundColor({ color: '#6366f1' });
    }
}

export default new TimerManager();
