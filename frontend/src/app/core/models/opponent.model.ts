export interface MatchResult {
  matchNumber: number;
  outcome: 'win' | 'loss';
  timestamp: Date;
}

export interface Opponent {
  id: string;
  name: string;
  isDead: boolean;
  matchResults?: MatchResult[];
  killCount?: number;
  killedBy?: string | null;
  eliminatedAtMatch?: number | null;
}
