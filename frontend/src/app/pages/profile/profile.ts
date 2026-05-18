import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StatsService, UserStats } from '../../services/stats';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  stats: UserStats | null = null;
  isLoading = true;
  errorMessage = '';
  username = '';

  constructor(
    private statsService: StatsService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const username = this.authService.getUsername();
    if (username) {
      this.username = username;
    }

    this.statsService.getMyStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Errore nel recupero delle statistiche', err);
        this.errorMessage = 'Impossibile caricare le statistiche del profilo.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
