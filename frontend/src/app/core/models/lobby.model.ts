import { Opponent } from './opponent.model';

export interface Lobby {
  id: string;
  createdAt: Date;
  playerName: string;
  opponents: Opponent[];
  currentMatch: number;
  isComplete: boolean;
  matchHistory: string[]; // Array of opponent IDs faced in each match
}

export interface LobbyState {
  currentLobby: Lobby | null;
}
