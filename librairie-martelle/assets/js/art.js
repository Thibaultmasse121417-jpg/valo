// Illustrations of the 12 shelf rayons and drawn covers (inline SVG, generated from data).
// Fictional DEMO / PICKS titles are only used when no catalogue is connected, always labelled as fictional.
/* ================= palette ================= */
const C = {
  ink:"#16130F", accent:"#9C2F1E", cobalt:"#24408E", red:"#C9452A", cream:"#EEE5D1", sand:"#E4D7BC",
  ochre:"#C8952F", green:"#2E5E48", sky:"#9DB3DA", slate:"#3B4658", rose:"#D9A08F", paper:"#F2ECDF",
};
const DARK = new Set([C.ink, C.cobalt, C.slate, C.green, C.red]);

/* ================= the shop's sections, shown as books ================= */
const BOOKS = [
  {id:"litterature", title:"Littérature & Essais", short:"Littérature", kicker:"Romans · Essais littéraires", h:1,   bg:C.cream, fg:C.ink,   ac:C.accent, motif:"quill",   where:"dès l’entrée de la librairie.",
   syn:"Romans français et étrangers, essais littéraires, premiers romans et grandes voix : la littérature est le cœur battant d’une librairie."},
  {id:"polar",       title:"Policier & Thriller",  short:"Polar",       kicker:"Enquêtes · Suspense",          h:.92, bg:C.ink,   fg:C.cream, ac:C.red,    motif:"observer", where:"le rayon policier, dans les allées.",
   syn:"Enquêtes, romans noirs et thrillers psychologiques, pour les lecteurs qui aiment tourner les pages jusqu’au bout de la nuit."},
  {id:"imaginaire",  title:"Imaginaire",           short:"Imaginaire",  kicker:"SF · Fantastique · Fantasy",   h:.96, bg:C.cobalt,fg:C.cream, ac:C.sky,    motif:"planet",   where:"science-fiction et fantasy, au sous-sol.",
   syn:"Science-fiction, fantastique et fantasy : des mondes à explorer, des sagas à commencer et des classiques à redécouvrir."},
  {id:"bd",          title:"BD, Comics & Manga",   short:"BD & Manga",  kicker:"Bande dessinée · Comics · Manga", h:.88, bg:C.ochre, fg:C.ink, ac:C.red,    motif:"bubbles",  where:"BD et mangas, au sous-sol.",
   syn:"Albums franco-belges, romans graphiques, comics et mangas : toutes les façons de raconter une histoire en cases."},
  {id:"jeunesse",    title:"Jeunesse",             short:"Jeunesse",    kicker:"Des tout-petits aux ados",     h:.86, bg:C.sky,   fg:C.ink,   ac:C.cobalt, motif:"birds",    where:"l’espace jeunesse, des tout-petits aux adolescents.",
   syn:"Des premiers imagiers aux romans pour les plus grands : de quoi éveiller très tôt le goût de lire."},
  {id:"poche",       title:"Poche",                short:"Poche",       kicker:"La pochothèque",               h:.8,  bg:C.rose,  fg:C.ink,   ac:C.red,    motif:"summer",   where:"le rayon poche, ou « pochothèque ».",
   syn:"Les classiques, les grands succès et les découvertes, au format qui tient dans la poche."},
  {id:"arts",        title:"Arts & Beaux livres",  short:"Beaux livres", kicker:"Arts · Beaux livres",         h:1,   bg:C.paper, fg:C.ink,   ac:C.red,    motif:"bauhaus",  where:"l’espace beaux-arts, dans les allées.",
   syn:"Peinture, photographie, architecture, design : de grands formats à feuilleter et à offrir."},
  {id:"actualites",  title:"Actualités & Savoirs", short:"Actualités",  kicker:"Actualités · Universitaire",   h:.97, bg:C.slate, fg:C.cream, ac:C.ochre,  motif:"columns",  where:"les rayons actualités et universitaire.",
   syn:"Histoire, philosophie, essais d’actualité et ouvrages universitaires : des livres pour comprendre le monde et en débattre."},
  {id:"voyages",     title:"Tourisme & Voyages",   short:"Voyages",     kicker:"Guides · Récits de voyage",    h:.9,  bg:C.cream, fg:C.ink,   ac:C.green,  motif:"valley",   where:"le coin tourisme, dans les allées.",
   syn:"Guides, cartes et récits de voyage, pour préparer le prochain départ ou voyager sans quitter son fauteuil."},
  {id:"scolaire",    title:"Scolaire",             short:"Scolaire",    kicker:"Le métier d’origine, depuis 1957", h:.93, bg:C.green, fg:C.cream, ac:C.ochre, motif:"grid",   where:"le rayon scolaire — premier métier de la maison, en 1957.",
   syn:"Manuels, cahiers et ouvrages parascolaires : les livres scolaires sont le premier métier de la librairie, depuis son ouverture."},
  {id:"beauxarts",   title:"Beaux-arts & Créatif", short:"Color’i",     kicker:"Beaux-arts · Loisirs créatifs", h:.89, bg:C.red,  fg:C.cream, ac:C.ink,    motif:"pencils",  where:"à l’étage, avec l’enseigne Color’i (2017).",
   syn:"Matériel de beaux-arts, loisirs créatifs, éveil artistique et encadrement : de quoi dessiner, peindre et créer."},
  {id:"jeux",        title:"Jeux & Jouets",        short:"Jeux",        kicker:"Jeux de société · Jeux éducatifs", h:.95, bg:C.sand, fg:C.cobalt, ac:C.red,  motif:"dice",     where:"jeux de société et jeux éducatifs.",
   syn:"Jeux de société pour toute la famille, jeux éducatifs et jouets : le plaisir de jouer, autour d’une table comme d’un livre."},
];
BOOKS.forEach((b, i) => { b.no = String(i + 1).padStart(2, "0"); b.topL = "LIBRAIRIE MARTELLE"; b.topR = "Nº " + b.no; b.botL = b.kicker.toUpperCase(); b.botR = "Amiens"; b.spT = b.short; b.spS = "Martelle"; b.stk = ["RAYON", b.no, "AMIENS"]; });

