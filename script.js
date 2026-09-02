const quotes = [
    "Tomorrow is the first blank page of a 365-page book. Write a good one.",
    "New year—a new chapter, new verse, or just the same old story? Ultimately we write it.",
    "The magic in new beginnings is truly the most powerful of them all.",
    "What the new year brings to you will depend a great deal on what you bring to the new year.",
    "Year's end is neither an end nor a beginning but a going on."
];

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const quoteEl = document.getElementById('quote');
const themeToggleBtn = document.getElementById('themeToggle');
const newYearMessage = document.getElementById('newYearMessage');

const now = new Date();
const currentYear = now.getFullYear();
const targetYear = currentYear + (now.getMonth() === 0 && now.getDate() === 1 ? 0 : 1);
const newYearTime = new Date(`January 1, ${targetYear} 00:00:00`).getTime();
const displayYear = targetYear;
document.querySelectorAll('.target-year-text').forEach(el => el.textContent = displayYear);

function createStars() {
    const starsContainer = document.querySelector('.stars');
    const starCount = 100;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: #fff;
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: twinkle ${2 + Math.random() * 3}s infinite;
            opacity: ${Math.random()};
        `;
        starsContainer.appendChild(star);
    }
}

function toggleTheme() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggleBtn.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

function updateCountdown() {
    const currentTime = new Date().getTime();
    const timeDifference = newYearTime - currentTime;

    if (timeDifference <= 0) {
        newYearMessage.classList.remove('hidden');
        celebrateNewYear();
        return;
    }

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    daysEl.textContent = days.toString().padStart(2, '0');
    hoursEl.textContent = hours.toString().padStart(2, '0');
    minutesEl.textContent = minutes.toString().padStart(2, '0');
    secondsEl.textContent = seconds.toString().padStart(2, '0');
}

function celebrateNewYear() {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    (function frame() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) return;

        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ff0000', '#00ff00', '#0000ff']
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ff0000', '#00ff00', '#0000ff']
        });

        requestAnimationFrame(frame);
    }());
}

function setRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteEl.textContent = quotes[randomIndex];
}

function init() {
    createStars();
    setRandomQuote();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    themeToggleBtn.addEventListener('click', toggleTheme);
}

document.addEventListener('DOMContentLoaded', init);