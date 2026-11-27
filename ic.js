/* Intellekt-klub: soglasie na cookie, Yandex Metrika, PostHog, otslezhivanie klikov, video po klikam.
   Google-teg stoit v <head> kazhdoy stranicy (Consent Mode v2, po umolchaniyu "denied"). */
(function () {
  'use strict';
  var CFG = {
    ym: 114696767,
    ymWebvisor: false,                       // zapis sessiy Metriki: vyklyuchena
    ph: 'phc_xSD5qD85PctombCpnxgkJmmaVEZGm6UiFJeuENWLj9zf',
    phHost: 'https://us.i.posthog.com',
    phLangs: [],                     // na kakikh yazykovykh razdelakh gruzit' PostHog (ubrat' 'ru' - otklyuchit PostHog na /ru/)
    adsRegister: ''                          // 'AW-18593159589/XXXXXXXX' - metka konversii "Perekhod na registratsiyu"
  };
  var KEY = 'ic_consent_v1';
  var lang = 'ru';
  var TXT = {
    ru: {
      label: 'Настройки cookie',
      text: 'Мы используем Google и Яндекс Метрику (cookie, IP-адрес, действия на сайте) для статистики и измерения рекламы. Без вашего согласия cookie не записываются. Подробнее:',
      more: 'Политика', ok: 'Принять', no: 'Отклонить'
    }
  }[lang];

  var on = false;
  function gtagSafe() { if (typeof window.gtag === 'function') window.gtag.apply(null, arguments); }
  function getC() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setC(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadYM() {
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
      k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=' + CFG.ym, 'ym');
    window.ym(CFG.ym, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: CFG.ymWebvisor, referrer: document.referrer, url: location.href });
  }

  function loadPH() {
    !function (t, e) { var o, n, p, r; e.__SV || (window.posthog = e, e._i = [], e.init = function (i, s, a) { function g(t, e) { var o = e.split("."); 2 == o.length && (t = t[o[0]], e = o[1]), t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; } (p = t.createElement("script")).type = "text/javascript", p.crossOrigin = "anonymous", p.async = !0, p.src = s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js", (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r); var u = e; for (void 0 !== a ? u = e[a] = [] : a = "posthog", u.people = u.people || [], u.toString = function (t) { var e = "posthog"; return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e; }, u.people.toString = function () { return u.toString(1) + ".people (stub)"; }, o = "init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "), n = 0; n < o.length; n++) g(u, o[n]); e._i.push([i, s, a]); }, e.__SV = 1); }(document, window.posthog || []);
    window.posthog.init(CFG.ph, {
      api_host: CFG.phHost,
      person_profiles: 'identified_only',
      disable_session_recording: true,   // zapis sessiy vyklyuchena
      autocapture: false,                // klik-sobytiya shlyom sami (nizhe)
      capture_pageview: true,
      respect_dnt: true
    });
    window.posthog.register({ site_lang: lang });
  }

  function enable() {
    if (on) return; on = true;
    gtagSafe('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
    loadYM(); if (CFG.phLangs.indexOf(lang) > -1) loadPH();
  }

  function wipe() {
    try {
      Object.keys(localStorage).forEach(function (k) { if (k.indexOf('ph_') === 0 || k.indexOf('_ym') === 0) localStorage.removeItem(k); });
    } catch (e) {}
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (/^(_ym|_ga|_gcl|_gid|ph_|_fbp|yabs|yandex|i$|ymex|yuidss|_yasc)/.test(n)) {
        document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + location.hostname;
      }
    });
  }

  function choose(v) {
    var was = getC();
    setC(v);
    var b = document.getElementById('ic-cb'); if (b) b.parentNode.removeChild(b);
    if (v === 'granted') { enable(); }
    else {
      gtagSafe('consent', 'update', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
      if (on || was === 'granted') { wipe(); location.reload(); }
    }
  }

  function banner() {
    if (document.getElementById('ic-cb')) return;
    var pl = document.querySelector('a[data-privacy]');
    var d = document.createElement('div');
    d.id = 'ic-cb'; d.className = 'cb'; d.setAttribute('role', 'region'); d.setAttribute('aria-label', TXT.label);
    var cl = document.querySelector('a[data-consent]');
    d.innerHTML = '<p>' + TXT.text + (pl ? ' <a href="' + pl.getAttribute('href') + '">' + TXT.more + '</a>' : '') + (pl && cl ? ' · <a href="' + cl.getAttribute('href') + '">' + TXT.consent + '</a>' : '') + '</p>' +
      '<div class="cb-a"><button type="button" class="btn sm" data-c="granted">' + TXT.ok + '</button>' +
      '<button type="button" class="btn sm" data-c="denied">' + TXT.no + '</button></div>';
    document.body.appendChild(d);
  }

  function typeOf(a) {
    if (a.closest('header')) return 'header';
    if (a.closest('.price')) return 'price';
    if (a.closest('.cta')) return 'cta';
    if (a.closest('footer')) return 'footer';
    return 'inline';
  }

  function track(name, type, extra) {
    if (!on) return;
    var p = { type: type, page_path: location.pathname, site_lang: lang };
    for (var k in extra) p[k] = extra[k];
    if (typeof window.ym === 'function') window.ym(CFG.ym, 'reachGoal', name, { type: type, path: location.pathname });
    if (window.posthog && window.posthog.capture) window.posthog.capture(name, p);
    gtagSafe('event', name, p);
    if (name === 'register_click' && CFG.adsRegister) gtagSafe('event', 'conversion', { send_to: CFG.adsRegister });
  }

  var GOALS = { 'account.superjump.com': 'register_click', 'getgosmile.io': 'gosmile_click', 't.me': 'telegram_click', 'cp.puzzlebot.top': 'bot_click' };

  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var c = t.closest('[data-c]');
    if (c && c.closest('#ic-cb')) { choose(c.getAttribute('data-c')); return; }
    if (t.closest('[data-cookie]')) { e.preventDefault(); banner(); return; }
    var vb = t.closest('.vid-b');
    if (vb) {
      var f = vb.closest('.vid'), id = f.getAttribute('data-yt');
      var i = document.createElement('iframe');
      i.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1';
      i.title = f.getAttribute('data-title') || 'Video';
      i.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      i.setAttribute('allowfullscreen', ''); i.referrerPolicy = 'strict-origin-when-cross-origin';
      var box = f.querySelector('.vf'); box.innerHTML = ''; box.appendChild(i);
      track('video_play', 'video', { video_id: id });
      return;
    }
    var a = t.closest('a[href]'); if (!a) return;
    var h; try { h = new URL(a.href, location.href); } catch (x) { return; }
    var g = GOALS[h.hostname]; if (!g) return;
    track(g, typeOf(a), { link_host: h.hostname });
  });

  var s = getC();
  if (s === 'granted') enable(); else if (s !== 'denied') banner();
})();
