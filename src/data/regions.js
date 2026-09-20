/**
 * Multi-region station configurations for OmniWatch.
 * Each region owns map center/zoom and a device inventory subset.
 */

export const ALL_REGION_ID = 'all';

export const ALL_REGION = {
  id: ALL_REGION_ID,
  label: 'Semua Stasiun',
  agencyLabel: 'BMKG Sumatera Barat — Semua Stasiun',
  center: [-0.85, 100.05],
  zoom: 8,
};

export const REGIONS = [
  {
    id: 'padang',
    label: 'Stasiun Padang',
    agencyLabel: 'BMKG Stasiun Geofisika Padang',
    center: [-0.9492, 100.3543],
    zoom: 11,
  },
  {
    id: 'mentawai',
    label: 'Stasiun Mentawai',
    agencyLabel: 'BMKG Stasiun Geofisika Mentawai',
    center: [-1.4, 99.05],
    zoom: 9,
  },
  {
    id: 'bukittinggi',
    label: 'Stasiun Bukittinggi',
    agencyLabel: 'BMKG Stasiun Geofisika Bukittinggi',
    center: [-0.3056, 100.3692],
    zoom: 12,
  },
];

export const DEFAULT_REGION_ID = 'padang';

/** Options for region switcher including "Semua Stasiun". */
export function getRegionOptions(regions = REGIONS) {
  return [ALL_REGION, ...regions];
}

export function isAllRegion(regionId) {
  return regionId === ALL_REGION_ID;
}

export function getRegionById(regionId, regions = REGIONS) {
  if (isAllRegion(regionId)) return ALL_REGION;
  return regions.find((r) => r.id === regionId) ?? regions[0] ?? ALL_REGION;
}

export function filterDevicesByRegion(devices, regionId) {
  if (isAllRegion(regionId)) return devices;
  return devices.filter((d) => d.region === regionId);
}
