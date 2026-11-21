/* ==========================================
   CampaignCertificate — generates a downloadable PNG
   certificate entirely client-side via the Canvas API.
   No server round-trip, no external image libraries.
   ========================================== */

/**
 * Draws a certificate onto an off-screen <canvas> and triggers a PNG download.
 *
 * @param {object} opts
 * @param {string} [opts.campaignId]   - Campaign identifier (used as fallback for non-Latin titles)
 * @param {string} opts.campaignTitle  - Localized campaign title
 * @param {string} opts.playerName     - Player's profile name
 * @param {number} opts.missionCount   - Number of missions in the campaign
 * @param {string} opts.dateLabel      - Pre-formatted date string (caller provides locale)
 * @param {Function} opts.t            - Translation function
 */
export async function downloadCampaignCertificate({
  campaignId,
  campaignTitle,
  playerName,
  missionCount,
  dateLabel,
  t,
}) {
  // ── Canvas setup ──────────────────────────────────────────────────────────
  const W = 1200;
  const H = 800;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // ── Background gradient ───────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0d0d1a");
  bg.addColorStop(0.5, "#0f1535");
  bg.addColorStop(1, "#0d0d1a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Subtle star field ─────────────────────────────────────────────────────
  const rng = mulberry32(42); // deterministic seed for consistent output
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  for (let i = 0; i < 120; i++) {
    const x = rng() * W;
    const y = rng() * H;
    const r = rng() * 1.5 + 0.3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Outer border (double rule) ────────────────────────────────────────────
  const margin = 28;
  roundRect(ctx, margin, margin, W - margin * 2, H - margin * 2, 16, null, "#06d6a0", 3);
  roundRect(ctx, margin + 8, margin + 8, W - (margin + 8) * 2, H - (margin + 8) * 2, 10, null, "rgba(6,214,160,0.25)", 1);

  // ── Soroban Quest branding header ─────────────────────────────────────────
  ctx.textAlign = "center";

  // Logo emoji
  ctx.font = "40px serif";
  ctx.fillText("⚔️", W / 2, 110);

  // Brand name
  ctx.font = "bold 22px 'Courier New', monospace";
  const brandGrad = ctx.createLinearGradient(W / 2 - 120, 0, W / 2 + 120, 0);
  brandGrad.addColorStop(0, "#06d6a0");
  brandGrad.addColorStop(1, "#8b5cf6");
  ctx.fillStyle = brandGrad;
  ctx.fillText("SOROBAN QUEST", W / 2, 148);

  // Subtitle rule
  ctx.fillStyle = "rgba(6,214,160,0.4)";
  ctx.fillRect(W / 2 - 200, 158, 400, 1);

  // ── "Certificate of Completion" label ────────────────────────────────────
  ctx.font = "italic 17px Georgia, serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText(t("certificate.ofCompletion"), W / 2, 192);

  // ── "This certifies that" ─────────────────────────────────────────────────
  ctx.font = "16px Georgia, serif";
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText(t("certificate.thisCertifies"), W / 2, 248);

  // ── Player name ───────────────────────────────────────────────────────────
  ctx.font = "bold 52px Georgia, serif";
  const nameGrad = ctx.createLinearGradient(W / 2 - 300, 0, W / 2 + 300, 0);
  nameGrad.addColorStop(0, "#06d6a0");
  nameGrad.addColorStop(0.5, "#ffffff");
  nameGrad.addColorStop(1, "#8b5cf6");
  ctx.fillStyle = nameGrad;
  ctx.fillText(clampText(ctx, playerName, W - 120), W / 2, 320);

  // Name underline
  const nameWidth = Math.min(ctx.measureText(playerName).width, W - 120);
  ctx.strokeStyle = "rgba(6,214,160,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - nameWidth / 2, 332);
  ctx.lineTo(W / 2 + nameWidth / 2, 332);
  ctx.stroke();

  // ── "has successfully completed" ─────────────────────────────────────────
  ctx.font = "16px Georgia, serif";
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText(t("certificate.hasCompleted"), W / 2, 376);

  // ── Campaign title ────────────────────────────────────────────────────────
  ctx.font = "bold 34px 'Courier New', monospace";
  const titleGrad = ctx.createLinearGradient(W / 2 - 260, 0, W / 2 + 260, 0);
  titleGrad.addColorStop(0, "#f59e0b");
  titleGrad.addColorStop(1, "#ef4444");
  ctx.fillStyle = titleGrad;
  ctx.fillText(clampText(ctx, campaignTitle, W - 100), W / 2, 426);

  // ── Mission count badge ───────────────────────────────────────────────────
  const badgeLabel = t("certificate.missions", { count: missionCount });
  ctx.font = "14px 'Courier New', monospace";
  const badgeW = ctx.measureText(badgeLabel).width + 32;
  roundRect(
    ctx,
    W / 2 - badgeW / 2,
    455,
    badgeW,
    30,
    8,
    "rgba(139,92,246,0.25)",
    "rgba(139,92,246,0.6)",
    1,
  );
  ctx.fillStyle = "#c4b5fd";
  ctx.fillText(badgeLabel, W / 2, 475);

  // ── Decorative divider ────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(6,214,160,0.3)";
  ctx.fillRect(W / 2 - 180, 510, 360, 1);

  // ── Date and seal row ────────────────────────────────────────────────────
  // Seal (left)
  ctx.font = "36px serif";
  ctx.fillText("🏆", W / 2 - 160, 570);

  // Date
  ctx.font = "14px 'Courier New', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText(t("certificate.completedOn", { date: dateLabel }), W / 2, 568);

  // Seal (right)
  ctx.font = "36px serif";
  ctx.fillText("🌟", W / 2 + 160, 570);

  // ── Footer ────────────────────────────────────────────────────────────────
  ctx.font = "11px 'Courier New', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillText("soroban-quest • Stellar Smart Contract Platform", W / 2, H - 44);

  // ── Download ──────────────────────────────────────────────────────────────
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas toBlob failed"));
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getCertificateFilename(campaignTitle, campaignId);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Generates a clean, filesystem-safe filename for the certificate.
 * Normalizes accented characters and falls back to campaignId when non-Latin
 * titles (e.g. Japanese or Chinese) collapse to an empty or very short slug.
 *
 * @param {string} [campaignTitle]
 * @param {string} [campaignId]
 * @returns {string}
 */
export function getCertificateFilename(campaignTitle, campaignId) {
  const normalizedTitle = (campaignTitle || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  let safeName = normalizedTitle
    .replace(/[^a-z0-9\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

  // If sanitized title is empty or very short (< 3 chars, e.g. "1" from Japanese/Chinese titles),
  // fall back to campaignId (e.g. "chapter-1-awakening")
  if (!safeName || safeName.length < 3) {
    safeName = (campaignId || "")
      .replace(/[^a-z0-9\s-]/gi, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase() || "campaign";
  }

  return `soroban-quest-certificate-${safeName}.png`;
}

/**
 * Simple seeded PRNG (Mulberry32) so the star field is deterministic.
 * @param {number} seed
 */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Draws a rounded rectangle.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x @param {number} y @param {number} w @param {number} h @param {number} r
 * @param {string|null} fill
 * @param {string|null} stroke
 * @param {number} lineWidth
 */
function roundRect(ctx, x, y, w, h, r, fill, stroke, lineWidth = 1) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

/**
 * Returns `text` or a truncated version with "…" so it fits within `maxWidth`
 * pixels at the current ctx font.
 */
function clampText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + "…").width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + "…";
}
