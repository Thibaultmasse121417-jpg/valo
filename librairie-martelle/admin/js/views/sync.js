import { syncRuns } from "../api.js";
import { html, raw, esc, fmtDate } from "../ui.js";

export async function render(main) {
  const runs = await syncRuns();
  const url = `${(window.MARTELLE_CONFIG || {}).supabaseUrl}/functions/v1/pos-sync`;
  const example = JSON.stringify({ source: "logiciel-de-caisse", create_missing: false, items: [{ isbn: "9782070360024", price: 8.9, stock_qty: 4 }, { isbn: "9782253004226", stock_qty: 0 }, { external_ref: "A-000123", availability: "on_order" }] }, null, 2);
  main.innerHTML = html`<div class="topbar"><div><h1>Synchronisation du stock</h1><div class="sub">Pour que les prix et les disponibilités se mettent à jour tout seuls depuis votre logiciel de gestion.</div></div></div>
  <div class="grid g2" style="align-items:start">
    <section class="card"><h2>Comment ça marche</h2>
      <ol style="margin:0;padding-left:20px;display:grid;gap:10px">
        <li>Votre prestataire informatique (ou votre logiciel) envoie régulièrement les stocks et les prix à l’adresse ci-dessous, par ISBN ou par référence article.</li>
        <li>Les livres connus sont mis à jour : <b>prix</b>, <b>quantité</b> et <b>disponibilité</b> (« en stock », « stock faible » ou « indisponible » selon la quantité).</li>
        <li>Les livres inconnus peuvent être créés en brouillon (non publiés) pour que vous les complétiez.</li>
        <li>Vos textes, rayons, sélections et coups de cœur ne sont jamais modifiés par la synchronisation.</li>
      </ol>
      <p class="small muted">Un import CSV régulier (menu « Importer ») reste possible si votre logiciel ne sait qu’exporter un fichier.</p></section>
    <section class="card"><h2>Pour votre prestataire</h2>
      <p class="small" style="margin-top:0"><b>POST</b> <code class="k">${url}</code><br>En-tête <code class="k">Authorization: Bearer &lt;SYNC_TOKEN&gt;</code> (jeton secret défini dans Supabase → Edge Functions → Secrets). 1 000 articles maximum par appel.</p>
      <pre class="code">${example}</pre></section>
  </div>
  <section class="card" style="margin-top:16px"><h2>Dernières synchronisations</h2>
    ${runs.length ? raw(`<div class="tbl-wrap"><table class="tbl"><tr><th>Date</th><th>Source</th><th>Reçus</th><th>Mis à jour</th><th>Créés</th><th>Inconnus</th><th>Erreurs</th></tr>${runs.map((r) => `<tr><td>${esc(fmtDate(r.created_at, { dateStyle: "short", timeStyle: "short" }))}</td><td>${esc(r.source)}</td><td>${r.received}</td><td>${r.updated}</td><td>${r.created}</td><td>${r.unknown}</td><td>${(r.errors || []).length}</td></tr>`).join("")}</table></div>`) : raw('<p class="muted">Aucune synchronisation reçue pour l’instant.</p>')}</section>`;
}