/* demo titles (fictional) for new releases and picks */
const DEMO = [
  {title:"La Vallée silencieuse", author:"Mara Ellison", genre:"Roman", bg:C.cream, fg:C.ink, ac:C.green, motif:"valley", h:1},
  {title:"L’Heure bleue du port", author:"Jun Okabe", genre:"Roman", bg:C.cobalt, fg:C.cream, ac:C.sky, motif:"bluehour", h:1},
  {title:"Le Fleuve de sel", author:"Tomas Halde", genre:"Récit", bg:C.sand, fg:C.slate, ac:C.cobalt, motif:"river", h:1},
  {title:"Midi de cendres", author:"Rafael Ostin", genre:"Roman noir", bg:C.cream, fg:C.ink, ac:C.red, motif:"noon", h:1},
  {title:"Le Gardien de la tempête", author:"Owen Callery", genre:"Roman", bg:C.slate, fg:C.cream, ac:C.ochre, motif:"storm", h:1},
  {title:"La Porte rouge", author:"Léa Morane", genre:"Thriller", bg:C.rose, fg:C.ink, ac:C.red, motif:"door", h:1},
];
const PICKS = [
  {title:"La Longue Marée", author:"Sora Inoue", genre:"Poésie", bg:C.paper, fg:C.cobalt, ac:C.cobalt, motif:"tide", h:1,
   note:"Un recueil à lire lentement, au rythme des marées. Chaque poème est une respiration, et l’on referme le livre avec le sel encore sur les lèvres."},
  {title:"Les Oiseaux tombés", author:"Ada Brennick", genre:"Roman", bg:C.sky, fg:C.ink, ac:C.cobalt, motif:"birds", h:1,
   note:"Une enquête douce et inquiète dans un village où les oiseaux se sont tus. On s’attache à chaque personnage dès la première page."},
  {title:"Une guerre tranquille", author:"Félix Arden", genre:"Roman", bg:C.red, fg:C.cream, ac:C.ink, motif:"war", h:1,
   note:"Trente ans de brouille entre deux voisins, racontés avec un humour tendre. Le livre parfait à offrir à quelqu’un qui croit ne pas aimer lire."},
];
[...DEMO, ...PICKS].forEach((b) => { b.topL = b.genre.toUpperCase(); b.topR = "DÉMO"; b.botL = b.author.toUpperCase(); b.botR = "Titre fictif"; b.spT = b.title; b.spS = b.author.split(" ").pop(); b.stk = null; b.kicker = b.genre; });


