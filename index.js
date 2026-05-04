import express from 'express';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import qrcodeTerminal from 'qrcode-terminal';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const app = express();
app.use(express.json());

const DB_PATH = './db.json';

function readDB() {
  if (!existsSync(DB_PATH)) return {};
  return JSON.parse(readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

app.get('/generate-qr', (req, res) => {
  const { user } = req.query;

  if (!user) {
    return res.status(400).json({ error: 'Parámetro "user" requerido' });
  }

  const db = readDB();

  if (db[user]) {
    return res.status(409).json({ error: `El usuario "${user}" ya tiene un secret registrado` });
  }

  const secret = speakeasy.generateSecret({ length: 20 });
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    label: `app:${user}`,
    issuer: 'brocoly',
    encoding: 'base32'
  });

  db[user] = {
    secret: secret.base32,
    createdAt: new Date().toISOString()
  };
  writeDB(db);

  qrcodeTerminal.generate(otpauthUrl, { small: true }, function (qr) {
    console.log('QR para', user);
    console.log(qr);
  });

  const qrcodeUrl = `${req.protocol}://${req.get('host')}/qr/${encodeURIComponent(user)}`;

  qrcode.toDataURL(otpauthUrl, (err, data_url) => {
    if (err) return res.status(500).json({ error: 'Error generando QR' });
    res.json({ secret: secret.base32, qrcodeUrl, qrcode: data_url });
  });
});

app.get('/qr/:user', (req, res) => {
  const user = decodeURIComponent(req.params.user);
  const db = readDB();

  if (!db[user]) {
    return res.status(404).json({ error: `Usuario "${user}" no encontrado.` });
  }

  const otpauthUrl = speakeasy.otpauthURL({
    secret: db[user].secret,
    label: `app:${user}`,
    issuer: 'brocoly',
    encoding: 'base32'
  });

  qrcode.toBuffer(otpauthUrl, (err, buffer) => {
    if (err) return res.status(500).json({ error: 'Error generando QR' });
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  });
});

app.post('/verify-totp', (req, res) => {
  const { user, token } = req.body;

  if (!user || !token) {
    return res.status(400).json({ error: 'Parámetros "user" y "token" requeridos' });
  }

  if (!/^\d{6}$/.test(token)) {
    return res.status(400).json({ error: 'El token debe ser un número de 6 dígitos' });
  }

  const db = readDB();

  if (!db[user]) {
    return res.status(404).json({ error: `Usuario "${user}" no encontrado. Generar QR primero.` });
  }

  const verified = speakeasy.totp.verify({
    secret: db[user].secret,
    encoding: 'base32',
    token,
    window: 1
  });

  res.status(verified ? 200 : 400).json({ valid: verified });
});


app.listen(3000, () => console.log('Server en port 3000...'));
