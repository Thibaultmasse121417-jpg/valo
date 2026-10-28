"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { T, useLang } from "@/lib/LanguageContext";
import { useUI } from "@/lib/UIContext";
import { PROJECT_TYPES, type L } from "@/data/site";
import { siteConfig } from "@/data/config";

const N = " ";
const EMAIL = siteConfig.contact.email;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Fields = { name: string; email: string; company: string; type: string; message: string };
type Errors = Partial<Record<keyof Fields, L>>;
type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "failed"; text: string };

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = { fr: "Merci d’indiquer votre nom.", en: "Please enter your name." };
  if (!f.email.trim()) e.email = { fr: "Merci d’indiquer votre adresse e-mail.", en: "Please enter your email address." };
  else if (!emailRe.test(f.email.trim())) e.email = { fr: "Cette adresse e-mail ne semble pas valide.", en: "This email address doesn’t look valid." };
  if (!f.type) e.type = { fr: "Merci de choisir un type de projet.", en: "Please choose a project type." };
  if (!f.message.trim()) e.message = { fr: "Quelques mots suffisent.", en: "A few words are enough." };
  return e;
}

/**
 * Formulaire de demande de devis, envoyé à Formspree. Le message de
 * réussite ne s'affiche que si Formspree confirme la réception ; en cas
 * d'échec, le visiteur le sait et peut copier son message pour l'envoyer
 * par e-mail — jamais de faux « message envoyé ».
 */
