import { Component, ElementRef, ViewChild, AfterViewInit, HostListener, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import SignaturePad from 'signature_pad';
import { SketchService } from '../../services/sketch';

@Component({
  selector: 'app-draw',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './draw.html',
})
export class Draw implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('sketchPad', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private signaturePad!: SignaturePad;

  colors = ['#000000', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
  currentColor = '#000000';
  isEraser = false;
  isBucket = false;

  // Variabili per gestire le parole
  wordToDraw: any = null;
  isLoadingWord = true;

  // Variabili per il timer
  timeLeft: number = 60;
  timerInterval: any;
  isTimeUp: boolean = false;

  // Variabili per l'Undo/Redo
  private history: any[] = [];
  private redoHistory: any[] = [];

  constructor(
    private sketchService: SketchService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Chiediamo le parole al backend
    this.sketchService.getWords().subscribe({
      next: (words) => {
        // Scegliamo una parola a caso dall'array
        const randomIndex = Math.floor(Math.random() * words.length);
        this.wordToDraw = words[randomIndex];
        this.isLoadingWord = false;
        this.startTimer();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Errore nel recupero delle parole:', err);
        this.isLoadingWord = false;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.cdr.markForCheck();
      } else {
        this.stopTimer();
        this.isTimeUp = true;
        this.signaturePad.off();
        this.cdr.markForCheck();
        alert('Tempo scaduto! Il tuo disegno verrà pubblicato adesso.');
        this.saveSketch();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  ngAfterViewInit() {
    this.signaturePad = new SignaturePad(this.canvasRef.nativeElement, {
      minWidth: 2,
      maxWidth: 4,
      penColor: this.currentColor,
      backgroundColor: 'rgb(255, 255, 255)'
    });

    this.signaturePad.addEventListener('beginStroke', () => {
      // Quando inizia un nuovo tratto, salviamo lo stato precedente
      this.saveHistoryState();
      // Resettiamo la cronologia di redo perché non è più valida dopo un nuovo tratto
      this.redoHistory = [];
    });

    this.resizeCanvas();
  }

  saveHistoryState() {
    // Salviamo lo stato corrente della canvas come immagine in base64
    const dataUrl = this.canvasRef.nativeElement.toDataURL('image/png');
    this.history.push(dataUrl);
  }

  undo() {
    if (this.history.length === 0) return;
    const currentState = this.canvasRef.nativeElement.toDataURL('image/png');
    this.redoHistory.push(currentState);

    const previousState = this.history.pop();
    this.restoreFromDataUrl(previousState);
  }

  redo() {
    if (this.redoHistory.length === 0) return;
    const currentState = this.canvasRef.nativeElement.toDataURL('image/png');
    this.history.push(currentState);

    const nextState = this.redoHistory.pop();
    this.restoreFromDataUrl(nextState);
  }

  hasUndo(): boolean {
    return this.history.length > 0;
  }

  hasRedo(): boolean {
    return this.redoHistory.length > 0;
  }

  // Funzione per ripristinare lo stato della canvas da un'immagine in base64
  private restoreFromDataUrl(dataUrl: string) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      this.signaturePad.clear();

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      ctx.restore();
    };
    img.src = dataUrl;
  }

  // Gestione del ridimensionamento della canvas
  @HostListener('window:resize')
  resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const data = this.signaturePad.toData();

    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d')?.scale(ratio, ratio);

    this.signaturePad.clear();

    if (data && data.length > 0) {
      this.signaturePad.fromData(data);
    }
  }

  setColor(color: string) {
    if (this.isTimeUp) return;
    this.isEraser = false;
    this.isBucket = false;
    this.currentColor = color;
    this.signaturePad.penColor = color;
    this.signaturePad.on();
  }

  onCustomColorChange(event: Event) {
    if (this.isTimeUp) return;
    const input = event.target as HTMLInputElement;
    this.setColor(input.value);
  }

  setEraser() {
    if (this.isTimeUp) return;
    this.isEraser = true;
    this.isBucket = false;
    this.signaturePad.penColor = 'rgb(255, 255, 255)';
    this.signaturePad.on();
  }

  setBucket() {
    if (this.isTimeUp) return;
    this.isBucket = true;
    this.isEraser = false;
    this.signaturePad.off();
  }

  // --- FLOOD FILL ALGORITHM ---
  hexToRgba(hex: string): number[] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 255] : [0, 0, 0, 255];
  }

  onCanvasClick(event: MouseEvent) {
    if (!this.isBucket || this.isTimeUp) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    const x = Math.floor((event.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((event.clientY - rect.top) * (canvas.height / rect.height));

    const fillColor = this.hexToRgba(this.currentColor);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const startPos = (y * canvas.width + x) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    // Se il colore di partenza è già uguale a quello di destinazione, ci fermiamo
    if (startR === fillColor[0] && startG === fillColor[1] && startB === fillColor[2] && startA === fillColor[3]) {
      return;
    }

    // Salva lo stato prima di applicare il riempimento col secchiello
    this.saveHistoryState();
    this.redoHistory = [];

    const matchStartColor = (pos: number) => {
      return data[pos] === startR && data[pos + 1] === startG && data[pos + 2] === startB && data[pos + 3] === startA;
    };

    const colorPixel = (pos: number) => {
      data[pos] = fillColor[0];
      data[pos + 1] = fillColor[1];
      data[pos + 2] = fillColor[2];
      data[pos + 3] = fillColor[3];
    };

    const pixelStack = [[x, y]];

    while (pixelStack.length) {
      const newPos = pixelStack.pop()!;
      let px = newPos[0];
      let py = newPos[1];
      let pixelPos = (py * canvas.width + px) * 4;

      while (py-- >= 0 && matchStartColor(pixelPos)) {
        pixelPos -= canvas.width * 4;
      }
      pixelPos += canvas.width * 4;
      py++;

      let reachLeft = false;
      let reachRight = false;
      while (py++ < canvas.height - 1 && matchStartColor(pixelPos)) {
        colorPixel(pixelPos);

        if (px > 0) {
          if (matchStartColor(pixelPos - 4)) {
            if (!reachLeft) {
              pixelStack.push([px - 1, py]);
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }

        if (px < canvas.width - 1) {
          if (matchStartColor(pixelPos + 4)) {
            if (!reachRight) {
              pixelStack.push([px + 1, py]);
              reachRight = true;
            }
          } else if (reachRight) {
            reachRight = false;
          }
        }

        pixelPos += canvas.width * 4;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }
  // -----------------------------

  setBrushSize(min: number, max: number) {
    this.signaturePad.minWidth = min;
    this.signaturePad.maxWidth = max;
  }

  clear() {
    this.saveHistoryState();
    this.redoHistory = [];
    this.signaturePad.clear();
  }

  saveSketch() {
    if (this.signaturePad.isEmpty()) {
      alert('Disegna qualcosa prima di salvare!');
      return;
    }
    if (!this.wordToDraw) {
      alert('Errore: Nessuna parola assegnata.');
      return;
    }

    const base64Image = this.signaturePad.toDataURL('image/png');

    // Inviamo il disegno al backend per salvarlo nel database
    this.sketchService.createSketch(this.wordToDraw.id, base64Image).subscribe({
      next: (res) => {
        console.log('Disegno salvato con successo sul DB!', res);
        // Ripuliamo la lavagna
        this.clear();
        // Mandiamo l'utente alla galleria 
        this.router.navigate(['/gallery']);
      },
      error: (err) => {
        console.error('Errore durante il salvataggio:', err);
        alert('C\'è stato un errore durante il salvataggio del disegno.');
      }
    });
  }
}