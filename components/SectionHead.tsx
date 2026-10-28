import { T } from "@/lib/LanguageContext";
import { lines } from "@/lib/rich";
import type { L, Title } from "@/data/site";

/** En-tête de section : numéro + libellé, titre composé, chapeau facultatif. */
export default function SectionHead({
  num,
  label,
  title,
  body,
  id,
  size = "t-l",
  variant = "",
}: {
  num: string;
  label: L;
  title: Title;
  body?: L;
  id: string;
  size?: "t-xl" | "t-l" | "t-m";
  variant?: "" | "wide";
}) {
  return (
    <div className={`sec-head${variant ? ` ${variant}` : ""}`}>
      <p className="label" data-reveal>
        <b>{num}</b>&nbsp; <T fr={label.fr} en={label.en} />
      </p>
      <h2 className={size} id={id} data-reveal>
        <T fr={lines(title.fr)} en={lines(title.en)} />
      </h2>
      {body && (
        <p className="body-l" data-reveal>
          <T fr={body.fr} en={body.en} />
        </p>
      )}
    </div>
  );
}
