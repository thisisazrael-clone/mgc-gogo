import { Injectable, computed, signal } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AutocompleteService {
  private readonly storageService = new StorageService();
  private readonly filterText = signal<string>('');

  readonly suggestions = computed(() => {
    const filter = this.filterText().toLowerCase().trim();
    const history = this.storageService.getOpponentNameHistory();
    const currentOpponents = this.storageService.getCurrentLobby()?.opponents || [];
    const usedNames = new Set(currentOpponents.map(opp => opp.name.toLowerCase()));

    if (!filter) {
      return history.filter(name => !usedNames.has(name.toLowerCase()));
    }

    return history
      .filter(name => 
        name.toLowerCase().includes(filter) && 
        !usedNames.has(name.toLowerCase())
      );
  });

  setFilter(text: string): void {
    this.filterText.set(text);
  }

  clearFilter(): void {
    this.filterText.set('');
  }
}
