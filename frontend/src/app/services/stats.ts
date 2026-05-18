import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserStats {
  drawingsProduced: number;
  wordsGuessed: number;
  wordsNotGuessed: number;
  totalAttemptsUsed: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = `${environment.apiUrl}/stats`;

  constructor(private http: HttpClient) {}

  getMyStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/me`);
  }
}
