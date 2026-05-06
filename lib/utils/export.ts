import Papa from "papaparse";
import type { AnalyticsSnapshot } from "@/types";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── CSV ────────────────────────────────────────────────────────────────────

export function exportAnalyticsCSV(snapshots: AnalyticsSnapshot[], filename = "analytics-export.csv") {
  const rows = snapshots.map((s) => ({
    date: s.metric_date,
    platform: s.platform ?? "",
    impressions: s.metrics.impressions ?? "",
    reach: s.metrics.reach ?? "",
    engagement_rate: s.metrics.engagement_rate ?? "",
    spend: s.metrics.spend ?? "",
    revenue: s.metrics.revenue ?? "",
    conversions: s.metrics.conversions ?? "",
    roas: s.metrics.roas ?? "",
    ctr: s.metrics.ctr ?? "",
    followers: s.metrics.followers ?? "",
  }));

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

// ── PDF ────────────────────────────────────────────────────────────────────

export async function exportAnalyticsPDF(
  snapshots: AnalyticsSnapshot[],
  workspaceName: string,
  filename = "analytics-report.pdf"
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const BRAND  = [26,  111, 212] as [number, number, number];
  const LIGHT  = [255, 255, 255] as [number, number, number];
  const DARK   = [248, 251, 255] as [number, number, number];
  const MUTED  = [100, 120, 145] as [number, number, number];
  const W      = 210;
  const MARGIN = 16;
  const COL    = W - MARGIN * 2;

  // ── Cover ──
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 297, "F");

  doc.setFillColor(...BRAND);
  doc.rect(0, 0, W, 2, "F");

  doc.setTextColor(...BRAND);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("MKT.NOTES HUB", MARGIN, 18);

  doc.setTextColor(30, 21, 17);
  doc.setFontSize(28);
  doc.text("Analytics Report", MARGIN, 50);

  doc.setTextColor(...MUTED);
  doc.setFontSize(9);
  doc.text(workspaceName.toUpperCase(), MARGIN, 60);
  doc.text(`Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, MARGIN, 67);

  // Summary box
  const totals = snapshots.reduce(
    (acc, s) => ({
      impressions: acc.impressions + (s.metrics.impressions ?? 0),
      reach:       acc.reach       + (s.metrics.reach       ?? 0),
      spend:       acc.spend       + (s.metrics.spend       ?? 0),
      revenue:     acc.revenue     + (s.metrics.revenue     ?? 0),
      conversions: acc.conversions + (s.metrics.conversions ?? 0),
    }),
    { impressions: 0, reach: 0, spend: 0, revenue: 0, conversions: 0 }
  );

  doc.setFillColor(240, 236, 255);
  doc.roundedRect(MARGIN, 80, COL, 50, 2, 2, "F");

  const metrics30 = [
    ["Total Impressions", totals.impressions.toLocaleString()],
    ["Total Reach",       totals.reach.toLocaleString()],
    ["Total Spend",       `$${totals.spend.toFixed(2)}`],
    ["Total Revenue",     `$${totals.revenue.toFixed(2)}`],
    ["Conversions",       totals.conversions.toLocaleString()],
  ];

  const colW = COL / metrics30.length;
  metrics30.forEach((pair, i) => {
    const value = pair[1] ?? "";
    const label = pair[0] ?? "";
    const x = MARGIN + i * colW + colW / 2;
    doc.setTextColor(...BRAND);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(value, x, 103, { align: "center" });
    doc.setTextColor(...MUTED);
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text(label.toUpperCase(), x, 110, { align: "center" });
  });

  // ── Data Table ──
  doc.addPage();
  doc.setFillColor(...DARK);
  doc.rect(0, 0, W, 297, "F");
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, W, 2, "F");

  doc.setTextColor(30, 21, 17);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Performance Data", MARGIN, 20);

  doc.setTextColor(...MUTED);
  doc.setFontSize(7);
  doc.text(`${snapshots.length} snapshots — last 30 days`, MARGIN, 27);

  const HEADERS = ["Date", "Platform", "Impressions", "Reach", "Spend ($)", "Revenue ($)", "Conversions"];
  const COL_W   = [22, 22, 28, 24, 22, 24, 24];
  let y = 38;

  // Header row
  doc.setFillColor(240, 236, 255);
  doc.rect(MARGIN, y - 5, COL, 8, "F");
  doc.setTextColor(...BRAND);
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  let x = MARGIN + 2;
  HEADERS.forEach((h, i) => {
    doc.text(h.toUpperCase(), x, y);
    x += COL_W[i]!;
  });
  y += 6;

  // Data rows
  doc.setFont("helvetica", "normal");
  snapshots.forEach((s, idx) => {
    if (y > 275) {
      doc.addPage();
      doc.setFillColor(...DARK);
      doc.rect(0, 0, W, 297, "F");
      y = 20;
    }
    if (idx % 2 === 0) {
      doc.setFillColor(247, 244, 240);
      doc.rect(MARGIN, y - 4, COL, 7, "F");
    }
    doc.setTextColor(30, 21, 17);
    doc.setFontSize(6);
    const row = [
      s.metric_date,
      s.platform ?? "—",
      (s.metrics.impressions ?? 0).toLocaleString(),
      (s.metrics.reach ?? 0).toLocaleString(),
      (s.metrics.spend ?? 0).toFixed(2),
      (s.metrics.revenue ?? 0).toFixed(2),
      (s.metrics.conversions ?? 0).toString(),
    ];
    x = MARGIN + 2;
    row.forEach((cell, i) => {
      doc.text(String(cell), x, y);
      x += COL_W[i]!;
    });
    y += 7;
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor(...DARK);
    doc.rect(0, 290, W, 7, "F");
    doc.setTextColor(...MUTED);
    doc.setFontSize(6);
    doc.text("MKT.NOTES HUB — CONFIDENTIAL", MARGIN, 295);
    doc.text(`${p} / ${pageCount}`, W - MARGIN, 295, { align: "right" });
  }

  doc.save(filename);
}
