// Revizone - script principal (interface uniquement, pas de backend)

const TAB_TITLES = {
  accueil: "Accueil",
  favoris: "Favoris",
  ajouter: "Ajouter",
  cafe: "Café",
  profil: "Profil",
};

// Facultés affichées sur la carte.
// x / y : centre de la loupe, en % de la carte.
// `up: true` : la loupe a une pointe vers le haut (faculté hors de la carte).
// Couleurs et positions provisoires, à ajuster.
// Les couleurs sont celles des logos.
const FACULTES = [
  { id: "droit",   nom: "Faculté de Droit",                            logo: "images/logo_fac/FD.svg",   photo: "images/facultés/droit.png",       color: "#ff0000", x: 14, y: 66 },
  { id: "eco",     nom: "Faculté des Sciences économiques",            logo: "images/logo_fac/FSE.svg",  photo: "images/facultés/science_eco.png", color: "#ffb900", x: 38, y: 35 },
  { id: "lettres", nom: "Faculté des Lettres et des Sciences humaines", logo: "images/logo_fac/FLSH.svg", photo: "images/facultés/lettres.png",     color: "#0099ff", x: 66, y: 68 },
  { id: "science", nom: "Faculté des Sciences",                        logo: "images/logo_fac/FS.svg",   photo: "images/facultés/science.png",     color: "#66cc33", x: 84, y: 28, up: true },
];

function setActiveTab(tab) {
  if (!TAB_TITLES[tab]) tab = "accueil";

  document.querySelectorAll(".nav__item").forEach((item) => {
    const isActive = item.dataset.tab === tab;
    item.classList.toggle("nav__item--active", isActive);
    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("hidden", view.dataset.view !== tab);
  });

  document.getElementById("page-title").textContent = TAB_TITLES[tab];
}

function renderCampusMap() {
  const map = document.getElementById("campus-map");

  FACULTES.forEach((f) => {
    const lens = document.createElement("a");
    // Dans la moitié basse de la carte, le nom s'affiche au-dessus du rond pour ne pas sortir de la carte.
    lens.className = "lens" + (f.up ? " lens--up" : "") + (f.y > 50 ? " lens--label-top" : "");
    lens.href = "#accueil/" + f.id;
    lens.dataset.faculte = f.id;
    lens.title = f.nom;
    lens.style.left = f.x + "%";
    lens.style.top = f.y + "%";
    lens.style.setProperty("--lens-color", f.color);
    // Une url() dans une variable CSS se résout depuis css/style.css : on la rend absolue.
    lens.style.setProperty("--lens-logo", `url("${new URL(f.logo, document.baseURI).href}")`);

    const disc = document.createElement("span");
    disc.className = "lens__disc";

    const photo = document.createElement("span");
    photo.className = "lens__photo";
    photo.style.backgroundImage = `url("${f.photo}")`;

    const top = document.createElement("span");
    top.className = "lens__half lens__half--top";
    const bottom = document.createElement("span");
    bottom.className = "lens__half lens__half--bottom";

    const label = document.createElement("span");
    label.className = "lens__label";
    label.textContent = f.nom;

    disc.append(photo, top, bottom);
    lens.append(disc, label);
    map.appendChild(lens);
  });
}

// Matières (provisoires, les mêmes pour toutes les facultés et tous les semestres).
// Une matière par compartiment de la bibliothèque (5 compartiments).
const MATIERES = [
  "Management",
  "Intro éco 2",
  "Maths 2",
  "Technologie de l'info",
  "Droit commercial",
];

// Couleurs des livres : les 4 premières sont celles des facultés ; les catégories
// de favoris peuvent prendre n'importe laquelle des 8. `livres` : livres posés sur l'étagère
// (images transparentes de la même taille que la bibliothèque). Les pages de livre
// sont dans images/assets/03_pagepdf/pages/<couleur>/.
const COULEURS = {
  rouge:  { nom: "Rouge",  hex: "#ff0000", livres: "images/assets/02_matiere/books/livres-rouge.webp" },
  jaune:  { nom: "Jaune",  hex: "#ffb900", livres: "images/assets/02_matiere/books/livres_jaunes.webp" },
  bleu:   { nom: "Bleu",   hex: "#0099ff", livres: "images/assets/02_matiere/books/livres-bleu.webp" },
  vert:   { nom: "Vert",   hex: "#66cc33", livres: "images/assets/02_matiere/books/livres-vert.webp" },
  orange: { nom: "Orange", hex: "#ff7f00", livres: "images/assets/02_matiere/books/livres-orange.webp" },
  noir:   { nom: "Noir",   hex: "#3a3a40", livres: "images/assets/02_matiere/books/livres-noir.webp" },
  rose:   { nom: "Rose",   hex: "#f0509c", livres: "images/assets/02_matiere/books/livres-rose.webp" },
  violet: { nom: "Violet", hex: "#8e44d6", livres: "images/assets/02_matiere/books/livres-violet.webp" },
};

const COULEUR_DE_FACULTE = { droit: "rouge", eco: "jaune", lettres: "bleu", science: "vert" };

// Étagère des matières : un étage par matière. Chaque étage montre sa part de l'image des livres
// (découpée entre deux planches) ou une décoration (voir DECOS, plus bas).
function renderShelf(faculte) {
  const shelf = document.getElementById("shelf");
  shelf.replaceChildren();
  const enDeco = modeDeco === "matieres";
  shelf.classList.toggle("shelf--deco", enDeco);
  majBandeauDeco("matieres");

  MATIERES.forEach((nom, index) => {
    const etage = ETAGES_MATIERES[index];
    const deco = decoAffichee(etage);
    const verrouillee = !decosDebloquees.has(deco.id);

    let contenu;
    if (deco.image) {
      contenu = document.createElement("img");
      contenu.className = "shelf__deco";
      contenu.src = encodeURI(deco.image(index + 1));
      contenu.alt = "";
    } else {
      contenu = document.createElement("div");
      contenu.className = "shelf__books";
      contenu.style.backgroundImage = `url("${COULEURS[COULEUR_DE_FACULTE[faculte.id]].livres}")`;
    }
    contenu.dataset.etage = index + 1;
    contenu.classList.toggle("deco--verrouille", verrouillee);
    shelf.appendChild(contenu);

    const row = document.createElement("div");
    row.className = "shelf__row";
    row.dataset.etage = index + 1;

    let label;
    if (enDeco && verrouillee) {
      label = creerCadenas(deco, etage);
    } else {
      label = document.createElement("button");
      label.type = "button";
      label.className = "shelf__label";
      label.textContent = nom;
      if (enDeco) {
        label.disabled = true; // en mode décoration, la plaque n'ouvre pas la matière
        label.title = deco.nom;
      } else {
        // Un clic sur une matière ouvre sa liste de documents (#accueil/<id>/<n>/<index>)
        label.addEventListener("click", () => {
          location.hash = `${location.hash}/${index}`;
        });
      }
    }
    row.appendChild(label);
    if (enDeco) ajouterFleches(row, etage, nom);
    shelf.appendChild(row);
  });
}

