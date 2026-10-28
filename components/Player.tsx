"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useUI } from "@/lib/UIContext";
import { useLang } from "@/lib/LanguageContext";
import { FILM } from "@/data/site";

/**
 * Lecteur plein écran (film ou image d'étude). Fond noir opaque, aucun
 * texte posé sur le film. Échap ou le bouton ferme ; le focus reste
 * dans le lecteur puis revient au bouton qui l'a ouvert.
 */
export default function Player() {
  const { viewer, closeViewer } = useUI();
  const { t } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  // ouverture / fermeture : page inerte derrière, défilement bloqué, focus géré
  useEffect(() => {
    const app = document.getElementById("app");
    if (!viewer) return;
    lastFocus.current = document.activeElement as HTMLElement;
    app?.setAttribute("inert", "");
    document.body.style.overflow = "hidden";
    document.dispatchEvent(new CustomEvent("estalia:player", { detail: true }));
    requestAnimationFrame(() => boxRef.current?.classList.add("is-open"));
    closeRef.current?.focus();
    return () => {
      app?.removeAttribute("inert");
      document.body.style.overflow = "";
      document.dispatchEvent(new CustomEvent("estalia:player", { detail: false }));
      lastFocus.current?.focus?.();
    };
  }, [viewer]);

  // le film démarre à l'instant demandé, avec le son (le clic du visiteur l'autorise)
  useEffect(() => {
    const v = videoRef.current;
    if (!v || viewer?.kind !== "film") return;
    const start = viewer.start;
    const go = () => {
      try {
        v.currentTime = start;
      } catch {
        // métadonnées pas encore prêtes
      }
      v.muted = false;
      v.play().catch(() => {});
    };
    if (v.readyState >= 1) go();
    else v.addEventListener("loadedmetadata", go, { once: true });
    return () => v.removeEventListener("loadedmetadata", go);
  }, [viewer]);

  useEffect(() => {
    if (!viewer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "Tab") {
        const f = [closeRef.current, videoRef.current].filter(Boolean) as HTMLElement[];
        const i = f.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [viewer, closeViewer]);

  if (!viewer) return null;

  return (
    <div
      ref={boxRef}
      className="player"
      role="dialog"
      aria-modal="true"
      aria-label={t({ fr: "Lecteur", en: "Player" })}
      onClick={(e) => {
        const el = e.target as HTMLElement;
        if (el === e.currentTarget || el.classList.contains("stage")) closeViewer();
      }}
    >
      <button ref={closeRef} type="button" className="player-close" onClick={closeViewer} aria-label={t({ fr: "Fermer", en: "Close" })}>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      <div className="stage">
        {viewer.kind === "film" ? (
          <video ref={videoRef} src={FILM.src} poster={FILM.poster} controls playsInline preload="auto" />
        ) : (
          <>
            <div className="img-box">
              <Image src={viewer.src} alt={viewer.alt} fill sizes="100vw" />
            </div>
            <p className="pcap">{viewer.caption}</p>
          </>
        )}
      </div>
    </div>
  );
}
