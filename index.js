import express from 'express';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import qrcodeTerminal from 'qrcode-terminal';

const app = express();
app.use(express.json());

let secret; 

app.get('/generate-qr', (req, res) => {
  secret = speakeasy.generateSecret({ length: 20 });
  //console.log("secret: ", secret);
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    label: 'app:raul@brocoly.ar', 
    issuer: 'brocoly', 
    encoding: 'base32'
  });
  console.log("otpauthUrl: ", otpauthUrl)
  
  //TODO: Guardar secret en BD
  
  qrcodeTerminal.generate(otpauthUrl, { small: true }, function (qrcode) {
    console.log('QR');
    console.log(qrcode);
  });

  qrcode.toDataURL(otpauthUrl, (err, data_url) => {
    if (err) {
      res.status(500).json({ error: 'Error generando QR' });
    } else {
      res.json({ secret: secret.base32, qrcode: data_url });
    }
  });
});

app.post('/verify-totp', (req, res) => {
  const { token } = req.body;

  if (!secret) {
    return res.status(400).send('Secret no definido. Generar QR primero.');
  }

  const verified = speakeasy.totp.verify({
    secret: secret.base32,
    encoding: 'base32',
    token: token
  });

  if (verified) {
    res.send('🤙🏼🤙🏼🤙🏼🤙🏼');
  } else {
    res.status(400).send('👎🏼👎🏼👎🏼👎🏼');
  }
});

//Ojo aqui... estoy generando un TOTP con las variables de secret que estan en memoria.
app.get('/generate-totp', (req, res) => {
    if (!secret) {
      return res.status(400).send('Secret no definido. Generar QR primero.');
    }
    const token = speakeasy.totp({ secret: secret.base32, encoding: 'base32' });
    res.json({ token });
  });

app.listen(3000, () => console.log('Server en port 3000...'));
