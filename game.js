(function () {
  "use strict";

  var app = document.getElementById("app");
  var CASES = window.CASES || [];

  // Short explanations shown with each part of the trial, for players who
  // have never been in a courtroom.
  var EXPLAIN = {
    judge: "The judge runs the courtroom and decides questions of law. You, the jury, decide the facts: what actually happened and whether it was proven.",
    opening: "An opening statement is a lawyer's preview of the case. It is not evidence. Listen for what each side promises to prove, then check later whether they did.",
    witnessPlaintiffCriminal: "The prosecution goes first because it carries the burden of proof. First comes direct examination: the lawyer who called the witness asks open questions. Then the other side cross-examines, usually with pointed yes-or-no questions meant to test the story.",
    witnessPlaintiffCivil: "The plaintiff is the person who brought the lawsuit, so their side goes first. Direct examination comes first, then the other side cross-examines to test the story.",
    witnessDefense: "Now the defense presents its side. The defense never has to prove anything or call any witnesses, but it may. The other side gets to cross-examine.",
    closing: "In a closing argument, each lawyer tells you what they think the evidence showed. Like openings, closings are not evidence. Judge them against what the witnesses actually said.",
    instructions: "Before you deliberate, the judge explains the law you must apply. The verdict must follow these rules, even if you would have written them differently."
  };

  var GLOSSARY = [
    ["Jury", "A group of ordinary people who listen to the evidence and decide what happened. Criminal juries usually have 12 people; civil juries often have 6 to 12."],
    ["Criminal case", "The government (the State, or the People) accuses someone of a crime. The person accused is the defendant. A conviction can mean jail."],
    ["Civil case", "One person or company sues another, usually for money. The person suing is the plaintiff. Nobody goes to jail."],
    ["Beyond a reasonable doubt", "The standard in criminal cases. You must be firmly convinced the defendant is guilty. It's the highest standard in law."],
    ["Preponderance of the evidence", "The standard in most civil cases. Is it more likely than not? Even 51% is enough."],
    ["Presumption of innocence", "A criminal defendant starts out innocent in the eyes of the law. The State has to prove otherwise. The defendant doesn't have to prove anything."],
    ["Evidence", "Testimony from witnesses, documents, photos and objects. Lawyers' statements and questions are not evidence. Only the witnesses' answers are."],
    ["Exhibit", "A physical item or document admitted as evidence, labeled like \"State's Exhibit 1\" or \"Defense Exhibit A.\""],
    ["Direct examination", "Questions from the lawyer who called the witness."],
    ["Cross-examination", "Questions from the other side's lawyer, meant to test or poke holes in the testimony."],
    ["Objection", "A lawyer's protest that a question or answer breaks the rules of evidence. The judge rules: \"Sustained\" means the objection wins and the jury ignores it. \"Overruled\" means it loses."],
    ["Hearsay", "Repeating what someone else said outside of court to prove it's true. Usually not allowed, because that person can't be cross-examined."],
    ["Circumstantial evidence", "Facts that let you infer something else. Wet streets suggest it rained. It counts just as much as direct evidence."],
    ["Deliberation", "The jury's private discussion after the trial. The foreperson leads it and announces the verdict."],
    ["Hung jury", "When the jury can't reach the required agreement. The judge declares a mistrial, and the case may be tried again with a new jury."]
  ];

  var state = loadState();
  var timer = { id: null, endsAt: 0 };

  function defaultState() {
    return {
      screen: "home",
      players: [],
      caseId: null,
      step: 0,
      foreperson: 0,
      votes: [],
      ballot: 0,
      ballotOpen: false,
      round: 1,
      verdict: null,
      notes: {},
      notesOpen: false
    };
  }

  function loadState() {
    var s = defaultState();
    try {
      var saved = JSON.parse(localStorage.getItem("jury-duty-players") || "[]");
      if (Array.isArray(saved)) s.players = saved.filter(function (p) { return typeof p === "string"; }).slice(0, 12);
    } catch (e) {}
    return s;
  }

  function savePlayers() {
    try { localStorage.setItem("jury-duty-players", JSON.stringify(state.players)); } catch (e) {}
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function paras(lines) {
    return lines.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("");
  }

  function currentCase() {
    for (var i = 0; i < CASES.length; i++) if (CASES[i].id === state.caseId) return CASES[i];
    return null;
  }

  function jurors() {
    return state.players.length ? state.players : ["Juror 1"];
  }

  function verdictWords(c) {
    return c.kind === "criminal"
      ? { yes: "Guilty", no: "Not guilty", yesId: "guilty", noId: "not-guilty" }
      : { yes: "Liable", no: "Not liable", yesId: "liable", noId: "not-liable" };
  }

  function needed(c, n) {
    return c.kind === "criminal" ? n : Math.ceil(n * 0.75);
  }

  function sideLabel(c, side) {
    if (side === "defense") return "Defense";
    return c.kind === "criminal" ? "Prosecution" : "Plaintiff";
  }

  function stepLabel(c, s) {
    switch (s.type) {
      case "judge": return "Judge's welcome";
      case "opening": return "Opening: " + sideLabel(c, s.side);
      case "witness": return "Witness: " + s.name;
      case "closing": return "Closing: " + sideLabel(c, s.side);
      case "instructions": return "Jury instructions";
    }
    return "";
  }

  // ---------- Screens ----------

  function renderHome() {
    var players = state.players.map(function (p, i) {
      return '<li class="chip"><span class="chip-num">' + (i + 1) + "</span>" + esc(p) +
        '<button class="chip-x" data-action="remove-player" data-i="' + i + '" aria-label="Remove ' + esc(p) + '">×</button></li>';
    }).join("");

    var cases = CASES.map(function (c) {
      return '<article class="case-card">' +
        '<div class="case-meta"><span class="tag tag-' + c.kind + '">' + (c.kind === "criminal" ? "Criminal" : "Civil") + "</span>" +
        '<span class="docket">No. ' + esc(c.docket) + "</span></div>" +
        "<h3>" + esc(c.title) + "</h3>" +
        '<p class="caption">' + esc(c.caption) + "</p>" +
        "<p>" + esc(c.blurb) + "</p>" +
        '<div class="case-foot"><span class="muted">' + esc(c.length) + "</span>" +
        '<button class="btn" data-action="start-case" data-id="' + c.id + '">Hear this case</button></div>' +
        "</article>";
    }).join("");

    return '<header class="hero">' +
      '<p class="eyebrow">Superior Court of Maple County</p>' +
      "<h1>Jury Duty</h1>" +
      '<p class="lede">You have been summoned. Listen to the trial, argue it out with your fellow jurors, and vote on a verdict. Then find out what really happened.</p>' +
      "</header>" +
      '<section class="panel">' +
      "<h2>Seat the jury</h2>" +
      '<p class="muted">Add everyone playing. You will pass one device around for secret ballots at the end.</p>' +
      '<form class="add-player" data-action="add-player">' +
      '<label for="player-name" class="sr-only">Juror name</label>' +
      '<input id="player-name" type="text" maxlength="24" placeholder="Juror name" autocomplete="off">' +
      '<button class="btn" type="submit">Add juror</button></form>' +
      (players ? '<ol class="chips">' + players + "</ol>" : '<p class="muted small">No jurors yet. You can also play solo.</p>') +
      "</section>" +
      '<section><div class="row-head"><h2>Today\'s docket</h2>' +
      '<button class="btn-link" data-action="guide">Courtroom basics</button></div>' +
      '<div class="cases">' + cases + "</div></section>" +
      '<section class="panel tip"><h2>Play it like a table read</h2>' +
      "<p>Give out parts: one friend reads the judge, two play the lawyers, and others voice the witnesses. Everyone else just listens like a real juror. The jurors decide together at the end.</p></section>";
  }

  function renderGuide() {
    var items = GLOSSARY.map(function (g) {
      return "<div class=\"term\"><dt>" + esc(g[0]) + "</dt><dd>" + esc(g[1]) + "</dd></div>";
    }).join("");
    return '<button class="btn-link back" data-action="home">← Back to the docket</button>' +
      '<header class="page-head"><p class="eyebrow">Juror handbook</p><h1>Courtroom basics</h1></header>' +
      '<section class="panel"><h2>How a trial goes</h2><ol class="flow">' +
      "<li><b>The judge</b> welcomes the jury and explains the case.</li>" +
      "<li><b>Opening statements.</b> Each side previews its story.</li>" +
      "<li><b>The prosecution or plaintiff's case.</b> Their witnesses testify and are cross-examined.</li>" +
      "<li><b>The defense case.</b> The defense may call witnesses, but doesn't have to.</li>" +
      "<li><b>Closing arguments.</b> Each side argues what the evidence proved.</li>" +
      "<li><b>Jury instructions.</b> The judge explains the law.</li>" +
      "<li><b>Deliberation and verdict.</b> The jury talks it over privately and votes.</li>" +
      "</ol></section>" +
      '<section class="panel"><h2>Words you\'ll hear</h2><dl class="glossary">' + items + "</dl></section>";
  }

  function renderStepper(c) {
    var total = c.steps.length + 1;
    var dots = c.steps.map(function (s, i) {
      var cls = i < state.step ? "done" : i === state.step ? "now" : "";
      return '<li class="' + cls + '" title="' + esc(stepLabel(c, s)) + '"></li>';
    }).join("");
    dots += '<li class="' + (state.screen === "case" ? "" : "now") + '" title="Deliberation"></li>';
    var label = state.screen === "case" ? stepLabel(c, c.steps[state.step]) : "Deliberation";
    var n = state.screen === "case" ? state.step + 1 : total;
    return '<div class="stepper"><div class="stepper-text"><span class="docket">' + esc(c.caption) +
      '</span><span class="muted small">Part ' + n + " of " + total + " · " + esc(label) + "</span></div>" +
      '<ol class="dots" aria-hidden="true">' + dots + "</ol></div>";
  }

  function renderTranscript(lines, plaintiffLawyer, defenseLawyer) {
    return lines.map(function (l) {
      if (l.objection) {
        var lawyer = l.by === "defense" ? defenseLawyer : plaintiffLawyer;
        return '<div class="objection"><p><b>' + esc(lawyer) + ":</b> Objection, Your Honor. " + esc(l.objection) + ".</p>" +
          "<p><b>The Court:</b> " + esc(l.ruling) + "." + (l.ruling === "Sustained" ? " The jury will disregard that answer." : "") + "</p>" +
          '<p class="aside">' + esc(l.note) + "</p></div>";
      }
      return '<div class="qa"><span class="qa-tag">Q.</span><p>' + esc(l.q) + '</p><span class="qa-tag">A.</span><p>' + esc(l.a) + "</p></div>";
    }).join("");
  }

  function renderStep(c) {
    var s = c.steps[state.step];
    var body = "";
    var explain = "";
    var pl = c.parties.plaintiff.lawyer, dl = c.parties.defense.lawyer;

    if (s.type === "judge" || s.type === "instructions") {
      explain = EXPLAIN[s.type];
      body = '<div class="speech bench"><p class="speaker">' + esc(s.speaker) + "</p>" + paras(s.text) + "</div>";
    } else if (s.type === "opening" || s.type === "closing") {
      explain = EXPLAIN[s.type];
      body = '<div class="speech side-' + (s.side === "defense" ? "def" : "pros") + '"><p class="speaker">' + esc(s.speaker) +
        ' <span class="muted">for ' + esc(s.side === "defense" ? c.parties.defense.label : c.parties.plaintiff.label) + "</span></p>" + paras(s.text) + "</div>";
    } else if (s.type === "witness") {
      explain = s.side === "defense" ? EXPLAIN.witnessDefense : (c.kind === "criminal" ? EXPLAIN.witnessPlaintiffCriminal : EXPLAIN.witnessPlaintiffCivil);
      var directBy = s.side === "defense" ? dl : pl;
      var crossBy = s.side === "defense" ? pl : dl;
      var exhibits = (s.exhibits || []).map(function (x) {
        return '<figure class="exhibit"><span class="sticker">' + esc(x.label) + "</span>" +
          "<figcaption>" + esc(x.title) + "</figcaption><pre>" + esc(x.body) + "</pre></figure>";
      }).join("");
      body = '<div class="witness-head"><div><p class="eyebrow">Called by the ' + sideLabel(c, s.side).toLowerCase() + "</p>" +
        "<h2>" + esc(s.name) + '</h2><p class="muted">' + esc(s.role) + "</p></div>" +
        '<p class="oath">The witness is sworn in and promises to tell the truth.</p></div>' +
        (s.intro ? '<p class="aside">' + esc(s.intro) + "</p>" : "") +
        '<h3 class="exam">Direct examination <span class="muted">by ' + esc(directBy) + "</span></h3>" +
        '<div class="transcript">' + renderTranscript(s.direct, pl, dl) + "</div>" +
        '<h3 class="exam">Cross-examination <span class="muted">by ' + esc(crossBy) + "</span></h3>" +
        '<div class="transcript">' + renderTranscript(s.cross, pl, dl) + "</div>" +
        (exhibits ? '<h3 class="exam">Evidence admitted</h3><div class="exhibits">' + exhibits + "</div>" : "");
    }

    var isLast = state.step === c.steps.length - 1;
    return renderStepper(c) +
      '<div class="what"><p class="eyebrow">What\'s happening</p><p>' + esc(explain) + "</p></div>" +
      '<article class="stage">' + (s.type === "witness" ? "" : '<h2 class="stage-title">' + esc(stepLabel(c, s)) + "</h2>") + body + "</article>" +
      '<nav class="nav">' +
      (state.step > 0 ? '<button class="btn ghost" data-action="prev">Back</button>' : '<button class="btn ghost" data-action="home">Leave court</button>') +
      '<button class="btn" data-action="next">' + (isLast ? "Go to the jury room" : "Continue") + "</button></nav>";
  }

  function renderDeliberate(c) {
    var js = jurors();
    var words = verdictWords(c);
    var need = needed(c, js.length);
    var rule = c.kind === "criminal"
      ? "This is a criminal case, so the verdict must be unanimous: all " + js.length + " of you must agree."
      : "This is a civil case, so at least " + need + " of " + js.length + " jurors must agree.";
    var qs = c.questions.map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("");
    var mins = [3, 5, 10].map(function (m) {
      return '<button class="btn ghost small" data-action="timer" data-min="' + m + '">' + m + " min</button>";
    }).join("");
    return renderStepper(c) +
      '<header class="page-head"><p class="eyebrow">The jury room' + (state.round > 1 ? " · Round " + state.round : "") + "</p><h1>Deliberate</h1></header>" +
      '<section class="panel foreperson"><p class="muted small">Your foreperson</p><p class="big">' + esc(js[state.foreperson]) + "</p>" +
      "<p>The foreperson leads the discussion and makes sure everyone gets heard. Go around the room before anyone votes.</p></section>" +
      '<section class="panel"><h2>Talk it through</h2><ol class="questions">' + qs + "</ol>" +
      '<p class="muted small">Only the witnesses\' answers and the exhibits are evidence. Ignore anything the judge struck.</p></section>' +
      '<section class="panel"><h2>Deliberation timer</h2><div class="timer"><span id="clock" class="clock">' + clockText() + "</span>" +
      '<div class="timer-btns">' + mins + "</div></div></section>" +
      '<section class="panel rule"><h2>The vote</h2><p>' + esc(rule) + "</p>" +
      "<p>Each juror votes in secret: <b>" + words.yes + "</b> or <b>" + words.no + "</b>.</p></section>" +
      '<nav class="nav"><button class="btn ghost" data-action="review">Review the trial</button>' +
      '<button class="btn" data-action="begin-vote">Start the secret ballot</button></nav>';
  }

  function renderBallot(c) {
    var js = jurors();
    var name = js[state.ballot];
    var words = verdictWords(c);
    if (!state.ballotOpen) {
      return '<div class="handoff"><p class="eyebrow">Secret ballot ' + (state.ballot + 1) + " of " + js.length + "</p>" +
        "<h1>Pass the device to " + esc(name) + "</h1>" +
        '<p class="muted">Everyone else, look away.</p>' +
        '<button class="btn big" data-action="open-ballot">I\'m ' + esc(name) + ", show my ballot</button></div>";
    }
    return '<div class="handoff ballot-card"><p class="eyebrow">' + esc(c.caption) + "</p>" +
      "<h1>" + esc(name) + ", how do you find?</h1>" +
      '<p class="muted">' + esc(c.charge) + "</p>" +
      '<div class="ballot-choices">' +
      '<button class="btn choice" data-action="vote" data-v="' + words.yesId + '">' + words.yes + "</button>" +
      '<button class="btn choice" data-action="vote" data-v="' + words.noId + '">' + words.no + "</button></div></div>";
  }

  function tally(c) {
    var words = verdictWords(c);
    var yes = state.votes.filter(function (v) { return v === words.yesId; }).length;
    return { yes: yes, no: state.votes.length - yes, words: words };
  }

  function renderResult(c) {
    var t = tally(c);
    var js = jurors();
    var need = needed(c, js.length);
    var outcome = t.yes >= need ? t.words.yesId : t.no >= need ? t.words.noId : null;
    var cards = state.votes.map(function (v, i) {
      return '<li class="vote-card" style="animation-delay:' + (i * 0.35) + 's">' + (v === t.words.yesId ? t.words.yes : t.words.no) + "</li>";
    }).join("");
    var head = outcome
      ? "<h1>" + (outcome === t.words.yesId ? t.words.yes : t.words.no) + "</h1><p>The jury has reached a verdict.</p>"
      : "<h1>Hung jury</h1><p>You needed " + need + " jurors to agree. The jury is split " + t.yes + " to " + t.no + ".</p>";
    var actions = outcome
      ? '<button class="btn" data-action="truth" data-outcome="' + outcome + '">Find out what really happened</button>'
      : '<button class="btn ghost" data-action="mistrial">Declare a mistrial</button><button class="btn" data-action="deliberate-again">Deliberate again</button>';
    return '<header class="page-head verdict"><p class="eyebrow">' + esc(js[state.foreperson]) + ", the foreperson, reads the verdict</p>" + head + "</header>" +
      '<section class="panel"><p class="muted small">The ballots</p><ol class="votes">' + cards + "</ol>" +
      '<p class="tally">' + t.words.yes + ": " + t.yes + " · " + t.words.no + ": " + t.no + "</p></section>" +
      (outcome ? "" : '<p class="aside">In a real trial, the judge may send the jury back to keep talking. If they truly can\'t agree, it\'s a mistrial and the case can be tried again with a new jury.</p>') +
      '<nav class="nav">' + actions + "</nav>";
  }

  function renderTruth(c) {
    var words = verdictWords(c);
    var v = state.verdict;
    var yourLine = v === "mistrial" ? "Mistrial (hung jury)" : v === words.yesId ? words.yes : words.no;
    var actualWord = c.truth.actual === words.yesId ? words.yes : words.no;
    return '<header class="page-head"><p class="eyebrow">' + esc(c.caption) + " · Case closed</p><h1>" + esc(c.truth.headline) + "</h1></header>" +
      '<section class="compare"><div class="panel"><p class="muted small">Your jury\'s verdict</p><p class="big">' + esc(yourLine) + "</p></div>" +
      '<div class="panel"><p class="muted small">The real answer</p><p class="big">' + esc(actualWord) + "</p></div></section>" +
      '<section class="panel"><h2>What really happened</h2><p>' + esc(c.truth.story) + "</p></section>" +
      '<section class="panel tip"><h2>What this case teaches</h2><p>' + esc(c.truth.lesson) + "</p></section>" +
      '<nav class="nav"><button class="btn" data-action="home">Back to the docket</button></nav>';
  }

  function renderNotes() {
    if (!state.caseId || state.screen === "home" || state.screen === "guide") return "";
    var text = state.notes[state.caseId] || "";
    return '<div class="notes' + (state.notesOpen ? " open" : "") + '">' +
      '<button class="notes-toggle" data-action="toggle-notes" aria-expanded="' + state.notesOpen + '">' + (state.notesOpen ? "Close notes" : "Juror notes") + "</button>" +
      (state.notesOpen ? '<label for="notes-text" class="sr-only">Juror notes</label><textarea id="notes-text" placeholder="Jot down anything that seems important.">' + esc(text) + "</textarea>" : "") +
      "</div>";
  }

  function render() {
    var c = currentCase();
    var html;
    switch (state.screen) {
      case "guide": html = renderGuide(); break;
      case "case": html = renderStep(c); break;
      case "deliberate": html = renderDeliberate(c); break;
      case "ballot": html = renderBallot(c); break;
      case "result": html = renderResult(c); break;
      case "truth": html = renderTruth(c); break;
      default: html = renderHome();
    }
    app.innerHTML = '<main class="wrap screen-' + state.screen + '">' + html + "</main>" + renderNotes();
  }

  function go(screen) {
    if (screen !== "deliberate") stopTimer();
    state.screen = screen;
    render();
    window.scrollTo(0, 0);
  }

  // ---------- Timer ----------

  function clockText() {
    var left = Math.max(0, Math.round((timer.endsAt - Date.now()) / 1000));
    if (!timer.endsAt) return "--:--";
    if (left === 0) return "Time's up";
    return Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0");
  }

  function startTimer(min) {
    stopTimer();
    timer.endsAt = Date.now() + min * 60000;
    timer.id = setInterval(function () {
      var el = document.getElementById("clock");
      if (el) el.textContent = clockText();
      if (Date.now() >= timer.endsAt) clearInterval(timer.id);
    }, 500);
    var el = document.getElementById("clock");
    if (el) el.textContent = clockText();
  }

  function stopTimer() {
    clearInterval(timer.id);
    timer.id = null;
    timer.endsAt = 0;
  }

  // ---------- Events ----------

  app.addEventListener("submit", function (e) {
    e.preventDefault();
    var input = document.getElementById("player-name");
    var name = input.value.trim();
    if (name && state.players.length < 12) {
      state.players.push(name);
      savePlayers();
      render();
      var again = document.getElementById("player-name");
      if (again) again.focus();
    }
  });

  app.addEventListener("input", function (e) {
    if (e.target.id === "notes-text") state.notes[state.caseId] = e.target.value;
  });

  app.addEventListener("click", function (e) {
    var b = e.target.closest("[data-action]");
    if (!b || b.tagName === "FORM") return;
    var c = currentCase();
    switch (b.dataset.action) {
      case "home": go("home"); break;
      case "guide": go("guide"); break;
      case "remove-player":
        state.players.splice(Number(b.dataset.i), 1);
        savePlayers();
        render();
        break;
      case "start-case":
        state.caseId = b.dataset.id;
        state.step = 0;
        state.round = 1;
        state.votes = [];
        state.verdict = null;
        state.foreperson = Math.floor(Math.random() * jurors().length);
        go("case");
        break;
      case "prev": state.step--; go("case"); break;
      case "next":
        if (state.step < c.steps.length - 1) { state.step++; go("case"); }
        else go("deliberate");
        break;
      case "review": state.step = 0; go("case"); break;
      case "timer": startTimer(Number(b.dataset.min)); break;
      case "begin-vote":
        state.votes = [];
        state.ballot = 0;
        state.ballotOpen = false;
        go("ballot");
        break;
      case "open-ballot": state.ballotOpen = true; render(); break;
      case "vote":
        state.votes.push(b.dataset.v);
        state.ballotOpen = false;
        if (state.votes.length < jurors().length) { state.ballot++; render(); }
        else go("result");
        break;
      case "deliberate-again": state.round++; go("deliberate"); break;
      case "mistrial": state.verdict = "mistrial"; go("truth"); break;
      case "truth": state.verdict = b.dataset.outcome; go("truth"); break;
      case "toggle-notes":
        state.notesOpen = !state.notesOpen;
        render();
        if (state.notesOpen) { var t = document.getElementById("notes-text"); if (t) t.focus(); }
        break;
    }
  });

  // Keep the game in progress when a new version of the page is published.
  var hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) hot.snapshot(function () { return state; });
  function start(data) {
    if (data && data.screen) state = Object.assign(defaultState(), data);
    render();
  }
  if (hot && hot.ready) hot.ready(start);
  else start(hot && hot.data);
})();
