# Spec: formulario de contacto con relay de correo (Astro)

Spec portable para reimplementar en otro proyecto Astro el mismo flujo de
contacto que corre en `paudelgadoiglesias.uy`: formulario progresivo con HTMX,
endpoint server-side propio y reenvío a un **relay de correo externo** cuya URL
vive en una variable de entorno.

Origen de referencia en este repo: `src/lib/contact.ts`, `src/worker.ts`,
`src/components/ContactForm.astro`, `src/scripts/app.ts`.

---

## 1. Objetivo y principio de diseño

- El navegador **nunca** habla con el relay ni conoce la API key. Postea a un
  endpoint del propio sitio (`/api/contacto`), y ese endpoint —server-side—
  llama al relay.
- El servidor es la **fuente de verdad**: responde con un fragmento HTML que
  reemplaza el formulario (éxito o error). HTMX solo hace el swap.
- Funciona **sin JavaScript**: el `<form>` tiene `method="post"` y `action`
  reales; HTMX es progressive enhancement.
- La URL del relay es configuración, no código: `MAIL_API_URL`.

---

## 2. Variables de entorno

Todas son **server-side**. Ninguna lleva prefijo `PUBLIC_`: si lo llevara,
Astro las inlinearía en el bundle del cliente y filtraría la API key.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `MAIL_API_URL` | sí | URL del endpoint del relay (ej. `https://relay.example.com/send.php`). |
| `MAIL_API_KEY` | sí | Clave que el relay valida. Secreto. |
| `MAIL_CONTACT_TO` | sí | Casilla destino de los mensajes. |
| `MAIL_FROM_NAME` | no | Nombre del remitente; default `"Sitio"`. |
| `MAIL_SUBJECT` | no | Asunto; default `"Consulta desde Formulario de contacto"`. |

`.env` local (no versionado):

```dotenv
MAIL_API_URL=https://relay.example.com/send.php
MAIL_API_KEY=xxxxxxxxxxxx
MAIL_CONTACT_TO=hola@ejemplo.com
MAIL_FROM_NAME=Mi Estudio
```

Reglas:

- `.env` en `.gitignore`. Versionar un `.env.example` con las claves vacías.
- En producción se cargan como **secrets del runtime**, no como archivo:
  - Cloudflare Workers: `wrangler secret put MAIL_API_URL` (ídem `MAIL_API_KEY`,
    `MAIL_CONTACT_TO`). `MAIL_FROM_NAME` puede ir en `vars` de `wrangler.jsonc`.
  - Vercel / Netlify / Node: variables de entorno del proyecto.
- Si falta alguna de las tres obligatorias, el endpoint responde 422 con
  `"El correo de contacto no está configurado."` y **no** intenta el envío.
  Nunca se filtra en la respuesta cuál variable falta.

---

## 3. Contrato del relay

El relay recibe `multipart/form-data` por `POST` a `MAIL_API_URL`, con estos
campos:

| Campo | Valor |
|---|---|
| `api_key` | `MAIL_API_KEY` |
| `email_target` | `MAIL_CONTACT_TO` |
| `from_name` | `MAIL_FROM_NAME` |
| `subject` | `MAIL_SUBJECT` |
| `name` | nombre ingresado |
| `email` | contacto ingresado; si viene vacío, `MAIL_CONTACT_TO` |
| `message` | mensaje ingresado; si viene vacío, `"(sin mensaje)"` |

Éxito = **HTTP 200**. Cualquier otro status se trata como fallo. El body de la
respuesta se loguea truncado a 200 caracteres y nunca se muestra al usuario.
Timeout de la llamada: **10 s** vía `AbortController`.

---

## 4. Contrato del endpoint propio

`POST /api/contacto`, `Content-Type: multipart/form-data` o
`application/x-www-form-urlencoded`.

Campos del formulario: `nombre` (requerido, ≤400), `contacto` (opcional, ≤400),
`mensaje` (opcional, ≤2000), `website_url` (honeypot, debe venir vacío).

Respuestas — siempre `text/html; charset=utf-8`, `Cache-Control: no-store`,
`X-Content-Type-Options: nosniff`:

| Caso | Status | Body |
|---|---|---|
| Envío correcto | 200 | fragmento de éxito |
| Honeypot lleno | 200 | fragmento de éxito (se descarta en silencio) |
| Formulario ilegible | 422 | form + error |
| Origin/Referer de otro host | 422 | form + error |
| Rate limit superado | 422 | form + error |
| `nombre` vacío | 422 | form + error + valores repoblados |
| Config incompleta | 422 | form + error + valores repoblados |
| Relay falló o timeout | 422 | form + error + valores repoblados |
| Método ≠ POST | 405 | `Method not allowed` + `Allow: POST` |

