import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StorageService } from '../../core/services/storage.service';
import { AutocompleteService } from '../../core/services/autocomplete.service';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatStepperModule,
    MatCardModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackerComponent {
  private readonly storageService = inject(StorageService);
  private readonly autocompleteService = inject(AutocompleteService);

  protected readonly opponentName = signal<string>('');
  protected readonly lobby = this.storageService.getLobbySignal();
  protected readonly suggestions = this.autocompleteService.suggestions;
  
  protected readonly isComplete = computed(() => {
    const currentLobby = this.lobby().currentLobby;
    return currentLobby?.isComplete ?? false;
  });

  protected readonly currentMatchNumber = computed(() => {
    const currentLobby = this.lobby().currentLobby;
    return currentLobby?.currentMatch ?? 1;
  });

  protected readonly opponents = computed(() => {
    const currentLobby = this.lobby().currentLobby;
    return currentLobby?.opponents ?? [];
  });

  protected readonly canAddOpponent = computed(() => {
    const name = this.opponentName().trim();
    const existingOpponents = this.opponents();
    
    if (!name || existingOpponents.length >= 7) {
      return false;
    }

    // Check for duplicate names
    const nameLower = name.toLowerCase();
    return !existingOpponents.some(opp => opp.name.toLowerCase() === nameLower);
  });

  protected readonly matches = computed(() => {
    return Array.from({ length: 7 }, (_, i) => i + 1);
  });

  onInputChange(value: string): void {
    this.opponentName.set(value);
    this.autocompleteService.setFilter(value);
  }

  onAutocompleteSelected(name: string): void {
    this.opponentName.set(name);
    this.autocompleteService.clearFilter();
  }

  addOpponent(): void {
    const name = this.opponentName().trim();
    if (name && this.canAddOpponent()) {
      this.storageService.addOpponent(name);
      this.opponentName.set('');
      this.autocompleteService.clearFilter();
    }
  }

  toggleOpponentStatus(opponentId: string, isDead: boolean): void {
    this.storageService.updateOpponent(opponentId, { isDead });
  }

  getOpponentForMatch(matchNumber: number) {
    const opponents = this.opponents();
    return opponents[matchNumber - 1] || null;
  }
}
