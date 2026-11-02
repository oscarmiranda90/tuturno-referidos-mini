# Tu Turno · Referrals mini app

Standalone Expo SDK 57 reference package for the Maracay team. It contains only
the referral UI, a minimal Home, the review entry, and the assets/supporting code
needed to reproduce the approved screens. It has its own Git history and does
not require the full Tu Turno repository, an account, API credentials or a backend.

## What to run

Requirements: Node.js **22.13 or newer**, npm, and **Expo Go compatible with SDK 57**.
The latest Expo Go in a store may target a different SDK: install the matching
client from [Expo Go downloads](https://expo.dev/go?sdkVersion=57).

```sh
npm ci
npm run check
npm start
```

Scan the QR code on a physical phone on the same network, or press `a` for a
booted Android emulator and `i` for an iOS simulator on macOS with Xcode.

```sh
npm run android
npm run ios
```

These scripts use Expo Go; they do not require generating native projects.
For an isolated Metro instance alongside the full application:

```sh
npm start -- --port 8083
```

All demo screens use light appearance. Outfit fonts, transparent animated Tutu
artwork, static Tutu poster, official Club medals and brand imagery are bundled.
Native PNG generation/sharing should be checked on Android/iOS; the web fallback
shares text and the link instead of an image attachment.

## The two entry flows

| Entry | Current sequence | Return |
| --- | --- | --- |
| Home | Empty Home → **Invitar** button → **Invitar** / **Mis referidos** | Close/back returns to Home |
| Review requested by the host app | Review interaction → **Invitar** / **Mis referidos** | Close/back returns to Home |

**Invitar is always the first tab; Mis referidos is the second.** The chips at
the top, dots above the WhatsApp button and horizontal swipe drive the same pager.
Opening from Home bypasses review entirely, including when referrals already exist.

### 1. Entry from Home

The default launch displays an intentionally empty white Home with one **Invitar**
button. This is a host shell, not a copy of the production Home. Tap the button
to enter the approved invitation/referral screens.

### 2. Entry from a review request

**The current Tu Turno application has no payday / received-payout screen.**
This package therefore starts this entry **at the review request**, without a
payout celebration, receipt, money transfer or payment confirmation screen.

For a deterministic demo, start Metro with:

```sh
npm run start:review
# Optional separate port:
npm run start:review -- --port 8083
```

Alternatively, open a running project using the development entry URL:

```text
exp://<metro-host>:8083/--/?entry=review
```

The demo review shows **Simulación de reseña**. Choose stars and tap **Simular envío de reseña**, or tap **Omitir reseña**. Both continue to **Invitar**, regardless
of the selected rating. This screen is explicitly a simulation and does not
publish any rating to a store. There is no extra review button on Home.

To exercise the actual native store request:

```text
exp://<metro-host>:8083/--/?entry=review&mode=native
```

The interactive demo also has **Intentar reseña nativa**. `expo-store-review`
checks availability before making the request. The store may suppress its dialog
because of quotas, environment or user history. Unsupported and failed requests
still continue to the invitation; no rating or positive review is required.
Neither platform reports that a rating was submitted. Android can report flow
completion; iOS StoreKit only acknowledges the request, so it cannot guarantee
that the invitation waits until a visible review dialog closes.

In the future, when Tu Turno adds its payday / received-payout screen, that screen
can trigger this same review entry:

```text
Future: received payout → review request → Invitar → Mis referidos
Today:                   review request → Invitar → Mis referidos
```

Do not add a fake received-payout prerequisite to the current integration.

### Android emulator shortcuts

With Metro on port 8083 and one emulator booted:

```sh
adb reverse tcp:8083 tcp:8083
adb shell 'am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8083/--/?entry=home" host.exp.exponent'
adb shell 'am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8083/--/?entry=review" host.exp.exponent'
adb shell 'am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8083/--/?entry=review&mode=native" host.exp.exponent'
```

Other capture shortcuts: `?entry=invite` and `?entry=referrals`. In a development
build the registered scheme also accepts `tuturnoreferidos://review`,
`tuturnoreferidos://review?mode=native`, `tuturnoreferidos://invite` and
`tuturnoreferidos://home`. Expo Go uses the `exp://` project URLs above.

## “Mira cómo voy” is an attachment, not an app screen

The card has **no route, full-screen preview, modal or animation**. The small
phone image in step two is an instructional illustration, not a navigation button.

When sharing, the app captures the static 9:16 template as a **1080 × 1920 PNG**
and supplies it to the native share action together with the invitation message
and referral link. The user chooses WhatsApp and recipients. Nothing is sent
silently. Every share captures the current profile; it does not reuse another
user's saved card.

The card reads the user's full name, **confirmed SAN payouts received** and stored
Club tier. “Ya cobré · 7 · San” is a received-payout counter: it is neither invited
friends, paid installments nor a Club streak. The official medal follows the
profile's tier. Tutu in this image uses a static PNG poster; the in-app mascot
and confetti remain animated and honor reduced motion.

- **iOS:** `Share.share` receives the PNG file URL and text/link.
- **Android:** `expo-sharing` shares the PNG; text/link are copied for the user to
  paste as a WhatsApp caption. This path does **not** automatically attach a
  caption together with the image. If production requires a single combined
  image+caption intent, implement that native transport in a development build.
- **Copy link:** copies the referral URL only, without generating/sending a PNG.

The app does not claim delivery merely because a share sheet opened. Verify
actual image/caption/link behavior with WhatsApp installed on a physical phone.
The referral URL is an illustrative Tu Turno URL; this package does not host its
landing page, attribution resolver or registration flow.

## Demo data and production integration

The reproducible sample is **Pedro Pérez**, **7** received SAN payouts,
**Diamante**, seven referred friends, five paid first installments, two
**Pendiente** entries and a **15$** earned total. All identities/payment details
are synthetic. No bank payout occurs and no financial operation is implemented.

1. Supply the current session profile to `ReferralsScreen` (`user` prop):
   `firstName`, `lastName`, `collectedSanes`, `club.points.tier` and identity fields.
   `invitationProfile` ensures session values override the sample profile.
2. Replace the synthetic `ReferralProvider` and `demo/data.json` with the host's
   authenticated data source. Replace the hard-coded demo user lookup inside
   the provider/UI when wiring the real account. Do not ship the sample code or
   ledger as a production fallback.
3. Supply referral code, country configuration, reward amounts, eligibility and
   first-payment summary from the existing backend. `ReferralsService.getSummary`
   documents the optional ledger read contract. The backend owns attribution,
   fraud controls, payment qualification and reward dispatch.
4. Call `reviewThenInvite(requestNativeReview, openInvitation)` from the existing
   review trigger. Home calls `openInvitation` directly. Preserve the app's
   existing deduplication/frequency policy; this isolated UI demo intentionally
   allows repeated manual tests.
5. Preserve the approved wording and illustrations; connect data without
   inventing customer-facing reward statuses. The ledger shows paid vs
   **Pendiente**; its total sums earned first-payment rewards, not bank dispatches.

No original Expo account, EAS project ID, update URL or Git remote is carried
over. Native app IDs and the URL scheme identify this standalone demo. There are
no environment secrets to configure. Publication of a production build is outside
this package's scope.

## File map

```text
App.tsx                              Providers + light appearance
src/app/MiniApp.tsx                  Home/review/referral entry coordination
src/app/entry.ts                     Development entry URL parsing
src/features/home/screens/           Empty Home, one invite button
src/features/referrals/screens/      Approved pager + review simulation
src/features/referrals/components/   Invitation, ledger, static card, motion, controls
src/features/referrals/domain/       Read-only UI helpers, profile projection, review sequence
src/features/referrals/demo/         Synthetic reference fixtures
src/features/referrals/services/     Native review + optional ledger read contract
src/features/referrals/state/        Demo provider boundary
src/features/club/components/        Official static medal renderer only
src/shared/                         Minimal profile, typography, theme, money, Tutu/UI
assets/                             Only referenced brand, mascot and medal files
```

There is no login, registration, full production Home, Club screen, payment
checkout, payout-day screen, admin panel, backend or full-app Git history.

## Verification and acceptance

```sh
npm run format
npm run check
```

`check` runs TypeScript, import/asset reachability and cycles, formatting, neutral
Spanish UI guard, and focused tests covering review success/failure/wait ordering,
entry routes, the reference ledger and personalized card fields.

Before integrating into Tu Turno, check both entry flows on Android and iOS,
chips/dots/swiping, reduced motion, all four medal tiers, long names, PNG contents,
clipboard, unavailable native review, and actual WhatsApp recipient delivery.
Do not treat a simulated review as a submitted store rating or a shared image as
a confirmed referral/payment.
