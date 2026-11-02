export type Entry =
  'home' | 'review' | 'native-review' | 'invite' | 'post-review-invite' | 'referrals';

/** Development-only entry points; these are not referral attribution links. */
export function entryFromUrl(url: string): Entry | null {
  try {
    const parsed = new URL(url);
    const entry = parsed.searchParams.get('entry') ?? parsed.hostname;
    if (entry === 'review')
      return parsed.searchParams.get('mode') === 'native' ? 'native-review' : 'review';
    if (entry === 'invite' && parsed.searchParams.get('source') === 'review')
      return 'post-review-invite';
    return entry === 'home' || entry === 'invite' || entry === 'referrals' ? entry : null;
  } catch {
    return null;
  }
}

/** The entry keeps its presentation even after the store dialog is no longer visible. */
export function referralPresentation(entry: Entry): {
  mode: 'home' | 'post-review';
  initialPage: 0 | 1;
} {
  return {
    mode: entry === 'post-review-invite' ? 'post-review' : 'home',
    initialPage: entry === 'referrals' ? 1 : 0,
  };
}