export default function ContactForm({ context }: { context?: string }) {
  const { t } = useLang();
  const { quote } = useUI();
  const [f, setF] = useState<Fields>({ name: "", email: "", company: "", type: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [copied, setCopied] = useState<"mail" | "msg" | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
  const mailRef = useRef<HTMLSpanElement>(null);

  // une formule choisie plus haut (tarifs, saisons, sites) pré-remplit le type de projet
  useEffect(() => {
    if (quote.type) setF((cur) => ({ ...cur, type: quote.type! }));
  }, [quote.type]);

  const metier = quote.context || context || "";

  const set = (k: keyof Fields) => (e: { target: { value: string } }) => {
    const next = { ...f, [k]: e.target.value };
    setF(next);
    if (touched) setErrors(validate(next));
  };

  const copy = (text: string, el: HTMLElement | null, which: "mail" | "msg") => {
    const select = () => {
      if (!el) return;
      if (el instanceof HTMLTextAreaElement) {
        el.focus();
        el.select();
      } else {
        const r = document.createRange();
        r.selectNodeContents(el);
        const s = window.getSelection();
        s?.removeAllRanges();
        s?.addRange(r);
      }
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => {
          setCopied(which);
          setTimeout(() => setCopied(null), 2200);
        },
        select
      );
    } else select();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const errs = validate(f);
    setErrors(errs);
    const first = (Object.keys(errs) as (keyof Fields)[])[0];
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    const typeLabel = PROJECT_TYPES.find((p) => p.id === f.type)?.label.fr ?? f.type;
    const text =
      `Bonjour Thibault,\n\n${f.message.trim()}\n\n— ${f.name.trim()}${f.company.trim() ? ` (${f.company.trim()})` : ""}` +
      `\nType de projet${N}: ${typeLabel}${metier ? `\nMétier${N}: ${metier}` : ""}\nE-mail${N}: ${f.email.trim()}`;

    setStatus({ kind: "sending" });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    try {
      const res = await fetch(siteConfig.contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: f.name.trim(),
          email: f.email.trim(),
          company: f.company.trim(),
          project_type: typeLabel,
          message: f.message.trim(),
          metier,
          _subject: `Estalia Studio — demande de devis (${typeLabel}) — ${f.name.trim()}`,
          _replyto: f.email.trim(),
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      setStatus({ kind: "sent" });
      setF({ name: "", email: "", company: "", type: "", message: "" });
      setTouched(false);
    } catch {
      setStatus({ kind: "failed", text });
    } finally {
      clearTimeout(timer);
    }
  };

  const err = (k: keyof Fields) =>
    errors[k] ? (
      <p className="err" id={`e-${k}`}>{t(errors[k]!)}</p>
    ) : null;
  const fieldClass = (k: keyof Fields) => `field${errors[k] ? " has-err" : ""}`;
  const aria = (k: keyof Fields) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `e-${k}` } : {});

  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <div className="wrap contact-grid">
        <div className="contact-intro">
          <p className="label" data-reveal><b>10</b>&nbsp; <T fr="Devis" en="Quote" /></p>
          <h2 className="t-l" id="contact-title" data-reveal>
            <T
              fr={<><span className="tl">Vous avez un lieu,</span><span className="tl">une marque ou une idée</span><span className="tl"><em>à faire vivre{N}?</em></span></>}
              en={<><span className="tl">Have a place,</span><span className="tl">a brand or an idea</span><span className="tl"><em>to bring to life?</em></span></>}
            />
          </h2>
          <p className="body-l" data-reveal>
            <T fr="Décrivez votre projet en quelques mots. C’est Thibault qui vous répond, personnellement." en="Tell us about your project in a few words. Thibault will answer you personally." />
          </p>
          <div className="mail-row" data-reveal>
            <span className="small"><T fr="Ou écrivez directement à" en="Or write directly to" /></span>
            <span className="mail" ref={mailRef}>{EMAIL}</span>
            <button type="button" className="copy-btn" onClick={() => copy(EMAIL, mailRef.current, "mail")}>
              {copied === "mail" ? <T fr="Copié" en="Copied" /> : <T fr="Copier" en="Copy" />}
            </button>
          </div>
        </div>

        <div className="contact-form">
          <form ref={formRef} className="form" onSubmit={onSubmit} noValidate>
            <div className="row2">
              <div className={fieldClass("name")}>
                <label htmlFor="f-name"><T fr="Nom" en="Name" /></label>
                <input id="f-name" name="name" type="text" autoComplete="name" enterKeyHint="next" value={f.name} onChange={set("name")} {...aria("name")} />
                {err("name")}
              </div>
              <div className={fieldClass("email")}>
                <label htmlFor="f-email"><T fr="Adresse e-mail" en="Email address" /></label>
                <input
                  id="f-email" name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" autoCorrect="off"
                  spellCheck={false} enterKeyHint="next" value={f.email} onChange={set("email")} {...aria("email")}
                />
                {err("email")}
              </div>
            </div>
            <div className="row2">
              <div className="field">
                <label htmlFor="f-company"><T fr="Activité ou entreprise" en="Business or company" /></label>
                <input
                  id="f-company" name="company" type="text" autoComplete="organization" enterKeyHint="next" value={f.company} onChange={set("company")}
                  placeholder={t({ fr: "Ex. boulangerie, agence, camping…", en: "e.g. bakery, agency, campsite…" })}
                />
              </div>
              <div className={fieldClass("type")}>
                <label htmlFor="f-type"><T fr="Type de projet" en="Project type" /></label>
                <select id="f-type" name="type" value={f.type} onChange={set("type")} {...aria("type")}>
                  <option value="" disabled>{t({ fr: "Choisir…", en: "Choose…" })}</option>
                  {PROJECT_TYPES.map((p) => (
                    <option key={p.id} value={p.id}>{t(p.label)}</option>
                  ))}
                </select>
                {err("type")}
              </div>
            </div>
            <div className={fieldClass("message")}>
              <label htmlFor="f-message"><T fr="Quelques mots sur votre besoin" en="A few words about your project" /></label>
              <textarea
                id="f-message" name="message" rows={5} enterKeyHint="send" value={f.message} onChange={set("message")} {...aria("message")}
                placeholder={t({ fr: "Votre lieu, ce que vous aimeriez montrer, vos délais éventuels…", en: "Your place, what you’d like to show, any timing…" })}
              />
              {err("message")}
            </div>
            <div className="form-foot">
              <button type="submit" className="btn btn--solid" disabled={status.kind === "sending"}>
                {status.kind === "sending" ? (
                  <T fr="Envoi…" en="Sending…" />
                ) : (
                  <>
                    <T fr="Demander un devis" en="Request a quote" /> <span className="arr" aria-hidden="true">→</span>
                  </>
                )}
              </button>
              <p className="small"><T fr="Vos informations servent uniquement à vous répondre." en="Your details are only used to reply to you." /></p>
            </div>

            <div role="status" aria-live="polite">
              {status.kind === "sent" && (
                <p className="status ok">
                  <T fr="Merci, votre demande est bien partie. Thibault vous répond personnellement." en="Thank you, your request has been sent. Thibault will reply to you personally." />
                </p>
              )}
              {status.kind === "failed" && (
                <div className="fallback">
                  <p>
                    <T
                      fr={<><strong>Votre demande n’est pas partie.</strong> L’envoi automatique n’a pas abouti. Copiez votre message ci-dessous et envoyez-le à {EMAIL}.</>}
                      en={<><strong>Your request was not sent.</strong> Automatic sending didn’t go through. Copy your message below and send it to {EMAIL}.</>}
                    />
                  </p>
                  <textarea ref={fallbackRef} readOnly value={status.text} aria-label={t({ fr: "Votre message", en: "Your message" })} />
                  <div className="acts">
                    <button type="button" className="btn" onClick={() => copy(status.text, fallbackRef.current, "msg")}>
                      {copied === "msg" ? <T fr="Copié" en="Copied" /> : <T fr="Copier le message" en="Copy the message" />}
                    </button>
                    <a
                      className="btn"
                      href={`mailto:${EMAIL}?subject=${encodeURIComponent(`Demande de devis — ${f.name.trim()}`)}&body=${encodeURIComponent(status.text)}`}
                    >
                      <T fr="Ouvrir ma messagerie" en="Open my email app" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
