export interface Sport {
  id: string;
  name: string;
  icon: string;
  category: 'individual' | 'team' | 'racket' | 'combat';
}

export const SPORTS: Sport[] = [
  { id: 'tennis', name: 'Tennis', icon: '🎾', category: 'racket' },
  { id: 'football', name: 'Football', icon: '⚽', category: 'team' },
  { id: 'basketball', name: 'Basketball', icon: '🏀', category: 'team' },
  { id: 'running', name: 'Course', icon: '🏃', category: 'individual' },
  { id: 'badminton', name: 'Badminton', icon: '🏸', category: 'racket' },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐', category: 'team' },
  { id: 'boxing', name: 'Boxe', icon: '🥊', category: 'combat' },
  { id: 'cycling', name: 'Vélo', icon: '🚴', category: 'individual' },
];

export type SportLevel = 'debutant' | 'intermediaire' | 'avance' | 'expert';

export const SPORT_LEVELS: Record<SportLevel, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
  expert: 'Expert'
};