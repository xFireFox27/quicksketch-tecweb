import { test, expect, Page } from '@playwright/test';

// Piccolo helper per simulare un login direttamente dal frontend.
// Il servizio auth.ts legge l'username dal JWT, quindi ci basta salvare un token finto ma ben formato.
async function fastLoginOnlyFrontend(page: Page) {
  await page.goto('http://localhost:4200/');
  await page.evaluate(() => {
    const fakeToken = "header.eyJ1c2VybmFtZSI6InRlc3R1c2VyIn0=.signature";
    // auth.ts cerca il token nel localStorage con questa chiave.
    localStorage.setItem('token', fakeToken);
  });
}

test.describe('QuickSketch - Test E2E', () => {

  // Test accessibili senza autenticazione.

  test('1. La Homepage mostra i testi e i link corretti', async ({ page }) => {
    await page.goto('http://localhost:4200/');
    
    // Verifichiamo il titolo principale.
    await expect(page.getByRole('heading', { name: /Disegna, Indovina e/i })).toBeVisible();
    
    // E i link principali presenti in home.html.
    await expect(page.getByRole('link', { name: 'Inizia a Disegnare' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Esplora la Galleria' })).toBeVisible();
  });

  test('2. Visualizzazione Galleria', async ({ page }) => {
    await page.goto('http://localhost:4200/gallery');
    // Testo atteso dalla pagina gallery.
    await expect(page.getByRole('heading', { name: 'Galleria della Community' })).toBeVisible();
  });

  test('3. Visualizzazione Classifiche', async ({ page }) => {
    await page.goto('http://localhost:4200/leaderboard');
    // Titoli che ci aspettiamo nella leaderboard.
    await expect(page.getByRole('heading', { name: 'Classifiche Globali 🏆' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '🎯 Migliori Giocatori' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '🎨 Migliori Disegnatori' })).toBeVisible();
  });

  // Test di autenticazione con backend mockato, così non tocchiamo il DB.

  test('4. Registrazione utente (Mock backend)', async ({ page }) => {
    // Simuliamo la risposta del register.
    await page.route('**/auth/register', route => 
      route.fulfill({ status: 201 })
    );

    await page.goto('http://localhost:4200/register');
    
    // Compiliamo il form usando gli id definiti nel template.
    await page.locator('#username').fill('NuovoUtente');
    await page.locator('#password').fill('PasswordSicura123!');
    
    // Poi premiamo il pulsante di registrazione.
    await page.getByRole('button', { name: 'Registrati' }).click();
  });

  test('5. Login con successo (Mock backend)', async ({ page }) => {
    // Intercettiamo la chiamata di login.
    await page.route('http://localhost:3000/**/login', async route => { 
      if (route.request().method() === 'OPTIONS') {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        contentType: 'application/json',
        // Il token finto contiene l'username "testuser".
        body: JSON.stringify({ token: 'header.eyJ1c2VybmFtZSI6InRlc3R1c2VyIn0=.signature' })
      });
    });

    await page.goto('http://localhost:4200/login');
    
    // Inseriamo credenziali valide.
    await page.locator('#username').fill('testuser');
    await page.locator('#password').fill('PasswordSicura123!');
    
    // Il pulsante deve essere attivo prima del click.
    const loginBtn = page.getByRole('button', { name: 'Accedi' });
    await expect(loginBtn).toBeEnabled();
    await loginBtn.click();

    // Dopo il login la navbar deve mostrare l'utente.
    await expect(page.getByText('Profilo (testuser)')).toBeVisible({ timeout: 10000 });
  });

  test('6. Funzionalità Mostra/Nascondi Password', async ({ page }) => {
    // Verifichiamo che il toggle della password funzioni davvero.
    await page.goto('http://localhost:4200/login');
    
    const pwdInput = page.locator('#password');
    await pwdInput.fill('MiaPasswordSegreta');
    
    // All'inizio la password deve restare nascosta.
    await expect(pwdInput).toHaveAttribute('type', 'password');
    
    // Mostriamo il contenuto.
    await page.getByRole('button', { name: 'Mostra' }).click();
    
    // Ora il campo deve essere in chiaro.
    await expect(pwdInput).toHaveAttribute('type', 'text');
    
    // E poi lo rimettiamo nascosto.
    await page.getByRole('button', { name: 'Nascondi' }).click();
    await expect(pwdInput).toHaveAttribute('type', 'password');
  });

  test('7. AuthGuard protegge la pagina di disegno', async ({ page }) => {
    // Senza token, l'accesso a /draw deve restare bloccato.
    await page.goto('http://localhost:4200/draw');
    
    // Quindi il titolo della pagina non deve comparire.
    await expect(page.getByRole('heading', { name: 'Crea il tuo Sketch' })).not.toBeVisible();
  });

  // Test che richiedono un utente già autenticato.

  test('8. Rendering pagina Draw (Solo per loggati)', async ({ page }) => {
    await fastLoginOnlyFrontend(page);
    
    await page.goto('http://localhost:4200/draw');
    // La pagina draw deve caricarsi correttamente.
    await expect(page.getByRole('heading', { name: 'Crea il tuo Sketch' })).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('9. Salvataggio del disegno (Mock backend)', async ({ page }) => {
    await fastLoginOnlyFrontend(page);
    
    // Simuliamo il salvataggio dello sketch.
    await page.route('**/sketches', route => 
      route.fulfill({ status: 201 })
    );

    await page.goto('http://localhost:4200/draw');
    
    const canvas = page.locator('canvas');
    await canvas.click({ position: { x: 50, y: 50 } });
    
    // Poi premiamo il pulsante di pubblicazione.
    await page.getByRole('button', { name: 'Pubblica' }).click();
  });

  test('10. Menu Mobile', async ({ page }) => {
    // Simuliamo uno schermo da telefono.
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:4200/');
    
    // Apriamo il menu della navbar.
    const mobileMenuButton = page.locator('button.focus\\:outline-none');
    await mobileMenuButton.click();
    
    // Il menu mobile deve mostrare almeno il link Galleria.
    const mobileGalleryLink = page.locator('.md\\:hidden a', { hasText: 'Galleria' }).first();
    await expect(mobileGalleryLink).toBeVisible();
  });

});