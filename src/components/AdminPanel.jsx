import { useEffect, useMemo, useState } from 'react';
import {
  MapPinned,
  Megaphone,
  Plus,
  PlugZap,
  Save,
  Settings2,
  Siren,
  SlidersHorizontal,
  ClipboardList,
  SatelliteDish,
  Archive,
  X,
} from 'lucide-react';
import { DEVICE_TYPES } from '../data/mockDevices';
import { useTheme } from '../context/ThemeContext';
import DeviceIntegrationPanel from './DeviceIntegrationPanel';
import ThresholdEditor from './ThresholdEditor';
import WorkOrderPanel from './WorkOrderPanel';
import EscalationPolicyEditor from './EscalationPolicyEditor';
import DeviceIngestWizard from './DeviceIngestWizard';
import DataSourcePanel from './DataSourcePanel';
import BackupRestorePanel from './BackupRestorePanel';
import { getAdminTabsForRole } from '../data/users';
import { useAuth } from '../context/AuthContext';

const DEVICE_TYPE_OPTIONS = DEVICE_TYPES.filter((t) => t !== 'Semua');

const TABS = [
  { id: 'integrations', label: 'Integrasi', short: 'Integrasi', icon: PlugZap },
  { id: 'datasource', label: 'Sumber Data', short: 'Gateway', icon: SatelliteDish },
  { id: 'thresholds', label: 'Threshold', short: 'Ambang', icon: SlidersHorizontal },
  { id: 'escalation', label: 'Eskalasi', short: 'Eskalasi', icon: Siren },
  { id: 'workorders', label: 'Work Order', short: 'WO', icon: ClipboardList },
  { id: 'region', label: 'Wilayah', short: 'Wilayah', icon: MapPinned },
  { id: 'devices', label: 'Perangkat', short: 'Device', icon: Plus },
  { id: 'broadcast', label: 'Broadcast', short: 'Broadcast', icon: Megaphone },
  { id: 'backup', label: 'Backup', short: 'Backup', icon: Archive },
];

