/* global Chart */

function $(id) {
  return document.getElementById(id);
}

function fmtPct(x) {
  const v = Math.round(x * 1000) / 10;
  return `${v.toFixed(1)}%`;
}

function fmtBucket(bucketSec) {
  if (bucketSec % 3600 === 0) return `${bucketSec / 3600}h`;
  if (bucketSec % 60 === 0) return `${bucketSec / 60}m`;
  return `${bucketSec}s`;
}

function fmtTime(ms) {
  const d = new Date(ms);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function fmtDateTime(ms) {
  try {
    return new Date(ms).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return new Date(ms).toLocaleString();
  }
}

function fmtLabel(win, bucketSec, ms) {
  if (win === '1h') return fmtTime(ms);
  if (win === '24h' && bucketSec >= 3600) return fmtDateTime(ms);
  if (win === '7d') return fmtDateTime(ms);
  return fmtTime(ms);
}

async function getJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return r.json();
}

let chart;
const state = {
  topIp: [],
  topPath: [],
  susp: [],
};

function renderTable(tbody, rows, cols) {
  tbody.innerHTML = '';
  if (!rows.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = cols.length;
    td.className = 'muted';
    td.textContent = 'No results';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }
  for (const row of rows) {
    const tr = document.createElement('tr');
    for (const c of cols) {
      const td = document.createElement('td');
      if (c.className) td.className = c.className;
      const value = c.format ? c.format(row) : row[c.key];
      if (value && typeof value === 'object' && value.nodeType) {
        td.appendChild(value);
      } else {
        td.textContent = String(value ?? '');
      }
      if (c.title) {
        const title = c.title(row);
        if (title) td.title = title;
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

function createBadge(value) {
  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = String(value);
  return badge;
}

function statusBadge(status) {
  const badge = createBadge(status);
  if (status >= 500) badge.classList.add('bad');
  else if (status >= 400) badge.classList.add('warn');
  else if (status >= 300) badge.classList.add('info');
  else badge.classList.add('good');
  return badge;
}

function ratio(n, d) {
  if (!d) return 0;
  return n / d;
}

function sumSeries(arr) {
  return arr.reduce((acc, n) => acc + n, 0);
}

function applyTopFilters(rows, search, focus, key) {
  const needle = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (needle) {
      const hay = String(row[key] || '').toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    if (focus === 'errors' && (row.serr || 0) === 0) return false;
    if (focus === 'suspicious' && (row.susp || 0) === 0) return false;
    return true;
  });
}

function applySuspFilters(rows, search, focus) {
  const needle = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (needle) {
      const hay = `${row.ip} ${row.path} ${row.reason} ${row.method} ${row.status} ${row.ua || ''}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    if (focus === 'errors' && row.status < 400) return false;
    return true;
  });
}

function renderTables() {
  const search = $('table-search').value || '';
  const focus = $('table-focus').value || 'all';

  const topIpRows = applyTopFilters(state.topIp, search, focus, 'ip');
  const topPathRows = applyTopFilters(state.topPath, search, focus, 'path');
  const suspRows = applySuspFilters(state.susp, search, focus);

  renderTable($('top-ip'), topIpRows, [
    { key: 'ip', className: 'truncate' },
    { key: 'n', className: 'num' },
    { key: 'serr', className: 'num' },
    { key: 'ratioErr', className: 'num', format: (r) => fmtPct(ratio(r.serr, r.n)) },
    { key: 'susp', className: 'num' },
  ]);

  renderTable($('top-path'), topPathRows, [
    { key: 'path', className: 'truncate' },
    { key: 'n', className: 'num' },
    { key: 'serr', className: 'num' },
    { key: 'ratioErr', className: 'num', format: (r) => fmtPct(ratio(r.serr, r.n)) },
    { key: 'susp', className: 'num' },
  ]);

  renderTable($('susp'), suspRows, [
    { key: 'time', className: 'truncate' },
    { key: 'status', className: 'num', format: (r) => statusBadge(r.status) },
    { key: 'method' },
    { key: 'ip', className: 'truncate' },
    { key: 'path', className: 'truncate', title: (r) => r.ua },
    { key: 'reason', className: 'truncate' },
  ]);

  $('table-summary').textContent = `Showing ${topIpRows.length} IPs · ${topPathRows.length} paths · ${suspRows.length} suspicious`;
}

function updateSubtitle(cfg, win) {
  const updated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  $('subtitle').textContent = `${cfg.siteName} · window=${win} · updated ${updated}`;
}

async function refresh() {
  const win = $('window').value;
  const bucketSec = Number.parseInt($('bucket').value, 10) || 60;
  $('chart-error').textContent = '';

  const cfg = await getJson('/api/config');
  updateSubtitle(cfg, win);
  $('tag-ingest').textContent = cfg.ingestEnabled ? 'ingest:on' : 'ingest:off';
  $('tag-ingest').className = cfg.logPathConfigured ? 'tag' : 'tag bad';
  if (!cfg.logPathConfigured) $('tag-ingest').textContent = 'log:not set';
  $('tag-bucket').textContent = `bucket=${fmtBucket(bucketSec)}`;

  const overview = await getJson(`/api/overview?window=${encodeURIComponent(win)}`);
  $('kpi-total').textContent = String(overview.total);
  $('kpi-ip').textContent = String(overview.uniqueIp);
  $('kpi-4xx').textContent = fmtPct(overview.fourxxRatio || 0);
  $('kpi-susp').textContent = String(overview.suspicious || 0);

  const ts = await getJson(`/api/timeseries?window=${encodeURIComponent(win)}&bucketSec=${bucketSec}`);
  const labels = ts.rows.map((r) => fmtLabel(win, bucketSec, r.t));

  const dataTotal = ts.rows.map((r) => r.total);
  const s2xx = ts.rows.map((r) => r.s2xx);
  const s3xx = ts.rows.map((r) => r.s3xx);
  const s4xx = ts.rows.map((r) => r.s4xx);
  const s5xx = ts.rows.map((r) => r.s5xx);

  const bucketLabel = fmtBucket(bucketSec);
  $('chart-subtitle').textContent = `requests/${bucketLabel} + status breakdown`;

  const totalSum = sumSeries(dataTotal);
  const sum2xx = sumSeries(s2xx);
  const sum3xx = sumSeries(s3xx);
  const sum4xx = sumSeries(s4xx);
  const sum5xx = sumSeries(s5xx);

  const updateStat = (countId, pctId, count) => {
    if (totalSum > 0) {
      $(countId).textContent = String(count);
      $(pctId).textContent = fmtPct(ratio(count, totalSum));
    } else {
      $(countId).textContent = '-';
      $(pctId).textContent = '-';
    }
  };

  updateStat('stat-2xx', 'stat-2xx-pct', sum2xx);
  updateStat('stat-3xx', 'stat-3xx-pct', sum3xx);
  updateStat('stat-4xx', 'stat-4xx-pct', sum4xx);
  updateStat('stat-5xx', 'stat-5xx-pct', sum5xx);

  if (dataTotal.length) {
    const avgPerBucket = totalSum / dataTotal.length;
    const peak = Math.max(...dataTotal);
    const scaleToMin = 60 / bucketSec;
    const avgPerMin = avgPerBucket * scaleToMin;
    const peakPerMin = peak * scaleToMin;
    $('chart-summary').textContent = `avg ${avgPerMin.toFixed(1)}/min · peak ${peakPerMin.toFixed(1)}/min`;
  } else {
    $('chart-summary').textContent = 'no data in selected window';
  }

  const ctx = $('chart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'total', data: dataTotal, borderColor: '#7aa2ff', tension: 0.25, pointRadius: 0, borderWidth: 2 },
        { label: '2xx', data: s2xx, borderColor: '#4ade80', tension: 0.25, pointRadius: 0, borderWidth: 2 },
        { label: '3xx', data: s3xx, borderColor: '#38bdf8', tension: 0.25, pointRadius: 0, borderWidth: 2 },
        { label: '4xx', data: s4xx, borderColor: '#f97316', tension: 0.25, pointRadius: 0, borderWidth: 2 },
        { label: '5xx', data: s5xx, borderColor: '#ff6b6b', tension: 0.25, pointRadius: 0, borderWidth: 2 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#e6e8ef' } },
        tooltip: { mode: 'index', intersect: false },
      },
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          ticks: { color: '#9aa4bf', maxRotation: 0, autoSkip: true, maxTicksLimit: 10 },
          grid: { color: 'rgba(255,255,255,0.06)' },
        },
        y: { ticks: { color: '#9aa4bf' } },
      },
    },
  });

  const limit = Number.parseInt($('table-limit').value, 10) || 15;
  const topIp = await getJson(`/api/top/ip?window=${encodeURIComponent(win)}&limit=${limit}`);
  state.topIp = topIp.rows || [];

  const topPath = await getJson(`/api/top/path?window=${encodeURIComponent(win)}&limit=${limit}`);
  state.topPath = topPath.rows || [];

  const susp = await getJson(`/api/suspicious?window=${encodeURIComponent(win)}&limit=${limit}`);
  state.susp = (susp.rows || []).map((r) => ({
    time: fmtDateTime(r.tsMs),
    ip: r.ip,
    path: r.path,
    reason: r.suspiciousReason,
    method: r.method,
    status: r.status,
    ua: r.ua,
  }));

  renderTables();
}

function handleRefresh() {
  refresh().catch((e) => {
    $('chart-error').textContent = String(e && e.stack ? e.stack : e);
  });
}

$('refresh').addEventListener('click', handleRefresh);
$('window').addEventListener('change', handleRefresh);
$('bucket').addEventListener('change', handleRefresh);
$('table-limit').addEventListener('change', handleRefresh);
$('table-focus').addEventListener('change', () => renderTables());
$('table-search').addEventListener('input', () => renderTables());

(async () => {
  try {
    const cfg = await getJson('/api/config');
    if (cfg.windowDefault) $('window').value = cfg.windowDefault;
  } catch {}

  handleRefresh();
})();
