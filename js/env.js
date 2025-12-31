// Lightweight runtime .env loader for static pages
(function () {
  const ENV = {};

  function parseEnv(text) {
    const lines = text.split(/\r?\n/);
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      ENV[key] = val;
    }
  }

  function finalize() {
    window.ENV = Object.assign({}, window.ENV || {}, ENV);
    document.dispatchEvent(new Event('envLoaded'));
  }

  async function loadFromApi() {
    try {
      const res = await fetch('/api/env');
      if (!res.ok) return;
      const data = await res.json();
      Object.assign(ENV, data || {});
    } catch (_) {}
  }

  async function loadFromDotEnv() {
    try {
      const res = await fetch('./.env');
      const text = res.ok ? await res.text() : '';
      if (text) parseEnv(text);
    } catch (_) {}
  }

  (async function init() {
    await loadFromApi();
    const hasAnyKey = ENV.OPENWEATHER_API_KEY || ENV.WEATHER_API_KEY || ENV.GEMINI_API_KEY;
    if (!hasAnyKey) {
      await loadFromDotEnv();
    }
    finalize();
  })();
})();