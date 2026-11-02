/** Profile supplied by the host application. All counters are explicit server data. */
export type Tier = 'bronce' | 'plata' | 'oro' | 'diamante';
export type ClubMascotMood = 'idle' | 'sad' | 'angry' | 'dance';
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  collectedSanes: number;
  club: { points: { tier: Tier } };
}
