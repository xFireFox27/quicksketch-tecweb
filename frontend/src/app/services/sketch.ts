import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SketchService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getWords(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/words`);
  }

  createSketch(wordId: number, canvasData: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sketches`, {
      wordId: wordId,
      canvasData: canvasData
    });
  }

  getAllSketches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sketches`);
  }

  // Recupera un singolo disegno tramite ID
  getSketchById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sketches/${id}`);
  }

  // Invia il tentativo (guess) al server
  makeGuess(sketchId: string, guess: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sketches/${sketchId}/guess`, {
      guess: guess
    });
  }

  // Recupera lo stato attuale della sessione
  getGameSession(sketchId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sketches/${sketchId}/session`);
  }
}