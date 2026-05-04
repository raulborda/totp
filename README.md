
# Servidor de Autenticación TOTP

Servidor API REST con Express para implementar autenticación de dos factores (2FA) usando TOTP (Time-based One-Time Password).

Los usuarios y sus secrets se persisten en un archivo `db.json` local.

## Requisitos previos

* Node.js (versión 14.x o superior)
* npm

## Instalación

```bash
git clone https://github.com/tuusuario/tu-repo-totp.git
cd tu-repo-totp
npm install
node index.js
```

El servidor se ejecutará en `http://localhost:3000`.

## Dependencias

* [express](https://www.npmjs.com/package/express): Framework web para Node.js
* [speakeasy](https://www.npmjs.com/package/speakeasy): Implementación de TOTP/HOTP
* [qrcode](https://www.npmjs.com/package/qrcode): Generador de códigos QR
* [qrcode-terminal](https://www.npmjs.com/package/qrcode-terminal): Muestra el QR en la terminal al generar

## Endpoints

### Generar secret y QR

**`GET /generate-qr?user=<email>`**

Genera un nuevo secret TOTP para el usuario. Falla con 409 si el usuario ya existe en `db.json`.

**Respuesta:**

```json
{
  "secret": "K5BSIYSCPVBVALBWJI2G22ZVMZLVWMCB",
  "qrcodeUrl": "http://localhost:3000/qr/raul%40brocoly.ar",
  "qrcode": "data:image/png;base64,..."
}
```

* `qrcodeUrl`: abrila en el browser para ver el QR directamente y escanearlo con la app autenticadora.
* `qrcode`: imagen en base64, útil para embeber en un frontend.

---

### Ver QR en el browser

**`GET /qr/:user`**

Devuelve el QR como imagen PNG. Usá la `qrcodeUrl` del endpoint anterior para acceder.

```
http://localhost:3000/qr/raul%40brocoly.ar
```

---

### Verificar un token TOTP

**`POST /verify-totp`**

Verifica si el token ingresado por el usuario es válido.

**Body:**

```json
{
  "user": "raul@brocoly.ar",
  "token": "123456"
}
```

**Respuestas:**

```json
{ "valid": true }   // 200 OK
{ "valid": false }  // 400 Bad Request
```

El token debe ser un número de 6 dígitos. La verificación tolera ±30 segundos de desfase de reloj (`window: 1`).

---

## Flujo de uso

1. Llamar a `GET /generate-qr?user=raul@brocoly.ar`
2. Abrir la `qrcodeUrl` en el browser y escanear el QR con Google Authenticator, Authy, etc.
3. Verificar con `POST /verify-totp` usando el código que muestra la app.

## Notas

* `db.json` está en `.gitignore` — contiene secrets TOTP y no debe subirse al repo.
* Esta implementación es para desarrollo/prototipo. Para producción, reemplazar `db.json` por una base de datos con los secrets cifrados.
