// Events page: upcoming (including cancelled ones, clearly marked) and past events, archived automatically by date.
import { LIVE, api, loadContent, applyContent, loadSettings } from "./data.js";
import { eventHTML, EVENT_COLS } from "./views.js";
import { initChrome } from "./chrome.js";

initChrome();
const up = document.getElementById("evUp"), past = document.getElementById("evPast");
const now = new Date().toISOString();

async function run() {
  if (!LIVE) {
    up.innerHTML = `<p class="ev-empty">Les prochains rendez-vous de la librairie s’afficheront ici dès qu’ils seront publiés depuis l’administration.</p>`;
    past.innerHTML = "";
    return;
  }
  loadContent().then((c) => applyContent(c));
  await loadSettings();
  try {
    const [next, old] = await Promise.all([
      api(`events?select=${EVENT_COLS}&starts_at=gte.${encodeURIComponent(now)}&order=starts_at.asc&limit=50`),
      api(`events?select=${EVENT_COLS}&starts_at=lt.${encodeURIComponent(now)}&cancelled=eq.false&order=starts_at.desc&limit=24`),
    ]);
    up.innerHTML = next.length ? next.map((e) => eventHTML(e)).join("") : `<p class="ev-empty">Aucun rendez-vous annoncé pour le moment. Les rencontres sont publiées ici dès qu’elles sont confirmées.</p>`;
    past.innerHTML = old.map((e) => eventHTML(e, { past: true })).join("");
  } catch (_) {
    up.innerHTML = `<p class="ev-empty" role="alert">Le programme est momentanément indisponible. Merci de réessayer dans un instant.</p>`;
  }
  up.setAttribute("aria-busy", "false");
}
run();
