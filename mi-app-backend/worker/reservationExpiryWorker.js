import supabase from '../dbConfig.js';
import servicioReservas from '../Servicios/reservasService.js';

const CHECK_INTERVAL_MS = 60 * 1000; // 1 minute

async function findExpiredReservations() {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('reservas')
      .select('id')
      .lte('expires_at', now)
      .eq('estado', 'pendiente');

    if (error) {
      console.error('Error buscando reservas expiradas:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Excepción al buscar reservas expiradas:', err);
    return [];
  }
}

export async function processExpiredReservations() {
  try {
    const expired = await findExpiredReservations();
    if (!expired || expired.length === 0) return;

    console.log(`Worker: Found ${expired.length} expired reservation(s). Releasing stock...`);

    for (const row of expired) {
      const idReserva = row.id;
      try {
        // Reuse existing service to cancel and release stock
        const result = await servicioReservas.cancelarReservaYLiberarStock(idReserva, 'expired');
        if (result && result.success) {
          console.log(`Worker: Reserva ${idReserva} liberada correctamente.`);
        } else {
          console.warn(`Worker: Reserva ${idReserva} no pudo liberarse:`, result);
        }
      } catch (e) {
        console.error(`Worker: Error liberando reserva ${idReserva}:`, e.message || e);
      }
    }
  } catch (err) {
    console.error('Worker: error procesando reservas expiradas:', err);
  }
}

let intervalHandle = null;

export function startReservationExpiryWorker() {
  if (intervalHandle) return; // already running
  // Run immediately, then on interval
  processExpiredReservations();
  intervalHandle = setInterval(processExpiredReservations, CHECK_INTERVAL_MS);
  console.log('Reservation expiry worker started (interval =', CHECK_INTERVAL_MS, 'ms)');
}

export function stopReservationExpiryWorker() {
  if (!intervalHandle) return;
  clearInterval(intervalHandle);
  intervalHandle = null;
  console.log('Reservation expiry worker stopped');
}
