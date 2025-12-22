/**
 * Wrapper for chrome.storage.local to provide a cleaner API
 * and handle defaults.
 */
const Storage = {
  // Default values
  defaults: {
    timerState: {
      status: 'idle', // idle, focus, short_break, long_break
      endTime: null,
      duration: 25 * 60 * 1000,
      startTime: null
    },
    settings: {
      focusTime: 25,
      shortBreak: 5,
      longBreak: 15,
      autoStart: false,
      whitelist: []
    },
    stats: {
      sessionsCompleted: 0,
      distractionsBlocked: 0
    }
  },

  /**
   * Get values from storage
   * @param {string|string[]|null} keys - Keys to retrieve
   * @returns {Promise<object>}
   */
  get: (keys) => {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result);
      });
    });
  },

  /**
   * Set values in storage
   * @param {object} items - Key-value pairs
   * @returns {Promise<void>}
   */
  set: (items) => {
    return new Promise((resolve) => {
      chrome.storage.local.set(items, () => {
        resolve();
      });
    });
  },

  /**
   * Get a specific key with fallback to default
   * @param {string} key 
   * @returns {Promise<any>}
   */
  getOne: async (key) => {
    const result = await Storage.get(key);
    return result[key] !== undefined ? result[key] : Storage.defaults[key];
  },

  /**
   * Initialize storage with defaults if empty
   */
  init: async () => {
    const current = await Storage.get(null);
    const toSet = {};
    for (const [key, value] of Object.entries(Storage.defaults)) {
      if (current[key] === undefined) {
        toSet[key] = value;
      }
    }
    if (Object.keys(toSet).length > 0) {
      await Storage.set(toSet);
    }
  }
};

export default Storage;
