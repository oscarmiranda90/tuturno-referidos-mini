export type Entry = 'home' | 'review' | 'native-review' | 'invite' | 'referrals';

/** Development-only entry points; these are not referral attribution links. */
export function entryFromUrl(url: string): Entry | null {
  try {
    const parsed = new URL(url);
    const entry = parsed.searchParams.get('entry') ?? parsed.hostname;
    if (entry === 'review')
      return parsed.searchParams.get('mode') === 'native' ? 'native-review' : 'review';
    return entry === 'home' || entry === 'invite' || entry === 'referrals' ? entry : null;
  } catch {
    return null;
  }
}
