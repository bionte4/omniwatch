import { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { Battery, MapPin, Signal, Waves } from 'lucide-react';
import {
  PADANG_CENTER,
  STATUS_META,
  formatLastUpdate,
} from '../data/mockDevices';
import { useTheme } from '../context/ThemeContext';
import { DeviceTypeIcon, getDeviceTint } from './DeviceTypeIcon';
import StatusBadge from './StatusBadge';

const TILE_LAYERS = {
  light: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Sumber: Esri, TomTom, Garmin, FAO, NOAA, USGS',
  },
  dark: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Sumber: Esri, TomTom, Garmin, FAO, NOAA, USGS',
  },
};

function createStatusIcon(status, highlighted = false, isDark = false) {
  const meta = STATUS_META[status] ?? STATUS_META.offline;
  const color = meta.color;
  const size = highlighted ? 36 : 28;
  const core = highlighted ? 16 : 14;
  const border = isDark ? '#0f172a' : '#ffffff';
  const pulseClass =
    highlighted && (status === 'warning' || status === 'offline')
      ? status === 'offline'
        ? 'marker-pulse-offline'
        : 'marker-pulse-warning'
      : 'marker-pulse-idle';

  return L.divIcon({
    className: 'device-marker',
    html: `
      <div class="${pulseClass}" style="position:relative;width:${size}px;height:${size}px;">
        <span style="
          position:absolute;inset:0;border-radius:9999px;
          background:${color}40;
        " class="marker-ring"></span>
        <span style="
          position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
          width:${core}px;height:${core}px;border-radius:9999px;
          background:${color};border:2px solid ${border};
          box-shadow:0 0 0 2px ${color}88, 0 4px 14px rgba(0,0,0,.35);
        "></span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -12],
  });
}

function MapFocus({ device }) {
  const map = useMap();

  useEffect(() => {
    if (!device) return;
    map.flyTo([device.lat, device.lng], 12, { duration: 0.85 });
  }, [device, map]);

  return null;
}

function MapRegionView({ region }) {
  const map = useMap();

  useEffect(() => {
    if (!region?.center) return;
    map.setView(region.center, region.zoom ?? 10, { animate: true });
  }, [region, map]);

  return null;
}

function MapFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gray-100 text-center dark:bg-slate-950">
      <MapPin className="h-10 w-10 text-slate-400 dark:text-slate-600" />
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Peta tidak dapat dimuat
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Periksa koneksi jaringan atau coba muat ulang halaman.
        </p>
      </div>
    </div>
  );
}

export default function MapView({
  devices,
  selectedDevice,
  highlightedIds = [],
  onSelectDevice,
  region,
  timelineActive = false,
}) {
  const { isDark, theme } = useTheme();
  const tile = TILE_LAYERS[theme] ?? TILE_LAYERS.light;
  const mapCenter = region?.center ?? PADANG_CENTER;
  const mapZoom = region?.zoom ?? 10;

  const icons = useMemo(() => {
    const base = {
      normal: createStatusIcon('normal', false, isDark),
      warning: createStatusIcon('warning', false, isDark),
      offline: createStatusIcon('offline', false, isDark),
    };
    const highlighted = {
      warning: createStatusIcon('warning', true, isDark),
      offline: createStatusIcon('offline', true, isDark),
    };
    return { base, highlighted };
  }, [isDark]);

  if (!devices) {
    return <MapFallback />;
  }

  return (
    <div className="relative h-full w-full min-h-0 overflow-hidden bg-gray-100 transition-colors duration-300 dark:bg-slate-950">
      <div className="pointer-events-none absolute left-3 top-3 z-[1000] rounded-xl border border-gray-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-xl">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Wilayah Pantauan
        </p>
        <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-slate-100">
          <Waves className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" />
          {region?.label ?? 'Padang & Sumatera Barat'}
        </p>
        {timelineActive && (
          <p className="mt-1 text-[10px] font-medium text-violet-600 dark:text-violet-300">
            Mode riwayat timeline aktif
          </p>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-24 right-3 z-[1000] rounded-xl border border-gray-200 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-xl">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Legenda Status
        </p>
        <ul className="space-y-1.5">
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <li
              key={key}
              className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: meta.color, color: meta.color }}
              />
              {meta.label}
            </li>
          ))}
        </ul>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full"
        zoomControl
        scrollWheelZoom
      >
        <TileLayer
          key={theme}
          attribution={tile.attribution}
          url={tile.url}
          maxZoom={16}
        />

        <MapRegionView region={region} />
        <MapFocus device={selectedDevice} />

        {devices.map((device) => {
          const isHighlighted =
            highlightedIds.includes(device.id) &&
            (device.status === 'warning' || device.status === 'offline');
          const icon = isHighlighted
            ? icons.highlighted[device.status]
            : icons.base[device.status] ?? icons.base.offline;
          const tint = getDeviceTint(device.type);

          return (
            <Marker
              key={`${device.id}-${device.status}-${isHighlighted ? 'h' : 'n'}-${theme}`}
              position={[device.lat, device.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectDevice?.(device),
              }}
            >
              <Popup className="ow-leaflet-popup">
                <div className="ow-popup">
                  <div className="ow-popup__header">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${tint}`}
                      >
                        <DeviceTypeIcon type={device.type} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="ow-popup__title">{device.name}</p>
                        <p className="ow-popup__meta">
                          {device.id} · {device.type}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={device.status} size="xs" />
                  </div>

                  <div className="ow-popup__body">
                    <div className="ow-popup__row">
                      <span className="ow-popup__label">Lokasi</span>
                      <span className="ow-popup__value">{device.location}</span>
                    </div>
                    <div className="ow-popup__row">
                      <span className="ow-popup__label">Koordinat</span>
                      <span className="ow-popup__value">
                        {device.lat.toFixed(4)}, {device.lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="ow-popup__row">
                      <span className="ow-popup__label">Update</span>
                      <span className="ow-popup__value">
                        {formatLastUpdate(device.lastUpdate)}
                      </span>
                    </div>
                    <div className="ow-popup__row">
                      <span className="ow-popup__label">Telemetri</span>
                      <span className="ow-popup__value inline-flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <Battery className="h-3 w-3 text-slate-400" />
                          {device.battery}%
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Signal className="h-3 w-3 text-slate-400" />
                          {device.signal}%
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
