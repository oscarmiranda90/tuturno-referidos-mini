import type { Country } from './types';
import type { Tier } from '../../../shared/models/types';

const CAPACITY: Record<Tier, number> = { bronce: 1, plata: 2, oro: 3, diamante: 4 };

export function cardBenefit(tier: Tier, country: Country): string {
  const count = CAPACITY[tier];
  const group = country === 'VE' ? 'San' : count === 1 ? 'cadena' : 'cadenas';
  return `Juego ${count} ${group} a la vez${tier === 'diamante' ? ' y 1 gratis' : ''}`;
}
