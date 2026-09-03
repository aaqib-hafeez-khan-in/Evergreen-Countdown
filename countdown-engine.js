(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
        return;
    }
    root.CountdownEngine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
    const defaultTimezone = 'UTC';

    function validateTimezone(timezone) {
        try {
            new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format();
            return true;
        } catch {
            return false;
        }
    }

    function getTimezoneOffsetMs(date, timezone) {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23'
        }).formatToParts(date).reduce((result, part) => {
            if (part.type !== 'literal') result[part.type] = part.value;
            return result;
        }, {});

        const asUtc = Date.UTC(
            Number(parts.year),
            Number(parts.month) - 1,
            Number(parts.day),
            Number(parts.hour),
            Number(parts.minute),
            Number(parts.second)
        );

        return asUtc - date.getTime();
    }

    function parseTargetDate(value, timezone = defaultTimezone) {
        if (!value || typeof value !== 'string' || !validateTimezone(timezone)) {
            return NaN;
        }

        const input = value.trim();
        const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(input);

        if (hasOffset) {
            const timestamp = new Date(input).getTime();
            return Number.isFinite(timestamp) ? timestamp : NaN;
        }

        const match = input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/);
        if (!match) return NaN;

        const [, year, month, day, hour, minute, second = '0', fraction = '0'] = match;
        const millisecond = Number(fraction.padEnd(3, '0'));
        const wallClock = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second), millisecond);

        if (!Number.isFinite(wallClock)) return NaN;

        let target = wallClock;
        for (let index = 0; index < 3; index += 1) {
            target = wallClock - getTimezoneOffsetMs(new Date(target), timezone);
        }

        return Number.isFinite(target) ? target : NaN;
    }

    function getDefaultTargetDate(now = new Date()) {
        const currentYear = now.getUTCFullYear();
        const targetYear = now.getUTCMonth() === 0 && now.getUTCDate() === 1 ? currentYear : currentYear + 1;
        return `${targetYear}-01-01T00:00:00Z`;
    }

    function getRemaining(targetTime, nowTime = Date.now()) {
        const difference = targetTime - nowTime;
        const totalMilliseconds = Math.max(0, difference);
        const totalSeconds = Math.floor(totalMilliseconds / 1000);

        return {
            expired: difference <= 0,
            totalMilliseconds,
            totalSeconds,
            days: Math.floor(totalSeconds / 86400),
            hours: Math.floor((totalSeconds % 86400) / 3600),
            minutes: Math.floor((totalSeconds % 3600) / 60),
            seconds: totalSeconds % 60
        };
    }

    function normalizeText(value, fallback, maxLength = 120) {
        if (typeof value !== 'string') return fallback;
        const normalized = value.trim().slice(0, maxLength);
        return normalized || fallback;
    }

    function resolveConfig(input = {}, now = new Date()) {
        const timezone = validateTimezone(input.timezone || defaultTimezone) ? input.timezone || defaultTimezone : defaultTimezone;
        const targetDate = input.targetDate || getDefaultTargetDate(now);
        const targetTime = parseTargetDate(targetDate, timezone);
        const fallbackTarget = getDefaultTargetDate(now);
        const fallbackTime = parseTargetDate(fallbackTarget, defaultTimezone);
        const resolvedTargetTime = Number.isFinite(targetTime) ? targetTime : fallbackTime;

        return {
            targetDate,
            targetTime: resolvedTargetTime,
            timezone,
            label: normalizeText(input.label, 'Official Countdown'),
            title: normalizeText(input.title, 'Countdown'),
            completionMessage: normalizeText(input.completionMessage, 'A new beginning has arrived.')
        };
    }

    return {
        defaultTimezone,
        validateTimezone,
        parseTargetDate,
        getDefaultTargetDate,
        getRemaining,
        resolveConfig
    };
});
