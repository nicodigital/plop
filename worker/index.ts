/**
 * Contact endpoint. Everything else on this Worker is a static asset; this
 * handler exists only so the form has a server that validates before it
 * reports success. Keep it small.
 */
interface Env {
  ASSETS: Fetcher;
  /** Where submissions are delivered. Set as a Worker secret, never in code. */
  CONTACT_WEBHOOK?: string;
}

type Submission = {
  nome: string;
  negocio: string;
  email: string;
  whatsapp: string;
  plano: string;
  mensagem: string;
};

const MAX_FIELD = 2000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
    plano: clean(form.get("plano")),
    mensagem: clean(form.get("mensagem")),
  };

  const errors: string[] = [];
  if (data.nome.length < 2) errors.push("nome");
  if (data.negocio.length < 2) errors.push("negocio");
  if (!EMAIL.test(data.email)) errors.push("email");
  if (data.whatsapp.replace(/\D/g, "").length < 10) errors.push("whatsapp");

  return errors.length > 0 ? { errors } : { data, errors };
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== "/api/contato") {
      return env.ASSETS.fetch(request);
    }

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
      return Response.json({ error: "invalid_body" }, { status: 400 });
    }

    // Honeypot: a real person never fills a field they cannot see. Answer
    // 204 so a bot cannot tell the trap from a success.
    if (clean(form.get("site")) !== "") {
      return new Response(null, { status: 204 });
    }

    const { data, errors } = validate(form);
    if (!data) {
      return Response.json({ error: "invalid_fields", fields: errors }, { status: 422 });
    }

    if (env.CONTACT_WEBHOOK) {
      const delivered = await fetch(env.CONTACT_WEBHOOK, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...data,
          receivedAt: new Date().toISOString(),
          source: url.origin,
        }),
      });

      // The browser only counts a conversion on a 2xx, so a failed delivery
      // must surface as a failure rather than a silent success.
      if (!delivered.ok) {
        return Response.json({ error: "delivery_failed" }, { status: 502 });
      }
    } else {
      console.log("contact submission (no CONTACT_WEBHOOK configured)", data);
    }

    return Response.json({ ok: true });
  },
} satisfies ExportedHandler<Env>;
