/*
 * Evenium — page d'un modèle importé (studio des modèles).
 * Les éléments modifiables portent data-ev-field (+ data-ev-type : text, image, bg, audio).
 * Les valeurs arrivent par message du site (studio, création, invitation), sinon celles publiées.
 */
(function () {
  if (window.__evRuntime) return;
  window.__evRuntime = true;

  /*
   * RÈGLE ABSOLUE EVENIUM : Suppression définitive du petit crayon et de tout bouton d'édition interne
   * aux modèles importés (fabEdit, editBtn, boutons de personnalisation locaux).
   * Le client dispose de son propre studio d'édition complet après achat ; aucun bouton parasite ne doit
   * s'afficher ni gâter la vue du modèle.
   */
  var HIDE_PENCIL_CSS =
    "#fabEdit, #editFab, #editBtn, #edit-toggle, #editRsvp, .edit-fab, .fab-edit, .btn-edit, .edit-btn, " +
    "[aria-label*='Personnaliser'], [aria-label*='Modifier'], [aria-label*='Éditer'], " +
    "[title*='Personnaliser'], [title*='Modifier'], [title*='Éditer'], " +
    "#panel, #pf, #editor, .editor[role='dialog'], [id*='edit-modal'] { " +
    "display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; " +
    "width: 0 !important; height: 0 !important; position: absolute !important; left: -9999px !important; }";

  try {
    var editSt = document.createElement("style");
    editSt.id = "ev-hide-pencils";
    editSt.textContent = HIDE_PENCIL_CSS;
    (document.head || document.documentElement).appendChild(editSt);
  } catch (e) { }

  function purgeInternalEditButtons() {
    var selectors = [
      "#fabEdit", "#editFab", "#editBtn", "#edit-toggle", "#editRsvp",
      ".edit-fab", ".fab-edit", ".btn-edit", ".edit-btn",
      "[aria-label*='Personnaliser']", "[aria-label*='Modifier']", "[aria-label*='Éditer']",
      "[title*='Personnaliser']", "[title*='Modifier']",
      "#panel", "#pf", "#editor"
    ];
    for (var i = 0; i < selectors.length; i++) {
      try {
        var found = document.querySelectorAll(selectors[i]);
        for (var j = 0; j < found.length; j++) {
          found[j].remove();
        }
      } catch (e) { }
    }
    // Détection des boutons flottants contenant une icône crayon SVG
    try {
      var fabs = document.querySelectorAll("button, .fab, a");
      for (var k = 0; k < fabs.length; k++) {
        var b = fabs[k];
        if (b.id === "ev-top-bar" || b.closest("#ev-top-bar")) continue;
        var p = b.querySelector("path");
        if (p) {
          var d = p.getAttribute("d") || "";
          if (d.indexOf("M4 20h4L19") !== -1 || d.indexOf("M17 3a2.828") !== -1 || d.indexOf("18.37 5.63") !== -1) {
            b.remove();
          }
        }
      }
    } catch (e) { }
  }

  purgeInternalEditButtons();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", purgeInternalEditButtons);
  }
  window.addEventListener("load", purgeInternalEditButtons);
  var pencilObserver = new MutationObserver(purgeInternalEditButtons);
  try {
    pencilObserver.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) { }

  /*
   * Fondus sonores des modèles : un volume calculé hors de 0 – 1 (ex. -0.0002 en fin de fondu) fait planter
   * leur script ; il est ramené dans les limites au lieu de lever une erreur.
   */
  try {
    var vol = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "volume");
    if (vol && vol.set) {
      Object.defineProperty(HTMLMediaElement.prototype, "volume", {
        configurable: true,
        enumerable: vol.enumerable,
        get: vol.get,
        set: function (v) {
          var n = Number(v);
          vol.set.call(this, isFinite(n) ? Math.min(1, Math.max(0, n)) : 1);
        },
      });
    }
  } catch (e) { }

  var slug = (location.pathname.match(/^\/m\/([a-z0-9-]+)\//) || [])[1];
  var inFrame = window.parent && window.parent !== window;
  var pickMode = false;

  /*
   * Rubriques de la page (mêmes règles qu'à l'import : <section>, <header>, <footer>, <article>,
   * ou blocs principaux), numérotées dans l'ordre de leurs éléments modifiables. Calculées une fois,
   * avant tout ajout de la page.
   */
  var SKIP = /^(SCRIPT|STYLE|NOSCRIPT|SVG|TEMPLATE|IFRAME|HEAD|CANVAS|SELECT|OPTION|TEXTAREA|LINK|META)$/;
  var sections = null;
  function findSections() {
    if (sections) return sections;
    sections = {};
    var meaningful = function (el) {
      return Array.prototype.filter.call(el.children, function (c) {
        return !SKIP.test(c.tagName.toUpperCase()) && !/^ev-/.test(c.id || "");
      });
    };
    var root = document.body;
    for (var d = 0; d < 6 && meaningful(root).length === 1; d++) root = meaningful(root)[0];
    var n = 0;
    document.querySelectorAll("[data-ev-field],[data-ev-href],[data-ev-bg],[data-ev-color]").forEach(function (el) {
      var cur = el;
      while (cur && cur !== root && cur !== document.body) {
        if (/^(SECTION|HEADER|FOOTER|ARTICLE|NAV)$/.test(cur.tagName.toUpperCase()) || cur.parentElement === root) break;
        cur = cur.parentElement;
      }
      var box = cur && cur !== document.body ? cur : root;
      if (!box.hasAttribute("data-ev-section")) box.setAttribute("data-ev-section", String(++n));
    });
    sections.root = root;
    return sections;
  }

  function parseList(v) {
    try {
      var x = JSON.parse(v || "[]");
      return Array.isArray(x) ? x : [];
    } catch (e) {
      return [];
    }
  }

  /* Rubriques supprimées (masquées) et rubriques ajoutées par l'organisateur */
  function structure(values) {
    if (!values) return;
    var root = findSections().root;
    var hidden = parseList(values.__hidden).map(String);
    document.querySelectorAll("[data-ev-section]").forEach(function (box) {
      var off = hidden.indexOf(box.getAttribute("data-ev-section")) !== -1;
      if (off) box.setAttribute("data-ev-hidden", "");
      else box.removeAttribute("data-ev-hidden");
      box.style.display = off ? "none" : "";
    });

    document.querySelectorAll("[data-ev-rubrique]").forEach(function (n) {
      n.remove();
    });
    parseList(values.__rubriques).forEach(function (r) {
      var sec = document.createElement("section");
      sec.setAttribute("data-ev-rubrique", r.id || "");
      sec.setAttribute("style", "display:block;box-sizing:border-box;padding:64px 24px;text-align:center;position:relative");
      var inner = document.createElement("div");
      inner.setAttribute("style", "max-width:620px;margin:0 auto");
      if (r.title) {
        var h = document.createElement("h2");
        h.textContent = r.title;
        inner.appendChild(h);
      }
      if (r.image) {
        var img = document.createElement("img");
        img.src = r.image;
        img.alt = r.title || "";
        img.setAttribute("style", "display:block;width:100%;max-width:520px;margin:18px auto;border-radius:6px;object-fit:cover");
        inner.appendChild(img);
      }
      if (r.text) {
        String(r.text).split(/\n{2,}/).forEach(function (para) {
          var p = document.createElement("p");
          setText(p, para);
          inner.appendChild(p);
        });
      }
      sec.appendChild(inner);
      var anchor = r.after ? document.querySelector('[data-ev-section="' + r.after + '"]') : null;
      if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor.nextSibling);
      else {
        var all = document.querySelectorAll("[data-ev-section]");
        var last = all[all.length - 1];
        if (last && last.parentNode) last.parentNode.insertBefore(sec, last.nextSibling);
        else root.appendChild(sec);
      }
    });
  }

  /* Même lecture du texte qu'à l'import (lignes nettoyées, retours à la ligne gardés) */
  function readText(el) {
    var clone = el.cloneNode(true);
    clone.querySelectorAll("br").forEach(function (br) {
      br.replaceWith("\n");
    });
    return (clone.textContent || "")
      .split("\n")
      .map(function (l) {
        return l.replace(/\s+/g, " ").trim();
      })
      .join("\n")
      .replace(/^\n+|\n+$/g, "");
  }

  function setText(el, value) {
    el.textContent = "";
    String(value).split("\n").forEach(function (line, i) {
      if (i) el.appendChild(document.createElement("br"));
      el.appendChild(document.createTextNode(line));
    });
  }

  function apply(values) {
    if (!values) return;
    document.querySelectorAll("[data-ev-field]").forEach(function (el) {
      var id = el.getAttribute("data-ev-field");
      if (!(id in values)) return;
      var v = values[id];
      var type = el.getAttribute("data-ev-type") || "text";
      // Texte inchangé : on garde la mise en forme d'origine (gras, italique…)
      if (type === "text") {
        if (readText(el) !== String(v)) setText(el, v);
      }
      else if (type === "image") {
        el.removeAttribute("srcset");
        if (el.getAttribute("src") !== v) el.setAttribute("src", v);
      } else if (type === "bg") el.style.backgroundImage = v ? 'url("' + v + '")' : "none";
      else if (type === "audio" || type === "video") {
        if (el.getAttribute("src") !== v) {
          el.setAttribute("src", v);
          var media = el.tagName === "SOURCE" ? el.parentElement : el;
          if (media && media.load) media.load();
          if (media && media.autoplay && media.play) media.play().catch(function () { });
        }
      }
    });
    // Liens (itinéraire, téléphone, WhatsApp…), images de fond et couleurs
    document.querySelectorAll("[data-ev-href]").forEach(function (el) {
      var id = el.getAttribute("data-ev-href");
      if (id in values && el.getAttribute("href") !== values[id]) el.setAttribute("href", values[id]);
    });
    document.querySelectorAll("[data-ev-bg]").forEach(function (el) {
      var id = el.getAttribute("data-ev-bg");
      if (id in values) el.style.backgroundImage = values[id] ? 'url("' + values[id] + '")' : "none";
    });
    document.querySelectorAll("[data-ev-color]").forEach(function (el) {
      var id = el.getAttribute("data-ev-color");
      if (id in values && values[id]) el.style.background = values[id];
    });
  }

  /*
   * Conteneur qui défile réellement : la page elle-même, ou un bloc intérieur plein écran
   * (modèles dont le corps ne défile pas et dont tout le contenu est dans un conteneur).
   */
  function scrollHost() {
    var vh = window.innerHeight;
    var best = null;
    document.body.querySelectorAll("*").forEach(function (el) {
      if (el.id === "ev-end-cta" || el.closest("#ev-end-cta")) return;
      // Ne JAMAIS choisir une boîte de lettre, un papier, un modal ou un article interne
      if (/^(ARTICLE|FORM|DIALOG|TEXTAREA)$/i.test(el.tagName)) return;
      var ident = ((el.className || "") + " " + (el.id || "")).toLowerCase();
      if (/paper|lettre|letter|envelope|modal|dialog|card-body|caption|toast/i.test(ident)) return;
      var oy = getComputedStyle(el).overflowY;
      if (oy !== "auto" && oy !== "scroll") return;
      if (el.clientHeight < vh * 0.7 || el.scrollHeight <= el.clientHeight + 1) return;
      if (!best || el.clientHeight > best.clientHeight) best = el;
    });
    var page = document.scrollingElement || document.documentElement;
    var pageScrolls = page.scrollHeight > vh + 1 && getComputedStyle(document.body).overflowY !== "hidden";
    return best && !pageScrolls ? best : document.body;
  }

  /*
   * Détection exhaustive des modèles à étapes / stories / diaporamas / écrans interactifs.
   * RÈGLE ABSOLUE EVENIUM : Les options (CTA) ne doivent JAMAIS pénétrer ou recouvrir le modèle pendant la présentation.
   * Elles n'apparaissent qu'à la TOUTE FIN (dernier écran / fin de la story / tout en bas du scroll).
   */
  function getSlides() {
    var selectors = [
      "#stage > .slide",
      "#stage > section",
      "#stage > div",
      ".slide",
      ".story-slide",
      "[data-slide]",
      ".swiper-slide",
      ".carousel-item",
      ".story-screen",
      ".slide-item",
      ".screen",
      ".story",
      ".step",
      "[data-step]",
      "[data-screen]",
      "[data-page]",
      "[data-index]",
      ".page",
      ".scene",
      ".story-page",
      ".frame",
      ".story-frame",
      ".snap-child",
      ".story-card",
      "[class*=\"story-slide\"]",
      "[class*=\"story-screen\"]",
      "[class*=\"story-step\"]",
      "[class*=\"story-card\"]"
    ];
    for (var i = 0; i < selectors.length; i++) {
      var found = document.querySelectorAll(selectors[i]);
      if (found && found.length > 1) {
        return Array.prototype.slice.call(found);
      }
    }

    // Détection générique par conteneur de slides ou éléments de sections plein écran
    var sections = document.querySelectorAll("section, [data-section]");
    if (sections && sections.length > 1) {
      var fullHeightSections = Array.prototype.slice.call(sections).filter(function (s) {
        if (s.id === "ev-end-cta" || s.closest("#ev-end-cta")) return false;
        var h = s.offsetHeight;
        return h >= window.innerHeight * 0.7;
      });
      if (fullHeightSections.length > 1) {
        return fullHeightSections;
      }
    }

    return [];
  }

  function isStoryAtEnd() {
    // 1. Couverture ou écran d'accueil d'une story / carte interactive (avant démarrage)
    var startScreen = document.querySelector("#start, .start, #cover, .cover, #teaser, .teaser, .splash, [data-screen='start'], [data-screen='cover']");
    if (startScreen) {
      var isGone = startScreen.classList.contains("gone") ||
        startScreen.classList.contains("hidden") ||
        startScreen.hasAttribute("hidden") ||
        startScreen.getAttribute("aria-hidden") === "true";
      if (!isGone) {
        var cs = getComputedStyle(startScreen);
        if (cs.display !== "none" && cs.visibility !== "hidden" && parseFloat(cs.opacity || "1") > 0.1) {
          return false;
        }
      }
    }

    // 2. Bouton explicite pour lancer la lecture / regarder
    var startBtn = document.querySelector(".btn-watch, .btn-start, [data-action='watch'], [data-action='start'], #openBtn, #openBtn2, #heartBtn");
    if (startBtn && startBtn.offsetParent !== null) {
      var btnCs = getComputedStyle(startBtn);
      if (btnCs.display !== "none" && btnCs.visibility !== "hidden" && parseFloat(btnCs.opacity || "1") > 0.1) {
        return false;
      }
    }

    // 3. Vidéo teaser / introduction en cours
    var teaser = document.querySelector("#teaser, .teaser, .intro-video");
    if (teaser && teaser.getAttribute("aria-hidden") !== "true") {
      var tcs = getComputedStyle(teaser);
      if (tcs.display !== "none" && tcs.visibility !== "hidden") {
        return false;
      }
    }

    // 4. Barres de progression de story (format Instagram / TikTok)
    var progressBars = document.querySelectorAll(".story-bars > *, .bars > *, .progress-bars > *, .story-progress > *, [class*=\"progress\"] > span, [class*=\"progress\"] > div, #bars > span");
    if (progressBars && progressBars.length > 1) {
      var lastBar = progressBars[progressBars.length - 1];
      var lastChild = lastBar.querySelector("i") || lastBar.firstElementChild || lastBar;
      var transform = (lastChild && lastChild.style && lastChild.style.transform) || "";
      var width = (lastChild && lastChild.style && lastChild.style.width) || "";
      var isScale1 = transform.indexOf("scaleX(1)") !== -1;
      var isWidth100 = width === "100%" || parseFloat(width) >= 95;
      var isClassActive = lastBar.classList.contains("active") ||
        lastBar.classList.contains("on") ||
        lastBar.classList.contains("done") ||
        lastBar.classList.contains("completed");
      if (!isScale1 && !isWidth100 && !isClassActive) {
        return false;
      }
    }

    var slides = getSlides();
    if (!slides.length) {
      // S'il n'y a pas de diapositives identifiées, vérifier s'il s'agit d'un lecteur dynamique avec #stage
      var stage = document.getElementById("stage");
      if (stage && stage.children.length > 1) {
        slides = Array.prototype.slice.call(stage.children);
      } else {
        return true;
      }
    }

    // 5. Si des slides antérieurs sont encore actifs/visibles, l'histoire n'est PAS finie
    for (var i = 0; i < slides.length - 1; i++) {
      var s = slides[i];
      if (
        s.classList.contains("on") ||
        s.classList.contains("active") ||
        s.classList.contains("current") ||
        s.classList.contains("visible") ||
        s.classList.contains("show") ||
        s.classList.contains("is-active") ||
        s.classList.contains("swiper-slide-active")
      ) {
        return false;
      }
      var scs = getComputedStyle(s);
      if (s.offsetParent !== null && scs.display !== "none" && scs.visibility !== "hidden" && parseFloat(scs.opacity || "1") > 0.5) {
        return false;
      }
    }

    // 6. Dernier slide : doit être actif pour que le CTA apparaisse
    var last = slides[slides.length - 1];
    var isLastActiveSlide = (
      last.classList.contains("on") ||
      last.classList.contains("active") ||
      last.classList.contains("current") ||
      last.classList.contains("visible") ||
      last.classList.contains("show") ||
      last.classList.contains("is-active") ||
      last.classList.contains("swiper-slide-active")
    );
    if (isLastActiveSlide) return true;

    // 7. Éléments explicites de fin de story
    var endEl = document.querySelector(".fin.on, .final.on, .slide-final.on, #stage .fin.on, .is-ended, .story-end, .end-screen.active, .end-screen.on");
    if (endEl && endEl.offsetParent !== null) return true;

    // 8. Bouton de relecture ou de fin visible UNIQUEMENT si son conteneur est réellement actif
    var again = document.querySelector("#again, .btn-again, [data-action='again'], .restart-story");
    if (again) {
      var parentSlide = again.closest(".slide, section, .screen, [data-slide]");
      if (parentSlide && (parentSlide.classList.contains("on") || parentSlide.classList.contains("active") || getComputedStyle(parentSlide).visibility === "visible")) {
        return true;
      }
    }

    return false;
  }

  /*
   * En-tête Haute Couture sur une ligne (démo publique, choix du modèle, studio admin).
   * L'en-tête reste toujours fixé tout en haut du viewport sur une seule ligne compacte,
   * sans JAMAIS recouvrir l'œuvre, les lettres, les photos ou les histoires de story.
   */
  var ctaBox = null;
  function syncCtaVisibility() {
    if (!ctaBox) return;
    if (ctaBox.parentNode !== document.body) {
      document.body.appendChild(ctaBox);
    }
    ctaBox.style.setProperty("display", "flex", "important");
    ctaBox.style.setProperty("position", "fixed", "important");
    ctaBox.style.setProperty("top", "0", "important");
    ctaBox.style.setProperty("left", "0", "important");
    ctaBox.style.setProperty("right", "0", "important");
    ctaBox.style.setProperty("z-index", "2147483647", "important");
  }

  function placeCta() {
    if (!ctaBox) return;
    syncCtaVisibility();
  }

  function bleedCta() {
    if (!ctaBox) return;
    syncCtaVisibility();
  }

  /* Couleurs « r, g, b, a » lues dans un style calculé (rgb(), rgba(), dégradés) */
  function rgbList(s) {
    var out = [];
    String(s || "").replace(/rgba?\(([^)]+)\)/g, function (_, v) {
      var p = v.split(/[ ,/]+/).filter(Boolean).map(parseFloat);
      out.push({ r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 });
      return _;
    });
    return out;
  }
  function solidBg(el) {
    var cs = getComputedStyle(el);
    var c = rgbList(cs.backgroundColor)[0];
    if (c && c.a > 0.5) return c;
    // Dégradé : la couleur du bas, celle qui touche le bloc de fin
    var g = rgbList(cs.backgroundImage).filter(function (x) {
      return x.a > 0.5;
    });
    return g.length ? g[g.length - 1] : null;
  }
  function visible(el) {
    return el.offsetHeight > 0 && getComputedStyle(el).position !== "fixed" && !/^ev-/.test(el.id || "") && el.tagName !== "SCRIPT";
  }
  /* Couleur du bas de l'invitation, juste au-dessus du bloc de fin */
  function bottomColor() {
    var start = ctaBox.previousElementSibling;
    while (start && !visible(start)) start = start.previousElementSibling;
    var chain = [];
    var cur = start;
    // Blocs pleine largeur imbriqués en fin de page (section > div > …)
    for (var d = 0; cur && d < 6; d++) {
      chain.push(cur);
      var kid = cur.lastElementChild;
      while (kid && !visible(kid)) kid = kid.previousElementSibling;
      cur = kid && kid.offsetWidth >= cur.offsetWidth * 0.9 ? kid : null;
    }
    var found = null;
    chain.forEach(function (el) {
      found = solidBg(el) || found;
    });
    if (found) return found;
    for (var up = ctaBox.parentElement; up; up = up.parentElement) {
      var c = solidBg(up);
      if (c) return c;
    }
    return { r: 20, g: 16, b: 12, a: 1 };
  }
  function lum(c) {
    var f = function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function mix(c, to, k) {
    return "rgb(" + [c.r, c.g, c.b].map(function (v, i) {
      return Math.round(v + ([to.r, to.g, to.b][i] - v) * k);
    }).join(",") + ")";
  }
  /* Couleur marquante du modèle (titres), sinon l'or Evenium */
  function accentColor(light) {
    var hs = document.querySelectorAll("h1, h2, [data-ev-type='text']");
    for (var i = 0; i < hs.length && i < 40; i++) {
      if (hs[i].closest("#ev-end-cta") || !hs[i].offsetParent) continue;
      var c = rgbList(getComputedStyle(hs[i]).color)[0];
      if (!c) continue;
      var max = Math.max(c.r, c.g, c.b), min = Math.min(c.r, c.g, c.b);
      // Assez coloré, et lisible sur le fond du bloc
      if (max - min > 50 && (light ? lum(c) < 0.45 : lum(c) > 0.18)) return "rgb(" + c.r + "," + c.g + "," + c.b + ")";
    }
    return light ? "#a8832a" : "#d4af37";
  }
  function titleFont() {
    var h = document.querySelector("h1, h2");
    var f = h && !h.closest("#ev-end-cta") ? getComputedStyle(h).fontFamily : "";
    return f ? f + ", Georgia, serif" : "Georgia, serif";
  }

  /* Haute Couture Evenium : style luxueux signature obsidienne et or impérial */
  function paintCta() {
    if (!ctaBox || !ctaBox.parentNode) return;
    var f = titleFont();
    var t = ctaBox.querySelector('[data-r="title"]');
    if (t && f) t.style.fontFamily = f;
  }
  var placeTimer = null;
  var ctaObserver = new MutationObserver(function () {
    if (placeTimer) return;
    placeTimer = setTimeout(function () {
      placeTimer = null;
      syncCtaVisibility();
      paintCta();
    }, 120);
  });

  // La modale ne s'ouvre JAMAIS automatiquement pendant la manipulation du modèle
  function syncCtaVisibility() {}

  /*
   * PROPOSITION 2 EVENIUM HAUTE COUTURE : « ZÉRO BOUTON SUR LE MODÈLE »
   * L'invitation est présentée comme une œuvre d'art pure à 100% :
   * - Zéro barre en haut : les alliances, couronnes et titres restent 100% visibles et intègres.
   * - Zéro bloc au milieu ou en bas : les lettres, princesses et interactions restent 100% libres.
   * - Seul un micro-bouton de fermeture discret ✕ flotte dans le coin supérieur gauche.
   * - Le client choisit son modèle via la modale soyeuse de sortie UNIQUEMENT s'il clique sur ✕.
   */
  var currentCtaText = null;
  var exitBtn = null;
  var exitModal = null;

  function showExitModal() {
    if (inFrame) {
      window.parent.postMessage({ type: "evenium:close-preview" }, "*");
      return;
    }
    if (document.getElementById("ev-exit-modal")) return;

    var modal = document.createElement("div");
    modal.id = "ev-exit-modal";
    modal.setAttribute(
      "style",
      "position:fixed !important;inset:0 !important;background:rgba(0,0,0,0.85) !important;backdrop-filter:blur(10px) !important;-webkit-backdrop-filter:blur(10px) !important;z-index:2147483647 !important;display:flex !important;align-items:center !important;justify-content:center !important;padding:16px !important;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif !important;animation:evFadeIn 0.2s ease !important;"
    );

    modal.innerHTML =
      '<style>@keyframes evFadeIn { from { opacity: 0; } to { opacity: 1; } }</style>' +
      '<div style="position:relative;background:#140e0a;border:1px solid rgba(212,175,55,0.45);border-radius:24px;padding:28px 22px;max-width:340px;width:100%;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.85);box-sizing:border-box;">' +
      '<button id="ev-btn-close-x" type="button" aria-label="Fermer" style="position:absolute;top:12px;right:12px;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.6);font-size:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;">✕</button>' +
      '<div style="width:48px;height:48px;margin:0 auto 12px;border-radius:50%;background:rgba(212,175,55,0.12);border:1px solid rgba(212,175,55,0.35);display:flex;align-items:center;justify-content:center;color:#d4af37;font-size:22px;">✨</div>' +
      '<h3 style="font-family:Georgia,serif;font-size:21px;font-weight:600;color:#ffffff;margin:0 0 8px;letter-spacing:-0.02em;">Ce modèle vous plaît ?</h3>' +
      '<p style="font-size:12px;color:rgba(255,255,255,0.72);line-height:1.55;margin:0 0 20px;">Choisissez-le pour le personnaliser avec vos textes, photos et musiques, ou continuez à explorer.</p>' +
      '<div style="display:flex;flex-direction:column;gap:9px;">' +
      '<button id="ev-btn-pick" type="button" style="width:100%;padding:13px;border-radius:999px;background:linear-gradient(135deg,#d4af37 0%,#f5e6b8 50%,#d4af37 100%);color:#0d0804;font-size:12px;font-weight:800;border:none;cursor:pointer;box-shadow:0 4px 18px rgba(212,175,55,0.38);transition:transform 0.15s ease;">✨ ' + ((currentCtaText && currentCtaText.primary) || "Choisir ce modèle") + '</button>' +
      '<button id="ev-btn-back" type="button" style="width:100%;padding:11px;border-radius:999px;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.85);font-size:12px;font-weight:600;border:1px solid rgba(255,255,255,0.18);cursor:pointer;transition:background 0.15s ease;">' + ((currentCtaText && currentCtaText.secondary) || "Explorer d'autres modèles") + '</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(modal);
    exitModal = modal;

    var closeXBtn = modal.querySelector("#ev-btn-close-x");
    var pickBtn = modal.querySelector("#ev-btn-pick");
    var backBtn = modal.querySelector("#ev-btn-back");

    if (closeXBtn) {
      closeXBtn.onclick = function (e) {
        e.stopPropagation();
        modal.remove();
        exitModal = null;
      };
    }

    pickBtn.onclick = function (e) {
      e.stopPropagation();
      if (currentCtaText && currentCtaText.primaryHref) {
        window.top.location.href = currentCtaText.primaryHref;
      } else {
        window.parent.postMessage({ type: "evenium:open-checkout" }, location.origin);
      }
    };

    backBtn.onclick = function (e) {
      e.stopPropagation();
      modal.remove();
      exitModal = null;
      var cat = (location.search.match(/[?&]cat=([^&#]+)/) || [])[1] || "";
      if (!cat) {
        try { cat = sessionStorage.getItem("evenium:last_category") || ""; } catch(e){}
      }
      var galleryUrl = "/invitations" + (cat && cat !== "Tous" ? "?cat=" + encodeURIComponent(decodeURIComponent(cat)) : "");
      if (currentCtaText && currentCtaText.secondaryHref) {
        window.top.location.href = currentCtaText.secondaryHref;
      } else {
        if (history.length > 1) history.back();
        else window.top.location.href = galleryUrl;
      }
    };
  }

  function cta(text) {
    var old = document.getElementById("ev-top-bar") || document.getElementById("ev-end-cta") || document.getElementById("ev-exit-btn");
    if (old) old.remove();
    currentCtaText = text;
    if (!text) return;

    // Bouton de sortie discret Haute Joaillerie (croix ✕)
    var btn = document.createElement("button");
    btn.id = "ev-exit-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "Quitter l'aperçu");
    btn.setAttribute(
      "style",
      "position:fixed !important;top:max(12px, env(safe-area-inset-top, 12px)) !important;left:12px !important;z-index:2147483647 !important;width:34px !important;height:34px !important;border-radius:50% !important;background:rgba(14,10,8,0.65) !important;backdrop-filter:blur(12px) !important;-webkit-backdrop-filter:blur(12px) !important;border:1px solid rgba(255,255,255,0.24) !important;color:#ffffff !important;display:flex !important;align-items:center !important;justify-content:center !important;cursor:pointer !important;box-shadow:0 4px 16px rgba(0,0,0,0.4) !important;transition:transform 0.15s ease !important;padding:0 !important;line-height:1 !important;"
    );

    btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

    btn.onclick = function (e) {
      e.stopPropagation();
      showExitModal();
    };

    exitBtn = btn;
    document.body.appendChild(btn);
  }

  function placeCta() {}
  function bleedCta() {}
  window.addEventListener("load", function () {
    placeCta();
    paintCta();
  });
  window.addEventListener("resize", placeCta);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(bleedCta);

  /* Polices, couleurs et tailles choisies dans « Style & polices » */
  function applyStyle(st) {
    document.querySelectorAll("link[data-ev-font]").forEach(function (n) {
      n.remove();
    });
    var tag = document.getElementById("ev-style");
    if (!tag) {
      tag = document.createElement("style");
      tag.id = "ev-style";
      document.head.appendChild(tag);
    }
    tag.textContent = (st && st.css) || "";
    ((st && st.fonts) || []).forEach(function (h) {
      var l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = h;
      l.setAttribute("data-ev-font", "");
      document.head.appendChild(l);
    });
  }

  /* Musique d'ambiance ajoutée dans le studio : démarre au premier toucher, bouton lecture / pause */
  var bg = null;
  var bgBtn = null;
  function music(values) {
    var url = values && values.__music;
    if (!url) {
      if (bg) bg.pause();
      if (bgBtn) bgBtn.style.display = "none";
      return;
    }
    var start = parseFloat(values.__music_start) || 0;
    var end = parseFloat(values.__music_end) || 0;
    if (!bg) {
      bg = new Audio();
      bg.loop = !end;
      bg.addEventListener("timeupdate", function () {
        if (bg.__end && bg.currentTime >= bg.__end) bg.currentTime = bg.__start || 0;
      });
      var startOnce = function () {
        if (bg.src && bg.paused && !bg.__userPaused) bg.play().then(sync).catch(function () { });
        document.removeEventListener("pointerdown", startOnce, true);
      };
      document.addEventListener("pointerdown", startOnce, true);
      bgBtn = document.createElement("button");
      bgBtn.type = "button";
      bgBtn.setAttribute("aria-label", "Musique");
      bgBtn.setAttribute(
        "style",
        "all:initial;position:fixed;z-index:2147483000;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));width:44px;height:44px;border-radius:50%;background:rgba(20,16,12,.75);color:#f5eee1;font:18px/44px system-ui;text-align:center;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.3)"
      );
      bgBtn.onclick = function (e) {
        e.stopPropagation();
        if (bg.paused) {
          bg.__userPaused = false;
          bg.play().catch(function () { });
        } else {
          bg.__userPaused = true;
          bg.pause();
        }
        setTimeout(sync, 50);
      };
      document.body.appendChild(bgBtn);
    }
    bg.__start = start;
    bg.__end = end > start ? end : 0;
    if (bg.getAttribute("src") !== url) {
      bg.src = url;
      bg.currentTime = start;
    }
    bgBtn.style.display = "block";
    sync();
  }
  function sync() {
    if (bgBtn && bg) bgBtn.textContent = bg.paused ? "♪" : "❚❚";
  }

  /* Studio : clic sur un élément pour le retrouver dans la liste */
  document.addEventListener(
    "click",
    function (e) {
      if (!pickMode) return;
      var el = e.target && e.target.closest ? e.target.closest("[data-ev-field]") : null;
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      window.parent.postMessage({ type: "ev:select", id: el.getAttribute("data-ev-field") }, location.origin);
    },
    true
  );

  function highlight(id) {
    var el = document.querySelector('[data-ev-field="' + id + '"]');
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    var prev = el.style.outline;
    el.style.outline = "3px solid #b8924a";
    el.style.outlineOffset = "3px";
    setTimeout(function () {
      el.style.outline = prev;
    }, 1600);
  }

  /*
   * Aucun texte ne doit déborder de l'écran : un texte agrandi (Style & polices) ou plus long que l'original
   * (prénoms saisis) est réduit juste ce qu'il faut pour tenir dans sa largeur.
   */
  function fit() {
    var vw = document.documentElement.clientWidth;
    document.querySelectorAll('[data-ev-type="text"], h1, h2, h3').forEach(function (el) {
      if (el.hasAttribute("data-ev-fit")) {
        el.style.removeProperty("zoom");
        el.removeAttribute("data-ev-fit");
      }
    });
    document.querySelectorAll('[data-ev-type="text"], h1, h2, h3').forEach(function (el) {
      if (el.closest("#ev-end-cta") || !el.offsetParent) return;
      var over = el.scrollWidth - el.clientWidth;
      var ratio = 1;
      if (el.clientWidth > 0 && over > 2) ratio = el.clientWidth / el.scrollWidth;
      // Largeur réelle du texte (lettres) comparée à celle de l'écran, marge comprise
      var range = document.createRange();
      range.selectNodeContents(el);
      var text = range.getBoundingClientRect();
      if (text.width > 0) {
        var margin = 8;
        if (getComputedStyle(el).textAlign === "center") {
          // Texte centré dans sa boîte : il rétrécit autour du centre de la boîte
          var box = el.getBoundingClientRect();
          var center = (box.left + box.right) / 2;
          var maxHalf = Math.min(center - margin, vw - margin - center);
          if (text.width / 2 > maxHalf && maxHalf > 0) ratio = Math.min(ratio, maxHalf / (text.width / 2));
        } else if (text.right > vw - margin) {
          ratio = Math.min(ratio, Math.max(0.1, vw - margin - text.left) / text.width);
        }
      }
      if (ratio < 0.995) {
        var zoom = parseFloat(getComputedStyle(el).zoom) || 1;
        el.style.zoom = String(Math.max(0.4, zoom * ratio * 0.98));
        el.setAttribute("data-ev-fit", "");
      }
    });
  }
  var fitTimer = null;
  function scheduleFit() {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fit, 60);
  }
  window.addEventListener("resize", scheduleFit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleFit);
  window.addEventListener("load", scheduleFit);

  window.addEventListener("message", function (e) {
    if (e.origin !== location.origin || !e.data) return;
    var m = e.data;
    if (m.type === "ev:content") {
      pickMode = !!m.pick;
      applyStyle(m.style);
      apply(m.values);
      structure(m.values);
      music(m.values);
      cta(m.cta || null);
      scheduleFit();
    } else if (m.type === "ev:focus") highlight(m.id);
  });

  findSections();
  // ?demo=1 : démo publique affichée dans le cadre téléphone de la page d'aperçu (ordinateur)
  var demo = /[?&]demo=1(&|$)/.test(location.search);
  var hideCtaParam = /[?&]hideCta=1(&|$)/.test(location.search) || /[?&]hide_cta=1(&|$)/.test(location.search);
  if (inFrame && !demo) {
    window.parent.postMessage({ type: "ev:ready" }, location.origin);
  } else if (!hideCtaParam) {
    if (slug) {
      // Démo ouverte seule : choisir ce modèle (création d'événement) ou revenir aux autres modèles.
      // Affiché d'emblée, même si les valeurs publiées ne se chargent pas : le client n'est jamais sans issue.
      var catMatch = (location.search.match(/[?&]cat=([^&#]+)/) || [])[1];
      if (!catMatch) {
        try { catMatch = sessionStorage.getItem("evenium:last_category"); } catch (e) {}
      }
      var catQuery = catMatch && catMatch !== "Tous" ? "?cat=" + encodeURIComponent(decodeURIComponent(catMatch)) : "";
      var catParam = catMatch && catMatch !== "Tous" ? "&cat=" + encodeURIComponent(decodeURIComponent(catMatch)) : "";
      cta({
        kicker: "Aperçu du modèle",
        primary: "Choisir ce modèle",
        secondary: "Retour aux modèles",
        primaryHref: "/create?model=custom:" + slug + catParam,
        secondaryHref: "/invitations" + catQuery,
      });
      // Démo publique : valeurs publiées par l'admin
      fetch("/api/custom-models/" + slug, { cache: "no-store" })
        .then(function (r) {
          return r.ok ? r.json() : null;
        })
        .then(function (d) {
          if (d && d.values) {
            applyStyle(d.style);
            apply(d.values);
            structure(d.values);
            music(d.values);
            if (d.name && ctaBox) {
              var k = ctaBox.querySelector('[data-r="kicker"]');
              if (k) k.textContent = d.name;
            }
            placeCta();
            scheduleFit();
          }
        })
        .catch(function () { });
    }
  }
})();
