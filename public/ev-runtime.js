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
      else if (type === "audio") {
        if (el.getAttribute("src") !== v) {
          el.setAttribute("src", v);
          var media = el.tagName === "SOURCE" ? el.parentElement : el;
          if (media && media.load) media.load();
        }
      }
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
    primary.onclick = function () {
      window.parent.postMessage({ type: "evenium:open-checkout" }, location.origin);
    };
    secondary.onclick = function () {
      window.parent.postMessage({ type: "evenium:close-preview" }, location.origin);
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

  window.addEventListener("message", function (e) {
    if (e.origin !== location.origin || !e.data) return;
    var m = e.data;
    if (m.type === "ev:content") {
      pickMode = !!m.pick;
      applyStyle(m.style);
      apply(m.values);
      music(m.values);
      cta(m.cta || null);
    } else if (m.type === "ev:focus") highlight(m.id);
  });

  if (inFrame) {
    window.parent.postMessage({ type: "ev:ready" }, location.origin);
  } else {
    /* Sur écran d'ordinateur (hors iframe), centrer l'invitation dans un format smartphone */
    var desktopStyle = document.createElement("style");
    desktopStyle.id = "ev-desktop-mobile-style";
    desktopStyle.textContent = [
      "@media (min-width: 641px) {",
      "  html {",
      "    background-color: #0d0a08 !important;",
      "    min-height: 100vh !important;",
      "    display: flex !important;",
      "    justify-content: center !important;",
      "    align-items: center !important;",
      "    padding: 32px 16px !important;",
      "    box-sizing: border-box !important;",
      "  }",
      "  body {",
      "    width: 100% !important;",
      "    max-width: 460px !important;",
      "    min-height: 90vh !important;",
      "    max-height: 940px !important;",
      "    margin: auto !important;",
      "    border-radius: 42px !important;",
      "    box-shadow: 0 25px 90px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 0 7px #1c1714 !important;",
      "    overflow-x: hidden !important;",
      "    overflow-y: auto !important;",
      "    position: relative !important;",
      "    background-color: #fff;",
      "  }",
      "}"
    ].join("\n");
    document.head.appendChild(desktopStyle);

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
            music(d.values);
          }
        })
        .catch(function () {});
    }
  }
})();
