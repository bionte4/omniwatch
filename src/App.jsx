import { useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import LiveAlertDrawer from './components/LiveAlertDrawer';
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';
import TimelinePlayback from './components/TimelinePlayback';
import DeviceTelemetryModal from './components/DeviceTelemetryModal';
import WorkOrderDrawer from './components/WorkOrderDrawer';
import useRealtimeDevices from './hooks/useRealtimeDevices';
import useSirenAlert from './hooks/useSirenAlert';
import useTimelinePlayback from './hooks/useTimelinePlayback';
import useEmergencyBroadcast from './hooks/useEmergencyBroadcast';
import useNetworkStatus from './hooks/useNetworkStatus';
import useDeviceIntegrations from './hooks/useDeviceIntegrations';
import useSlaTracker from './hooks/useSlaTracker';
import useThresholds from './hooks/useThresholds';
import useWorkOrders from './hooks/useWorkOrders';
import useEscalationPolicy from './hooks/useEscalationPolicy';
import useDataSource from './hooks/useDataSource';
import useWallDisplay from './hooks/useWallDisplay';
import usePicketHotkeys from './hooks/usePicketHotkeys';
import useDesktopNotifications from './hooks/useDesktopNotifications';
import HotkeyHelpOverlay from './components/HotkeyHelpOverlay';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { mockDevices } from './data/mockDevices';
import { DEFAULT_LAYER_VISIBILITY } from './data/mapLayers';
import {
  DEFAULT_REGION_ID,
  REGIONS,
  getRegionById,
  getRegionOptions,
  filterDevicesByRegion,
  isAllRegion,
} from './data/regions';
import { applyTimelineToDevices } from './utils/timelineHistory';
import {
  loadDeviceCacheSync,
  saveDeviceCache,
} from './utils/deviceCache';

const LOCAL_DEVICES_KEY = 'omniwatch-local-devices';
const REGIONS_KEY = 'omniwatch-regions-config';

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function Dashboard() {
  const { isDark } = useTheme();
  const { isAuthenticated, can } = useAuth();
  const [selectedType, setSelectedType] = useState('Semua');
  const [selectedId, setSelectedId] = useState(null);
  const [regionId, setRegionId] = useState(DEFAULT_REGION_ID);
  const [adminOpen, setAdminOpen] = useState(false);
  const [workOrderOpen, setWorkOrderOpen] = useState(false);
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [hotkeyHelpOpen, setHotkeyHelpOpen] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState(DEFAULT_LAYER_VISIBILITY);
  const [regions, setRegions] = useState(() => loadJson(REGIONS_KEY, REGIONS));
  const [localDevices, setLocalDevices] = useState(() =>
    loadJson(LOCAL_DEVICES_KEY, []),
  );

  const cachedSnapshot = loadDeviceCacheSync();
  const initialDevices =
    cachedSnapshot?.devices?.length > 0 ? cachedSnapshot.devices : mockDevices;

  const dataSource = useDataSource();
  const { wallMode, toggleWall, disableWall } = useWallDisplay();
  const desktopNotify = useDesktopNotifications({ enabled: isAuthenticated });

  const {
    devices: liveDevices,
    alerts,
    highlightedIds,
    lastSync,
    connectionStatus,
    clearAlerts,
  } = useRealtimeDevices(initialDevices, dataSource.activeWsUrl);

  const { muted, toggleMute, playSiren } = useSirenAlert();
  const timeline = useTimelinePlayback();
  const { online: networkOnline } = useNetworkStatus();
  const {
    channels: broadcastChannels,
    saveChannels,
    broadcastLogs,
    testBroadcast,
    processAlertBroadcasts,
    simulateChannel,
  } = useEmergencyBroadcast();
  const {
    integrations,
    activityLog: integrationLogs,
    upsertIntegration,
    removeIntegration,
    testPing,
    reconnect,
    toggleEnabled,
  } = useDeviceIntegrations();
  const { thresholds, saveAll: saveThresholds, resetDefaults: resetThresholds } =
    useThresholds();
  const {
    orders: workOrders,
    openCount: workOrderOpenCount,
    createFromAlert,
    updateOrder,
    setStatus: setWorkOrderStatus,
    assign: assignWorkOrder,
    removeOrder: removeWorkOrder,
    assignees: workOrderAssignees,
  } = useWorkOrders();
  const {
    policy: escalationPolicy,
    savePolicy: saveEscalationPolicy,
    resetPolicy: resetEscalationPolicy,
    escalationLogs,
    processAlerts: processEscalationAlerts,
  } = useEscalationPolicy({
    simulateChannel,
    onAutoWorkOrder: createFromAlert,
  });
  const seenAlertIdsRef = useRef(new Set());

  useEffect(() => {
    try {
      localStorage.setItem(REGIONS_KEY, JSON.stringify(regions));
    } catch {
      /* ignore */
    }
  }, [regions]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_DEVICES_KEY, JSON.stringify(localDevices));
    } catch {
      /* ignore */
    }
  }, [localDevices]);

  const devices = useMemo(() => {
    const map = new Map(liveDevices.map((d) => [d.id, d]));
    localDevices.forEach((d) => {
      map.set(d.id, d);
    });
    return [...map.values()];
  }, [liveDevices, localDevices]);

  // Persist latest device snapshot for offline resilience
  useEffect(() => {
    if (!devices.length) return;
    saveDeviceCache(devices, {
      connectionStatus,
      networkOnline,
      regionId,
    });
  }, [devices, connectionStatus, networkOnline, regionId]);

  const region = useMemo(
    () => getRegionById(regionId, regions),
    [regions, regionId],
  );

  const regionOptions = useMemo(() => getRegionOptions(regions), [regions]);

  /** Concrete station for admin forms when "Semua" is selected. */
  const adminRegionId = isAllRegion(regionId)
    ? DEFAULT_REGION_ID
    : regionId;

  const regionDevicesLive = useMemo(
    () => filterDevicesByRegion(devices, regionId),
    [devices, regionId],
  );

  const slaMetrics = useSlaTracker(regionDevicesLive, regionId);

  const regionDevices = useMemo(
    () =>
      applyTimelineToDevices(regionDevicesLive, timeline.selectedTime, {
        isLive: timeline.isLive,
      }),
    [regionDevicesLive, timeline.selectedTime, timeline.isLive],
  );

  const filteredDevices = useMemo(() => {
    if (selectedType === 'Semua') return regionDevices;
    return regionDevices.filter((device) => device.type === selectedType);
  }, [regionDevices, selectedType]);

  const selectedDevice = useMemo(
    () => regionDevices.find((device) => device.id === selectedId) ?? null,
    [regionDevices, selectedId],
  );

  const regionAlerts = useMemo(
    () =>
      isAllRegion(regionId)
        ? alerts
        : alerts.filter((a) => !a.region || a.region === regionId),
    [alerts, regionId],
  );

  const regionHighlightedIds = useMemo(() => {
    if (!timeline.isLive) {
      return regionDevices
        .filter((d) => d.status === 'warning' || d.status === 'offline')
        .map((d) => d.id);
    }
    return highlightedIds.filter((id) =>
      regionDevices.some((d) => d.id === id),
    );
  }, [timeline.isLive, regionDevices, highlightedIds]);

  useEffect(() => {
    if (!timeline.isLive) return;
    regionAlerts.forEach((alert) => {
      if (seenAlertIdsRef.current.has(alert.id)) return;
      seenAlertIdsRef.current.add(alert.id);
      if (alert.status === 'warning' || alert.status === 'offline') {
        playSiren(alert.status);
      }
    });

    desktopNotify.processAlerts(regionAlerts);

    if (escalationPolicy.enabled) {
      processEscalationAlerts(regionAlerts, regionDevicesLive);
    } else {
      processAlertBroadcasts(regionAlerts);
    }
  }, [
    regionAlerts,
    regionDevicesLive,
    playSiren,
    timeline.isLive,
    escalationPolicy.enabled,
    processEscalationAlerts,
    processAlertBroadcasts,
    desktopNotify.processAlerts,
  ]);

  const cycleRegion = (direction = 1) => {
    const options = getRegionOptions(regions);
    if (!options.length) return;
    const idx = options.findIndex((r) => r.id === regionId);
    const current = idx < 0 ? 0 : idx;
    const next = (current + direction + options.length) % options.length;
    setRegionId(options[next].id);
    setSelectedId(null);
    setSelectedType('Semua');
  };

  usePicketHotkeys({
    enabled: isAuthenticated,
    onToggleMute: toggleMute,
    onClearAlerts: clearAlerts,
    onCycleRegion: cycleRegion,
    onToggleWall: toggleWall,
    onExitWall: disableWall,
    onToggleHelp: () => setHotkeyHelpOpen((v) => !v),
    canMute: can('muteAlarm'),
  });

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleRegionChange = (nextId) => {
    setRegionId(nextId);
    setSelectedId(null);
    setSelectedType('Semua');
  };

  const handleSelectDevice = (device) => {
    setSelectedId(device.id);
    setTelemetryOpen(true);
  };

  const handleCloseTelemetry = () => {
    setTelemetryOpen(false);
  };

  const handleSaveRegion = (id, patch) => {
    if (!can('manageRegions')) return;
    setRegions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  };

  const handleAddDevice = (device) => {
    if (!can('manageDevices')) {
      return { ok: false, error: 'Hak akses tidak mencukupi untuk menambah perangkat.' };
    }
    if (devices.some((d) => d.id === device.id)) {
      return { ok: false, error: `ID perangkat ${device.id} sudah ada.` };
    }
    setLocalDevices((prev) => [...prev, device]);
    setRegionId(device.region);
    setSelectedId(device.id);
    return { ok: true };
  };

  const handleToggleLayer = (layerId) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  const handleCreateWorkOrder = (alert) => {
    if (!can('createWorkOrder')) return;
    createFromAlert(alert);
  };

  const handleBackupRestored = () => {
    window.setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div
      className={`flex h-screen max-h-screen w-screen flex-col overflow-hidden transition-colors duration-300 ${
        wallMode ? 'ow-wall-mode' : ''
      } ${
        isDark
          ? 'dark bg-slate-950 text-slate-200'
          : 'bg-gray-50 text-slate-800'
      }`}
    >
      <Header
        agencyLabel={region.agencyLabel}
        connectionStatus={connectionStatus}
        regions={regionOptions}
        selectedRegionId={regionId}
        onRegionChange={handleRegionChange}
        muted={muted}
        onToggleMute={toggleMute}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenWorkOrders={() => setWorkOrderOpen(true)}
        onTestBroadcast={testBroadcast}
        networkOnline={networkOnline}
        workOrderOpenCount={workOrderOpenCount}
        wallMode={wallMode}
        onToggleWall={toggleWall}
        notifyEnabled={desktopNotify.prefEnabled}
        notifyPermission={desktopNotify.permission}
        onToggleNotify={desktopNotify.togglePref}
        onRequestNotify={desktopNotify.requestPermission}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {!wallMode && (
          <Sidebar
            devices={regionDevices}
            filteredDevices={filteredDevices}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedId={selectedId}
            highlightedIds={regionHighlightedIds}
            onSelectDevice={handleSelectDevice}
            slaMetrics={slaMetrics}
            regionLabel={region?.label}
          />
        )}

        <main className="relative min-h-0 min-w-0 flex-1 overflow-hidden">
          <MapView
            devices={filteredDevices}
            selectedDevice={selectedDevice}
            highlightedIds={regionHighlightedIds}
            onSelectDevice={handleSelectDevice}
            region={region}
            timelineActive={!timeline.isLive}
            layerVisibility={layerVisibility}
            onToggleLayer={handleToggleLayer}
            wallMode={wallMode}
          />

          {!wallMode && (
            <TimelinePlayback
              offsetMinutes={timeline.offsetMinutes}
              selectedTime={timeline.selectedTime}
              isLive={timeline.isLive}
              playing={timeline.playing}
              windowStart={timeline.windowStart}
              windowEnd={timeline.windowEnd}
              stepMinutes={timeline.stepMinutes}
              maxMinutes={timeline.maxMinutes}
              onSliderChange={timeline.setOffsetMinutes}
              onTogglePlay={timeline.togglePlay}
              onJumpToLive={timeline.jumpToLive}
            />
          )}
        </main>
      </div>

      <LiveAlertDrawer
        alerts={regionAlerts}
        devices={regionDevices}
        region={region}
        lastSync={lastSync}
        onClearAlerts={clearAlerts}
        broadcastLogs={broadcastLogs}
        onCreateWorkOrder={
          can('createWorkOrder') ? handleCreateWorkOrder : undefined
        }
        workOrderOpenCount={workOrderOpenCount}
        wallMode={wallMode}
      />

      {can('openAdmin') && (
        <AdminPanel
          open={adminOpen}
          onClose={() => setAdminOpen(false)}
          regions={regions}
          selectedRegionId={adminRegionId}
          onSaveRegion={handleSaveRegion}
          onAddDevice={handleAddDevice}
          broadcastChannels={broadcastChannels}
          onSaveBroadcastChannels={saveChannels}
          integrations={integrations}
          integrationLogs={integrationLogs}
          onSaveIntegration={upsertIntegration}
          onRemoveIntegration={removeIntegration}
          onTestIntegration={testPing}
          onReconnectIntegration={reconnect}
          onToggleIntegration={toggleEnabled}
          thresholds={thresholds}
          onSaveThresholds={saveThresholds}
          onResetThresholds={resetThresholds}
          workOrders={workOrders}
          workOrderAssignees={workOrderAssignees}
          onUpdateWorkOrder={updateOrder}
          onSetWorkOrderStatus={setWorkOrderStatus}
          onAssignWorkOrder={assignWorkOrder}
          onRemoveWorkOrder={removeWorkOrder}
          escalationPolicy={escalationPolicy}
          escalationLogs={escalationLogs}
          onSaveEscalationPolicy={saveEscalationPolicy}
          onResetEscalationPolicy={resetEscalationPolicy}
          dataSourceMode={dataSource.mode}
          dataSourceGatewayUrl={dataSource.gatewayUrl}
          dataSourceActiveWsUrl={dataSource.activeWsUrl}
          connectionStatus={connectionStatus}
          onSaveDataSource={dataSource.save}
          localDevices={localDevices}
          dataSourceConfig={dataSource.config}
          onBackupRestored={handleBackupRestored}
        />
      )}

      {can('openWorkOrderPanel') && !can('openAdmin') && (
        <WorkOrderDrawer
          open={workOrderOpen}
          onClose={() => setWorkOrderOpen(false)}
          orders={workOrders}
          assignees={workOrderAssignees}
          onUpdate={updateOrder}
          onSetStatus={setWorkOrderStatus}
          onAssign={assignWorkOrder}
          onRemove={removeWorkOrder}
        />
      )}

      <DeviceTelemetryModal
        device={selectedDevice}
        open={telemetryOpen && Boolean(selectedDevice)}
        onClose={handleCloseTelemetry}
        thresholds={thresholds}
      />

      <HotkeyHelpOverlay
        open={hotkeyHelpOpen}
        onClose={() => setHotkeyHelpOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </ThemeProvider>
  );
}