// Générateur pseudo-aléatoire reproductible : la même graine donne toujours la même suite
function creerAleatoire(seed) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashTexte(texte) {
  let h = 2166136261;
  for (const c of texte) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

function melanger(liste, random) {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

// Utilisateurs fictifs.
// `xp`     : donne le niveau (badge à droite du pseudo)
// `notes`  : nombre de notes reçues sur leurs résumés
// `basses` : combien de ces notes sont sous 4 étoiles (sert à la certification)
// `pfp`    : photo de profil (images/pfp/<pfp>.png) ; certains n'en ont pas.
// Seules Lucie_M et Amélie remplissent les conditions de certification.
// Samuel.K a assez de notes mais trop de notes basses ; Léa.dlt l'inverse.
const UTILISATEURS = [
  { pseudo: "Lucie_M",   xp: 3200, notes: 420, basses: 38, pfp: "pfp_09" },
  { pseudo: "Amélie",    xp: 2600, notes: 260, basses: 31, pfp: "pfp_02" },
  { pseudo: "Samuel.K",  xp: 1980, notes: 310, basses: 70, pfp: "pfp_15" },
  { pseudo: "Léa.dlt",   xp: 1450, notes: 85,  basses: 4,  pfp: "pfp_13" },
  { pseudo: "Lucas_GTR", xp: 950,  notes: 140, basses: 30, pfp: "pfp_20" },
  { pseudo: "Inès.R",    xp: 880,  notes: 95,  basses: 9,  pfp: "pfp_03" },
  { pseudo: "Manon",     xp: 770,  notes: 120, basses: 25, pfp: "pfp_18" },
  { pseudo: "Kevin.B",   xp: 720,  notes: 110, basses: 21, pfp: "pfp_11" },
  { pseudo: "Chloé_V",   xp: 610,  notes: 70,  basses: 6,  pfp: "pfp_07" },
  { pseudo: "Elias_ne",  xp: 540,  notes: 64,  basses: 14, pfp: "pfp_16" },
  { pseudo: "Matteo",    xp: 460,  notes: 50,  basses: 9,  pfp: "pfp_06" },
  { pseudo: "Jade",      xp: 390,  notes: 41,  basses: 8,  pfp: "pfp_19" },
  { pseudo: "Sarah",     xp: 350,  notes: 38,  basses: 6,  pfp: "pfp_05" },
  { pseudo: "Arthur_42", xp: 300,  notes: 33,  basses: 10, pfp: "pfp_04" },
  { pseudo: "Valentin",  xp: 250,  notes: 27,  basses: 5,  pfp: "pfp_01" },
  { pseudo: "Zoé",       xp: 205,  notes: 22,  basses: 3,  pfp: "pfp_12" },
  { pseudo: "Hugo.P",    xp: 130,  notes: 14,  basses: 5,  pfp: null },
  { pseudo: "Noé_2003",  xp: 120,  notes: 13,  basses: 2,  pfp: "pfp_10" },
  { pseudo: "Yanis",     xp: 90,   notes: 10,  basses: 4,  pfp: null },
  { pseudo: "Maya",      xp: 60,   notes: 7,   basses: 1,  pfp: "pfp_14" },
  { pseudo: "Tom",       xp: 40,   notes: 5,   basses: 3,  pfp: null },
  { pseudo: "Nora",      xp: 15,   notes: 2,   basses: 0,  pfp: "pfp_17" },
];

const TITRES_DOCUMENTS = [
  "Résumé complet", "Fiche de triche", "Résumé du cours", "Résumé des exercices",
  "Fiche de formules", "Résumé chapitre 3", "Notes de cours", "Synthèse pour l'examen",
  "Corrigé de la série 4", "Plan du cours détaillé", "Flashcards", "Résumé des slides",
  "Questions d'examen corrigées", "Carte mentale du cours", "Définitions à connaître",
];

const FAUX_PDF = [
  "autres_assets/faux_pdf/Resume_cours_Maths_1.pdf",
  "autres_assets/faux_pdf/Resume_cours_Stat_1.pdf",
  "autres_assets/faux_pdf/Aide_memoire_statistique.pdf",
  "autres_assets/faux_pdf/Plan_detaille_du_cours.pdf",
];

// Documents d'une matière (provisoires) : 7 à 13 auteurs tirés au sort, toujours les mêmes
// pour une matière donnée, dont au moins une autrice certifiée.
// `nbNotes` / `somme` : notes données par les autres étudiants (la moyenne = somme / nbNotes)
// `note`              : ma note sur ce document (de 0,5 à 5), ou null si je n'ai pas noté.
function genererDocuments(key) {
  const random = creerAleatoire(hashTexte(key));
  const certifies = UTILISATEURS.filter(estCertifie);
  const autres = UTILISATEURS.filter((u) => !estCertifie(u));
  const nbAutres = 6 + Math.floor(random() * 7);
  const auteurs = [certifies[Math.floor(random() * certifies.length)], ...melanger(autres, random).slice(0, nbAutres)];
  const titres = melanger(TITRES_DOCUMENTS, random);

  return auteurs.map((auteur, i) => {
    const nbNotes = 4 + Math.floor(random() * 150);
    // Les autrices certifiées ont de très bonnes moyennes (4,3 à 4,9), les autres de 2,6 à 4,8
    const moyenne = estCertifie(auteur) ? 4.3 + random() * 0.6 : 2.6 + random() * 2.2;
    // Le PDF est l'un des faux PDF de démonstration, toujours le même pour un résumé donné
    const pdf = FAUX_PDF[hashTexte(`${key}/${titres[i]}`) % FAUX_PDF.length];
    return { titre: titres[i], auteur, nbNotes, somme: moyenne * nbNotes, note: null, faculte: key.split("/")[0], pdf };
  });
}

const PERSON_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';

// Photo de profil si l'utilisateur en a une, sinon l'icône par défaut
function avatarContenu(pfp, pseudo) {
  if (pfp) {
    const img = document.createElement("img");
    img.src = `images/pfp/${pfp}.png`;
    img.alt = `Photo de profil de ${pseudo}`;
    return img;
  }
  const tpl = document.createElement("template");
  tpl.innerHTML = PERSON_SVG;
  return tpl.content.firstElementChild;
}

// Niveaux 1 à 4 : selon l'XP. Chaque note reçue rapporte XP_PAR_ETOILE XP par étoile
// (½ étoile = 1 XP, 5 étoiles = 10 XP).
const XP_PAR_ETOILE = 2;
const NIVEAUX = [
  { n: 1, nom: "Débutant",     xp: 0 },
  { n: 2, nom: "Contributeur", xp: 150 },
  { n: 3, nom: "Confirmé",     xp: 400 },
  { n: 4, nom: "Expert",       xp: 1000 },
];

// « Certifié » ne dépend pas de l'XP mais de la qualité : il faut assez de notes reçues
// ET moins de 15 % de notes sous 4 étoiles. Il signale aux autres étudiants que les
// résumés de l'auteur sont de bonne qualité, et il est volontairement difficile à obtenir.
const CERTIFICATION = { notesMin: 100, noteBasse: 4, partBasseMax: 0.15 };

function estCertifie(utilisateur) {
  return utilisateur.notes >= CERTIFICATION.notesMin
    && utilisateur.basses / utilisateur.notes < CERTIFICATION.partBasseMax;
}

function niveauPour(xp) {
  return [...NIVEAUX].reverse().find((niv) => xp >= niv.xp);
}

// Badge « Certifié » si l'utilisateur l'est, sinon le nom de son niveau
function createLevelBadge(utilisateur, small = false) {
  const badge = document.createElement("span");
  badge.className = "level-badge" + (small ? " level-badge--sm" : "");
  if (estCertifie(utilisateur)) {
    badge.classList.add("level-badge--certifie");
    badge.title = "Certifié : résumés très bien notés";
    badge.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    badge.append("Certifié");
  } else {
    const niv = niveauPour(utilisateur.xp);
    badge.classList.add(`level-badge--${niv.n}`);
    badge.title = `Niveau ${niv.n} · ${niv.nom}`;
    badge.append(niv.nom);
  }
  return badge;
}

// Note affichée avec une décimale, à la française : « 4,3 »
function formatNote(note) {
  return note.toLocaleString("fr-CH", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

const STAR_PATH = "M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z";

// Une étoile : le contour gris, et par-dessus l'étoile jaune découpée à `remplissage` %
function etoileHTML(remplissage) {
  return `<svg class="star__shape" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_PATH}"/></svg>
    <svg class="star__shape star__fill" viewBox="0 0 24 24" aria-hidden="true" style="--fill:${remplissage}%"><path d="${STAR_PATH}"/></svg>`;
}

function remplissageEtoile(note, i) {
  if (note >= i) return 100;
  if (note >= i - 0.5) return 50;
  return 0;
}

// Notes par matière : { "droit/3/1": [...] }, pour que mes notes gardent leur état
const documentsParMatiere = {};

// Moyenne et nombre de notes, en comptant la mienne si j'ai noté
function nbNotesDoc(doc) {
  return doc.nbNotes + (doc.note === null ? 0 : 1);
}

function moyenneDoc(doc) {
  return (doc.somme + (doc.note ?? 0)) / nbNotesDoc(doc);
}

// Pagination : DOCS_PAR_PAGE documents par page, pour éviter de devoir défiler.
// La page affichée est retenue par liste tant qu'on reste sur le site.
const DOCS_PAR_PAGE = 5;
const pageParListe = {};

// La même liste de documents (page de livre, flèches) sert à deux endroits :
// les documents d'une matière (Accueil) et ceux d'une catégorie de favoris.
const LISTES = {
  matiere: {
    list: "doc-list", pager: "doc-pager", info: "doc-pager-info", prev: "doc-pager-prev",
    next: "doc-pager-next", page: "book-page", bg: "book-page-bg", titre: "documents-titre",
  },
  favoris: {
    list: "fav-doc-list", pager: "fav-doc-pager", info: "fav-doc-pager-info", prev: "fav-doc-pager-prev",
    next: "fav-doc-pager-next", page: "fav-book-page", bg: "fav-book-page-bg", titre: "favoris-cat-titre",
  },
};

function renderDocuments(key) {
  const docs = (documentsParMatiere[key] ??= genererDocuments(key));
  // Les auteurs certifiés passent avant tout le monde, puis on trie par note moyenne
  docs.sort((a, b) => estCertifie(b.auteur) - estCertifie(a.auteur) || moyenneDoc(b) - moyenneDoc(a));
  renderListe("matiere", key, docs, COULEUR_DE_FACULTE[key.split("/")[0]], () => renderDocuments(key));
}

// Affiche une page de `docs` dans la liste `vue` ; `rerender` redessine la vue entière
// (après une note, un favori ajouté ou retiré, un changement de page).
function renderListe(vue, key, docs, couleur, rerender) {
  const ids = LISTES[vue];
  const list = document.getElementById(ids.list);
  list.replaceChildren();

  const pageKey = `${vue}:${key}`;
  const nbPages = Math.max(1, Math.ceil(docs.length / DOCS_PAR_PAGE));
  const page = Math.min(pageParListe[pageKey] ?? 0, nbPages - 1);
  pageParListe[pageKey] = page;
  renderPager(vue, pageKey, page, nbPages, rerender);
  renderBookPage(vue, couleur, page);

  docs.slice(page * DOCS_PAR_PAGE, (page + 1) * DOCS_PAR_PAGE).forEach((doc) => {
    list.appendChild(creerLigneDocument(doc, rerender));
  });
}

const BOOKMARK_PATH = "M6 3h12v18l-6-4.5L6 21z";

function creerLigneDocument(doc, rerender) {
  const item = document.createElement("li");
  item.className = "doc";
  item.innerHTML = `
    <button class="doc__title" type="button">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l5 5v15H6z"/><path d="M14 2v5h5M9 13h7M9 17h7"/></svg>
      <span class="doc__title-texte"></span>
    </button>
    <span class="doc__author">
      <span class="doc__avatar"></span>
      <span class="doc__pseudo"></span>
    </span>
    <span class="rating">
      <span class="rating__avg"></span>
      <span class="stars" role="group"></span>
      <span class="rating__count"></span>
    </span>
    <button class="doc__fav" type="button">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${BOOKMARK_PATH}"/></svg>
      <span class="doc__fav-label"></span>
    </button>`;

  // Signet : plein si le document est en favori (on le retire d'un clic),
  // vide sinon (un clic ouvre le choix de la catégorie).
  const fav = item.querySelector(".doc__fav");
  const enFavori = doc.categorie != null;
  fav.classList.toggle("doc__fav--on", enFavori);
  fav.setAttribute("aria-pressed", enFavori);
  fav.querySelector(".doc__fav-label").textContent = enFavori ? doc.categorie.nom : "Favori";
  fav.title = enFavori ? `Dans « ${doc.categorie.nom} » : cliquer pour retirer des favoris` : "Ajouter aux favoris";
  if (enFavori) fav.style.setProperty("--fav-color", COULEURS[doc.categorie.couleur].hex);
  fav.addEventListener("click", () => {
    if (doc.categorie) {
      retirerFavori(doc);
      rerender();
    } else {
      ouvrirDialogFavori(doc, rerender);
    }
  });
  item.classList.toggle("doc--certifie", estCertifie(doc.auteur));
  const lire = item.querySelector(".doc__title");
  lire.querySelector(".doc__title-texte").textContent = doc.titre;
  lire.title = "Lire le résumé";
  lire.addEventListener("click", () => ouvrirLecteur(doc));
  item.querySelector(".doc__avatar").append(avatarContenu(doc.auteur.pfp, doc.auteur.pseudo));
  item.querySelector(".doc__pseudo").textContent = doc.auteur.pseudo;
  item.querySelector(".doc__author").append(createLevelBadge(doc.auteur, true));

  // À gauche la moyenne, à droite le nombre de notes
  const avg = item.querySelector(".rating__avg");
  avg.textContent = formatNote(moyenneDoc(doc));
  avg.title = "Note moyenne";
  const count = item.querySelector(".rating__count");
  const n = nbNotesDoc(doc);
  count.textContent = `(${n})`;
  count.title = `${n} note${n > 1 ? "s" : ""}`;

  item.querySelector(".stars").replaceWith(creerEtoiles(doc, rerender));
  return item;
}

// Les 5 étoiles de MA note sur un résumé (dans la liste, le lecteur et le rappel) :
// vides tant que je n'ai pas noté.
// Un clic sur une étoile donne cette note ; un 2e clic sur la même donne une demi-étoile de moins.
// Sur la 1re étoile : 1 → 0,5 → plus de note (3e clic : on retire sa note).
function creerEtoiles(doc, apres) {
  const stars = document.createElement("span");
  stars.className = "stars";
  stars.setAttribute("role", "group");
  stars.setAttribute("aria-label",
    doc.note === null ? "Noter ce résumé" : `Ta note : ${formatNote(doc.note)} sur 5`);
  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "star";
    btn.setAttribute("aria-label", i === 1 && doc.note === 0.5
      ? "Retirer ma note"
      : `${i} étoile${i > 1 ? "s" : ""} (re-cliquer : ${formatNote(i - 0.5)})`);
    btn.innerHTML = etoileHTML(remplissageEtoile(doc.note ?? 0, i));
    btn.addEventListener("click", () => {
      if (doc.note === i) {
        doc.note = i - 0.5; // la note minimale est 0,5
      } else if (i === 1 && doc.note === 0.5) {
        doc.note = null;    // 3e clic sur la 1re étoile : on retire sa note
      } else {
        doc.note = i;
      }
      if (doc.note !== null) oublierRappel(doc);
      apres();
    });
    stars.appendChild(btn);
  }
  return stars;
}

// Fond de la liste : une page de livre de la couleur de la faculté.
// Les images sont des pages de gauche, de la plus fine (1) à la plus épaisse (4).
// Une page sur deux est retournée en miroir (page de droite), pour donner l'impression
// de feuilleter : la pile de gauche s'épaissit (1, 2, 3, 4) pendant que celle de
// droite s'amincit (4, 3, 2, 1) : 1 → 4 miroir → 2 → 3 miroir → 3 → 2 miroir → 4 → 1 miroir…
function fondDePage(couleur, page) {
  const miroir = page % 2 === 1;
  const epaisseur = miroir
    ? Math.max(4 - (page - 1) / 2, 1)
    : Math.min(1 + page / 2, 4);
  return { miroir, src: `images/assets/03_pagepdf/pages/${couleur}/page-livre-${couleur}-${epaisseur}.webp` };
}

function renderBookPage(vue, couleur, page) {
  const { miroir, src } = fondDePage(couleur, page);
  document.getElementById(LISTES[vue].page).classList.toggle("book-page--miroir", miroir);
  document.getElementById(LISTES[vue].bg).style.backgroundImage = `url("${src}")`;
}

// Flèches ← / → et « Page 1 / 3 » sous la liste ; masqué s'il n'y a qu'une page
function renderPager(vue, pageKey, page, nbPages, rerender) {
  const ids = LISTES[vue];
  document.getElementById(ids.pager).classList.toggle("hidden", nbPages <= 1);
  document.getElementById(ids.info).textContent = `Page ${page + 1} / ${nbPages}`;

  const prev = document.getElementById(ids.prev);
  const next = document.getElementById(ids.next);
  prev.disabled = page === 0;
  next.disabled = page >= nbPages - 1;
  prev.onclick = () => changerPage(vue, pageKey, page - 1, rerender);
  next.onclick = () => changerPage(vue, pageKey, page + 1, rerender);
}

function changerPage(vue, pageKey, page, rerender) {
  const avance = page > (pageParListe[pageKey] ?? 0);
  pageParListe[pageKey] = page;
  rerender();

  // Petite animation de page qu'on tourne, dans le sens de la navigation
  const bookPage = document.getElementById(LISTES[vue].page);
  bookPage.classList.remove("book-page--tourne-avant", "book-page--tourne-arriere");
  void bookPage.offsetWidth; // relance l'animation
  bookPage.classList.add(avance ? "book-page--tourne-avant" : "book-page--tourne-arriere");
  document.getElementById(LISTES[vue].titre).scrollIntoView({ block: "nearest" });
}

// ---------- Lecture d'un résumé ----------
// Un clic sur le titre ouvre le PDF dans le lecteur (sans téléchargement).
// 10 minutes après l'ouverture, une notification invite à noter le résumé,
// même si le lecteur a été fermé entre-temps. Une fois le résumé noté
// (dans la liste, le lecteur ou la notification), plus jamais de notification pour lui.
const RAPPEL_NOTE_MS = 10 * 60 * 1000;
const minuteursRappel = new Map(); // doc → minuteur en cours
const rappelsEnAttente = [];       // notifications arrivées pendant qu'une autre est affichée
let docLu = null;      // résumé ouvert dans le lecteur
let docRappele = null; // résumé de la notification affichée

// Après une note : on redessine la vue en cours, le lecteur et la notification
function rafraichirNotes() {
  route();
  if (docLu) document.getElementById("lecteur-etoiles").replaceChildren(creerEtoiles(docLu, rafraichirNotes));
  if (docRappele) document.getElementById("rappel-etoiles").replaceChildren(creerEtoiles(docRappele, rafraichirNotes));
}

// Le lecteur couvre tout l'écran à droite du menu. Les pages du PDF sont dessinées
// par PDF.js dans des <canvas> : pas de barre d'outils, donc ni téléchargement ni impression.
let scrollAvantLecture = 0;
let lectureNo = 0; // numéro de la dernière ouverture (un rendu en retard est abandonné)

function ouvrirLecteur(doc) {
  docLu = doc;
  const lecteur = document.getElementById("lecteur");
  lecteur.style.setProperty("--fac-color", FACULTES.find((f) => f.id === doc.faculte).color);
  document.getElementById("lecteur-titre").textContent = doc.titre;
  const auteur = document.getElementById("lecteur-auteur");
  auteur.replaceChildren(`par ${doc.auteur.pseudo}`, createLevelBadge(doc.auteur, true));
  document.getElementById("lecteur-etoiles").replaceChildren(creerEtoiles(doc, rafraichirNotes));

  // La page derrière ne défile plus, et revient en haut pour que le menu reste visible
  if (lecteur.classList.contains("hidden")) scrollAvantLecture = window.scrollY;
  window.scrollTo(0, 0);
  document.documentElement.classList.add("en-lecture");
  lecteur.classList.remove("hidden");
  document.getElementById("lecteur-fermer").focus();

  dessinerPdf(doc.pdf);
  programmerRappel(doc);
}

function fermerLecteur() {
  if (!docLu) return;
  docLu = null;
  lectureNo++;
  document.getElementById("lecteur").classList.add("hidden");
  document.getElementById("lecteur-pages").replaceChildren();
  document.documentElement.classList.remove("en-lecture");
  window.scrollTo(0, scrollAvantLecture);
}

async function dessinerPdf(url) {
  const no = ++lectureNo;
  const pages = document.getElementById("lecteur-pages");
  pages.replaceChildren();
  pages.scrollTop = 0;
  const message = (texte) => {
    const p = document.createElement("p");
    p.className = "lecteur__message";
    p.textContent = texte;
    pages.replaceChildren(p);
  };
  message("Chargement du résumé…");

  if (!window.pdfjsLib) {
    message("Le lecteur n'a pas pu se charger (connexion internet nécessaire).");
    return;
  }
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  try {
    // Le PDF intégré (js/faux-pdf.js) si on l'a : il marche aussi quand le site est ouvert
    // depuis le disque, où le navigateur refuse de charger le fichier par son adresse
    const base64 = typeof FAUX_PDF_DONNEES === "undefined" ? null : FAUX_PDF_DONNEES[url];
    const source = base64 ? { data: Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)) } : url;
    const pdf = await pdfjsLib.getDocument(source).promise;
    if (no !== lectureNo) return;
    pages.replaceChildren();
    // Largeur des pages : celle de la zone de lecture (900 px au plus), en haute définition
    const largeur = Math.min(pages.clientWidth - 48, 900);
    const ratio = window.devicePixelRatio || 1;
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      if (no !== lectureNo) return;
      const echelle = largeur / page.getViewport({ scale: 1 }).width;
      const vue = page.getViewport({ scale: echelle * ratio });
      const canvas = document.createElement("canvas");
      canvas.className = "lecteur__page";
      canvas.width = vue.width;
      canvas.height = vue.height;
      canvas.style.width = `${largeur}px`;
      canvas.setAttribute("aria-label", `Page ${n} sur ${pdf.numPages}`);
      pages.appendChild(canvas);
      await page.render({ canvasContext: canvas.getContext("2d"), viewport: vue }).promise;
    }
  } catch {
    if (no === lectureNo) message("Impossible d'ouvrir ce résumé.");
  }
}