Se usa **422 y no 500** para todos los errores de negocio, porque HTMX debe
poder swapear el fragmento (ver §7).

---

## 5. Controles anti-abuso

1. **Honeypot**: cualquier campo cuyo nombre empiece con `website_` y llegue no
   vacío ⇒ se responde 200 de éxito sin enviar nada. El bot cree que funcionó.
   El campo se marca `aria-hidden="true"`, `tabindex="-1"`,
   `autocomplete="off"` y se oculta por CSS (`.site-form__honeypot`).
2. **Same-origin**: si hay `Origin` o `Referer`, su host debe coincidir con el
   host de la request. Si no hay ninguno de los dos, se permite (clientes sin
   JS legítimos).
3. **Rate limit en memoria**: máximo **5 intentos por IP cada 15 minutos**. IP
   tomada de `cf-connecting-ip`, si no del primer valor de `x-forwarded-for`,
   si no del `clientAddress` del runtime, si no `"unknown"`.
   Limitación conocida: el `Map` es por instancia/isolate, así que es una
   barrera de fricción, no una garantía. Si se necesita algo estricto, mover a
   KV/Durable Object/Redis manteniendo la misma interfaz.
4. **Truncado** de todos los campos antes de usarlos.
5. **Escapado** de `&`, `<`, `>` (y `"` en atributos) al repoblar el HTML.

---

## 6. Módulo compartido `src/lib/contact.ts`

Independiente del framework: recibe una `Request` y un objeto de entorno,
devuelve una `Response`. Igual sirve para un Worker, un endpoint de Astro o un
handler de Node.

```ts
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const REQUEST_TIMEOUT_MS = 10_000;
const attempts = new Map<string, number[]>();

export interface ContactEnvironment {
  MAIL_API_URL?: string;
  MAIL_API_KEY?: string;
  MAIL_CONTACT_TO?: string;
  MAIL_FROM_NAME?: string;
  MAIL_SUBJECT?: string;
}

interface ContactOptions {
  environment: ContactEnvironment;
  clientAddress?: string;
}

export async function handleContactRequest(
  request: Request,
  options: ContactOptions,
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) return formResponse('No se pudo leer el formulario.', 422);

  if (honeypotTriggered(formData)) return formResponse(null, 200, true);

  if (!sameOrigin(request)) {
    return formResponse('El origen de la solicitud no es válido.', 422);
  }

  const ip = clientIp(request, options.clientAddress);
  if (isRateLimited(ip)) {
    return formResponse('Hay demasiados envíos. Probá de nuevo en unos minutos.', 422);
  }

  const values = {
    name: str(formData.get('nombre')).slice(0, 400),
    contact: str(formData.get('contacto')).slice(0, 400),
    message: str(formData.get('mensaje')).slice(0, 2000),
  };

  if (!values.name) {
    return formResponse('El nombre es obligatorio.', 422, false, values);
  }

  const environment = options.environment;
  if (!environment.MAIL_API_URL || !environment.MAIL_API_KEY || !environment.MAIL_CONTACT_TO) {
    return formResponse('El correo de contacto no está configurado.', 422, false, values);
  }

  try {
    await sendContactMessage(values, environment);
  } catch {
    return formResponse('No se pudo enviar el mensaje. Probá de nuevo más tarde.', 422, false, values);
  }

  return formResponse(null, 200, true);
}

async function sendContactMessage(
  input: { name: string; contact: string; message: string },
  environment: ContactEnvironment,
): Promise<void> {
  const { MAIL_API_URL: apiUrl, MAIL_API_KEY: apiKey, MAIL_CONTACT_TO: to } = environment;
  if (!to || !apiKey || !apiUrl) throw new Error('Relay de correo incompleto');

  const formData = new FormData();
  formData.append('api_key', apiKey);
  formData.append('email_target', to);
  formData.append('from_name', environment.MAIL_FROM_NAME || 'Sitio');
  formData.append('subject', environment.MAIL_SUBJECT || 'Consulta desde Formulario de contacto');
  formData.append('name', input.name);
  formData.append('email', input.contact || to);
  formData.append('message', input.message || '(sin mensaje)');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    const body = await response.text().catch(() => '');
    if (response.status !== 200) {
      console.error(`[contacto] relay HTTP ${response.status}`, body.slice(0, 200));
      throw new Error(`El relay respondió ${response.status}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

