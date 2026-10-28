"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { T, useLang } from "@/lib/LanguageContext";
import { useUI } from "@/lib/UIContext";
import { FILM } from "@/data/site";

const pad = (n: number) => (n < 10 ? "0" : "") + n;
const timecode = (t: number) => `00:00:${pad(Math.floor(t))}:${pad(Math.floor((t % 1) * 24))}`;

/**
 * Premier écran : le film en plein écran, muet et en boucle, avec une
 * image de remplacement tant qu'il ne joue pas. Pause et son sont au
 * choix du visiteur. Avec « réduire les animations » ou l'économiseur
 * de données, le film ne démarre pas tout seul.
 */
export default function Hero() {
  const { t } = useLang();
  const { openFilm } = useUI();
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const userPaused = useRef(false);
  const visible = useRef(true);
  const playerOpen = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [noVideo, setNoVideo] = useState(false);

  const play = useCallback(() => {
    const v = videoRef.current;
    if (!v || userPaused.current || !visible.current || playerOpen.current) return;
    if (v.preload === "none") v.preload = "auto";
    v.play().catch(() => setPlaying(false));
  }, []);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const lowPower = !!conn?.saveData || ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 2;
    userPaused.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches || lowPower;

    const hero = heroRef.current!;
    const io = new IntersectionObserver(([en]) => {
      visible.current = en.isIntersecting;
      if (en.isIntersecting) play();
      else videoRef.current?.pause();
    }, { threshold: 0.2 });
    io.observe(hero);

    const onVis = () => (document.hidden ? videoRef.current?.pause() : play());
    const onPlayer = (e: Event) => {
      playerOpen.current = (e as CustomEvent<boolean>).detail;
      if (playerOpen.current) videoRef.current?.pause();
      else play();
    };
    document.addEventListener("visibilitychange", onVis);
    document.addEventListener("estalia:player", onPlayer);
    play();
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      document.removeEventListener("estalia:player", onPlayer);
    };
  }, [play]);

  // timecode synchronisé sur la lecture
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      if (tcRef.current && videoRef.current) tcRef.current.textContent = timecode(videoRef.current.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const togglePause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      play();
    } else {
      userPaused.current = true;
      v.pause();
    }
  };
  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) {
      userPaused.current = false;
      play();
    }
  };

  return (
    <section ref={heroRef} className={`hero${playing ? " is-playing" : ""}`} id="top" aria-labelledby="hero-title">
      <div className="hero-media">
        <Image src={FILM.poster} alt="" fill priority sizes="100vw" />
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster={FILM.poster}
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setNoVideo(true)}
        >
          <source src={FILM.src} type="video/mp4" onError={() => setNoVideo(true)} />
        </video>
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="viewfinder" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="hero-inner">
        <div className="wrap hero-grid">
          <div className="hero-head">
            <p className="label">
              <T fr="Estalia Studio — Films, sites web & direction artistique" en="Estalia Studio — Films, websites & art direction" />
            </p>
            <h1 className="display hero-title" id="hero-title">
              <T
                fr={<><span className="tl"><span>Des images</span></span><span className="tl"><span>qui se <em>ressentent.</em></span></span></>}
                en={<><span className="tl"><span>Images</span></span><span className="tl"><span>you can <em>feel.</em></span></span></>}
              />
            </h1>
          </div>
          <div className="hero-body">
            <p className="hero-sub">
              <T
                fr="Films de promotion, sites web et direction artistique pour les commerces, agences immobilières, campings, hôtels et notaires."
                en="Promotional films, websites and art direction for shops, estate agencies, campsites, hotels and notaries."
              />
            </p>
            <div className="hero-ctas">
              <a className="btn btn--solid" href="#contact">
                <T fr="Demander un devis" en="Request a quote" /> <span className="arr" aria-hidden="true">→</span>
              </a>
              <button type="button" className="btn" onClick={() => openFilm(0)}>
                <T fr="Voir le film" en="Watch the film" />
              </button>
            </div>
          </div>
          <div className="hero-panel">
            <p className="np label">
              <span className="rec" aria-hidden="true" />
              <T fr="À l’écran — Villa triplex, San Peïre" en="On screen — Villa triplex, San Peïre" />
            </p>
            <p className="tc" aria-hidden="true">
              <span ref={tcRef}>00:00:00:00</span> / 00:00:50:00
            </p>
            <div className="hero-controls">
              {!noVideo && (
                <>
                  <button type="button" className="ctl" onClick={togglePause} aria-pressed={!playing}>
                    {playing ? (
                      <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.4" height="12" fill="currentColor" /><rect x="9.6" y="2" width="3.4" height="12" fill="currentColor" /></svg>
                    ) : (
                      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2l10 6-10 6z" fill="currentColor" /></svg>
                    )}
                    {playing ? "Pause" : t({ fr: "Lecture", en: "Play" })}
                  </button>
                  <button type="button" className="ctl" onClick={toggleSound} aria-pressed={!muted}>
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path d="M2 6h3l4-3v10L5 10H2z" fill="currentColor" />
                      <path d="M11.5 5.5a3.5 3.5 0 010 5M13 3.8a6 6 0 010 8.4" stroke="currentColor" fill="none" strokeWidth="1.2" opacity={muted ? 0.35 : 1} />
                    </svg>
                    {muted ? (
                      <>
                        <span className="long"><T fr="Activer le son" en="Sound on" /></span>
                        <span className="short"><T fr="Son" en="Sound" /></span>
                      </>
                    ) : (
                      <T fr="Couper le son" en="Sound off" />
                    )}
                  </button>
                </>
              )}
              <button type="button" className="ctl" onClick={() => openFilm(0)}>
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 4.5V1.5h3M11.5 1.5h3v3M14.5 11.5v3h-3M4.5 14.5h-3v-3" stroke="currentColor" fill="none" strokeWidth="1.2" /></svg>
                <span className="long"><T fr="Voir le film en entier" en="Watch the full film" /></span>
                <span className="short"><T fr="Film entier" en="Full film" /></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
