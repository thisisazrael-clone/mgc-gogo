import { Component, computed, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from '../../core/services/storage.service';
import { AutocompleteService } from '../../core/services/autocomplete.service';
import { predictOpponent } from '../../core/utils/prediction.util';
import { MatchResult } from '../../core/models/opponent.model';
import { 
  FightAnimationDialogComponent, 
  FightAnimationDialogData, 
  FightAnimationDialogResult 
} from '../../shared/components/fight-animation-dialog/fight-animation-dialog.component';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackerComponent {
  private readonly storageService = inject(StorageService);
  private readonly autocompleteService = inject(AutocompleteService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly opponentName = signal<string>('');
  protected readonly pendingElimination = signal<string | null>(null);
  protected readonly lobby = this.storageService.getLobbySignal();
  protected readonly suggestions = this.autocompleteService.suggestions;
  
  protected readonly currentMatchNumber = computed(() => {
    const currentLobby = this.lobby().currentLobby;
    return currentLobby?.currentMatch ?? 1;
  });

  protected readonly opponents = computed(() => {
    const currentLobby = this.lobby().currentLobby;
    return currentLobby?.opponents ?? [];
  });

  protected readonly playerName = computed(() => {
    return this.lobby().currentLobby?.playerName || 'Player';
  });

  protected readonly totalWins = computed(() => {
    return this.opponents().reduce((total, opp) => {
      const wins = (opp.matchResults || []).filter(r => r.outcome === 'win').length;
      return total + wins;
    }, 0);
  });

  protected readonly totalLosses = computed(() => {
    return this.opponents().reduce((total, opp) => {
      const losses = (opp.matchResults || []).filter(r => r.outcome === 'loss').length;
      return total + losses;
    }, 0);
  });

  protected readonly totalKills = computed(() => {
    return this.opponents().reduce((total, opp) => {
      return total + (opp.killCount || 0);
    }, 0);
  });

  protected readonly aliveOpponentsCount = computed(() => {
    return this.opponents().filter(opp => !opp.isDead).length;
  });

  protected readonly predictedOpponent = computed(() => {
    const matchNum = this.currentMatchNumber();
    const opps = this.opponents();
    
    if (matchNum <= 7 || opps.length < 7) {
      return null;
    }
    
    return predictOpponent(matchNum, opps);
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

  protected readonly showOpponentInput = computed(() => {
    return this.opponents().length < 7;
  });

  protected readonly canAdvanceMatch = computed(() => {
    const matchNum = this.currentMatchNumber();
    const opps = this.opponents();
    
    // During first 7 matches, must have recorded all opponents up to current match
    if (matchNum <= 7) {
      return opps.length === 7;
    }
    
    // After match 7, can always advance
    return true;
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
      // Open fight dialog first
      this.openFightDialog(name, []).then(result => {
        if (result) {
          // Add opponent after fight animation
          this.storageService.addOpponent(name);
          
          // Find the newly added opponent
          const addedOpponent = this.opponents().find(opp => opp.name === name);
          if (addedOpponent) {
            const matchNum = this.currentMatchNumber();
            
            // Record match outcome
            this.storageService.recordMatchOutcome(addedOpponent.id, result.outcome, matchNum);
            
            // Record elimination if checked
            if (result.eliminated) {
              const currentLobby = this.lobby().currentLobby;
              const playerId = currentLobby?.id; // Using lobby ID as player ID
              this.storageService.recordElimination(addedOpponent.id, playerId || null, matchNum);
            }
          }
          
          this.opponentName.set('');
          this.autocompleteService.clearFilter();
        }
      });
    }
  }

  nextMatch(): void {
    const matchNum = this.currentMatchNumber();
    const opps = this.opponents();
    
    // After match 7, open fight dialog for predicted opponent
    if (matchNum >= 7 && opps.length === 7) {
      const predicted = predictOpponent(matchNum, opps);
      if (predicted) {
        this.openFightDialog(predicted.name, predicted.matchResults || []).then(result => {
          if (result) {
            // Record match outcome
            this.storageService.recordMatchOutcome(predicted.id, result.outcome, matchNum);
            
            // Record elimination if checked
            if (result.eliminated) {
              const currentLobby = this.lobby().currentLobby;
              const playerId = currentLobby?.id; // Using lobby ID as player ID
              this.storageService.recordElimination(predicted.id, playerId || null, matchNum);
            }
            
            // Advance to next match
            this.storageService.advanceMatch();
          }
        });
        return;
      }
    }
    
    // Advance to next match (for matches 1-7)
    this.storageService.advanceMatch();
  }

  confirmElimination(isDead: boolean): void {
    const opponentId = this.pendingElimination();
    if (opponentId) {
      this.storageService.updateOpponent(opponentId, { isDead });
      this.pendingElimination.set(null);
      this.storageService.advanceMatch();
    }
  }

  getOpponentById(id: string) {
    return this.opponents().find(opp => opp.id === id);
  }

  getRecentMatchHistory(opponent: any) {
    return (opponent.matchResults || []).slice(-3);
  }

  updatePlayerName(name: string): void {
    this.storageService.updatePlayerName(name);
  }

  private openFightDialog(opponentName: string, matchHistory?: MatchResult[]): Promise<FightAnimationDialogResult | null> {
    const dialogData: FightAnimationDialogData = {
      playerName: this.playerName(),
      opponentName,
      matchNumber: this.currentMatchNumber(),
      matchHistory: matchHistory || []
    };

    const dialogRef = this.dialog.open(FightAnimationDialogComponent, {
      width: '500px',
      disableClose: true,
      data: dialogData
    });

    return new Promise((resolve) => {
      dialogRef.afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(result => {
          resolve(result || null);
        });
    });
  }
}
