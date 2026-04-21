export function getRideWebPage(rideId: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RiderDJ – Add Songs</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #0f0f0f;
      color: #f0f0f0;
      min-height: 100vh;
      padding: 20px 16px 40px;
    }

    h1 { font-size: 22px; margin-bottom: 4px; }
    .ride-code { font-size: 13px; color: #888; margin-bottom: 24px; }

    section { margin-bottom: 28px; }
    h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 12px; }

    /* Search */
    .search-row { display: flex; gap: 8px; }
    input[type="text"] {
      flex: 1;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid #333;
      background: #1a1a1a;
      color: #f0f0f0;
      font-size: 15px;
      outline: none;
    }
    input[type="text"]:focus { border-color: #1db954; }
    button {
      padding: 10px 16px;
      border-radius: 8px;
      border: none;
      background: #1db954;
      color: #000;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      white-space: nowrap;
    }
    button:active { opacity: 0.8; }
    button:disabled { opacity: 0.4; cursor: default; }

    /* Track list */
    .track-list { display: flex; flex-direction: column; gap: 2px; }
    .track {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-radius: 8px;
      background: #1a1a1a;
      gap: 12px;
    }
    .track-info { flex: 1; min-width: 0; }
    .track-title { font-size: 15px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .track-artist { font-size: 13px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .track .add-btn {
      padding: 6px 14px;
      font-size: 13px;
      flex-shrink: 0;
    }
    .track .add-btn.added { background: #333; color: #888; cursor: default; }

    /* Queue */
    .queue-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      background: #1a1a1a;
      margin-bottom: 2px;
    }
    .queue-num { font-size: 13px; color: #555; width: 20px; flex-shrink: 0; }
    .queue-info { flex: 1; min-width: 0; }
    .queue-title { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .queue-artist { font-size: 12px; color: #888; }
    .empty { color: #555; font-size: 14px; padding: 8px 0; }

    /* Status */
    .status-dot {
      display: inline-block;
      width: 8px; height: 8px;
      border-radius: 50%;
      margin-right: 6px;
      background: #555;
    }
    .status-dot.connected { background: #1db954; }
    .status-bar { font-size: 12px; color: #666; margin-bottom: 20px; display: flex; align-items: center; }

    .toast {
      position: fixed;
      bottom: 24px; left: 50%;
      transform: translateX(-50%);
      background: #1db954;
      color: #000;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 14px;
      opacity: 0;
      transition: opacity 0.2s;
      pointer-events: none;
    }
    .toast.show { opacity: 1; }
  </style>
</head>
<body>
  <h1>🎵 RiderDJ</h1>
  <p class="ride-code">Ride: ${rideId}</p>

  <div class="status-bar">
    <span class="status-dot" id="dot"></span>
    <span id="status-text">Connecting...</span>
  </div>

  <section>
    <h2>Search Spotify</h2>
    <div class="search-row">
      <input type="text" id="search-input" placeholder="Search for a song..." />
      <button id="search-btn" onclick="handleSearch()">Search</button>
    </div>
    <div class="track-list" id="results" style="margin-top: 10px;"></div>
  </section>

  <section>
    <h2>Queue</h2>
    <div id="queue-list"><p class="empty">No songs yet</p></div>
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
      document.getElementById("status-text").textContent = connected ? "Connected" : "Reconnecting...";
    }

    // ── Queue ─────────────────────────────────────────────────
    async function loadQueue() {
      try {
        const res = await fetch(BASE + "/rides/" + RIDE_ID + "/queue");
        const data = await res.json();
        const songs = Array.isArray(data) ? data : data.songs || [];
        renderQueue(songs);
      } catch {}
    }

    function renderQueue(songs) {
      const el = document.getElementById("queue-list");
      if (!songs.length) { el.innerHTML = '<p class="empty">No songs yet</p>'; return; }
      el.innerHTML = songs.map((s, i) => \`
        <div class="queue-item">
          <span class="queue-num">\${i + 1}</span>
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
        btn.textContent = "Search";
      }
    }

    function renderResults(tracks) {
      const el = document.getElementById("results");
      if (!tracks.length) { el.innerHTML = '<p class="empty" style="margin-top:8px">No results</p>'; return; }
      el.innerHTML = tracks.map(t => \`
        <div class="track" id="track-\${esc(t.id)}">
          <div class="track-info">
            <div class="track-title">\${esc(t.title)}</div>
            <div class="track-artist">\${esc(t.artist)}</div>
          </div>
          <button class="add-btn" onclick="addSong('\${esc(t.id)}', this)">Add</button>
        </div>
      \`).join("");
    }

    // ── Add song ──────────────────────────────────────────────
    async function addSong(trackId, btn) {
      btn.disabled = true;
      btn.textContent = "...";

      try {
        const res = await fetch(BASE + "/rides/" + RIDE_ID + "/songs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackId }),
        });

        if (!res.ok) throw new Error();
        btn.textContent = "Added";
        btn.className = "add-btn added";
        showToast("Song added!");
      } catch {
        btn.disabled = false;
        btn.textContent = "Add";
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

    loadQueue();
    connect();
  </script>
</body>
</html>`;
}