function formResponse(
  error: string | null,
  status: number,
  success = false,
  values?: { name: string; contact: string; message: string },
): Response {
  return new Response(renderContactForm({ error, success, values }), {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function renderContactForm(state: {
  error: string | null;
  success: boolean;
  values?: { name: string; contact: string; message: string };
}): string {
  if (state.success) {
    return '<div id="contacto-form"><p class="site-form__status" role="status">Mensaje enviado.</p></div>';
  }

  const name = escapeAttr(state.values?.name ?? '');
  const contact = escapeAttr(state.values?.contact ?? '');
  const message = escapeHtml(state.values?.message ?? '');
  const error = state.error
    ? `<p class="site-form__status" role="alert">${escapeHtml(state.error)}</p>`
    : '';

  return `<div id="contacto-form">
<form class="site-form" method="post" action="/api/contacto" hx-post="/api/contacto" hx-target="#contacto-form" hx-swap="outerHTML">
<label class="site-form__honeypot" aria-hidden="true">Sitio web<input type="text" name="website_url" tabindex="-1" autocomplete="off"></label>
<input type="text" name="nombre" maxlength="400" required placeholder="Nombre" aria-label="Nombre" value="${name}">
<input type="text" name="contacto" maxlength="400" placeholder="Contacto" aria-label="Contacto" value="${contact}">
<textarea name="mensaje" maxlength="2000" rows="1" placeholder="Mensaje" aria-label="Mensaje">${message}</textarea>
<button type="submit">Enviar</button>
${error}
</form>
</div>`;
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin') || request.headers.get('referer');
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(ip, recent);
    return true;
  }
  recent.push(now);
  attempts.set(ip, recent);
  return false;
}

function honeypotTriggered(formData: FormData): boolean {
  for (const [name, value] of formData.entries()) {
    if (name.startsWith('website_') && typeof value === 'string' && value !== '') return true;
  }
  return false;
}

function clientIp(request: Request, clientAddress?: string): string {
  const headers = request.headers;
  return (
    headers.get('cf-connecting-ip')
    ?? headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? clientAddress
    ?? 'unknown'
  );
}

function str(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/"/g, '&quot;');
}
```

> El fragmento de `renderContactForm` debe quedar **idéntico** al markup del
> componente `.astro` (§8). Si se toca uno, se toca el otro.

---

## 7. Montaje del endpoint

Elegir **una** de las dos variantes según cómo despliegue el proyecto destino.

### A. Sitio estático + Cloudflare Workers (el caso de este repo)

`src/worker.ts`:

```ts
import { handleContactRequest, type ContactEnvironment } from './lib/contact';

interface WorkerEnvironment extends ContactEnvironment {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, environment: WorkerEnvironment): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/contacto') {
      return await handleContactRequest(request, { environment });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Not found', { status: 404 });
    }
    return environment.ASSETS.fetch(request);
  },
};
```

`wrangler.jsonc` — el Worker debe correr **antes** que los assets en esa ruta:

```jsonc
{
  "main": "./src/worker.ts",
  "vars": { "MAIL_FROM_NAME": "Mi Estudio" },
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "html_handling": "auto-trailing-slash",
    "run_worker_first": ["/api/contacto"]
  }
}
```

Secrets: `wrangler secret put MAIL_API_URL` / `MAIL_API_KEY` / `MAIL_CONTACT_TO`.
En local, `wrangler dev` los lee de `.dev.vars`.

### B. Astro con adapter SSR (Node, Vercel, Netlify…)

`src/pages/api/contacto.ts`:

```ts
import type { APIRoute } from 'astro';
import { handleContactRequest } from '../../lib/contact';

export const prerender = false;

export const POST: APIRoute = ({ request, clientAddress }) =>
  handleContactRequest(request, {
    environment: {
      MAIL_API_URL: import.meta.env.MAIL_API_URL,
      MAIL_API_KEY: import.meta.env.MAIL_API_KEY,
      MAIL_CONTACT_TO: import.meta.env.MAIL_CONTACT_TO,
      MAIL_FROM_NAME: import.meta.env.MAIL_FROM_NAME,
      MAIL_SUBJECT: import.meta.env.MAIL_SUBJECT,
    },
    clientAddress,
  });
```

Requisitos: `output: 'server'` (o la página de contacto marcada
`prerender = false`) y un adapter instalado. Si se usa `astro:env`, declarar las
cinco como `context: 'server', access: 'secret'` y leerlas desde
`astro:env/server` en lugar de `import.meta.env`.

---

## 8. Componente `src/components/ContactForm.astro`

Render inicial del formulario. Mismo markup que el fragmento del servidor.

```astro
---
interface Props {
  error?: string | null;
  success?: boolean;
  values?: { name?: string; contact?: string; message?: string };
}
const { error = null, success = false, values = {} } = Astro.props;
---

