# Scope
This is the isolated Tu Turno referrals handoff. Keep Home minimal and do not add
login, registration, payments, a payday screen, admin or the full Club application.
Read https://docs.expo.dev/versions/v57.0.0/ before writing Expo code.

# Product invariants
- Neutral Spanish UI only; English identifiers, comments and documentation.
- Invitar is page 0, Mis referidos page 1. Home and review completion open page 0.
- Mira cómo voy is a static sharing attachment, never a navigable screen.
- Use the bundled official medals and Tutu; preserve approved copy and spacing.
- Received SAN count is explicit profile data, independent of referrals/installments.
- Native review suppression/failure must never block invitation access.
- Fixtures are synthetic and not financial logic or a production fallback.

# Verification
After edits run `npm run format` and `npm run check`.
