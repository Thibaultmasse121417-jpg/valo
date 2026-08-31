"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";
import MediaPlaceholder from "./MediaPlaceholder";
import VideoModal from "./VideoModal";
import { useLanguage } from "@/lib/LanguageContext";
import { projects, type Project } from "@/data/projects";

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
            className="h-full w-full object-cover transition-transform duration-[1600ms] ease-editorial group-hover:scale-[1.045]"
            muted
            loop
            playsInline
            preload="none"
            poster={status.poster ? project.poster : undefined}
          >
            <source src={project.video} type="video/mp4" />
          </video>
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
          <p className="font-serif text-lg uppercase tracking-wide text-ivoire">
            {project.title} — {project.location}
          </p>
        </div>
      </button>

      <div
        className={`flex flex-col justify-center gap-5 md:col-span-4 ${
          isRight ? "md:order-1" : "md:order-2"
        }`}
      >
        <p className="hidden font-serif text-2xl uppercase tracking-wide text-noir md:block lg:text-3xl">
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

export default function SelectedFilms({ mediaStatus }: { mediaStatus: MediaStatus }) {
  const { t } = useLanguage();
  const [active, setActive] = useState<Project | null>(null);

  return (
    <section id="films" className="bg-ivoire px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      <div className="mx-auto max-w-content">
        <ScrollReveal>
          <p className="mb-4 font-sans text-xs uppercase tracking-widest2 text-bronze">
            {t.films.kicker}
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <h2 className="font-serif text-4xl uppercase tracking-wide text-noir sm:text-5xl lg:text-6xl">
            {t.films.title}
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="mt-5 max-w-xl font-sans text-base text-noir/60 sm:text-lg">
            {t.films.subtitle}
          </p>
        </ScrollReveal>

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
            href="#contact-proprietaire"
            className="mt-16 inline-block w-fit border-b border-noir/30 pb-1 font-sans text-xs uppercase tracking-widest2 text-noir/70 transition-colors duration-300 hover:border-bronze hover:text-bronze sm:mt-20"
          >
            {t.films.cta} →
          </a>
        </ScrollReveal>
      </div>

      <VideoModal
        open={active !== null}
        onClose={() => setActive(null)}
        src={active?.video}
        hasVideo={Boolean(active && mediaStatus[active.id]?.video)}
        title={active ? `${active.title} — ${active.location}` : ""}
        subtitle={active?.tags.join(" / ")}
        comingSoonLabel={t.films.comingSoon}
        closeLabel={t.common.close}
      />
    </section>
  );
}
