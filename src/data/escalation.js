/**
 * Escalation policy for OmniWatch alert routing (simulated channels).
 *
 * Warning → Telegram grup (cepat)
 * Offline > N menit → WhatsApp on-call
 */

export const DEFAULT_ESCALATION_POLICY = {
  enabled: true,
  warningToTelegram: true,
  offlineImmediateTelegram: true,
  offlineEscalateAfterMinutes: 2,
  offlineEscalateWhatsApp: true,
  autoCreateWorkOrderOnOffline: true,
  telegramTargetOverride: '',
  whatsappTargetOverride: '',
};

export function mergeEscalationPolicy(partial = {}) {
  return { ...DEFAULT_ESCALATION_POLICY, ...partial };
}