export default function AdminPanel({
  open,
  onClose,
  regions,
  selectedRegionId,
  onSaveRegion,
  onAddDevice,
  broadcastChannels,
  onSaveBroadcastChannels,
  integrations = [],
  integrationLogs = [],
  onSaveIntegration,
  onRemoveIntegration,
  onTestIntegration,
  onReconnectIntegration,
  onToggleIntegration,
  thresholds,
  onSaveThresholds,
  onResetThresholds,
  workOrders = [],
  workOrderAssignees = [],
  onUpdateWorkOrder,
  onSetWorkOrderStatus,
  onAssignWorkOrder,
  onRemoveWorkOrder,
  escalationPolicy,
  escalationLogs = [],
  onSaveEscalationPolicy,
  onResetEscalationPolicy,
  dataSourceMode,
  dataSourceGatewayUrl,
  dataSourceActiveWsUrl,
  connectionStatus,
  onSaveDataSource,
  localDevices = [],
  dataSourceConfig,
  onBackupRestored,
}) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const selected = regions.find((r) => r.id === selectedRegionId) ?? regions[0];

  const visibleTabs = useMemo(
    () => TABS.filter((tab) => getAdminTabsForRole(user?.role).includes(tab.id)),
    [user?.role],
  );

  const [activeTab, setActiveTab] = useState('integrations');

  useEffect(() => {
    if (!visibleTabs.some((t) => t.id === activeTab)) {
      setActiveTab(visibleTabs[0]?.id || 'workorders');
    }
  }, [visibleTabs, activeTab]);

  const [regionForm, setRegionForm] = useState({
    label: '',
    agencyLabel: '',
    lat: '',
    lng: '',
    zoom: '',
  });

  const [deviceForm, setDeviceForm] = useState({
    id: '',
    name: '',
    type: 'Seismometer',
    region: selectedRegionId,
    lat: '',
    lng: '',
    location: '',
    status: 'normal',
  });

  const [broadcastForm, setBroadcastForm] = useState({
    telegramEnabled: true,
    telegramTarget: 'Grup Petugas Piket',
    whatsappEnabled: true,
    whatsappTarget: '+6281234567890',
    autoBroadcast: true,
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!selected) return;
    setRegionForm({
      label: selected.label,
      agencyLabel: selected.agencyLabel,
      lat: String(selected.center[0]),
      lng: String(selected.center[1]),
      zoom: String(selected.zoom),
    });
    setDeviceForm((prev) => ({ ...prev, region: selected.id }));
  }, [selected, open]);

  useEffect(() => {
    if (!broadcastChannels) return;
    setBroadcastForm({
      telegramEnabled: Boolean(broadcastChannels.telegramEnabled),
      telegramTarget: broadcastChannels.telegramTarget || '',
      whatsappEnabled: Boolean(broadcastChannels.whatsappEnabled),
      whatsappTarget: broadcastChannels.whatsappTarget || '',
      autoBroadcast: Boolean(broadcastChannels.autoBroadcast),
    });
  }, [broadcastChannels, open]);

  if (!open) return null;

  const panelClass = isDark
    ? 'border-slate-700 bg-slate-900 text-slate-100'
    : 'border-gray-200 bg-white text-slate-800';

  const inputClass = isDark
    ? 'border-slate-700 bg-slate-950 text-slate-100'
    : 'border-gray-200 bg-gray-50 text-slate-800';

  const handleSaveRegion = (event) => {
    event.preventDefault();
    const lat = Number(regionForm.lat);
    const lng = Number(regionForm.lng);
    const zoom = Number(regionForm.zoom);

    if (!regionForm.label.trim() || Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(zoom)) {
      setMessage('Lengkapi konfigurasi wilayah dengan angka koordinat yang valid.');
      return;
    }

    onSaveRegion?.(selected.id, {
      label: regionForm.label.trim(),
      agencyLabel: regionForm.agencyLabel.trim() || regionForm.label.trim(),
      center: [lat, lng],
      zoom,
    });
    setMessage('Konfigurasi wilayah berhasil disimpan.');
  };

  const handleAddDevice = (event) => {
    event.preventDefault();
    const lat = Number(deviceForm.lat);
    const lng = Number(deviceForm.lng);

    if (
      !deviceForm.id.trim() ||
      !deviceForm.name.trim() ||
      Number.isNaN(lat) ||
      Number.isNaN(lng)
    ) {
      setMessage('Lengkapi ID, nama, dan koordinat perangkat.');
      return;
    }

    const device = {
      id: deviceForm.id.trim().toUpperCase(),
      name: deviceForm.name.trim(),
      type: deviceForm.type,
      region: deviceForm.region,
      status: deviceForm.status,
      lat,
      lng,
      location: deviceForm.location.trim() || regionForm.label,
      lastUpdate: new Date().toISOString(),
      battery: 100,
      signal: 100,
      localOnly: true,
    };

    const result = onAddDevice?.(device);
    if (result?.ok === false) {
      setMessage(result.error || 'Gagal menambah perangkat.');
      return;
    }

    setDeviceForm({
      id: '',
      name: '',
      type: 'Seismometer',
      region: selectedRegionId,
      lat: '',
      lng: '',
      location: '',
      status: 'normal',
    });
    setMessage(`Perangkat ${device.id} berhasil ditambahkan.`);
  };

  const handleSaveBroadcast = (event) => {
    event.preventDefault();
    onSaveBroadcastChannels?.({
      ...broadcastForm,
      telegramTarget: broadcastForm.telegramTarget.trim(),
      whatsappTarget: broadcastForm.whatsappTarget.trim(),
    });
    setMessage('Broadcast Channel berhasil disimpan (simulasi).');
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-stretch justify-end bg-slate-950/40 backdrop-blur-[2px]">
      <button type="button" className="flex-1 cursor-default" aria-label="Tutup panel" onClick={onClose} />

      <aside
        className={`flex h-full w-full max-w-xl flex-col border-l shadow-2xl ${panelClass}`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-inherit px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Settings2 className="h-4 w-4 shrink-0 text-sky-500" />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Panel Administrator</h2>
              <p className="truncate text-[11px] text-slate-500">
                Integrasi · threshold · eskalasi · work order · wilayah
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-inherit p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav
          aria-label="Menu administrator"
          className="shrink-0 border-b border-inherit px-3 py-2"
        >
          <div className="grid grid-cols-4 gap-1">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  title={tab.label}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium transition sm:flex-row sm:gap-1 sm:px-2 sm:text-[11px] ${
                    active
                      ? 'bg-sky-600 text-white shadow-sm'
                      : isDark
                        ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        : 'text-slate-500 hover:bg-gray-100 hover:text-slate-800'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="max-w-full truncate">{tab.short}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-4 py-4">
          {message && (
            <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
              {message}
            </p>
          )}

          {activeTab === 'integrations' && (
            <DeviceIntegrationPanel
              integrations={integrations}
              regions={regions}
              activityLog={integrationLogs}
              selectedRegionId={selectedRegionId}
              onSave={onSaveIntegration}
              onRemove={onRemoveIntegration}
              onTestPing={onTestIntegration}
              onReconnect={onReconnectIntegration}
              onToggleEnabled={onToggleIntegration}
              isDark={isDark}
            />
          )}

          {activeTab === 'datasource' && (
            <DataSourcePanel
              mode={dataSourceMode}
              gatewayUrl={dataSourceGatewayUrl}
              activeWsUrl={dataSourceActiveWsUrl}
              connectionStatus={connectionStatus}
              onSave={onSaveDataSource}
              isDark={isDark}
            />
          )}

          {activeTab === 'thresholds' && (
            <ThresholdEditor
              thresholds={thresholds}
              onSave={onSaveThresholds}
              onReset={onResetThresholds}
              isDark={isDark}
            />
          )}

          {activeTab === 'escalation' && (
            <EscalationPolicyEditor
              policy={escalationPolicy}
              escalationLogs={escalationLogs}
              onSave={onSaveEscalationPolicy}
              onReset={onResetEscalationPolicy}
              isDark={isDark}
            />
          )}

          {activeTab === 'workorders' && (
            <WorkOrderPanel
              orders={workOrders}
              assignees={workOrderAssignees}
              onUpdate={onUpdateWorkOrder}
              onSetStatus={onSetWorkOrderStatus}
              onAssign={onAssignWorkOrder}
              onRemove={onRemoveWorkOrder}
              isDark={isDark}
            />
          )}

          {activeTab === 'region' && (
          <form onSubmit={handleSaveRegion} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <MapPinned className="h-3.5 w-3.5 text-sky-500" />
              Konfigurasi Wilayah
            </div>

            <Field label="Wilayah aktif">
              <input
                readOnly
                value={selected?.label || ''}
                className={`w-full rounded-lg border px-3 py-2 text-sm opacity-80 ${inputClass}`}
              />
            </Field>
            <Field label="Label stasiun">
              <input
                value={regionForm.label}
                onChange={(e) => setRegionForm((f) => ({ ...f, label: e.target.value }))}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
              />
            </Field>
            <Field label="Label instansi">
              <input
                value={regionForm.agencyLabel}
                onChange={(e) =>
                  setRegionForm((f) => ({ ...f, agencyLabel: e.target.value }))
                }
                className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
              />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Lat">
                <input
                  value={regionForm.lat}
                  onChange={(e) => setRegionForm((f) => ({ ...f, lat: e.target.value }))}
                  className={`w-full rounded-lg border px-2 py-2 text-sm ${inputClass}`}
                />
              </Field>
              <Field label="Lng">
                <input
                  value={regionForm.lng}
                  onChange={(e) => setRegionForm((f) => ({ ...f, lng: e.target.value }))}
                  className={`w-full rounded-lg border px-2 py-2 text-sm ${inputClass}`}
                />
              </Field>
              <Field label="Zoom">
                <input
                  value={regionForm.zoom}
                  onChange={(e) => setRegionForm((f) => ({ ...f, zoom: e.target.value }))}
                  className={`w-full rounded-lg border px-2 py-2 text-sm ${inputClass}`}
                />
              </Field>
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500"
            >
              <Save className="h-4 w-4" />
              Simpan Konfigurasi Wilayah
            </button>
          </form>
          )}

          {activeTab === 'devices' && (
          <div className="space-y-5">
          <DeviceIngestWizard
            regions={regions}
            selectedRegionId={selectedRegionId}
            onAddDevice={onAddDevice}
            isDark={isDark}
          />
          <form onSubmit={handleAddDevice} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Plus className="h-3.5 w-3.5 text-emerald-500" />
              Tambah Perangkat Baru
            </div>

            <Field label="ID perangkat">
              <input
                value={deviceForm.id}
                onChange={(e) => setDeviceForm((f) => ({ ...f, id: e.target.value }))}
                placeholder="SM-PDG-99"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
              />
            </Field>
            <Field label="Nama perangkat">
              <input
                value={deviceForm.name}
                onChange={(e) => setDeviceForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Seismometer Baru"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Jenis">
                <select
                  value={deviceForm.type}
                  onChange={(e) => setDeviceForm((f) => ({ ...f, type: e.target.value }))}
                  className={`w-full rounded-lg border px-2 py-2 text-sm ${inputClass}`}
                >
                  {DEVICE_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Wilayah">
                <select
                  value={deviceForm.region}
                  onChange={(e) => setDeviceForm((f) => ({ ...f, region: e.target.value }))}
                  className={`w-full rounded-lg border px-2 py-2 text-sm ${inputClass}`}
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Latitude">
                <input
                  value={deviceForm.lat}
                  onChange={(e) => setDeviceForm((f) => ({ ...f, lat: e.target.value }))}
                  className={`w-full rounded-lg border px-2 py-2 text-sm ${inputClass}`}
                />
              </Field>
              <Field label="Longitude">
                <input
                  value={deviceForm.lng}
                  onChange={(e) => setDeviceForm((f) => ({ ...f, lng: e.target.value }))}
                  className={`w-full rounded-lg border px-2 py-2 text-sm ${inputClass}`}
                />
              </Field>
            </div>
            <Field label="Lokasi deskripsi">
              <input
                value={deviceForm.location}
                onChange={(e) => setDeviceForm((f) => ({ ...f, location: e.target.value }))}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
              />
            </Field>
            <Field label="Status awal">
              <select
                value={deviceForm.status}
                onChange={(e) => setDeviceForm((f) => ({ ...f, status: e.target.value }))}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
              >
                <option value="normal">Normal</option>
                <option value="warning">Warning</option>
                <option value="offline">Offline</option>
              </select>
            </Field>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" />
              Tambah Perangkat
            </button>
          </form>
          </div>
          )}

          {activeTab === 'broadcast' && (
          <form
            onSubmit={handleSaveBroadcast}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Megaphone className="h-3.5 w-3.5 text-rose-500" />
              Broadcast Channel
            </div>
            <p className="text-[11px] text-slate-500">
              Daftarkan tujuan notifikasi darurat (simulasi Telegram / WhatsApp).
            </p>

            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={broadcastForm.autoBroadcast}
                onChange={(e) =>
                  setBroadcastForm((f) => ({ ...f, autoBroadcast: e.target.checked }))
                }
              />
              Auto-broadcast saat Offline / anomali kritis
            </label>

            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={broadcastForm.telegramEnabled}
                onChange={(e) =>
                  setBroadcastForm((f) => ({ ...f, telegramEnabled: e.target.checked }))
                }
              />
              Aktifkan Bot Telegram
            </label>
            <Field label="Target Telegram (grup / chat)">
              <input
                value={broadcastForm.telegramTarget}
                onChange={(e) =>
                  setBroadcastForm((f) => ({ ...f, telegramTarget: e.target.value }))
                }
                placeholder="Grup Petugas Piket"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
              />
            </Field>

            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={broadcastForm.whatsappEnabled}
                onChange={(e) =>
                  setBroadcastForm((f) => ({ ...f, whatsappEnabled: e.target.checked }))
                }
              />
              Aktifkan WhatsApp
            </label>
            <Field label="Nomor WhatsApp tujuan">
              <input
                value={broadcastForm.whatsappTarget}
                onChange={(e) =>
                  setBroadcastForm((f) => ({ ...f, whatsappTarget: e.target.value }))
                }
                placeholder="+62812xxxxxxxx"
                className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
              />
            </Field>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500"
            >
              <Save className="h-4 w-4" />
              Simpan Broadcast Channel
            </button>
          </form>
          )}

          {activeTab === 'backup' && (
            <BackupRestorePanel
              regions={regions}
              thresholds={thresholds}
              integrations={integrations}
              escalationPolicy={escalationPolicy}
              broadcastChannels={broadcastChannels}
              dataSourceConfig={dataSourceConfig}
              localDevices={localDevices}
              workOrders={workOrders}
              onRestored={onBackupRestored}
              isDark={isDark}
            />
          )}
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}
