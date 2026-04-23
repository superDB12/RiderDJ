export function getRideWebPage(rideId: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RiderDJ</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:         #07060f;
      --surface:    #110d24;
      --surface2:   #1a1535;
      --border:     #2a2050;
      --purple:     #7c3aed;
      --purple-lt:  #a855f7;
      --pink:       #ec4899;
      --cyan:       #06b6d4;
      --green:      #1db954;
      --text:       #f0eaff;
      --text-sec:   #8b7aa8;
      --text-muted: #4b4268;
      --error:      #f87171;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 20px 16px 60px;
      max-width: 480px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .header { margin-bottom: 20px; }
    .logo { font-size: 26px; font-weight: 900; letter-spacing: 2px; }
    .tagline { font-size: 11px; letter-spacing: 4px; color: var(--cyan); font-weight: 600; margin-top: 2px; }

    /* ── Status bar ── */
    .status-bar {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; color: var(--text-muted);
      margin-bottom: 20px;
    }
    .status-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--text-muted); flex-shrink: 0;
    }
    .status-dot.connected { background: var(--green); box-shadow: 0 0 6px var(--green); }

    /* ── Section labels ── */
    .label {
      font-size: 16px; letter-spacing: 1px; color: var(--text);
      font-weight: 700; margin-bottom: 10px;
    }

    section { margin-bottom: 28px; }

    /* ── Now Playing ── */
    .now-playing {
      display: flex; align-items: center; gap: 12px;
      padding: 12px; border-radius: 14px;
      background: var(--surface); border: 1px solid var(--pink);
      box-shadow: 0 0 12px rgba(236,72,153,0.35);
      margin-bottom: 20px;
    }
    .now-playing.hidden { display: none; }
    .np-art {
      width: 52px; height: 52px; border-radius: 8px;
      object-fit: cover; flex-shrink: 0;
      background: var(--surface2);
    }
    .np-info { flex: 1; min-width: 0; }
    .np-label {
      font-size: 10px; letter-spacing: 2px; color: var(--pink);
      font-weight: 700; margin-bottom: 3px;
    }
    .np-title { font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .np-artist { font-size: 12px; color: var(--text-sec); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* ── Queue ── */
    .queue-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 10px;
      background: var(--surface); border: 1px solid var(--border);
      margin-bottom: 6px;
    }
    .queue-item.now-playing {
      border-color: var(--purple-lt);
      box-shadow: 0 0 10px rgba(168,85,247,0.4);
    }
    .queue-num { font-size: 13px; color: var(--text-muted); width: 20px; flex-shrink: 0; text-align: center; }
    .queue-num.active { color: var(--purple-lt); font-size: 14px; }
    .queue-info { flex: 1; min-width: 0; }
    .queue-title { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .queue-artist { font-size: 12px; color: var(--text-sec); margin-top: 2px; }
    .empty { color: var(--text-muted); font-size: 14px; padding: 8px 0; text-align: center; }

    /* ── Search ── */
    .search-row { display: flex; gap: 8px; margin-bottom: 12px; }
    input[type="text"] {
      flex: 1; padding: 12px 14px; border-radius: 12px;
      border: 1px solid var(--border); background: var(--surface);
      color: var(--text); font-size: 15px; outline: none;
    }
    input[type="text"]:focus { border-color: var(--purple); }

    .btn-search {
      padding: 12px 18px; border-radius: 12px; border: none;
      background: var(--pink); color: #fff; font-weight: 700;
      font-size: 15px; cursor: pointer; white-space: nowrap;
      box-shadow: 0 0 12px rgba(236,72,153,0.5);
    }
    .btn-search:disabled { opacity: 0.4; cursor: default; }
    .btn-search:active { opacity: 0.8; }

    /* ── Clear button ── */
    .clear-btn {
      background: none; border: none; color: var(--text-muted);
      font-size: 13px; cursor: pointer; padding: 2px 0;
      display: block; margin-left: auto; margin-bottom: 8px;
    }
    .clear-btn:hover { color: var(--text-sec); }

    /* ── Results ── */
    .track {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 12px; border-radius: 10px;
      background: var(--surface); border: 1px solid var(--border);
      gap: 12px; margin-bottom: 6px;
      cursor: pointer;
    }
    .track:active { opacity: 0.75; }
    .track-info { flex: 1; min-width: 0; }
    .track-title { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .track-artist { font-size: 12px; color: var(--text-sec); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .add-btn {
      width: 32px; height: 32px; border-radius: 50%; border: none;
      background: var(--purple); color: #fff;
      font-size: 20px; font-weight: 700; cursor: pointer; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 10px rgba(124,58,237,0.6);
      line-height: 1;
    }
    .add-btn.added { background: var(--surface2); color: var(--cyan); font-size: 14px; box-shadow: none; }

    /* ── Toast ── */
    .toast {
      position: fixed; bottom: 24px; left: 50%;
      transform: translateX(-50%);
      background: var(--purple); color: #fff;
      font-weight: 600; padding: 10px 22px;
      border-radius: 20px; font-size: 14px;
      opacity: 0; transition: opacity 0.2s; pointer-events: none;
      white-space: nowrap;
    }
    .toast.show { opacity: 1; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">RiderDJ</div>
    <div class="tagline">YOUR RIDE. YOUR MUSIC.</div>
  </div>

  <div class="status-bar">
    <span class="status-dot" id="dot"></span>
    <span id="status-text">Connecting...</span>
  </div>

  <!-- Now Playing -->
  <div class="now-playing hidden" id="now-playing">
    <img class="np-art" id="np-art" src="" alt="" />
    <div class="np-info">
      <div class="np-label" id="np-label">▶  NOW PLAYING</div>
      <div class="np-title" id="np-title"></div>
      <div class="np-artist" id="np-artist"></div>
    </div>
  </div>

  <!-- Queue -->
  <section>
    <div class="label">Queue</div>
    <div id="queue-list"><p class="empty">No songs yet</p></div>
  </section>

  <!-- Search -->
  <section>
    <div class="label">Search Spotify</div>
    <div class="search-row">
      <input type="text" id="search-input" placeholder="Search for a song by title or artist..." />
      <button class="btn-search" id="search-btn" onclick="handleSearch()">Go</button>
    </div>
    <div id="results"></div>
  </section>

  <div class="toast" id="toast"></div>

  <script>
    const RIDE_ID = ${JSON.stringify(rideId)};
    const BASE = window.location.origin;
    const WS_BASE = BASE.replace("https", "wss").replace("http", "ws");

    // ── WebSocket ─────────────────────────────────────────────
    let ws, heartbeat, pongTimeout, reconnectTimer;

    function connect() {
      ws = new WebSocket(WS_BASE + "/rides/" + RIDE_ID + "/ws");

      ws.onopen = () => {
        setStatus(true);
        schedulePing();
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "pong") { clearTimeout(pongTimeout); return; }
          if (data.songs) renderQueue(data.songs);
        } catch {}
      };

      ws.onclose = () => {
        setStatus(false);
        clearInterval(heartbeat);
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(connect, 2000);
      };

      ws.onerror = () => ws.close();
    }

    function schedulePing() {
      clearInterval(heartbeat);
      heartbeat = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) return;
        pongTimeout = setTimeout(() => ws.close(), 10000);
        ws.send(JSON.stringify({ type: "ping" }));
      }, 25000);
    }

    function setStatus(connected) {
      document.getElementById("dot").className = "status-dot" + (connected ? " connected" : "");
      document.getElementById("status-text").textContent = connected ? "Connected · " + RIDE_ID : "Reconnecting...";
    }

    // ── Queue ─────────────────────────────────────────────────
    async function loadQueue() {
      try {
        const res = await fetch(BASE + "/rides/" + RIDE_ID + "/queue");
        const data = await res.json();
        renderQueue(Array.isArray(data) ? data : data.songs || []);
      } catch {}
    }

    function renderQueue(songs) {
      const el = document.getElementById("queue-list");
      if (!songs.length) { el.innerHTML = '<p class="empty">No songs yet — be the first to add one!</p>'; return; }
      el.innerHTML = songs.map((s, i) => \`
        <div class="queue-item\${i === 0 ? " now-playing" : ""}">
          <span class="queue-num\${i === 0 ? " active" : ""}">\${i === 0 ? "▶" : i + 1}</span>
          <div class="queue-info">
            <div class="queue-title">\${esc(s.title)}</div>
            <div class="queue-artist">\${esc(s.artist)}</div>
          </div>
        </div>
      \`).join("");
    }

    // ── Search ────────────────────────────────────────────────
    async function handleSearch() {
      const q = document.getElementById("search-input").value.trim();
      if (!q) return;

      const btn = document.getElementById("search-btn");
      btn.disabled = true;
      btn.textContent = "...";

      try {
        const res = await fetch(BASE + "/spotify/search?rideId=" + encodeURIComponent(RIDE_ID) + "&q=" + encodeURIComponent(q));
        const data = await res.json();
        renderResults(data.tracks || []);
      } catch {
        showToast("Search failed");
      } finally {
        btn.disabled = false;
        btn.textContent = "Go";
      }
    }

    function renderResults(tracks) {
      const el = document.getElementById("results");
      if (!tracks.length) { el.innerHTML = '<p class="empty">No results</p>'; return; }
      el.innerHTML =
        \`<button class="clear-btn" onclick="clearResults()">✕  Clear results</button>\` +
        tracks.map(t => \`
          <div class="track" id="card-\${esc(t.id)}" onclick="addSong('\${esc(t.id)}')">
            <div class="track-info">
              <div class="track-title">\${esc(t.title)}</div>
              <div class="track-artist">\${esc(t.artist)}</div>
            </div>
            <div class="add-btn" id="add-\${esc(t.id)}">+</div>
          </div>
        \`).join("");
    }

    function clearResults() {
      document.getElementById("results").innerHTML = "";
      document.getElementById("search-input").value = "";
    }

    // ── Add song ──────────────────────────────────────────────
    const addingIds = new Set();

    async function addSong(trackId) {
      if (addingIds.has(trackId)) return;
      addingIds.add(trackId);

      const card = document.getElementById("card-" + trackId);
      const indicator = document.getElementById("add-" + trackId);
      if (card) card.style.pointerEvents = "none";
      if (indicator) indicator.textContent = "...";

      try {
        const res = await fetch(BASE + "/rides/" + RIDE_ID + "/songs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackId }),
        });

        if (!res.ok) {
          let msg = "Failed to add song";
          try { const j = await res.json(); if (j.error) msg = j.error; } catch {}
          showToast(msg);
          if (indicator) indicator.textContent = msg === "Song already in queue" ? "!" : "+";
          if (card) card.style.pointerEvents = "";
          addingIds.delete(trackId);
          return;
        }

        if (indicator) { indicator.textContent = "✓"; indicator.className = "add-btn added"; }
        showToast("Song added!");

        setTimeout(() => {
          if (indicator) { indicator.textContent = "+"; indicator.className = "add-btn"; }
          if (card) card.style.pointerEvents = "";
          addingIds.delete(trackId);
        }, 2000);
      } catch {
        if (indicator) indicator.textContent = "+";
        if (card) card.style.pointerEvents = "";
        addingIds.delete(trackId);
        showToast("Failed to add song");
      }
    }

    // ── Helpers ───────────────────────────────────────────────
    function esc(str) {
      return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }

    let toastTimer;
    function showToast(msg) {
      const el = document.getElementById("toast");
      el.textContent = msg;
      el.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => el.classList.remove("show"), 2000);
    }

    document.getElementById("search-input").addEventListener("keydown", e => {
      if (e.key === "Enter") handleSearch();
    });

    // ── Now Playing ──────────────────────────────────────────
    async function loadNowPlaying() {
      try {
        const res = await fetch(BASE + "/rides/" + RIDE_ID + "/now-playing");
        const data = await res.json();
        const el = document.getElementById("now-playing");
        if (!data || !data.title) { el.classList.add("hidden"); return; }
        document.getElementById("np-title").textContent = data.title;
        document.getElementById("np-artist").textContent = data.artist;
        document.getElementById("np-label").textContent = data.isPlaying ? "▶  NOW PLAYING" : "⏸  PAUSED";
        const art = document.getElementById("np-art");
        if (data.albumArt) { art.src = data.albumArt; art.style.display = ""; }
        else { art.style.display = "none"; }
        el.classList.remove("hidden");
      } catch {}
    }

    loadNowPlaying();
    setInterval(loadNowPlaying, 10000);

    loadQueue();
    connect();
  </script>
</body>
</html>`;
}
