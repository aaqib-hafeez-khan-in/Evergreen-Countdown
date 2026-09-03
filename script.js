const quotes = [
    "Tomorrow is the first blank page of a 365-page book. Write a good one.",
    "New year—a new chapter, new verse, or just the same old story? Ultimately we write it.",
    "The magic in new beginnings is truly the most powerful of them all.",
    "What the new year brings to you will depend a great deal on what you bring to the new year.",
    "Year's end is neither an end nor a beginning but a going on."
];

const baseConfig = window.countdownConfig;
const engine = window.CountdownEngine;
const params = new URLSearchParams(window.location.search);
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const quoteEl = document.getElementById('quote');
const themeToggleBtn = document.getElementById('themeToggle');
const newYearMessage = document.getElementById('newYearMessage');
const mainHeading = document.getElementById('mainHeading');
const titleEl = document.getElementById('title');
const timezoneEl = document.getElementById('timezone');
const countdownEl = document.getElementById('countdown');

function getRuntimeConfig() {
    const targetDate = params.get('date') || baseConfig.targetDate;
    const timezone = params.get('timezone') || baseConfig.timezone;
    const label = params.get('label') || baseConfig.label;
    const title = params.get('title') || baseConfig.title;
    const completionMessage = params.get('completion') || baseConfig.completionMessage;

    return engine.resolveConfig({
        targetDate,
        timezone,
        label,
        title,
        completionMessage
    });
}

const config = getRuntimeConfig();
let completed = false;

function setTheme(theme) {
    const nextTheme = theme === 'light' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', nextTheme);
    themeToggleBtn.setAttribute('aria-pressed', String(nextTheme === 'light'));
    themeToggleBtn.setAttribute('aria-label', `Switch to ${nextTheme === 'dark' ? 'light' : 'dark'} theme`);
    themeToggleBtn.innerHTML = nextTheme === 'dark' ? '<i class="fas fa-moon" aria-hidden="true"></i>' : '<i class="fas fa-sun" aria-hidden="true"></i>';
}

function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('countdown-theme', nextTheme);
}

function createStars() {
    const starsContainer = document.querySelector('.stars');
    const starCount = 100;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    for (let i = 0; i < starCount; i += 1) {
        const star = document.createElement('div');
        star.style.cssText = `position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;top:${Math.random() * 100}%;left:${Math.random() * 100}%;animation:twinkle ${2 + Math.random() * 3}s infinite;opacity:${Math.random()};`;
        starsContainer.appendChild(star);
    }
}

function setRandomQuote() {
    if (!baseConfig.display.quote) {
        quoteEl.hidden = true;
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteEl.textContent = quotes[randomIndex];
}

function showCompletionState() {
    if (completed) return;
    completed = true;
    daysEl.textContent = '00';
    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';
    countdownEl.setAttribute('aria-label', `Countdown complete. ${config.completionMessage}`);
    newYearMessage.querySelector('h2').textContent = config.title;
    newYearMessage.querySelector('p').textContent = config.completionMessage;
    newYearMessage.hidden = false;
    newYearMessage.setAttribute('aria-hidden', 'false');

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && typeof confetti === 'function') {
        celebrateNewYear();
    }
}

function updateCountdown() {
    if (completed) return;

    const remaining = engine.getRemaining(config.targetTime);

    if (remaining.expired) {
        showCompletionState();
        return;
    }

    daysEl.textContent = String(remaining.days).padStart(2, '0');
    hoursEl.textContent = String(remaining.hours).padStart(2, '0');
    minutesEl.textContent = String(remaining.minutes).padStart(2, '0');
    secondsEl.textContent = String(remaining.seconds).padStart(2, '0');
}

function celebrateNewYear() {
    const duration = 15000;
    const animationEnd = Date.now() + duration;

    function frame() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return;
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ff0000', '#00ff00', '#0000ff'] });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff0000', '#00ff00', '#0000ff'] });
        requestAnimationFrame(frame);
    }

    frame();
}

function init() {
    const savedTheme = localStorage.getItem('countdown-theme');
    const initialTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : baseConfig.theme;

    titleEl.textContent = config.label;
    mainHeading.textContent = config.title;
    timezoneEl.textContent = `Target timezone: ${config.timezone}`;
    secondsEl.closest('.time-segment').hidden = !baseConfig.display.seconds;
    newYearMessage.hidden = true;
    newYearMessage.setAttribute('aria-hidden', 'true');

    setTheme(initialTheme);
    createStars();
    setRandomQuote();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    themeToggleBtn.addEventListener('click', toggleTheme);
}

document.addEventListener('DOMContentLoaded', init);
