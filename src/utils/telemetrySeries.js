/**
 * Mock telemetry series + technician contacts for Device Analytics Modal.
 */

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function hourLabel(hoursAgo) {
  const d = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).format(d);
}

const SERIES_CONFIG = {
  Seismometer: {
    title: 'Getaran / Peak Ground Acceleration',
    unit: 'gal',
    dataKey: 'value',
    color: '#8b5cf6',
    generator: (device, i) => {
      const base = 2 + (hash(device.id) % 8) / 10;
      const spike = i === 5 || i === 14 ? 4 + (hash(device.id + i) % 30) / 10 : 0;
      return Number((base + Math.sin(i / 2.2) * 0.8 + spike + (hash(`${device.id}${i}`) % 10) / 20).toFixed(2));
    },
  },
  Accelerograph: {
    title: 'Akselerasi Puncak (PGA)',
    unit: 'g',
    dataKey: 'value',
    color: '#f43f5e',
    generator: (device, i) => {
      const base = 0.01 + (hash(device.id) % 5) / 1000;
      const event = i === 8 ? 0.08 + (hash(device.id) % 20) / 1000 : 0;
      return Number((base + Math.abs(Math.sin(i / 3)) * 0.015 + event).toFixed(4));
    },
  },
  ARG: {
    title: 'Curah Hujan per Jam',
    unit: 'mm',
    dataKey: 'value',
    color: '#0ea5e9',
    generator: (device, i) => {
      const rain = Math.max(0, Math.sin(i / 4) * 6 + (hash(`${device.id}${i}`) % 8) - 3);
      return Number(rain.toFixed(1));
    },
  },
  AWS: {
    title: 'Kecepatan Angin',
    unit: 'm/s',
    dataKey: 'value',
    color: '#f59e0b',
    generator: (device, i) => {
      const base = 2 + (hash(device.id) % 4);
      return Number((base + Math.sin(i / 3) * 1.5 + (hash(`${device.id}w${i}`) % 10) / 10).toFixed(1));
    },
  },
  'Tide Gauge': {
    title: 'Tinggi Muka Air Laut',
    unit: 'm',
    dataKey: 'value',
    color: '#14b8a6',
    generator: (device, i) => {
      const tide = 0.8 + Math.sin((i + hash(device.id) % 6) / 3.5) * 0.55;
      return Number(tide.toFixed(2));
    },
  },
};

const DEFAULT_SERIES = SERIES_CONFIG.AWS;

const TECHNICIANS = {
  padang: {
    name: 'Teknisi Lapangan Padang',
    contact: '+62 812-3456-7801',
    email: 'teknisi.padang@bmkg.go.id',
  },
  mentawai: {
    name: 'Teknisi Lapangan Mentawai',
    contact: '+62 813-7788-2204',
    email: 'teknisi.mentawai@bmkg.go.id',
  },
  bukittinggi: {
    name: 'Teknisi Lapangan Bukittinggi',
    contact: '+62 811-9002-4415',
    email: 'teknisi.bukittinggi@bmkg.go.id',
  },
};

export function getTechnicianForRegion(regionId) {
  return (
    TECHNICIANS[regionId] ?? {
      name: 'Teknisi Lapangan BMKG',
      contact: '+62 811-0000-0000',
      email: 'ops@bmkg.go.id',
    }
  );
}

export function getSeriesConfig(deviceType) {
  return SERIES_CONFIG[deviceType] ?? DEFAULT_SERIES;
}

/** Build last 24 hourly points for charts */
export function buildTelemetrySeries(device, hours = 24) {
  const config = getSeriesConfig(device.type);
  const points = [];

  for (let i = hours - 1; i >= 0; i -= 1) {
    points.push({
      time: hourLabel(i),
      value: config.generator(device, hours - 1 - i),
      hoursAgo: i,
    });
  }

  return { config, points };
}

/** Rough RSSI from signal % */
export function signalToRssi(signalPercent = 0) {
  const clamped = Math.max(0, Math.min(100, Number(signalPercent) || 0));
  // Map 0–100% → -110 … -50 dBm
  return Math.round(-110 + (clamped / 100) * 60);
}
