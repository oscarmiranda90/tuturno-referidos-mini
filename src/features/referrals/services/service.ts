import type { ReferralSummary } from '../domain/types';

/** Replace demo data with the host application's authenticated transport. */
export interface ReferralsService {
  getSummary(): Promise<ReferralSummary>;
}
