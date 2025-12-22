# Void

> **Enter the Void.** A deep focus, distraction-free productivity tool for students and developers.

![Void Preview](assets/icons/Void_Logo.png)

## Overview

**Void** is a Chrome/Edge extension designed to enforce "Calm Discipline". Unlike gamified productivity apps, Void treats focus as a serious, binary state. When you are in the Void, distractions are blocked authoritatively, and your time is tracked with precision.

It combines a strict **Pomodoro Timer** with an **Intentional Blocking System** (Whitelist only) to create an environment where deep work is the only option.

## Features

-   **Deep Focus Protocol:**
    -   25m Focus / 5m Break / 15m Long Break (Customizable).
    -   **Whitelist-Only Blocking:** During focus, *only* allowed sites are accessible. All others are blocked by the Void.
-   **"Calm Discipline" Aesthetic:**
    -   Dark, terminal-inspired UI (`#0D1117`).
    -   JetBrains Mono typography.
    -   Breathing animations for a grounded, non-anxious experience.
-   **Local & Private:**
    -   No accounts, no tracking, no cloud. Everything lives in your browser's local storage.
-   **Performance:**
    -   Built on Manifest V3.
    -   Lightweight Service Worker implementation.

## Installation

Since this extension is designed for developers and power users, you can install it effectively as a developer extension:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/yourusername/void-extension.git
    ```
2.  **Open Extension Management:**
    -   Go to `chrome://extensions/` in Chrome or Edge.
3.  **Enable Developer Mode:**
    -   Toggle the "Developer mode" switch in the top right.
4.  **Load Unpacked:**
    -   Click the **"Load unpacked"** button.
    -   Select the root directory of this project.
5.  **Pin Extension:**
    -   Pin **Void** to your toolbar for easy access.

## Usage

1.  **Configure:** Open Settings to define your **Whitelist** (e.g., specific documentation sites, localhost).
2.  **Engage:** Click the extension icon and hit **START FOCUS**.
3.  **Work:** If you try to visit a distracting site (e.g., social media), you will be intercepted by the Void overlay.
4.  **Rest:** When the timer ends, take your break. Blocking is automatically lifted.

## Tech Stack

-   **Manifest V3**
-   **Vanilla JavaScript (ES Modules)**
-   **HTML5 / CSS3 (Grid & Flexbox)**
-   **Chrome Storage & Alarms APIs**

## License

MIT
