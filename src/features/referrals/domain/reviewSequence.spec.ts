/// <reference types="node" />
import assert from 'node:assert/strict';
import { reviewThenInvite } from './reviewSequence';
import {
  demoOptionsFromUrl,
  entryFromUrl,
  referralPresentation,
  type Entry,
} from '../../../app/entry';
import { createDesignState } from '../demo/fixtures';
import { summaryFor, whatsappMessage } from './engine';
import { cardBenefit } from './cardBenefit';
import { invitationSharePayload } from './sharePayload';
import { darkTheme, lightTheme } from '../../../shared/theme/colors';
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
  assert.deepEqual(referralPresentation('invite'), { mode: 'home', initialPage: 0 });
  assert.deepEqual(referralPresentation('referrals'), { mode: 'home', initialPage: 1 });
  assert.deepEqual(referralPresentation('invite', true), { mode: 'home', initialPage: 1 });
  assert.deepEqual(referralPresentation('post-review-invite', true), {
    mode: 'post-review',
    initialPage: 0,
  });
  assert.deepEqual(
    demoOptionsFromUrl('tuturnoreferidos://home?appearance=dark&country=CO&empty=1'),
    {
      appearance: 'dark',
      country: 'CO',
      empty: true,
    },
  );
  assert.equal(
    entryFromUrl('exp://127.0.0.1:8083/--/?entry=invite&source=review'),
    'post-review-invite',
  );
  for (const fails of [false, true]) {
    let next: Entry = 'review';
    await reviewThenInvite(
      async () => {
        if (fails) throw new Error('Store refused');
      },
      () => {
        next = 'post-review-invite';
      },
    );
    assert.deepEqual(referralPresentation(next), { mode: 'post-review', initialPage: 0 });
  }

  const state = createDesignState();
  const summary = summaryFor(state, 'demo-referrer');
  const ledger = referralLedger(summary);
  assert.equal(ledger.entries.length, 7);
  assert.equal(ledger.total, 15);
  assert.equal(state.users[0].collectedSanes, 7);
  assert.equal(state.users[0].clubTier, 'diamante');
  // Pending friends remain eligible even when their invitation is years old.
  const oldPending = state.referrals.find((entry) => !entry.firstConfirmedAt)!;
  oldPending.attribution.openedAt = '2000-01-01T00:00:00Z';
  assert.equal(
    summaryFor(state, 'demo-referrer').entries.find((entry) => entry.id === oldPending.id)!.status,
    'registered',
  );
  assert.equal(summary.entries.filter((entry) => entry.status === 'registered').length, 2);
  const noRewards = { ...state, rewards: [] };
  assert.equal(referralLedger(summaryFor(noRewards, 'demo-referrer')).total, 15);
  const onePending = { ...state, referrals: [oldPending] };
  assert.equal(
    referralPresentation('invite', summaryFor(onePending, 'demo-referrer').entries.length > 0)
      .initialPage,
    1,
  );
  assert.equal(
    referralPresentation('invite', createDesignState('VE', true).referrals.length > 0).initialPage,
    0,
  );
  const message = whatsappMessage(state.users[0], state.configs.VE);
  assert.equal(
    message,
    'Entra hoy, gana tus 3$ y arranca con el próximo San. Después invitas tú y ganas 3$ por cada amigo. https://tu-turno.app/i/NUYUQP',
  );
  assert.equal(
    whatsappMessage(state.users[0], state.configs.CO),
    'Entra hoy, gana tus 12.000 pesos y arranca con la próxima cadena. Después invitas tú y ganas 12.000 pesos por cada amigo. https://tu-turno.app/i/NUYUQP',
  );
  const changedConfig = { ...state.configs.CO, inviteeAmount: 20000, referrerAmount: 18000 };
  assert.match(whatsappMessage(state.users[0], changedConfig), /20\.000 pesos.*18\.000 pesos/);
  const share = invitationSharePayload('aGVsbG8=', message);
  assert.equal(share.message, message);
  assert.equal(share.url, 'data:image/png;base64,aGVsbG8=');
  assert.equal(share.type, 'image/png');
  assert.equal(share.failOnCancel, false);
  assert.equal(share.useInternalStorage, true);
  for (const [tier, text] of [
    ['bronce', 'Juego 1 cadena a la vez'],
    ['plata', 'Juego 2 cadenas a la vez'],
    ['oro', 'Juego 3 cadenas a la vez'],
    ['diamante', 'Juego 4 cadenas a la vez y 1 gratis'],
  ] as const)
    assert.equal(cardBenefit(tier, 'CO'), text);
  assert.equal(cardBenefit('diamante', 'VE'), 'Juego 4 San a la vez y 1 gratis');
  assert.equal(darkTheme.referral.cardPanel, '#FFFFFF');
  assert.equal(darkTheme.referral.cardBrandInk, '#FFFFFF');
  assert.equal(darkTheme.referral.cardCanvas, '#0023D1');
  assert.equal(lightTheme.referral.cardCanvas, '#FFFFFF');
  assert.equal(lightTheme.referral.cardPanel, '#0023D1');
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
    'PASS review ordering, conditional entry, non-expiring pending friends, approved captions, combined share payload, country grammar, themes and personalized card',
  );
}
void verify();
