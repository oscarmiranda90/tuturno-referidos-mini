import Svg, { Circle, Path } from 'react-native-svg';

export function ReferralIcon({
  name,
  color,
  size = 24,
}: {
  name:
    | 'back'
    | 'close'
    | 'clock'
    | 'check'
    | 'gift'
    | 'copy'
    | 'arrow'
    | 'share'
    | 'zoom'
    | 'currency';
  color: string;
  size?: number;
}) {
  const paths = {
    currency: 'M16 7c-1-3-9-3-9 1 0 4 10 3 10 7 0 5-9 5-11 1M12 2v20',
    zoom: 'M15 15l6 6M10 3a7 7 0 100 14 7 7 0 000-14M7 10h6M10 7v6',
    share:
      'M8 12l8-5M8 12l8 5M7 9a3 3 0 100 6 3 3 0 000-6M18 3a3 3 0 100 6 3 3 0 000-6M18 15a3 3 0 100 6 3 3 0 000-6',
    back: 'M15 6l-6 6 6 6',
    close: 'M6 6l12 12M18 6L6 18',
    clock: 'M12 7v5l3 2',
    check: 'M5 12l4 4L19 6',
    gift: 'M4 9h16v4H4zM6 13v8h12v-8M12 9v12M12 9C3 9 6 1 9 4l3 5zm0 0c9 0 6-8 3-5l-3 5z',
    copy: 'M8 8h12v13H8zM16 8V3H3v13h5',
    arrow: 'M5 12h14m-6-6l6 6-6 6',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'clock' && <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />}
      <Path
        d={paths[name]}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
/** WhatsApp brand glyph; keep its proportions and its clear space. */
export function WhatsAppIcon({ color = '#FFFFFF', size = 25 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M20.52 3.48A11.91 11.91 0 0012.04 0C5.45 0 .08 5.36.08 11.95c0 2.1.55 4.16 1.6 5.97L0 24l6.25-1.64a11.93 11.93 0 005.79 1.48h.01C18.63 23.84 24 18.48 24 11.89c0-3.19-1.24-6.18-3.48-8.41zM12.05 21.83a9.9 9.9 0 01-5.05-1.38l-.36-.21-3.71.97.99-3.62-.24-.37a9.87 9.87 0 01-1.52-5.27c0-5.48 4.46-9.94 9.95-9.94a9.88 9.88 0 017.03 2.91 9.88 9.88 0 012.91 7.04c0 5.48-4.47 9.87-10 9.87zm5.45-7.4c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.11 3.23 5.12 4.53.71.31 1.27.5 1.7.64.71.22 1.36.19 1.87.11.57-.08 1.77-.72 2.02-1.42.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z"
      />
    </Svg>
  );
}