function programmerRappel(doc) {
  if (doc.dejaNote || minuteursRappel.has(doc)) return;
  minuteursRappel.set(doc, setTimeout(() => {
    minuteursRappel.delete(doc);
    if (doc.dejaNote) return;
    rappelsEnAttente.push(doc);
    if (!docRappele) afficherRappelSuivant();
  }, RAPPEL_NOTE_MS));
}

// Le résumé vient d'être noté : on annule tout ce qui le concerne, pour toujours
function oublierRappel(doc) {
  doc.dejaNote = true;
  clearTimeout(minuteursRappel.get(doc));
  minuteursRappel.delete(doc);
  if (rappelsEnAttente.includes(doc)) rappelsEnAttente.splice(rappelsEnAttente.indexOf(doc), 1);
  if (docRappele === doc) afficherRappelSuivant();
}

function afficherRappelSuivant() {
  const rappel = document.getElementById("rappel");
  docRappele = rappelsEnAttente.shift() ?? null;
  rappel.classList.toggle("hidden", !docRappele);
  if (!docRappele) return;
  rappel.style.setProperty("--fac-color", FACULTES.find((f) => f.id === docRappele.faculte).color);
  document.getElementById("rappel-doc").textContent = `« ${docRappele.titre} » de ${docRappele.auteur.pseudo}`;
  document.getElementById("rappel-etoiles").replaceChildren(creerEtoiles(docRappele, rafraichirNotes));
  placerRappel();
}

