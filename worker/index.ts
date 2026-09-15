/**
 * Everything on this Worker is a static asset except the contact endpoint,
 * which needs a server so the form can report success only after the mail
 * relay has accepted the message.
 */
import { handleContact, type ContactEnv } from "./contact";

interface Env extends ContactEnv {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/contato") {
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
