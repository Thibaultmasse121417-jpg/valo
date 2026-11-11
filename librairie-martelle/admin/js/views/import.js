import { categories, existingIsbns, upsertBooks, insertBooks, logImport, recentImports, copyRemoteCover } from "../api.js";
import { html, raw, esc, I, toast, download, fmtDate } from "../ui.js";
import { readTextFile, detectDelimiter, parseCsv, FIELDS, guessMapping, rowToBook, TEMPLATE, toCsv } from "../csv.js";
import { lookupIsbn } from "../isbn.js";

const MAX_ROWS = 5000;

export async function render(main) {
  const cats = await categories();
  const S = { file: null, headers: [], rows: [], map: {}, delim: ";", parsed: [] };

  main.innerHTML = html`<div class="topbar"><div><h1>Importer des livres</h1><div class="sub">Ajoutez ou mettez à jour des centaines de livres en une fois, depuis un fichier Excel enregistré en CSV.</div></div>
    <button class="btn" id="tpl">${raw(I.dl)} Télécharger le modèle</button></div>
  <div class="steps"><span data-s="1" class="on">1. Fichier</span><span data-s="2">2. Colonnes</span><span data-s="3">3. Vérification</span><span data-s="4">4. Import</span></div>
  <div id="stage"></div>
  <section class="card" style="margin-top:20px"><h2>Derniers imports</h2><div id="hist" class="small muted">…</div></section>`;
  const $ = (s) => main.querySelector(s);
  const stage = $("#stage");
  const step = (n) => main.querySelectorAll(".steps span").forEach((s) => { const k = +s.dataset.s; s.className = k === n ? "on" : k < n ? "done" : ""; });
  $("#tpl").onclick = () => download("modele-import-martelle.csv", toCsv(TEMPLATE));

  recentImports().then((rows) => {
    $("#hist").innerHTML = rows.length ? `<div class="tbl-wrap"><table class="tbl"><tr><th>Date</th><th>Fichier</th><th>Lignes</th><th>Ajoutés</th><th>Mis à jour</th><th>Erreurs</th></tr>${rows.map((r) => `<tr><td>${esc(fmtDate(r.created_at, { dateStyle: "short", timeStyle: "short" }))}</td><td>${esc(r.filename || "")}</td><td>${r.total}</td><td>${r.inserted}</td><td>${r.updated}</td><td>${r.failed}</td></tr>`).join("")}</table></div>` : "Aucun import pour l’instant.";
  }).catch(() => ($("#hist").textContent = ""));

  /* ---------- 1. file ---------- */
  function stepFile() {
    step(1);
    stage.innerHTML = html`<label class="drop" id="drop"><input type="file" accept=".csv,.txt,text/csv" hidden id="f">
      <b>Déposez votre fichier CSV ici</b><span class="muted">ou cliquez pour le choisir — jusqu’à ${MAX_ROWS} livres par fichier</span></label>
      <div class="notice info" style="margin-top:14px">Depuis Excel : <i>Fichier → Enregistrer sous → CSV (séparateur : point-virgule)</i>. Seule la colonne <b>ISBN</b> ou <b>Titre</b> est indispensable : les autres informations peuvent être complétées automatiquement à partir de l’ISBN.</div>`;
    const drop = $("#drop"), inp = $("#f");
    inp.onchange = () => inp.files[0] && loadFile(inp.files[0]);
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("over"));
    drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("over"); e.dataTransfer.files[0] && loadFile(e.dataTransfer.files[0]); });
  }
  async function loadFile(file) {
    if (file.size > 20e6) { toast("Fichier trop volumineux (20 Mo maximum).", "bad"); return; }
    const text = await readTextFile(file);
    S.delim = detectDelimiter(text);
    const all = parseCsv(text, S.delim);
    if (all.length < 2) { toast("Le fichier ne contient pas de ligne de données.", "bad"); return; }
    S.file = file; S.headers = all[0].map((h) => h.trim()); S.rows = all.slice(1);
    if (S.rows.length > MAX_ROWS) { toast(`Fichier limité à ${MAX_ROWS} lignes : découpez-le en plusieurs fichiers.`, "bad", 7000); return; }
    S.map = guessMapping(S.headers);
    stepMap();
  }

  /* ---------- 2. mapping ---------- */
  function stepMap() {
    step(2);
    const opt = (k) => `<option value="">— Ignorer —</option>` + S.headers.map((h, i) => `<option value="${i}" ${S.map[k] === i ? "selected" : ""}>${esc(h || `Colonne ${i + 1}`)}</option>`).join("");
    stage.innerHTML = html`<section class="card"><h2>Associez les colonnes de votre fichier</h2>
      <p class="muted" style="margin-top:-6px">${S.file.name} — ${S.rows.length} ligne(s), séparateur « ${S.delim === "\t" ? "tabulation" : S.delim} ». Les correspondances ont été devinées : vérifiez-les.</p>
      <div class="map-grid">${raw(FIELDS.map((f) => `<label class="f">${esc(f.label)}<select class="in" data-map="${f.key}">${opt(f.key)}</select></label>`).join(""))}</div></section>
    <section class="card" style="margin-top:16px"><h2>Options</h2><div class="grid g2">
      <label class="f">Rayon par défaut <span class="hint">Pour les livres sans rayon reconnu</span><select class="in" id="defCat"><option value="">— Aucun —</option>${raw(cats.map((c) => `<option value="${c.id}">${esc(c.title)}</option>`).join(""))}</select></label>
      <div class="grid" style="gap:10px;align-content:start">
        <label class="check"><input type="checkbox" id="upd" checked> Mettre à jour les livres déjà présents (même ISBN)</label>
        <label class="check"><input type="checkbox" id="enr" checked> Compléter les informations manquantes grâce à l’ISBN (couverture, résumé…)</label>
        <label class="check"><input type="checkbox" id="pub" checked> Publier immédiatement sur le site</label>
      </div></div></section>
    <div class="sticky-actions"><button class="btn" id="back">← Changer de fichier</button><button class="btn primary lg" id="go">Vérifier les données →</button></div>`;
    $("#back").onclick = stepFile;
    $("#go").onclick = () => {
      main.querySelectorAll("[data-map]").forEach((s) => { if (s.value === "") delete S.map[s.dataset.map]; else S.map[s.dataset.map] = +s.value; });
      if (S.map.isbn === undefined && S.map.title === undefined) { toast("Associez au moins la colonne ISBN ou la colonne Titre.", "bad"); return; }
      S.opts = { defaultCategory: $("#defCat").value || null, update: $("#upd").checked, enrich: $("#enr").checked, publish: $("#pub").checked };
      stepCheck();
    };
  }

  /* ---------- 3. check ---------- */
  function stepCheck() {
    step(3);
    const ctx = { categories: cats, defaultCategory: S.opts.defaultCategory, enrich: S.opts.enrich && S.map.isbn !== undefined, publish: S.opts.publish };
    const seen = new Map();
    S.parsed = S.rows.map((row, i) => {
      const r = rowToBook(row, S.map, ctx);
      r.line = i + 2;
      if (r.book.isbn) {
        if (seen.has(r.book.isbn)) r.errors.push(`ISBN en double (déjà ligne ${seen.get(r.book.isbn)})`);
        else seen.set(r.book.isbn, r.line);
      }
      return r;
    });
    const ok = S.parsed.filter((r) => !r.errors.length), bad = S.parsed.filter((r) => r.errors.length);
    const show = [...bad.slice(0, 50), ...ok.slice(0, Math.max(0, 12 - Math.min(bad.length, 50)))];
    const catName = Object.fromEntries(cats.map((c) => [c.id, c.short_title]));
    stage.innerHTML = html`<section class="card"><h2>${ok.length} livre(s) prêt(s) à importer${bad.length ? `, ${bad.length} ligne(s) à corriger` : ""}</h2>
      ${bad.length ? raw(`<div class="notice" style="margin-bottom:12px">Les lignes en erreur seront ignorées. Vous pourrez télécharger leur liste pour les corriger.</div>`) : ""}
      ${S.opts.enrich ? raw(`<p class="small muted">Les livres sans titre, résumé ou couverture seront complétés via leur ISBN (environ 2 livres par seconde).</p>`) : ""}
      <div class="tbl-wrap"><table class="tbl"><tr><th>Ligne</th><th>ISBN</th><th>Titre</th><th>Auteur(s)</th><th>Prix</th><th>Rayon</th><th>Dispo</th><th>Problème</th></tr>
      ${raw(show.map((r) => `<tr class="${r.errors.length ? "bad" : ""}"><td>${r.line}</td><td>${esc(r.book.isbn || "")}</td><td>${esc(r.book.title || (ctx.enrich && r.book.isbn ? "(à compléter)" : ""))}</td><td>${esc((r.book.authors || []).join(", "))}</td><td>${r.book.price ?? ""}</td><td>${esc(catName[r.book.category_id] || "—")}</td><td>${esc(r.book.availability || "")}</td><td class="err">${esc(r.errors.join(" · "))}</td></tr>`).join(""))}
      </table></div>${S.parsed.length > show.length ? raw(`<p class="small muted">Aperçu limité aux ${show.length} premières lignes.</p>`) : ""}</section>
    <div class="sticky-actions"><button class="btn" id="back">← Colonnes</button>${bad.length ? raw('<button class="btn" id="errs">Télécharger les lignes en erreur</button>') : ""}<button class="btn primary lg" id="run" ${ok.length ? "" : "disabled"}>Importer ${ok.length} livre(s)</button></div>`;
    $("#back").onclick = stepMap;
    $("#errs")?.addEventListener("click", () => download("lignes-a-corriger.csv", toCsv([["ligne", "probleme", ...S.headers], ...bad.map((r) => [r.line, r.errors.join(" · "), ...S.rows[r.line - 2]])])));
    $("#run").onclick = () => runImport(ok, bad, ctx);
  }

  /* ---------- 4. run ---------- */
  async function runImport(ok, bad, ctx) {
    step(4);
    let stop = false;
    stage.innerHTML = html`<section class="card"><h2 id="ph">Import en cours…</h2><div class="progress"><i id="bar"></i></div><p class="muted" id="pt" style="margin:10px 0 0"></p>
      <div class="row end" style="margin-top:14px"><button class="btn" id="stop">Interrompre</button></div></section>`;
    $("#stop").onclick = () => { stop = true; $("#stop").disabled = true; };
    const setP = (done, total, label) => { $("#bar").style.width = `${Math.round((done / total) * 100)}%`; $("#pt").textContent = label; };
    const errors = bad.map((r) => ({ line: r.line, error: r.errors.join(" · ") }));
    const books = ok.map((r) => ({ ...r.book, _line: r.line }));

    // a) enrichment from ISBN (title/summary/cover…), 3 at a time
    if (ctx.enrich) {
      const todo = books.filter((b) => b.isbn && (!b.title || !b.description || !b.cover_url || !b.authors?.length));
      let done = 0;
      const worker = async () => {
        while (todo.length && !stop) {
          const b = todo.shift();
          try {
            const res = await lookupIsbn(b.isbn);
            if (res.found) {
              const d = res.data;
              for (const k of ["title", "subtitle", "publisher", "published_date", "page_count", "language", "description"]) if (!b[k] && d[k]) b[k] = d[k];
              if (!b.authors?.length && d.authors?.length) b.authors = d.authors;
              b.metadata_source = d.metadata_source;
              if (!b.cover_url && d.cover_candidates.length) {
                const c = d.cover_candidates[0];
                const path = c.copy ? await copyRemoteCover(c.url) : null;
                if (path) b.cover_path = path; else b.cover_url = c.url;
                b.cover_credit = c.credit;
              }
            }
          } catch (_) {}
          done++;
          setP(done, done + todo.length || 1, `Recherche des informations par ISBN : ${done} livre(s) traité(s)…`);
        }
      };
      await Promise.all([worker(), worker(), worker()]);
    }
    const ready = books.filter((b) => { if (!b.title) { errors.push({ line: b._line, error: "Titre introuvable pour cet ISBN" }); return false; } return true; });

    // b) write in batches of 200
    let inserted = 0, updated = 0;
    const withIsbn = ready.filter((b) => b.isbn), without = ready.filter((b) => !b.isbn);
    const existing = await existingIsbns(withIsbn.map((b) => b.isbn));
    const strip = (b) => { const { _line, ...rest } = b; return rest; };
    // keep existing flags unless the file sets them
    const total = ready.length || 1;
    let written = 0;
    for (let i = 0; i < withIsbn.length && !stop; i += 200) {
      const chunk = withIsbn.slice(i, i + 200);
      try {
        const groups = new Map();
        for (const b of chunk) { const key = Object.keys(b).sort().join(","); (groups.get(key) || groups.set(key, []).get(key)).push(strip(b)); }
        for (const rows of groups.values()) await upsertBooks(rows, { update: ctx.update ?? S.opts.update });
        chunk.forEach((b) => (existing.has(b.isbn) ? (S.opts.update ? updated++ : 0) : inserted++));
      } catch (e) {
        chunk.forEach((b) => errors.push({ line: b._line, error: e.message }));
      }
      written += chunk.length;
      setP(written, total, `Enregistrement : ${written} / ${ready.length}`);
    }
    for (let i = 0; i < without.length && !stop; i += 200) {
      const chunk = without.slice(i, i + 200);
      try { await insertBooks(chunk.map(strip)); inserted += chunk.length; }
      catch (e) { chunk.forEach((b) => errors.push({ line: b._line, error: e.message })); }
      written += chunk.length;
      setP(written, total, `Enregistrement : ${written} / ${ready.length}`);
    }
    const skipped = S.opts.update ? 0 : withIsbn.filter((b) => existing.has(b.isbn)).length;
    await logImport({ filename: S.file.name, total: S.rows.length, inserted, updated, failed: errors.length, errors: errors.slice(0, 500) }).catch(() => {});
    $("#bar").style.width = "100%";
    $("#ph").textContent = stop ? "Import interrompu" : "Import terminé";
    $("#pt").innerHTML = `<b>${inserted}</b> livre(s) ajouté(s), <b>${updated}</b> mis à jour${skipped ? `, ${skipped} déjà présent(s) ignoré(s)` : ""}${errors.length ? `, <b style="color:var(--bad)">${errors.length}</b> ligne(s) non importée(s)` : ""}. Les changements sont déjà visibles sur le site.`;
    const acts = $("#stop").parentElement;
    acts.innerHTML = `${errors.length ? '<button class="btn" id="dlErr">Télécharger le rapport d’erreurs</button>' : ""}<a class="btn" href="#/livres">Voir le catalogue</a><button class="btn primary" id="again">Importer un autre fichier</button>`;
    $("#dlErr")?.addEventListener("click", () => download("rapport-import.csv", toCsv([["ligne", "probleme"], ...errors.sort((a, b) => a.line - b.line).map((e) => [e.line, e.error])])));
    $("#again").onclick = () => render(main);
    toast("Import terminé.");
  }

  stepFile();
}
