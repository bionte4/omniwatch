import { getRegionById } from '../data/regions';

function escapeCsv(value) {
  const str = value == null ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatStamp(isoOrTime) {
  if (!isoOrTime) return '';
  try {
    const d = new Date(isoOrTime);
    if (Number.isNaN(d.getTime())) return String(isoOrTime);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'medium',
      timeZone: 'Asia/Jakarta',
    }).format(d);
  } catch {
    return String(isoOrTime);
  }
}

function resolveRegionLabel(alert, fallbackRegion) {
  if (alert.regionLabel) return alert.regionLabel;
  if (alert.region) return getRegionById(alert.region).label;
  return fallbackRegion?.label ?? '—';
}

/**
 * Normalize alert + device records into incident report rows.
 */
export function buildIncidentRows({
  alerts = [],
  devices = [],
  region,
  includeNormals = true,
}) {
  const alertRows = alerts
    .filter((a) => includeNormals || a.status === 'warning' || a.status === 'offline')
    .map((alert) => ({
      timestamp: formatStamp(alert.timestamp || alert.time),
      rawTimestamp: alert.timestamp || alert.time || '',
      deviceId: alert.deviceId || '—',
      deviceName: alert.deviceName || alert.deviceId || '—',
      deviceType: alert.deviceType || '—',
      region: resolveRegionLabel(alert, region),
      status: (alert.status || 'unknown').toUpperCase(),
      message: alert.message || '',
      source: 'alert',
    }));

  // Snapshot perangkat non-normal saat export (melengkapi riwayat alert)
  const deviceRows = devices
    .filter((d) => d.status === 'warning' || d.status === 'offline')
    .map((device) => ({
      timestamp: formatStamp(device.lastUpdate),
      rawTimestamp: device.lastUpdate || '',
      deviceId: device.id,
      deviceName: device.name,
      deviceType: device.type,
      region: resolveRegionLabel({ region: device.region }, region),
      status: device.status.toUpperCase(),
      message: `Snapshot status perangkat: ${device.status}`,
      source: 'device_snapshot',
    }));

  return [...alertRows, ...deviceRows];
}

function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function reportFilename(ext) {
  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);
  return `omniwatch-laporan-incident-${stamp}.${ext}`;
}

export function exportIncidentCsv(rows, meta = {}) {
  const header = [
    'Timestamp',
    'Device ID',
    'Nama Perangkat',
    'Jenis Perangkat',
    'Wilayah Stasiun',
    'Status',
    'Pesan',
    'Sumber',
  ];

  const lines = [
    `# OmniWatch Laporan Incident`,
    `# Dibuat: ${formatStamp(new Date().toISOString())}`,
    `# Wilayah filter: ${meta.regionLabel || 'Semua'}`,
    `# Total baris: ${rows.length}`,
    header.join(','),
    ...rows.map((row) =>
      [
        row.timestamp,
        row.deviceId,
        row.deviceName,
        row.deviceType,
        row.region,
        row.status,
        row.message,
        row.source,
      ]
        .map(escapeCsv)
        .join(','),
    ),
  ];

  downloadBlob(reportFilename('csv'), lines.join('\n'), 'text/csv;charset=utf-8');
}

export function exportIncidentText(rows, meta = {}) {
  const lines = [
    '══════════════════════════════════════════',
    '  OmniWatch — Laporan Incident',
    '══════════════════════════════════════════',
    `Dibuat          : ${formatStamp(new Date().toISOString())}`,
    `Wilayah filter  : ${meta.regionLabel || 'Semua'}`,
    `Total kejadian  : ${rows.length}`,
    '──────────────────────────────────────────',
    '',
  ];

  if (!rows.length) {
    lines.push('(Tidak ada data incident untuk diekspor.)');
  } else {
    rows.forEach((row, index) => {
      lines.push(`${index + 1}. [${row.timestamp}] [${row.status}]`);
      lines.push(`   Perangkat : ${row.deviceName} (${row.deviceId})`);
      lines.push(`   Jenis     : ${row.deviceType}`);
      lines.push(`   Wilayah   : ${row.region}`);
      lines.push(`   Keterangan: ${row.message}`);
      lines.push('');
    });
  }

  lines.push('══════════════════════════════════════════');
  lines.push('Akhir laporan — OmniWatch BMKG Monitoring');

  downloadBlob(
    reportFilename('txt'),
    lines.join('\n'),
    'text/plain;charset=utf-8',
  );
}

/**
 * Open a print-ready HTML report (Save as PDF via browser print dialog).
 */
export function exportIncidentPdf(rows, meta = {}) {
  const title = 'OmniWatch — Laporan Incident';
  const generated = formatStamp(new Date().toISOString());
  const regionLabel = meta.regionLabel || 'Semua';

  const tableRows = rows.length
    ? rows
        .map(
          (row) => `
      <tr>
        <td>${escapeHtml(row.timestamp)}</td>
        <td>${escapeHtml(row.deviceName)}<br/><span class="muted">${escapeHtml(row.deviceId)}</span></td>
        <td>${escapeHtml(row.region)}</td>
        <td><span class="badge ${row.status.toLowerCase()}">${escapeHtml(row.status)}</span></td>
        <td>${escapeHtml(row.message)}</td>
      </tr>`,
        )
        .join('')
    : `<tr><td colspan="5" style="text-align:center;padding:24px;">Tidak ada data incident.</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    body { font-family: "Segoe UI", system-ui, sans-serif; color: #0f172a; margin: 32px; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    .meta { color: #64748b; font-size: 12px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #f1f5f9; font-weight: 600; }
    .muted { color: #94a3b8; font-size: 11px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; }
    .badge.warning { background: #fef3c7; color: #b45309; }
    .badge.offline { background: #fee2e2; color: #b91c1c; }
    .badge.normal { background: #d1fae5; color: #047857; }
    @media print {
      body { margin: 12mm; }
      button { display: none !important; }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    Dibuat: ${escapeHtml(generated)} · Wilayah: ${escapeHtml(regionLabel)} · Total: ${rows.length} baris
  </div>
  <table>
    <thead>
      <tr>
        <th>Timestamp</th>
        <th>Nama Perangkat</th>
        <th>Wilayah Stasiun</th>
        <th>Status</th>
        <th>Keterangan</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'noopener,noreferrer,width=960,height=720');
  if (!win) {
    // Fallback if popup blocked: download HTML instead
    downloadBlob(reportFilename('html'), html, 'text/html;charset=utf-8');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
