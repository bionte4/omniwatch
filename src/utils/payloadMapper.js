/**
 * Auto-map MQTT / HTTP JSON payloads into OmniWatch device model.
 */

const ID_KEYS = ['id', 'device_id', 'deviceId', 'sensor_id', 'sensorId', 'imei', 'uid'];
const NAME_KEYS = ['name', 'device_name', 'deviceName', 'station_name', 'stationName', 'label', 'title'];
const TYPE_KEYS = ['type', 'device_type', 'deviceType', 'sensor_type', 'category'];
const LAT_KEYS = ['lat', 'latitude', 'y'];
const LNG_KEYS = ['lng', 'lon', 'long', 'longitude', 'x'];
const STATUS_KEYS = ['status', 'state', 'health', 'condition'];
const BATTERY_KEYS = ['battery', 'battery_pct', 'batteryPercent', 'batt', 'soc'];
const SIGNAL_KEYS = ['signal', 'signal_pct', 'rssi', 'rsrp', 'snr'];
const REGION_KEYS = ['region', 'region_id', 'regionId', 'station', 'site'];
const LOCATION_KEYS = ['location', 'address', 'place', 'lokasi'];

const TYPE_ALIASES = {
  seismometer: 'Seismometer',
  seismic: 'Seismometer',
  aws: 'AWS',
  weather: 'AWS',
  tide: 'Tide Gauge',
  'tide gauge': 'Tide Gauge',
  tidegauge: 'Tide Gauge',
  accelerograph: 'Accelerograph',
  strongmotion: 'Accelerograph',
  arg: 'ARG',
  rain: 'ARG',
  rainfall: 'ARG',
};

const STATUS_ALIASES = {
  ok: 'normal',
  up: 'normal',
  online: 'normal',
  normal: 'normal',
  healthy: 'normal',
  warn: 'warning',
  warning: 'warning',
  degraded: 'warning',
  delay: 'warning',
  offline: 'offline',
  down: 'offline',
  critical: 'offline',
  error: 'offline',
  fail: 'offline',
};

function dig(obj, path) {
  return path.split('.').reduce((acc, key) => {
    if (acc == null) return undefined;
    return acc[key];
  }, obj);
}

function firstValue(obj, keys) {
  for (const key of keys) {
    if (key.includes('.')) {
      const v = dig(obj, key);
      if (v !== undefined && v !== null && v !== '') return { key, value: v };
    } else if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== '' && obj[key] != null) {
      return { key, value: obj[key] };
    }
  }
  // case-insensitive fallback
  const lowerMap = Object.fromEntries(
    Object.keys(obj).map((k) => [k.toLowerCase(), k]),
  );
  for (const key of keys) {
    const actual = lowerMap[key.toLowerCase()];
    if (actual != null && obj[actual] !== '' && obj[actual] != null) {
      return { key: actual, value: obj[actual] };
    }
  }
  return null;
}

function normalizeType(raw) {
  if (!raw) return 'Seismometer';
  const s = String(raw).trim();
  const mapped = TYPE_ALIASES[s.toLowerCase()];
  if (mapped) return mapped;
  const known = ['Seismometer', 'AWS', 'Tide Gauge', 'Accelerograph', 'ARG'];
  const hit = known.find((t) => t.toLowerCase() === s.toLowerCase());
  return hit || s;
}

function normalizeStatus(raw) {
  if (raw == null || raw === '') return 'normal';
  const s = String(raw).trim().toLowerCase();
  return STATUS_ALIASES[s] || (['normal', 'warning', 'offline'].includes(s) ? s : 'normal');
}

