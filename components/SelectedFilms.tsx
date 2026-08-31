"use client";

import { useState } from "react";
import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import TitleWipe from "./TitleWipe";
import MediaPlaceholder from "./MediaPlaceholder";
import VideoModal from "./VideoModal";
import { useLanguage } from "@/lib/LanguageContext";
import { projects as allProjects, type Project } from "@/data/projects";

type MediaStatus = Record<string, { video: boolean; poster: boolean }>;

type FilmTileProps = {
  project: Project;
  index: number;
  status: { video: boolean; poster: boolean };
  onOpen: (project: Project) => void;
  watchLabel: string;
  playLabel: string;
  comingSoonLabel: string;
};

function FilmTile({
  project,
  index,
  status,
  onOpen,
  watchLabel,
  playLabel,
  comingSoonLabel,
}: FilmTileProps) {
  const isRight = project.align === "right";

  return (
    <div
      className={`grid grid-cols-1 items-center gap-6 md:grid-cols-12 md:gap-8 ${
        index % 2 === 1 ? "md:mt-20 lg:mt-28" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(project)}
        aria-label={`${watchLabel} — ${project.title} ${project.location}`}
        className={`group relative aspect-[4/5] w-full overflow-hidden bg-noir focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-bronze sm:aspect-video md:col-span-8 ${
          isRight ? "md:order-2 md:col-start-5" : "md:order-1"
        }`}
      >
        {status.video ? (
          <video
            className="h-full w-full object-cover transition-transform duration-[1600ms] ease-editorial group-hover:scale-[1.06]"
            muted
            loop
            playsInline
            preload="none"
            poster={status.poster ? project.poster : undefined}
          >
            <source src={project.video} type="video/mp4" />
          </video>
        ) : status.poster ? (
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={project.poster}
              alt={`${project.title} — ${project.location}`}
              fill
              sizes="(min-width: 768px) 66vw, 100vw"
              className="object-cover transition-transform duration-[1600ms] ease-editorial group-hover:scale-[1.06]"
            />
          </div>
        ) : (
          <div className="h-full w-full transition-transform duration-[1600ms] ease-editorial group-hover:scale-[1.045]">
            <MediaPlaceholder
              title={project.title}
              subtitle={project.location}
              tag={comingSoonLabel}
            />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-noir/0 transition-colors duration-500 group-hover:bg-noir/35" />

        {/* cadre "viewfinder" qui se verrouille sur le plan au survol */}
        <span className="frame-corner frame-corner--tl" aria-hidden />
        <span className="frame-corner frame-corner--tr" aria-hidden />
        <span className="frame-corner frame-corner--bl" aria-hidden />
        <span className="frame-corner frame-corner--br" aria-hidden />

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-ivoire/60">
            <span
              aria-hidden
              className="ml-1 h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-ivoire"
            />
          </span>
          <span className="font-sans text-[11px] uppercase tracking-widest2 text-ivoire">
            {playLabel}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-noir/70 to-transparent p-5 sm:p-6 md:hidden">
          <p className="font-serif text-lg uppercase tracking-tight text-ivoire">
            {project.title} — {project.location}
          </p>
        </div>
      </button>

      <div
        className={`flex flex-col justify-center gap-5 md:col-span-4 ${
          isRight ? "md:order-1" : "md:order-2"
        }`}
      >
        <p className="hidden font-serif text-2xl uppercase tracking-tight text-noir md:block lg:text-3xl">
          {project.title}
          <span className="block text-bronze">{project.location}</span>
        </p>
        <ul className="flex flex-wrap gap-x-3 gap-y-2">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="font-sans text-[11px] uppercase tracking-widest2 text-noir/50"
            >
              {tag}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => onOpen(project)}
          className="w-fit border-b border-noir/30 pb-1 font-sans text-xs uppercase tracking-widest2 text-noir/70 transition-colors duration-300 hover:border-bronze hover:text-bronze focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-bronze"
        >
          {watchLabel}
        </button>
      </div>
    </div>
  );
}

/** Bandeau défilant discret des projets — vitesse constante, en pause au survol. */
function FilmsMarquee({ projects }: { projects: Project[] }) {
  const items = [...projects, ...projects];
  return (
    <div
      className="mt-10 overflow-hidden border-y border-noir/10 py-4 sm:mt-12"
      aria-hidden
    >
      <div className="marquee-track flex w-max gap-10">
        {items.map((p, i) => (
          <span
            key={`${p.id}-${i}`}
            className="flex items-center gap-3 font-sans text-xs uppercase tracking-widest2 text-noir/35"
          >
            {p.title} — {p.location}
            <span className="text-bronze/50">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

type FilmsContent = { kicker: string; title: string; subtitle: string; cta: string };

type SelectedFilmsProps = {
  mediaStatus: MediaStatus;
  /** Sous-ensemble à afficher — par défaut, tous les projets (portfolio mixte de la homepage). */
  projects?: Project[];
  /** Par défaut : copie homepage (t.films). Passez la copie d'un univers pour une landing dédiée. */
  content?: FilmsContent;
  ctaHref?: string;
  id?: string;
};

export default function SelectedFilms({
  mediaStatus,
  projects = allProjects,
  content,
  ctaHref = "#contact",
  id = "films",
}: SelectedFilmsProps) {
  const { t } = useLanguage();
  const c = content ?? t.films;
  const [active, setActive] = useState<Project | null>(null);

  return (
    <section id={id} className="bg-ivoire px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto max-w-content">
        <ScrollReveal>
          <p className="mb-4 font-sans text-xs uppercase tracking-widest2 text-bronze">{c.kicker}</p>
        </ScrollReveal>
        <h2 className="font-serif text-4xl uppercase tracking-tight text-noir sm:text-5xl lg:text-6xl">
          <TitleWipe delay={0.05}>{c.title}</TitleWipe>
        </h2>
        <ScrollReveal delay={0.1}>
          <p className="mt-5 max-w-xl font-sans text-base text-noir/60 sm:text-lg">{c.subtitle}</p>
        </ScrollReveal>

        <FilmsMarquee projects={projects} />

        <div className="mt-16 flex flex-col gap-16 sm:mt-20 sm:gap-24 lg:gap-32">
          {projects.map((project, index) => (
            <ScrollReveal key={project.id} delay={0.05}>
              <FilmTile
                project={project}
                index={index}
                status={
                  mediaStatus[project.id] ?? { video: false, poster: false }
                }
                onOpen={setActive}
                watchLabel={t.films.watch}
                playLabel={t.films.play}
                comingSoonLabel={t.films.comingSoon}
              />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.1}>
          <a
            href={ctaHref}
            className="group mt-16 inline-flex w-fit items-center gap-2 border-b border-noir/30 pb-1 font-sans text-xs uppercase tracking-widest2 text-noir/70 transition-colors duration-300 hover:border-bronze hover:text-bronze sm:mt-20"
          >
            {c.cta}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </ScrollReveal>
      </div>

      <VideoModal
        open={active !== null}
        onClose={() => setActive(null)}
        src={active?.video}
        hasVideo={Boolean(active && mediaStatus[active.id]?.video)}
        poster={active?.poster}
        hasPoster={Boolean(active && mediaStatus[active.id]?.poster)}
        title={active ? `${active.title} — ${active.location}` : ""}
        subtitle={active?.tags.join(" / ")}
        comingSoonLabel={t.films.comingSoon}
        closeLabel={t.common.close}
      />
    </section>
  );
}
