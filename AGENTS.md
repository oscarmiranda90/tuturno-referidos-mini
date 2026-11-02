# Scope
This is the isolated Tu Turno referrals handoff. Keep Home minimal and do not add
login, registration, payments, a payday screen, admin or the full Club application.
Read https://docs.expo.dev/versions/v57.0.0/ before writing Expo code.

# Product invariants
- Neutral Spanish UI only; English identifiers, comments and documentation.
- Home entry: keep Invitar at index 0 and Mis referidos at index 1, with chips, dots and swiping. Open index 1 when there is any invitee (paid or pending); otherwise index 0.
- Post-review entry: the same invitation content alone, without chips, dots or a pager.
- Preserve entry mode until the flow closes. Review skip/unavailable/error also use invite-only mode.
- Shared design, assets and sharing logic stay in one InvitePage implementation.
- Mira cómo voy is a static sharing attachment. Its step-2 thumbnail opens an optional full-screen static preview with an X; closing returns to Invitar. It is never a required sharing step.
- Share PNG plus the approved caption and referral link in a single native request on Android and iOS. Use react-native-share in a development build; never substitute clipboard pasting or an image-only send.
- Links, pending invitees and rewards never expire. Do not reintroduce deadlines, countdowns or expiration fields/statuses.
- Support the three pieces in light and dark. Dark sharing card: blue background, white wordmark, white Tutu bubble and bottom panel. Keep official assets.
- Colombia uses cadena for one and cadenas from two; amounts and approved captions come from country configuration.
- Use the bundled official medals and Tutu; preserve approved copy and spacing.
- Received SAN count is explicit profile data, independent of referrals/installments.
- Native review suppression/failure must never block invitation access.
- Fixtures are synthetic and not financial logic or a production fallback.

# Verification
After edits run `npm run format` and `npm run check`.