// Une fenêtre modale (favoris…) rend le reste de la page inactif :
// la notification se place dans la fenêtre ouverte, pour rester cliquable.
function placerRappel() {
  const rappel = document.getElementById("rappel");
  const parent = [...document.querySelectorAll("dialog:modal")].pop() ?? document.body;
  if (rappel.parentElement !== parent) parent.appendChild(rappel);
}

function initLecteur() {
  document.getElementById("lecteur-fermer").addEventListener("click", fermerLecteur);
  // Un clic dans le menu (même sur l'onglet en cours) ou un changement de page ferme le lecteur
  document.querySelectorAll(".nav__item").forEach((item) => item.addEventListener("click", fermerLecteur));
  window.addEventListener("hashchange", fermerLecteur);

  // Lecture seule : pas de clic droit sur les pages, ni Ctrl+S / Ctrl+P pendant la lecture
  // (l'impression du site masque aussi le lecteur, voir @media print)
  document.getElementById("lecteur-pages").addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", (e) => {
    if (!docLu) return;
    if (e.key === "Escape") fermerLecteur();
    if ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase())) e.preventDefault();
  }, true);
  // Une fenêtre se ferme : la notification qu'elle contenait revient dans la page
  document.addEventListener("close", placerRappel, true);
  document.getElementById("rappel-fermer").addEventListener("click", afficherRappelSuivant);
}

// ---------- Favoris ----------
// Un résumé en favori est TOUJOURS rangé dans une catégorie (nom + couleur, parmi les 8 couleurs).
// `doc.categorie` pointe vers sa catégorie (ou null) ; `categorie.docs` liste ses résumés.
// Rien n'est sauvegardé : au rechargement, on revient aux catégories de démonstration.
const FAVORIS = { categories: [], prochainId: 1 };

function creerCategorie(nom, couleur) {
  const categorie = { id: FAVORIS.prochainId++, nom, couleur, docs: [] };
  FAVORIS.categories.push(categorie);
  return categorie;
}

function ajouterFavori(doc, categorie) {
  categorie.docs.push(doc);
  doc.categorie = categorie;
  renderProfil();
}

function retirerFavori(doc) {
  const docs = doc.categorie.docs;
  docs.splice(docs.indexOf(doc), 1);
  doc.categorie = null;
  renderProfil();
}

function nbFavoris() {
  return FAVORIS.categories.reduce((total, c) => total + c.docs.length, 0);
}

// Quelques favoris de démonstration, pris dans les listes de documents fictives
function initFavorisDemo() {
  const docsDe = (key) => (documentsParMatiere[key] ??= genererDocuments(key));
  const examens = creerCategorie("Examens de janvier", "bleu");
  const relire = creerCategorie("À relire", "vert");
  const triche = creerCategorie("Fiches de triche", "rouge");
  docsDe("eco/2/0").slice(0, 3).forEach((d) => ajouterFavori(d, examens));
  docsDe("droit/1/2").slice(0, 2).forEach((d) => ajouterFavori(d, examens));
  docsDe("lettres/3/1").slice(1, 4).forEach((d) => ajouterFavori(d, relire));
  docsDe("science/5/4").slice(0, 1).forEach((d) => ajouterFavori(d, triche));
}

// Fenêtre « Ajouter aux favoris » : choisir une catégorie existante ou en créer une.
// Appelée sans document (doc = null), elle sert seulement à créer une catégorie ;
// avec `categorie`, elle sert à modifier son nom et sa couleur.
let favoriEnCours = null; // { doc, apres, categorie }

function ouvrirDialogFavori(doc, apres, categorie = null) {
  favoriEnCours = { doc, apres, categorie };
  const dialog = document.getElementById("fav-dialog");
  const liste = document.getElementById("fav-categories");
  const creationSeule = doc === null;
  const sansDocument = creationSeule || !!categorie;

  document.getElementById("fav-dialog-titre").textContent =
    categorie ? "Modifier la catégorie" : creationSeule ? "Nouvelle catégorie" : "Ajouter aux favoris";
  document.getElementById("fav-dialog-doc").textContent = sansDocument ? "" : `« ${doc.titre} » — ${doc.auteur.pseudo}`;
  document.getElementById("fav-dialog-doc").classList.toggle("hidden", sansDocument);
  document.getElementById("fav-choix").classList.toggle("hidden", sansDocument);
  document.getElementById("fav-submit").textContent = categorie ? "Enregistrer" : creationSeule ? "Créer" : "Ajouter";
  document.getElementById("fav-new-nom").value = categorie?.nom ?? "";
  document.querySelector(`input[name="fav-couleur"][value="${categorie?.couleur ?? "bleu"}"]`).checked = true;
  document.getElementById("fav-error").classList.add("hidden");

  // Catégories existantes + « Nouvelle catégorie » ; la première existante est présélectionnée
  liste.replaceChildren();
  const options = [
    ...FAVORIS.categories.map((c) => ({ value: String(c.id), nom: c.nom, couleur: c.couleur, n: c.docs.length })),
    { value: "new", nom: "Nouvelle catégorie…" },
  ];
  options.forEach((o, i) => {
    const label = document.createElement("label");
    label.className = "fav-option";
    label.innerHTML = `<input type="radio" name="fav-cat" value="${o.value}">
      <span class="fav-option__dot"></span><span class="fav-option__nom"></span><span class="fav-option__n"></span>`;
    label.querySelector(".fav-option__nom").textContent = o.nom;
    if (o.couleur) {
      label.querySelector(".fav-option__dot").style.background = COULEURS[o.couleur].hex;
      label.querySelector(".fav-option__n").textContent = `${o.n} résumé${o.n > 1 ? "s" : ""}`;
    } else {
      label.querySelector(".fav-option__dot").classList.add("fav-option__dot--plus");
    }
    label.querySelector("input").checked = creationSeule ? o.value === "new" : i === 0;
    liste.appendChild(label);
  });
  majChoixFavori();
  dialog.showModal();
}

// Les champs « nom / couleur » ne s'affichent que pour une nouvelle catégorie ou une modification
function majChoixFavori() {
  const choix = document.querySelector('input[name="fav-cat"]:checked')?.value;
  document.getElementById("fav-new").classList.toggle("hidden", choix !== "new" && !favoriEnCours?.categorie);
}

function initFavoris() {
  const dialog = document.getElementById("fav-dialog");
  const form = document.getElementById("fav-form");
  const erreur = document.getElementById("fav-error");

  document.getElementById("fav-categories").addEventListener("change", majChoixFavori);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (e.submitter?.value !== "ok") {
      dialog.close();
      return;
    }
    const choix = document.querySelector('input[name="fav-cat"]:checked')?.value;
    const aModifier = favoriEnCours.categorie;
    let categorie;
    if (choix === "new" || aModifier) {
      const nom = document.getElementById("fav-new-nom").value.trim();
      const couleur = document.querySelector('input[name="fav-couleur"]:checked').value;
      if (!nom) {
        erreur.textContent = "Donne un nom à la catégorie.";
        erreur.classList.remove("hidden");
        return;
      }
      if (FAVORIS.categories.some((c) => c !== aModifier && normaliser(c.nom) === normaliser(nom))) {
        erreur.textContent = "Une catégorie porte déjà ce nom.";
        erreur.classList.remove("hidden");
        return;
      }
      if (aModifier) {
        aModifier.nom = nom;
        aModifier.couleur = couleur;
        dialog.close();
        favoriEnCours.apres?.();
        return;
      }
      categorie = creerCategorie(nom, couleur);
    } else {
      categorie = FAVORIS.categories.find((c) => String(c.id) === choix);
    }
    if (favoriEnCours.doc) ajouterFavori(favoriEnCours.doc, categorie);
    dialog.close();
    favoriEnCours.apres?.();
  });

  document.getElementById("fav-new-cat-btn").addEventListener("click", () => {
    ouvrirDialogFavori(null, () => showFavoris());
  });

  // Depuis une catégorie ouverte (#favoris/<id>) : modifier son nom et sa couleur
  document.getElementById("fav-edit-cat-btn").addEventListener("click", () => {
    const id = location.hash.split("/")[1];
    const categorie = FAVORIS.categories.find((c) => String(c.id) === id);
    if (categorie) ouvrirDialogFavori(null, () => showFavoris(id), categorie);
  });

  // Mode décoration : ouvert depuis Personnalisation, fermé par « Terminer » ou en quittant la bibliothèque
  document.getElementById("deco-btn").addEventListener("click", entrerModeDeco);
  document.querySelectorAll(".deco-fin").forEach((btn) => btn.addEventListener("click", quitterModeDeco));
  window.addEventListener("hashchange", () => {
    if (location.hash !== hashDeco) quitterModeDeco();
  });

  initFavorisDemo();
}

// Bibliothèque des favoris : une rangée par catégorie, construite à partir de l'image
// de la bibliothèque (1680 × 1530 px, 5 compartiments d'environ 300 px) :
// - 1re rangée : le haut de l'image (cadre + 1er compartiment, y = 0 à 325) ;
// - rangées suivantes : le 2e compartiment répété (y = 325 à 625) ;
// - puis le bas du cadre (y = 1490 à 1530).
// Les livres viennent de la même image de livres, en alternant les compartiments 2 à 4
// (même hauteur, même position des livres) pour varier d'une rangée à l'autre.
const LIVRES_DECALAGES = ["26.42%", "50.81%", "75.2%"]; // compartiments 2, 3, 4

