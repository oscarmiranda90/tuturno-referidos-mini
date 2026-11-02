import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useCountry } from '../../../shared/country/CountryProvider';
import { createDesignState } from '../demo/fixtures';
import type { Country, ReferralState } from '../domain/types';

// This repository's app is a fixture-driven prototype. Keep demo state explicit
// and centralized; production replaces this provider with the authenticated API.
const ReferralContext = createContext<{
  state: ReferralState;
  setState: (state: ReferralState) => void;
  programCountry: Country;
  selectProgramCountry: (country: Country, empty?: boolean) => void;
} | null>(null);
export function ReferralProvider({ children }: { children: ReactNode }) {
  const { country } = useCountry();
  const [programCountry, setProgramCountry] = useState<Country>(country);
  const [state, setState] = useState(() => createDesignState(country));
  const value = useMemo(
    () => ({
      state,
      setState,
      programCountry,
      selectProgramCountry: (next: Country, empty = false) => {
        setProgramCountry(next);
        setState((current) => ({
          ...createDesignState(next, empty),
          configs: current.configs,
        }));
      },
    }),
    [state, programCountry],
  );
  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>;
}
export function useReferrals() {
  const value = useContext(ReferralContext);
  if (!value) throw new Error('ReferralProvider is required');
  return value;
}