function normalizeSignal(raw) {
  if (raw == null || raw === '') return 80;
  const n = Number(raw);
  if (Number.isNaN(n)) return 80;
  // RSSI-ish negative dBm → percent
  if (n < 0) {
    const pct = Math.round(((n + 110) / 60) * 100);
    return Math.max(0, Math.min(100, pct));
  }
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeRegion(raw) {
  if (!raw) return 'padang';
  const s = String(raw).toLowerCase();
  if (s.includes('mentawai')) return 'mentawai';
  if (s.includes('bukit')) return 'bukittinggi';
  if (s.includes('padang')) return 'padang';
  if (['padang', 'mentawai', 'bukittinggi'].includes(s)) return s;
  return 'padang';
}

/**
 * Unwrap common envelope shapes: { data }, { payload }, { device }, arrays.
 */
export function extractPayloadCandidates(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (!parsed || typeof parsed !== 'object') return [];

  if (parsed.devices && Array.isArray(parsed.devices)) return parsed.devices;
  if (parsed.data && Array.isArray(parsed.data)) return parsed.data;
  if (parsed.payload && typeof parsed.payload === 'object' && !Array.isArray(parsed.payload)) {
    return [parsed.payload];
  }
  if (parsed.device && typeof parsed.device === 'object') return [parsed.device];
  return [parsed];
}

/**
 * Map one JSON object → OmniWatch device + field mapping report.
 */
export function mapPayloadToDevice(raw, defaults = {}) {
  const mapping = {};
  const pick = (keys, field) => {
    const hit = firstValue(raw, keys);
    if (hit) mapping[field] = hit.key;
    return hit?.value;
  };

  const id = pick(ID_KEYS, 'id') ?? defaults.id;
  const name = pick(NAME_KEYS, 'name') ?? defaults.name ?? id;
  const typeRaw = pick(TYPE_KEYS, 'type');
  const lat = Number(pick(LAT_KEYS, 'lat') ?? defaults.lat);
  const lng = Number(pick(LNG_KEYS, 'lng') ?? defaults.lng);
  const statusRaw = pick(STATUS_KEYS, 'status');
  const battery = Number(pick(BATTERY_KEYS, 'battery') ?? 100);
  const signalRaw = pick(SIGNAL_KEYS, 'signal');
  const regionRaw = pick(REGION_KEYS, 'region');
  const location = pick(LOCATION_KEYS, 'location') ?? defaults.location ?? '';

  const device = {
    id: String(id || '').trim().toUpperCase(),
    name: String(name || '').trim() || String(id || 'UNKNOWN'),
    type: normalizeType(typeRaw || defaults.type || 'Seismometer'),
    region: normalizeRegion(regionRaw || defaults.region || 'padang'),
    status: normalizeStatus(statusRaw),
    lat,
    lng,
    location: String(location || ''),
    lastUpdate: new Date().toISOString(),
    battery: Number.isNaN(battery) ? 100 : Math.max(0, Math.min(100, Math.round(battery))),
    signal: normalizeSignal(signalRaw),
    localOnly: true,
    ingestedFrom: 'wizard',
  };

  const missing = [];
  if (!device.id) missing.push('id');
  if (Number.isNaN(device.lat)) missing.push('lat');
  if (Number.isNaN(device.lng)) missing.push('lng');

  return {
    device,
    mapping,
    missing,
    ok: missing.length === 0,
  };
}

export function parseIngestText(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) {
    return { error: 'Payload kosong.', candidates: [] };
  }

  try {
    const parsed = JSON.parse(trimmed);
    const candidates = extractPayloadCandidates(parsed);
    if (!candidates.length) {
      return { error: 'Tidak ada objek perangkat di payload.', candidates: [] };
    }
    return { error: null, candidates, parsed };
  } catch {
    return {
      error: 'JSON tidak valid. Tempel payload MQTT/HTTP berbentuk JSON.',
      candidates: [],
    };
  }
}

export const SAMPLE_MQTT_PAYLOAD = `{
  "device_id": "SM-PDG-88",
  "station_name": "Seismometer Lubuk Begalung",
  "sensor_type": "seismometer",
  "lat": -0.9721,
  "lon": 100.4032,
  "state": "OK",
  "battery_pct": 91,
  "rssi": -67,
  "region": "padang",
  "location": "Lubuk Begalung, Padang"
}`;

export const SAMPLE_HTTP_PAYLOAD = `{
  "data": [{
    "sensorId": "ARG-MTW-07",
    "name": "ARG Siberut Utara",
    "type": "ARG",
    "latitude": -1.12,
    "longitude": 98.92,
    "status": "warning",
    "battery": 64,
    "signal": 55,
    "region_id": "mentawai",
    "lokasi": "Siberut, Mentawai"
  }]
}`;
