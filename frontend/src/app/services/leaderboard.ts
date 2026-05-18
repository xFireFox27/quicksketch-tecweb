import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private apiUrl = `${environment.apiUrl}/leaderboards`;

  constructor(private http: HttpClient) {}

  getBestPlayers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/players`);
  }

  getBestArtists(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/artists`);
  }
}