// Décorations : chaque étage (catégorie) montre ses livres ou une décoration.
// Une image par étage de la bibliothèque (la perspective change d'un étage à l'autre),
// 1632 × 278 px, centrée en largeur et posée sur la planche du compartiment.
// Les livres sont gratuits ; les autres décorations sont verrouillées et s'achètent avec des coins
// (une fois débloquée, une décoration sert pour tous les étages). Rien n'est sauvegardé.
const DOSSIER_DECOS = "images/assets/05_customisation/01_bilbliotheque_decos";
const DECOS = [
  { id: "livres", nom: "Livres", prix: 0 },
  { id: "rubik", nom: "Rubik's cube", prix: 50, image: (etage) => `${DOSSIER_DECOS}/rubiks cube/rubik-etage${etage}.webp` },
  // Trois bouquets, en alternance d'un étage à l'autre
  { id: "fleurs", nom: "Fleurs", prix: 50,
    image: (etage) => `${DOSSIER_DECOS}/fleurs/fleurs-${["tulipes", "tournesols", "champetre"][(etage - 1) % 3]}.webp` },
  // Une seule image, la même pour tous les étages
  { id: "grec", nom: "Statue grecque", prix: 100, image: () => `${DOSSIER_DECOS}/statue_grec/grec.webp` },
];
const decosDebloquees = new Set(["livres"]);
// Deux étagères se décorent : celle des favoris (un étage par catégorie : `categorie.deco`)
// et celle des matières (5 étages, les mêmes pour toutes les facultés : ETAGES_MATIERES).
// `modeDeco` : l'étagère en cours de décoration ("favoris" ou "matieres"), ou null.
const ETAGES_MATIERES = Array.from({ length: 5 }, () => ({ deco: "livres" }));
let modeDeco = null;
let hashDeco = "";
const apercuDeco = new Map(); // étage → décoration montrée en mode décoration (même verrouillée)

const CADENAS_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';

function decoAffichee(etage) {
  const id = (modeDeco && apercuDeco.get(etage)) || etage.deco || "livres";
  return DECOS.find((d) => d.id === id);
}

function changerDeco(etage, sens) {
  const i = DECOS.indexOf(decoAffichee(etage));
  const deco = DECOS[(i + sens + DECOS.length) % DECOS.length];
  apercuDeco.set(etage, deco.id);
  if (decosDebloquees.has(deco.id)) etage.deco = deco.id;
  afficherErreurDeco("");
  route();
}

function debloquerDeco(deco, etage) {
  if (!coinsIllimites && PROFIL.coins < deco.prix) {
    const manque = deco.prix - PROFIL.coins;
    afficherErreurDeco(`Il te manque ${manque} coin${manque > 1 ? "s" : ""} pour débloquer « ${deco.nom} ».`);
    return;
  }
  if (!coinsIllimites) PROFIL.coins -= deco.prix;
  decosDebloquees.add(deco.id);
  etage.deco = deco.id;
  // Les autres étages qui montraient déjà cette décoration en aperçu la gardent
  apercuDeco.forEach((id, autre) => {
    if (id === deco.id) autre.deco = id;
  });
  afficherErreurDeco("");
  renderCoins();
  route();
}

function afficherErreurDeco(message) {
  document.querySelectorAll(".deco-erreur").forEach((erreur) => {
    erreur.textContent = message;
    erreur.classList.toggle("hidden", !message);
  });
}

// Bandeau « Décoration de la bibliothèque » de l'étagère `etagere`, visible en mode décoration
function majBandeauDeco(etagere) {
  document.querySelector(`.deco-bandeau[data-etagere="${etagere}"]`).classList.toggle("hidden", modeDeco !== etagere);
}

// Le bouton « Décorer » de la fenêtre Personnalisation décore l'étagère de l'onglet d'où elle a été ouverte
function entrerModeDeco() {
  modeDeco = persoOnglet === "matieres" ? "matieres" : "favoris";
  hashDeco = modeDeco === "favoris" ? "#favoris" : location.hash;
  apercuDeco.clear();
  afficherErreurDeco("");
  document.getElementById("perso-dialog").close();
  if (location.hash === hashDeco) route(); else location.hash = hashDeco;
}

// En sortant, une décoration verrouillée restée en aperçu est oubliée
function quitterModeDeco() {
  if (!modeDeco) return;
  modeDeco = null;
  apercuDeco.clear();
  route();
}

// Pendant la décoration : le cadenas (prix) remplace la plaque d'un étage dont la décoration est verrouillée
function creerCadenas(deco, etage) {
  const cadenas = document.createElement("button");
  cadenas.type = "button";
  cadenas.className = "deco-cadenas";
  cadenas.innerHTML = `${CADENAS_SVG}<span class="coin" aria-hidden="true">R</span><span>${deco.prix}</span>`;
  cadenas.title = `Débloquer « ${deco.nom} » pour ${deco.prix} coins`;
  cadenas.setAttribute("aria-label", cadenas.title);
  cadenas.addEventListener("click", () => debloquerDeco(deco, etage));
  return cadenas;
}

// … et une flèche de chaque côté de l'étage passe à la décoration précédente / suivante
function ajouterFleches(row, etage, nom) {
  [[-1, "gauche", "Décoration précédente", "M15 5l-7 7 7 7"], [1, "droite", "Décoration suivante", "M9 5l7 7-7 7"]]
    .forEach(([sens, cote, texte, chemin]) => {
      const fleche = document.createElement("button");
      fleche.type = "button";
      fleche.className = `deco-fleche deco-fleche--${cote}`;
      fleche.setAttribute("aria-label", `${texte} pour « ${nom} »`);
      fleche.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${chemin}"/></svg>`;
      fleche.addEventListener("click", () => changerDeco(etage, sens));
      row.appendChild(fleche);
    });
}

function renderFavShelf() {
  const shelf = document.getElementById("fav-shelf");
  shelf.replaceChildren();
  const enDeco = modeDeco === "favoris";
  document.getElementById("favoris-etagere-vue").classList.toggle("favoris--deco", enDeco);
  majBandeauDeco("favoris");

  FAVORIS.categories.forEach((categorie, i) => {
    const row = document.createElement("div");
    row.className = "fav-shelf__row" + (i === 0 ? " fav-shelf__row--first" : "");
    row.style.setProperty("--fac-color", COULEURS[categorie.couleur].hex);

    // Étage de la bibliothèque dont la rangée reprend l'image : 1, puis 2, 3, 4, 2, 3, 4…
    const etage = i === 0 ? 1 : 2 + (i - 1) % LIVRES_DECALAGES.length;
    const deco = decoAffichee(categorie);
    const verrouillee = !decosDebloquees.has(deco.id);
    row.classList.toggle("deco--verrouille", verrouillee);

    let contenu;
    if (deco.image) {
      contenu = document.createElement("img");
      contenu.className = "fav-shelf__deco";
      contenu.src = encodeURI(deco.image(etage));
      contenu.alt = "";
    } else {
      contenu = document.createElement("div");
      contenu.className = "fav-shelf__books";
      contenu.style.backgroundImage = `url("${COULEURS[categorie.couleur].livres}")`;
      if (i > 0) contenu.style.backgroundPositionY = LIVRES_DECALAGES[etage - 2];
    }

    const n = categorie.docs.length;
    let label;
    if (enDeco && verrouillee) {
      label = creerCadenas(deco, categorie);
    } else {
      // En mode décoration, la plaque n'ouvre pas la catégorie
      label = document.createElement(enDeco ? "span" : "a");
      label.className = "shelf__label";
      if (!enDeco) label.href = `#favoris/${categorie.id}`;
      label.innerHTML = `<span class="fav-shelf__nom"></span> <span class="fav-shelf__n">(${n})</span>`;
      label.querySelector(".fav-shelf__nom").textContent = categorie.nom;
      label.title = enDeco ? deco.nom : `${n} résumé${n > 1 ? "s" : ""}`;
    }

    row.append(contenu, label);
    if (enDeco) ajouterFleches(row, categorie, categorie.nom);
    shelf.appendChild(row);
  });

  if (FAVORIS.categories.length) {
    const bas = document.createElement("div");
    bas.className = "fav-shelf__bottom";
    shelf.appendChild(bas);
  }
  document.getElementById("favoris-vide").classList.toggle("hidden", FAVORIS.categories.length > 0);
}

// Onglet Favoris : la bibliothèque (#favoris) ou une catégorie ouverte (#favoris/<id>)
function showFavoris(categorieId) {
  const categorie = FAVORIS.categories.find((c) => String(c.id) === categorieId);
  document.getElementById("favoris-etagere-vue").classList.toggle("hidden", !!categorie);
  document.getElementById("favoris-cat-vue").classList.toggle("hidden", !categorie);

  if (!categorie) {
    renderFavShelf();
    return;
  }

  const vue = document.getElementById("favoris-cat-vue");
  const n = categorie.docs.length;
  vue.style.setProperty("--fac-color", COULEURS[categorie.couleur].hex);
  document.getElementById("favoris-cat-titre").textContent = categorie.nom;
  document.getElementById("favoris-cat-sous-titre").textContent =
    `${n} résumé${n > 1 ? "s" : ""} en favori · clique sur le signet d'un résumé pour le retirer`;
  document.getElementById("fav-book-page").classList.toggle("hidden", n === 0);
  document.getElementById("favoris-cat-vide").classList.toggle("hidden", n > 0);
  renderListe("favoris", `cat${categorie.id}`, categorie.docs, categorie.couleur, () => showFavoris(categorieId));
}

// Accueil : la carte, les semestres d'une faculté (#accueil/<id>),
// les matières d'un semestre (#accueil/<id>/<n>)
// ou les documents d'une matière (#accueil/<id>/<n>/<index de la matière>)
function showAccueil(faculteId, semestre, matiere) {
  const faculte = FACULTES.find((f) => f.id === faculteId);
  const numero = Number(semestre);
  const indexMatiere = matiere === undefined || matiere === "" ? NaN : Number(matiere);
  const semestreValide = !!faculte && numero >= 1 && numero <= 6;
  const showDocuments = semestreValide && Number.isInteger(indexMatiere) && MATIERES[indexMatiere] !== undefined;
  const showMatieres = semestreValide && !showDocuments;
  const semestres = document.getElementById("accueil-semestres");
  const matieres = document.getElementById("accueil-matieres");
  const documents = document.getElementById("accueil-documents");

  document.getElementById("campus-map").classList.toggle("hidden", !!faculte);
  semestres.classList.toggle("hidden", !faculte || semestreValide);
  matieres.classList.toggle("hidden", !showMatieres);
  documents.classList.toggle("hidden", !showDocuments);
  if (!faculte) return;

  const suffixe = numero === 1 ? "er" : "e";

  if (showDocuments) {
    documents.style.setProperty("--fac-color", faculte.color);
    document.getElementById("documents-retour").href = `#accueil/${faculte.id}/${numero}`;
    document.getElementById("documents-titre").textContent = MATIERES[indexMatiere];
    document.getElementById("documents-sous-titre").textContent =
      `${faculte.nom} – ${numero}${suffixe} semestre · auteurs certifiés en premier, puis par note moyenne`;
    renderDocuments(`${faculte.id}/${numero}/${indexMatiere}`);
    return;
  }

  if (showMatieres) {
    matieres.style.setProperty("--fac-color", faculte.color);
    document.getElementById("matieres-retour").href = "#accueil/" + faculte.id;
    document.getElementById("matieres-titre").textContent =
      `${faculte.nom} – ${numero}${suffixe} semestre`;
    renderShelf(faculte);
    return;
  }

  semestres.style.setProperty("--fac-color", faculte.color);
  const logo = document.getElementById("semestres-logo");
  logo.src = faculte.logo;
  logo.alt = "Logo " + faculte.nom;
  document.getElementById("semestres-nom").textContent = faculte.nom;

  const photo = document.getElementById("semestres-photo");
  photo.src = faculte.photo;
  photo.alt = `Bâtiment de la ${faculte.nom}`;
}

