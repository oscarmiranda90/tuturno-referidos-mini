/// <reference types="node" />
import assert from 'node:assert/strict';
import { reviewThenInvite } from './reviewSequence';
import { entryFromUrl } from '../../../app/entry';
import { createDesignState } from '../demo/fixtures';
import { summaryFor } from './engine';
import { referralLedger } from './ledger';
import { invitationProfile } from './invitationProfile';

async function verify() {
  for (const rejects of [false, true]) {
    const order: string[] = [];
    await reviewThenInvite(
      async () => {
        order.push('review');
        if (rejects) throw new Error('Store unavailable');
      },
      () => order.push('invite'),
    );
    assert.deepEqual(order, ['review', 'invite']);
  }
  let release!: () => void;
  let opened = false;
  const pending = reviewThenInvite(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
    () => {
      opened = true;
    },
  );
  assert.equal(opened, false);
  release();
  await pending;
  assert.equal(opened, true);
  assert.equal(entryFromUrl('exp://127.0.0.1:8083/--/?entry=review'), 'review');
  assert.equal(entryFromUrl('tuturnoreferidos://review?mode=native'), 'native-review');
  assert.equal(entryFromUrl('tuturnoreferidos://invite'), 'invite');
  assert.equal(entryFromUrl('exp://127.0.0.1:8083/--/?entry=referrals'), 'referrals');
  assert.equal(entryFromUrl('broken'), null);
  const state = createDesignState();
  const ledger = referralLedger(summaryFor(state, 'demo-referrer', '2026-11-02T12:00:00Z'));
  assert.equal(ledger.entries.length, 7);
  assert.equal(ledger.total, 15);
  assert.equal(state.users[0].collectedSanes, 7);
  assert.equal(state.users[0].clubTier, 'diamante');
  const custom = invitationProfile(state.users[0], {
    id: 'session',
    firstName: 'Ana',
    lastName: 'Pérez',
    initials: 'AP',
    collectedSanes: 2,
    club: { points: { tier: 'oro' } },
  });
  assert.equal(custom.firstName, 'Ana');
  assert.equal(custom.collectedSanes, 2);
  assert.equal(custom.clubTier, 'oro');
  console.log(
    'PASS review completion/failure/skip ordering, entry routes, reference ledger and personalized card',
  );
}
void verify();
