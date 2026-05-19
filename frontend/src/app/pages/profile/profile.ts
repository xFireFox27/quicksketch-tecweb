import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StatsService, UserStats } from '../../services/stats';
import { AuthService } from '../../services/auth';
import { SketchService } from '../../services/sketch';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  stats: UserStats | null = null;
  mySketches: any[] = [];
  isLoading = true;
  isLoadingSketches = true;
  errorMessage = '';
  errorMessageSketches = '';
  username = '';

  constructor(
    private statsService: StatsService,
    private authService: AuthService,
    private sketchService: SketchService,
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

    this.sketchService.getAllSketches().subscribe({
      next: (data) => {
        this.mySketches = data.filter(s => s.author?.username === this.username);
        this.isLoadingSketches = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Errore nel recupero dei disegni', err);
        this.errorMessageSketches = 'Impossibile caricare i tuoi disegni.';
        this.isLoadingSketches = false;
        this.cdr.markForCheck();
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
