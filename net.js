// A thin connection layer between the courtroom screen and jurors' phones.
// Real games use PeerJS (see docs/adr/0001). Adding ?local to the address
// connects tabs in the same browser instead, for testing without a network.
// Adding ?peerhost=host:port points PeerJS at your own PeerJS server.
(function () {
  "use strict";

  var PEER_SCRIPT = "https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js";
  var PREFIX = "jury-duty-";
  // No O, I or L, so codes can't be confused with 0, 1 or l.
  var LETTERS = "ABCDEFGHJKMNPQRSTUVWXYZ";

  function makeCode() {
    var code = "";
    for (var i = 0; i < 4; i++) code += LETTERS[Math.floor(Math.random() * LETTERS.length)];
    return code;
  }

  function cleanCode(text) {
    return String(text || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
  }

  function params() {
    var q = new URLSearchParams(location.search);
    return { local: q.has("local"), peerHost: q.get("peerhost") };
  }

  // A connection both sides use: send(), onMessage(), onClose(), close().
  function makeConn(sendFn, closeFn) {
    var msgFns = [], closeFns = [], closed = false;
    return {
      send: function (m) { if (!closed) sendFn(m); },
      onMessage: function (fn) { msgFns.push(fn); },
      onClose: function (fn) { closeFns.push(fn); },
      close: function () { if (closed) return; closed = true; closeFn(); closeFns.forEach(function (f) { f(); }); },
      _deliver: function (m) { if (!closed) msgFns.forEach(function (f) { f(m); }); },
      _closed: function () { if (closed) return; closed = true; closeFns.forEach(function (f) { f(); }); }
    };
  }

  // ---------- PeerJS ----------

  var peerLoading = null;
  function loadPeer() {
    if (window.Peer) return Promise.resolve(window.Peer);
    if (!peerLoading) {
      peerLoading = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = PEER_SCRIPT;
        s.onload = function () { window.Peer ? resolve(window.Peer) : reject(new Error("load")); };
        s.onerror = function () { peerLoading = null; reject(new Error("load")); };
        document.head.appendChild(s);
      });
    }
    return peerLoading;
  }

  function peerOptions() {
    var ph = params().peerHost;
    if (!ph) return {};
    var parts = ph.split(":");
    return { host: parts[0], port: Number(parts[1] || 9000), path: "/", secure: location.protocol === "https:" };
  }

  function wrapPeer(dc) {
    var conn = makeConn(function (m) { if (dc.open) dc.send(m); }, function () { dc.close(); });
    dc.on("data", function (m) { conn._deliver(m); });
    dc.on("close", function () { conn._closed(); });
    dc.on("error", function () { conn._closed(); });
    return conn;
  }

  function peerHost(h) {
    var peer = null, stopped = false;
    function attempt() {
      var code = makeCode();
      loadPeer().then(function (Peer) {
        if (stopped) return;
        peer = new Peer(PREFIX + code, peerOptions());
        peer.on("open", function () { h.onReady(code); });
        peer.on("connection", function (dc) {
          dc.on("open", function () { h.onConnection(wrapPeer(dc)); });
        });
        peer.on("error", function (e) {
          if (e.type === "unavailable-id") { peer.destroy(); attempt(); }
          else h.onError(e.type);
        });
      }, function () { h.onError("load"); });
    }
    attempt();
    return { stop: function () { stopped = true; if (peer) peer.destroy(); } };
  }

  function peerJoin(code, h) {
    var peer = null, stopped = false;
    loadPeer().then(function (Peer) {
      if (stopped) return;
      peer = new Peer(undefined, peerOptions());
      peer.on("open", function () {
        var dc = peer.connect(PREFIX + code, { reliable: true });
        dc.on("open", function () { h.onOpen(wrapPeer(dc)); });
      });
      peer.on("error", function (e) { h.onError(e.type); });
    }, function () { h.onError("load"); });
    return { stop: function () { stopped = true; if (peer) peer.destroy(); } };
  }

  // ---------- Same-browser test mode ----------

  function localHost(h) {
    var code = makeCode();
    var ch = new BroadcastChannel(PREFIX + code);
    var conns = {};
    ch.onmessage = function (e) {
      var m = e.data;
      if (m.to !== "host") return;
      if (m.kind === "open") {
        var id = m.from;
        var conn = makeConn(function (data) { ch.postMessage({ to: id, kind: "msg", data: data }); }, function () {
          ch.postMessage({ to: id, kind: "close" });
          delete conns[id];
        });
        conns[id] = conn;
        ch.postMessage({ to: id, kind: "accept" });
        h.onConnection(conn);
      } else if (conns[m.from]) {
        if (m.kind === "msg") conns[m.from]._deliver(m.data);
        else if (m.kind === "close") { conns[m.from]._closed(); delete conns[m.from]; }
      }
    };
    setTimeout(function () { h.onReady(code); }, 0);
    return { stop: function () { ch.close(); } };
  }

  function localJoin(code, h) {
    var id = "p" + Math.random().toString(36).slice(2);
    var ch = new BroadcastChannel(PREFIX + code);
    var conn = null;
    var timer = setTimeout(function () { if (!conn) { ch.close(); h.onError("peer-unavailable"); } }, 1500);
    ch.onmessage = function (e) {
      var m = e.data;
      if (m.to !== id) return;
      if (m.kind === "accept" && !conn) {
        clearTimeout(timer);
        conn = makeConn(function (data) { ch.postMessage({ to: "host", from: id, kind: "msg", data: data }); }, function () {
          ch.postMessage({ to: "host", from: id, kind: "close" });
        });
        h.onOpen(conn);
      } else if (conn && m.kind === "msg") conn._deliver(m.data);
      else if (conn && m.kind === "close") conn._closed();
    };
    ch.postMessage({ to: "host", from: id, kind: "open" });
    return { stop: function () { clearTimeout(timer); if (conn) conn.close(); ch.close(); } };
  }

  // host({ onReady(code), onConnection(conn), onError(type) }) -> { stop() }
  // join(code, { onOpen(conn), onError(type) }) -> { stop() }
  window.JuryNet = {
    makeCode: makeCode,
    cleanCode: cleanCode,
    isLocal: function () { return params().local; },
    host: function (h) { return params().local ? localHost(h) : peerHost(h); },
    join: function (code, h) { return params().local ? localJoin(code, h) : peerJoin(code, h); }
  };
})();
