/**
 * Alert threshold defaults per device type (BMKG ops simulation).
 */

export const DEFAULT_THRESHOLDS = {
  Seismometer: {
    metric: 'PGA',
    unit: 'gal',
    warning: 15,
    critical: 40,
    description: 'Peak Ground Acceleration',
  },
  AWS: {
    metric: 'Angin',
    unit: 'knot',
    warning: 25,
    critical: 40,
    description: 'Kecepatan angin rata-rata',
  },
  'Tide Gauge': {
    metric: 'Muka air',
    unit: 'cm',
    warning: 80,
    critical: 150,
    description: 'Anomali muka air laut',
  },
  Accelerograph: {
    metric: 'Akselerasi',
    unit: 'gal',
    warning: 20,
    critical: 50,
    description: 'Strong-motion peak',
  },
  ARG: {
    metric: 'Curah hujan',
    unit: 'mm/jam',
    warning: 20,
    critical: 50,
    description: 'Intensitas hujan jam-an',
  },
};

export function getThresholdForType(thresholds, type) {
  return thresholds?.[type] ?? DEFAULT_THRESHOLDS[type] ?? null;
}

/**
 * Evaluate a reading against warning/critical thresholds.
 * Returns 'normal' | 'warning' | 'critical'
 */
export function evaluateReading(threshold, value) {
  if (!threshold || value == null || Number.isNaN(Number(value))) {
    return 'normal';
  }
  const n = Number(value);
  if (n >= Number(threshold.critical)) return 'critical';
  if (n >= Number(threshold.warning)) return 'warning';
  return 'normal';
}
