/**
 * Contact endpoint: validates a submission and hands it to the external mail
 * relay. The browser never sees the relay URL or its key — it posts here, and
 * only here. Everything in this module is server-side.
 */

export interface ContactEnv {
  /** Relay endpoint. Secret: it is the only thing that accepts the key. */
  MAIL_API_URL?: string;
  /** Key the relay validates. Secret. */
  MAIL_API_KEY?: string;
  /** Mailbox that receives the submissions. Secret. */
  MAIL_CONTACT_TO?: string;
  /** Sender name shown in the inbox. Not a secret; lives in wrangler vars. */
  MAIL_FROM_NAME?: string;
  /** Subject line. Not a secret; lives in wrangler vars. */
  MAIL_SUBJECT?: string;
}

type Submission = {
  nome: string;
  negocio: string;
  email: string;
  whatsapp: string;
  mensagem: string;
};

const MAX_FIELD = 2000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RELAY_TIMEOUT_MS = 10_000;

/** Friction, not a guarantee: the map lives in one isolate, and there are many. */
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX_ATTEMPTS = 5;
const attempts = new Map<string, number[]>();

/** Collapses whitespace, strips control characters and caps the length. */
const clean = (value: FormDataEntryValue | null): string =>
  typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, MAX_FIELD)
    : "";

const validate = (form: FormData): { data?: Submission; errors: string[] } => {
  const data: Submission = {
    nome: clean(form.get("nome")),
    negocio: clean(form.get("negocio")),
    email: clean(form.get("email")),
    whatsapp: clean(form.get("whatsapp")),
    mensagem: clean(form.get("mensagem")),
  };

  const errors: string[] = [];
  if (data.nome.length < 2) errors.push("nome");
  if (data.negocio.length < 2) errors.push("negocio");
  if (!EMAIL.test(data.email)) errors.push("email");
  if (data.whatsapp.replace(/\D/g, "").length < 10) errors.push("whatsapp");

  return errors.length > 0 ? { errors } : { data, errors };
};

/**
 * A cross-site post is either a mistake or an attack. A request with neither
 * header is neither — a form submitted without JavaScript may send nothing.
 */
const sameOrigin = (request: Request): boolean => {
  const origin = request.headers.get("origin") ?? request.headers.get("referer");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
};

const clientIp = (request: Request): string =>
  request.headers.get("cf-connecting-ip") ??
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  "unknown";

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((at) => now - at < RATE_WINDOW_MS);

  if (recent.length >= RATE_MAX_ATTEMPTS) {
    attempts.set(ip, recent);
    return true;
  }

  recent.push(now);
  attempts.set(ip, recent);
  return false;
};

/** The relay takes one free-text body, so the fields are laid out as a letter. */
const composeMessage = (data: Submission): string =>
  [
    `Nome: ${data.nome}`,
    `Negócio: ${data.negocio}`,
    `E-mail: ${data.email}`,
    `WhatsApp: ${data.whatsapp}`,
    "",
    data.mensagem || "(sem mensagem)",
  ].join("\n");

/** Throws on anything that is not a clean 200 from the relay. */
const deliver = async (data: Submission, env: ContactEnv): Promise<void> => {
  const { MAIL_API_URL: url, MAIL_API_KEY: key, MAIL_CONTACT_TO: to } = env;
  if (!url || !key || !to) throw new Error("relay not configured");

  const body = new FormData();
  body.append("api_key", key);
  body.append("email_target", to);
  body.append("from_name", env.MAIL_FROM_NAME || "PLOP! Sites");
  body.append("subject", env.MAIL_SUBJECT || "Novo contato pelo site");
  body.append("name", data.nome);
  body.append("email", data.email || to);
  body.append("message", composeMessage(data));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RELAY_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      body,
      signal: controller.signal,
    });

    if (response.status !== 200) {
      // The relay's own words never reach the visitor: they are for the log.
      const text = await response.text().catch(() => "");
      console.error(`[contato] relay HTTP ${response.status}`, text.slice(0, 200));
      throw new Error(`relay responded ${response.status}`);
    }
  } finally {
    clearTimeout(timeout);
  }
};

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Without JavaScript the form is a plain POST, so the response is the next
 * page the visitor reads. Self-contained on purpose: this route is not part of
 * the built site, and a broken-looking confirmation is worse than a plain one.
 */
