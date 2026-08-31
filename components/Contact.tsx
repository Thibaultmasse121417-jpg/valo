"use client";

import { useState, type FormEvent } from "react";
import ScrollReveal from "./ScrollReveal";
import { useLanguage } from "@/lib/LanguageContext";
import { siteConfig } from "@/data/config";

type FormState = {
  name: string;
  agency: string;
  email: string;
  phone: string;
  listingUrl: string;
  message: string;
  collaboration: boolean;
};

const initialState: FormState = {
  name: "",
  agency: "",
  email: "",
  phone: "",
  listingUrl: "",
  message: "",
  collaboration: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlPattern = /^https?:\/\/.+\..+/i;

type Status = "idle" | "submitting" | "success" | "error";

export default function Contact() {
  const { t } = useLanguage();
  const f = t.contact.form;

  const [values, setValues] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<Status>("idle");

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (!values.name.trim()) next.name = f.errors.required;
    if (!values.agency.trim()) next.agency = f.errors.required;

    if (!values.email.trim()) next.email = f.errors.required;
    else if (!emailPattern.test(values.email.trim())) next.email = f.errors.email;

    if (!values.listingUrl.trim()) next.listingUrl = f.errors.required;
    else if (!urlPattern.test(values.listingUrl.trim()))
      next.listingUrl = f.errors.url;

    if (!values.message.trim()) next.message = f.errors.required;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    try {
      const res = await fetch(siteConfig.contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("request_failed");
      setStatus("success");
      setValues(initialState);
    } catch {
      setStatus("error");
    }
  };

  const inputClass =
    "w-full border-b border-ivoire/25 bg-transparent py-3 font-sans text-sm text-ivoire placeholder:text-ivoire/35 focus:border-bronze focus:outline-none";
  const labelClass = "font-sans text-[11px] uppercase tracking-widest2 text-ivoire/50";
  const errorClass = "mt-1.5 font-sans text-xs text-bronze";

  return (
    <section id="contact" className="bg-noir px-6 py-28 text-ivoire sm:px-10 sm:py-36 lg:px-16">
      <div className="mx-auto max-w-content">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <ScrollReveal>
              <p className="mb-4 font-sans text-xs uppercase tracking-widest2 text-bronze">
                {t.contact.kicker}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="font-serif text-4xl uppercase leading-[1.1] tracking-wide sm:text-5xl">
                {t.contact.title.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="mt-6 max-w-sm font-sans text-base leading-relaxed text-ivoire/60">
                {t.contact.subtitle}
              </p>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <ScrollReveal delay={0.1}>
              <form onSubmit={onSubmit} noValidate className="flex flex-col gap-7">
                <div className="grid gap-7 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="name">
                      {f.name}
                    </label>
                    <input
                      id="name"
                      name="name"
                      autoComplete="name"
                      className={inputClass}
                      value={values.name}
                      onChange={(e) => update("name", e.target.value)}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    {errors.name ? (
                      <p id="name-error" className={errorClass}>
                        {errors.name}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="agency">
                      {f.agency}
                    </label>
                    <input
                      id="agency"
                      name="agency"
                      autoComplete="organization"
                      className={inputClass}
                      value={values.agency}
                      onChange={(e) => update("agency", e.target.value)}
                      aria-invalid={Boolean(errors.agency)}
                      aria-describedby={errors.agency ? "agency-error" : undefined}
                    />
                    {errors.agency ? (
                      <p id="agency-error" className={errorClass}>
                        {errors.agency}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="email">
                      {f.email}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={inputClass}
                      value={values.email}
                      onChange={(e) => update("email", e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email ? (
                      <p id="email-error" className={errorClass}>
                        {errors.email}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="phone">
                      {f.phone}
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className={inputClass}
                      value={values.phone}
                      onChange={(e) => update("phone", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="listingUrl">
                    {f.listingUrl}
                  </label>
                  <input
                    id="listingUrl"
                    name="listingUrl"
                    type="url"
                    placeholder="https://…"
                    className={inputClass}
                    value={values.listingUrl}
                    onChange={(e) => update("listingUrl", e.target.value)}
                    aria-invalid={Boolean(errors.listingUrl)}
                    aria-describedby={errors.listingUrl ? "listingUrl-error" : undefined}
                  />
                  {errors.listingUrl ? (
                    <p id="listingUrl-error" className={errorClass}>
                      {errors.listingUrl}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className={labelClass} htmlFor="message">
                    {f.message}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className={`${inputClass} resize-none`}
                    value={values.message}
                    onChange={(e) => update("message", e.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? "message-error" : undefined}
                  />
                  {errors.message ? (
                    <p id="message-error" className={errorClass}>
                      {errors.message}
                    </p>
                  ) : null}
                </div>

                <label className="flex cursor-pointer items-start gap-3 font-sans text-sm text-ivoire/65">
                  <input
                    type="checkbox"
                    checked={values.collaboration}
                    onChange={(e) => update("collaboration", e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 border border-ivoire/40 bg-transparent accent-bronze"
                  />
                  {f.collaboration}
                </label>

                <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="border border-ivoire px-8 py-4 font-sans text-xs uppercase tracking-widest2 text-ivoire transition-colors duration-300 hover:bg-ivoire hover:text-noir disabled:opacity-50"
                  >
                    {status === "submitting" ? f.submitting : f.submit}
                  </button>

                  {status === "success" ? (
                    <p role="status" className="font-sans text-sm text-bronze">
                      {f.success}
                    </p>
                  ) : null}
                  {status === "error" ? (
                    <p role="alert" className="font-sans text-sm text-bronze">
                      {f.error}
                    </p>
                  ) : null}
                </div>
              </form>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
