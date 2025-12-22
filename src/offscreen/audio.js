// Listen for messages from the service worker
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'PLAY_SOUND') {
        playVoidGong();
    }
});

function playVoidGong() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Create oscillator (Low sine wave for 'void' feel)
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Frequency: Deep, low resonance (110Hz = A2)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(110, audioCtx.currentTime);

    // Envelope: Sharp attack, long decay (Gong-like)
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 3); // Long 3s Decay

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }


    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 3.1);
}
