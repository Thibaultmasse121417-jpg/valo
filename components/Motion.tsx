"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Mouvements de page, sans bibliothèque :
 *  - apparition des blocs [data-reveal] quand ils entrent à l'écran ;
 *  - léger zoom du film d'accueil et fondu du texte au défilement (--hp) ;
 *  - parallaxe discrète des images [data-parallax], sur ordinateur seulement.
 * Avec « réduire les animations », seuls les fondus restent (voir globals.css).
 */
export default function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let ticking = false;
    const update = () => {
      ticking = false;
      if (reduce.matches) return;
      const hero = document.getElementById("top");
      if (hero) {
        const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
        hero.style.setProperty("--hp", p.toFixed(3));
      }
      if (!fine.matches) return;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const r = (el.parentElement as HTMLElement).getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const c = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.setProperty("--py", `${(c * -3.5).toFixed(2)}%`);
      });
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return null;
}