/* ================= book art (inline SVG) ================= */
const SVGNS = "http://www.w3.org/2000/svg";
const f2 = (n) => +n.toFixed(1);
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const SERIF = "Fraunces, Georgia, serif", SANS = "Inter Tight, sans-serif";
function wrap(t, max) {
  const out = []; let line = "";
  for (const w of t.split(" ")) { if (line && (line + " " + w).length > max) { out.push(line); line = w; } else line = line ? line + " " + w : w; }
  out.push(line); return out;
}
function motif(b, x, y, w, h) {
  const X = (u) => f2(x + u * w), Y = (v) => f2(y + v * h), M = Math.min(w, h);
  const poly = (pts, fill, ex = "") => `<path d="M${pts.map(([u, v]) => X(u) + " " + Y(v)).join("L")}Z" fill="${fill}" ${ex}/>`;
  const circ = (u, v, r, fill, ex = "") => `<circle cx="${X(u)}" cy="${Y(v)}" r="${f2(r * M)}" fill="${fill}" ${ex}/>`;
  const rect = (u, v, ww, hh, fill, ex = "") => `<rect x="${X(u)}" y="${Y(v)}" width="${f2(ww * w)}" height="${f2(hh * h)}" fill="${fill}" ${ex}/>`;
  const mul = 'style="mix-blend-mode:multiply"';
  const { fg, ac, bg } = b;
  let s = "";
  switch (b.motif) {
    case "quill":
      s += circ(.78, .2, .14, ac, mul);
      s += `<path d="M${X(.5)} ${Y(.9)}Q${X(.3)} ${Y(.78)} ${X(.04)} ${Y(.84)}V${Y(.36)}Q${X(.3)} ${Y(.3)} ${X(.5)} ${Y(.42)}Z" fill="${C.paper}" stroke="${fg}" stroke-width="3"/>`;
      s += `<path d="M${X(.5)} ${Y(.9)}Q${X(.7)} ${Y(.78)} ${X(.96)} ${Y(.84)}V${Y(.36)}Q${X(.7)} ${Y(.3)} ${X(.5)} ${Y(.42)}Z" fill="${C.paper}" stroke="${fg}" stroke-width="3"/>`;
      for (let i = 0; i < 5; i++) {
        s += `<path d="M${X(.1)} ${Y(.46 + i * .07)}Q${X(.3)} ${Y(.42 + i * .07)} ${X(.44)} ${Y(.5 + i * .07)}" stroke="${fg}" stroke-width="2" fill="none" opacity=".55"/>`;
        s += `<path d="M${X(.56)} ${Y(.5 + i * .07)}Q${X(.7)} ${Y(.42 + i * .07)} ${X(.9)} ${Y(.46 + i * .07)}" stroke="${fg}" stroke-width="2" fill="none" opacity=".55"/>`;
      }
      s += `<path d="M${X(.62)} ${Y(.62)}C${X(.7)} ${Y(.3)} ${X(.86)} ${Y(.06)} ${X(.98)} ${Y(-.04)}C${X(.94)} ${Y(.18)} ${X(.8)} ${Y(.42)} ${X(.62)} ${Y(.62)}Z" fill="${ac}"/>`;
      s += `<line x1="${X(.62)}" y1="${Y(.62)}" x2="${X(.9)}" y2="${Y(.08)}" stroke="${bg}" stroke-width="2"/>`;
      break;
    case "observer":
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++)
        s += `<rect x="${X(.06 + i * .235)}" y="${Y(.04 + j * .32)}" width="${f2(w * .2)}" height="${f2(h * .27)}" fill="none" stroke="${fg}" stroke-width="1.5" opacity=".35"/>`;
      s += `<path d="M${X(.08)} ${Y(.5)}Q${X(.5)} ${Y(.1)} ${X(.92)} ${Y(.5)}Q${X(.5)} ${Y(.9)} ${X(.08)} ${Y(.5)}Z" fill="${fg}"/>`;
      s += circ(.5, .5, .2, ac); s += circ(.5, .5, .09, C.ink); s += circ(.56, .44, .03, fg);
      break;
    case "planet":
      for (let i = 0; i < 22; i++) { const u = (i * 37 % 100) / 100, v = (i * 61 % 100) / 100; s += circ(u, v, .006 + (i % 3) * .004, fg, 'opacity=".8"'); }
      s += circ(.46, .52, .3, ac);
      s += `<path d="M${X(.2)} ${Y(.56)}A${f2(M * .3)} ${f2(M * .3)} 0 0 0 ${X(.72)} ${Y(.48)}" fill="${C.ink}" opacity=".25"/>`;
      s += `<ellipse cx="${X(.46)}" cy="${Y(.52)}" rx="${f2(M * .5)}" ry="${f2(M * .11)}" fill="none" stroke="${fg}" stroke-width="4" transform="rotate(-18 ${X(.46)} ${Y(.52)})"/>`;
      s += circ(.86, .18, .06, C.red); s += circ(.14, .86, .04, fg);
      break;
    case "bubbles": {
      const bub = (u, v, ww, hh, fill, tail, txt) => {
        let o = `<rect x="${X(u)}" y="${Y(v)}" width="${f2(ww * w)}" height="${f2(hh * h)}" rx="${f2(M * .08)}" fill="${fill}" stroke="${C.ink}" stroke-width="3"/>`;
        o += `<path d="M${X(u + tail)} ${Y(v + hh) - 2}l${f2(-w * .04)} ${f2(h * .12)}l${f2(w * .09)} ${f2(-h * .12)}Z" fill="${fill}" stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"/>`;
        o += `<rect x="${X(u + tail) - 1}" y="${Y(v + hh) - 5}" width="${f2(w * .05) + 2}" height="5" fill="${fill}"/>`;
        return o + txt;
      };
      s += bub(.02, .04, .56, .34, C.cream, .14, `<text x="${X(.3)}" y="${Y(.27)}" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="${f2(M * .2)}" fill="${C.ink}">!?</text>`);
      s += bub(.42, .44, .56, .3, C.red, .36, [0, 1, 2].map((i) => `<rect x="${X(.48)}" y="${Y(.5 + i * .075)}" width="${f2(w * (.44 - i * .1))}" height="5" rx="2.5" fill="${C.cream}"/>`).join(""));
      s += circ(.18, .74, .14, C.ink); s += circ(.18, .74, .1, C.cream);
      s += circ(.14, .72, .018, C.ink); s += circ(.22, .72, .018, C.ink);
      s += `<path d="M${X(.12)} ${Y(.8)}q${f2(w * .06)} ${f2(h * .05)} ${f2(w * .12)} 0" stroke="${C.ink}" stroke-width="3" fill="none"/>`;
      break; }
    case "birds":
      [[.2, .12, 0, 1], [.55, .2, 20, .8], [.78, .1, -10, .7], [.35, .42, 40, 1.1], [.68, .5, 70, .9], [.18, .68, 110, .8], [.5, .82, 150, 1.2]].forEach(([u, v, rot, sc], i) => {
        s += `<path transform="translate(${X(u)} ${Y(v)}) rotate(${rot}) scale(${sc})" d="M-34 -6Q-16 -18 0 2Q16 -18 34 -6Q16 -8 0 12Q-16 -8 -34 -6Z" fill="${i % 2 ? ac : fg}"/>`;
      });
      s += `<line x1="${X(0)}" y1="${Y(.98)}" x2="${X(1)}" y2="${Y(.98)}" stroke="${fg}" stroke-width="3"/>`;
      break;
    case "summer":
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2, r0 = .3, r1 = i % 2 ? .44 : .5;
        s += `<line x1="${f2(X(.5) + Math.cos(a) * r0 * M)}" y1="${f2(Y(.5) + Math.sin(a) * r0 * M)}" x2="${f2(X(.5) + Math.cos(a) * r1 * M)}" y2="${f2(Y(.5) + Math.sin(a) * r1 * M)}" stroke="${fg}" stroke-width="4"/>`;
      }
      s += circ(.5, .5, .26, ac);
      s += `<path d="M${X(.5)} ${Y(.62)}c${f2(-w * .14)} ${f2(-h * .1)} ${f2(-w * .1)} ${f2(-h * .26)} 0 ${f2(-h * .18)}c${f2(w * .1)} ${f2(-h * .08)} ${f2(w * .14)} ${f2(h * .08)} 0 ${f2(h * .18)}Z" fill="${C.cream}"/>`;
      break;
    case "bauhaus":
      s += rect(0, 0, .5, .5, ac);
      s += `<path d="M${X(.5)} ${Y(.5)}A${f2(w * .5)} ${f2(w * .5)} 0 0 1 ${X(1)} ${Y(0)}V${Y(.5)}Z" fill="${C.cobalt}"/>`;
      s += circ(.25, .75, .24, C.ink); s += poly([[.5, 1], [.75, .5], [1, 1]], C.ochre);
      s += rect(.5, .5, .25, .5, "none", `stroke="${fg}" stroke-width="3"`); s += circ(.25, .25, .1, C.cream);
      break;
    case "columns":
      s += circ(.5, .3, .32, ac, 'opacity=".9"');
      s += poly([[.04, .3], [.5, .08], [.96, .3]], fg); s += rect(.04, .3, .92, .05, fg);
      for (let i = 0; i < 5; i++) { s += rect(.1 + i * .175, .38, .09, .48, fg); for (let k = 1; k < 3; k++) s += rect(.1 + i * .175 + k * .03, .38, .006, .48, bg, 'opacity=".5"'); }
      s += rect(.02, .87, .96, .05, fg); s += rect(0, .94, 1, .05, fg);
      break;
    case "valley":
      s += circ(.72, .22, .12, C.red, mul);
      s += poly([[0, 1], [.28, .3], [.5, .66], [.72, .4], [1, .82], [1, 1]], ac, 'opacity=".55"');
      s += poly([[0, 1], [0, .62], [.22, .5], [.46, .86], [.66, .62], [1, 1]], ac);
      s += poly([[0, 1], [.18, .8], [.36, 1]], fg);
      s += `<path d="M${X(.38)} ${Y(1)}C${X(.5)} ${Y(.86)} ${X(.44)} ${Y(.78)} ${X(.56)} ${Y(.7)}" stroke="${bg}" stroke-width="5" fill="none"/>`;
      s += `<path d="M${X(.1)} ${Y(.2)}l${f2(w * .05)} ${f2(-h * .03)}l${f2(w * .05)} ${f2(h * .03)}" stroke="${fg}" stroke-width="3" fill="none"/>`;
      break;
    case "grid":
      for (let i = 0; i <= 10; i++) {
        s += `<line x1="${X(i / 10)}" y1="${Y(0)}" x2="${X(i / 10)}" y2="${Y(1)}" stroke="${fg}" stroke-width="1.2" opacity=".3"/>`;
        s += `<line x1="${X(0)}" y1="${Y(i / 10)}" x2="${X(1)}" y2="${Y(i / 10)}" stroke="${fg}" stroke-width="1.2" opacity=".3"/>`;
      }
      s += `<path d="M${X(.1)} ${Y(.8)}C${X(.3)} ${Y(.2)} ${X(.5)} ${Y(.9)} ${X(.7)} ${Y(.35)}" stroke="${ac}" stroke-width="5" fill="none"/>`;
      s += `<g transform="rotate(-38 ${X(.72)} ${Y(.34)})"><rect x="${X(.72)}" y="${Y(.3)}" width="${f2(w * .5)}" height="${f2(h * .09)}" fill="${C.ochre}" stroke="${C.ink}" stroke-width="2"/><path d="M${X(.72)} ${Y(.3)}l${f2(-w * .1)} ${f2(h * .045)}l${f2(w * .1)} ${f2(h * .045)}Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="2"/><rect x="${X(1.16)}" y="${Y(.3)}" width="${f2(w * .06)}" height="${f2(h * .09)}" fill="${C.rose}" stroke="${C.ink}" stroke-width="2"/></g>`;
      s += `<text x="${X(.06)}" y="${Y(.16)}" font-family="${SERIF}" font-style="italic" font-size="${f2(M * .16)}" fill="${fg}">a+b</text>`;
      break;
    case "pencils":
      [C.cream, C.ochre, C.cobalt, C.ink, C.sky, C.cream].forEach((c, i) => {
        const u = .04 + i * .16, top = .08 + ((i * 3) % 5) * .07;
        s += rect(u, top + .12, .11, .9 - top - .12, c, `stroke="${C.ink}" stroke-width="2"`);
        s += rect(u + .036, top + .12, .038, .9 - top - .12, "#000", 'opacity=".12"');
        s += poly([[u, top + .12], [u + .055, top], [u + .11, top + .12]], C.sand, `stroke="${C.ink}" stroke-width="2"`);
        s += poly([[u + .04, top + .04], [u + .055, top], [u + .07, top + .04]], c === C.cream ? C.ink : c);
      });
      s += rect(0, .9, 1, .04, fg);
      break;
    case "dice": {
      const die = (cx, cy, sz, rot, pips, fill) => {
        let o = `<g transform="rotate(${rot} ${X(cx)} ${Y(cy)})"><rect x="${f2(X(cx) - sz * M / 2)}" y="${f2(Y(cy) - sz * M / 2)}" width="${f2(sz * M)}" height="${f2(sz * M)}" rx="${f2(sz * M * .16)}" fill="${fill}" stroke="${C.ink}" stroke-width="3"/>`;
        pips.forEach(([a, c]) => { o += `<circle cx="${f2(X(cx) + a * sz * M * .28)}" cy="${f2(Y(cy) + c * sz * M * .28)}" r="${f2(sz * M * .075)}" fill="${fill === C.ink ? C.cream : C.ink}"/>`; });
        return o + "</g>";
      };
      s += die(.3, .32, .42, -12, [[-1, -1], [0, 0], [1, 1]], C.cream);
      s += die(.68, .56, .36, 16, [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]], ac);
      s += `<path transform="translate(${X(.24)} ${Y(.8)}) scale(${f2(M / 300)})" d="M0 -60c-12 0-20 9-20 20 0 7 3 12 8 15-22 4-45 12-45 22 0 7 14 9 30 9l-16 40h86l-16-40c16 0 30-2 30-9 0-10-23-18-45-22 5-3 8-8 8-15 0-11-8-20-20-20z" fill="${fg}"/>`;
      break; }
    case "bluehour":
      s += circ(.5, .48, .44, ac);
      s += `<rect x="${X(0)}" y="${Y(.56)}" width="${f2(w)}" height="${f2(h * .44)}" fill="${C.ink}" opacity=".45"/>`;
      for (let i = 0; i < 7; i++) s += `<rect x="${X(.12 + i * .02)}" y="${Y(.6 + i * .055)}" width="${f2(w * (.76 - i * .04))}" height="3" fill="${fg}" opacity="${.9 - i * .1}"/>`;
      s += poly([[.62, .56], [.66, .5], [.7, .56]], fg);
      break;
    case "river":
      for (let i = 0; i < 8; i++) {
        const yy = .08 + i * .12;
        s += `<path d="M${X(-.05)} ${Y(yy + .1)}Q${X(.25)} ${Y(yy - .06)} ${X(.5)} ${Y(yy + .04)}T${X(1.05)} ${Y(yy - .02)}" stroke="${i % 3 === 1 ? C.red : ac}" stroke-width="${i % 3 === 1 ? 4 : 9}" fill="none" ${mul}/>`;
      }
      s += poly([[.3, .52], [.62, .52], [.56, .6], [.36, .6]], fg);
      s += `<rect x="${X(.45)}" y="${Y(.3)}" width="3" height="${f2(h * .22)}" fill="${fg}"/>`;
      break;
    case "noon":
      s += circ(.5, .4, .4, ac);
      s += `<rect x="${X(0)}" y="${Y(.8)}" width="${f2(w)}" height="${f2(h * .2)}" fill="${fg}"/>`;
      s += poly([[0, .8], [.18, .7], [.34, .8]], fg); s += poly([[.66, .8], [.84, .66], [1, .8]], fg);
      s += `<rect x="${X(.27)}" y="${Y(.66)}" width="${f2(w * .03)}" height="${f2(h * .14)}" fill="${fg}"/>`;
      s += circ(.285, .63, .025, fg);
      break;
    case "storm":
      s += poly([[.5, .26], [1.1, 0], [1.1, .4]], ac, 'opacity=".7"');
      s += poly([[.5, .26], [-.1, .05], [-.1, .32]], ac, 'opacity=".4"');
      s += poly([[.44, .86], [.47, .3], [.53, .3], [.56, .86]], C.cream);
      s += `<rect x="${X(.455)}" y="${Y(.22)}" width="${f2(w * .09)}" height="${f2(h * .08)}" fill="${ac}"/>`;
      s += poly([[.44, .22], [.5, .15], [.56, .22]], C.cream);
      for (let i = 0; i < 4; i++) s += `<rect x="${X(.47)}" y="${Y(.38 + i * .12)}" width="${f2(w * .06)}" height="${f2(h * .04)}" fill="${C.red}"/>`;
      for (let i = 0; i < 4; i++) s += `<path d="M${X(-.02)} ${Y(.82 + i * .05)}q${f2(w * .1)} -14 ${f2(w * .2)} 0t${f2(w * .2)} 0t${f2(w * .2)} 0t${f2(w * .2)} 0t${f2(w * .2)} 0" stroke="${fg}" stroke-width="3" fill="none" opacity="${1 - i * .2}"/>`;
      break;
    case "tide":
      for (let i = 0; i < 9; i++) { const r = .12 + i * .1;
        s += `<path d="M${f2(X(.5) - r * w)} ${Y(1)}A${f2(r * w)} ${f2(r * w)} 0 0 1 ${f2(X(.5) + r * w)} ${Y(1)}" stroke="${i % 3 === 2 ? C.red : ac}" stroke-width="${i % 3 === 2 ? 3 : 7}" fill="none"/>`; }
      s += circ(.5, .16, .06, C.red);
      break;
    case "war":
      for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) s += `<rect x="${X(.22 + (r % 2 ? .1 : 0) + c * .1)}" y="${Y(.36 + r * .1)}" width="${f2(w * .09)}" height="${f2(h * .085)}" fill="${fg}" opacity=".9"/>`;
      s += circ(.1, .5, .07, ac); s += `<rect x="${X(.07)}" y="${Y(.58)}" width="${f2(w * .06)}" height="${f2(h * .42)}" fill="${ac}"/>`;
      s += circ(.9, .5, .07, ac); s += `<rect x="${X(.87)}" y="${Y(.58)}" width="${f2(w * .06)}" height="${f2(h * .42)}" fill="${ac}"/>`;
      s += circ(.5, .14, .1, C.cream, 'opacity=".9"');
      break;
    case "door":
      s += `<path d="M${X(.28)} ${Y(1)}V${Y(.3)}A${f2(w * .22)} ${f2(w * .22)} 0 0 1 ${X(.72)} ${Y(.3)}V${Y(1)}Z" fill="${C.ink}"/>`;
      s += `<path d="M${X(.33)} ${Y(1)}V${Y(.32)}A${f2(w * .17)} ${f2(w * .17)} 0 0 1 ${X(.67)} ${Y(.32)}V${Y(1)}Z" fill="${ac}"/>`;
      s += circ(.6, .66, .025, C.cream);
      for (let i = 0; i < 3; i++) s += `<rect x="${X(.2 - i * .06)}" y="${Y(.92 + i * .04)}" width="${f2(w * (.6 + i * .12))}" height="2.5" fill="${fg}"/>`;
      break;
  }
  return s;
}
function coverArt(b) {
  const W = 474, Hh = Math.round(711 * b.h);
  const lines = wrap(b.title, 11), longest = Math.max(...lines.map((l) => l.length));
  const fs = Math.min(80, 400 / (longest * .52));
  const t0 = 92 + fs * .8;
  let s = `<rect width="${W}" height="${Hh}" fill="${b.bg}"/>`;
  s += `<text x="40" y="50" font-family="${SANS}" font-weight="600" font-size="13" letter-spacing="3" fill="${b.fg}">${esc(b.topL)}</text>`;
  s += `<text x="434" y="50" text-anchor="end" font-family="${SANS}" font-weight="600" font-size="13" letter-spacing="3" fill="${b.fg}">${esc(b.topR)}</text>`;
  s += `<rect x="40" y="64" width="394" height="1.5" fill="${b.fg}" opacity=".7"/>`;
  lines.forEach((l, i) => { s += `<text x="37" y="${f2(t0 + i * fs * .95)}" font-family="${SERIF}" font-weight="400" font-size="${f2(fs)}" letter-spacing="-2.4" fill="${b.fg}">${esc(l)}</text>`; });
  const my = t0 + (lines.length - 1) * fs * .95 + 44, mh = Hh - 112 - my;
  s += `<g>${motif(b, 40, my, 394, mh)}</g>`;
  s += `<rect x="40" y="${Hh - 88}" width="394" height="1.5" fill="${b.fg}" opacity=".7"/>`;
  s += `<text x="40" y="${Hh - 50}" font-family="${SANS}" font-weight="600" font-size="13" letter-spacing="3" fill="${b.fg}">${esc(b.botL)}</text>`;
  s += `<text x="434" y="${Hh - 50}" text-anchor="end" font-family="${SERIF}" font-style="italic" font-size="19" fill="${b.fg}">${esc(b.botR)}</text>`;
  return { s, W, H: Hh };
}
function spineArt(b) {
  const W = 90, Hh = Math.round(660 * b.h);
  const avail = Hh - (b.stk ? 300 : 210);
  const fs = Math.min(36, avail / (b.spT.length * .48));
  const band = b.ac === b.fg ? C.red : b.ac;
  const foil = DARK.has(b.bg);
  const tf = foil ? "url(#foil)" : b.fg;
  let s = foil ? `<defs><linearGradient id="foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3D99A"/><stop offset=".45" stop-color="#C9973E"/><stop offset=".7" stop-color="#F7E3AE"/><stop offset="1" stop-color="#B07F2E"/></linearGradient></defs>` : "";
  s += `<rect width="${W}" height="${Hh}" fill="${b.bg}"/>`;
  s += `<rect y="22" width="${W}" height="9" fill="${foil ? "url(#foil)" : band}"/><rect y="36" width="${W}" height="2" fill="${b.fg}" opacity=".7"/>`;
  if (b.stk) s += `<circle cx="45" cy="72" r="15" fill="none" stroke="${tf}" stroke-width="2"/><text x="45" y="77" text-anchor="middle" font-family="${SANS}" font-weight="600" font-size="13" fill="${tf}">${b.no}</text>`;
  s += `<text transform="translate(${f2(45 - fs * .34)} ${b.stk ? 108 : 60}) rotate(90)" font-family="${SERIF}" font-weight="400" font-size="${f2(fs)}" letter-spacing="-.8" fill="${tf}">${esc(b.spT)}</text>`;
  s += `<text x="45" y="${Hh - (b.stk ? 160 : 70)}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="15" fill="${b.fg}">${esc(b.spS)}</text>`;
  if (b.stk) {
    s += `<rect x="13" y="${Hh - 136}" width="64" height="70" rx="3" fill="#F7F2E6" stroke="${C.ink}" stroke-opacity=".25"/>`;
    b.stk.forEach((c, i) => { s += `<text x="45" y="${Hh - 113 + i * 18}" text-anchor="middle" font-family="${SANS}" font-weight="600" font-size="${i === 1 ? 14 : 10}" letter-spacing=".8" fill="${C.ink}">${c}</text>`; });
  }
  s += `<rect y="${Hh - 46}" width="${W}" height="2" fill="${b.fg}" opacity=".7"/><rect y="${Hh - 40}" width="${W}" height="9" fill="${foil ? "url(#foil)" : band}"/>`;
  return { s, W, H: Hh };
}
function backArt(b) {
  const W = 474, Hh = Math.round(711 * b.h);
  let s = `<rect width="${W}" height="${Hh}" fill="${b.bg}"/>`;
  s += `<text x="44" y="90" font-family="${SERIF}" font-style="italic" font-size="30" fill="${b.fg}">${esc(b.title)}</text>`;
  for (let i = 0; i < 9; i++) s += `<rect x="44" y="${130 + i * 26}" width="${i === 8 ? 220 : 386}" height="7" rx="3.5" fill="${b.fg}" opacity=".22"/>`;
  s += `<text x="44" y="${Hh - 60}" font-family="${SANS}" font-weight="600" font-size="13" letter-spacing="3" fill="${b.fg}">LIBRAIRIE MARTELLE</text>`;
  s += `<rect x="330" y="${Hh - 130}" width="104" height="74" fill="#F7F2E6"/>`;
  for (let i = 0; i < 26; i++) s += `<rect x="${f2(340 + i * 3.4)}" y="${Hh - 122}" width="${i % 3 ? 1.4 : 2.2}" height="48" fill="${C.ink}"/>`;
  return { s, W, H: Hh };
}
const svgMarkup = ({ s, W, H }) => `<svg xmlns="${SVGNS}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${s}</svg>`;

export { C, DARK, BOOKS, DEMO, PICKS, f2, esc, wrap, motif, coverArt, spineArt, backArt, svgMarkup };
