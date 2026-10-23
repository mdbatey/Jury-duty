(function () {
  "use strict";

  var E = window.JuryEngine;
  var P = window.JuryPortraits;
  var S = window.JurySound;
  var Net = window.JuryNet;
  var CASES = window.CASES || [];
  var JURORS = window.JURORS || [];
  var app = document.getElementById("app");
  var JOIN_KEY = "jury-duty-join";

  var GLOSSARY = [
    ["Jury", "A group of ordinary people who listen to the evidence and decide what happened. Criminal juries usually have 12 people; civil juries often have 6 to 12. This game uses 6."],
    ["Criminal case", "The government (the State) accuses someone of a crime. The person accused is the defendant. A conviction can mean jail."],
    ["Civil case", "One person sues another, usually for money. The person suing is the plaintiff. Nobody goes to jail."],
    ["Beyond a reasonable doubt", "The standard in criminal cases. You must be firmly convinced the defendant is guilty. It's the highest standard in law."],
    ["Preponderance of the evidence", "The standard in most civil cases. Is it more likely than not? Even 51% is enough."],
    ["Presumption of innocence", "A criminal defendant starts out innocent in the eyes of the law. The State has to prove otherwise. The defendant doesn't have to prove anything."],
    ["Evidence", "Testimony from witnesses, documents, photos and objects. Lawyers' statements and questions are not evidence. Only the witnesses' answers are."],
    ["Exhibit", "A document or object admitted as evidence, labeled like \"State's Exhibit 1\" or \"Defense Exhibit A.\""],
    ["Direct examination", "Questions from the lawyer who called the witness."],
    ["Cross-examination", "Questions from the other side's lawyer, meant to test or poke holes in the testimony."],
    ["Objection", "A lawyer's protest that a question or answer breaks the rules of evidence. \"Sustained\" means the objection wins and the jury must ignore the answer. \"Overruled\" means it loses."],
    ["Hearsay", "Repeating what someone else said outside of court to prove it's true. Usually not allowed, because that person can't be cross-examined."],
    ["Juror questions", "Some states let jurors write down a question for a witness. The judge decides whether it can be asked."],
    ["Deliberation", "The jury's private discussion after the trial. The foreperson leads it."],
    ["Hung jury", "When the jury can't reach the required agreement. The judge declares a mistrial and the case may be tried again."]
  ];

  // Top-down courtroom. Coordinates are in the board's 360 x 430 viewBox.
  var SPOTS = {
    judge: [180, 38], clerk: [95, 82], stand: [275, 86], podium: [180, 196],
    p1: [118, 292], p2: [156, 292], d1: [224, 292], d2: [262, 292],
    g0: [44, 352], g1: [84, 352], g2: [124, 352], g3: [236, 352], g4: [276, 352], g5: [316, 352],
    j0: [30, 144], j1: [64, 144], j2: [30, 182], j3: [64, 182], j4: [30, 220], j5: [64, 220]
  };

  // screen: home | pick | guide | solo | host | join | phone
  var ui = {
    screen: "home", pickMode: "solo",
    g: null, showNotebook: false, sel: null, target: null,
    host: null, conns: [], code: null, hostError: null, sig: "",
    approach: "facts", offOpen: false, offLine: -1, flagMsg: null, flagSeen: 0,
    phone: null, view: null, phoneStatus: "", phoneError: "", retries: 0, lastHeard: 0, editing: false, joinCode: ""
  };

  // ---------- Helpers ----------

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // This tab's seat (code, name, token) survives a reload so the phone can
  // rejoin. The name is also remembered across tabs to prefill the form.
  function readJoin() {
    try {
      return JSON.parse(sessionStorage.getItem(JOIN_KEY) || "null") || JSON.parse(localStorage.getItem(JOIN_KEY) || "null");
    } catch (e) { return null; }
  }

  function saveJoin(v) {
    try { sessionStorage.setItem(JOIN_KEY, JSON.stringify(v)); } catch (e) {}
    try { localStorage.setItem(JOIN_KEY, JSON.stringify({ code: v.code, name: v.name })); } catch (e) {}
  }

  function kindClass(kind) { return "k-" + kind.replace(" ", " k-"); }

  // The six jury seats, ready to draw.
  function juryPeople(g) {
    var c = E.findCase(g.caseId);
    return E.seats(g).map(function (s, i) {
      if (s.kind === "human") {
        var solo = g.mode === "solo";
        var p = g.humans[s.h];
        return { id: s.id, seat: i, name: solo ? "You" : p.name, ini: solo ? "YOU" : E.initials(p.name), kind: solo ? "you" : "human", human: true, connected: p.connected };
      }
      var m = g.d ? E.mood(c, g.d.leans[s.id]) : null;
      return { id: s.id, seat: i, name: s.juror.short, full: s.juror.name, ini: E.initials(s.juror.name), kind: "juror", mood: m, look: P.lookFor(null, s.juror.name, s.juror.look) };
    });
  }

  function whoName(g, who) {
    if (who.charAt(0) === "h" && /^h\d+$/.test(who)) {
      var p = g.humans[Number(who.slice(1))];
      return g.mode === "solo" ? "You" : p ? p.name : "Juror";
    }
    var j = E.juror(who);
    return j ? j.short : who;
  }

  function logHtml(g, log, mineH) {
    return log.map(function (l) {
      if (!l.who) return '<li class="sys ' + l.cls + '">' + esc(l.text) + "</li>";
      var mine = l.who === "h" + mineH;
      // Human jurors' moves look different from computer jurors' lines.
      var human = /^h\d+$/.test(l.who);
      return '<li class="msg' + (human ? " human" : "") + (mine ? " mine" : "") + (l.cls ? " " + l.cls : "") + '"><b>' + esc(whoName(g, l.who)) +
        (l.meta ? ' <span class="meta">' + esc(l.meta) + "</span>" : "") + "</b><span>" + esc(l.text) + "</span></li>";
    }).join("");
  }

  // ---------- Home, case picker, guide ----------

  function renderHome() {
    var cast = JURORS.map(function (j) {
      return '<li class="juror-card"><span class="portrait small-portrait">' + P.svg(P.lookFor(null, j.name, j.look), "calm", { size: 48 }) + "</span><div><p><b>" + esc(j.name) + '</b> <span class="muted small">' + esc(j.job) + "</span></p>" +
        '<p class="muted small">' + esc(j.bio) + "</p></div></li>";
    }).join("");
    return '<header class="hero">' +
      '<p class="eyebrow">Superior Court of Maple County</p>' +
      "<h1>Jury Duty</h1>" +
      '<p class="lede">You have been summoned. Take your seat in the jury box, watch the trial unfold, and write down what matters. Then walk into the jury room and argue your way to a verdict.</p>' +
      "</header>" +
      '<section class="modes">' +
      '<button class="mode" data-action="pick" data-mode="solo"><span class="eyebrow">One player</span><b>Play solo</b><span class="muted">Hear a case and argue with five computer jurors.</span></button>' +
      '<button class="mode" data-action="pick" data-mode="host"><span class="eyebrow">This device is the courtroom</span><b>Host a game</b><span class="muted">Show the trial on a laptop or TV. Friends join on their phones.</span></button>' +
      '<button class="mode" data-action="join-screen"><span class="eyebrow">Have a game code?</span><b>Join a game</b><span class="muted">Sit on the jury from your phone.</span></button>' +
      "</section>" +
      '<section class="how"><div><p class="eyebrow">Step 1</p><h3>Watch the trial</h3><p class="muted">Witnesses take the stand, lawyers question them, and objections fly.</p></div>' +
      '<div><p class="eyebrow">Step 2</p><h3>Take notes</h3><p class="muted">Your notebook holds ' + E.NOTE_LIMIT + ' facts. Choose carefully, and watch out for evidence the judge throws out.</p></div>' +
      '<div><p class="eyebrow">Step 3</p><h3>Deliberate</h3><p class="muted">Use your facts to persuade the other jurors. Each one cares about different kinds of evidence.</p></div></section>' +
      '<section class="panel"><div class="row-head"><h2>The computer jurors</h2><button class="btn-link" data-action="guide">Courtroom basics</button></div><ul class="jurors">' + cast + "</ul></section>";
  }

  function renderPick() {
    var host = ui.pickMode === "host";
    var cases = CASES.map(function (c) {
      return '<article class="case-card">' +
        '<div class="case-meta"><span class="tag tag-' + c.kind + '">' + (c.kind === "criminal" ? "Criminal" : "Civil") + "</span>" +
        '<span class="docket">No. ' + esc(c.docket) + "</span></div>" +
        "<h3>" + esc(c.title) + "</h3>" +
        '<p class="caption">' + esc(c.caption) + "</p>" +
        "<p>" + esc(c.blurb) + "</p>" +
        '<div class="case-foot"><span class="muted small">' + esc(c.length) + "</span>" +
        '<button class="btn" data-action="' + (host ? "host-case" : "start-case") + '" data-id="' + c.id + '">' + (host ? "Host this case" : "Hear this case") + "</button></div>" +
        "</article>";
    }).join("");
    return '<button class="btn-link back" data-action="home">← Back</button>' +
      '<header class="page-head"><p class="eyebrow">' + (host ? "Host a game" : "Play solo") + "</p><h1>Today's docket</h1>" +
      (host ? '<p class="muted">Pick a case. This device becomes the courtroom screen, and you\'ll get a game code for everyone\'s phones. If you\'re playing too, join from your own phone.</p>' : "") +
      '</header><div class="cases">' + cases + "</div>";
  }

  function renderGuide() {
    var items = GLOSSARY.map(function (g) {
      return '<div class="term"><dt>' + esc(g[0]) + "</dt><dd>" + esc(g[1]) + "</dd></div>";
    }).join("");
    return '<button class="btn-link back" data-action="home">← Back</button>' +
      '<header class="page-head"><p class="eyebrow">Juror handbook</p><h1>Courtroom basics</h1></header>' +
      '<section class="panel"><h2>How a trial goes</h2><ol class="flow">' +
      "<li><b>The judge</b> welcomes the jury and explains the case.</li>" +
      "<li><b>Opening statements.</b> Each side previews its story.</li>" +
      "<li><b>The prosecution's or plaintiff's case.</b> Their witnesses testify and are cross-examined.</li>" +
      "<li><b>The defense case.</b> The defense may call witnesses, but doesn't have to.</li>" +
      "<li><b>Closing arguments.</b> Each side argues what the evidence proved.</li>" +
      "<li><b>Jury instructions.</b> The judge explains the law.</li>" +
      "<li><b>Deliberation and verdict.</b> The jury talks it over in private and votes.</li>" +
      "</ol></section>" +
      '<section class="panel"><h2>Words you\'ll hear</h2><dl class="glossary">' + items + "</dl></section>";
  }

  // ---------- The courtroom board ----------

  function renderBoard(c, g) {
    var court = E.castOf(c).map(function (p) {
      return { id: p.id, name: p.name, ini: p.ini, kind: p.kind, look: P.lookFor(c, p.name) };
    });
    var jury = juryPeople(g).map(function (p) {
      return { id: p.id, name: p.full || p.name, ini: p.ini, kind: p.kind, spot: "j" + p.seat, away: p.human && !p.connected, look: p.look };
    });
    var tokens = court.concat(jury).map(function (p) {
      var spot = p.spot ? SPOTS[p.spot] : null;
      return '<g class="tok ' + kindClass(p.kind) + (p.away ? " away" : "") + '" data-tok="' + p.id + '"' +
        (spot ? ' style="transform: translate(' + spot[0] + "px," + spot[1] + 'px)"' : "") + "><title>" + esc(p.name) + "</title>" +
        '<circle class="ring" r="18"></circle><circle class="disc" r="14"></circle>' +
        (p.look ? '<g class="face" data-expr="calm">' + P.tokenFace(p.look, "calm", 13, "tok-clip") + "</g>" : '<text class="ini" dy="3.5">' + esc(p.ini) + "</text>") + "</g>";
    }).join("");
    var pLabel = c.kind === "criminal" ? "PROSECUTION" : "PLAINTIFF";
    return '<svg class="board" viewBox="0 0 360 430" role="img" aria-label="Top-down view of the courtroom">' +
      '<defs><clipPath id="tok-clip"><circle r="13"></circle></clipPath></defs>' +
      '<rect class="floor" x="2" y="2" width="356" height="426" rx="10"></rect>' +
      '<rect class="well" x="96" y="108" width="248" height="200" rx="6"></rect>' +
      '<rect class="wood" x="118" y="14" width="124" height="48" rx="4"></rect><text class="lbl" x="180" y="74">BENCH</text>' +
      '<rect class="wood" x="252" y="66" width="46" height="40" rx="4"></rect><text class="lbl" x="275" y="118">WITNESS</text>' +
      '<rect class="desk" x="72" y="66" width="46" height="32" rx="3"></rect>' +
      '<rect class="box" x="8" y="118" width="80" height="124" rx="6"></rect><text class="lbl" x="48" y="256">JURY</text>' +
      '<rect class="desk" x="168" y="170" width="24" height="10" rx="2"></rect>' +
      '<rect class="desk" x="98" y="252" width="78" height="20" rx="3"></rect><text class="lbl" x="137" y="246">' + pLabel + "</text>" +
      '<rect class="desk" x="204" y="252" width="78" height="20" rx="3"></rect><text class="lbl" x="243" y="246">DEFENSE</text>' +
      '<path class="rail" d="M10 318 H160 M200 318 H350"></path>' +
      '<rect class="bench-seat" x="20" y="368" width="128" height="9" rx="2"></rect><rect class="bench-seat" x="212" y="368" width="128" height="9" rx="2"></rect>' +
      '<rect class="bench-seat" x="20" y="404" width="128" height="9" rx="2"></rect><rect class="bench-seat" x="212" y="404" width="128" height="9" rx="2"></rect>' +
      '<text class="lbl" x="180" y="398">GALLERY</text>' +
      tokens + "</svg>";
  }

  function updateBoard(g) {
    var c = E.findCase(g.caseId);
    var b = g.beats[g.beat];
    var board = app.querySelector(".board");
    if (!board || !b) return;
    E.castOf(c).forEach(function (p) {
      var el = board.querySelector('[data-tok="' + p.id + '"]');
      var spot = SPOTS[b.pos[p.id]] || SPOTS[p.home];
      el.style.transform = "translate(" + spot[0] + "px," + spot[1] + "px)";
      var face = el.querySelector(".face");
      var expr = p.id === b.who ? b.expression || "calm" : "calm";
      if (face && face.getAttribute("data-expr") !== expr) {
        face.setAttribute("data-expr", expr);
        face.innerHTML = P.tokenFace(P.lookFor(c, p.name), expr, 13, "tok-clip");
      }
    });
    Array.prototype.forEach.call(board.querySelectorAll(".tok"), function (el) {
      el.classList.toggle("speaking", el.getAttribute("data-tok") === b.who);
    });
    var banner = document.getElementById("banner");
    if (banner) {
      banner.classList.remove("show");
      if (b.kind === "objection") { void banner.offsetWidth; banner.classList.add("show"); }
    }
  }

  function speechHtml(c, b, extra) {
    var p = b.who ? E.person(c, b.who) : null;
    var head = p
      ? '<p class="who"><span class="portrait ' + kindClass(p.kind) + '">' + P.svg(P.lookFor(c, p.name), b.expression || "calm", { size: 64 }) + "</span><span><b>" + esc(p.name) + '</b><span class="muted small">' + esc(p.role) + "</span></span></p>"
      : '<p class="who guide-who"><span class="eyebrow">What\'s happening</span></p>';
    var x = b.show ? E.exhibit(c, b.show) : null;
    var ex = x ? '<figure class="exhibit"><span class="sticker">' + esc(x.label) + "</span><figcaption>" + esc(x.title) + "</figcaption><pre>" + esc(x.body) + "</pre></figure>" : "";
    var active = !typing.done && typing.text === b.text;
    var line = active
      ? '<p class="line"><span class="sr-only">' + esc(b.text) + '</span><span id="typed" aria-hidden="true">' + esc(b.text.slice(0, typing.shown)) + "</span></p>"
      : '<p class="line">' + esc(b.text) + "</p>";
    return '<div class="speech-box' + (b.who ? "" : " guide") + (b.kind === "objection" ? " objecting" : "") + '">' + head +
      line + '<div class="after-line" id="after-line"' + (active ? " hidden" : "") + ">" + ex + (extra || "") + "</div></div>";
  }

  // ---------- Typewriter text ----------

  // Lines type out on the courtroom screen and in solo play (never on phones).
  // A line the viewer has already seen, for example after Back, appears whole.
  var SPEED_KEY = "jury-duty-text-speed";
  var SPEEDS = { slow: 20, normal: 40, instant: 0 };
  var SPEED_ORDER = ["slow", "normal", "instant"];
  var SPEED_NAMES = { slow: "Slow", normal: "Normal", instant: "Instant" };
  var typing = { key: null, text: "", shown: 0, done: true, timer: null };
  var maxSeen = -1;

  function textSpeed() {
    var v = null;
    try { v = localStorage.getItem(SPEED_KEY); } catch (e) {}
    return SPEEDS.hasOwnProperty(v) ? v : "normal";
  }

  function charsPerSecond() {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return reduce ? 0 : SPEEDS[textSpeed()];
  }

  function resetTyping() {
    clearTimeout(typing.timer);
    typing = { key: null, text: "", shown: 0, done: true, timer: null };
    maxSeen = -1;
  }

  // Start typing the current line, unless it's already typing or was seen before.
  function beginLine(g) {
    var b = g.beats[g.beat];
    var key = g.beat + "|" + b.text;
    if (typing.key === key) return false;
    clearTimeout(typing.timer);
    var fresh = g.beat > maxSeen;
    maxSeen = Math.max(maxSeen, g.beat);
    typing = { key: key, text: b.text, shown: 0, done: !(fresh && charsPerSecond() > 0 && b.text.length), timer: null };
    if (!typing.done) typing.timer = setTimeout(typeNext, 0);
    return fresh;
  }

  function typeNext() {
    var t = typing;
    if (t.done) return;
    t.shown++;
    var el = document.getElementById("typed");
    if (el) el.textContent = t.text.slice(0, t.shown);
    if (t.shown >= t.text.length) { finishLine(); return; }
    var ch = t.text.charAt(t.shown - 1);
    var step = 1000 / charsPerSecond();
    var pause = /[.!?]/.test(ch) ? step * 14 : /[,;:]/.test(ch) ? step * 6 : 0;
    t.timer = setTimeout(typeNext, step + pause);
  }

  function finishLine() {
    clearTimeout(typing.timer);
    typing.done = true;
    typing.shown = typing.text.length;
    var el = document.getElementById("typed");
    if (el) el.textContent = typing.text;
    var after = document.getElementById("after-line");
    if (after) after.hidden = false;
  }

  // Next while a line is typing finishes it instead of moving on.
  function finishIfTyping() {
    if (typing.done || !ui.g || ui.g.phase !== "trial") return false;
    finishLine();
    return true;
  }

  function soundButton() {
    if (!S.supported()) return "";
    var on = S.isOn();
    return '<button class="btn-link speed-btn" data-action="sound" aria-pressed="' + on + '">Sound: ' + (on ? "On" : "Off") + "</button>";
  }

  function speedButton() {
    return '<button class="btn-link speed-btn" data-action="speed" aria-label="Text speed: ' + SPEED_NAMES[textSpeed()] + '. Tap to change.">Text speed: ' + SPEED_NAMES[textSpeed()] + "</button>";
  }

  // Draw the trial's dialogue box and move the board to the current line.
  function showDialog() {
    var g = ui.g;
    // A line's sound and jurors' reactions happen the first time it appears, not after Back.
    var fresh = beginLine(g);
    if (fresh && g.beats[g.beat].sfx) S.play(g.beats[g.beat].sfx);
    document.getElementById("dialog").innerHTML = ui.screen === "solo" ? soloTrialDialog() : hostTrialDialog();
    updateBoard(g);
    if (fresh) showReactions(g.beats[g.beat]);
  }

  // A reacting computer juror's face changes and a short word appears above
  // their seat in the jury box for about two seconds.
  var SVGNS = "http://www.w3.org/2000/svg";
  var reacting = [];
  function clearReactions() {
    reacting.forEach(function (done) { done(); });
    reacting = [];
  }

  function showReactions(b) {
    // A new line replaces the last line's reactions instead of piling on.
    clearReactions();
    var board = app.querySelector(".board");
    if (!board || !b.reactions) return;
    b.reactions.forEach(function (r) {
      var tok = board.querySelector('[data-tok="' + r.juror + '"]');
      if (!tok) return;
      var j = E.juror(r.juror);
      var look = P.lookFor(null, j.name, j.look);
      var face = tok.querySelector(".face");
      if (face) face.innerHTML = P.tokenFace(look, r.expression, 13, "tok-clip");
      var old = tok.querySelector(".bubble");
      if (old) old.parentNode.removeChild(old);
      // Keep the bubble inside the board even for seats near its left edge.
      var x = Number((/translate\(([-\d.]+)px/.exec(tok.getAttribute("style") || "") || [0, 50])[1]);
      var w = r.word.length * 5.4 + 12;
      var dx = Math.max(0, w / 2 + 4 - x);
      var g = document.createElementNS(SVGNS, "g");
      g.setAttribute("class", "bubble");
      var rect = document.createElementNS(SVGNS, "rect");
      rect.setAttribute("x", dx - w / 2); rect.setAttribute("y", -38); rect.setAttribute("width", w); rect.setAttribute("height", 15); rect.setAttribute("rx", 7.5);
      var text = document.createElementNS(SVGNS, "text");
      text.setAttribute("x", dx); text.setAttribute("y", -27.5);
      text.textContent = r.word;
      g.appendChild(rect); g.appendChild(text);
      tok.appendChild(g);
      tok.parentNode.appendChild(tok);
      var timer;
      var done = function () {
        clearTimeout(timer);
        if (g.parentNode) g.parentNode.removeChild(g);
        if (face && face.isConnected) face.innerHTML = P.tokenFace(look, "calm", 13, "tok-clip");
      };
      timer = setTimeout(done, 2000);
      reacting.push(done);
    });
  }

  function phaseHtml(b, index, total) {
    return '<p class="phase">' + esc(b.phase || "") + '<span class="muted small">' + (index + 1) + " / " + total + "</span></p>";
  }

  function renderCourtroom(c, top) {
    return '<div class="trial">' + top +
      '<div class="trial-grid"><div class="board-wrap">' + renderBoard(c, ui.g) + '<div class="objection-banner" id="banner">OBJECTION!</div></div>' +
      '<div class="dialog" id="dialog"></div></div></div>';
  }

  // ---------- Solo ----------

  function soloTrialDialog() {
    var g = ui.g;
    var c = E.findCase(g.caseId);
    var b = g.beats[g.beat];
    var me = g.humans[0];
    var extra = "";
    if (b.card) {
      var have = me.notebook.indexOf(b.card) >= 0;
      var full = me.notebook.length >= E.NOTE_LIMIT;
      extra += '<div class="note-row">' + (have
        ? '<span class="noted">Written in your notebook</span>'
        : full
          ? '<span class="muted small">Your notebook is full. Remove a fact to make room.</span>'
          : '<button class="btn note-btn" data-action="note" data-card="' + b.card + '">Write it down</button>') +
        '<span class="card-title">' + esc(c.cards[b.card].title) + "</span></div>";
    }
    if (b.kind === "ask") {
      if (me.askUsed) extra += '<p class="muted small">You have already used your one question.</p>';
      else extra += askButtons(c, b) + '<p class="muted small">Or tap Next to skip your question.</p>';
    }
    if (ui.flagMsg && ui.flagMsg.beat === g.beat) extra += flagResultHtml(c, ui.flagMsg.flag);
    else if (E.flagLines(g).indexOf(g.beat) >= 0 && me.tries > 0) extra += offHtml(c, me, "");
    var last = g.beat === g.beats.length - 1;
    return phaseHtml(b, g.beat, g.beats.length) + speechHtml(c, b, extra) +
      '<div class="dialog-nav">' +
      '<button class="btn ghost" data-action="back"' + (g.beat === 0 ? " disabled" : "") + ">Back</button>" +
      '<button class="btn ghost" data-action="notebook">Notebook ' + me.notebook.length + "/" + E.NOTE_LIMIT + "</button>" +
      '<button class="btn" data-action="advance" id="next-btn">' + (last ? "Go to the jury room" : "Next") + "</button></div>" +
      (ui.showNotebook ? notebookHtml(c, me.notebook, true, me.bonus) : "");
  }

  // "Something's off": pick the notebook fact this testimony conflicts with.
  // prefix is "" for solo play and "m-" for phones.
  function offHtml(c, me, prefix) {
    var left = me.tries + (me.tries === 1 ? " try" : " tries") + " left";
    // In solo play the panel belongs to the line it was opened on.
    var open = prefix === "m-" ? ui.offOpen === true : ui.offOpen === ui.g.beat;
    if (!open) {
      return '<div class="off-row"><button class="btn ghost off-btn" data-action="' + prefix + 'off-open">Something\'s off</button><span class="muted small">' + left + "</span></div>";
    }
    var lines = "";
    if (prefix === "m-" && me.flagLines.length) {
      var chosen = lineToFlag(me);
      lines = '<p class="muted small">Which line?</p><div class="ask">' + me.flagLines.slice().reverse().map(function (l) {
        return '<button class="btn ghost ask-btn' + (l.i === chosen ? " on" : "") + '" data-action="m-off-line" data-i="' + l.i + '" aria-pressed="' + (l.i === chosen) + '">' + esc(l.text) + "</button>";
      }).join("") + '</div><p class="muted small">Conflicts with:</p>';
    }
    var facts = me.notebook.length
      ? lines + '<div class="ask">' + me.notebook.map(function (id) {
        return '<button class="btn ghost ask-btn" data-action="' + prefix + 'off-pick" data-card="' + id + '">' + esc(c.cards[id].title) + "</button>";
      }).join("") + "</div>"
      : '<p class="muted small">Your notebook is empty. You can only catch a contradiction with a fact you wrote down.</p>';
    return '<div class="off-panel"><p><b>Which fact in your notebook does this conflict with?</b> <span class="muted small">' + left + ". A wrong guess uses one.</span></p>" + facts +
      '<button class="btn-link" data-action="' + prefix + 'off-cancel">Never mind</button></div>';
  }

  function lineToFlag(me) {
    var ids = me.flagLines.map(function (l) { return l.i; });
    return ids.indexOf(ui.offLine) >= 0 ? ui.offLine : ids[ids.length - 1];
  }

  function flagResultHtml(c, f) {
    if (f.ok) {
      var card = c.cards[f.id];
      return '<div class="flag-result ok" role="status"><p class="eyebrow">You caught a contradiction</p><p><b>' + esc(card.title) + "</b></p><p>" + esc(card.explain) +
        '</p><p class="muted small">Bonus fact added. It doesn\'t use a notebook slot.</p></div>';
    }
    return '<div class="flag-result miss" role="status"><p><b>That doesn\'t seem to conflict.</b> ' + (f.tries ? f.tries + (f.tries === 1 ? " try" : " tries") + " left." : "No tries left this trial.") + "</p></div>";
  }

  function askButtons(c, b) {
    var s = c.steps[b.step];
    return '<div class="ask">' + s.jurorQuestion.map(function (q, i) {
      return '<button class="btn ghost ask-btn" data-action="ask" data-i="' + i + '">' + esc(q.q) + "</button>";
    }).join("") + "</div>";
  }

  function notebookHtml(c, notes, removable, bonus) {
    var list = notes.length
      ? notes.map(function (id) {
        return "<li><span>" + esc(c.cards[id].title) + "</span>" + (removable ? '<button class="btn-link" data-action="unnote" data-card="' + id + '">Remove</button>' : "") + "</li>";
      }).join("")
      : '<li class="muted">Nothing yet. Tap "Write it down" when a witness says something important.</li>';
    var extra = bonus && bonus.length
      ? '<p class="eyebrow">Bonus facts</p><ul class="plain">' + bonus.map(function (id) { return "<li>" + esc(c.cards[id].title) + "</li>"; }).join("") + "</ul>"
      : "";
    return '<div class="notebook"><p class="eyebrow">Juror notebook</p><ol>' + list + "</ol>" + extra + "</div>";
  }

  function tableSeat(i) {
    // Seat 1 sits at the bottom of the table; the others go around it.
    var angle = Math.PI / 2 + (i * 2 * Math.PI) / 6;
    return [180 + Math.cos(angle) * 140, 112 + Math.sin(angle) * 84];
  }

  function tableSvg(g, pickable) {
    var seats = juryPeople(g).map(function (p, i) {
      var xy = tableSeat(i);
      var m = p.human ? { label: g.mode === "solo" ? "" : p.connected ? "Juror " + (p.seat + 1) : "Away", cls: g.mode === "solo" ? "m-you" : "m-human" } : p.mood;
      var pick = pickable && !p.human;
      return '<g class="seat ' + m.cls + (ui.target === p.id ? " targeted" : "") + (pick ? " pickable" : "") + '" transform="translate(' + xy[0].toFixed(1) + " " + xy[1].toFixed(1) + ')"' +
        (pick ? ' data-action="target" data-id="' + p.id + '" tabindex="0" role="button" aria-label="Talk to ' + esc(p.name) + '"' : "") + ">" +
        '<circle class="ring" r="20"></circle><circle class="disc" r="15"></circle>' +
        (p.look ? P.tokenFace(p.look, "calm", 13.5, "seat-clip") : '<text class="ini" dy="3.5">' + esc(p.ini) + "</text>") +
        '<text class="seat-name" y="33">' + esc(p.name) + '</text><text class="seat-mood" y="45">' + esc(m.label) + "</text></g>";
    }).join("");
    return '<svg class="table-svg" viewBox="0 0 360 252" role="img" aria-label="The jury table">' +
      '<defs><clipPath id="seat-clip"><circle r="13.5"></circle></clipPath></defs>' +
      '<ellipse class="tabletop" cx="180" cy="112" rx="86" ry="32"></ellipse>' + seats + "</svg>";
  }

  function handHtml(c, notes, used, counter) {
    var hand = notes.filter(function (id) { return used.indexOf(id) < 0; });
    var cards = hand.length ? hand.map(function (id) {
      var card = c.cards[id];
      var answers = counter && !counter.answered && (card.rebuts || []).indexOf(counter.fact) >= 0;
      return '<button class="fact' + (card.bonus ? " bonus" : "") + (ui.sel === id ? " selected" : "") + '" data-action="select" data-card="' + id + '" aria-pressed="' + (ui.sel === id) + '">' +
        esc(card.title) + '<span class="fact-tags">' + (card.bonus ? "bonus fact · " : "") + card.tags.map(esc).join(" · ") + "</span>" +
        (answers ? '<span class="rebuts">Rebuts ' + esc(E.juror(counter.juror).short) + "'s counter-argument</span>" : "") + "</button>";
    }).join("") : '<p class="muted small">Your notebook has nothing left to use. You can still listen to the others and vote.</p>';
    return { count: hand.length, html: '<div class="hand">' + cards + "</div>" };
  }

  function approachHtml() {
    var names = { facts: "Lay out the facts", press: "Press hard", question: "Ask a question" };
    return '<div class="targets"><span class="muted small">How:</span>' + E.APPROACHES.map(function (a) {
      return '<button class="chip-btn' + (ui.approach === a ? " on" : "") + '" data-action="approach" data-a="' + a + '" aria-pressed="' + (ui.approach === a) + '">' + names[a] + "</button>";
    }).join("") + "</div>";
  }

  function counterHtml(c, counter) {
    if (!counter || counter.answered) return "";
    return '<div class="counter-box"><p class="eyebrow">' + esc(E.juror(counter.juror).short) + "'s counter-argument</p><p>" + esc(c.cards[counter.fact].title) + '.</p>' +
      '<p class="muted small">Answer it with a fact that rebuts it for a bonus, and it stops pulling the jury.</p></div>';
  }

  function targetsHtml(ids) {
    return '<div class="targets"><span class="muted small">Say it to:</span>' + ids.map(function (id) {
      return '<button class="chip-btn' + (ui.target === id ? " on" : "") + '" data-action="target" data-id="' + id + '"' + (ui.sel ? "" : " disabled") + ">" + esc(E.juror(id).short) + "</button>";
    }).join("") + '<button class="chip-btn' + (ui.target === "all" ? " on" : "") + '" data-action="target" data-id="all"' + (ui.sel ? "" : " disabled") + ">Whole table</button></div>";
  }

  function voteButtons(c) {
    var w = E.words(c);
    return '<div class="vote-btns"><button class="btn" data-action="cast" data-v="' + w.yesId + '">' + w.yes + '</button><button class="btn" data-action="cast" data-v="' + w.noId + '">' + w.no + "</button></div>";
  }

  function renderSoloDeliberation() {
    var g = ui.g;
    var c = E.findCase(g.caseId);
    var d = g.d;
    var me = g.humans[0];
    var hand = handHtml(c, me.notebook.concat(me.bonus), me.used, d.counter);
    var controls;
    if (d.voting) {
      controls = '<div class="vote-box"><p><b>Cast your vote.</b> ' + (c.kind === "criminal" ? "All six must agree." : "Five of six must agree.") + "</p>" + voteButtons(c) +
        (d.round <= E.ROUNDS ? '<button class="btn-link" data-action="cancel-vote">Keep talking instead</button>' : "") + "</div>";
    } else {
      controls = counterHtml(c, d.counter) + hand.html + targetsHtml(d.computers) + approachHtml() +
        '<div class="dialog-nav"><button class="btn ghost" data-action="listen">Let others talk</button>' +
        '<button class="btn ghost" data-action="call-vote">Call a vote</button>' +
        '<button class="btn" data-action="speak"' + (ui.sel && ui.target ? "" : " disabled") + ">Make your point</button></div>";
    }
    return '<div class="trial">' +
      '<div class="trial-top"><button class="btn-link" data-action="home">← Leave court</button>' + soundButton() + '<span class="docket">Jury room · Turn ' + Math.min(d.round, E.ROUNDS) + " of " + E.ROUNDS + "</span></div>" +
      '<div class="trial-grid"><div class="room">' + tableSvg(g, !!ui.sel && !d.voting) +
      '<ol class="log" id="log">' + logHtml(g, d.log, 0) + "</ol></div>" +
      '<div class="dialog"><p class="phase">Your notebook<span class="muted small">' + hand.count + (hand.count === 1 ? " fact" : " facts") + " left</span></p>" + controls + "</div></div></div>";
  }

  function truthHtml(c) {
    return '<section class="panel"><p class="eyebrow">What really happened</p><h2>' + esc(c.truth.headline) + "</h2><p>" + esc(c.truth.story) + "</p></section>" +
      '<section class="panel tip"><h2>What this case teaches</h2><p>' + esc(c.truth.lesson) + "</p></section>";
  }

  function verdictTitle(c, v) {
    var w = E.words(c);
    return v === "mistrial" ? "Hung jury" : v === w.yesId ? w.yes : w.no;
  }

  function reportHtml(rows) {
    return '<ul class="report">' + rows.map(function (r) {
      return '<li class="' + (r.ok ? "ok" : "miss") + '"><b>' + esc(r.title) + "</b><span>" + esc(r.text) + "</span></li>";
    }).join("") + "</ul>";
  }

  function renderSoloVerdict() {
    var g = ui.g;
    var c = E.findCase(g.caseId);
    var w = E.words(c);
    var d = g.d;
    var vw = function (id) { return id === w.yesId ? w.yes : w.no; };
    var ballots = [{ name: "You", v: g.humans[0].lastBallot }].concat(d.computers.map(function (id) {
      return { name: E.juror(id).short, v: d.tally.computers[id] };
    })).map(function (b, i) {
      return '<li class="vote-card" style="animation-delay:' + (i * 0.3) + 's"><b>' + esc(b.name) + "</b>" + vw(b.v) + "</li>";
    }).join("");
    return '<div class="trial-top"><button class="btn-link" data-action="home">← Leave court</button>' + soundButton() + "</div>" +
      '<header class="page-head verdict"><p class="eyebrow">' + esc(c.caption) + " · The foreperson reads the verdict</p><h1>" + verdictTitle(c, d.verdict) + "</h1>" +
      (d.verdict === "mistrial" ? "<p>The jury couldn't reach the required agreement, so the judge declares a mistrial.</p>" : "") + "</header>" +
      '<section class="panel"><p class="muted small">The ballots</p><ol class="votes">' + ballots + "</ol></section>" +
      truthHtml(c) +
      '<section class="panel"><h2>Your jury service</h2>' + reportHtml(E.report(g, 0)) + "</section>" +
      '<nav class="nav"><button class="btn ghost" data-action="start-case" data-id="' + c.id + '">Retry this case</button><button class="btn" data-action="home">Back to home</button></nav>';
  }

  function renderSolo() {
    var g = ui.g;
    var c = E.findCase(g.caseId);
    if (g.phase === "trial") {
      return renderCourtroom(c, '<div class="trial-top"><button class="btn-link" data-action="home">← Leave court</button>' + speedButton() + soundButton() + '<span class="docket">' + esc(c.caption) + " · No. " + esc(c.docket) + "</span></div>");
    }
    if (g.phase === "deliberation") return renderSoloDeliberation();
    return renderSoloVerdict();
  }

  function soloAct(a) {
    var before = ui.g.phase;
    if (!E.apply(ui.g, 0, a)) return;
    if (ui.g.phase === "trial") {
      showDialog();
    } else if (ui.g.phase === before) {
      render();
    } else {
      go("solo");
    }
  }

  // ---------- Hosting: the courtroom screen ----------

  function hostTop(c) {
    var g = ui.g;
    var fore = g.humans[g.foreperson];
    var live = g.humans.filter(function (p) { return p.connected; }).length;
    return '<div class="trial-top"><button class="btn-link" data-action="end-game">End game</button>' + (g.phase === "trial" ? speedButton() : "") + soundButton() +
      '<span class="docket">' + esc(c.caption) + " · Code <b class=\"code-inline\">" + esc(ui.code || "----") + "</b> · " +
      live + " of " + g.humans.length + " jurors connected" + (fore ? " · Foreperson: " + esc(fore.name) : "") + "</span></div>";
  }

  function joinLink() {
    return location.origin + location.pathname + location.search + "#join-" + (ui.code || "");
  }

  function renderLobby(c) {
    var g = ui.g;
    var people = juryPeople(g).map(function (p) {
      return '<li class="lobby-seat' + (p.human ? " human" : "") + '">' + (p.look ? '<span class="portrait small-portrait">' + P.svg(p.look, "calm", { size: 40, crop: "face" }) + "</span>" : '<span class="tok-chip ' + kindClass(p.kind) + '">' + esc(p.ini) + "</span>") + "<span><b>" + esc(p.name) + "</b>" +
        '<span class="muted small">' + (p.human ? "Juror " + (p.seat + 1) + (p.seat === g.foreperson ? " · Foreperson" : "") + (p.connected ? "" : " · Away") : "Computer juror") + "</span></span></li>";
    }).join("");
    var body = ui.hostError
      ? '<div class="panel warn-panel"><h2>Couldn\'t open the courtroom</h2><p>' + esc(ui.hostError) + '</p><button class="btn" data-action="home">Back to home</button></div>'
      : '<section class="lobby-code"><p class="eyebrow">Game code</p><p class="code">' + esc(ui.code || "····") + "</p>" +
        '<p>On your phone, open <b class="link-text">' + esc(location.host + location.pathname) + "</b> and tap <b>Join a game</b>, or go straight to:</p>" +
        '<p class="link-text small">' + esc(ui.code ? joinLink() : "Starting…") + "</p></section>" +
        '<section class="panel"><h2>The jury</h2><p class="muted small">Up to six people can join. Computer jurors fill the empty seats.</p><ul class="lobby-seats">' + people + "</ul>" +
        '<p class="muted">' + (g.humans.length ? "Waiting for the foreperson to tap <b>Start trial</b> on their phone." : "Waiting for the first juror to join. They'll be the foreperson.") + "</p></section>";
    return '<div class="trial-top"><button class="btn-link" data-action="end-game">End game</button><span class="docket">' + esc(c.caption) + "</span></div>" +
      '<header class="page-head"><p class="eyebrow">Host a game</p><h1>' + esc(c.title) + "</h1></header>" + body;
  }

  function hostTrialDialog() {
    var g = ui.g;
    var c = E.findCase(g.caseId);
    var b = g.beats[g.beat];
    var extra = "";
    if (b.card) extra += '<div class="note-row"><span class="card-title">Jurors can write this down: ' + esc(c.cards[b.card].title) + "</span></div>";
    if (b.kind === "ask") {
      extra += '<p class="muted small">' + (b.askedBy !== undefined
        ? esc(g.humans[b.askedBy].name) + " sent a question."
        : "Each juror can send one question from their phone during the trial. The first one sent is asked.") + "</p>";
    }
    var last = g.beat === g.beats.length - 1;
    return phaseHtml(b, g.beat, g.beats.length) + speechHtml(c, b, extra) +
      '<div class="dialog-nav"><button class="btn ghost" data-action="host-back"' + (g.beat === 0 ? " disabled" : "") + ">Back</button>" +
      '<button class="btn" data-action="host-advance">' + (last ? "Go to the jury room" : "Next") + "</button></div>" +
      '<p class="muted small">The foreperson moves the trial along from their phone. The space bar works here too.</p>';
  }

  function renderHostDeliberation(c) {
    var g = ui.g;
    var d = g.d;
    var status = g.humans.map(function (p, h) {
      var done = d.voting ? p.ballot : p.choice;
      return '<li class="' + (done ? "done" : "") + (p.connected ? "" : " away") + '"><b>' + esc(p.name) + "</b><span>" +
        (!p.connected ? "Away" : done ? (d.voting ? "Voted" : "Ready") : d.voting ? "Voting…" : "Choosing…") + (h === g.foreperson ? " · Foreperson" : "") + "</span></li>";
    }).join("");
    return '<div class="trial">' + hostTop(c) +
      '<div class="trial-grid"><div class="room">' + tableSvg(g, false) + "</div>" +
      '<div class="dialog"><p class="phase">' + (d.voting ? "Secret ballot" : "Jury room · Turn " + Math.min(d.round, E.ROUNDS) + " of " + E.ROUNDS) + "</p>" +
      '<ul class="status-list">' + status + "</ul>" +
      '<ol class="log" id="log">' + logHtml(g, d.log, -1) + "</ol></div></div></div>";
  }

  function renderHostVerdict(c) {
    var g = ui.g;
    var w = E.words(c);
    var d = g.d;
    var t = d.tally;
    var comp = d.computers.map(function (id, i) {
      return '<li class="vote-card" style="animation-delay:' + (i * 0.3) + 's"><b>' + esc(E.juror(id).short) + "</b>" + (t.computers[id] === w.yesId ? w.yes : w.no) + "</li>";
    }).join("");
    return hostTop(c) +
      '<header class="page-head verdict"><p class="eyebrow">' + esc(c.caption) + " · The foreperson reads the verdict</p><h1>" + verdictTitle(c, d.verdict) + "</h1>" +
      (d.verdict === "mistrial" ? "<p>The jury couldn't reach the required agreement, so the judge declares a mistrial.</p>" : "") + "</header>" +
      '<section class="panel"><p class="muted small">The ballots</p>' +
      '<p class="tally">Human jurors (secret ballot): ' + w.yes + " " + t.humanYes + " · " + w.no + " " + t.humanNo + "</p>" +
      (comp ? '<ol class="votes">' + comp + "</ol>" : "") + "</section>" +
      truthHtml(c) +
      '<p class="muted">Each juror\'s report card is on their phone.</p>' +
      '<nav class="nav"><button class="btn" data-action="end-game">End game</button></nav>';
  }

  function renderHost() {
    var g = ui.g;
    var c = E.findCase(g.caseId);
    if (g.phase === "lobby") return renderLobby(c);
    if (g.phase === "trial") return renderCourtroom(c, hostTop(c));
    if (g.phase === "deliberation") return renderHostDeliberation(c);
    return renderHostVerdict(c);
  }

  function hostSignature() {
    var g = ui.g;
    return [g.phase, ui.code, ui.hostError, g.foreperson].concat(g.humans.map(function (p) { return p.name + (p.connected ? "+" : "-"); })).join("|");
  }

  function startHost(caseId) {
    stopHost();
    resetTyping();
    ui.g = E.createGame(caseId, "multi");
    ui.code = null;
    ui.hostError = null;
    ui.conns = [];
    go("host");
    ui.host = Net.host({
      onReady: function (code) { ui.code = code; hostChanged(); },
      onConnection: function (conn) {
        var entry = { conn: conn, h: -1, seen: Date.now() };
        ui.conns.push(entry);
        conn.onMessage(function (m) { hostMessage(entry, m); });
        conn.onClose(function () { hostDropped(entry); });
      },
      onError: function (type) {
        ui.hostError = type === "load"
          ? "The connection library couldn't load. Check your internet connection and try again."
          : type === "network" || type === "server-error" || type === "socket-error"
            ? "Couldn't reach the service that connects phones to this screen. Check your internet connection and try again."
            : "Something went wrong while opening the courtroom (" + type + "). Try again.";
        hostChanged();
      }
    });
  }

  function stopHost() {
    if (!ui.host) return;
    ui.conns.forEach(function (e) { e.conn.send({ type: "ended" }); e.conn.close(); });
    ui.conns = [];
    ui.host.stop();
    ui.host = null;
  }

  function hostMessage(entry, m) {
    var g = ui.g;
    if (!g || !m) return;
    entry.seen = Date.now();
    if (m.type === "ping") { entry.conn.send({ type: "pong" }); return; }
    if (m.type === "hello") {
      var res = E.join(g, m.name, m.token);
      if (res.error) {
        entry.conn.send({ type: "reject", reason: res.error });
        return;
      }
      // A juror reconnecting from a new connection replaces the old one.
      ui.conns.forEach(function (e) { if (e !== entry && e.h === res.h) { e.h = -1; e.conn.close(); } });
      entry.h = res.h;
      entry.conn.send({ type: "welcome", h: res.h });
      hostChanged();
      return;
    }
    if (m.type !== "action" || entry.h < 0) return;
    if (m.action && m.action.type === "advance" && entry.h === g.foreperson && finishIfTyping()) return;
    if (E.apply(g, entry.h, m.action)) hostChanged();
  }

  function hostDropped(entry) {
    ui.conns = ui.conns.filter(function (e) { return e !== entry; });
    if (!ui.g || entry.h < 0) return;
    var still = ui.conns.some(function (e) { return e.h === entry.h; });
    if (!still && E.setConnected(ui.g, entry.h, false)) hostChanged();
  }

  function hostChanged() {
    var g = ui.g;
    if (!g || ui.screen !== "host") return;
    ui.conns.forEach(function (e) { if (e.h >= 0) e.conn.send({ type: "view", view: E.viewFor(g, e.h) }); });
    var sig = hostSignature();
    if (sig !== ui.sig || g.phase !== "trial") {
      ui.sig = sig;
      render();
    } else {
      showDialog();
    }
  }

  function hostAct(a) {
    if (ui.g && E.apply(ui.g, -1, a)) hostChanged();
  }

  // Drop phones that have gone quiet (a locked screen often closes silently).
  setInterval(function () {
    if (ui.screen !== "host") return;
    var now = Date.now();
    ui.conns.slice().forEach(function (e) { if (now - e.seen > 15000) e.conn.close(); });
  }, 5000);

  window.addEventListener("pagehide", function () {
    if (ui.screen === "host") stopHost();
    else if (ui.phone) phoneStop();
  });

  // ---------- Joining: the juror's phone ----------

  function renderJoin() {
    var saved = readJoin();
    var code = ui.joinCode || (saved && saved.code) || "";
    var name = saved && saved.code === code ? saved.name : "";
    return '<button class="btn-link back" data-action="home">← Back</button>' +
      '<header class="page-head"><p class="eyebrow">Join a game</p><h1>Take your seat</h1>' +
      '<p class="muted">Enter the game code shown on the courtroom screen.</p></header>' +
      '<form class="panel join-form" data-action="join-form">' +
      '<label for="join-code">Game code</label><input id="join-code" class="code-input" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" value="' + esc(code) + '" placeholder="ABCD">' +
      '<label for="join-name">Your name</label><input id="join-name" maxlength="' + E.NAME_MAX + '" autocomplete="nickname" value="' + esc(name) + '" placeholder="Your name">' +
      (ui.phoneError ? '<p class="error-text" role="alert">' + esc(ui.phoneError) + "</p>" : "") +
      '<button class="btn" type="submit">Join the jury</button></form>';
  }

  function phoneSend(action) {
    if (ui.phone && ui.phone.conn) ui.phone.conn.send({ type: "action", action: action });
  }

  function phoneConnect(code, name, token) {
    phoneStop();
    var attempt = { conn: null, done: false };
    ui.phone = attempt;
    ui.phoneStatus = ui.view ? "reconnecting" : "connecting";
    ui.lastHeard = Date.now();
    if (ui.screen !== "phone") go("phone"); else render();
    attempt.handle = Net.join(code, {
      onOpen: function (conn) {
        if (ui.phone !== attempt) { conn.close(); return; }
        attempt.conn = conn;
        conn.onMessage(function (m) { if (ui.phone === attempt) phoneMessage(m); });
        conn.onClose(function () { if (ui.phone === attempt) phoneLost(); });
        conn.send({ type: "hello", name: name, token: token });
      },
      onError: function (type) {
        if (ui.phone !== attempt) return;
        if (type === "peer-unavailable") {
          if (ui.view) phoneEnded("The courtroom screen disconnected. The game has ended.");
          else { phoneStop(); ui.phoneError = "There's no game with code " + code + ". Check the code on the courtroom screen."; go("join"); }
        } else if (type === "load") {
          phoneStop(); ui.phoneError = "The connection library couldn't load. Check your internet connection and try again."; go("join");
        } else {
          phoneLost();
        }
      }
    });
  }

  function phoneStop() {
    var p = ui.phone;
    ui.phone = null;
    if (p) { p.done = true; if (p.conn) p.conn.close(); if (p.handle) p.handle.stop(); }
  }

  function phoneMessage(m) {
    ui.lastHeard = Date.now();
    ui.retries = 0;
    if (m.type === "welcome") {
      ui.phoneStatus = "joined";
      var saved = readJoin();
      try { if (saved) history.replaceState(null, "", location.pathname + location.search + "#join-" + saved.code); } catch (e) {}
      keepAwake();
      render();
    }
    else if (m.type === "view") { ui.view = m.view; ui.phoneStatus = "joined"; renderPhoneKeepScroll(); }
    else if (m.type === "reject") { phoneStop(); ui.view = null; ui.phoneError = m.reason; go("join"); }
    else if (m.type === "ended") phoneEnded("The host ended the game.");
  }

  function phoneLost() {
    var saved = readJoin();
    phoneStop();
    if (!saved || ui.phoneStatus === "ended") return;
    ui.retries++;
    if (ui.retries > 8) { ui.phoneStatus = "lost"; render(); return; }
    ui.phoneStatus = "reconnecting";
    render();
    setTimeout(function () {
      if (ui.screen === "phone" && ui.phoneStatus === "reconnecting" && !ui.phone) phoneConnect(saved.code, saved.name, saved.token);
    }, 2000);
  }

  function phoneEnded(text) {
    phoneStop();
    ui.phoneStatus = "ended";
    ui.phoneError = text;
    render();
  }

  // The phone pings the courtroom screen and notices when it goes quiet.
  setInterval(function () {
    if (ui.screen !== "phone" || !ui.phone || !ui.phone.conn) return;
    ui.phone.conn.send({ type: "ping" });
    if (Date.now() - ui.lastHeard > 15000) phoneLost();
  }, 5000);

  var wakeLock = null;
  function keepAwake() {
    try {
      if (navigator.wakeLock && !wakeLock) {
        navigator.wakeLock.request("screen").then(function (l) {
          wakeLock = l;
          l.addEventListener("release", function () { wakeLock = null; });
        }, function () {});
      }
    } catch (e) {}
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible" || ui.screen !== "phone") return;
    keepAwake();
    if (ui.phone && ui.phone.conn) ui.phone.conn.send({ type: "ping" });
  });

  function phoneHeader(v, c) {
    var me = v.me;
    return '<div class="phone-top"><span class="tok-chip k-human">' + esc(E.initials(me.name)) + "</span><span><b>" + esc(me.name) + '</b><span class="muted small">Juror ' + (me.h + 1) +
      (v.foreperson === me.h ? " · Foreperson" : "") + " · " + esc(c.caption) + "</span></span></div>";
  }

  function renderPhone() {
    var v = ui.view;
    if (ui.phoneStatus === "ended" || ui.phoneStatus === "lost") {
      return '<section class="panel"><h2>' + (ui.phoneStatus === "lost" ? "Lost connection" : "Game over") + "</h2><p>" +
        esc(ui.phoneStatus === "lost" ? "Couldn't reach the courtroom screen. Make sure it's still open, then rejoin." : ui.phoneError) + "</p>" +
        '<div class="dialog-nav">' + (ui.phoneStatus === "lost" ? '<button class="btn" data-action="rejoin">Rejoin</button>' : "") +
        '<button class="btn ghost" data-action="home">Back to home</button></div></section>';
    }
    if (!v) {
      return '<section class="panel"><h2>' + (ui.phoneStatus === "reconnecting" ? "Reconnecting…" : "Joining…") + '</h2><p class="muted">Connecting to the courtroom screen.</p>' +
        '<button class="btn ghost" data-action="leave-game">Cancel</button></section>';
    }
    var c = E.findCase(v.caseId);
    var fore = v.foreperson === v.me.h;
    var banner = ui.phoneStatus === "reconnecting" ? '<p class="reconnect">Reconnecting to the courtroom screen…</p>' : "";
    var body;
    if (v.phase === "lobby") body = phoneLobby(v, fore);
    else if (v.phase === "trial") body = phoneTrial(v, c, fore);
    else if (v.phase === "deliberation") body = phoneDeliberation(v, c, fore);
    else body = phoneVerdict(v, c);
    return banner + phoneHeader(v, c) + body;
  }

  function phoneLobby(v, fore) {
    var names = v.humans.map(function (p, i) { return "<li>Juror " + (i + 1) + ": " + esc(p.name) + (p.connected ? "" : " (away)") + "</li>"; }).join("");
    return '<section class="panel"><h2>You\'re Juror ' + (v.me.h + 1) + "</h2>" +
      (fore ? "<p>You're the <b>foreperson</b>. You'll move the trial along, call votes and close turns. Start when everyone has joined.</p>" : "<p>Waiting for the foreperson to start the trial.</p>") +
      '<ul class="plain">' + names + "</ul>" +
      (fore ? '<button class="btn" data-action="m-start">Start trial</button>' : "") + "</section>" +
      '<button class="btn-link" data-action="leave-game">Leave game</button>';
  }

  function phoneTrial(v, c, fore) {
    var b = v.beat;
    var me = v.me;
    var p = b.who ? E.person(c, b.who) : null;
    var line = '<div class="speech-box' + (b.who ? "" : " guide") + '"><p class="muted small">' + esc(b.phase || "") + "</p>" +
      (p ? "<p><b>" + esc(p.name) + '</b> <span class="muted small">' + esc(p.role) + "</span></p>" : '<p class="eyebrow">What\'s happening</p>') +
      '<p class="line">' + esc(b.text) + "</p></div>";
    var controls = fore
      ? '<div class="dialog-nav"><button class="btn ghost" data-action="m-back"' + (v.beatIndex === 0 ? " disabled" : "") + ">Back</button>" +
        '<button class="btn" data-action="m-advance">' + (v.beatIndex === v.beatsLen - 1 ? "Go to the jury room" : "Next") + "</button></div>"
      : "";
    var full = me.notebook.length >= E.NOTE_LIMIT;
    var avail = me.available.filter(function (id) { return me.notebook.indexOf(id) < 0; });
    var facts = avail.length
      ? '<section class="panel"><p class="eyebrow">From this testimony</p><ul class="fact-list">' + avail.map(function (id) {
        return "<li><span>" + esc(c.cards[id].title) + "</span>" + (full ? "" : '<button class="btn note-btn" data-action="m-write" data-card="' + id + '">Write it down</button>') + "</li>";
      }).join("") + "</ul>" + (full ? '<p class="muted small">Your notebook is full. Remove a fact to make room.</p>' : "") + "</section>"
      : "";
    var ask = "";
    if (b.kind === "ask" && b.askedBy === undefined && !me.askUsed) {
      var s = c.steps[b.step];
      ask = '<section class="panel"><p class="eyebrow">Your juror question</p><p class="muted small">You get one question this trial. The first juror to send one gets it asked.</p><div class="ask">' +
        s.jurorQuestion.map(function (q, i) { return '<button class="btn ghost ask-btn" data-action="m-ask" data-i="' + i + '">' + esc(q.q) + "</button>"; }).join("") + "</div></section>";
    }
    var off = "";
    if (me.lastFlag && me.lastFlag.seq > ui.flagSeen) {
      off = '<section class="panel">' + flagResultHtml(c, me.lastFlag) + '<button class="btn ghost" data-action="m-off-ok">OK</button></section>';
    } else if (me.tries > 0 && me.flagLines.length) {
      off = '<section class="panel">' + offHtml(c, me, "m-") + "</section>";
    }
    return line + controls + ask + off + facts + notebookHtml(c, me.notebook, true, me.bonus).replace("Juror notebook", "Your notebook " + me.notebook.length + "/" + E.NOTE_LIMIT);
  }

  function phoneDeliberation(v, c, fore) {
    var d = v.d;
    var me = v.me;
    var moods = v.computers.map(function (id) {
      var m = d.moods[id];
      return '<li class="' + m.cls + '"><b>' + esc(E.juror(id).short) + "</b><span>" + esc(m.label) + "</span></li>";
    }).join("");
    var live = v.humans.filter(function (p) { return p.connected; });
    var recent = d.log.slice(-4);
    var g = { mode: "multi", humans: v.humans };
    var parts = [];
    parts.push('<p class="phase">' + (d.voting ? "Secret ballot" : "Jury room · Turn " + Math.min(d.round, E.ROUNDS) + " of " + E.ROUNDS) + "</p>");
    if (moods) parts.push('<ul class="mood-list">' + moods + "</ul>");
    parts.push('<ol class="log short">' + logHtml(g, recent, me.h) + "</ol>");
    if (d.voting) {
      var votedCount = live.filter(function (p) { return p.voted; }).length;
      parts.push(me.ballot
        ? '<div class="vote-box"><p><b>Ballot cast.</b> Waiting for the others (' + votedCount + " of " + live.length + ").</p></div>"
        : '<div class="vote-box"><p><b>Cast your secret ballot.</b> ' + (c.kind === "criminal" ? "All six must agree." : "Five of six must agree.") + "</p>" + voteButtons(c) + "</div>");
      if (fore && d.round <= E.ROUNDS) parts.push('<button class="btn-link" data-action="m-cancel-vote">Keep talking instead</button>');
    } else {
      var chosenCount = live.filter(function (p) { return p.chosen; }).length;
      if (me.choice && !ui.editing) {
        var said = me.choice.fact ? "You'll say: " + c.cards[me.choice.fact].title + (me.choice.target === "all" ? " (to the whole table, " : " (to " + E.juror(me.choice.target).short + ", ") + E.APPROACH_WORDS[me.choice.approach || "facts"] + ")" : "You'll let the others talk.";
        parts.push('<div class="vote-box"><p>' + esc(said) + "</p><p class=\"muted small\">Waiting for the others (" + chosenCount + " of " + live.length + ').</p><button class="btn-link" data-action="m-change">Change my choice</button></div>');
      } else {
        var hand = handHtml(c, me.notebook.concat(me.bonus), me.used, d.counter);
        parts.push(counterHtml(c, d.counter) + hand.html + (v.computers.length ? targetsHtml(v.computers) + approachHtml() : ""));
        parts.push('<div class="dialog-nav"><button class="btn ghost" data-action="m-pass">Let others talk</button>' +
          '<button class="btn" data-action="m-speak"' + (ui.sel && (ui.target || !v.computers.length) ? "" : " disabled") + ">Make your point</button></div>");
      }
      if (fore) {
        parts.push('<div class="panel fore-tools"><p class="eyebrow">Foreperson</p><div class="dialog-nav">' +
          '<button class="btn ghost" data-action="m-close-turn">Close this turn</button><button class="btn ghost" data-action="m-call-vote">Call a vote</button></div>' +
          '<p class="muted small">Closing the turn counts anyone who hasn\'t chosen as letting others talk.</p></div>');
      }
    }
    return parts.join("");
  }

  function phoneVerdict(v, c) {
    return '<header class="page-head verdict"><p class="eyebrow">The verdict</p><h1>' + verdictTitle(c, v.d.verdict) + "</h1></header>" +
      '<section class="panel"><h2>Your report card</h2>' + reportHtml(v.me.report) + "</section>" +
      '<p class="muted">The true story is on the courtroom screen.</p>' +
      '<button class="btn ghost" data-action="leave-game">Leave game</button>';
  }

  function renderPhoneKeepScroll() {
    var y = window.scrollY;
    render();
    window.scrollTo(0, y);
  }

  // ---------- Rendering and events ----------

  function scrollLog() {
    var log = document.getElementById("log");
    if (log) log.scrollTop = log.scrollHeight;
  }

  var lastHtml = "", pointerDown = false, pendingRender = false;
  app.addEventListener("pointerdown", function () { pointerDown = true; });
  document.addEventListener("pointerup", releasePointer);
  document.addEventListener("pointercancel", releasePointer);
  function releasePointer() {
    pointerDown = false;
    if (pendingRender) { pendingRender = false; setTimeout(renderPhoneKeepScroll, 0); }
  }

  function render() {
    var html;
    switch (ui.screen) {
      case "pick": html = renderPick(); break;
      case "guide": html = renderGuide(); break;
      case "solo": html = renderSolo(); break;
      case "host": html = renderHost(); break;
      case "join": html = renderJoin(); break;
      case "phone": html = renderPhone(); break;
      default: html = renderHome();
    }
    var wide = (ui.screen === "solo" || ui.screen === "host") && ui.g && (ui.g.phase === "trial" || ui.g.phase === "deliberation");
    html = '<main class="wrap screen-' + ui.screen + (wide ? " wide" : "") + '">' + html + "</main>";
    // Phones get a fresh view whenever anyone does anything. Skip redraws that
    // change nothing, and never redraw mid-tap, so taps aren't lost.
    if (ui.screen === "phone") {
      if (html === lastHtml) return;
      if (pointerDown) { pendingRender = true; return; }
    }
    lastHtml = html;
    app.innerHTML = html;
    if ((ui.screen === "solo" || ui.screen === "host") && ui.g && ui.g.phase === "trial") showDialog();
    if ((ui.screen === "solo" || ui.screen === "host") && ui.g && ui.g.phase === "verdict" && ui.verdictSounded !== ui.g) {
      ui.verdictSounded = ui.g;
      S.play("gavel");
      setTimeout(function () { S.play("verdict"); }, 450);
    }
    scrollLog();
  }

  function go(screen) {
    ui.screen = screen;
    render();
    window.scrollTo(0, 0);
  }

  function leavePhone() {
    var wasSeated = ui.phone || ui.view;
    phoneStop();
    try { sessionStorage.removeItem(JOIN_KEY); } catch (e) {}
    try { if (wasSeated) history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    ui.view = null;
    ui.phoneStatus = "";
    ui.phoneError = "";
  }

  app.addEventListener("submit", function (e) {
    e.preventDefault();
    var code = Net.cleanCode(document.getElementById("join-code").value);
    var name = String(document.getElementById("join-name").value || "").trim();
    if (code.length !== 4) { ui.phoneError = "The game code has 4 letters."; ui.joinCode = code; render(); return; }
    if (!name) { ui.phoneError = "Please enter your name."; ui.joinCode = code; render(); return; }
    var saved = readJoin();
    var token = saved && saved.token && saved.code === code && saved.name === name ? saved.token : Math.random().toString(36).slice(2) + Date.now().toString(36);
    saveJoin({ code: code, name: name, token: token });
    ui.phoneError = "";
    ui.view = null;
    ui.retries = 0;
    phoneConnect(code, name, token);
  });

  app.addEventListener("click", function (e) {
    var b = e.target.closest("[data-action]");
    if (!b || b.disabled || b.tagName === "FORM") return;
    var g = ui.g;
    var a = b.dataset.action;
    switch (a) {
      case "home":
        stopHost();
        leavePhone();
        ui.g = null;
        go("home");
        break;
      case "guide": go("guide"); break;
      case "pick": ui.pickMode = b.dataset.mode; go("pick"); break;
      case "join-screen": ui.phoneError = ""; go("join"); break;

      // Solo
      case "start-case":
        resetTyping();
        ui.offOpen = false; ui.flagMsg = null;
        ui.g = E.createGame(b.dataset.id, "solo");
        ui.showNotebook = false; ui.sel = null; ui.target = null;
        go("solo");
        break;
      case "advance": if (!finishIfTyping()) soloAct({ type: "advance" }); var next = document.getElementById("next-btn"); if (next) next.focus(); break;
      case "back": soloAct({ type: "back" }); break;
      case "note": soloAct({ type: "write", fact: b.dataset.card }); break;
      case "unnote":
        if (ui.screen === "phone") phoneSend({ type: "unwrite", fact: b.dataset.card });
        else soloAct({ type: "unwrite", fact: b.dataset.card });
        break;
      case "notebook":
        ui.showNotebook = !ui.showNotebook;
        showDialog();
        break;
      case "ask":
        if (ui.screen === "solo") soloAct({ type: "ask", i: Number(b.dataset.i) });
        break;
      case "select": ui.sel = ui.sel === b.dataset.card ? null : b.dataset.card; if (ui.screen === "phone") renderPhoneKeepScroll(); else render(); break;
      case "target": if (ui.sel) { ui.target = b.dataset.id; if (ui.screen === "phone") renderPhoneKeepScroll(); else render(); } break;
      case "speak":
        if (ui.sel && ui.target) { var f = ui.sel, t = ui.target; ui.sel = null; ui.target = null; soloAct({ type: "choose", fact: f, target: t, approach: ui.approach }); }
        break;
      case "approach": ui.approach = b.dataset.a; if (ui.screen === "phone") renderPhoneKeepScroll(); else render(); break;
      case "listen": soloAct({ type: "choose", pass: true }); break;
      case "call-vote": soloAct({ type: "callVote" }); break;
      case "cancel-vote": soloAct({ type: "cancelVote" }); break;
      case "cast":
        if (ui.screen === "phone") { phoneSend({ type: "ballot", verdict: b.dataset.v }); break; }
        soloAct({ type: "ballot", verdict: b.dataset.v });
        window.scrollTo(0, 0);
        break;

      // Hosting
      case "host-case": startHost(b.dataset.id); break;
      case "host-advance": if (!finishIfTyping()) hostAct({ type: "advance" }); break;
      case "sound":
        var turnOn = !S.isOn();
        S.setOn(turnOn);
        if (turnOn) S.play("gavel");
        b.textContent = "Sound: " + (turnOn ? "On" : "Off");
        b.setAttribute("aria-pressed", String(turnOn));
        break;
      case "speed":
        var nextSpeed = SPEED_ORDER[(SPEED_ORDER.indexOf(textSpeed()) + 1) % SPEED_ORDER.length];
        try { localStorage.setItem(SPEED_KEY, nextSpeed); } catch (err) {}
        if (nextSpeed === "instant") finishIfTyping();
        b.textContent = "Text speed: " + SPEED_NAMES[nextSpeed];
        b.setAttribute("aria-label", "Text speed: " + SPEED_NAMES[nextSpeed] + ". Tap to change.");
        break;
      case "host-back": hostAct({ type: "back" }); break;
      case "end-game":
        stopHost();
        ui.g = null;
        go("home");
        break;

      // Phone
      case "m-start": phoneSend({ type: "start" }); break;
      case "m-advance": phoneSend({ type: "advance" }); break;
      case "m-back": phoneSend({ type: "back" }); break;
      case "m-write": phoneSend({ type: "write", fact: b.dataset.card }); break;
      case "off-open": ui.offOpen = ui.g.beat; showDialog(); break;
      case "m-off-open": ui.offOpen = true; renderPhoneKeepScroll(); break;
      case "off-cancel": case "m-off-cancel": ui.offOpen = false; if (ui.screen === "phone") renderPhoneKeepScroll(); else showDialog(); break;
      case "off-pick":
        if (E.apply(ui.g, 0, { type: "flag", line: ui.g.beat, fact: b.dataset.card })) {
          ui.flagMsg = { beat: ui.g.beat, flag: ui.g.humans[0].lastFlag };
        }
        ui.offOpen = false;
        showDialog();
        break;
      case "m-off-line": ui.offLine = Number(b.dataset.i); renderPhoneKeepScroll(); break;
      case "m-off-pick":
        phoneSend({ type: "flag", line: lineToFlag(ui.view.me), fact: b.dataset.card });
        ui.offOpen = false;
        break;
      case "m-off-ok":
        ui.flagSeen = ui.view.me.lastFlag ? ui.view.me.lastFlag.seq : ui.flagSeen;
        renderPhoneKeepScroll();
        break;
      case "m-ask": phoneSend({ type: "ask", i: Number(b.dataset.i) }); break;
      case "m-speak":
        if (ui.sel) {
          phoneSend({ type: "choose", fact: ui.sel, target: ui.target || "all", approach: ui.approach });
          ui.sel = null; ui.target = null; ui.editing = false;
        }
        break;
      case "m-pass": phoneSend({ type: "choose", pass: true }); ui.sel = null; ui.target = null; ui.editing = false; break;
      case "m-change": ui.editing = true; renderPhoneKeepScroll(); break;
      case "m-close-turn": phoneSend({ type: "closeTurn" }); break;
      case "m-call-vote": phoneSend({ type: "callVote" }); break;
      case "m-cancel-vote": phoneSend({ type: "cancelVote" }); break;
      case "rejoin":
        var saved = readJoin();
        if (saved) { ui.retries = 0; ui.phoneStatus = ""; phoneConnect(saved.code, saved.name, saved.token); }
        break;
      case "leave-game":
        leavePhone();
        go("home");
        break;
    }
  });

  document.addEventListener("keydown", function (e) {
    var trial = ui.g && ui.g.phase === "trial" && (ui.screen === "solo" || ui.screen === "host");
    if (!trial) return;
    if (e.target.closest && e.target.closest("button, input, textarea")) return;
    var host = ui.screen === "host";
    if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") {
      e.preventDefault();
      if (finishIfTyping()) return;
      if (host) hostAct({ type: "advance" }); else soloAct({ type: "advance" });
    } else if (e.key === "ArrowLeft") {
      if (host) hostAct({ type: "back" }); else soloAct({ type: "back" });
    }
  });

  // A join link (#join-ABCD) opens the join screen with the code filled in.
  var m = /^#join-([A-Za-z]{4})$/.exec(location.hash);
  if (m) {
    ui.joinCode = m[1].toUpperCase();
    ui.screen = "join";
  }
  render();
  // After a reload, a phone that was already seated in this game rejoins by itself.
  var seated = null;
  try { seated = JSON.parse(sessionStorage.getItem(JOIN_KEY) || "null"); } catch (e) {}
  if (m && seated && seated.token && seated.code === ui.joinCode) phoneConnect(seated.code, seated.name, seated.token);
})();