// Onglet Ajouter : dépôt d'un PDF + faculté / semestre / matière (choix prédéfinis) + titre.
// Interface seulement : rien n'est envoyé.
function initAjouter() {
  const form = document.getElementById("upload-form");
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("upload-file");
  const dropText = document.getElementById("dropzone-text");
  const dropHint = document.getElementById("dropzone-hint");
  const errorBox = document.getElementById("upload-error");
  const successBox = document.getElementById("upload-success");
  const selects = {
    faculte: document.getElementById("upload-faculte"),
    semestre: document.getElementById("upload-semestre"),
    matiere: document.getElementById("upload-matiere"),
  };
  const titre = document.getElementById("upload-titre");
  const compteur = document.getElementById("upload-titre-compteur");
  const submit = document.getElementById("upload-submit");
  let fichier = null;

  function majCompteur() {
    compteur.textContent = `${titre.value.length} / ${titre.maxLength}`;
  }

  function fillSelect(select, placeholder, options) {
    select.replaceChildren(new Option(placeholder, "", true, true));
    select.options[0].disabled = true;
    options.forEach(([value, label]) => select.add(new Option(label, value)));
  }

  fillSelect(selects.faculte, "Choisir une faculté", FACULTES.map((f) => [f.id, f.nom]));
  fillSelect(selects.semestre, "Choisir un semestre", [1, 2, 3, 4, 5, 6].map((n) => [n, `${n}${n === 1 ? "er" : "e"} semestre`]));
  fillSelect(selects.matiere, "Choisir une matière", MATIERES.map((nom, i) => [i, nom]));

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.toggle("hidden", !message);
  }

  function formatSize(octets) {
    return octets < 1024 * 1024
      ? Math.max(1, Math.round(octets / 1024)) + " Ko"
      : (octets / (1024 * 1024)).toFixed(1) + " Mo";
  }

  function updateSubmit() {
    submit.disabled = !(fichier && titre.value.trim() && Object.values(selects).every((s) => s.value !== ""));
  }

  function setFile(file) {
    successBox.classList.add("hidden");
    const isPdf = file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    if (!isPdf) {
      showError("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    showError("");
    fichier = file;
    dropzone.classList.add("dropzone--filled");
    dropText.textContent = file.name;
    dropHint.textContent = `${formatSize(file.size)} · clique ou glisse un autre PDF pour le remplacer`;
    updateSubmit();
  }

  function resetForm() {
    form.reset();
    majCompteur();
    fichier = null;
    dropzone.classList.remove("dropzone--filled");
    dropText.textContent = "Glisse ton PDF ici";
    dropHint.textContent = "ou clique pour ouvrir l'explorateur de fichiers";
    updateSubmit();
  }

  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) setFile(fileInput.files[0]);
  });

  ["dragenter", "dragover"].forEach((type) =>
    dropzone.addEventListener(type, (e) => {
      e.preventDefault();
      dropzone.classList.add("dropzone--over");
    })
  );
  ["dragleave", "drop"].forEach((type) =>
    dropzone.addEventListener(type, (e) => {
      e.preventDefault();
      dropzone.classList.remove("dropzone--over");
    })
  );
  dropzone.addEventListener("drop", (e) => {
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  });

  // Un fichier lâché à côté de la zone ne doit pas faire quitter la page
  ["dragover", "drop"].forEach((type) => window.addEventListener(type, (e) => e.preventDefault()));

  Object.values(selects).forEach((s) => s.addEventListener("change", updateSubmit));
  titre.addEventListener("input", () => {
    majCompteur();
    updateSubmit();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (submit.disabled) return;
    const nom = titre.value.trim();
    PROFIL.documents.unshift({
      titre: nom,
      faculte: selects.faculte.value,
      semestre: Number(selects.semestre.value),
      matiere: Number(selects.matiere.value),
      moyenne: null,
      nbNotes: 0,
    });
    renderProfil();
    resetForm();
    successBox.textContent = `« ${nom} » a été ajouté à ton profil (démo : le fichier n'est envoyé nulle part).`;
    successBox.classList.remove("hidden");
  });
}

// Onglet Café : la tasse se remplit avec l'XP. Pleine, elle donne un QR-code factice
// valable 10 minutes ; une fois scanné ou expiré, l'XP repart à zéro.
const XP_MAX = 1000;
const XP_DEPART = 422;
const RECOMPENSE_MS = 10 * 60 * 1000;
// Dans l'image cafe.webp (1040 px de haut), le café va de y = 344 à y = 827 :
// on le dévoile de bas en haut entre ces deux limites, en % de la hauteur de l'image.
const CAFE_HAUT = 33.1;
const CAFE_BAS = 79.6;

// QR-code factice : une grille aléatoire avec les 3 carrés de repère d'un vrai QR-code
function renderFakeQr(container, seed) {
  const N = 25;
  const random = creerAleatoire(seed);
  const finders = [[0, 0], [0, N - 7], [N - 7, 0]];
  const inFinderZone = (r, c) => finders.some(([fr, fc]) => r >= fr - 1 && r <= fr + 7 && c >= fc - 1 && c <= fc + 7);

  let rects = "";
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      let dark;
      const finder = finders.find(([fr, fc]) => r >= fr && r < fr + 7 && c >= fc && c < fc + 7);
      if (finder) {
        const y = r - finder[0], x = c - finder[1];
        dark = y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4);
      } else if (inFinderZone(r, c)) {
        dark = false;
      } else if (r === 6 || c === 6) {
        dark = (r + c) % 2 === 0; // lignes de synchronisation
      } else {
        dark = random() < 0.5;
      }
      if (dark) rects += `<rect x="${c + 2}" y="${r + 2}" width="1" height="1"/>`;
    }
  }
  container.innerHTML = `<svg viewBox="0 0 ${N + 4} ${N + 4}" role="img" aria-label="QR-code du café offert">
    <rect width="100%" height="100%" fill="#fff"/><g fill="#1d1d24">${rects}</g></svg>`;
}

function initCafe() {
  const cup = document.getElementById("cup");
  const liquid = document.getElementById("cup-liquid");
  const xpValue = document.getElementById("xp-value");
  const barFill = document.getElementById("xp-bar-fill");
  const hint = document.getElementById("cafe-hint");
  const message = document.getElementById("cafe-message");
  const adminDialog = document.getElementById("admin-dialog");
  const adminRange = document.getElementById("admin-xp-range");
  const adminNumber = document.getElementById("admin-xp");
  const confirmDialog = document.getElementById("confirm-dialog");
  const qrDialog = document.getElementById("qr-dialog");
  const qrTimer = document.getElementById("qr-timer");

  let xp = 0;
  let recompense = null; // { expireA, intervalle } tant que le QR-code est valable
  let compteurAnim = null;

  document.getElementById("xp-max").textContent = XP_MAX;

  // Le nombre d'XP défile jusqu'à sa nouvelle valeur, au rythme du remplissage de la tasse
  function animateCounter(from, to) {
    cancelAnimationFrame(compteurAnim);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 1000);
      xpValue.textContent = Math.round(from + (to - from) * t);
      if (t < 1) compteurAnim = requestAnimationFrame(step);
    };
    compteurAnim = requestAnimationFrame(step);
  }

  function setXp(valeur) {
    const avant = xp;
    xp = Math.min(XP_MAX, Math.max(0, Math.round(Number(valeur) || 0)));
    const ratio = xp / XP_MAX;
    const pleine = xp >= XP_MAX;

    const niveau = CAFE_BAS - (CAFE_BAS - CAFE_HAUT) * ratio;
    liquid.style.clipPath = `inset(${niveau}% 0 0 0)`;
    barFill.style.width = ratio * 100 + "%";
    cup.classList.toggle("cup--full", pleine);
    cup.disabled = !pleine && !recompense;
    animateCounter(avant, xp);

    if (recompense) {
      hint.textContent = "Ton QR-code est actif : clique sur la tasse pour l'afficher.";
      cup.setAttribute("aria-label", "Afficher le QR-code du café offert");
    } else if (pleine) {
      hint.textContent = "Ta tasse est pleine ! Clique dessus pour réclamer ton café.";
      cup.setAttribute("aria-label", "Réclamer le café offert");
    } else {
      //   : espace insécable, pour que « % » ne passe pas seul à la ligne
      hint.textContent = `Encore ${XP_MAX - xp} XP pour remplir ta tasse (${Math.floor(ratio * 100)} %).`;
      cup.setAttribute("aria-label", `Tasse remplie à ${Math.floor(ratio * 100)} %`);
    }
  }

  function showMessage(texte) {
    message.textContent = texte;
    message.classList.toggle("hidden", !texte);
  }

  function tick() {
    const reste = recompense.expireA - Date.now();
    if (reste <= 0) {
      endReward("Le QR-code a expiré : ta tasse repart de zéro.");
      return;
    }
    const secondes = Math.ceil(reste / 1000);
    qrTimer.textContent = `${Math.floor(secondes / 60)}:${String(secondes % 60).padStart(2, "0")}`;
  }

  function startReward() {
    const seed = Math.floor(Math.random() * 2 ** 31);
    renderFakeQr(document.getElementById("qr"), seed);
    const code = seed.toString(36).toUpperCase().padStart(8, "0").slice(-8);
    document.getElementById("qr-code").textContent = `RZ-${code.slice(0, 4)}-${code.slice(4)}`;

    recompense = { expireA: Date.now() + RECOMPENSE_MS, intervalle: null };
    recompense.intervalle = setInterval(tick, 1000);
    tick();
    showMessage("");
    setXp(xp); // met à jour le texte d'aide
    qrDialog.showModal();
  }

  function endReward(texte) {
    clearInterval(recompense.intervalle);
    recompense = null;
    if (qrDialog.open) qrDialog.close();
    setXp(0);
    showMessage(texte);
  }

  cup.addEventListener("click", () => {
    if (recompense) {
      qrDialog.showModal();
    } else if (xp >= XP_MAX) {
      confirmDialog.returnValue = "";
      confirmDialog.showModal();
    }
  });

  confirmDialog.addEventListener("close", () => {
    if (confirmDialog.returnValue === "ok") startReward();
  });

  document.getElementById("qr-close").addEventListener("click", () => qrDialog.close());
  document.getElementById("qr-scan").addEventListener("click", () => {
    endReward("QR-code scanné : bon café ! Ta tasse repart de zéro.");
  });

  // Admin : le curseur et le champ numérique restent synchronisés
  document.getElementById("cafe-admin-btn").addEventListener("click", () => {
    adminRange.value = adminNumber.value = xp;
    adminDialog.returnValue = "";
    adminDialog.showModal();
  });
  adminRange.addEventListener("input", () => (adminNumber.value = adminRange.value));
  adminNumber.addEventListener("input", () => (adminRange.value = adminNumber.value));
  adminDialog.addEventListener("close", () => {
    if (adminDialog.returnValue === "save") {
      showMessage("");
      setXp(adminNumber.value);
    }
  });

  setXp(XP_DEPART);
}

