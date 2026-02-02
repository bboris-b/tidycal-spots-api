// Vercel Serverless Function - TidyCal Spots Counter
// Deploy this in your Vercel project under /api/tidycal-spots.js

const TIDYCAL_API_TOKEN = process.env.TIDYCAL_API_TOKEN;
const BOOKING_TYPE_ID = '1728359';
const MAX_SPOTS = 8;

export default async function handler(req, res) {
  // CORS headers per permettere chiamate dal tuo sito
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Step 1: Recupera info sul booking type dall'endpoint pubblico della pagina
    const publicPageResponse = await fetch(
      `https://tidycal.com/benbugli/office-hours-group-session?json`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!publicPageResponse.ok) {
      throw new Error(`TidyCal public page error: ${publicPageResponse.status}`);
    }

    const bookingTypeData = await publicPageResponse.json();
    
    // Step 2: Trova il prossimo evento futuro
    const now = new Date();
    const futureWindows = bookingTypeData.bookingType.booking_type_windows
      .filter(window => new Date(window.start_at) > now)
      .sort((a, b) => new Date(a.start_at) - new Date(b.start_at));

    if (futureWindows.length === 0) {
      return res.status(200).json({
        spotsLeft: 0,
        eventDate: null,
        isSoldOut: true,
        message: 'No upcoming events',
      });
    }

    const nextEvent = futureWindows[0];
    const nextEventDate = new Date(nextEvent.start_at);

    // Step 3: Recupera tutti i bookings per questo booking type
    const bookingsResponse = await fetch(
      `https://tidycal.com/api/bookings?booking_type_id=${BOOKING_TYPE_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${TIDYCAL_API_TOKEN}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!bookingsResponse.ok) {
      throw new Error(`TidyCal Bookings API error: ${bookingsResponse.status}`);
    }

    const bookingsData = await bookingsResponse.json();

    // Step 4: Conta i bookings per il prossimo evento
    // Filtra i bookings che corrispondono alla data del prossimo evento
    const bookingsForNextEvent = bookingsData.data.filter(booking => {
      const bookingDate = new Date(booking.start_at);
      
      // Confronta anno, mese, giorno, ora e minuto
      return (
        bookingDate.getUTCFullYear() === nextEventDate.getUTCFullYear() &&
        bookingDate.getUTCMonth() === nextEventDate.getUTCMonth() &&
        bookingDate.getUTCDate() === nextEventDate.getUTCDate() &&
        bookingDate.getUTCHours() === nextEventDate.getUTCHours() &&
        bookingDate.getUTCMinutes() === nextEventDate.getUTCMinutes() &&
        booking.status !== 'cancelled' // Escludi i booking cancellati
      );
    });

    const bookedCount = bookingsForNextEvent.length;
    const spotsLeft = Math.max(0, MAX_SPOTS - bookedCount);
    const isSoldOut = spotsLeft === 0;

    // Step 5: Restituisci il risultato
    return res.status(200).json({
      spotsLeft,
      eventDate: nextEvent.start_at,
      isSoldOut,
      maxSpots: MAX_SPOTS,
      bookedCount,
      nextEventFormatted: nextEventDate.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Rome'
      })
    });

  } catch (error) {
    console.error('Error fetching TidyCal data:', error);
    
    return res.status(500).json({
      error: 'Failed to fetch availability',
      message: error.message,
      // Fallback graceful
      spotsLeft: 8,
      isSoldOut: false,
    });
  }
}
