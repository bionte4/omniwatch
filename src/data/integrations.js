export const INTEGRATION_PROTOCOLS = [
  {
    id: 'mqtt',
    label: 'MQTT Broker',
    description: 'Subscribe topik telemetri perangkat lapangan',
    defaultPort: 1883,
  },
  {
    id: 'http',
    label: 'HTTP Webhook',
    description: 'Terima push JSON dari gateway / API perangkat',
    defaultPort: 443,
  },
  {
    id: 'modbus',
    label: 'Modbus TCP Gateway',
    description: 'Polling register melalui gateway serial/IP',
    defaultPort: 502,
  },
  {
    id: 'serial',
    label: 'Serial Gateway',
    description: 'Bridge RS-232/RS-485 via agent lokal',
    defaultPort: 9000,
  },
];

export const CONNECTOR_STATUS = {
  CONNECTED: 'connected',
  DEGRADED: 'degraded',
  DISCONNECTED: 'disconnected',
  TESTING: 'testing',
};

export const DEFAULT_INTEGRATIONS = [
  {
    id: 'int-mqtt-padang',
    name: 'MQTT BMKG Padang',
    protocol: 'mqtt',
    endpoint: 'mqtt://broker.bmkg.local',
    port: 1883,
    topicOrPath: 'bmkg/padang/+/telemetry',
    username: 'omniwatch',
    password: '••••••••',
    regionId: 'padang',
    enabled: true,
    status: 'connected',
    lastSeen: new Date().toISOString(),
    latencyMs: 42,
    messagesPerMin: 18,
    errorRate: 0.4,
  },
  {
    id: 'int-http-gateway',
    name: 'HTTP Webhook Gateway',
    protocol: 'http',
    endpoint: 'https://ingest.omniwatch.local',
    port: 443,
    topicOrPath: '/api/v1/devices/ingest',
    username: 'webhook',
    password: '',
    regionId: 'padang',
    enabled: true,
    status: 'connected',
    lastSeen: new Date().toISOString(),
    latencyMs: 95,
    messagesPerMin: 7,
    errorRate: 1.2,
  },
];

export function createEmptyIntegration(regionId = 'padang') {
  return {
    id: `int-${Date.now()}`,
    name: '',
    protocol: 'mqtt',
    endpoint: '',
    port: 1883,
    topicOrPath: '',
    username: '',
    password: '',
    regionId,
    enabled: true,
    status: 'disconnected',
    lastSeen: null,
    latencyMs: 0,
    messagesPerMin: 0,
    errorRate: 0,
  };
}

export function getProtocolMeta(protocolId) {
  return (
    INTEGRATION_PROTOCOLS.find((p) => p.id === protocolId) ??
    INTEGRATION_PROTOCOLS[0]
  );
}

export function statusLabel(status) {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'degraded':
      return 'Degraded';
    case 'testing':
      return 'Testing…';
    default:
      return 'Disconnected';
  }
}
