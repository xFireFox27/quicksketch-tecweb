import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardService } from '../../services/leaderboard';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css'
})
export class Leaderboard implements OnInit {
  bestPlayers: any[] = [];
  bestArtists: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private leaderboardService: LeaderboardService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    let requestsCompleted = 0;
    let hasError = false;

    const checkComplete = () => {
      requestsCompleted++;
      if (requestsCompleted === 2) {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    };

    this.leaderboardService.getBestPlayers().subscribe({
      next: (data) => {
        this.bestPlayers = data;
        checkComplete();
      },
      error: (err) => {
        console.error('Errore giocatori', err);
        this.errorMessage = 'Impossibile caricare le classifiche.';
        hasError = true;
        checkComplete();
      }
    });

    this.leaderboardService.getBestArtists().subscribe({
      next: (data) => {
        this.bestArtists = data;
        checkComplete();
      },
      error: (err) => {
        console.error('Errore artisti', err);
        this.errorMessage = 'Impossibile caricare le classifiche.';
        hasError = true;
        checkComplete();
      }
    });
  }
}
