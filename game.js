(function () {
  "use strict";

  var app = document.getElementById("app");
  var CASES = window.CASES || [];
  var JURORS = window.JURORS || [];
  var NOTE_LIMIT = 7;
  var ROUNDS = 6;

  // Short explanations shown with each part of the trial, for players who
  // have never been in a courtroom.
  var EXPLAIN = {
    judge: "The judge runs the courtroom and decides questions of law. You and the other jurors decide the facts: what happened, and whether it was proven.",
    opening: "An opening statement is a lawyer's preview of the case. It is not evidence, so there's nothing to write down yet. Listen for what each side promises to prove.",
    witnessPlaintiffCriminal: "The prosecution goes first because it has to prove its case. In direct examination, the lawyer who called the witness asks open questions. Then the other side cross-examines to test the story.",
    witnessPlaintiffCivil: "The plaintiff is the person who brought the lawsuit, so their side goes first. Direct examination comes first, then the other side cross-examines.",
    witnessDefense: "Now the defense presents its side. The defense never has to prove anything or call witnesses, but it may. The other side gets to cross-examine.",
    closing: "In a closing argument, each lawyer tells you what they think the evidence showed. Like openings, closings are not evidence.",
    instructions: "Before you deliberate, the judge explains the law. Your verdict must follow these rules."
  };

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

  var state = defaultState();

  function defaultState() {
    return { screen: "home", caseId: null, beats: [], beat: 0, notes: [], asked: false, showNotebook: false, d: null };
  }

  // ---------- Helpers ----------

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function currentCase() {
    for (var i = 0; i < CASES.length; i++) if (CASES[i].id === state.caseId) return CASES[i];
    return null;
  }

  function words(c) {
    return c.kind === "criminal"
      ? { yes: "Guilty", no: "Not guilty", yesId: "guilty", noId: "not-guilty" }
      : { yes: "Liable", no: "Not liable", yesId: "liable", noId: "not-liable" };
  }

  function threshold(c) { return c.kind === "criminal" ? 70 : 50; }
  function needed(c) { return c.kind === "criminal" ? 6 : 5; }
  function sideName(c, side) { return side === "defense" ? "defense" : c.kind === "criminal" ? "prosecution" : "plaintiff"; }

  function initials(name) {
    var parts = name.split(" ").filter(function (w) {
      return !/^(Judge|Prosecutor|Defense|attorney|Attorney|Public|defender|Dr\.|Detective)$/.test(w);
    });
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function juror(id) {
    for (var i = 0; i < JURORS.length; i++) if (JURORS[i].id === id) return JURORS[i];
    return null;
  }

  // ---------- Cast and script ----------

  function castOf(c) {
    var judge = c.steps.filter(function (s) { return s.type === "judge"; })[0].speaker;
    var list = [
      { id: "judge", name: judge, role: "Judge", kind: "judge", home: "judge" },
      { id: "clerk", name: "Court clerk", role: "Clerk", kind: "clerk", home: "clerk", ini: "CL" },
      { id: "pl", name: c.parties.plaintiff.lawyer, role: c.kind === "criminal" ? "Prosecutor" : "Plaintiff's lawyer", kind: "pros", home: "p1" },
      { id: "dl", name: c.parties.defense.lawyer, role: "Defense lawyer", kind: "def", home: "d1" },
      { id: "def", name: c.parties.defense.label, role: "Defendant", kind: "def party", home: "d2" }
    ];
    if (c.kind === "civil") list.push({ id: "pla", name: c.parties.plaintiff.label, role: "Plaintiff", kind: "pros party", home: "p2" });
    var g = 0;
    c.steps.forEach(function (s) {
      if (s.type === "witness" && !witnessId(c, s.name, true)) {
        list.push({ id: "w" + g, name: s.name, role: s.role, kind: "wit", home: "g" + g });
        g++;
      }
    });
    list.push({ id: "you", name: "You", role: "Juror", kind: "you", home: "j0", ini: "YOU" });
    JURORS.forEach(function (j, i) {
      list.push({ id: j.id, name: j.name, role: "Juror", kind: "juror", home: "j" + (i + 1) });
    });
    list.forEach(function (p) { if (!p.ini) p.ini = initials(p.name); });
    return list;
  }

  function witnessId(c, name, partiesOnly) {
    if (name === c.parties.defense.label) return "def";
    if (c.kind === "civil" && name === c.parties.plaintiff.label) return "pla";
    if (partiesOnly) return null;
    var cast = castOf(c);
    for (var i = 0; i < cast.length; i++) if (cast[i].name === name) return cast[i].id;
    return null;
  }

  function person(c, id) {
    var cast = castOf(c);
    for (var i = 0; i < cast.length; i++) if (cast[i].id === id) return cast[i];
    return null;
  }

  function buildBeats(c) {
    var beats = [];
    var pos = {};
    castOf(c).forEach(function (p) { pos[p.id] = p.home; });

    function beat(b) { b.pos = Object.assign({}, pos); beats.push(b); }
    function guide(text, phase) { beat({ who: null, text: text, phase: phase, kind: "guide" }); }

    guide("You're the juror in the highlighted seat in the jury box. Tap Next, or press the space bar, to move the trial along. When you hear an important fact, tap Write it down. You can keep " + NOTE_LIMIT + " notes, and you'll use them to argue in the jury room.", "Before the trial");

    c.steps.forEach(function (s) {
      if (s.type === "judge" || s.type === "instructions") {
        var phase = s.type === "judge" ? "The judge's welcome" : "Jury instructions";
        guide(EXPLAIN[s.type], phase);
        s.text.forEach(function (t) { beat({ who: "judge", text: t, phase: phase }); });
      } else if (s.type === "opening" || s.type === "closing") {
        var lawyer = s.side === "defense" ? "dl" : "pl";
        var ph = (s.type === "opening" ? "Opening statement" : "Closing argument") + ": " + sideName(c, s.side);
        guide(EXPLAIN[s.type], ph);
        pos[lawyer] = "podium";
        s.text.forEach(function (t) { beat({ who: lawyer, text: t, phase: ph }); });
        pos[lawyer] = s.side === "defense" ? "d1" : "p1";
      } else if (s.type === "witness") {
        var w = witnessId(c, s.name);
        var caller = s.side === "defense" ? "dl" : "pl";
        var crosser = s.side === "defense" ? "pl" : "dl";
        var home = pos[w];
        var explain = s.side === "defense" ? EXPLAIN.witnessDefense : c.kind === "criminal" ? EXPLAIN.witnessPlaintiffCriminal : EXPLAIN.witnessPlaintiffCivil;
        var ph2 = "Witness: " + s.name;
        guide(explain, ph2);
        var who = s.side === "defense" ? "The defense calls " : c.kind === "criminal" ? "The State calls " : "The plaintiff calls ";
        beat({ who: caller, text: who + s.name + " to the stand.", phase: ph2 });
        pos[w] = "stand";
        beat({ who: "clerk", text: "Please raise your right hand. Do you swear to tell the truth, the whole truth, and nothing but the truth?", phase: ph2 });
        beat({ who: w, text: "I do.", phase: ph2 });
        if (s.intro) guide(s.intro, ph2);
        [["Direct examination", caller, s.direct], ["Cross-examination", crosser, s.cross]].forEach(function (part) {
          var phase = part[0] + ": " + s.name;
          pos[part[1]] = "podium";
          part[2].forEach(function (l) {
            if (l.objection) {
              var objector = l.by === "defense" ? "dl" : "pl";
              beat({ who: objector, text: "Objection, Your Honor. " + l.objection + ".", phase: phase, kind: "objection" });
              beat({ who: "judge", text: l.ruling + "." + (l.ruling === "Sustained" ? " The jury will disregard that answer." : ""), phase: phase });
              guide(l.note, phase);
            } else {
              beat({ who: part[1], text: l.q, phase: phase });
              beat({ who: w, text: l.a, phase: phase, card: l.card, show: l.show, step: c.steps.indexOf(s) });
            }
          });
          pos[part[1]] = part[1] === "dl" ? "d1" : "p1";
        });
        if (s.jurorQuestion) {
          beat({ who: "judge", text: "Members of the jury, each of you may submit one written question for a witness during this trial. Would you like to ask " + s.name + " something?", phase: "Juror question", kind: "ask", step: c.steps.indexOf(s), witness: w });
        }
        beat({ who: "judge", text: "Thank you. You may step down.", phase: ph2 });
        pos[w] = home;
      }
    });
    beat({ who: "judge", text: "Members of the jury, you've heard all the evidence. You may now go to the jury room to deliberate.", phase: "To the jury room", kind: "end" });
    return beats;
  }

  function exhibit(c, label) {
    for (var i = 0; i < c.steps.length; i++) {
      var xs = c.steps[i].exhibits || [];
      for (var j = 0; j < xs.length; j++) if (xs[j].label === label) return xs[j];
    }
    return null;
  }

  // ---------- Home and guide ----------

  function renderHome() {
    var cases = CASES.map(function (c) {
      return '<article class="case-card">' +
        '<div class="case-meta"><span class="tag tag-' + c.kind + '">' + (c.kind === "criminal" ? "Criminal" : "Civil") + "</span>" +
        '<span class="docket">No. ' + esc(c.docket) + "</span></div>" +
        "<h3>" + esc(c.title) + "</h3>" +
        '<p class="caption">' + esc(c.caption) + "</p>" +
        "<p>" + esc(c.blurb) + "</p>" +
        '<div class="case-foot"><span class="muted small">' + esc(c.length) + "</span>" +
        '<button class="btn" data-action="start-case" data-id="' + c.id + '">Hear this case</button></div>' +
        "</article>";
    }).join("");

    var cast = JURORS.map(function (j) {
      return '<li class="juror-card"><span class="tok-chip">' + esc(initials(j.name)) + "</span><div><p><b>" + esc(j.name) + '</b> <span class="muted small">' + esc(j.job) + "</span></p>" +
        '<p class="muted small">' + esc(j.bio) + "</p></div></li>";
    }).join("");

    return '<header class="hero">' +
      '<p class="eyebrow">Superior Court of Maple County</p>' +
      "<h1>Jury Duty</h1>" +
      '<p class="lede">You have been summoned. Take your seat in the jury box, watch the trial unfold, and write down what matters. Then walk into the jury room and try to bring five strangers to a verdict.</p>' +
      "</header>" +
      '<section class="how"><div><p class="eyebrow">Step 1</p><h3>Watch the trial</h3><p class="muted">Witnesses take the stand, lawyers question them, and objections fly.</p></div>' +
      '<div><p class="eyebrow">Step 2</p><h3>Take notes</h3><p class="muted">Your notebook holds ' + NOTE_LIMIT + ' facts. Choose carefully, and watch out for evidence the judge throws out.</p></div>' +
      '<div><p class="eyebrow">Step 3</p><h3>Deliberate</h3><p class="muted">Use your notes to persuade the other jurors. Each one cares about different kinds of evidence.</p></div></section>' +
      '<section><div class="row-head"><h2>Today\'s docket</h2>' +
      '<button class="btn-link" data-action="guide">Courtroom basics</button></div>' +
      '<div class="cases">' + cases + "</div></section>" +
      '<section class="panel"><h2>Your fellow jurors</h2><ul class="jurors">' + cast + "</ul></section>";
  }

  function renderGuide() {
    var items = GLOSSARY.map(function (g) {
      return '<div class="term"><dt>' + esc(g[0]) + "</dt><dd>" + esc(g[1]) + "</dd></div>";
    }).join("");
    return '<button class="btn-link back" data-action="home">← Back to the docket</button>' +
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

  // ---------- Trial ----------

  function renderBoard(c) {
    var cast = castOf(c);
    var tokens = cast.map(function (p) {
      return '<g class="tok k-' + p.kind.replace(" ", " k-") + '" data-tok="' + p.id + '"><title>' + esc(p.name) + "</title>" +
        '<circle class="ring" r="18"></circle><circle class="disc" r="14"></circle>' +
        '<text class="ini" dy="3.5">' + esc(p.ini) + "</text></g>";
    }).join("");
    var pLabel = c.kind === "criminal" ? "PROSECUTION" : "PLAINTIFF";
    return '<svg class="board" viewBox="0 0 360 430" role="img" aria-label="Top-down view of the courtroom">' +
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

  function renderTrial(c) {
    return '<div class="trial">' +
      '<div class="trial-top"><button class="btn-link" data-action="home">← Leave court</button><span class="docket">' + esc(c.caption) + " · No. " + esc(c.docket) + "</span></div>" +
      '<div class="trial-grid"><div class="board-wrap">' + renderBoard(c) + '<div class="objection-banner" id="banner">OBJECTION!</div></div>' +
      '<div class="dialog" id="dialog"></div></div></div>';
  }

  function updateTrial() {
    var c = currentCase();
    var b = state.beats[state.beat];
    var board = app.querySelector(".board");
    if (!board || !b) return;

    castOf(c).forEach(function (p) {
      var g = board.querySelector('[data-tok="' + p.id + '"]');
      var spot = SPOTS[b.pos[p.id]] || SPOTS[p.home];
      g.style.transform = "translate(" + spot[0] + "px," + spot[1] + "px)";
      g.classList.toggle("speaking", b.who === p.id);
    });

    var banner = document.getElementById("banner");
    banner.classList.remove("show");
    if (b.kind === "objection") { void banner.offsetWidth; banner.classList.add("show"); }

    var p = b.who ? person(c, b.who) : null;
    var head = p
      ? '<p class="who"><span class="tok-chip k-' + p.kind.replace(" ", " k-") + '">' + esc(p.ini) + "</span><span><b>" + esc(p.name) + '</b><span class="muted small">' + esc(p.role) + "</span></span></p>"
      : '<p class="who guide-who"><span class="eyebrow">What\'s happening</span></p>';

    var extra = "";
    if (b.show) {
      var x = exhibit(c, b.show);
      if (x) extra += '<figure class="exhibit"><span class="sticker">' + esc(x.label) + "</span><figcaption>" + esc(x.title) + "</figcaption><pre>" + esc(x.body) + "</pre></figure>";
    }
    if (b.card) {
      var have = state.notes.indexOf(b.card) >= 0;
      var full = state.notes.length >= NOTE_LIMIT;
      extra += '<div class="note-row">' + (have
        ? '<span class="noted">Written in your notebook</span>'
        : full
          ? '<span class="muted small">Your notebook is full. Remove a note to make room.</span>'
          : '<button class="btn note-btn" data-action="note" data-card="' + b.card + '">Write it down</button>') +
        '<span class="card-title">' + esc(c.cards[b.card].title) + "</span></div>";
    }
    if (b.kind === "ask") {
      var s = c.steps[b.step];
      if (state.asked) {
        extra += '<p class="muted small">You have already used your one question.</p>';
      } else {
        extra += '<div class="ask">' + s.jurorQuestion.map(function (q, i) {
          return '<button class="btn ghost ask-btn" data-action="ask" data-i="' + i + '">' + esc(q.q) + "</button>";
        }).join("") + '<p class="muted small">Or tap Next to skip your question.</p></div>';
      }
    }

    var last = state.beat === state.beats.length - 1;
    document.getElementById("dialog").innerHTML =
      '<p class="phase">' + esc(b.phase || "") + '<span class="muted small">' + (state.beat + 1) + " / " + state.beats.length + "</span></p>" +
      '<div class="speech-box' + (b.who ? "" : " guide") + (b.kind === "objection" ? " objecting" : "") + '">' + head +
      '<p class="line">' + esc(b.text) + "</p>" + extra + "</div>" +
      '<div class="dialog-nav">' +
      '<button class="btn ghost" data-action="back"' + (state.beat === 0 ? " disabled" : "") + ">Back</button>" +
      '<button class="btn ghost" data-action="notebook">Notebook ' + state.notes.length + "/" + NOTE_LIMIT + "</button>" +
      '<button class="btn" data-action="advance" id="next-btn">' + (last ? "Go to the jury room" : "Next") + "</button></div>" +
      (state.showNotebook ? renderNotebook(c) : "");
  }

  function renderNotebook(c) {
    var list = state.notes.length
      ? state.notes.map(function (id) {
        return '<li><span>' + esc(c.cards[id].title) + '</span><button class="btn-link" data-action="unnote" data-card="' + id + '">Remove</button></li>';
      }).join("")
      : '<li class="muted">Nothing yet. Tap "Write it down" when a witness says something important.</li>';
    return '<div class="notebook"><p class="eyebrow">Juror notebook</p><ol>' + list + "</ol></div>";
  }

  function askQuestion(i) {
    var c = currentCase();
    var b = state.beats[state.beat];
    var q = c.steps[b.step].jurorQuestion[i];
    state.asked = true;
    var base = { pos: b.pos, phase: "Juror question" };
    state.beats.splice(state.beat + 1, 0,
      Object.assign({}, base, { who: "judge", text: "A juror asks: \"" + q.q + "\" Please answer the question." }),
      Object.assign({}, base, { who: b.witness, text: q.a, card: q.card }));
    state.beat++;
    updateTrial();
  }

  // ---------- Deliberation ----------

  function startDeliberation() {
    var c = currentCase();
    var d = { leans: Object.assign({}, c.jury.start), round: 1, log: [], used: [], strikes: 0, sel: null, target: null, pi: 0, voting: false, verdict: null, votes: null };
    state.d = d;
    say(null, "The six of you file into the jury room and sit around a long table. Ruth volunteers to be the foreperson.");
    say("ruth", "Let's go around the table and hear everyone's first impression before we argue about anything.");
    JURORS.forEach(function (j) { say(j.id, c.jury.takes[j.id]); });
    say(null, "Your turn. Pick a fact from your notebook, then choose who to say it to. Each juror is moved most by certain kinds of evidence: " +
      JURORS.map(function (j) { return j.short + " by " + j.likes.join(" and "); }).join("; ") +
      ". You have " + ROUNDS + " turns before the final vote.");
    state.screen = "deliberate";
  }

  function say(who, text, cls) {
    state.d.log.push({ who: who, text: text, cls: cls || "" });
  }

  function clamp(n) { return Math.max(0, Math.min(100, n)); }

  function mood(c, lean) {
    var t = threshold(c), w = words(c);
    if (lean >= t + 12) return { label: w.yes, cls: "m-yes" };
    if (lean >= t) return { label: "Leaning " + w.yes.toLowerCase(), cls: "m-lean-yes" };
    if (lean >= t - 15) return { label: "Leaning " + w.no.toLowerCase(), cls: "m-lean-no" };
    return { label: w.no, cls: "m-no" };
  }

  function playCard(cardId, target) {
    var c = currentCase();
    var d = state.d;
    var card = c.cards[cardId];
    var t = threshold(c);
    d.used.push(cardId);
    say("you", (target === "all" ? "" : "(to " + juror(target).short + ") ") + card.title + ".");
    if (card.struck) {
      d.strikes++;
      say("ruth", juror("ruth").say.struck);
      say(null, "The judge told the jury not to use that. Bringing it up makes the other jurors trust you less for the rest of deliberations.", "warn");
    } else {
      var cred = Math.pow(0.8, d.strikes);
      var best = null, bestDelta = 0, before = {};
      JURORS.forEach(function (j) {
        before[j.id] = d.leans[j.id];
        var likes = card.tags.some(function (tag) { return j.likes.indexOf(tag) >= 0; });
        var share = target === "all" ? 0.5 : j.id === target ? 1 : 0.25;
        // Guilt has to be proven beyond a reasonable doubt, so it's harder to argue for.
        var caution = c.kind === "criminal" && card.dir > 0 ? 0.7 : 1;
        // The further someone already leans your way, the less one more fact moves them.
        var already = card.dir > 0 ? d.leans[j.id] / 100 : 1 - d.leans[j.id] / 100;
        var delta = card.dir * card.power * 3.5 * j.sway * cred * caution * (likes ? 1.8 : 1) * (1.3 - already) * share;
        d.leans[j.id] = clamp(d.leans[j.id] + delta);
        if (Math.abs(delta) > bestDelta) { bestDelta = Math.abs(delta); best = j.id; }
      });
      var r = target === "all" ? best : target;
      var j = juror(r);
      var real = Math.abs(d.leans[r] - before[r]);
      var agrees = (before[r] >= t) === (card.dir > 0);
      say(r, agrees ? j.say.agree : real >= 8 ? j.say.moved : j.say.unmoved);
    }
    d.sel = null;
    d.target = null;
    jurorsTalk();
  }

  function jurorsTalk() {
    var c = currentCase();
    var d = state.d;
    var t = threshold(c);
    var pts = c.jury.points;
    for (var tries = 0; tries < pts.length; tries++) {
      var p = pts[d.pi % pts.length];
      d.pi++;
      var side = JURORS.filter(function (j) { return p.dir > 0 ? d.leans[j.id] >= t - 5 : d.leans[j.id] < t + 5; });
      if (!side.length) continue;
      side.sort(function (a, b) { return p.dir > 0 ? d.leans[b.id] - d.leans[a.id] : d.leans[a.id] - d.leans[b.id]; });
      var speaker = side[0];
      say(speaker.id, p.text);
      if (p.struck) {
        var fixer = speaker.id === "ruth" ? "tasha" : "ruth";
        say(fixer, juror("ruth").say.struck);
      } else {
        JURORS.forEach(function (j) {
          if (j.id !== speaker.id) d.leans[j.id] = clamp(d.leans[j.id] + p.dir * 6 * j.sway);
        });
        // Saying it out loud makes the speaker a little more sure of themselves.
        d.leans[speaker.id] = clamp(d.leans[speaker.id] + p.dir * 4);
      }
      break;
    }
    d.round++;
    if (d.round > ROUNDS) {
      say(null, "Hours have passed. A note arrives from the judge asking whether the jury has reached a verdict. It's time for a final vote.");
      d.voting = true;
    }
  }

  function castVotes(mine) {
    var c = currentCase();
    var d = state.d;
    var w = words(c);
    var t = threshold(c);
    var votes = { you: mine };
    JURORS.forEach(function (j) { votes[j.id] = d.leans[j.id] >= t ? w.yesId : w.noId; });
    var yes = 0;
    Object.keys(votes).forEach(function (k) { if (votes[k] === w.yesId) yes++; });
    var no = 6 - yes;
    var need = needed(c);
    d.votes = votes;
    say(null, "Ruth reads the ballots: " + w.yes + " " + yes + ", " + w.no + " " + no + ".", "tally");
    d.voting = false;
    if (yes >= need) d.verdict = w.yesId;
    else if (no >= need) d.verdict = w.noId;
    else if (d.round > ROUNDS) d.verdict = "mistrial";
    else say("ruth", "That's not enough to reach a verdict. We need " + need + " of 6 to agree. Let's keep talking.");
    if (d.verdict) state.screen = "verdict";
  }

  function tableSeat(i) {
    // You sit at the bottom of the table; the others go around it.
    var angle = Math.PI / 2 + (i * 2 * Math.PI) / 6;
    return [180 + Math.cos(angle) * 140, 112 + Math.sin(angle) * 84];
  }

  function renderDeliberation(c) {
    var d = state.d;
    var people = [{ id: "you", name: "You", ini: "YOU" }].concat(JURORS.map(function (j) { return { id: j.id, name: j.short, ini: initials(j.name) }; }));
    var seats = people.map(function (p, i) {
      var xy = tableSeat(i);
      var m = p.id === "you" ? { label: "You", cls: "m-you" } : mood(c, d.leans[p.id]);
      var pickable = p.id !== "you" && d.sel && !d.voting;
      return '<g class="seat ' + m.cls + (d.target === p.id ? " targeted" : "") + (pickable ? " pickable" : "") + '" transform="translate(' + xy[0].toFixed(1) + " " + xy[1].toFixed(1) + ')"' +
        (pickable ? ' data-action="target" data-id="' + p.id + '" tabindex="0" role="button" aria-label="Talk to ' + esc(p.name) + '"' : "") + ">" +
        '<circle class="ring" r="20"></circle><circle class="disc" r="15"></circle><text class="ini" dy="3.5">' + esc(p.ini) + "</text>" +
        '<text class="seat-name" y="33">' + esc(p.name) + '</text><text class="seat-mood" y="45">' + esc(p.id === "you" ? "" : m.label) + "</text></g>";
    }).join("");

    var log = d.log.map(function (l) {
      if (!l.who) return '<li class="sys ' + l.cls + '">' + esc(l.text) + "</li>";
      var nm = l.who === "you" ? "You" : juror(l.who).short;
      return '<li class="msg' + (l.who === "you" ? " mine" : "") + '"><b>' + esc(nm) + "</b><span>" + esc(l.text) + "</span></li>";
    }).join("");

    var hand = state.notes.filter(function (id) { return d.used.indexOf(id) < 0; });
    var cards = hand.length ? hand.map(function (id) {
      var card = c.cards[id];
      return '<button class="fact' + (d.sel === id ? " selected" : "") + '" data-action="select" data-card="' + id + '" aria-pressed="' + (d.sel === id) + '">' +
        esc(card.title) + '<span class="fact-tags">' + card.tags.map(esc).join(" · ") + "</span></button>";
    }).join("") : '<p class="muted small">Your notebook has nothing left to use. You can still listen to the others and vote.</p>';

    var w = words(c);
    var controls;
    if (d.voting) {
      controls = '<div class="vote-box"><p><b>Cast your vote.</b> ' + (c.kind === "criminal" ? "All six must agree." : "Five of six must agree.") + "</p>" +
        '<div class="vote-btns"><button class="btn" data-action="cast" data-v="' + w.yesId + '">' + w.yes + '</button><button class="btn" data-action="cast" data-v="' + w.noId + '">' + w.no + "</button></div>" +
        (d.round <= ROUNDS ? '<button class="btn-link" data-action="cancel-vote">Keep talking instead</button>' : "") + "</div>";
    } else {
      var targets = '<div class="targets"><span class="muted small">Say it to:</span>' + JURORS.map(function (j) {
        return '<button class="chip-btn' + (d.target === j.id ? " on" : "") + '" data-action="target" data-id="' + j.id + '"' + (d.sel ? "" : " disabled") + ">" + esc(j.short) + "</button>";
      }).join("") + '<button class="chip-btn' + (d.target === "all" ? " on" : "") + '" data-action="target" data-id="all"' + (d.sel ? "" : " disabled") + ">Whole table</button></div>";
      controls = '<div class="hand">' + cards + "</div>" + targets +
        '<div class="dialog-nav"><button class="btn ghost" data-action="listen">Let others talk</button>' +
        '<button class="btn ghost" data-action="call-vote">Call a vote</button>' +
        '<button class="btn" data-action="speak"' + (d.sel && d.target ? "" : " disabled") + ">Make your point</button></div>";
    }

    return '<div class="trial">' +
      '<div class="trial-top"><button class="btn-link" data-action="home">← Leave court</button><span class="docket">Jury room · Turn ' + Math.min(d.round, ROUNDS) + " of " + ROUNDS + "</span></div>" +
      '<div class="trial-grid"><div class="room">' +
      '<svg class="table-svg" viewBox="0 0 360 252" role="img" aria-label="The jury table">' +
      '<ellipse class="tabletop" cx="180" cy="112" rx="86" ry="32"></ellipse>' + seats + "</svg>" +
      '<ol class="log" id="log">' + log + "</ol></div>" +
      '<div class="dialog"><p class="phase">Your notebook<span class="muted small">' + hand.length + (hand.length === 1 ? " fact" : " facts") + " left</span></p>" + controls + "</div></div></div>";
  }

  function renderVerdict(c) {
    var d = state.d;
    var w = words(c);
    var v = d.verdict;
    var title = v === "mistrial" ? "Hung jury" : v === w.yesId ? w.yes : w.no;
    var vw = function (id) { return id === w.yesId ? w.yes : w.no; };
    var ballots = ["you"].concat(JURORS.map(function (j) { return j.id; })).map(function (id, i) {
      return '<li class="vote-card" style="animation-delay:' + (i * 0.3) + 's"><b>' + (id === "you" ? "You" : juror(id).short) + "</b>" + vw(d.votes[id]) + "</li>";
    }).join("");

    var usable = Object.keys(c.cards).filter(function (k) { return !c.cards[k].struck; }).length;
    var good = state.notes.filter(function (k) { return !c.cards[k].struck; }).length;
    var badNotes = state.notes.filter(function (k) { return c.cards[k].struck; }).length;
    var lawful = v === c.truth.lawful;
    var actual = v === c.truth.actual;
    var report = [
      ["Followed the law", v === "mistrial" ? "No verdict. The case would be tried again with a new jury." : lawful ? "Yes. Under the judge's instructions, the evidence supports this verdict." : "No. Under the judge's instructions, the evidence pointed the other way.", v !== "mistrial" && lawful],
      ["Matched what really happened", v === "mistrial" ? "No verdict." : actual ? "Yes." : "No. See what really happened, above.", v !== "mistrial" && actual],
      ["Notes taken", good + " useful facts written down" + (badNotes ? ", plus " + badNotes + " the judge threw out" : "") + ". You asked " + (state.asked ? "one" : "no") + " juror question.", good >= 5 && !badNotes],
      ["Played by the rules", d.strikes ? "You used thrown-out evidence " + d.strikes + (d.strikes === 1 ? " time." : " times.") : "You only argued with admitted evidence.", !d.strikes]
    ].map(function (r) {
      return '<li class="' + (r[2] ? "ok" : "miss") + '"><b>' + r[0] + "</b><span>" + esc(r[1]) + "</span></li>";
    }).join("");

    return '<header class="page-head verdict"><p class="eyebrow">' + esc(c.caption) + " · The foreperson reads the verdict</p><h1>" + title + "</h1>" +
      (v === "mistrial" ? "<p>The jury couldn't reach the required agreement, so the judge declares a mistrial.</p>" : "") + "</header>" +
      '<section class="panel"><p class="muted small">The ballots</p><ol class="votes">' + ballots + "</ol></section>" +
      '<section class="panel"><p class="eyebrow">What really happened</p><h2>' + esc(c.truth.headline) + "</h2><p>" + esc(c.truth.story) + "</p></section>" +
      '<section class="panel tip"><h2>What this case teaches</h2><p>' + esc(c.truth.lesson) + "</p></section>" +
      '<section class="panel"><h2>Your jury service</h2><ul class="report">' + report + "</ul></section>" +
      '<nav class="nav"><button class="btn ghost" data-action="start-case" data-id="' + c.id + '">Retry this case</button><button class="btn" data-action="home">Back to the docket</button></nav>';
  }

  // ---------- Rendering and events ----------

  function render() {
    var c = currentCase();
    var html;
    switch (state.screen) {
      case "guide": html = renderGuide(); break;
      case "trial": html = renderTrial(c); break;
      case "deliberate": html = renderDeliberation(c); break;
      case "verdict": html = renderVerdict(c); break;
      default: html = renderHome();
    }
    app.innerHTML = '<main class="wrap screen-' + state.screen + '">' + html + "</main>";
    if (state.screen === "trial") updateTrial();
    var log = document.getElementById("log");
    if (log) log.scrollTop = log.scrollHeight;
  }

  function go(screen) {
    state.screen = screen;
    render();
    window.scrollTo(0, 0);
  }

  function advance() {
    if (state.screen !== "trial") return;
    if (state.beat < state.beats.length - 1) { state.beat++; updateTrial(); }
    else { startDeliberation(); go("deliberate"); }
  }

  app.addEventListener("click", function (e) {
    var b = e.target.closest("[data-action]");
    if (!b || b.disabled) return;
    var c = currentCase();
    var d = state.d;
    switch (b.dataset.action) {
      case "home": go("home"); break;
      case "guide": go("guide"); break;
      case "start-case":
        state = defaultState();
        state.caseId = b.dataset.id;
        state.beats = buildBeats(currentCase());
        go("trial");
        break;
      case "advance": advance(); break;
      case "back": if (state.beat > 0) { state.beat--; updateTrial(); } break;
      case "note":
        if (state.notes.length < NOTE_LIMIT && state.notes.indexOf(b.dataset.card) < 0) state.notes.push(b.dataset.card);
        updateTrial();
        break;
      case "unnote":
        state.notes = state.notes.filter(function (id) { return id !== b.dataset.card; });
        updateTrial();
        break;
      case "notebook": state.showNotebook = !state.showNotebook; updateTrial(); break;
      case "ask": askQuestion(Number(b.dataset.i)); break;
      case "select": d.sel = d.sel === b.dataset.card ? null : b.dataset.card; render(); break;
      case "target": if (d.sel) { d.target = b.dataset.id; render(); } break;
      case "speak": if (d.sel && d.target) { playCard(d.sel, d.target); render(); } break;
      case "listen":
        say("you", "(You stay quiet and let the others talk.)");
        jurorsTalk();
        render();
        break;
      case "call-vote": d.voting = true; render(); break;
      case "cancel-vote": d.voting = false; render(); break;
      case "cast": castVotes(b.dataset.v); render(); window.scrollTo(0, 0); break;
    }
    if (c && state.screen === "trial" && b.dataset.action === "advance") {
      var next = document.getElementById("next-btn");
      if (next) next.focus();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (state.screen !== "trial") return;
    if (e.target.closest && e.target.closest("button, input, textarea")) return;
    if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") { e.preventDefault(); advance(); }
    else if (e.key === "ArrowLeft" && state.beat > 0) { state.beat--; updateTrial(); }
  });

  // Keep the game in progress when a new version of the page is published.
  var hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) hot.snapshot(function () { return state; });
  function start(data) {
    if (data && data.screen && (data.screen === "home" || data.caseId)) state = Object.assign(defaultState(), data);
    render();
  }
  if (hot && hot.ready) hot.ready(start);
  else start(hot && hot.data);
})();
