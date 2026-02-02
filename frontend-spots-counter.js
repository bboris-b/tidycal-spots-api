// Frontend Code - Da inserire nel tuo sito Figma Make
// Questo script aggiorna dinamicamente il numero "8 spots left"

(function() {
  // CONFIGURAZIONE
  const API_URL = 'https://YOUR_VERCEL_PROJECT.vercel.app/api/tidycal-spots';
  const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minuti in millisecondi
  
  // Selettori - MODIFICA QUESTI per matchare il tuo HTML
  const SPOTS_NUMBER_SELECTOR = '.spots-number'; // Il numero "8"
  const SPOTS_TEXT_SELECTOR = '.spots-text'; // Il testo "spots left"
  const SPOTS_CONTAINER_SELECTOR = '.spots-badge'; // Il badge/container intero
  
  // Funzione principale che recupera e aggiorna i dati
  async function updateSpotsAvailability() {
    try {
      // Mostra loading state (opzionale)
      const spotsContainer = document.querySelector(SPOTS_CONTAINER_SELECTOR);
      if (spotsContainer) {
        spotsContainer.style.opacity = '0.7';
      }
      
      // Chiamata alla serverless function
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Aggiorna il DOM
      updateUI(data);
      
      // Ripristina opacità
      if (spotsContainer) {
        spotsContainer.style.opacity = '1';
      }
      
      console.log('✅ TidyCal spots updated:', data);
      
    } catch (error) {
      console.error('❌ Error fetching spots availability:', error);
      
      // In caso di errore, mostra il fallback (8 spots)
      updateUI({
        spotsLeft: 8,
        isSoldOut: false
      });
    }
  }
  
  // Funzione che aggiorna l'interfaccia
  function updateUI(data) {
    const spotsNumber = document.querySelector(SPOTS_NUMBER_SELECTOR);
    const spotsText = document.querySelector(SPOTS_TEXT_SELECTOR);
    const spotsContainer = document.querySelector(SPOTS_CONTAINER_SELECTOR);
    
    if (!spotsContainer) {
      console.warn('⚠️ Spots container not found. Check your selector:', SPOTS_CONTAINER_SELECTOR);
      return;
    }
    
    if (data.isSoldOut) {
      // Caso SOLD OUT
      if (spotsContainer) {
        spotsContainer.innerHTML = `
          <span style="color: #ff4444; font-weight: 600;">Sold out</span>
        `;
      }
    } else {
      // Caso con posti disponibili
      if (spotsNumber) {
        // Animazione smooth del numero
        animateNumber(spotsNumber, parseInt(spotsNumber.textContent) || 8, data.spotsLeft);
      }
      
      // Aggiorna anche il testo se necessario (spots left vs spot left)
      if (spotsText && data.spotsLeft === 1) {
        spotsText.textContent = 'spot left';
      } else if (spotsText) {
        spotsText.textContent = 'spots left';
      }
      
      // Cambia colore in base alla disponibilità (opzionale)
      if (spotsContainer) {
        if (data.spotsLeft <= 2) {
          spotsContainer.style.color = '#ff6b6b'; // Rosso per pochi posti
        } else if (data.spotsLeft <= 4) {
          spotsContainer.style.color = '#ffa500'; // Arancione per disponibilità media
        } else {
          spotsContainer.style.color = 'inherit'; // Colore normale
        }
      }
    }
  }
  
  // Animazione smooth del numero
  function animateNumber(element, from, to, duration = 500) {
    const startTime = performance.now();
    const diff = to - from;
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (diff * easeOut));
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }
  
  // Inizializzazione
  function init() {
    // Prima chiamata immediata
    updateSpotsAvailability();
    
    // Refresh automatico ogni X minuti
    setInterval(updateSpotsAvailability, REFRESH_INTERVAL);
    
    console.log('🚀 TidyCal Spots Counter initialized');
    console.log(`📡 API URL: ${API_URL}`);
    console.log(`⏱️  Refresh interval: ${REFRESH_INTERVAL / 1000 / 60} minutes`);
  }
  
  // Avvia quando il DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
