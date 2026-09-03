const now = new Date();
const currentYear = now.getUTCFullYear();
const targetYear = now.getUTCMonth() === 0 && now.getUTCDate() === 1 ? currentYear : currentYear + 1;

window.countdownConfig = Object.freeze({
    targetDate: `${targetYear}-01-01T00:00:00Z`,
    title: `Targeting ${targetYear}`,
    label: 'Official Countdown',
    timezone: 'UTC',
    theme: 'dark',
    display: Object.freeze({
        quote: true,
        seconds: true
    }),
    completionMessage: 'A new beginning has arrived.'
});
