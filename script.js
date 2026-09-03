const quotes = [
    "Tomorrow is the first blank page of a 365-page book. Write a good one.",
    "New year—a new chapter, new verse, or just the same old story? Ultimately we write it.",
    "The magic in new beginnings is truly the most powerful of them all.",
    "What the new year brings to you will depend a great deal on what you bring to the new year.",
    "Year's end is neither an end nor a beginning but a going on."
];

const config = window.countdownConfig;
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

let targetTime = new Date(config.targetDate).getTime();
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

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.style.cssText = `position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;top:${Math.random() * 100}%;left:${Math.random() * 100}%;animation:twinkle ${2 + Math.random() * 3}s infinite;opacity:${Math.random()};`;
        starsContainer.appendChild(star);
    }
}

function setRandomQuote() {
    if (!config.display.quote) {
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
    newYearMessage.querySelector('h2').textContent = config.title.replace(/^.*?\s/, '') || config.title;
    newYearMessage.querySelector('p').textContent = config.completionMessage;
    newYearMessage.hidden = false;
    newYearMessage.setAttribute('aria-hidden', 'false');

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && typeof confetti === 'function') {
        celebrateNewYear();
    }
}

function updateCountdown() {
    if (completed) return;

    const timeDifference = targetTime - Date.now();

    if (timeDifference <= 0) {
        showCompletionState();
        return;
    }

    const totalSeconds = Math.floor(timeDifference / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
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
    const initialTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : config.theme;

    titleEl.textContent = config.label;
    mainHeading.textContent = config.title;
    timezoneEl.textContent = `Target timezone: ${config.timezone}`;
    secondsEl.closest('.time-segment').hidden = !config.display.seconds;
    newYearMessage.hidden = true;
    newYearMessage.setAttribute('aria-hidden', 'true');

    if (!Number.isFinite(targetTime)) {
        mainHeading.textContent = 'Countdown unavailable';
        countdownEl.hidden = true;
        quoteEl.textContent = 'The configured target date is invalid.';
        setTheme(initialTheme);
        return;
    }

    setTheme(initialTheme);
    createStars();
    setRandomQuote();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    themeToggleBtn.addEventListener('click', toggleTheme);
}

document.addEventListener('DOMContentLoaded', init);
