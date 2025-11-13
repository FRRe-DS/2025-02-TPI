import express from 'express';
import { requiredScopes } from 'express-oauth2-jwt-bearer';
import { processExpiredReservations } from '../worker/reservationExpiryWorker.js';

const router = express.Router();

// Trigger an immediate scan for expired reservations (protected)
router.post('/scan-expired', requiredScopes('reservas:write'), async (req, res) => {
  try {
    await processExpiredReservations();
    return res.status(200).json({ ok: true, message: 'Scan triggered' });
  } catch (err) {
    console.error('Admin scan failed:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
