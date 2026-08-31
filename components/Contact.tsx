"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ScrollReveal from "./ScrollReveal";
import TitleWipe from "./TitleWipe";
import { useLanguage } from "@/lib/LanguageContext";
import { siteConfig } from "@/data/config";

type Segment = "agency" | "owner";
type Stage = "fork" | "step1" | "step2" | "step3" | "success";
type Status = "idle" | "submitting" | "error";

type Fields = {
  qualification: string;
  agencyName: string;
  agencyLink: string;
  location: string;
  listingUrl: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

const initialFields: Fields = {
  qualification: "",
  agencyName: "",
  agencyLink: "",
  location: "",
  listingUrl: "",
  name: "",
  email: "",
  phone: "",
  message: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlPattern = /^https?:\/\/.+\..+/i;
const easing = [0.19, 1, 0.22, 1] as const;

const stepOrder: Stage[] = ["step1", "step2", "step3"];

export default function Contact() {
  const { t } = useLanguage();
  const f = t.contact;

  const [stage, setStage] = useState<Stage>("fork");
  const [segment, setSegment] = useState<Segment | null>(null);
  const [fields, setFields] = useState<Fields>(initialFields);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<Status>("idle");

  // Entrée contextuelle : les CTA du site pointent vers #contact-agence /
  // #contact-proprietaire pour pré-sélectionner le bon parcours et sauter
  // directement à la question de qualification.
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "contact-agence") {
        setSegment("agency");
        setStage("step1");
      } else if (hash === "contact-proprietaire") {
        setSegment("owner");
        setStage("step1");
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const update = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const chooseSegment = (next: Segment) => {
    setSegment(next);
    setStage("step1");
  };

  const goBack = () => {
    if (stage === "step1") {
      setSegment(null);
      setStage("fork");
      return;
    }
    const idx = stepOrder.indexOf(stage);
    if (idx > 0) setStage(stepOrder[idx - 1]);
  };

  const validateStep2 = (): boolean => {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (segment === "agency") {
      if (!fields.agencyName.trim()) next.agencyName = f.errors.required;
      if (!fields.agencyLink.trim()) next.agencyLink = f.errors.required;
      else if (!urlPattern.test(fields.agencyLink.trim())) next.agencyLink = f.errors.url;
    } else {
      if (!fields.location.trim()) next.location = f.errors.required;
      if (fields.listingUrl.trim() && !urlPattern.test(fields.listingUrl.trim())) {
        next.listingUrl = f.errors.url;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep3 = (): boolean => {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (!fields.name.trim()) next.name = f.errors.required;
    if (!fields.email.trim()) next.email = f.errors.required;
    else if (!emailPattern.test(fields.email.trim())) next.email = f.errors.email;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep3() || !segment) return;

    setStatus("submitting");
    try {
      const res = await fetch(siteConfig.contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segment,
          qualification: fields.qualification,
          name: fields.name,
          email: fields.email,
          phone: fields.phone || undefined,
          message: fields.message || undefined,
          agencyName: segment === "agency" ? fields.agencyName : undefined,
          agencyLink: segment === "agency" ? fields.agencyLink : undefined,
          location: segment === "owner" ? fields.location : undefined,
          listingUrl: segment === "owner" ? fields.listingUrl : undefined,
        }),
      });
      if (!res.ok) throw new Error("request_failed");
      setStatus("idle");
      setStage("success");
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full border-b border-ivoire/25 bg-transparent py-3 font-sans text-sm text-ivoire placeholder:text-ivoire/35 focus:border-bronze focus:outline-none";
  const labelClass = "font-sans text-[11px] uppercase tracking-widest2 text-ivoire/50";
  const errorClass = "mt-1.5 font-sans text-xs text-bronze";

  const stepIndex = stepOrder.indexOf(stage); // -1 hors funnel numéroté
  const options = segment === "agency" ? f.agencyFlow.options : f.ownerFlow.options;

  // Message de confirmation personnalisé avec la réponse de qualification
  // (type de bien / palier choisi) — retombe sur le texte générique si,
  // pour une raison quelconque, la sélection est introuvable.
  const successHeadline = (() => {
    const chosen = options.find((o) => o.value === fields.qualification)?.label;
    if (!chosen) return f.success;
    return segment === "agency"
      ? f.successAgency.replace("{tier}", chosen)
      : f.successOwner.replace("{type}", chosen);
  })();

  return (
    <section
      id="contact"
      className="grain relative overflow-hidden bg-noir px-6 py-28 text-ivoire sm:px-10 sm:py-36 lg:px-16"
    >
      {/* cibles d'ancrage pour les CTA contextuels du site */}
      <span id="contact-agence" className="block h-0 scroll-mt-24" aria-hidden />
      <span id="contact-proprietaire" className="block h-0 scroll-mt-24" aria-hidden />

      <div className="relative z-10 mx-auto max-w-content">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <ScrollReveal>
              <p className="mb-4 font-sans text-xs uppercase tracking-widest2 text-bronze">
                {f.kicker}
              </p>
            </ScrollReveal>
            <h2 className="font-serif text-4xl uppercase leading-[1.1] tracking-tight sm:text-5xl">
              {f.title.map((line, i) => (
                <TitleWipe key={line} delay={0.05 + i * 0.12}>
                  {line}
                </TitleWipe>
              ))}
            </h2>
            <ScrollReveal delay={0.1}>
              <p className="mt-6 max-w-sm font-sans text-base leading-relaxed text-ivoire/60">
                {f.subtitle}
              </p>
            </ScrollReveal>

            {stepIndex >= 0 ? (
              <div className="mt-10 hidden items-center gap-3 sm:flex">
                {stepOrder.map((s, i) => (
                  <span
                    key={s}
                    className={`h-px w-10 transition-colors duration-500 ${
                      i <= stepIndex ? "bg-bronze" : "bg-ivoire/20"
                    }`}
                  />
                ))}
                <span className="ml-2 font-sans text-[11px] uppercase tracking-widest2 text-ivoire/40">
                  {f.stepLabel.replace("{n}", String(stepIndex + 1)).replace("{total}", "3")}
                </span>
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <ScrollReveal delay={0.1}>
              <AnimatePresence mode="wait">
                {/* ---------- FORK : qui êtes-vous ---------- */}
                {stage === "fork" ? (
                  <motion.div
                    key="fork"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.5, ease: easing }}
                    className="flex flex-col gap-6"
                  >
                    <p className="font-sans text-sm uppercase tracking-widest2 text-ivoire/50">
                      {f.fork.prompt}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(["agency", "owner"] as const).map((seg) => {
                        const copy = seg === "agency" ? f.fork.agency : f.fork.owner;
                        return (
                          <button
                            key={seg}
                            type="button"
                            onClick={() => chooseSegment(seg)}
                            className="group flex flex-col items-start gap-3 border border-ivoire/20 p-6 text-left transition-colors duration-300 hover:border-bronze focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-bronze"
                          >
                            <span className="font-sans text-[10px] uppercase tracking-widest2 text-bronze">
                              {copy.label}
                            </span>
                            <span className="font-serif text-xl uppercase tracking-tight text-ivoire">
                              {copy.title}
                            </span>
                            <span className="font-sans text-sm leading-relaxed text-ivoire/55">
                              {copy.text}
                            </span>
                            <span className="mt-2 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-widest2 text-ivoire/70 transition-colors duration-300 group-hover:text-bronze">
                              {copy.cta}
                              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                                →
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="max-w-md font-sans text-xs leading-relaxed text-ivoire/35">
                      {f.fork.capacity}
                    </p>
                  </motion.div>
                ) : null}

                {/* ---------- STEP 1 : qualification ---------- */}
                {stage === "step1" && segment ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.5, ease: easing }}
                    className="flex flex-col gap-6"
                  >
                    <h3 className="font-serif text-2xl uppercase tracking-tight text-ivoire sm:text-3xl">
                      {segment === "agency" ? f.agencyFlow.step1Title : f.ownerFlow.step1Title}
                    </h3>
                    <div className="flex flex-col gap-3">
                      {options.map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex cursor-pointer items-center justify-between border px-5 py-4 font-sans text-sm transition-colors duration-300 ${
                            fields.qualification === opt.value
                              ? "border-bronze text-ivoire"
                              : "border-ivoire/20 text-ivoire/70 hover:border-ivoire/40"
                          }`}
                        >
                          <span>{opt.label}</span>
                          <input
                            type="radio"
                            name="qualification"
                            value={opt.value}
                            checked={fields.qualification === opt.value}
                            onChange={(e) => update("qualification", e.target.value)}
                            className="h-4 w-4 shrink-0 accent-bronze"
                          />
                        </label>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-6">
                      <button
                        type="button"
                        onClick={goBack}
                        className="font-sans text-xs uppercase tracking-widest2 text-ivoire/50 transition-colors duration-300 hover:text-ivoire"
                      >
                        ← {f.back}
                      </button>
                      <button
                        type="button"
                        disabled={!fields.qualification}
                        onClick={() => setStage("step2")}
                        className="border border-ivoire px-8 py-4 font-sans text-xs uppercase tracking-widest2 text-ivoire transition-colors duration-300 hover:bg-ivoire hover:text-noir disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ivoire"
                      >
                        {f.shared.next}
                      </button>
                    </div>
                  </motion.div>
                ) : null}

                {/* ---------- STEP 2 : détails du bien / de l'agence ---------- */}
                {stage === "step2" && segment ? (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.5, ease: easing }}
                    className="flex flex-col gap-7"
                  >
                    <h3 className="font-serif text-2xl uppercase tracking-tight text-ivoire sm:text-3xl">
                      {segment === "agency" ? f.agencyFlow.step2Title : f.ownerFlow.step2Title}
                    </h3>

                    {segment === "agency" ? (
                      <>
                        <div>
                          <label className={labelClass} htmlFor="c-agency-name">
                            {f.agencyFlow.agencyName}
                          </label>
                          <input
                            id="c-agency-name"
                            className={inputClass}
                            value={fields.agencyName}
                            onChange={(e) => update("agencyName", e.target.value)}
                            aria-invalid={Boolean(errors.agencyName)}
                          />
                          {errors.agencyName ? <p className={errorClass}>{errors.agencyName}</p> : null}
                        </div>
                        <div>
                          <label className={labelClass} htmlFor="c-agency-link">
                            {f.agencyFlow.agencyLink}
                          </label>
                          <input
                            id="c-agency-link"
                            type="url"
                            placeholder="https://…"
                            className={inputClass}
                            value={fields.agencyLink}
                            onChange={(e) => update("agencyLink", e.target.value)}
                            aria-invalid={Boolean(errors.agencyLink)}
                          />
                          {errors.agencyLink ? <p className={errorClass}>{errors.agencyLink}</p> : null}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className={labelClass} htmlFor="c-location">
                            {f.ownerFlow.location}
                          </label>
                          <input
                            id="c-location"
                            className={inputClass}
                            value={fields.location}
                            onChange={(e) => update("location", e.target.value)}
                            aria-invalid={Boolean(errors.location)}
                          />
                          {errors.location ? <p className={errorClass}>{errors.location}</p> : null}
                        </div>
                        <div>
                          <label className={labelClass} htmlFor="c-listing-url">
                            {f.ownerFlow.listingUrl}
                          </label>
                          <input
                            id="c-listing-url"
                            type="url"
                            placeholder="https://…"
                            className={inputClass}
                            value={fields.listingUrl}
                            onChange={(e) => update("listingUrl", e.target.value)}
                            aria-invalid={Boolean(errors.listingUrl)}
                          />
                          {errors.listingUrl ? <p className={errorClass}>{errors.listingUrl}</p> : null}
                        </div>
                      </>
                    )}

                    <div className="mt-2 flex items-center gap-6">
                      <button
                        type="button"
                        onClick={goBack}
                        className="font-sans text-xs uppercase tracking-widest2 text-ivoire/50 transition-colors duration-300 hover:text-ivoire"
                      >
                        ← {f.back}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (validateStep2()) setStage("step3");
                        }}
                        className="border border-ivoire px-8 py-4 font-sans text-xs uppercase tracking-widest2 text-ivoire transition-colors duration-300 hover:bg-ivoire hover:text-noir"
                      >
                        {f.shared.next}
                      </button>
                    </div>
                  </motion.div>
                ) : null}

                {/* ---------- STEP 3 : coordonnées + envoi ---------- */}
                {stage === "step3" && segment ? (
                  <motion.form
                    key="step3"
                    onSubmit={submit}
                    noValidate
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.5, ease: easing }}
                    className="flex flex-col gap-7"
                  >
                    <h3 className="font-serif text-2xl uppercase tracking-tight text-ivoire sm:text-3xl">
                      {segment === "agency" ? f.agencyFlow.step3Title : f.ownerFlow.step3Title}
                    </h3>

                    <div className="grid gap-7 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="c-name">
                          {f.shared.name}
                        </label>
                        <input
                          id="c-name"
                          autoComplete="name"
                          className={inputClass}
                          value={fields.name}
                          onChange={(e) => update("name", e.target.value)}
                          aria-invalid={Boolean(errors.name)}
                        />
                        {errors.name ? <p className={errorClass}>{errors.name}</p> : null}
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="c-email">
                          {f.shared.email}
                        </label>
                        <input
                          id="c-email"
                          type="email"
                          autoComplete="email"
                          className={inputClass}
                          value={fields.email}
                          onChange={(e) => update("email", e.target.value)}
                          aria-invalid={Boolean(errors.email)}
                        />
                        {errors.email ? <p className={errorClass}>{errors.email}</p> : null}
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass} htmlFor="c-phone">
                          {f.shared.phone}
                        </label>
                        <input
                          id="c-phone"
                          type="tel"
                          autoComplete="tel"
                          className={inputClass}
                          value={fields.phone}
                          onChange={(e) => update("phone", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass} htmlFor="c-message">
                        {f.shared.message}
                      </label>
                      <textarea
                        id="c-message"
                        rows={3}
                        className={`${inputClass} resize-none`}
                        value={fields.message}
                        onChange={(e) => update("message", e.target.value)}
                      />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-6">
                      <button
                        type="button"
                        onClick={goBack}
                        className="font-sans text-xs uppercase tracking-widest2 text-ivoire/50 transition-colors duration-300 hover:text-ivoire"
                      >
                        ← {f.back}
                      </button>
                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="border border-ivoire px-8 py-4 font-sans text-xs uppercase tracking-widest2 text-ivoire transition-colors duration-300 hover:bg-ivoire hover:text-noir disabled:opacity-50"
                      >
                        {status === "submitting"
                          ? f.submitting
                          : segment === "agency"
                            ? f.agencyFlow.submit
                            : f.ownerFlow.submit}
                      </button>
                      {status === "error" ? (
                        <p role="alert" className="font-sans text-sm text-bronze">
                          {f.error}
                        </p>
                      ) : null}
                    </div>
                  </motion.form>
                ) : null}

                {/* ---------- SUCCESS ---------- */}
                {stage === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: easing }}
                    role="status"
                    className="flex flex-col gap-3 border-t border-ivoire/15 pt-8"
                  >
                    <p className="font-serif text-2xl uppercase tracking-tight text-ivoire sm:text-3xl">
                      {successHeadline}
                    </p>
                    <p className="font-sans text-sm text-ivoire/55">{f.successNote}</p>

                    {siteConfig.booking.url ? (
                      <div className="mt-4 flex flex-col gap-3 border-t border-ivoire/15 pt-6">
                        <p className="font-sans text-xs uppercase tracking-widest2 text-ivoire/40">
                          {f.booking.title}
                        </p>
                        <a
                          href={siteConfig.booking.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group inline-flex w-fit items-center gap-2 border border-ivoire px-7 py-4 font-sans text-xs uppercase tracking-widest2 text-ivoire transition-colors duration-300 hover:bg-ivoire hover:text-noir"
                        >
                          {f.booking.cta}
                          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                            →
                          </span>
                        </a>
                      </div>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