// Onglet Profil : photo entourée d'un cadre selon le niveau, badge, progression,
// avancement vers la certification et liste des résumés postés (qu'on peut retirer).
// L'XP gagné reste acquis même si on retire un résumé.
// `notes` / `basses` : notes reçues sur mes résumés, dont celles sous 4 étoiles.
const PROFIL = {
  pseudo: "MonPseudo",
  pfp: "pfp_08",
  xp: 640,
  coins: 64, // 1 coin par tranche de XP_PAR_COIN XP gagnés
  notes: 64,
  basses: 12,
  documents: [
    { titre: "Résumé chapitres 1 à 4", faculte: "eco",   semestre: 2, matiere: 2, moyenne: 4.4, nbNotes: 24 },
    { titre: "Fiche de triche examen", faculte: "eco",   semestre: 2, matiere: 0, moyenne: 4.1, nbNotes: 18 },
    { titre: "Résumé du cours",        faculte: "eco",   semestre: 3, matiere: 3, moyenne: 3.6, nbNotes: 12 },
    { titre: "Formulaire",             faculte: "eco",   semestre: 1, matiere: 2, moyenne: 4.8, nbNotes: 7 },
    { titre: "Notes de lecture",       faculte: "droit", semestre: 4, matiere: 4, moyenne: 2.9, nbNotes: 3 },
  ],
};

let documentARetirer = null;

function formatPourcent(part) {
  return (part * 100).toLocaleString("fr-CH", { maximumFractionDigits: 1 }) + " %";
}

function renderProfil() {
  const niv = niveauPour(PROFIL.xp);
  const suivant = NIVEAUX[niv.n]; // undefined au niveau maximum
  const certifie = estCertifie(PROFIL);

  // Le cadre le plus travaillé (animé) est réservé aux certifiés
  const avatar = document.getElementById("profil-avatar");
  avatar.className = `avatar avatar--lvl${certifie ? 5 : niv.n}`;
  avatar.replaceChildren(avatarContenu(PROFIL.pfp, PROFIL.pseudo));
  document.getElementById("profil-badge").replaceChildren(createLevelBadge(PROFIL));
  document.getElementById("profil-pseudo").textContent = PROFIL.pseudo;

  // Avancement vers la certification (indépendant de l'XP)
  const partBasse = PROFIL.notes ? PROFIL.basses / PROFIL.notes : 0;
  const certif = document.getElementById("profil-certif");
  certif.classList.toggle("profil__certif--ok", certifie);
  certif.textContent = certifie
    ? `✓ Certifié : ${PROFIL.notes} notes reçues, dont ${formatPourcent(partBasse)} sous ${CERTIFICATION.noteBasse} étoiles.`
    : `Certification : ${PROFIL.notes} / ${CERTIFICATION.notesMin} notes reçues · `
      + `${formatPourcent(partBasse)} de notes sous ${CERTIFICATION.noteBasse} étoiles `
      + `(il en faut moins de ${formatPourcent(CERTIFICATION.partBasseMax)}).`;

  const ratio = suivant ? (PROFIL.xp - niv.xp) / (suivant.xp - niv.xp) : 1;
  document.getElementById("profil-xp-fill").style.width = ratio * 100 + "%";
  document.getElementById("profil-level-text").textContent = suivant
    ? `Niveau ${niv.n} · ${PROFIL.xp} XP — encore ${suivant.xp - PROFIL.xp} XP pour devenir ${suivant.nom}`
    : `Niveau ${niv.n} · ${PROFIL.xp} XP — niveau maximum atteint`;

  document.getElementById("stat-ajoutes").textContent = PROFIL.documents.length;
  document.getElementById("stat-favoris").textContent = nbFavoris();

  const list = document.getElementById("my-docs");
  list.replaceChildren();
  PROFIL.documents.forEach((doc) => {
    const faculte = FACULTES.find((f) => f.id === doc.faculte);
    const item = document.createElement("li");
    item.className = "my-doc";
    item.style.setProperty("--fac-color", faculte.color);
    item.innerHTML = `
      <span class="my-doc__info">
        <strong class="my-doc__title"></strong>
        <span class="my-doc__meta"></span>
      </span>
      <span class="my-doc__rating">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_PATH}"/></svg>
        <span></span>
      </span>
      <button class="btn btn--danger" type="button">Retirer</button>`;
    const meta = `${faculte.nom} · ${doc.semestre}${doc.semestre === 1 ? "er" : "e"} semestre · ${MATIERES[doc.matiere]}`;
    item.querySelector(".my-doc__title").textContent = doc.titre;
    item.querySelector(".my-doc__meta").textContent = meta;
    item.dataset.search = normaliser(`${doc.titre} ${meta}`);
    const rating = item.querySelector(".my-doc__rating");
    rating.querySelector("span").textContent = doc.nbNotes
      ? `${formatNote(doc.moyenne)} (${doc.nbNotes})`
      : "Pas encore noté";
    rating.title = doc.nbNotes ? `Moyenne ${formatNote(doc.moyenne)} sur 5, ${doc.nbNotes} notes` : "";
    item.querySelector("button").addEventListener("click", () => {
      documentARetirer = doc;
      document.getElementById("remove-titre").textContent = doc.titre;
      const dialog = document.getElementById("remove-dialog");
      dialog.returnValue = "";
      dialog.showModal();
    });
    list.appendChild(item);
  });
  document.getElementById("my-docs-count").textContent = PROFIL.documents.length;
  document.getElementById("my-docs-empty").classList.toggle("hidden", PROFIL.documents.length > 0);
  document.getElementById("my-docs-search").classList.toggle("hidden", PROFIL.documents.length === 0);
  filtrerMesResumes();
}

