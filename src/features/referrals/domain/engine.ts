import { referralMoney } from '../../../shared/money';
import type {
  Attribution,
  Country,
  ReferralConfig,
  ReferralState,
  ReferralSummary,
  ReferralUser,
} from './types';

export const DAY_MS = 86_400_000;
export const DEFAULT_CONFIGS: Record<Country, ReferralConfig> = {
  VE: {
    country: 'VE',
    referrerAmount: 3,
    inviteeAmount: 3,
    validityDays: 7,
    weeklyAlertThreshold: 10,
    payoutMethod: 'automatic',
    active: true,
    clubReferralPointsEnabled: false,
  },
  CO: {
    country: 'CO',
    referrerAmount: 12000,
    inviteeAmount: 12000,
    validityDays: 7,
    weeklyAlertThreshold: 10,
    payoutMethod: 'manual',
    active: true,
    clubReferralPointsEnabled: false,
  },
};
export function canInvite(
  user: Pick<ReferralUser, 'confirmedInstallments'>,
  config: ReferralConfig,
): boolean {
  return config.active && user.confirmedInstallments > 0;
}
export function daysLeft(attribution: Attribution, now: string): number {
  return Math.max(0, Math.ceil((Date.parse(attribution.expiresAt) - Date.parse(now)) / DAY_MS));
}
export function referralLink(code: string): string {
  if (code.length < 6 || code.length > 32 || /[^A-Z0-9]/.test(code))
    throw new Error('El enlace de invitación no está disponible. Intenta de nuevo.');
  return `https://tu-turno.app/i/${code}`;
}
export function whatsappMessage(user: ReferralUser, config: ReferralConfig): string {
  const amount = referralMoney(config.inviteeAmount, config.country);
  return `${user.firstName.trim()} ${user.lastName.trim()} te invita a jugar ${config.country === 'VE' ? 'San' : 'cadena'} en TuTurno. Si alguien falla, tu turno está garantizado. Entra con mi link y recibes ${amount} cuando pagues tu primera cuota. Por tiempo limitado. ${referralLink(user.referralCode)}`;
}
export function summaryFor(state: ReferralState, userId: string, now: string): ReferralSummary {
  const referrals = state.referrals
    .filter((r) => r.attribution.referrerId === userId)
    .sort((a, b) => Date.parse(a.registeredAt) - Date.parse(b.registeredAt));
  return {
    totalPaid: state.rewards
      .filter((r) => r.userId === userId && r.role === 'referrer' && r.status === 'sent')
      .reduce((sum, r) => sum + r.amount, 0),
    qualifiedFriends: referrals.filter((r) =>
      state.rewards.some((w) => w.referralId === r.id && w.role === 'referrer'),
    ).length,
    entries: referrals.map((r) => {
      const reward = state.rewards.find((w) => w.referralId === r.id && w.role === 'referrer');
      return {
        id: r.id,
        name: (() => {
          const user = state.users.find((u) => u.id === r.inviteeId);
          return user ? `${user.firstName} ${user.lastName}`.trim() : '';
        })(),
        registeredAt: r.registeredAt,
        email: state.users.find((u) => u.id === r.inviteeId)?.email,
        avatarUrl: state.users.find((u) => u.id === r.inviteeId)?.avatarUrl,
        status:
          reward?.status === 'sent'
            ? 'sent'
            : reward
              ? 'qualified'
              : daysLeft(r.attribution, now) === 0 || r.firstConfirmedAt
                ? 'expired'
                : 'registered',
        daysLeft: daysLeft(r.attribution, now),
        amount: r.attribution.config.referrerAmount,
      };
    }),
  };
}
