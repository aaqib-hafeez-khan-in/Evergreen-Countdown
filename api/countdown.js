export default function handler(req, res) {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const defaultYear =
    currentYear + (now.getUTCMonth() === 0 && now.getUTCDate() === 1 ? 0 : 1);

  const TARGET_YEAR = req.query.year ? parseInt(req.query.year) : defaultYear;
  const TARGET_LABEL = req.query.label || String(TARGET_YEAR);

  const ACCENT = "#A855F7";
  const BG = "#0D1117";
  const FG = "#FFFFFF";
  const DIM = "#8B949E";
  const BORDER = "#30363D";
  const FONT = "JetBrains Mono, Courier New, monospace";

  const target = new Date(`January 1, ${TARGET_YEAR} 00:00:00 UTC`);
  const diff = Math.max(0, target - now);

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, "0");
  const D = pad(days);
  const H = pad(hours);
  const M = pad(minutes);
  const S = pad(seconds);

  const updatedAt = now.toUTCString().replace(/:\d{2} GMT/, " UTC");
  const yearStart = new Date(`January 1 ${now.getUTCFullYear()} 00:00:00 UTC`);
  const yearEnd = new Date(
    `January 1 ${now.getUTCFullYear() + 1} 00:00:00 UTC`,
  );
  const progress = Math.min(1, (now - yearStart) / (yearEnd - yearStart));
  const progressPct = (progress * 100).toFixed(1);

  const W = 860;
  const H_SVG = 220;
  const SEG_W = 160;
  const SEG_GAP = 20;
  const startX = (W - (4 * SEG_W + 3 * SEG_GAP)) / 2;

  const segment = (x, value, label) => {
    const bw = 160;
    const bh = 110;
    const by = 42;
    return `
      <rect x="${x}" y="${by}" width="${bw}" height="${bh}" fill="${BORDER}" rx="0"/>
      <rect x="${x + 1}" y="${by + 1}" width="${bw - 2}" height="${bh - 2}" fill="${BG}" rx="0"/>
      <text x="${x + bw / 2}" y="${by + 72}" font-family="${FONT}" font-size="56" font-weight="800" fill="${ACCENT}" text-anchor="middle" letter-spacing="-2">${value}</text>
      <text x="${x + bw / 2}" y="${by + bh + 22}" font-family="${FONT}" font-size="11" font-weight="700" fill="${DIM}" text-anchor="middle" letter-spacing="3">${label}</text>`;
  };

  const sepDots = (x) =>
    `<text x="${x}" y="102" font-family="${FONT}" font-size="28" font-weight="800" fill="${ACCENT}" text-anchor="middle">:</text>`;

  const barX = 40;
  const barY = H_SVG - 32;
  const barW = W - 80;
  const barH = 6;
  const filled = Math.round(barW * progress);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H_SVG}" viewBox="0 0 ${W} ${H_SVG}" role="img">
  <style>
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
    .sep { animation: pulse 1s infinite; }
    .sec { filter: drop-shadow(0 0 5px ${ACCENT}); }
  </style>
  <rect width="${W}" height="${H_SVG}" fill="${BG}"/>
  <rect x="0" y="0" width="${W}" height="3" fill="${ACCENT}"/>
  <text x="40" y="26" font-family="${FONT}" font-size="11" font-weight="700" fill="${FG}" letter-spacing="3">COUNTDOWN TO ${TARGET_LABEL}</text>
  <text x="${W - 40}" y="26" font-family="${FONT}" font-size="9" fill="${DIM}" text-anchor="end" letter-spacing="1">LIVE PREVIEW</text>
  ${segment(startX, D, "DAYS")}
  <g class="sep">${sepDots(startX + SEG_W + 10)}</g>
  ${segment(startX + SEG_W + SEG_GAP, H, "HOURS")}
  <g class="sep">${sepDots(startX + 2 * SEG_W + 30)}</g>
  ${segment(startX + 2 * (SEG_W + SEG_GAP), M, "MINUTES")}
  <g class="sep">${sepDots(startX + 3 * SEG_W + 50)}</g>
  <g class="sec">${segment(startX + 3 * (SEG_W + SEG_GAP), S, "SECONDS")}</g>
  <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" fill="${BORDER}" rx="0"/>
  <rect x="${barX}" y="${barY}" width="${filled}" height="${barH}" fill="${ACCENT}" rx="0"/>
  <text x="${barX}" y="${barY - 8}" font-family="${FONT}" font-size="9" fill="${DIM}">${now.getUTCFullYear()} ELAPSED</text>
  <text x="${barX + barW}" y="${barY - 8}" font-family="${FONT}" font-size="9" fill="${DIM}" text-anchor="end">${progressPct}%</text>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate");
  return res.send(svg);
}
