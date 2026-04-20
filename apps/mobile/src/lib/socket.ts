let ws: WebSocket | null = null;
let currentRideId: string | null = null;
let isFirstConnect = true;

let heartbeatInterval: any = null;
let reconnectTimeout: any = null;
let pongTimeout: any = null;

const BASE_URL = "https://riderdj-production.up.railway.app";
const WS_BASE = BASE_URL.replace("https", "wss");

const listeners: ((data: any) => void)[] = [];
const reconnectListeners: (() => void)[] = [];

export function connectSocket(rideId: string) {
  // If already connected to the same ride, do nothing
  if (ws && ws.readyState === WebSocket.OPEN && currentRideId === rideId) {
    return;
  }

  currentRideId = rideId;

  function connect() {
    console.log("🔌 Connecting WebSocket for ride:", rideId);

    ws = new WebSocket(`${WS_BASE}/rides/${rideId}/ws`);

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      schedulePing();
      if (!isFirstConnect) {
        reconnectListeners.forEach((cb) => cb());
      }
      isFirstConnect = false;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        listeners.forEach((cb) => cb(data));
      } catch (err) {
        console.error("Invalid WS message:", event.data);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket disconnected, reconnecting in 2s...");
      cleanup();
      reconnectTimeout = setTimeout(connect, 2000);
    };

    ws.onerror = () => {
      console.log("⚠️ WebSocket error");
      ws?.close();
    };
  }

  function schedulePing() {
    if (heartbeatInterval) clearInterval(heartbeatInterval);

    heartbeatInterval = setInterval(() => {
      if (ws?.readyState !== WebSocket.OPEN) return;

      // Expect a pong back within 10s; if not, the connection is stale
      pongTimeout = setTimeout(() => {
        console.log("⚠️ No pong received, closing stale connection...");
        ws?.close();
      }, 10000);

      ws.send(JSON.stringify({ type: "ping" }));
    }, 25000);
  }

  function cleanup() {
    if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; }
    if (pongTimeout) { clearTimeout(pongTimeout); pongTimeout = null; }
    if (reconnectTimeout) { clearTimeout(reconnectTimeout); reconnectTimeout = null; }
  }

  connect();
}

export function disconnectSocket() {
  currentRideId = null;
  isFirstConnect = true;
  if (ws) { ws.onclose = null; ws.close(); ws = null; }
}

export function subscribe(callback: (data: any) => void) {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
}

// Called by screens to re-fetch state after a reconnect
export function onReconnect(callback: () => void) {
  reconnectListeners.push(callback);
  return () => {
    const index = reconnectListeners.indexOf(callback);
    if (index > -1) reconnectListeners.splice(index, 1);
  };
}
