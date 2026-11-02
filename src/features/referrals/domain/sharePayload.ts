import type { ShareOptions } from 'react-native-share';

/** Keep the PNG and the approved caption in a single native share request. */
export function invitationSharePayload(png: string, message: string): ShareOptions {
  return {
    url: `data:image/png;base64,${png}`,
    type: 'image/png',
    filename: 'mi-invitacion.png',
    message,
    title: 'Mi invitación a Tu Turno',
    failOnCancel: false,
    useInternalStorage: true,
  };
}