// Recherche insensible à la casse (et aux accents : « resume » trouve « Résumé »)
function normaliser(texte) {
  return texte.toLocaleLowerCase("fr").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function filtrerMesResumes() {
  const saisie = document.getElementById("my-docs-search").value.trim();
  const recherche = normaliser(saisie);
  let visibles = 0;
  document.querySelectorAll("#my-docs .my-doc").forEach((item) => {
    const correspond = item.dataset.search.includes(recherche);
    item.classList.toggle("hidden", !correspond);
    if (correspond) visibles++;
  });

  const noMatch = document.getElementById("my-docs-no-match");
  noMatch.textContent = `Aucun résumé ne correspond à « ${saisie} ».`;
  noMatch.classList.toggle("hidden", visibles > 0 || PROFIL.documents.length === 0);
}

function initProfil() {
  const adminDialog = document.getElementById("profil-admin-dialog");
  const adminRange = document.getElementById("profil-admin-range");
  const adminNumber = document.getElementById("profil-admin-xp");
  const adminNotes = document.getElementById("profil-admin-notes");
  const adminBasses = document.getElementById("profil-admin-basses");
  const removeDialog = document.getElementById("remove-dialog");

  document.getElementById("profil-admin-btn").addEventListener("click", () => {
    adminRange.value = adminNumber.value = PROFIL.xp;
    adminNotes.value = PROFIL.notes;
    adminBasses.value = PROFIL.basses;
    adminDialog.returnValue = "";
    adminDialog.showModal();
  });
  adminRange.addEventListener("input", () => (adminNumber.value = adminRange.value));
  adminNumber.addEventListener("input", () => (adminRange.value = adminNumber.value));
  adminDialog.addEventListener("close", () => {
    if (adminDialog.returnValue !== "save") return;
    const ancienXp = PROFIL.xp;
    PROFIL.xp = Math.min(Number(adminRange.max), Math.max(0, Math.round(Number(adminNumber.value) || 0)));
    // Chaque nouvelle tranche de XP_PAR_COIN XP rapporte 1 coin ; perdre de l'XP n'en retire pas
    if (PROFIL.xp > ancienXp) {
      PROFIL.coins += Math.floor(PROFIL.xp / XP_PAR_COIN) - Math.floor(ancienXp / XP_PAR_COIN);
      renderCoins();
    }
    // Notes reçues (pour tester la certification) ; les notes basses ne peuvent pas dépasser le total
    PROFIL.notes = Math.max(0, Math.round(Number(adminNotes.value) || 0));
    PROFIL.basses = Math.min(PROFIL.notes, Math.max(0, Math.round(Number(adminBasses.value) || 0)));
    renderProfil();
  });

  document.getElementById("my-docs-search").addEventListener("input", filtrerMesResumes);

  removeDialog.addEventListener("close", () => {
    if (removeDialog.returnValue === "remove" && documentARetirer) {
      PROFIL.documents.splice(PROFIL.documents.indexOf(documentARetirer), 1);
      renderProfil();
    }
    documentARetirer = null;
  });

  renderProfil();
}

// Personnalisation (Profil) : chaque réglage pose un attribut sur <html>
// (data-theme, data-bibliotheque) que le CSS utilise.
// Le choix est retenu dans le navigateur (localStorage) ; s'il est indisponible, on garde la valeur par défaut.
const REGLAGES = {
  theme:        { valeurs: ["light", "dark"],    defaut: "light", cle: "revizone-theme" },
  bibliotheque: { valeurs: ["clair", "sombre"],  defaut: "clair", cle: "revizone-bibliotheque" },
};

function appliquerReglage(nom, valeur) {
  const reglage = REGLAGES[nom];
  if (!reglage.valeurs.includes(valeur)) valeur = reglage.defaut;
  document.documentElement.dataset[nom] = valeur;
  document.querySelectorAll(`.theme-option[data-reglage="${nom}"]`).forEach((option) => {
    option.setAttribute("aria-checked", option.dataset.valeur === valeur);
  });
}

function lireReglage(cle) {
  try {
    return localStorage.getItem(cle);
  } catch (e) {
    return null; // stockage bloqué (navigation privée...)
  }
}

function ecrireReglage(cle, valeur) {
  try {
    localStorage.setItem(cle, valeur);
  } catch (e) {
    // pas de stockage : le réglage s'applique quand même pour cette visite
  }
}

// Coins : gagnés avec l'XP, visibles uniquement dans la fenêtre Personnalisation.
// Ils serviront à acheter des thèmes.
const XP_PAR_COIN = 10;

// Admin · pièces illimitées : les achats ne coûtent plus rien et le compteur affiche « ∞ »
let coinsIllimites = false;

function renderCoins() {
  const montant = coinsIllimites ? "∞" : PROFIL.coins;
  document.getElementById("coins-amount").textContent = montant;
  document.querySelectorAll(".deco-coins").forEach((el) => (el.textContent = montant));
  const bouton = document.getElementById("coins-illimites-btn");
  bouton.setAttribute("aria-pressed", coinsIllimites);
  bouton.textContent = coinsIllimites ? "Admin · désactiver les pièces illimitées" : "Admin · pièces illimitées";
}

function initCoins() {
  const coinsBtn = document.getElementById("coins-btn");
  const info = document.getElementById("coins-info");
  const adminDialog = document.getElementById("coins-admin-dialog");
  const adminInput = document.getElementById("coins-admin-input");

  coinsBtn.addEventListener("click", () => {
    const ouvert = info.classList.toggle("hidden") === false;
    coinsBtn.setAttribute("aria-expanded", ouvert);
  });

  document.getElementById("coins-admin-btn").addEventListener("click", () => {
    adminInput.value = PROFIL.coins;
    adminDialog.returnValue = "";
    adminDialog.showModal();
  });
  adminDialog.addEventListener("close", () => {
    if (adminDialog.returnValue !== "save") return;
    PROFIL.coins = Math.min(Number(adminInput.max), Math.max(0, Math.round(Number(adminInput.value) || 0)));
    renderCoins();
  });

  document.getElementById("coins-illimites-btn").addEventListener("click", () => {
    coinsIllimites = !coinsIllimites;
    renderCoins();
  });

  renderCoins();
}

// Pseudo et photo de profil (Profil > Personnalisation), retenus dans le navigateur
const PSEUDO_VALIDE = /^[\p{L}\p{N}._-]{3,20}$/u;
const NB_PFP = 20;
const CLE_PSEUDO = "revizone-pseudo";
const CLE_PFP = "revizone-pfp";

function pfpValide(pfp) {
  return pfp === "" || /^pfp_\d\d$/.test(pfp) && Number(pfp.slice(4)) <= NB_PFP;
}

// Photos proposées : « aucune » (icône par défaut), puis pfp_01 à pfp_20
function renderChoixPfp() {
  const grille = document.getElementById("pfp-grid");
  grille.replaceChildren();
  ["", ...Array.from({ length: NB_PFP }, (_, i) => `pfp_${String(i + 1).padStart(2, "0")}`)].forEach((pfp) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "pfp-option";
    option.setAttribute("role", "radio");
    option.setAttribute("aria-checked", (PROFIL.pfp ?? "") === pfp);
    option.setAttribute("aria-label", pfp ? `Photo ${Number(pfp.slice(4))}` : "Pas de photo");
    option.append(avatarContenu(pfp || null, PROFIL.pseudo));
    option.addEventListener("click", () => {
      PROFIL.pfp = pfp || null;
      ecrireReglage(CLE_PFP, pfp);
      grille.querySelectorAll(".pfp-option").forEach((o) => o.setAttribute("aria-checked", o === option));
      renderProfil();
    });
    grille.appendChild(option);
  });
}

function initPseudo() {
  const form = document.getElementById("perso-pseudo");
  const input = document.getElementById("pseudo-input");
  const erreur = document.getElementById("pseudo-erreur");
  const ok = document.getElementById("pseudo-ok");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const pseudo = input.value.trim();
    let message = "";
    if (!PSEUDO_VALIDE.test(pseudo)) {
      message = "Le pseudo doit faire 3 à 20 caractères : lettres, chiffres, point, tiret ou _.";
    } else if (UTILISATEURS.some((u) => normaliser(u.pseudo) === normaliser(pseudo))) {
      message = "Ce pseudo est déjà pris par un autre étudiant.";
    }
    erreur.textContent = message;
    erreur.classList.toggle("hidden", !message);
    ok.classList.toggle("hidden", !!message);
    if (message) return;
    PROFIL.pseudo = pseudo;
    ecrireReglage(CLE_PSEUDO, pseudo);
    renderProfil();
  });
  input.addEventListener("input", () => ok.classList.add("hidden"));
}

// La fenêtre ne montre que les paramètres de l'onglet d'où on l'ouvre (data-onglet) ;
// les coins, eux, sont toujours affichés.
let persoOnglet = null; // onglet d'où la fenêtre a été ouverte (sert au bouton « Décorer »)

function ouvrirPersonnalisation(onglet) {
  persoOnglet = onglet;
  const tabs = [...document.querySelectorAll(".perso__tab")];
  const visibles = tabs.filter((t) => t.dataset.onglet.split(" ").includes(onglet));
  tabs.forEach((t) => {
    t.classList.toggle("hidden", !visibles.includes(t));
    t.setAttribute("aria-expanded", false);
    document.getElementById(t.dataset.panel).classList.add("hidden");
  });
  // 0 ou 1 paramètre : pas de liste à gauche (le seul paramètre s'affiche directement)
  document.querySelector(".perso").classList.toggle("perso--sans-liste", visibles.length <= 1);
  const placeholder = document.getElementById("perso-placeholder");
  placeholder.textContent = visibles.length
    ? "Choisis un paramètre dans la liste."
    : "Rien à personnaliser ici pour l'instant.";
  placeholder.classList.remove("hidden");

  // L'explication des coins est repliée et le formulaire du pseudo remis à zéro à chaque ouverture
  document.getElementById("coins-info").classList.add("hidden");
  document.getElementById("coins-btn").setAttribute("aria-expanded", false);
  document.getElementById("pseudo-input").value = PROFIL.pseudo;
  document.getElementById("pseudo-erreur").classList.add("hidden");
  document.getElementById("pseudo-ok").classList.add("hidden");

  // Un seul paramètre : il s'ouvre directement
  if (visibles.length === 1) visibles[0].click();
  document.getElementById("perso-dialog").showModal();
}

function initPersonnalisation() {
  const dialog = document.getElementById("perso-dialog");
  const placeholder = document.getElementById("perso-placeholder");
  initCoins();

  Object.entries(REGLAGES).forEach(([nom, reglage]) => appliquerReglage(nom, lireReglage(reglage.cle)));
  const pseudo = lireReglage(CLE_PSEUDO);
  if (pseudo && PSEUDO_VALIDE.test(pseudo)) PROFIL.pseudo = pseudo;
  const pfp = lireReglage(CLE_PFP);
  if (pfp !== null && pfpValide(pfp)) PROFIL.pfp = pfp || null;
  renderChoixPfp();
  initPseudo();

  // Le bouton « Personnalisation » est dans les onglets Favoris, Café et Profil
  document.querySelectorAll(".perso-btn").forEach((btn) => {
    btn.addEventListener("click", () => ouvrirPersonnalisation(btn.dataset.onglet));
  });
  document.getElementById("perso-close").addEventListener("click", () => dialog.close());

  // Un clic sur un paramètre affiche son contenu à droite
  document.querySelectorAll(".perso__tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".perso__tab").forEach((t) => {
        const actif = t === tab;
        t.setAttribute("aria-expanded", actif);
        document.getElementById(t.dataset.panel).classList.toggle("hidden", !actif);
      });
      placeholder.classList.add("hidden");
    });
  });

  document.querySelectorAll(".theme-option").forEach((option) => {
    option.addEventListener("click", () => {
      const { reglage, valeur } = option.dataset;
      appliquerReglage(reglage, valeur);
      ecrireReglage(REGLAGES[reglage].cle, valeur);
    });
  });
}

// Mode admin : appuyer en même temps sur A, D, M et N affiche (ou recache) les boutons
// d'administration. Rien n'est retenu : au rechargement, ils sont de nouveau cachés.
function initModeAdmin() {
  const COMBO = ["a", "d", "m", "n"];
  const enfoncees = new Set();
  document.addEventListener("keydown", (e) => {
    const touche = e.key.toLowerCase();
    if (!COMBO.includes(touche) || e.repeat) return;
    enfoncees.add(touche);
    if (COMBO.every((t) => enfoncees.has(t))) {
      document.documentElement.classList.toggle("mode-admin");
      enfoncees.clear(); // il faut relâcher et rappuyer pour basculer à nouveau
    }
  });
  document.addEventListener("keyup", (e) => enfoncees.delete(e.key.toLowerCase()));
  window.addEventListener("blur", () => enfoncees.clear());
}

function route() {
  const [tab, a, b, c] = location.hash.slice(1).split("/");
  setActiveTab(tab);
  if (tab === "favoris") {
    showFavoris(a);
  } else {
    showAccueil(a, b, c);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initPersonnalisation();
  renderCampusMap();
  initAjouter();
  initCafe();
  initProfil();
  initFavoris();
  initLecteur();
  initModeAdmin();

  // Un clic sur un semestre ouvre son étagère
  document.querySelectorAll(".semestre-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const faculte = location.hash.slice(1).split("/")[1];
      location.hash = `#accueil/${faculte}/${btn.dataset.semestre}`;
    });
  });

  route();
  window.addEventListener("hashchange", route);
});
