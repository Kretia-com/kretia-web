# Kretia — Web (landing + captura de leads)

Landing de Kretia servida por un pequeño servidor Node/Express. El botón
**"Solicitar análisis"** abre un formulario que envía el lead al servidor:
queda registrado en los logs y, si configuras SMTP, te llega también por email.

```
deploy/
├── server.js          ← servidor Express (sirve la web + POST /api/lead)
├── package.json       ← dependencias y script de arranque
├── public/
│   └── index.html     ← la landing (versión v4, productivizada)
├── .env.example       ← variables para el email (opcional)
└── .gitignore
```

---

## Opción A — Desplegar con GitHub (recomendado)

1. Sube la carpeta `deploy/` a un repositorio de GitHub (puede ser la raíz del repo).
2. Entra en [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. Elige el repo. Railway detecta Node automáticamente (Nixpacks), instala las
   dependencias y ejecuta `npm start`. No hace falta configurar nada más.
4. En la pestaña **Settings → Networking → Generate Domain** obtienes tu URL
   pública (`algo.up.railway.app`).
5. Cada vez que hagas *push* a GitHub, Railway redepliega solo.

## Opción B — Desplegar con la CLI de Railway (sin GitHub)

```bash
npm i -g @railway/cli      # instala la CLI
cd deploy
railway login
railway init               # crea el proyecto
railway up                 # sube y despliega esta carpeta
railway domain             # genera la URL pública
```

---

## Probarlo en tu ordenador antes de subir

```bash
cd deploy
npm install
npm start
# abre http://localhost:3000
```

Rellena el formulario: verás el lead aparecer en la terminal con el prefijo `[LEAD]`.

---

## Recibir los leads por email (opcional)

Por defecto los leads se guardan en los **logs** (pestaña *Deployments → View Logs*
en Railway) y en `data/leads.jsonl`. Para que además te lleguen por correo,
añade estas **Variables** en Railway (*Settings → Variables*):

| Variable      | Ejemplo                       | Qué es                          |
|---------------|-------------------------------|---------------------------------|
| `SMTP_HOST`   | `smtp.gmail.com`              | Servidor SMTP de tu proveedor   |
| `SMTP_PORT`   | `587`                         | Puerto (587 normal, 465 SSL)    |
| `SMTP_SECURE` | `false`                       | `true` solo si usas el 465      |
| `SMTP_USER`   | `tucorreo@gmail.com`          | Usuario SMTP                    |
| `SMTP_PASS`   | `xxxx xxxx xxxx xxxx`         | Contraseña de aplicación        |
| `LEAD_TO`     | `hola@kretia.com`             | A dónde llegan los leads        |

> **Gmail:** usa una *contraseña de aplicación* (no tu contraseña normal).
> Cuentas Google → Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones.
> Alternativas sin líos de SMTP: Resend, Postmark, Brevo, Mailgun.

---

## Notas importantes

- **El disco de Railway es efímero:** `data/leads.jsonl` se borra en cada
  redespliegue. Por eso los leads se registran también en los logs. Para
  persistencia real, configura el email (arriba) o conecta una base de datos
  (Railway ofrece PostgreSQL en un clic — puedo ayudarte a cablearlo si quieres).
- **Dominio propio:** en *Settings → Networking → Custom Domain* añades
  `kretia.com` y Railway te da el registro CNAME que debes poner en tu proveedor
  de dominio.
- **Las fuentes** se cargan desde Google Fonts (CDN). Si quieres que la web
  funcione 100% sin dependencias externas, puedo dejártelas autoalojadas.
