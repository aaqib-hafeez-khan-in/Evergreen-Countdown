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
const form = document.getElementById('configForm');
const targetDateEl = document.getElementById('targetDate');
const timezoneEl = document.getElementById('timezone');
const labelEl = document.getElementById('label');
const titleEl = document.getElementById('title');
const completionEl = document.getElementById('completion');
const previewLabel = document.getElementById('previewLabel');
const previewTitle = document.getElementById('previewTitle');
const previewTimezone = document.getElementById('previewTimezone');
const completionMessage = document.getElementById('completionMessage');
const completionState = document.getElementById('completionState');
const countdownEl = document.getElementById('countdown');
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const formStatus = document.getElementById('formStatus');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const shareButton = document.getElementById('shareButton');
const resetButton = document.getElementById('resetButton');

let activeConfig;
let completed = false;

function getDefaultTargetDate() {
    const now = new Date();
    const target = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
    return toDateTimeLocal(target);
}

function toDateTimeLocal(date) {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
}

function fromQueryDate(value) {
    if (!value) return '';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '' : toDateTimeLocal(parsed);
}

function getRuntimeConfig() {
    const targetDate = params.get('date') || baseConfig.targetDate;
    const timezone = params.get('timezone') || baseConfig.timezone;
    const label = params.get('label') || baseConfig.label;
    const title = params.get('title') || baseConfig.title;
    const completionMessageValue = params.get('completion') || baseConfig.completionMessage;

    return engine.resolveConfig({
        targetDate,
        timezone,
        label,
        title,
        completionMessage: completionMessageValue
    });
}

function setTheme(theme) {
    const nextTheme = theme === 'light' ? 'light' : 'dark';
    document.body.dataset.theme = nextTheme;
    themeToggle.setAttribute('aria-pressed', String(nextTheme === 'light'));
    themeToggle.setAttribute('aria-label', `Switch to ${nextTheme === 'dark' ? 'light' : 'dark'} theme`);
    themeIcon.textContent = nextTheme === 'dark' ? '☾' : '☀';
}

function toggleTheme() {
    const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('countdown-theme', nextTheme);
}

function applyFormValues(config) {
    targetDateEl.value = fromQueryDate(config.targetDate) || getDefaultTargetDate();
    timezoneEl.value = config.timezone;
    labelEl.value = config.label;
    titleEl.value = config.title;
    completionEl.value = config.completionMessage;
}

function formConfig() {
    const targetDate = targetDateEl.value;
    const timezone = timezoneEl.value.trim() || 'UTC';
    return engine.resolveConfig({
        targetDate,
        timezone,
        label: labelEl.value.trim() || 'Countdown',
        title: titleEl.value.trim() || 'Countdown',
        completionMessage: completionEl.value.trim() || 'Countdown complete.'
    });
}

function renderPreview(config) {
    previewLabel.textContent = config.label;
    previewTitle.textContent = config.title;
    previewTimezone.textContent = `Target timezone: ${config.timezone}`;
    completionMessage.textContent = config.completionMessage;
}

function showCompletion() {
    if (completed) return;
    completed = true;
    countdownEl.hidden = true;
    completionState.hidden = false;
    countdownEl.setAttribute('aria-label', `Countdown complete. ${activeConfig.completionMessage}`);
}

function updateCountdown() {
    if (!activeConfig || completed) return;
    const remaining = engine.getRemaining(activeConfig.targetTime);
    if (remaining.expired) {
        showCompletion();
        return;
    }
    countdownEl.hidden = false;
    completionState.hidden = true;
    daysEl.textContent = String(remaining.days).padStart(2, '0');
    hoursEl.textContent = String(remaining.hours).padStart(2, '0');
    minutesEl.textContent = String(remaining.minutes).padStart(2, '0');
    secondsEl.textContent = String(remaining.seconds).padStart(2, '0');
    countdownEl.setAttribute('aria-label', `${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} minutes, ${remaining.seconds} seconds remaining`);
}

function buildShareUrl(config) {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('date', config.targetDate);
    url.searchParams.set('timezone', config.timezone);
    url.searchParams.set('label', config.label);
    url.searchParams.set('title', config.title);
    url.searchParams.set('completion', config.completionMessage);
    return url.toString();
}

async function copyShareLink() {
    const url = buildShareUrl(activeConfig);
    try {
        await navigator.clipboard.writeText(url);
        shareButton.textContent = 'Link copied';
        setTimeout(() => { shareButton.textContent = 'Copy share link'; }, 1800);
    } catch {
        formStatus.textContent = url;
    }
}

function updateFromForm(event) {
    event.preventDefault();
    const config = formConfig();
    activeConfig = config;
    completed = false;
    renderPreview(config);
    updateCountdown();
    formStatus.textContent = 'Countdown updated. Share the link when you are ready.';
    const url = new URL(window.location.href);
    url.search = buildShareUrl(config).split('?')[1] || '';
    window.history.replaceState({}, '', url);
}

function resetForm() {
    params.delete('date');
    params.delete('timezone');
    params.delete('label');
    params.delete('title');
    params.delete('completion');
    activeConfig = getRuntimeConfig();
    applyFormValues(activeConfig);
    renderPreview(activeConfig);
    completed = false;
    updateCountdown();
    window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`);
    formStatus.textContent = 'Reset to the default countdown.';
}

function init() {
    activeConfig = getRuntimeConfig();
    applyFormValues(activeConfig);
    renderPreview(activeConfig);
    const savedTheme = localStorage.getItem('countdown-theme');
    setTheme(savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : baseConfig.theme);
    updateCountdown();
    form.addEventListener('submit', updateFromForm);
    resetButton.addEventListener('click', resetForm);
    themeToggle.addEventListener('click', toggleTheme);
    shareButton.addEventListener('click', copyShareLink);
    setInterval(updateCountdown, 1000);
}

document.addEventListener('DOMContentLoaded', init);
