import { Injectable, signal } from '@angular/core';
import { Lobby, LobbyState } from '../models/lobby.model';
import { Opponent } from '../models/opponent.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEY = 'mgc-gogo-lobby-state';
  
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

  createNewLobby(): void {
    const newLobby: Lobby = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      opponents: [],
      currentMatch: 1,
      isComplete: false
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
      isDead: false
    };

    const updatedLobby = {
      ...lobby,
      opponents: [...lobby.opponents, opponent],
      currentMatch: lobby.opponents.length + 1,
      isComplete: lobby.opponents.length + 1 === 7
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

  advanceMatch(): void {
    const lobby = this.state().currentLobby;
    if (!lobby || !lobby.isComplete) {
      return;
    }

    this.state.update(state => ({
      ...state,
      currentLobby: {
        ...lobby,
        currentMatch: lobby.currentMatch + 1
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

  private loadState(): LobbyState {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LobbyState;
        // Restore Date objects
        if (parsed.currentLobby) {
          parsed.currentLobby.createdAt = new Date(parsed.currentLobby.createdAt);
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
