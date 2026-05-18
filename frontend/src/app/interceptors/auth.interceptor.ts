import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Usiamo inject per recuperare il nostro servizio di autenticazione
    const authService = inject(AuthService);
    const token = authService.getToken();

    // Se c'è un token, cloniamo la richiesta originale e le aggiungiamo l'header
    if (token) {
        const clonedRequest = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(clonedRequest); // Mandiamo avanti la richiesta modificata
    }

    // Se non c'è il token (es. l'utente non è loggato), la mandiamo avanti così com'è
    return next(req);
};