import { NextResponse } from "next/server";

/**
 * ------------------------------------------------------------------
 * API ROUTE — FORMULAIRE DE CONTACT
 * ------------------------------------------------------------------
 * Pour le moment cette route valide la requête et journalise la
 * demande côté serveur (console) : aucun email n'est réellement envoyé.
 * C'est un stand-in propre et fonctionnel, à brancher sur un vrai
 * service d'envoi avant mise en production. Trois options simples :
 *
 * 1) RESEND (recommandé, le plus proche de Next.js)
 *    npm install resend
 *    import { Resend } from "resend";
 *    const resend = new Resend(process.env.RESEND_API_KEY);
 *    await resend.emails.send({
 *      from: "Estalia Studio <contact@votredomaine.com>",
 *      to: "contact@estalia-studio.com",
 *      subject: `Nouvelle demande — ${body.agency}`,
 *      text: JSON.stringify(body, null, 2),
 *    });
 *
 * 2) FORMSPREE
 *    Remplacez simplement `siteConfig.contactEndpoint` (data/config.ts)
 *    par votre URL Formspree (https://formspree.io/f/xxxxxx) et
 *    supprimez cette route : le formulaire poste directement dessus.
 *
 * 3) SUPABASE
 *    import { createClient } from "@supabase/supabase-js";
 *    const supabase = createClient(url, serviceKey);
 *    await supabase.from("contact_requests").insert(body);
 *
 * Variables d'environnement à ajouter dans Vercel (Project Settings →
 * Environment Variables) selon l'option choisie : RESEND_API_KEY,
 * NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.
 * ------------------------------------------------------------------
 */

type ContactPayload = {
  name: string;
  agency: string;
  email: string;
  phone?: string;
  listingUrl: string;
  message: string;
  collaboration: boolean;
};

function isValid(body: Partial<ContactPayload>): body is ContactPayload {
  return Boolean(
    body.name?.trim() &&
      body.agency?.trim() &&
      body.email?.trim() &&
      body.listingUrl?.trim() &&
      body.message?.trim()
  );
}

export async function POST(request: Request) {
  let body: Partial<ContactPayload>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!isValid(body)) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 422 });
  }

  // TODO : brancher un vrai service d'envoi (voir commentaire en tête de fichier).
  console.info("[estalia:contact] Nouvelle demande reçue", {
    ...body,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
