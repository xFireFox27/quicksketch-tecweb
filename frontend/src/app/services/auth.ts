import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  // Metodo per il Login
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        // Se il login va a buon fine, salviamo il token JWT
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
      })
    );
  }

  // Metodo per la Registrazione
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Controlla se l'utente è loggato (se ha un token)
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Recupera l'username dal payload del token JWT
  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      const parsed = JSON.parse(decoded);
      return parsed.username || null;
    } catch (e) {
      return null;
    }
  }

  // Metodo per fare Logout
  logout(): void {
    localStorage.removeItem('token');
  }

  // Recupera il token salvato
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}