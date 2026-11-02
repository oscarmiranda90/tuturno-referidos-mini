/** A store refusal, unavailable dialog or skipped review must not block referrals. */
export async function reviewThenInvite(
  requestReview: () => Promise<void>,
  showInvite: () => void,
): Promise<void> {
  try {
    await requestReview();
  } catch {
    // Store APIs do not expose whether the user submitted a rating.
  } finally {
    showInvite();
  }
}
