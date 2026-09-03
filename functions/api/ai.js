// functions/api/ai.js
//
// Passerelle sécurisée vers l'API Anthropic, version Cloudflare Pages.
// Même rôle que netlify/functions/ai.js : la clé reste sur le serveur, elle
// n'apparaît jamais dans la page. Ce fichier répond à l'adresse /api/ai
// (Cloudflare déduit la route du chemin du fichier).
//
// MISE EN PLACE (une seule fois) :
// 1. Cloudflare → Workers & Pages → le projet → Settings → Variables and Secrets
// 2. Ajouter ANTHROPIC_API_KEY avec la clé créée sur console.anthropic.com
// 3. Redéployer (ou pousser un commit)
//
// Seul POST est déclaré : Cloudflare répond 405 aux autres méthodes.

export async function onRequestPost({ request, env }) {
  const json = (data, status) => new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });

  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) return json({ error: "Clé API non configurée" }, 500);

  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return json({ error: "Requête invalide" }, 400);
  }

  // Garde-fous : on borne ce que le client peut demander.
  const body = {
    model: payload.model || "claude-sonnet-5",
    max_tokens: Math.min(Number(payload.max_tokens) || 1000, 2000),
    system: typeof payload.system === "string" ? payload.system.slice(0, 20000) : undefined,
    messages: Array.isArray(payload.messages) ? payload.messages.slice(-20) : []
  };

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    // Journalisé côté Cloudflare (Workers & Pages → le projet → Logs)
    if (!res.ok || data.error) {
      console.log("ERREUR API ANTHROPIC:", res.status, JSON.stringify(data));
    } else {
      console.log("OK Anthropic, modele:", body.model);
    }

    return json(data, res.status);
  } catch (e) {
    return json({ error: "Service indisponible" }, 502);
  }
}
