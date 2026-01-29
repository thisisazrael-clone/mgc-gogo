import { Injectable, signal } from '@angular/core';
import { Lobby, LobbyState } from '../models/lobby.model';
import { Opponent } from '../models/opponent.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEY = 'mgc-gogo-lobby-state';
  
  // Icon pool for random opponent avatars
  private readonly ICON_POOL = [
    'shield', 'sports_martial_arts', 'psychology', 'pets', 'android',
    'sports_esports', 'emoji_emotions', 'star', 'local_fire_department',
    'science', 'token', 'sports_mma', 'security', 'bug_report', 'spa',
    'brightness_7', 'adb', 'face', 'sports_kabaddi', 'biotech',
    'electric_bolt', 'rocket_launch', 'cyclone', 'whatshot', 'sentiment_very_satisfied'
  ];
  
  // Color pool for random opponent colors
  private readonly COLOR_POOL = [
    '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4',
    '#cddc39', '#ff5722', '#3f51b5', '#e91e63', '#009688',
    '#8bc34a', '#ff6f00', '#00acc1', '#d32f2f', '#7b1fa2'
  ];
  
  // Signal-based state
  private readonly state = signal<LobbyState>(this.loadState());

  getCurrentLobby() {
    return this.state().currentLobby;
  }

  getOpponentNameHistory() {
    return this.state().opponentNameHistory;
  }

  getLobbySignal() {
    return this.state;
  }

  private getRandomIcon(): string {
    return this.ICON_POOL[Math.floor(Math.random() * this.ICON_POOL.length)];
  }

  private getRandomColor(): string {
    return this.COLOR_POOL[Math.floor(Math.random() * this.COLOR_POOL.length)];
  }

  createNewLobby(playerName: string = 'Player'): void {
    const newLobby: Lobby = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      playerName: playerName.trim(),
      opponents: [],
      currentMatch: 1,
      isComplete: false,
      matchHistory: []
    };

    this.state.update(state => ({
      ...state,
      currentLobby: newLobby
    }));

    this.saveState();
  }

  addOpponent(name: string): void {
    const lobby = this.state().currentLobby;
    if (!lobby || lobby.opponents.length >= 7) {
      return;
    }

    const opponent: Opponent = {
      id: crypto.randomUUID(),
      name: name.trim(),
      isDead: false,
      icon: this.getRandomIcon(),
      color: this.getRandomColor(),
      matchResults: [],
      killCount: 0,
      killedBy: null,
      eliminatedAtMatch: null
    };

    const updatedLobby = {
      ...lobby,
      opponents: [...lobby.opponents, opponent],
      currentMatch: lobby.opponents.length + 1,
      isComplete: lobby.opponents.length + 1 === 7,
      matchHistory: [...lobby.matchHistory, opponent.id]
    };

    // Add to name history if not already present
    const nameHistory = this.state().opponentNameHistory;
    const nameLower = name.toLowerCase().trim();
    if (!nameHistory.some(n => n.toLowerCase() === nameLower)) {
      this.state.update(state => ({
        ...state,
        currentLobby: updatedLobby,
        opponentNameHistory: [...nameHistory, name.trim()]
      }));
    } else {
      this.state.update(state => ({
        ...state,
        currentLobby: updatedLobby
      }));
    }

    this.saveState();
  }

  updateOpponent(opponentId: string, updates: Partial<Opponent>): void {
    const lobby = this.state().currentLobby;
    if (!lobby) {
      return;
    }

    const updatedOpponents = lobby.opponents.map(opp =>
      opp.id === opponentId ? { ...opp, ...updates } : opp
    );

    this.state.update(state => ({
      ...state,
      currentLobby: {
        ...lobby,
        opponents: updatedOpponents
      }
    }));

    this.saveState();
  }

  recordMatchOpponent(opponentId: string): void {
    const lobby = this.state().currentLobby;
    if (!lobby) {
      return;
    }

    this.state.update(state => ({
      ...state,
      currentLobby: {
        ...lobby,
        matchHistory: [...lobby.matchHistory, opponentId]
      }
    }));

    this.saveState();
  }

  advanceMatch(): void {
    const lobby = this.state().currentLobby;
    if (!lobby) {
      return;
    }

    // Can advance after all 7 opponents are recorded
    if (lobby.opponents.length < 7) {
      return;
    }

    this.state.update(state => ({
      ...state,
      currentLobby: {
        ...lobby,
        currentMatch: lobby.currentMatch + 1,
        isComplete: lobby.opponents.length === 7
      }
    }));

    this.saveState();
  }

  resetLobby(): void {
    this.state.update(state => ({
      ...state,
      currentLobby: null
    }));

    this.saveState();
  }

  recordMatchOutcome(opponentId: string, outcome: 'win' | 'loss', matchNumber: number): void {
    const lobby = this.state().currentLobby;
    if (!lobby) {
      return;
    }

    const updatedOpponents = lobby.opponents.map(opp => {
      if (opp.id === opponentId) {
        const matchResults = opp.matchResults || [];
        return {
          ...opp,
          matchResults: [
            ...matchResults,
            {
              matchNumber,
              outcome,
              timestamp: new Date()
            }
          ]
        };
      }
      return opp;
    });

    this.state.update(state => ({
      ...state,
      currentLobby: {
        ...lobby,
        opponents: updatedOpponents
      }
    }));

    this.saveState();
  }

  recordElimination(opponentId: string, killedById: string | null, matchNumber: number): void {
    const lobby = this.state().currentLobby;
    if (!lobby) {
      return;
    }

    const updatedOpponents = lobby.opponents.map(opp => {
      // Update the eliminated opponent
      if (opp.id === opponentId) {
        return {
          ...opp,
          isDead: true,
          killedBy: killedById,
          eliminatedAtMatch: matchNumber
        };
      }
      // Increment kill count for the killer
      if (killedById && opp.id === killedById) {
        return {
          ...opp,
          killCount: (opp.killCount || 0) + 1
        };
      }
      return opp;
    });

    this.state.update(state => ({
      ...state,
      currentLobby: {
        ...lobby,
        opponents: updatedOpponents
      }
    }));

    this.saveState();
  }

  updatePlayerName(playerName: string): void {
    const lobby = this.state().currentLobby;
    if (!lobby) {
      return;
    }

    this.state.update(state => ({
      ...state,
      currentLobby: {
        ...lobby,
        playerName: playerName.trim()
      }
    }));

    this.saveState();
  }

  private loadState(): LobbyState {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LobbyState;
        // Restore Date objects
        if (parsed.currentLobby) {
          parsed.currentLobby.createdAt = new Date(parsed.currentLobby.createdAt);
          // Restore MatchResult timestamps and assign icons/colors to existing opponents
          parsed.currentLobby.opponents = parsed.currentLobby.opponents.map(opp => ({
            ...opp,
            icon: opp.icon || this.getRandomIcon(),
            color: opp.color || this.getRandomColor(),
            matchResults: (opp.matchResults || []).map(result => ({
              ...result,
              timestamp: new Date(result.timestamp)
            }))
          }));
          // Initialize matchHistory for migrated old lobbies
          if (!parsed.currentLobby.matchHistory) {
            parsed.currentLobby.matchHistory = [];
          }
        }
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
    }

    return {
      currentLobby: null,
      opponentNameHistory: []
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state()));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }
}
