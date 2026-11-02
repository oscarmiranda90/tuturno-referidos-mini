import data from './data.json';
import { DEFAULT_CONFIGS } from '../domain/engine';
import type { Country, ReferralState } from '../domain/types';

/** Synthetic presentation data; no payout processing or backend mutation code. */
export function createDesignState(country: Country = 'VE', empty = false): ReferralState {
  const state = structuredClone(data) as ReferralState;
  state.configs = structuredClone(DEFAULT_CONFIGS);
  state.users = state.users.map((user) => ({ ...user, country }));
  state.attributions = state.attributions.map((attribution) => ({
    ...attribution,
    config: state.configs[country],
  }));
  state.referrals = state.referrals.map((referral) => ({
    ...referral,
    attribution: { ...referral.attribution, config: state.configs[country] },
  }));
  state.rewards = state.rewards.map((reward) => ({
    ...reward,
    country,
    amount:
      reward.role === 'referrer'
        ? state.configs[country].referrerAmount
        : state.configs[country].inviteeAmount,
  }));
  if (empty) {
    state.users = [state.users[0]];
    state.referrals = [];
    state.rewards = [];
    state.notices = [];
    state.attributions = [];
  }
  return state;
}
