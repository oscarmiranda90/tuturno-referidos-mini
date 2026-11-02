import type { ReferralSummary } from './types';

/** The customer ledger tracks the friend's first payment, independently of payout processing. */
export function referralLedger(summary: ReferralSummary) {
  const entries = summary.entries.map((entry) => ({
    ...entry,
    paid: entry.status === 'qualified' || entry.status === 'sent',
  }));
  return {
    entries,
    total: entries.reduce((amount, entry) => amount + (entry.paid ? entry.amount : 0), 0),
  };
}
