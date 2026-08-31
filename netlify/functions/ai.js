// netlify/functions/ai.js
//
// Passerelle sécurisée vers l'API Anthropic.
// La clé reste sur le serveur Netlify : elle n'apparaît jamais dans la page.
//
// MISE EN PLACE (une seule fois) :
// 1. Place ce fichier dans ton dépôt GitHub sous : netlify/functions/ai.js
// 2. Sur console.anthropic.com → crée une clé API (facturation à l'usage)
// 3. Sur Netlify → Site settings → Environment variables → ajoute :
//       ANTHROPIC_API_KEY = ta_clé
// 4. Dans suivi-commandes.html, remplace la ligne :
//       const AI_ENDPOINT = "https://api.anthropic.com/v1/messages";
//    par :
//       const AI_ENDPOINT = "/.netlify/functions/ai";
// 5. Redéploie.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Clé API non configurée" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Requête invalide" }) };
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

    // Journalise le détail en cas de refus de l'API (visible dans les logs Netlify)
    if (!res.ok || data.error) {
      console.log("ERREUR API ANTHROPIC:", res.status, JSON.stringify(data));
    } else {
      console.log("OK Anthropic, modele:", body.model);
    }

    return {
      statusCode: res.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: "Service indisponible" }) };
  }
};
