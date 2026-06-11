// Kretia — servidor de la landing + captura de leads
// Sirve /public y expone POST /api/lead. Si configuras SMTP por variables
// de entorno, además te envía cada lead por email. Siempre los registra en
// los logs (visibles en Railway) y, si hay disco, los anexa a data/leads.jsonl.

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, appendFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '32kb' }));
app.use(express.static(join(__dirname, 'public'), { extensions: ['html'] }));

// --- almacenamiento sencillo en disco (efímero en Railway, pero útil) ---
const DATA_DIR = join(__dirname, 'data');
try { mkdirSync(DATA_DIR, { recursive: true }); } catch (_) {}

function storeLead(lead) {
  const line = JSON.stringify(lead) + '\n';
  try { appendFileSync(join(DATA_DIR, 'leads.jsonl'), line); } catch (_) {}
  // log siempre — así el lead queda en los logs de Railway aunque el disco se reinicie
  console.log('[LEAD]', line.trim());
}

// --- email opcional vía SMTP (nodemailer) ---
let transporter = null;
async function getTransporter() {
  if (transporter !== null) return transporter;
  if (!process.env.SMTP_HOST) { transporter = false; return false; }
  const nodemailer = await import('nodemailer');
  transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  return transporter;
}

async function emailLead(lead) {
  const t = await getTransporter();
  if (!t) return;
  const to = process.env.LEAD_TO || process.env.SMTP_USER;
  const from = process.env.LEAD_FROM || process.env.SMTP_USER;
  const text =
    `Nuevo análisis solicitado desde la web:\n\n` +
    `Nombre:   ${lead.name}\n` +
    `Empresa:  ${lead.company}\n` +
    `Email:    ${lead.email}\n` +
    `Equipo:   ${lead.teamSize || '—'}\n` +
    `Mensaje:  ${lead.message || '—'}\n\n` +
    `Recibido: ${lead.ts}\n`;
  await t.sendMail({
    to, from,
    replyTo: lead.email,
    subject: `Kretia · nuevo lead: ${lead.company}`,
    text
  });
}

// --- endpoint de captura ---
app.post('/api/lead', async (req, res) => {
  const b = req.body || {};
  const name = String(b.name || '').trim();
  const company = String(b.company || '').trim();
  const email = String(b.email || '').trim();

  if (!name || !company || !email) {
    return res.status(400).json({ ok: false, error: 'missing_fields' });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'bad_email' });
  }

  const lead = {
    name, company, email,
    teamSize: String(b.teamSize || '').trim(),
    message: String(b.message || '').slice(0, 2000).trim(),
    page: String(b.page || '').slice(0, 200),
    ua: String(req.headers['user-agent'] || '').slice(0, 200),
    ts: new Date().toISOString()
  };

  storeLead(lead);
  try { await emailLead(lead); } catch (err) { console.error('[EMAIL ERROR]', err.message); }

  res.json({ ok: true });
});

// healthcheck para Railway
app.get('/healthz', (_req, res) => res.type('text').send('ok'));

app.listen(PORT, () => console.log(`Kretia web escuchando en :${PORT}`));
