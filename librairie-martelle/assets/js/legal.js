// Legal pages. Text comes from the admin (site_content); otherwise a template whose missing facts are
// clearly marked « À compléter » — nothing (company number, host, publisher) is ever invented.
import { LIVE, loadContent, esc, SHOP, loadSettings } from "./data.js";
import { initChrome } from "./chrome.js";
import { legalTemplates } from "./legal-templates.js";

initChrome();
const box = document.getElementById("legal");
const key = box.dataset.key;
/** Minimal, safe formatting: "## " headings and paragraphs; everything else is escaped text. */
function render(text) {
  return String(text).split(/\n{2,}/).map((block) => {
    const lines = block.split("\n");
    const h = lines[0].startsWith("## ") ? `<h2>${esc(lines.shift().slice(3))}</h2>` : "";
    const body = lines.map((l) => esc(l).replace(/\[À compléter : ([^\]]+)\]/g, '<mark class="todo">À compléter : $1</mark>')).join("<br>");
    return h + (body ? `<p>${body}</p>` : "");
  }).join("");
}

(async () => {
  await loadSettings();
  const content = LIVE ? await loadContent() : {};
  const txt = typeof content[key] === "string" && content[key].trim() ? content[key] : legalTemplates(SHOP)[key]();
  box.innerHTML = render(txt) + (/\[À compléter/.test(txt) ? `<p class="todo-note" role="note">Ce document contient des informations à compléter par la librairie avant la mise en ligne officielle.</p>` : "");
  box.setAttribute("aria-busy", "false");
})();
