import { listPhotos, savePhoto, deletePhoto, uploadImage, publicUrl } from "../api.js";
import { html, raw, esc, toast, confirmDialog, I } from "../ui.js";

const SLOTS = { devanture: "Devanture", interieur: "Intérieur", rayons: "Rayons", equipe: "Équipe (photo principale de « L’équipe »)", evenements: "Événements", galerie: "Galerie" };

export async function render(main) {
  main.innerHTML = html`<div class="topbar"><div><h1>Photos de la librairie</h1><div class="sub">Devanture, rayons, équipe, rencontres : elles apparaissent sur la page d’accueil.</div></div>
    <label class="btn primary" style="cursor:pointer">${raw(I.upload)} Ajouter des photos<input type="file" id="up" accept="image/jpeg,image/png,image/webp" multiple hidden></label></div>
  <div class="notice info" style="margin-bottom:16px">Une photo n’est visible sur le site que si elle est <b>publiée</b> et que vous avez <b>confirmé disposer de l’autorisation</b> de la diffuser (photographe et personnes reconnaissables). Le texte alternatif décrit la photo pour les personnes malvoyantes.</div>
  <div class="grid g3" id="ph"></div>`;
  const box = main.querySelector("#ph");
  let photos = [];
  async function load() { photos = await listPhotos(); draw(); }
  function draw() {
    box.innerHTML = photos.length ? photos.map((p) => `<form class="card" data-id="${p.id}" style="display:grid;gap:10px">
      <img src="${esc(publicUrl(p.path))}" alt="" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:6px">
      <label class="f">Emplacement<select class="in" name="slot">${Object.entries(SLOTS).map(([k, v]) => `<option value="${k}" ${k === p.slot ? "selected" : ""}>${v}</option>`).join("")}</select></label>
      <label class="f">Description de l’image * <span class="hint">Ex. : la vitrine de la librairie rue des Vergeaux</span><input class="in" name="alt" required minlength="3" maxlength="200" value="${esc(p.alt)}"></label>
      <label class="f">Légende<input class="in" name="caption" maxlength="200" value="${esc(p.caption || "")}"></label>
      <label class="f">Crédit photo<input class="in" name="credit" maxlength="120" placeholder="© Nom du photographe" value="${esc(p.credit || "")}"></label>
      <label class="check"><input type="checkbox" name="rights" ${p.rights_confirmed ? "checked" : ""}> J’ai l’autorisation de publier cette photo</label>
      <label class="switch"><input type="checkbox" name="published" ${p.published ? "checked" : ""}> Publiée</label>
      <div class="row"><button class="btn sm primary">Enregistrer</button><button type="button" class="btn sm danger" data-del>Supprimer</button>
        <span class="small ${p.published && p.rights_confirmed ? "" : "muted"}" style="margin-left:auto">${p.published && p.rights_confirmed ? "✓ Visible sur le site" : "Non visible"}</span></div></form>`).join("")
      : '<div class="card" style="grid-column:1/-1"><div class="empty"><b>Aucune photo pour l’instant</b>Ajoutez la devanture, les rayons ou l’équipe : elles remplacent les emplacements graphiques du site.</div></div>';
  }
  main.querySelector("#up").addEventListener("change", async (e) => {
    const files = [...e.target.files];
    for (const file of files) {
      if (file.size > 25e6) { toast(`${file.name} : image trop lourde (25 Mo max).`, "bad"); continue; }
      try {
        const path = await uploadImage(file, "photos", 1800);
        await savePhoto(null, { path, slot: "galerie", alt: file.name.replace(/\.[a-z]+$/i, "").replace(/[-_]+/g, " ").slice(0, 200).padEnd(3, "."), published: false, rights_confirmed: false });
      } catch (err) { toast(err.message, "bad"); }
    }
    e.target.value = "";
    toast("Photo(s) ajoutée(s) : complétez la description et confirmez l’autorisation pour les publier.");
    load();
  });
  box.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, p = photos.find((x) => x.id === f.dataset.id);
    const rec = { slot: f.elements.slot.value, alt: f.elements.alt.value.trim(), caption: f.elements.caption.value.trim() || null, credit: f.elements.credit.value.trim() || null, rights_confirmed: f.elements.rights.checked, published: f.elements.published.checked };
    if (rec.alt.length < 3) { toast("Décrivez la photo (3 caractères minimum).", "bad"); f.elements.alt.focus(); return; }
    if (rec.published && !rec.rights_confirmed) toast("Photo enregistrée, mais elle restera invisible tant que l’autorisation n’est pas confirmée.", "bad", 6000);
    try { Object.assign(p, await savePhoto(p.id, rec)); draw(); if (!(rec.published && !rec.rights_confirmed)) toast("Photo enregistrée."); } catch (err) { toast(err.message, "bad"); }
  });
  box.addEventListener("click", async (e) => {
    if (!e.target.closest("[data-del]")) return;
    const p = photos.find((x) => x.id === e.target.closest("form").dataset.id);
    if (!(await confirmDialog({ title: "Supprimer cette photo ?", body: "Elle sera retirée du site et du stockage.", ok: "Supprimer", danger: true }))) return;
    try { await deletePhoto(p); toast("Photo supprimée."); load(); } catch (err) { toast(err.message, "bad"); }
  });
  await load();
}
