# QuickSketch

**QuickSketch** è un'applicazione web interattiva in stile Pictionary sviluppata come progetto per l'esame di **Tecnologie Web (A.A. 2025/2026)** presso l'Università degli Studi di Napoli Federico II.

Il gioco permette agli utenti di mettere alla prova la propria creatività disegnando parole segrete in un tempo limite, e di sfidare la community indovinando i capolavori realizzati dagli altri giocatori.

---

## Funzionalità Principali

- **Sistema di Autenticazione:** Registrazione e Login sicuri con JWT (JSON Web Tokens) e password cifrate con bcrypt.
- **Canvas di Disegno Avanzato:** Strumenti di disegno integrati (penne di vari spessori, colori personalizzati, gomma, secchiello/flood-fill) tramite `signature_pad` e HTML5 Canvas.
- **Modalità Gioco:** - *Draw:* Disegna una parola assegnata casualmente in 60 secondi.
  - *Play:* Indovina le parole nascoste nei disegni degli altri utenti (max 10 tentativi).
- **Galleria e Classifiche:** Esplorazione pubblica dei disegni e classifiche globali dei "Migliori Giocatori" e "Migliori Disegnatori".
- **Profilo Utente:** Statistiche personali (partite vinte, disegni realizzati) e storico dei propri sketch.
- **Design Responsivo:** Interfaccia moderna e reattiva realizzata con Tailwind CSS 4.

---

## Tecnologie Utilizzate

### Frontend
- **Framework:** Angular 21 (Standalone Components)
- **Linguaggio:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Librerie Chiave:** `signature_pad` (gestione Canvas), `rxjs` (programmazione reattiva)

### Backend
- **Ambiente:** Node.js
- **Framework:** Express.js 5
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **Sicurezza:** `jsonwebtoken` (Auth), `bcrypt` (Hashing), `cors`

### Testing
- **E2E Testing:** Playwright (Test automatizzati del flusso UI)

---

## Prerequisiti

Per eseguire il progetto in locale, assicurati di avere installato:
- [Node.js](https://nodejs.org/) (versione 18 o superiore consigliata)
- [PostgreSQL](https://www.postgresql.org/) (in esecuzione sul tuo computer)
- [Angular CLI](https://angular.io/cli) (installabile con `npm install -g @angular/cli`)

---

## ⚙️ Installazione e Avvio

Il progetto è diviso in due cartelle principali: `frontend` e `backend`. Entrambi i server devono essere in esecuzione contemporaneamente.

### 1. Configurazione del Database e Backend

Apri PostgreSQL (es. tramite pgAdmin) e crea un database vuoto chiamato `quicksketch_db`. 
Poi apri un terminale e spostati nella cartella del backend:

    cd backend
    npm install

Crea un file `.env` nella root della cartella `backend` e inserisci le tue credenziali:

    DB_NAME=quicksketch_db
    DB_USER=tuo_username_postgres
    DB_PASSWORD=tua_password_postgres
    DB_HOST=localhost
    DB_PORT=5432
    JWT_SECRET=una_chiave_segreta_molto_sicura
    PORT=3000

Avvia il server backend (Sequelize creerà automaticamente le tabelle nel DB):

    npm run dev

*(Il server sarà in ascolto su http://localhost:3000)*

### 2. Configurazione del Frontend

Apri un **nuovo** terminale e spostati nella cartella del frontend:

    cd frontend
    npm install

Avvia l'applicazione Angular:

    ng serve

*(Il sito sarà accessibile all'indirizzo http://localhost:4200)*

---

## Esecuzione dei Test

### Test End-to-End (Playwright)
I test E2E simulano le azioni di un utente reale all'interno del browser (Registrazione, Login, Disegno, Navigazione) senza alterare il database di produzione grazie al Mocking delle API.
Per avviarli, assicurati che sia il backend che il frontend siano in esecuzione, poi apri un terminale nella cartella `frontend` ed esegui:

    npx playwright test

*(Aggiungi il flag `--headed` al comando per vedere il browser in azione, oppure `--ui` per l'interfaccia di debug).*

---
**Sviluppato da:** [Tuo Nome e Cognome] - Matricola: [Tua Matricola]
