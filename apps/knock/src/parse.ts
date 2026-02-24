const MONTH: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

export type ParsedRequest = {
  tsMs: number;
  ip: string;
  method: string;
  path: string;
  status: number;
  bytes: number;
  referer: string;
  ua: string;
  suspicious: 0 | 1;
  suspiciousReason: string;
};

// Compatible with common Nginx combined log format.
// Example:
// 1.2.3.4 - - [16/Feb/2026:20:11:10 +0800] "GET /wp-login.php HTTP/1.1" 404 153 "-" "UA..."
const COMBINED_RE =
  /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"(\S+)\s+([^\s]+)\s+HTTP\/[^\"]+"\s+(\d{3})\s+(\S+)\s+"([^"]*)"\s+"([^"]*)"/;

function parseNginxTimeToMs(s: string): number | null {
  // 16/Feb/2026:20:11:10 +0800
  const m = s.match(/^(\d{2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})\s+([+-]\d{4})$/);
  if (!m) return null;
  const dd = m[1];
  const mon = MONTH[m[2]];
  const yyyy = m[3];
  const hh = m[4];
  const mm = m[5];
  const ss = m[6];
  const off = m[7];
  if (!mon) return null;

  const tz = off.slice(0, 3) + ':' + off.slice(3);
  const iso = `${yyyy}-${mon}-${dd}T${hh}:${mm}:${ss}${tz}`;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

function normalizePath(uri: string): string {
  const noQuery = uri.split('?')[0] || '/';
  // avoid storing absurdly long paths
  return noQuery.length > 512 ? noQuery.slice(0, 512) : noQuery;
}

const SUSPICIOUS_RULES: Array<{ re: RegExp; reason: string }> = [
  { re: /\/\.env(\b|\/|$)/i, reason: 'probe:.env' },
  { re: /\/wp-(login|admin|content|includes)\b/i, reason: 'probe:wordpress' },
  { re: /\/xmlrpc\.php\b/i, reason: 'probe:wordpress-xmlrpc' },
  { re: /\/phpmyadmin\b/i, reason: 'probe:phpmyadmin' },
  { re: /\/cgi-bin\b/i, reason: 'probe:cgi-bin' },
  { re: /\/actuator\b/i, reason: 'probe:spring-actuator' },
  { re: /\/swagger\b/i, reason: 'probe:swagger' },
  { re: /\/\.git(\b|\/|$)/i, reason: 'probe:.git' },
  { re: /\/admin(\b|\/|$)/i, reason: 'probe:admin' },
];

function classifySuspicious(path: string): { suspicious: 0 | 1; reason: string } {
  for (const r of SUSPICIOUS_RULES) {
    if (r.re.test(path)) return { suspicious: 1, reason: r.reason };
  }
  return { suspicious: 0, reason: '' };
}

export function parseAccessLogLine(line: string): ParsedRequest | null {
  const m = line.match(COMBINED_RE);
  if (!m) return null;

  const ip = m[1];
  const tsRaw = m[2];
  const method = m[3];
  const uri = m[4];
  const status = Number.parseInt(m[5], 10);
  const bytesRaw = m[6];
  const referer = m[7] || '';
  const ua = m[8] || '';

  const tsMs = parseNginxTimeToMs(tsRaw);
  if (tsMs === null) return null;

  const bytes = bytesRaw === '-' ? 0 : Number.parseInt(bytesRaw, 10);
  const path = normalizePath(uri);

  const { suspicious, reason } = classifySuspicious(path);

  return {
    tsMs,
    ip,
    method,
    path,
    status: Number.isFinite(status) ? status : 0,
    bytes: Number.isFinite(bytes) ? bytes : 0,
    referer,
    ua,
    suspicious,
    suspiciousReason: reason,
  };
}