const htmlPage = (title: string, body: string, back: string): string =>
  `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)} — PLOP! Sites</title>
<style>
:root{color-scheme:light}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;
background:#2563FF;color:#fff;font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:34rem;text-align:center}
h1{font-size:clamp(1.75rem,5vw,2.5rem);margin:0 0 .5rem;line-height:1.15}
p{margin:0 0 1.75rem}
a{display:inline-block;padding:.85rem 1.5rem;border-radius:999px;
background:#C7FF00;color:#0B0F1A;font-weight:700;text-decoration:none}
a:focus-visible{outline:3px solid #fff;outline-offset:3px}
</style></head>
<body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(body)}</p>
<a href="${escapeHtml(back)}">Voltar ao site</a></main></body></html>`;

/** Where the no-JS visitor came from, and where "Voltar" sends them back. */
const backLink = (request: Request): string => {
  const referer = request.headers.get("referer");
  if (!referer) return "/";
  try {
    const url = new URL(referer);
    return url.host === new URL(request.url).host ? `${url.pathname}${url.hash}` : "/";
  } catch {
    return "/";
  }
};

/** True when the submission came from the enhanced form rather than a bare POST. */
const wantsJson = (request: Request): boolean =>
  (request.headers.get("accept") ?? "").includes("application/json");

const reply = (
  request: Request,
  status: number,
  json: Record<string, unknown>,
  page: { title: string; body: string },
): Response => {
  const headers = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };

  if (wantsJson(request)) return Response.json(json, { status, headers });

  return new Response(htmlPage(page.title, page.body, backLink(request)), {
    status,
    headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
  });
};

const SENT = {
  title: "Mensagem enviada!",
  body: "Recebemos seu contato. A resposta chega em até um dia útil.",
};

const FAILED = {
  title: "Não conseguimos enviar",
  body: "Algo falhou no envio. Tente de novo em alguns minutos ou chame no WhatsApp.",
};

export async function handleContact(request: Request, env: ContactEnv): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "POST" },
    });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(request, 400, { error: "invalid_body" }, FAILED);
  }

  // Honeypot: a real person never fills a field they cannot see. Answer as if
  // it worked so a bot cannot tell the trap from a success — and send nothing.
  if (clean(form.get("site")) !== "") {
    return reply(request, 200, { ok: true }, SENT);
  }

  if (!sameOrigin(request)) {
    return reply(request, 403, { error: "bad_origin" }, FAILED);
  }

  if (isRateLimited(clientIp(request))) {
    return reply(
      request,
      429,
      { error: "rate_limited" },
      {
        title: "Muitos envios",
        body: "Recebemos várias mensagens deste dispositivo. Tente de novo em alguns minutos.",
      },
    );
  }

  const { data, errors } = validate(form);
  if (!data) {
    return reply(
      request,
      422,
      { error: "invalid_fields", fields: errors },
      {
        title: "Faltam alguns dados",
        body: "Confira nome, negócio, e-mail e WhatsApp e envie de novo.",
      },
    );
  }

  try {
    await deliver(data, env);
  } catch (error) {
    // Which piece of configuration is missing is a detail for the log only.
    console.error("[contato] delivery failed", error);
    return reply(request, 502, { error: "delivery_failed" }, FAILED);
  }

  // The browser only counts a conversion on a 2xx, so this is reached only
  // after the relay has actually accepted the message.
  return reply(request, 200, { ok: true }, SENT);
}
