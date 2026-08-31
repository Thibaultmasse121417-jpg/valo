"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TitleWipe from "./TitleWipe";
import { useLanguage } from "@/lib/LanguageContext";
import { siteConfig } from "@/data/config";

type Fields = {
  name: string;
  company: string;
  email: string;
  phone: string;
  sector: string;
  url: string;
  message: string;
};

const initialFields: Fields = {
  name: "",
  company: "",
  email: "",
  phone: "",
  sector: "",
  url: "",
  message: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlPattern = /^https?:\/\/.+\..+/i;
const easing = [0.19, 1, 0.22, 1] as const;

/** Petit repère visuel de confidentialité — pas une icône de marque, juste un signal d'usage. */
function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

type ContactFormProps = {
  /** Présélectionne le secteur (ex. "immobilier" depuis /real-estate) sans verrouiller le champ. */
  defaultSector?: string;
};

/**
 * Formulaire de contact premium et unique, partagé par la homepage et
 * les 4 landing pages d'univers. Le secteur peut être présélectionné
 * (voir defaultSector) mais reste modifiable — un visiteur qui atterrit
 * depuis /hospitality mais gère aussi des biens immobiliers peut changer.
 */
export default function ContactForm({ defaultSector }: ContactFormProps) {
  const { t } = useLanguage();
  const f = t.contactForm;

  const [fields, setFields] = useState<Fields>({ ...initialFields, sector: defaultSector ?? "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const update = (key: keyof Fields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (!fields.name.trim()) next.name = f.errors.required;
    if (!fields.email.trim()) next.email = f.errors.required;
    else if (!emailPattern.test(fields.email.trim())) next.email = f.errors.email;
    if (!fields.sector.trim()) next.sector = f.errors.required;
    if (fields.url.trim() && !urlPattern.test(fields.url.trim())) next.url = f.errors.url;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    try {
      const sectorLabel = f.sectorOptions.find((o) => o.value === fields.sector)?.label ?? fields.sector;
      const res = await fetch(siteConfig.contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: fields.name,
          company: fields.company || undefined,
          email: fields.email,
          phone: fields.phone || undefined,
          sector: sectorLabel,
          url: fields.url || undefined,
          message: fields.message || undefined,
          _subject: `Estalia Studio — nouveau projet (${sectorLabel}) — ${fields.name}`,
          _replyto: fields.email,
        }),
      });
      if (!res.ok) throw new Error("request_failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full border-b border-ivoire/25 bg-transparent py-3 font-sans text-sm text-ivoire placeholder:text-ivoire/35 focus:border-bronze focus:outline-none";
  const labelClass = "font-sans text-[11px] uppercase tracking-widest2 text-ivoire/50";
  const errorClass = "mt-1.5 font-sans text-xs text-bronze";

  return (
    <section id="contact" className="grain relative overflow-hidden bg-noir px-6 py-28 text-ivoire sm:px-10 sm:py-36 lg:px-16">
      <div className="relative z-10 mx-auto max-w-content">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="mb-4 font-sans text-xs uppercase tracking-widest2 text-bronze">{f.kicker}</p>
            <h2 className="font-serif text-4xl uppercase leading-[1.1] tracking-tight sm:text-5xl">
              {f.title.map((line, i) => (
                <TitleWipe key={line} delay={0.05 + i * 0.12}>
                  {line}
                </TitleWipe>
              ))}
            </h2>
            <p className="mt-6 max-w-sm font-sans text-base leading-relaxed text-ivoire/60">{f.subtitle}</p>
            <p className="mt-8 flex max-w-sm items-start gap-2 font-sans text-xs leading-relaxed text-ivoire/45">
              <LockIcon className="mt-0.5 h-3 w-3 shrink-0 text-bronze/70" />
              {f.responseTime}
            </p>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: easing }}
                  className="flex flex-col gap-3 border-t border-ivoire/15 pt-8"
                  role="status"
                >
                  <p className="font-serif text-2xl uppercase tracking-tight text-ivoire sm:text-3xl">
                    {f.success}
                  </p>
                  <p className="font-sans text-sm text-ivoire/55">{f.successNote}</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  noValidate
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: easing }}
                  className="flex flex-col gap-7"
                >
                  <div className="grid gap-7 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="cf-name">
                        {f.name}
                      </label>
                      <input
                        id="cf-name"
                        autoComplete="name"
                        className={inputClass}
                        value={fields.name}
                        onChange={(e) => update("name", e.target.value)}
                        aria-invalid={Boolean(errors.name)}
                      />
                      {errors.name ? <p className={errorClass}>{errors.name}</p> : null}
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="cf-company">
                        {f.company}
                      </label>
                      <input
                        id="cf-company"
                        autoComplete="organization"
                        className={inputClass}
                        value={fields.company}
                        onChange={(e) => update("company", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="cf-email">
                        {f.email}
                      </label>
                      <input
                        id="cf-email"
                        type="email"
                        autoComplete="email"
                        className={inputClass}
                        value={fields.email}
                        onChange={(e) => update("email", e.target.value)}
                        aria-invalid={Boolean(errors.email)}
                      />
                      {errors.email ? <p className={errorClass}>{errors.email}</p> : null}
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="cf-phone">
                        {f.phone}
                      </label>
                      <input
                        id="cf-phone"
                        type="tel"
                        autoComplete="tel"
                        className={inputClass}
                        value={fields.phone}
                        onChange={(e) => update("phone", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="cf-sector">
                        {f.sector}
                      </label>
                      <select
                        id="cf-sector"
                        className={`${inputClass} appearance-none bg-noir`}
                        value={fields.sector}
                        onChange={(e) => update("sector", e.target.value)}
                        aria-invalid={Boolean(errors.sector)}
                      >
                        <option value="" disabled>
                          —
                        </option>
                        {f.sectorOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {errors.sector ? <p className={errorClass}>{errors.sector}</p> : null}
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="cf-url">
                        {f.url}
                      </label>
                      <input
                        id="cf-url"
                        type="url"
                        placeholder="https://…"
                        className={inputClass}
                        value={fields.url}
                        onChange={(e) => update("url", e.target.value)}
                        aria-invalid={Boolean(errors.url)}
                      />
                      {errors.url ? <p className={errorClass}>{errors.url}</p> : null}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="cf-message">
                      {f.message}
                    </label>
                    <textarea
                      id="cf-message"
                      rows={3}
                      className={`${inputClass} resize-none`}
                      value={fields.message}
                      onChange={(e) => update("message", e.target.value)}
                    />
                  </div>

                  <p className="flex items-start gap-2 font-sans text-xs leading-relaxed text-ivoire/40">
                    <LockIcon className="mt-0.5 h-3 w-3 shrink-0 text-bronze/70" />
                    {f.privacyNote}
                  </p>

                  {status === "error" ? <p className="font-sans text-xs text-bronze">{f.error}</p> : null}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="mt-2 w-fit border border-ivoire px-8 py-4 font-sans text-xs uppercase tracking-widest2 text-ivoire transition-colors duration-300 hover:bg-ivoire hover:text-noir disabled:opacity-50"
                  >
                    {status === "submitting" ? f.submitting : f.submit}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
