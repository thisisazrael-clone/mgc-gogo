import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { StorageService } from '../../core/services/storage.service';
import { predictOpponent } from '../../core/utils/prediction.util';
import { Opponent } from '../../core/models/opponent.model';

@Component({
  selector: 'app-predictor',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './predictor.component.html',
  styleUrl: './predictor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PredictorComponent {
  private readonly storageService = inject(StorageService);
  protected readonly lobby = this.storageService.getLobbySignal();

  protected readonly currentMatch = computed(() => {
    return this.lobby().currentLobby?.currentMatch ?? 8;
  });

  protected readonly opponents = computed(() => {
    return this.lobby().currentLobby?.opponents ?? [];
  });

  protected readonly predictedOpponent = computed(() => {
    const match = this.currentMatch();
    const opps = this.opponents();
    
    if (opps.length !== 7) {
      return null;
    }

    return predictOpponent(match, opps);
  });

  protected readonly aliveOpponentsCount = computed(() => {
    return this.opponents().filter(opp => !opp.isDead).length;
  });

  protected readonly wheelRotation = computed(() => {
    const match = this.currentMatch();
    const index = (match - 1) % 7;
    const degreePerSlice = 360 / 7;
    // Rotate so the predicted opponent is at the top (12 o'clock position)
    return -(index * degreePerSlice) + 90;
  });

  nextMatch(): void {
    this.storageService.advanceMatch();
  }

  getOpponentPosition(index: number): { x: number; y: number; rotation: number } {
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    const degreePerSlice = 360 / 7;
    const startAngle = -90; // Start at top (12 o'clock)
    
    const angle = startAngle + (index * degreePerSlice);
    const radian = (angle * Math.PI) / 180;
    
    return {
      x: centerX + radius * Math.cos(radian),
      y: centerY + radius * Math.sin(radian),
      rotation: angle + 90 // Rotate text to face outward
    };
  }

  isCurrentPrediction(opponent: Opponent): boolean {
    const predicted = this.predictedOpponent();
    return predicted?.id === opponent.id;
  }
}
