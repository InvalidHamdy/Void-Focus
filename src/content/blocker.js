// Blocker logic
// Runs on page load AND listens for state changes

let overlayHost = null;

async function checkAndEnforce() {
    try {
        const result = await chrome.storage.local.get(['timerState', 'settings']);
        const timerState = result.timerState || { status: 'idle' };
        const settings = result.settings || { whitelist: [] };
        const whitelist = settings.whitelist || [];

        // Logic:
        // 1. If not in FOCUS mode -> Ensure NO overlay.
        // 2. If in FOCUS mode:
        //    a. Check whitelist.
        //    b. If allowed -> Ensure NO overlay.
        //    c. If blocked -> Ensure YES overlay.

        if (timerState.status !== 'focus') {
            removeOverlay();
            return;
        }

        const currentHost = window.location.hostname;
        const isAllowed = whitelist.some(allowed => {
            return currentHost === allowed || currentHost.endsWith('.' + allowed);
        });

        if (isAllowed) {
            removeOverlay();
            return;
        }

        // Apply Blocking
        createOverlay();

    } catch (e) {
        console.error('Focus Flow Blocker Error:', e);
    }
}

// Listen for changes (Instant Blocking/Unblocking)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (changes.timerState || changes.settings) {
            checkAndEnforce();
        }
    }
});

// Initial Check
checkAndEnforce();

function removeOverlay() {
    if (overlayHost) {
        overlayHost.remove();
        overlayHost = null;

        // Restore scrolling
        if (document.body) document.body.style.overflow = '';
        if (document.documentElement) document.documentElement.style.overflow = '';
    }
}

function createOverlay() {
    if (overlayHost) return; // Already blocked

    // Ensure we have a target to append to
    const target = document.documentElement || document.body;
    if (!target) {
        window.addEventListener('DOMContentLoaded', createOverlay);
        return;
    }

    // Create Shadow DOM to isolate styles
    const host = document.createElement('div');
    host.id = 'focus-flow-overlay-host';
    target.appendChild(host);
    overlayHost = host;

    const shadow = host.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = `
            :host { all: initial; }
            .overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: radial-gradient(circle at center, #1e1b4b 0%, #0f172a 100%);
                z-index: 2147483647;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: #f8fafc;
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                text-align: center;
                animation: fadeIn 0.8s ease-out;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes breathe {
                0% { transform: scale(1); opacity: 0.5; box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
                50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 20px 10px rgba(99, 102, 241, 0.2); }
                100% { transform: scale(1); opacity: 0.5; box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
            }

            .breathing-dot {
                width: 16px;
                height: 16px;
                background: #6366f1;
                border-radius: 50%;
                margin-bottom: 2rem;
                animation: breathe 4s infinite ease-in-out;
            }

            h1 {
                font-size: 1rem;
                letter-spacing: 0.2em;
                text-transform: uppercase;
                color: #6366f1;
                margin: 0 0 1.5rem 0;
                font-weight: 600;
            }

            .message-primary {
                font-size: 2.5rem;
                font-weight: 700;
                margin: 0 0 1rem 0;
                line-height: 1.2;
                max-width: 800px;
                background: linear-gradient(to bottom, #ffffff, #94a3b8);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .message-secondary {
                font-size: 1.1rem;
                color: #64748b;
                margin-bottom: 3rem;
                font-weight: 400;
            }

            .actions {
                display: flex;
                gap: 1.5rem;
            }

            button {
                padding: 0.75rem 2rem;
                font-size: 1rem;
                font-weight: 500;
                border-radius: 2rem;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
                font-family: inherit;
            }

            button.primary {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            button.primary:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-1px);
            }
        `;
    shadow.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    // Animation Dot
    const dot = document.createElement('div');
    dot.className = 'breathing-dot';

    // Header
    const header = document.createElement('h1');
    header.textContent = "VOID";

    // Main Message
    const primaryMsg = document.createElement('div');
    primaryMsg.className = 'message-primary';
    primaryMsg.textContent = "You chose to focus.";

    // Sub Message
    const secondaryMsg = document.createElement('div');
    secondaryMsg.className = 'message-secondary';
    secondaryMsg.textContent = "This site is not part of your study session.";

    // Actions
    const actions = document.createElement('div');
    actions.className = 'actions';

    const goBackBtn = document.createElement('button');
    goBackBtn.className = 'primary';
    goBackBtn.textContent = "Go Back";
    goBackBtn.onclick = () => window.history.back();

    actions.appendChild(goBackBtn);

    overlay.appendChild(dot);
    overlay.appendChild(header);
    overlay.appendChild(primaryMsg);
    overlay.appendChild(secondaryMsg);
    overlay.appendChild(actions);

    shadow.appendChild(overlay);

    // Safe overflow handling
    if (document.body) {
        document.body.style.overflow = 'hidden';
    } else if (document.documentElement) {
        document.documentElement.style.overflow = 'hidden';
    }
}
