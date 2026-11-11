// Header behaviour shared by every public page: live search suggestions, mobile menu, announcement.
import { LIVE, api, esc, fold, bookPath, priceTxt, loadSettings, SHOP } from "./data.js";
import { coverHTML } from "./views.js";

export function initChrome({ home = false } = {}) {
  /* ---------- search: works without JS (GET catalogue.html?q=), enhanced with suggestions ---------- */
  document.querySelectorAll("form.search").forEach((form) => {
    const input = form.querySelector("input[name=q]");
    const box = form.querySelector(".sugg");
    if (!input || !box || !LIVE) return;
    let t, ctrl, items = [], sel = -1;
    const close = () => { box.hidden = true; sel = -1; input.setAttribute("aria-expanded", "false"); };
    const draw = () => {
      box.innerHTML = items.length
        ? items.map((b, i) => `<a role="option" id="sg-${i}" class="sg${i === sel ? " on" : ""}" href="${bookPath(b)}"><span class="sg-cv">${coverHTML(b)}</span><span><b>${esc(b.title)}</b><small>${esc(b.authors_text || "")}${b.price !== null && b.price !== undefined ? " · " + priceTxt(b.price) : ""}</small></span></a>`).join("") +
          `<a class="sg-all" href="catalogue.html?q=${encodeURIComponent(input.value.trim())}">Voir tous les résultats →</a>`
        : `<div class="sg-none">Aucun livre trouvé en ligne. <a href="mailto:${esc(SHOP.email)}?subject=${encodeURIComponent("Recherche : " + input.value.trim())}">Demandez-le aux libraires</a> : ils peuvent le commander.</div>`;
      box.hidden = false; input.setAttribute("aria-expanded", "true");
      input.setAttribute("aria-activedescendant", sel >= 0 ? "sg-" + sel : "");
    };
    input.setAttribute("role", "combobox"); input.setAttribute("aria-autocomplete", "list"); input.setAttribute("aria-expanded", "false");
    input.addEventListener("input", () => {
      clearTimeout(t);
      const q = fold(input.value).replace(/[,()*%"\\:]/g, " ").trim();
      if (q.length < 2) { close(); return; }
      t = setTimeout(async () => {
        ctrl?.abort(); ctrl = new AbortController();
        try {
          const digits = q.replace(/[^0-9]/g, "");
          const term = digits.length >= 10 ? digits : q;
          items = await api(`books?select=id,isbn,title,authors_text,price,cover_path,cover_url,category_id&search_text=ilike.*${encodeURIComponent(term)}*&order=is_new.desc,title.asc&limit=6`, { signal: ctrl.signal });
          sel = -1; draw();
        } catch (e) { if (e.name !== "AbortError") close(); }
      }, 220);
    });
    input.addEventListener("keydown", (e) => {
      if (box.hidden) return;
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(items.length - 1, sel + 1); draw(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(-1, sel - 1); draw(); }
      else if (e.key === "Enter" && sel >= 0) { e.preventDefault(); location.href = bookPath(items[sel]); }
      else if (e.key === "Escape") { close(); }
    });
    input.addEventListener("blur", () => setTimeout(close, 180));
  });

  /* ---------- mobile search toggle ---------- */
  document.querySelectorAll("[data-search-toggle]").forEach((b) => b.addEventListener("click", () => {
    const top = document.querySelector(".top");
    top.classList.toggle("searching");
    if (top.classList.contains("searching")) top.querySelector("form.search input")?.focus();
  }));

  /* ---------- sub-pages: simple accessible menu ---------- */
  if (!home) {
    const btn = document.querySelector("[data-menu]"), nav = document.getElementById("mnav");
    if (btn && nav) {
      const set = (open) => { nav.hidden = !open; btn.setAttribute("aria-expanded", String(open)); document.body.classList.toggle("locked", open); if (open) nav.querySelector("a")?.focus(); };
      btn.addEventListener("click", () => set(nav.hidden));
      nav.addEventListener("click", (e) => { if (e.target.closest("a") || e.target === nav) set(false); });
      addEventListener("keydown", (e) => { if (e.key === "Escape" && !nav.hidden) { set(false); btn.focus(); } });
    }
    loadSettings().then(() => {
      document.querySelectorAll("a[data-order]").forEach((a) => (a.href = SHOP.order_url));
      const an = document.getElementById("annc");
      if (an && SHOP.announcement) { an.textContent = SHOP.announcement; an.hidden = false; requestAnimationFrame(() => an.classList.add("on")); }
    });
  }
}
