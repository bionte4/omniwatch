/**
 * Operational map overlays for West Sumatra (demo GeoJSON / shapes).
 * Not official BMKG hazard maps — illustrative for command-center UI.
 */

export const MAP_LAYER_DEFS = [
  {
    id: 'hazard',
    label: 'Zona rawan',
    description: 'Zona rawan tsunami / gempa (ilustrasi)',
    color: '#EF4444',
    fillOpacity: 0.18,
  },
  {
    id: 'evac',
    label: 'Jalur evakuasi',
    description: 'Koridor evakuasi menuju titik kumpul',
    color: '#F59E0B',
    fillOpacity: 0,
  },
  {
    id: 'radio',
    label: 'Coverage radio',
    description: 'Perkiraan jangkauan radio lapangan',
    color: '#0EA5E9',
    fillOpacity: 0.12,
  },
];

/** Approximate coastal hazard polygons near Padang / Mentawai */
export const HAZARD_ZONES = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Zona rawan pesisir Padang', level: 'tinggi' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [100.28, -0.88],
            [100.42, -0.88],
            [100.45, -1.02],
            [100.32, -1.05],
            [100.25, -0.98],
            [100.28, -0.88],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Zona rawan Mentawai', level: 'tinggi' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [98.85, -1.2],
            [99.25, -1.15],
            [99.3, -1.55],
            [98.9, -1.6],
            [98.85, -1.2],
          ],
        ],
      },
    },
  ],
};

export const EVACUATION_ROUTES = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Evakuasi Padang → Bukit Gado' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [100.351, -0.949],
          [100.38, -0.93],
          [100.41, -0.9],
          [100.43, -0.87],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Evakuasi Teluk Bayur → titik kumpul' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [100.365, -1.0],
          [100.39, -0.98],
          [100.42, -0.95],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Evakuasi Mentawai inland' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [99.05, -1.4],
          [99.12, -1.38],
          [99.2, -1.35],
        ],
      },
    },
  ],
};

/** Radio coverage circles: [lat, lng, radiusMeters] */
export const RADIO_COVERAGE = [
  {
    id: 'radio-padang',
    name: 'Repeater Padang',
    center: [-0.9492, 100.3543],
    radius: 18000,
  },
  {
    id: 'radio-bukittinggi',
    name: 'Repeater Bukittinggi',
    center: [-0.3056, 100.3692],
    radius: 14000,
  },
  {
    id: 'radio-mentawai',
    name: 'Repeater Mentawai',
    center: [-1.4, 99.05],
    radius: 22000,
  },
];

export const DEFAULT_LAYER_VISIBILITY = {
  hazard: true,
  evac: true,
  radio: false,
};
