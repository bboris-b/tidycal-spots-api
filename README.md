# TidyCal Dynamic Spots Counter
Sistema real-time per mostrare i posti disponibili alle sessioni di gruppo mensili.

## 📦 Setup Vercel

### 1. Deploy della Serverless Function

**Opzione A - Se hai già un progetto Vercel:**
1. Copia il file `api/tidycal-spots.js` nella cartella `/api` del tuo progetto
2. Fai commit e push su GitHub (o Git provider collegato a Vercel)
3. Vercel farà automaticamente il deploy

**Opzione B - Nuovo progetto Vercel:**
1. Crea una nuova cartella per il progetto
2. Metti dentro la cartella `/api` con il file `tidycal-spots.js`
3. Inizializza git e fai push su GitHub
4. Collega il repo a Vercel (vercel.com/new)

### 2. Configura le Environment Variables su Vercel

1. Vai su **Vercel Dashboard** → Il tuo progetto → **Settings** → **Environment Variables**
2. Aggiungi:
   - **Name:** `TIDYCAL_API_TOKEN`
   - **Value:** `[il tuo token già inserito nel file .env.example]`
   - **Environment:** Production, Preview, Development (seleziona tutti)
3. Clicca **Save**

### 3. Redeploy (se necessario)

Se hai aggiunto le variabili dopo il primo deploy:
- Vai su **Deployments** → Clicca sui tre puntini dell'ultimo deployment → **Redeploy**

### 4. Testa l'API

Una volta deployato, l'endpoint sarà disponibile a:
```
https://TUO-PROGETTO.vercel.app/api/tidycal-spots
```

Aprilo nel browser per vedere se funziona. Dovresti vedere un JSON tipo:
```json
{
  "spotsLeft": 8,
  "eventDate": "2026-03-24T17:00:00.000000Z",
  "isSoldOut": false,
  "maxSpots": 8,
  "bookedCount": 0
}
```

---

## 🎨 Setup Frontend (Figma Make)

### 1. Trova l'HTML del badge "8 spots left"

Nel tuo progetto Figma Make, identifica la struttura HTML del badge. Probabilmente è qualcosa tipo:

```html
<div class="spots-badge">
  <span class="spots-number">8</span>
  <span class="spots-text">spots left</span>
</div>
```

### 2. Aggiungi classi se necessario

Se non ci sono classi CSS, aggiungile per facilitare il targeting:
- `.spots-number` → sul numero "8"
- `.spots-text` → sul testo "spots left"
- `.spots-badge` → sul container

### 3. Inserisci lo script

Apri `frontend-spots-counter.js` e:

**A. Modifica la configurazione all'inizio:**
```javascript
const API_URL = 'https://TUO-PROGETTO.vercel.app/api/tidycal-spots'; // ← Inserisci il tuo URL Vercel

// Modifica questi selettori in base al tuo HTML:
const SPOTS_NUMBER_SELECTOR = '.spots-number'; 
const SPOTS_TEXT_SELECTOR = '.spots-text';
const SPOTS_CONTAINER_SELECTOR = '.spots-badge';
```

**B. Inserisci lo script nel sito:**

In Figma Make, vai nella sezione **Custom Code** o **Before </body> tag** e incolla tutto il contenuto di `frontend-spots-counter.js`.

Oppure hostalo separatamente e includilo con:
```html
<script src="https://tuo-cdn.com/spots-counter.js"></script>
```

### 4. Testa

1. Apri il sito in locale o staging
2. Apri la Console del browser (F12)
3. Dovresti vedere:
   ```
   🚀 TidyCal Spots Counter initialized
   📡 API URL: https://...
   ✅ TidyCal spots updated: {...}
   ```
4. Il numero dovrebbe aggiornarsi automaticamente

---

## 🔧 Personalizzazioni

### Cambiare l'intervallo di refresh

Nel `frontend-spots-counter.js`:
```javascript
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minuti
// Cambia in:
const REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minuti
```

### Cambiare il testo "Sold out"

Nel `frontend-spots-counter.js`, funzione `updateUI()`:
```javascript
spotsContainer.innerHTML = `
  <span style="color: #ff4444; font-weight: 600;">Sold out</span>
`;
// Cambia il testo a piacere
```

### Disabilitare l'animazione del numero

Nel `frontend-spots-counter.js`, funzione `updateUI()`:
```javascript
// Invece di:
animateNumber(spotsNumber, parseInt(spotsNumber.textContent) || 8, data.spotsLeft);

// Usa:
spotsNumber.textContent = data.spotsLeft;
```

---

## 🐛 Troubleshooting

### "CORS error" nella console

- Verifica che la serverless function abbia gli header CORS corretti (già inclusi nel codice)
- Se usi un dominio custom, potrebbe servire configurare `Access-Control-Allow-Origin` specifico

### Il numero non si aggiorna

1. Apri la Console (F12) e cerca errori
2. Verifica che i selettori CSS siano corretti:
   ```javascript
   console.log(document.querySelector('.spots-number')); // deve trovare l'elemento
   ```
3. Testa l'API direttamente nel browser: `https://TUO-PROGETTO.vercel.app/api/tidycal-spots`

### L'API ritorna sempre 8 spots

- Verifica che ci siano effettivamente dei booking su TidyCal per il prossimo evento
- Controlla i log di Vercel: Dashboard → Functions → Logs
- Potrebbe essere un problema di timezone nel confronto delle date

### "Failed to fetch availability"

- Controlla che l'API token di TidyCal sia corretto nelle Environment Variables di Vercel
- Verifica che l'API di TidyCal sia raggiungibile (non ci sono rate limits?)

---

## 📊 Come funziona

```
┌─────────────┐
│  Frontend   │
│  (Figma)    │
└──────┬──────┘
       │ fetch ogni 5 min
       ▼
┌─────────────────────┐
│ Vercel Serverless   │
│ /api/tidycal-spots  │
└──────┬──────────────┘
       │ API calls (autenticate)
       ▼
┌─────────────────────┐
│   TidyCal API       │
│ - booking types     │
│ - bookings list     │
└─────────────────────┘
```

1. La serverless function su Vercel chiama TidyCal API in modo sicuro (API key lato server)
2. Recupera gli eventi futuri e i booking esistenti
3. Calcola i posti disponibili per il prossimo evento
4. Il frontend chiama la serverless function e aggiorna il DOM

---

## ✅ Checklist finale

- [ ] File `api/tidycal-spots.js` deployato su Vercel
- [ ] Environment variable `TIDYCAL_API_TOKEN` configurata
- [ ] API testata e funzionante (aperta nel browser)
- [ ] Script frontend configurato con l'URL corretto
- [ ] Selettori CSS corretti nel frontend script
- [ ] Script inserito nel sito (Custom Code o <script> tag)
- [ ] Testato in browser con Console aperta
- [ ] Numero si aggiorna correttamente

---

## 🚀 Pronto!

Ora il badge "X spots left" si aggiornerà automaticamente ogni 5 minuti con i dati real-time da TidyCal.

Se tutto funziona, dovresti vedere:
- Il numero cambia in base ai booking effettivi
- Quando si riempie → "Sold out"
- Refresh automatico senza ricaricare la pagina
- Animazione smooth del numero quando cambia

Hai domande? Chiedimi pure! 🎯