<div id="contacto-form">
  {success ? (
    <p class="site-form__status" role="status">Mensaje enviado.</p>
  ) : (
    <form
      class="site-form"
      method="post"
      action="/api/contacto"
      hx-post="/api/contacto"
      hx-target="#contacto-form"
      hx-swap="outerHTML"
    >
      <label class="site-form__honeypot" aria-hidden="true">
        Sitio web
        <input type="text" name="website_url" tabindex="-1" autocomplete="off" />
      </label>
      <input type="text" name="nombre" maxlength="400" required placeholder="Nombre" aria-label="Nombre" value={values.name ?? ''} />
      <input type="text" name="contacto" maxlength="400" placeholder="Contacto" aria-label="Contacto" value={values.contact ?? ''} />
      <textarea name="mensaje" maxlength="2000" rows="1" placeholder="Mensaje" aria-label="Mensaje">{values.message ?? ''}</textarea>
      <button type="submit">Enviar</button>
      {error && <p class="site-form__status" role="alert">{error}</p>}
    </form>
  )}
</div>
```

CSS mínimo obligatorio (el resto es estilo libre del proyecto):

```css
.site-form__honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

---

## 9. Integración HTMX en el cliente

`htmx.org` como dependencia (`pnpm add htmx.org`), importado en el bundle del
sitio. Dos handlers, ambos necesarios:

```ts
import htmx from 'htmx.org';
window.htmx = htmx;

// 1. HTMX ignora respuestas 4xx por defecto: habilitamos el swap del 422
//    para que se vea el fragmento con el mensaje de error.
document.addEventListener('htmx:beforeSwap', (event) => {
  const detail = (event as CustomEvent).detail as { xhr?: XMLHttpRequest; shouldSwap?: boolean };
  if (detail.xhr?.status === 422) detail.shouldSwap = true;
});

// 2. Garantía de confirmación: si el 200 llegó pero el swap no dejó el estado
//    visible, lo insertamos.
document.addEventListener('htmx:afterSwap', (event) => {
  const detail = (event as CustomEvent).detail as { xhr?: XMLHttpRequest; target?: Element };
  const target = detail.target;
  if (detail.xhr?.status !== 200 || !(target instanceof Element) || target.id !== 'contacto-form') return;

  const currentTarget = document.getElementById('contacto-form');
  if (!currentTarget || currentTarget.querySelector('[role="status"]')) return;

  const status = document.createElement('p');
  status.className = 'site-form__status';
  status.setAttribute('role', 'status');
  status.textContent = 'Mensaje enviado.';
  currentTarget.replaceChildren(status);
});
```

Nunca se muestra confirmación optimista: el estado de éxito solo aparece tras
un 200 real del endpoint.

---

## 10. Cabeceras de seguridad

Si el proyecto destino define CSP, el flujo requiere:

- `form-action 'self'` — el POST va al propio sitio, nunca al relay.
- `connect-src 'self'` — HTMX hace XHR solo al propio origen.
- `script-src 'self'` — el bundle es local; HTMX no se carga por CDN.

Además, en todas las respuestas: `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

---

## 11. Criterios de aceptación

1. `MAIL_API_URL`, `MAIL_API_KEY` y `MAIL_CONTACT_TO` no aparecen en ningún
   archivo de `dist/` ni en el bundle del cliente.
2. Envío válido ⇒ HTTP 200, llega el correo, el formulario se reemplaza por
   `Mensaje enviado.` sin recargar.
3. Con JavaScript deshabilitado, el envío funciona por navegación normal y la
   página resultante muestra el mismo mensaje.
4. `nombre` vacío ⇒ 422, mensaje de error visible, `contacto` y `mensaje`
   conservan lo escrito.
5. Honeypot completo ⇒ 200 de éxito y **ningún** correo enviado.
6. Sexto envío en 15 minutos desde la misma IP ⇒ 422 con el mensaje de rate
   limit.
7. `GET /api/contacto` ⇒ 405 con `Allow: POST`.
8. Con el relay caído o lento (>10 s) ⇒ 422 con el mensaje genérico; no se
   filtra el status ni el body del relay al usuario.
9. Quitando `MAIL_API_URL` del entorno ⇒ 422 de configuración, sin llamada
   saliente.

---

## 12. Orden de implementación sugerido

1. `.env.example` + variables reales en el runtime de destino.
2. `src/lib/contact.ts`.
3. Endpoint (Worker o `src/pages/api/contacto.ts`).
4. `ContactForm.astro` + página que lo monta + CSS del honeypot.
5. HTMX en el bundle del cliente con los dos handlers.
6. CSP y cabeceras.
7. Recorrer los criterios de §11.
