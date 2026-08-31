"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import MediaPlaceholder from "./MediaPlaceholder";

type VideoModalProps = {
  open: boolean;
  onClose: () => void;
  src?: string;
  hasVideo: boolean;
  poster?: string;
  hasPoster?: boolean;
  title: string;
  subtitle?: string;
  comingSoonLabel: string;
  closeLabel: string;
};

/**
 * Lightbox plein écran très sobre pour la lecture des films.
 * Aucune dépendance externe (pas de player YouTube visible) : lecture
 * native HTML5, pensée pour être remplacée facilement par une intégration
 * Vimeo (id/hash privé) le moment venu.
 */
export default function VideoModal({
  open,
  onClose,
  src,
  hasVideo,
  poster,
  hasPoster,
  title,
  subtitle,
  comingSoonLabel,
  closeLabel,
}: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open && hasVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [open, hasVideo]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-noir/97 p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          onClick={onClose}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center border border-ivoire/25 text-ivoire/80 transition-colors duration-300 hover:border-ivoire hover:text-ivoire focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ivoire sm:right-8 sm:top-8"
          >
            <span aria-hidden className="text-xl leading-none">
              &times;
            </span>
          </button>

          <motion.div
            className="relative aspect-video w-full max-w-5xl"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {hasVideo && src ? (
              <video
                ref={videoRef}
                src={src}
                controls
                playsInline
                className="h-full w-full bg-noir object-contain"
              >
                <track kind="captions" />
              </video>
            ) : hasPoster && poster ? (
              <div className="relative h-full w-full overflow-hidden bg-noir">
                <Image src={poster} alt={title} fill sizes="100vw" className="object-cover" />
                <div className="absolute inset-0 bg-noir/25" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-noir/85 to-transparent px-6 pb-8 pt-16 text-center">
                  <p className="font-serif text-2xl uppercase tracking-tight text-ivoire sm:text-3xl">
                    {title}
                  </p>
                  {subtitle ? (
                    <p className="font-sans text-[11px] uppercase tracking-widest2 text-ivoire/60">
                      {subtitle}
                    </p>
                  ) : null}
                  <span className="mt-2 border border-ivoire/25 px-3 py-1.5 font-sans text-[10px] uppercase tracking-widest2 text-ivoire/60">
                    {comingSoonLabel}
                  </span>
                </div>
              </div>
            ) : (
              <MediaPlaceholder
                title={title}
                subtitle={subtitle}
                tag={comingSoonLabel}
                variant="hero"
              />
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
