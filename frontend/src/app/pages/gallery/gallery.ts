import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SketchService } from '../../services/sketch';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gallery.html',
})
export class Gallery implements OnInit {
  sketches: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private sketchService: SketchService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.sketchService.getAllSketches().subscribe({
      next: (data) => {
        this.sketches = data;
        this.isLoading = false;
        this.cdr.markForCheck();
        console.log('Disegni caricati:', this.sketches);
      },
      error: (err) => {
        console.error('Errore nel recupero della galleria:', err);
        this.errorMessage = 'Impossibile caricare i disegni in questo momento.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}