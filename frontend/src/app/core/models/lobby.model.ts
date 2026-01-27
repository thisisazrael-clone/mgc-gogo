import { Opponent } from './opponent.model';

export interface Lobby {
  id: string;
  createdAt: Date;
  opponents: Opponent[];
  currentMatch: number;
  isComplete: boolean;
}

export interface LobbyState {
  currentLobby: Lobby | null;
  opponentNameHistory: string[];
}
