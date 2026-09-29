'use strict';
// Eldenghost – Plattform-Schicht: Browser/PWA vs. Capacitor (Android/iOS)
(function (G) {
  const Cap = window.Capacitor;
  G.native = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  const plugin = name => {
    if (!G.native) return null;
    try { return (Cap.Plugins && Cap.Plugins[name]) || (Cap.registerPlugin && Cap.registerPlugin(name)) || null; } catch (e) { return null; }
  };
  const Prefs = plugin('Preferences'), Haptics = plugin('Haptics');

  // Speicher: synchron über localStorage (Cache), zusätzlich dauerhaft in Capacitor Preferences.
  const KEYS = [G.SAVE_KEY, 'eldenghost.sound'];
  G.Store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) {
      try { localStorage.setItem(k, v); } catch (e) {}
      if (Prefs) Prefs.set({ key: k, value: String(v) }).catch(() => {});
    },
    // Beim Start: Preferences -> localStorage übernehmen (native Daten gewinnen)
    ready: (async () => {
      if (!Prefs) return;
      for (const k of KEYS) {
        try {
          const r = await Prefs.get({ key: k });
          if (r && r.value != null) localStorage.setItem(k, r.value);
          else { const l = localStorage.getItem(k); if (l != null) await Prefs.set({ key: k, value: l }); }
        } catch (e) { /* Fallback: nur localStorage */ }
      }
    })()
  };

  G.haptic = (ms = 8) => {
    if (Haptics) { Haptics.impact({ style: 'LIGHT' }).catch(() => {}); return; }
    if (navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {}
  };

  if (G.native) {
    const SysB = Cap.SystemBars || plugin('SystemBars'), SB = plugin('StatusBar');
    if (SysB && SysB.setStyle) SysB.setStyle({ style: 'DARK' }).catch(() => {});
    else if (SB) { SB.setStyle({ style: 'DARK' }).catch(() => {}); SB.setBackgroundColor({ color: '#0a0816' }).catch(() => {}); }
    const Splash = plugin('SplashScreen');
    if (Splash) window.addEventListener('load', () => setTimeout(() => Splash.hide().catch(() => {}), 300));
    const App = plugin('App');
    // Android-Zurücktaste = B
    if (App) App.addListener('backButton', () => G.Input && G.Input.dispatch('B'));
  } else if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW', e)));
  }
})(window.G);
