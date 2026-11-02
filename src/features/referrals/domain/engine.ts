import { referralMoney } from '../../../shared/money';
import type {
  Country,
  ReferralConfig,
  ReferralState,
  ReferralSummary,
  ReferralUser,
} from './types';

export const DEFAULT_CONFIGS: Record<Country, ReferralConfig> = {
  VE: {
    country: 'VE',
    referrerAmount: 3,
    inviteeAmount: 3,
    weeklyAlertThreshold: 10,
    payoutMethod: 'automatic',
    active: true,
    clubReferralPointsEnabled: false,
  },
  CO: {
    country: 'CO',
    referrerAmount: 12000,
    inviteeAmount: 12000,
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
export function referralLink(code: string): string {
  if (code.length < 6 || code.length > 32 || /[^A-Z0-9]/.test(code))
    throw new Error('El enlace de invitación no está disponible. Intenta de nuevo.');
  return `https://tu-turno.app/i/${code}`;
}
export function whatsappMessage(user: ReferralUser, config: ReferralConfig): string {
  const friendAmount = referralMoney(config.inviteeAmount, config.country);
  const amount = referralMoney(config.referrerAmount, config.country);
  return `Entra hoy, gana tus ${friendAmount} y arranca con ${config.country === 'VE' ? 'el próximo San' : 'la próxima cadena'}. Después invitas tú y ganas ${amount} por cada amigo. ${referralLink(user.referralCode)}`;
}
export function summaryFor(state: ReferralState, userId: string): ReferralSummary {
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
          reward?.status === 'sent' ? 'sent' : r.firstConfirmedAt ? 'qualified' : 'registered',
        amount: r.attribution.config.referrerAmount,
      };
    }),
  };
}
