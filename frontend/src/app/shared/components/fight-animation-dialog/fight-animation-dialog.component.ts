import { Component, inject, ChangeDetectionStrategy, signal, OnInit, model } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatchResult } from '../../../core/models/opponent.model';

export interface FightAnimationDialogData {
  playerName: string;
  opponentName: string;
  matchNumber: number;
  matchHistory?: MatchResult[];
}

export interface FightAnimationDialogResult {
  outcome: 'win' | 'loss';
  eliminated: boolean;
}

@Component({
  selector: 'app-fight-animation-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatCheckboxModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Match {{ data.matchNumber }}</h2>
    
    <mat-dialog-content>
      <div class="match-history-section">
        <h3 class="history-title">Match History vs {{ data.opponentName }}</h3>
        @if (data.matchHistory && data.matchHistory.length > 0) {
          <div class="history-list">
            @for (result of data.matchHistory; track result.matchNumber) {
              <div class="history-item">
                <span class="history-match-num">Match {{ result.matchNumber }}</span>
                <span class="history-badge" 
                      [class.--win]="result.outcome === 'win'"
                      [class.--loss]="result.outcome === 'loss'">
                  {{ result.outcome === 'win' ? 'W' : 'L' }}
                </span>
              </div>
            }
          </div>
        } @else {
          <p class="no-history">No match history yet</p>
        }
      </div>

      <div class="fight-arena">
        <div class="fighter player" [class.attacking]="playerAttacking()">
          <mat-icon class="fighter-icon">shield</mat-icon>
          <p class="fighter-name">{{ data.playerName }}</p>
        </div>

        <div class="vs-divider">
          <mat-icon>swords</mat-icon>
        </div>

        <div class="fighter opponent" [class.attacking]="opponentAttacking()">
          <mat-icon class="fighter-icon">sports_martial_arts</mat-icon>
          <p class="fighter-name">{{ data.opponentName }}</p>
        </div>
      </div>

      <div class="outcome-section">
        <p class="outcome-prompt">What was the match outcome?</p>
        <div class="outcome-buttons">
          <button 
            mat-raised-button 
            color="primary" 
            class="outcome-btn win-btn"
            (click)="onOutcome('win')">
            <mat-icon>celebration</mat-icon>
            I Won
          </button>
          <button 
            mat-raised-button 
            color="warn" 
            class="outcome-btn loss-btn"
            (click)="onOutcome('loss')">
            <mat-icon>sentiment_dissatisfied</mat-icon>
            I Lost
          </button>
        </div>

        <mat-checkbox 
          [(ngModel)]="eliminated" 
          class="eliminated-checkbox"
          color="accent">
          I eliminated this enemy
        </mat-checkbox>
      </div>
    </mat-dialog-content>
  `,
  styles: [`
    @use '../../../styles/variables' as vars;

    mat-dialog-content {
      padding: vars.$spacing-md 0;
      min-width: 400px;
    }

    .match-history-section {
      margin: 0 vars.$spacing-md vars.$spacing-lg;
      padding: vars.$spacing-md;
      background: rgba(vars.$primary-color, 0.03);
      border-radius: vars.$border-radius-md;
      border: 1px solid rgba(vars.$primary-color, 0.1);
    }

    .history-title {
      margin: 0 0 vars.$spacing-sm 0;
      font-size: 14px;
      font-weight: 600;
      color: vars.$text-primary;
    }

    .history-list {
      max-height: 200px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: vars.$spacing-xs;
    }

    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: vars.$spacing-xs vars.$spacing-sm;
      background: white;
      border-radius: vars.$border-radius-sm;
      font-size: 13px;
    }

    .history-match-num {
      color: vars.$text-secondary;
      font-weight: 500;
    }

    .history-badge {
      padding: 2px 8px;
      border-radius: vars.$border-radius-sm;
      font-weight: 600;
      font-size: 12px;
      
      &.--win {
        background-color: rgba(vars.$success-color, 0.1);
        color: vars.$success-color;
      }
      
      &.--loss {
        background-color: rgba(vars.$error-color, 0.1);
        color: vars.$error-color;
      }
    }

    .no-history {
      margin: 0;
      padding: vars.$spacing-md;
      text-align: center;
      color: vars.$text-secondary;
      font-style: italic;
      font-size: 13px;
    }

    .fight-arena {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: vars.$spacing-lg;
      margin-bottom: vars.$spacing-xl;
      background: linear-gradient(135deg, rgba(vars.$primary-color, 0.05) 0%, rgba(vars.$accent-color, 0.05) 100%);
      border-radius: vars.$border-radius-md;
      min-height: 150px;
    }

    .fighter {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: vars.$spacing-sm;
      padding: vars.$spacing-md;
      background: white;
      border-radius: vars.$border-radius-md;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform vars.$transition-normal;
      position: relative;
    }

    .fighter-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: vars.$primary-color;
    }

    .opponent .fighter-icon {
      color: vars.$accent-color;
    }

    .fighter-name {
      margin: 0;
      font-weight: 500;
      color: vars.$text-primary;
    }

    .vs-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: vars.$text-secondary;
      }
    }

    .outcome-section {
      padding: 0 vars.$spacing-md;
    }

    .outcome-prompt {
      text-align: center;
      font-size: 16px;
      font-weight: 500;
      color: vars.$text-primary;
      margin-bottom: vars.$spacing-md;
    }

    .outcome-buttons {
      display: flex;
      gap: vars.$spacing-md;
      margin-bottom: vars.$spacing-lg;
    }

    .outcome-btn {
      flex: 1;
      height: 56px;
      font-size: 16px;
      font-weight: 500;
      
      mat-icon {
        margin-right: vars.$spacing-xs;
      }
    }

    .eliminated-checkbox {
      display: flex;
      justify-content: center;
      margin-top: vars.$spacing-md;
    }

    /* Simple animations - only when not reduced motion */
    @media (prefers-reduced-motion: no-preference) {
      .fighter.attacking {
        animation: attack-slide 0.6s ease-in-out;
      }

      .player.attacking {
        animation: attack-slide-right 0.6s ease-in-out;
      }

      @keyframes attack-slide-right {
        0%, 100% {
          transform: translateX(0);
        }
        50% {
          transform: translateX(20px);
        }
      }

      @keyframes attack-slide {
        0%, 100% {
          transform: translateX(0);
        }
        50% {
          transform: translateX(-20px);
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FightAnimationDialogComponent implements OnInit {
  protected readonly data = inject<FightAnimationDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<FightAnimationDialogComponent>);

  protected eliminated = model(false);
  protected readonly playerAttacking = signal(false);
  protected readonly opponentAttacking = signal(false);

  ngOnInit(): void {
    // Trigger simple attack animation sequence on load
    this.playFightSequence();
  }

  private playFightSequence(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return; // Skip animations if user prefers reduced motion
    }

    setTimeout(() => this.playerAttacking.set(true), 300);
    setTimeout(() => this.playerAttacking.set(false), 900);
    setTimeout(() => this.opponentAttacking.set(true), 1200);
    setTimeout(() => this.opponentAttacking.set(false), 1800);
  }

  onOutcome(outcome: 'win' | 'loss'): void {
    const result: FightAnimationDialogResult = {
      outcome,
      eliminated: this.eliminated()
    };
    this.dialogRef.close(result);
  }
}
