import type { User } from '../../../shared/models/types';
import type { ReferralUser } from './types';

/** Session identity and received payouts override the referral scenario's sample profile. */
export function invitationProfile(referral: ReferralUser, session: User): ReferralUser {
  return {
    ...referral,
    firstName: session.firstName,
    lastName: session.lastName,
    collectedSanes: session.collectedSanes,
    clubTier: session.club.points.tier,
  };
}
