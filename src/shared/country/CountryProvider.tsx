import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_CURRENCY, type CurrencyConfig } from '../money';

import type { CountryCode } from './types';

interface CountryConfig {
  name: string;
  currency: CurrencyConfig;
  groupName: string;
}

const COUNTRIES: Record<CountryCode, CountryConfig> = {
  VE: { name: 'Venezuela', currency: DEFAULT_CURRENCY, groupName: 'SAN' },
  CO: {
    name: 'Colombia',
    currency: { code: 'COP', locale: 'es-CO', display: 'code' },
    groupName: 'cadena',
  },
};

interface CountryContextValue {
  country: CountryCode;
  config: CountryConfig;
  setCountry: (country: CountryCode) => void;
}

const CountryContext = createContext<CountryContextValue | null>(null);

/** The app owns country selection; individual features consume the same context. */
export function CountryProvider({ children }: { children: ReactNode }) {
  const [country, setCountry] = useState<CountryCode>('VE');
  const value = useMemo(() => ({ country, config: COUNTRIES[country], setCountry }), [country]);
  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
}

export function useCountry(): CountryContextValue {
  const value = useContext(CountryContext);
  if (!value) throw new Error('CountryProvider is required');
  return value;
}
