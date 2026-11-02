import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';
import { invitationSharePayload } from '../domain/sharePayload';

export function canShareInvitation() {
  return Platform.OS !== 'web' && !isRunningInExpoGo();
}

export async function shareInvitation(png: string, message: string) {
  if (!canShareInvitation())
    throw new Error('Native invitation sharing requires a development build');
  // Lazy import lets Expo Go preview the UI without loading a missing native module.
  const { default: Share } = await import('react-native-share');
  return Share.open(invitationSharePayload(png, message));
}
