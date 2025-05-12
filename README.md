# Servidor de Autenticación TOTP

Este repositorio contiene un servidor simple para implementar autenticación de dos factores (2FA) usando TOTP (Time-based One-Time Password).

## Descripción

Este proyecto implementa un servidor API REST con Express que permite:

* Generar secretos TOTP y códigos QR para configurar aplicaciones autenticadoras
* Verificar tokens TOTP proporcionados por el usuario
* Generar tokens TOTP para pruebas

El sistema utiliza el estándar TOTP, compatible con aplicaciones autenticadoras como **Google Authenticator, Microsoft Authenticator, Authy**, entre otras.

## Instalación

1. Clonar este repositorio:
   ```bash
   git clone https://github.com/tuusuario/tu-repo-totp.git
   cd tu-repo-totp
   ```
2. Instalar las dependencias:
   ```bash
   npm install
   ```
3. Iniciar el servidor:
   ```bash
   node index.js
   ```

El servidor se ejecutará en `http://localhost:3000`.

## Dependencias

* [express](https://www.npmjs.com/package/express): Framework web rápido para servidores web en Node.js
* [speakeasy](https://www.npmjs.com/package/speakeasy): Implementación de TOTP y HOTP para autenticación de dos factores
* [qrcode](https://www.npmjs.com/package/qrcode): Generador de códigos QR
* [qrcode-terminal](https://www.npmjs.com/package/qrcode-terminal): Muestra códigos QR en la terminal

## Uso

### Generar un código QR y secreto TOTP

```bash
GET http://localhost:3000/generate-qr
```

Respuesta:

```json
{
  "secret": "BASE32SECRETKEY",
  "qrcode": "data:image/png;base64,..."
}
```

Al ejecutar este endpoint:

* Se genera un nuevo secreto TOTP y una URL otpauth
* Se muestra un código QR en la terminal
* Se devuelve el secreto en formato **BASE32** y un código QR en formato data URL

Usa la aplicación autenticadora de tu preferencia para escanear el código QR o ingresa el secreto manualmente.

### Verificar un token TOTP

```bash
POST http://localhost:3000/verify-totp
Headers "Content-Type: application/json" 
BODY '{"token":"123456"}' 
```

Respuestas posibles:

* `🤙🏼🤙🏼🤙🏼🤙🏼` (200 OK): El token es válido
* `👎🏼👎🏼👎🏼👎🏼` (400 Bad Request): El token es inválido
* `Secret no definido. Generar QR primero.` (400 Bad Request): No se ha generado un secreto todavía

### Generar un token TOTP (para pruebas)

```bash
GET http://localhost:3000/generate-totp
```

Respuesta:

```json
{
  "token": "123456"
}
```

Esta funcionalidad es útil para pruebas, ya que genera el token actual que debería coincidir con lo que muestra nuestra aplicación autenticadora.

## Notas importantes

* **SOLO PARA DESARROLLO** : Esta implementación almacena el secreto en memoria y no es persistente. Para un entorno de producción, deberiamos almacenar los secretos en una base de datos segura.
* El código incluye un TODO para recordar implementar el almacenamiento del secreto en una base de datos.
* Los secretos generados tienen una longitud de 20 bytes para mayor seguridad.
* La URL de otpauth utiliza valores predeterminados (`app:johndoe@gmail.com` como etiqueta y `empresa` como emisor) que deberías personalizar según tu código....

## Seguridad

Para un entorno de producción, consideramos estas mejoras:

1. Implementar persistencia segura de los secretos (**base de datos cifrada**)
2. Usar HTTPS para todas las comunicaciones
3. Implementar limitación de intentos para prevenir ataques de fuerza bruta
4. Personalizar los valores de etiqueta y emisor según tu aplicación
5. Implementar un manejo adecuado de errores y registro de eventos

## Licencia

RauloCoin
