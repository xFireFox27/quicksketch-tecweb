import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SketchService } from '../../services/sketch';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './play.html',
})
export class Play implements OnInit {
  sketchId: string | null = null;
  sketchData: any = null;
  isOwner = false;
  
  guessForm: FormGroup;
  
  // Gestione dello stato della partita
  isLoading = true;
  gameStatus: 'playing' | 'won' | 'lost' | 'guest' = 'playing';
  feedbackMessage = '';
  attemptsLeft = 10; // Da traccia, l'utente ha 10 tentativi

  isGuest = false;

  constructor(
    private route: ActivatedRoute,
    private sketchService: SketchService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public authService: AuthService
  ) {
    this.guessForm = this.fb.group({
      guess: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.isGuest = !this.authService.isLoggedIn();
    if (this.isGuest) {
      this.gameStatus = 'guest';
    }

    // Leggiamo l'ID dall'URL (es. /play/1)
    this.sketchId = this.route.snapshot.paramMap.get('id');
    
    if (this.sketchId) {
      this.loadSketch();
    } else {
      this.feedbackMessage = 'ID disegno non valido.';
      this.isLoading = false;
    }
  }

  loadSketch() {
    this.sketchService.getSketchById(this.sketchId!).subscribe({
      next: (data) => {
        this.sketchData = data;
        
        if (this.isGuest) {
          this.feedbackMessage = 'Effettua il login per giocare e provare a indovinare.';
          this.isLoading = false;
          this.cdr.markForCheck();
          return;
        }

        const currentUsername = this.authService.getUsername();
        if (data.author && currentUsername && data.author.username === currentUsername) {
          this.isOwner = true;
          this.isLoading = false;
          this.cdr.markForCheck();
        } else {
          // Se non è il proprietario, recuperiamo lo stato di gioco per questo disegno dal database
          this.sketchService.getGameSession(this.sketchId!).subscribe({
            next: (session) => {
              this.gameStatus = session.status;
              this.attemptsLeft = 10 - (session.attemptsCount || 0);

              if (this.gameStatus === 'won') {
                this.feedbackMessage = `Hai già indovinato questo disegno in precedenza! La parola era "${session.solution}".`;
              } else if (this.gameStatus === 'lost') {
                this.feedbackMessage = `Hai esaurito i tentativi in precedenza! La parola era "${session.solution}".`;
              }
              this.isLoading = false;
              this.cdr.markForCheck();
            },
            error: (err) => {
              console.error('Errore recupero sessione', err);
              this.isLoading = false;
              this.cdr.markForCheck();
            }
          });
        }
      },
      error: (err) => {
        console.error('Errore caricamento disegno', err);
        this.feedbackMessage = 'Impossibile caricare il disegno.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSubmitGuess() {
    if (this.guessForm.invalid || this.gameStatus !== 'playing') return;

    const userGuess = this.guessForm.value.guess;

    this.sketchService.makeGuess(this.sketchId!, userGuess).subscribe({
      next: (res) => {
        // Gestiamo la risposta del backend
        if (res.status === 'won' || res.correct === true) {
          this.gameStatus = 'won';
          this.feedbackMessage = 'Hai indovinato! Bravissimo!';
        } else {
          // Risposta sbagliata
          this.attemptsLeft--;
          this.feedbackMessage = `Sbagliato! La parola non è "${userGuess}".`;
          this.guessForm.reset();
          
          if (this.attemptsLeft <= 0) {
            this.gameStatus = 'lost';
            this.feedbackMessage = 'Hai esaurito i tentativi! Game Over.';
          }
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        // Gestione errori (es. l'utente prova a indovinare il proprio disegno)
        this.feedbackMessage = err.error?.error || 'Errore durante il tentativo.';
        this.cdr.markForCheck();
      }
    });
  }
}