const CountdownEngine = require('../countdown-engine.js');

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getQueryValue(req, key) {
  const value = req.query && req.query[key];
  return typeof value === 'string' ? value.trim() : '';
}

export default function handler(req, res) {
  const now = new Date();
  const legacyYear = getQueryValue(req, 'year');
  const requestedDate = getQueryValue(req, 'date');
  const timezone = getQueryValue(req, 'timezone') || 'UTC';
  const targetDate = requestedDate || (legacyYear ? `${legacyYear}-01-01T00:00:00` : CountdownEngine.getDefaultTargetDate(now));
  const config = CountdownEngine.resolveConfig({
    targetDate,
    timezone,
    label: getQueryValue(req, 'label'),
    title: getQueryValue(req, 'title'),
    completionMessage: getQueryValue(req, 'completion')
  }, now);
  const targetIsValid = Number.isFinite(CountdownEngine.parseTargetDate(targetDate, timezone));
  const remaining = CountdownEngine.getRemaining(config.targetTime, now.getTime());

  const ACCENT = '#A855F7';
  const BG = '#0D1117';
  const FG = '#FFFFFF';
  const DIM = '#8B949E';
  const BORDER = '#30363D';
  const FONT = 'JetBrains Mono, Courier New, monospace';
  const W = 860;
  const H_SVG = 220;
  const SEG_W = 160;
  const SEG_GAP = 20;
  const startX = (W - (4 * SEG_W + 3 * SEG_GAP)) / 2;
  const title = escapeXml(config.title);
  const label = escapeXml(config.label);
  const timezoneLabel = escapeXml(config.timezone);
  const completion = escapeXml(config.completionMessage);

  const segment = (x, value, segmentLabel) => {
    const bw = 160;
    const bh = 110;
    const by = 42;
    return `
      <rect x="${x}" y="${by}" width="${bw}" height="${bh}" fill="${BORDER}" rx="0"/>
      <rect x="${x + 1}" y="${by + 1}" width="${bw - 2}" height="${bh - 2}" fill="${BG}" rx="0"/>
      <text x="${x + bw / 2}" y="${by + 72}" font-family="${FONT}" font-size="56" font-weight="800" fill="${ACCENT}" text-anchor="middle" letter-spacing="-2">${value}</text>
      <text x="${x + bw / 2}" y="${by + bh + 22}" font-family="${FONT}" font-size="11" font-weight="700" fill="${DIM}" text-anchor="middle" letter-spacing="3">${segmentLabel}</text>`;
  };

  const sepDots = (x) => `<text x="${x}" y="102" font-family="${FONT}" font-size="28" font-weight="800" fill="${ACCENT}" text-anchor="middle">:</text>`;
  const invalidMessage = 'Countdown unavailable';
  const content = !targetIsValid
    ? `<text x="${W / 2}" y="115" font-family="${FONT}" font-size="26" font-weight="800" fill="${FG}" text-anchor="middle">${invalidMessage}</text>`
    : remaining.expired
      ? `<text x="${W / 2}" y="100" font-family="${FONT}" font-size="26" font-weight="800" fill="${FG}" text-anchor="middle">${title}</text><text x="${W / 2}" y="132" font-family="${FONT}" font-size="13" fill="${DIM}" text-anchor="middle">${completion}</text>`
      : `${segment(startX, String(remaining.days).padStart(2, '0'), 'DAYS')}
  <g class="sep">${sepDots(startX + SEG_W + 10)}</g>
  ${segment(startX + SEG_W + SEG_GAP, String(remaining.hours).padStart(2, '0'), 'HOURS')}
  <g class="sep">${sepDots(startX + 2 * SEG_W + 30)}</g>
  ${segment(startX + 2 * (SEG_W + SEG_GAP), String(remaining.minutes).padStart(2, '0'), 'MINUTES')}
  <g class="sep">${sepDots(startX + 3 * SEG_W + 50)}</g>
  <g class="sec">${segment(startX + 3 * (SEG_W + SEG_GAP), String(remaining.seconds).padStart(2, '0'), 'SECONDS')}</g>`;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H_SVG}" viewBox="0 0 ${W} ${H_SVG}" role="img" aria-label="${label}: ${title}">
  <style>
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
    .sep { animation: pulse 1s infinite; }
    .sec { filter: drop-shadow(0 0 5px ${ACCENT}); }
  </style>
  <rect width="${W}" height="${H_SVG}" fill="${BG}"/>
  <rect x="0" y="0" width="${W}" height="3" fill="${ACCENT}"/>
  <text x="40" y="26" font-family="${FONT}" font-size="11" font-weight="700" fill="${FG}" letter-spacing="3">${label}</text>
  <text x="${W - 40}" y="26" font-family="${FONT}" font-size="9" fill="${DIM}" text-anchor="end" letter-spacing="1">${timezoneLabel}</text>
  ${content}
  <text x="40" y="204" font-family="${FONT}" font-size="9" fill="${DIM}">${escapeXml(config.targetDate)}</text>
  <text x="${W - 40}" y="204" font-family="${FONT}" font-size="9" fill="${DIM}" text-anchor="end">LIVE PREVIEW</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  return res.send(svg);
}
