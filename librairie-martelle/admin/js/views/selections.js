import { selection, patchBooks, searchBooks, coverOf, reorderSelection } from "../api.js";
import { html, raw, esc, I, thumbHTML, toast, debounce } from "../ui.js";

const KINDS = [
  { k: "new", flag: "is_new", rank: "new_rank", title: "Nouveautés", hint: "Affichées dans « Fraîchement arrivés »." },
  { k: "best", flag: "is_bestseller", rank: "bestseller_rank", title: "Meilleures ventes", hint: "Le classement apparaît dans cet ordre (n° 1 en haut)." },
  { k: "picks", flag: "is_staff_pick", rank: "pick_rank", title: "Coups de cœur", hint: "Ajoutez le mot du libraire : il est affiché sur le site." },
];

export async function render(main) {
  main.innerHTML = html`<div class="topbar"><div><h1>Sélections</h1><div class="sub">Choisissez les livres mis en avant sur la page d’accueil et réglez leur ordre.</div></div></div>
  <div class="sel-cols">${raw(KINDS.map((K) => `<section class="card" data-k="${K.k}"><h2>${K.title} <span class="muted small" data-n></span></h2><p class="small muted" style="margin:-8px 0 12px">${K.hint}</p>
    <div class="typeahead"><input class="in" placeholder="Ajouter un livre (titre, auteur, ISBN)…" data-ta aria-label="Ajouter un livre aux ${K.title.toLowerCase()}"><div class="ta-list" hidden></div></div>
    <div data-items style="margin-top:12px"><div class="empty"><span class="spin"></span></div></div></section>`).join(""))}</div>`;

  const lists = {};
  async function load(K) {
    lists[K.k] = await selection(K.k);
    draw(K);
  }
  function draw(K) {
    const sec = main.querySelector(`[data-k="${K.k}"]`);
    const items = lists[K.k];
    sec.querySelector("[data-n]").textContent = `(${items.length})`;
    sec.querySelector("[data-items]").innerHTML = items.length
      ? items.map((b, i) => `<div class="sel-item" data-id="${b.id}"><span class="n">${i + 1}</span>${thumbHTML({ ...b, _cover: coverOf(b) })}
          <div class="t">${esc(b.title)}<small>${esc(b.authors_text || "")}${b.published ? "" : " · non publié"}</small></div>
          <div class="acts"><button class="icon-btn" data-mv="-1" aria-label="Monter" ${i === 0 ? "disabled" : ""}>${I.up}</button><button class="icon-btn" data-mv="1" aria-label="Descendre" ${i === items.length - 1 ? "disabled" : ""}>${I.down}</button><button class="icon-btn" data-rm aria-label="Retirer de la sélection">${I.x}</button></div>
          ${K.k === "picks" ? `<div class="pick-note"><textarea class="in" rows="3" maxlength="1200" data-note placeholder="Le mot du libraire…">${esc(b.staff_note || "")}</textarea><div class="row"><input class="in grow" maxlength="80" data-name placeholder="Signé par…" value="${esc(b.staff_name || "")}" style="width:auto"><button class="btn sm" data-savenote>Enregistrer</button></div></div>` : ""}</div>`).join("")
      : `<div class="empty" style="padding:24px 10px">Aucun livre. Utilisez la recherche ci-dessus pour en ajouter.</div>`;
  }
  async function saveOrder(K) {
    await reorderSelection(K.k, lists[K.k].map((b) => b.id));
  }

  for (const K of KINDS) {
    const sec = main.querySelector(`[data-k="${K.k}"]`);
    const inp = sec.querySelector("[data-ta]"), box = sec.querySelector(".ta-list");
    let results = [];
    inp.addEventListener("input", debounce(async () => {
      const q = inp.value.trim();
      if (q.length < 2) { box.hidden = true; return; }
      results = (await searchBooks(q, 8)).filter((b) => !lists[K.k].some((x) => x.id === b.id));
      box.innerHTML = results.length ? results.map((b, i) => `<button type="button" class="ta-it" data-i="${i}">${thumbHTML({ ...b, _cover: coverOf(b) })}<span><b>${esc(b.title)}</b><br><span class="small muted">${esc(b.authors_text || "")}</span></span></button>`).join("") : '<div class="small muted" style="padding:10px">Aucun livre trouvé. Ajoutez-le d’abord au catalogue.</div>';
      box.hidden = false;
    }, 250));
    inp.addEventListener("blur", () => setTimeout(() => (box.hidden = true), 200));
    box.addEventListener("click", async (e) => {
      const it = e.target.closest("[data-i]");
      if (!it) return;
      const b = results[+it.dataset.i];
      box.hidden = true; inp.value = "";
      try {
        await patchBooks([b.id], { [K.flag]: true, [K.rank]: 0 });
        lists[K.k].unshift({ ...b, [K.flag]: true });
        await saveOrder(K);
        draw(K);
        toast(`« ${b.title} » ajouté aux ${K.title.toLowerCase()}.`);
      } catch (err) { toast(err.message, "bad"); }
    });
    sec.addEventListener("click", async (e) => {
      const row = e.target.closest(".sel-item");
      if (!row) return;
      const items = lists[K.k];
      const i = items.findIndex((b) => b.id === row.dataset.id);
      try {
        const mv = e.target.closest("[data-mv]");
        if (mv) {
          const j = i + +mv.dataset.mv;
          if (j < 0 || j >= items.length) return;
          [items[i], items[j]] = [items[j], items[i]];
          draw(K);
          await saveOrder(K);
        }
        if (e.target.closest("[data-rm]")) {
          await patchBooks([items[i].id], { [K.flag]: false });
          items.splice(i, 1);
          draw(K);
          toast("Retiré de la sélection.");
        }
        if (e.target.closest("[data-savenote]")) {
          const note = row.querySelector("[data-note]").value.trim() || null;
          const name = row.querySelector("[data-name]").value.trim() || null;
          await patchBooks([items[i].id], { staff_note: note, staff_name: name });
          Object.assign(items[i], { staff_note: note, staff_name: name });
          toast("Mot du libraire enregistré.");
        }
      } catch (err) { toast(err.message, "bad"); load(K); }
    });
  }
  await Promise.all(KINDS.map(load));
}
