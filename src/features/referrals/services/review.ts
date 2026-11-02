import * as StoreReview from 'expo-store-review';
import { Platform } from 'react-native';

/** Android waits for flow completion; StoreKit only acknowledges the request.
 * Neither platform reports whether a rating was submitted or a dialog appeared.
 */
export async function requestNativeReview(): Promise<void> {
  if (Platform.OS !== 'web' && (await StoreReview.isAvailableAsync()))
    await StoreReview.requestReview();
}
