// Book page (server-rendered): header behaviour, cover fallback, gentle 3D tilt of the cover.
import { initChrome } from "./chrome.js";
import { repairBrokenCovers } from "./views.js"; // drawn cover when an image fails to load

initChrome();
repairBrokenCovers();
addEventListener("load", () => repairBrokenCovers());
const el = document.querySelector("[data-tilt]");
if (el && matchMedia("(pointer:fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let raf = 0;
  el.parentElement.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => (el.style.transform = `perspective(1200px) rotateY(${(-18 + x * 14).toFixed(2)}deg) rotateX(${(y * -8).toFixed(2)}deg)`));
  });
  el.parentElement.addEventListener("pointerleave", () => (el.style.transform = ""));
}
