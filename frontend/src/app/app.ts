import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TrackerComponent } from './features/tracker/tracker.component';
import { StorageService } from './core/services/storage.service';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    TrackerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly dialog = inject(MatDialog);
  protected readonly storageService = inject(StorageService);
  
  protected readonly lobby = this.storageService.getLobbySignal();
  
  protected readonly hasLobby = computed(() => {
    return this.lobby().currentLobby !== null;
  });

  constructor() {
    // Initialize lobby if none exists
    if (!this.hasLobby()) {
      this.storageService.createNewLobby();
    }
  }

  onNewLobby(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Start New Lobby?',
        message: 'This will clear all current opponent data and start fresh. Opponent name history will be preserved.',
        confirmText: 'Start New',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.storageService.resetLobby();
        this.storageService.createNewLobby();
      }
    });
  }
}

