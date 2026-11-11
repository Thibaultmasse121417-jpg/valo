import { getBook, saveBook, deleteBooks, findByIsbn, categories, coverOf, uploadImage, removeImage, copyRemoteCover, publicUrl } from "../api.js";
import { html, raw, esc, I, AVAIL, toast, confirmDialog, parsePrice, guardDirty } from "../ui.js";
import { normalizeIsbn, formatIsbn, lookupIsbn, normalizeDate, canScan, scanBarcode } from "../isbn.js";
import { splitAuthors } from "../csv.js";

export async function render(main, [id]) {
  const isNew = !id || id === "nouveau";
  const [cats, book] = await Promise.all([categories(), isNew ? null : getBook(id)]);
  const b = book || { availability: "in_stock", published: true, authors: [] };
  // cover state: what will be saved
  const cover = { path: b.cover_path || null, url: b.cover_url || null, credit: b.cover_credit || null, file: null, candidate: null, removed: false };

  main.innerHTML = html`
  <div class="topbar"><div><h1>${isNew ? "Ajouter un livre" : b.title}</h1><div class="sub">${isNew ? "Saisissez ou scannez l’ISBN : les informations sont complétées automatiquement quand elles existent." : `Modifié le ${new Date(b.updated_at).toLocaleString("fr-FR")}${b.metadata_source ? " · Données : " + b.metadata_source : ""}`}</div></div>
    <div class="row">${!isNew && b.published ? raw(`<a class="btn" href="../#livre-${b.id}" target="_blank" rel="noopener">${I.ext} Voir sur le site</a>`) : ""}<a class="btn ghost" href="#/livres">← Retour à la liste</a></div></div>
  <form id="bf" novalidate>
  <div class="form-grid"><div class="stack">
    <section class="card">
      <div class="isbn-bar">
        <label class="f">ISBN (code-barres au dos du livre)<input class="in big" name="isbn" id="isbn" inputmode="numeric" autocomplete="off" placeholder="978…" value="${formatIsbn(b.isbn)}"></label>
        ${canScan() ? raw(`<button type="button" class="btn lg" id="scan">${I.scan} Scanner</button>`) : ""}
        <button type="button" class="btn lg dark" id="lookup">${raw(I.search)} Rechercher</button>
      </div>
      <div id="lk" style="margin-top:12px"></div>
    </section>
    <section class="card"><h2>Informations</h2><div class="grid g2">
      <label class="f span2">Titre *<input class="in" name="title" required maxlength="300" value="${b.title || ""}"></label>
      <label class="f span2">Sous-titre<input class="in" name="subtitle" maxlength="300" value="${b.subtitle || ""}"></label>
      <label class="f span2">Auteur(s) <span class="hint">Séparez plusieurs auteurs par une virgule</span><input class="in" name="authors" value="${(b.authors || []).join(", ")}"></label>
      <label class="f">Éditeur<input class="in" name="publisher" maxlength="200" value="${b.publisher || ""}"></label>
      <label class="f">Date de parution <span class="hint">AAAA ou AAAA-MM-JJ</span><input class="in" name="published_date" placeholder="2026" value="${b.published_date || ""}"></label>
      <label class="f">Nombre de pages<input class="in" name="page_count" inputmode="numeric" value="${b.page_count || ""}"></label>
      <label class="f">Langue<input class="in" name="language" maxlength="10" placeholder="fr" value="${b.language || ""}"></label>
      <label class="f span2">Résumé <span class="hint">Affiché sur la fiche du livre</span><textarea class="in" name="description" maxlength="8000" rows="7">${b.description || ""}</textarea></label>
    </div></section>
    <section class="card"><h2>Vente</h2><div class="grid g2">
      <label class="f">Rayon *<select class="in" name="category_id"><option value="">— Choisir un rayon —</option>${raw(cats.map((c) => `<option value="${c.id}" ${c.id === b.category_id ? "selected" : ""}>${esc(c.title)}</option>`).join(""))}</select></label>
      <label class="f">Prix de vente (€)<input class="in" name="price" inputmode="decimal" placeholder="18,50" value="${b.price !== null && b.price !== undefined ? String(b.price).replace(".", ",") : ""}"></label>
      <div class="f span2" role="group" aria-label="Disponibilité"><span style="font-weight:600;font-size:13.5px">Disponibilité</span><div class="seg">${raw(Object.entries(AVAIL).map(([k, v]) => `<label><input type="radio" name="availability" value="${k}" ${k === b.availability ? "checked" : ""}><span>${v}</span></label>`).join(""))}</div></div>
      <label class="f">Quantité en stock <span class="hint">Facultatif — mis à jour par le logiciel de stock si connecté</span><input class="in" name="stock_qty" inputmode="numeric" value="${b.stock_qty ?? ""}"></label>
      <label class="f">Référence dans le logiciel de stock<input class="in" name="external_ref" maxlength="120" value="${b.external_ref || ""}"></label>
    </div></section>
    <section class="card"><h2>Mise en avant sur le site</h2>
      <div class="grid" style="gap:12px">
        <label class="check"><input type="checkbox" name="is_new" ${b.is_new ? "checked" : ""}> Nouveauté</label>
        <label class="check"><input type="checkbox" name="is_bestseller" ${b.is_bestseller ? "checked" : ""}> Meilleure vente</label>
        <label class="check"><input type="checkbox" name="is_staff_pick" id="pick" ${b.is_staff_pick ? "checked" : ""}> Coup de cœur des libraires</label>
        <div id="pickF" class="grid g2" ${b.is_staff_pick ? "" : "hidden"} style="padding-left:28px">
          <label class="f span2">Le mot du libraire<textarea class="in" name="staff_note" maxlength="1200" rows="4" placeholder="Pourquoi nous l’avons aimé…">${b.staff_note || ""}</textarea></label>
          <label class="f">Signé par<input class="in" name="staff_name" maxlength="80" placeholder="Prénom du libraire" value="${b.staff_name || ""}"></label>
        </div>
        <label class="switch" style="margin-top:6px"><input type="checkbox" name="published" ${b.published ? "checked" : ""}> Visible sur le site</label>
      </div>
    </section>
  </div>
  <aside class="cover-box card">
    <div class="cover-prev" id="cp"></div>
    <div class="grid" style="gap:8px">
      <label class="btn" style="cursor:pointer">${raw(I.upload)} Importer une image<input type="file" accept="image/jpeg,image/png,image/webp" id="file" hidden></label>
      <button type="button" class="btn ghost" id="rmCover">Retirer la couverture</button>
      <p class="small muted" id="credit" style="margin:0"></p>
      <p class="small muted" style="margin:0">Sur téléphone, vous pouvez photographier la couverture.</p>
    </div>
  </aside></div>
  <div class="sticky-actions">
    ${!isNew ? raw('<button type="button" class="btn danger" id="del">Supprimer</button><span class="grow"></span>') : ""}
    ${isNew ? raw('<button type="submit" class="btn" data-next="1">Enregistrer et ajouter un autre</button>') : ""}
    <button type="submit" class="btn primary lg">Enregistrer</button>
  </div></form>`;

  const $ = (s) => main.querySelector(s);
  const f = $("#bf");
  const guard = guardDirty(f);
  const field = (n) => f.elements[n];

  function drawCover() {
    const cp = $("#cp");
    let src = null;
    if (cover.file) src = URL.createObjectURL(cover.file);
    else if (cover.candidate) src = cover.candidate.url;
    else if (!cover.removed) src = cover.path ? publicUrl(cover.path) : cover.url;
    cp.innerHTML = src ? `<img src="${esc(src)}" alt="Couverture">` : `<div class="ph">${esc(field("title").value || "Pas de couverture")}</div>`;
    $("#credit").textContent = cover.file ? "Image importée (enregistrée à la validation)." : cover.candidate ? cover.candidate.credit : !cover.removed && cover.credit ? cover.credit : "";
  }
  drawCover();

  $("#pick").onchange = (e) => ($("#pickF").hidden = !e.target.checked);
  $("#file").onchange = (e) => { const file = e.target.files[0]; if (!file) return; if (file.size > 15e6) { toast("Image trop lourde (15 Mo max).", "bad"); return; } cover.file = file; cover.candidate = null; drawCover(); };
  $("#rmCover").onclick = () => { cover.file = null; cover.candidate = null; cover.removed = true; drawCover(); };
  field("title").addEventListener("input", () => { if (!cover.file && !cover.candidate && (cover.removed || (!cover.path && !cover.url))) drawCover(); });

  /* ----- ISBN lookup ----- */
  async function doLookup() {
    const lk = $("#lk");
    const isbn = normalizeIsbn(field("isbn").value);
    field("isbn").classList.toggle("err", !isbn);
    if (!isbn) { lk.innerHTML = '<div class="notice bad">Cet ISBN n’est pas valide. Vérifiez les 13 chiffres (ou 10) sous le code-barres.</div>'; return; }
    field("isbn").value = formatIsbn(isbn);
    lk.innerHTML = '<span class="spin sm"></span> Recherche en cours…';
    try {
      const dup = await findByIsbn(isbn);
      if (dup && dup.id !== b.id) { lk.innerHTML = html`<div class="notice">Ce livre est déjà au catalogue : <b>${dup.title}</b>. <a href="#/livres/${dup.id}">Ouvrir sa fiche</a></div>`; return; }
      const res = await lookupIsbn(isbn);
      const warn = res.warnings.length ? `<div class="small muted" style="margin-top:6px">${esc(res.warnings.join(" "))}</div>` : "";
      if (!res.found) { lk.innerHTML = `<div class="notice info">Aucune information trouvée pour cet ISBN. Vous pouvez compléter la fiche à la main.</div>${warn}`; field("title").focus(); return; }
      const d = res.data;
      let kept = 0;
      const fill = (name, val) => { if (val === null || val === undefined || val === "" || (Array.isArray(val) && !val.length)) return; const el = field(name); const v = Array.isArray(val) ? val.join(", ") : String(val); if (el.value.trim() && el.value.trim() !== v) { kept++; return; } el.value = v; };
      fill("title", d.title); fill("subtitle", d.subtitle); fill("authors", d.authors); fill("publisher", d.publisher);
      fill("published_date", d.published_date); fill("page_count", d.page_count); fill("language", d.language); fill("description", d.description);
      f.dataset.source = d.metadata_source;
      const hasCover = cover.file || (!cover.removed && (cover.path || cover.url));
      if (!hasCover && d.cover_candidates.length) { cover.candidate = d.cover_candidates[0]; cover.removed = false; }
      drawCover();
      lk.innerHTML = `<div class="notice ok">Informations trouvées (${esc(res.sources.join(" + "))}). Vérifiez-les, choisissez le rayon et le prix, puis enregistrez.${kept ? ` ${kept} champ(s) déjà rempli(s) ont été conservés.` : ""}</div>${warn}`;
      if (d.cover_candidates.length > 1 || (hasCover && d.cover_candidates.length)) {
        lk.insertAdjacentHTML("beforeend", `<div class="row small" style="margin-top:8px">Autres couvertures : ${d.cover_candidates.map((c, i) => `<button type="button" class="btn sm" data-cand="${i}">${esc(c.credit.replace("Couverture : ", ""))}</button>`).join("")}</div>`);
        lk.querySelectorAll("[data-cand]").forEach((bt) => (bt.onclick = () => { cover.candidate = d.cover_candidates[+bt.dataset.cand]; cover.file = null; cover.removed = false; drawCover(); }));
      }
      if (!field("category_id").value) field("category_id").focus();
    } catch (e) { lk.innerHTML = `<div class="notice bad">${esc(e.message)}</div>`; }
  }
  $("#lookup").onclick = doLookup;
  field("isbn").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); doLookup(); } });
  $("#scan")?.addEventListener("click", async () => { const code = await scanBarcode(); if (code) { field("isbn").value = code; doLookup(); } });
  if (isNew) setTimeout(() => field("isbn").focus(), 50);

  /* ----- save ----- */
  function collect() {
    const errs = [];
    const v = (n) => field(n).value.trim();
    const rec = {
      title: v("title"), subtitle: v("subtitle") || null, authors: splitAuthors(v("authors")),
      publisher: v("publisher") || null, language: v("language") || null, description: v("description") || null,
      category_id: v("category_id") || null, availability: f.querySelector('[name="availability"]:checked')?.value || "in_stock",
      external_ref: v("external_ref") || null,
      is_new: field("is_new").checked, is_bestseller: field("is_bestseller").checked, is_staff_pick: field("is_staff_pick").checked,
      staff_note: v("staff_note") || null, staff_name: v("staff_name") || null, published: field("published").checked,
    };
    f.querySelectorAll(".err").forEach((x) => x.classList.remove("err"));
    const bad = (n, m) => { errs.push(m); field(n).classList.add("err"); };
    if (!rec.title) bad("title", "Le titre est obligatoire.");
    const isbnRaw = v("isbn");
    rec.isbn = isbnRaw ? normalizeIsbn(isbnRaw) : null;
    if (isbnRaw && !rec.isbn) bad("isbn", "ISBN invalide.");
    const price = parsePrice(v("price"));
    if (Number.isNaN(price)) bad("price", "Prix invalide (ex. 18,50)."); else rec.price = price;
    const pd = v("published_date");
    rec.published_date = pd ? normalizeDate(pd) : null;
    if (pd && !rec.published_date) bad("published_date", "Date de parution invalide (ex. 2026 ou 2026-03-15).");
    for (const n of ["page_count", "stock_qty"]) {
      const s = v(n);
      if (!s) { rec[n] = null; continue; }
      const k = parseInt(s, 10);
      if (!Number.isFinite(k) || k < 0 || String(k) !== s.replace(/^0+(?=\d)/, "")) bad(n, n === "page_count" ? "Nombre de pages invalide." : "Quantité en stock invalide.");
      else rec[n] = n === "page_count" && k === 0 ? null : k;
    }
    if (f.dataset.source && isNew) { rec.metadata_source = f.dataset.source; rec.source = "isbn"; }
    else if (isNew) rec.source = "manual";
    if (!rec.category_id && rec.published) errs.push("Choisissez un rayon pour que le livre apparaisse sur le site (ou décochez « Visible sur le site »).");
    return { rec, errs };
  }

  let saving = false;
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (saving) return;
    const next = e.submitter?.dataset.next;
    const { rec, errs } = collect();
    if (errs.length) { toast(errs[0], "bad", 6000); f.querySelector(".err")?.focus(); return; }
    saving = true;
    f.querySelectorAll("button[type=submit]").forEach((x) => (x.disabled = true));
    const oldPath = b.cover_path;
    try {
      if (cover.file) { rec.cover_path = await uploadImage(cover.file); rec.cover_url = null; rec.cover_credit = null; }
      else if (cover.candidate) {
        const path = cover.candidate.copy ? await copyRemoteCover(cover.candidate.url) : null;
        if (path) { rec.cover_path = path; rec.cover_url = null; } else { rec.cover_path = null; rec.cover_url = cover.candidate.url; }
        rec.cover_credit = cover.candidate.credit;
      } else if (cover.removed) { rec.cover_path = null; rec.cover_url = null; rec.cover_credit = null; }
      const saved = await saveBook(isNew ? null : b.id, rec);
      if (oldPath && oldPath !== saved.cover_path) removeImage(oldPath);
      guard.clean();
      toast(isNew ? "Livre ajouté au catalogue." : "Modifications enregistrées.");
      if (next) { location.hash = "#/livres/nouveau"; dispatchEvent(new HashChangeEvent("hashchange")); }
      else location.hash = `#/livres/${saved.id}`;
      if (!isNew) Object.assign(b, saved);
    } catch (err) {
      if (rec.cover_path && rec.cover_path !== oldPath) removeImage(rec.cover_path);
      if (err.code === "23505") {
        const dup = rec.isbn && (await findByIsbn(rec.isbn).catch(() => null));
        $("#lk").innerHTML = html`<div class="notice">Ce livre est déjà au catalogue.${dup ? raw(` <a href="#/livres/${dup.id}">Ouvrir sa fiche</a>`) : ""}</div>`;
        scrollTo({ top: 0, behavior: "smooth" });
      }
      toast(err.message, "bad", 6000);
    }
    saving = false;
    f.querySelectorAll("button[type=submit]").forEach((x) => (x.disabled = false));
  });
  addEventListener("keydown", onKey);
  function onKey(e) { if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); f.requestSubmit(); } }

  $("#del")?.addEventListener("click", async () => {
    if (!(await confirmDialog({ title: "Supprimer ce livre ?", body: `« ${b.title} » sera retiré du catalogue et du site. Cette action est définitive.`, ok: "Supprimer", danger: true }))) return;
    try { await deleteBooks([b.id]); guard.clean(); toast("Livre supprimé."); location.hash = "#/livres"; } catch (err) { toast(err.message, "bad"); }
  });

  return () => { guard.dispose(); removeEventListener("keydown", onKey); };
}
