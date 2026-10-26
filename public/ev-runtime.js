/*
 * Evenium — page d'un modèle importé (studio des modèles).
 * Les éléments modifiables portent data-ev-field (+ data-ev-type : text, image, bg, audio).
 * Les valeurs arrivent par message du site (studio, création, invitation), sinon celles publiées.
 */
(function () {
  if (window.__evRuntime) return;
  window.__evRuntime = true;

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
          if (media && media.autoplay && media.play) media.play().catch(function () {});
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

  /* Bloc de fin (création d'événement, studio admin) : boutons renvoyés au site */
  function cta(text) {
    var old = document.getElementById("ev-end-cta");
    if (old) old.remove();
    if (!text) return;
    var box = document.createElement("section");
    box.id = "ev-end-cta";
    box.setAttribute(
      "style",
      "all:initial;display:block;box-sizing:border-box;width:100%;padding:48px 16px 64px;background:#14100c;font-family:system-ui,-apple-system,sans-serif;text-align:center;color:#f5eee1"
    );
    box.innerHTML =
      '<div style="max-width:420px;margin:0 auto">' +
      '<p style="margin:0 0 8px;font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:#d4af37"></p>' +
      '<h3 style="margin:0 0 10px;font-family:Georgia,serif;font-size:26px;font-weight:600;color:#fff"></h3>' +
      '<p style="margin:0 0 24px;font-size:14px;line-height:1.5;color:#cfc6b8"></p>' +
      '<button data-a="primary" style="display:block;width:100%;margin:0 0 10px;padding:14px;border:0;border-radius:999px;background:linear-gradient(90deg,#d4af37,#f3e5ab,#d4af37);color:#000;font-weight:800;font-size:15px;cursor:pointer"></button>' +
      '<button data-a="secondary" style="display:block;width:100%;padding:12px;border:1px solid rgba(255,255,255,.25);border-radius:999px;background:transparent;color:#fff;font-weight:600;font-size:14px;cursor:pointer"></button>' +
      "</div>";
    var ps = box.querySelectorAll("p");
    ps[0].textContent = text.kicker || "";
    box.querySelector("h3").textContent = text.title || "";
    ps[1].textContent = text.desc || "";
    var primary = box.querySelector('[data-a="primary"]');
    var secondary = box.querySelector('[data-a="secondary"]');
    primary.textContent = text.primary || "Valider";
    secondary.textContent = text.secondary || "Retour";
    // Dans le site (aperçu) : message à la page ; démo ouverte seule : liens vers la création et la galerie
    primary.onclick = function () {
      if (text.primaryHref) location.href = text.primaryHref;
      else window.parent.postMessage({ type: "evenium:open-checkout" }, location.origin);
    };
    secondary.onclick = function () {
      if (text.secondaryHref) location.href = text.secondaryHref;
      else window.parent.postMessage({ type: "evenium:close-preview" }, location.origin);
    };
    document.body.appendChild(box);
  }

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
        if (bg.src && bg.paused && !bg.__userPaused) bg.play().then(sync).catch(function () {});
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
          bg.play().catch(function () {});
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
  if (inFrame) {
    window.parent.postMessage({ type: "ev:ready" }, location.origin);
  } else {
    if (slug) {
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
            // Démo ouverte seule : choisir ce modèle (création d'événement) ou revenir aux autres modèles
            cta({
              kicker: "Aperçu du modèle",
              title: "Ce modèle vous plaît ?",
              desc: "Choisissez-le pour le personnaliser avec vos textes, photos et musique, puis validez votre événement.",
              primary: "Choisir ce modèle",
              secondary: "Retour aux modèles",
              primaryHref: "/create?model=custom:" + slug,
              secondaryHref: "/invitations",
            });
            scheduleFit();
          }
        })
        .catch(function () {});
    }
  }
})();
