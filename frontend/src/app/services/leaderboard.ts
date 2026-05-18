import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = 'http://localhost:3000/api/leaderboards';

  constructor(private http: HttpClient) {}

  getBestPlayers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/players`);
  }

  getBestArtists(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/artists`);
  }
}
