/** Cash referrals are independent of Club points, medals and streaks. */
export type { CountryCode as Country } from '../../../shared/country/types';
import type { CountryCode as Country } from '../../../shared/country/types';
export type RewardStatus = 'pending' | 'sent' | 'error' | 'held';
export interface ReferralConfig {
  country: Country;
  referrerAmount: number;
  inviteeAmount: number;
  weeklyAlertThreshold: number;
  payoutMethod: 'automatic' | 'manual';
  active: boolean;
  clubReferralPointsEnabled: false;
}
export interface ReferralUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  avatarUrl?: string;
  country: Country;
  identityKey: string;
  deviceKey: string;
  paymentKey: string | null;
  paymentRegisteredAt: string | null;
  confirmedInstallments: number;
  /** Confirmed SAN payouts received; never inferred from invites or installments. */
  collectedSanes: number;
  /** Profile snapshot for the sharing card; the session Club tier is the fallback. */
  clubTier?: import('../../../shared/models/types').Tier;
  sanesStarted: number;
  referralCode: string;
}
export interface Attribution {
  id: string;
  code: string;
  referrerId: string;
  openedAt: string;
  /** Frozen at link opening, including country and amounts. No expiration. */
  config: ReferralConfig;
}
export interface Referral {
  id: string;
  attribution: Attribution;
  inviteeId: string;
  registeredAt: string;
  firstConfirmedAt: string | null;
}
export interface Reward {
  id: string;
  referralId: string;
  userId: string;
  role: 'referrer' | 'invitee';
  country: Country;
  amount: number;
  createdAt: string;
  status: RewardStatus;
  sentAt: string | null;
  /** Captured by the payout provider, never inferred from a UI confirmation. */
  transactionId: string | null;
  localAmount: number | null;
  euroRate: number | null;
  error: string | null;
}
export interface ReferralNotice {
  id: string;
  userId: string;
  referralId: string;
  kind: 'registered' | 'qualified' | 'sent' | 'reminder';
  body: string;
  createdAt: string;
  destination: 'referrals' | 'choose-san';
}
export interface ReferralEvent {
  id: string;
  userId: string;
  country: Country;
  kind: 'invite-screen' | 'link-opened';
  createdAt: string;
}
export interface ReferralState {
  configs: Record<Country, ReferralConfig>;
  users: ReferralUser[];
  attributions: Attribution[];
  referrals: Referral[];
  rewards: Reward[];
  notices: ReferralNotice[];
  events: ReferralEvent[];
}
export interface ReferralSummary {
  totalPaid: number;
  qualifiedFriends: number;
  entries: Array<{
    id: string;
    name: string;
    registeredAt?: string;
    email?: string;
    avatarUrl?: string;
    status: 'registered' | 'qualified' | 'sent';
    amount: number;
  }>;
}
