// The game's rules, with no screen code. Solo play and the courtroom screen in
// a multiplayer game both keep one game object and change it only through
// apply(), so the same rules drive both. Terms follow GLOSSARY.md.
(function () {
  "use strict";

  var CASES = window.CASES || [];
  var TRIES = 3;
  // How long a fact can be written down after its line first appears.
  var FACT_MS = 15000;
  // The game's clock. Tests can replace it with setClock().
  var now = function () { return Date.now(); };
  // A computer juror's mood can move at most this much from reactions during the trial.
  var REACT_CAP = 10;
  // How hard an unanswered counter-argument pulls the other computer jurors, per point of the fact's power.
  var COUNTER_PULL = 2;

  // Each contradiction's bonus fact joins the case's facts, so it can be
  // argued like any other fact once a juror earns it.
  CASES.forEach(function (c) {
    (c.contradictions || []).forEach(function (x) {
      c.cards[x.id] = Object.assign({ bonus: true, explain: x.explain }, x.bonus);
    });
  });
  var JURORS = window.JURORS || [];
  var NOTE_LIMIT = 7;
  var ROUNDS = 6;
  var SEATS = 6;
  var NAME_MAX = 16;
  // As people join, computer jurors give up their seats in this order. Ruth
  // (who enforces the judge's rules) and Hank (the holdout) stay longest.
  var LEAVE_ORDER = ["tasha", "dev", "carla", "hank", "ruth"];

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

  // ---------- Case helpers ----------

  function findCase(id) {
    for (var i = 0; i < CASES.length; i++) if (CASES[i].id === id) return CASES[i];
    return null;
  }

  function juror(id) {
    for (var i = 0; i < JURORS.length; i++) if (JURORS[i].id === id) return JURORS[i];
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

  function mood(c, lean) {
    var t = threshold(c), w = words(c);
    if (lean >= t + 12) return { label: w.yes, cls: "m-yes" };
    if (lean >= t) return { label: "Leaning " + w.yes.toLowerCase(), cls: "m-lean-yes" };
    if (lean >= t - 15) return { label: "Leaning " + w.no.toLowerCase(), cls: "m-lean-no" };
    return { label: w.no, cls: "m-no" };
  }

  function exhibit(c, label) {
    for (var i = 0; i < c.steps.length; i++) {
      var xs = c.steps[i].exhibits || [];
      for (var j = 0; j < xs.length; j++) if (xs[j].label === label) return xs[j];
    }
    return null;
  }

  // Everyone in the courtroom except the jury.
  function castOf(c) {
    var judge = c.steps.filter(function (s) { return s.type === "judge"; })[0].speaker;
    var list = [
      { id: "judge", name: judge, role: "Judge", kind: "judge", home: "judge" },
      { id: "clerk", name: "Court clerk", role: "Clerk", kind: "clerk", home: "clerk", ini: "CL" },
      { id: "bailiff", name: c.bailiff || "Bailiff Gus Ferreira", role: "Bailiff", kind: "clerk", home: "bailiff" },
      { id: "pl", name: c.parties.plaintiff.lawyer, role: c.kind === "criminal" ? "Prosecutor" : "Plaintiff's lawyer", kind: "pros", home: "p1" },
      { id: "dl", name: c.parties.defense.lawyer, role: "Defense lawyer", kind: "def", home: "d1" },
      { id: "def", name: c.parties.defense.label, role: "Defendant", kind: "def party", home: "d2" }
    ];
    if (c.kind === "civil") list.push({ id: "pla", name: c.parties.plaintiff.label, role: "Plaintiff", kind: "pros party", home: "p2" });
    var g = 0;
    c.steps.forEach(function (s) {
      if (s.type === "witness" && !partyId(c, s.name)) {
        list.push({ id: "w" + g, name: s.name, role: s.role, kind: "wit", home: "g" + g });
        g++;
      }
    });
    list.forEach(function (p) { if (!p.ini) p.ini = initials(p.name); });
    return list;
  }

  function partyId(c, name) {
    if (name === c.parties.defense.label) return "def";
    if (c.kind === "civil" && name === c.parties.plaintiff.label) return "pla";
    return null;
  }

  function witnessId(c, name) {
    var party = partyId(c, name);
    if (party) return party;
    var cast = castOf(c);
    for (var i = 0; i < cast.length; i++) if (cast[i].name === name) return cast[i].id;
    return null;
  }

  function person(c, id) {
    var cast = castOf(c);
    for (var i = 0; i < cast.length; i++) if (cast[i].id === id) return cast[i];
    return null;
  }

  // ---------- The trial script ----------

  function buildBeats(c, mode) {
    var beats = [];
    var pos = {};
    castOf(c).forEach(function (p) { pos[p.id] = p.home; });

    function beat(b) { b.id = beats.length; b.pos = Object.assign({}, pos); beats.push(b); }
    function guide(text, phase, step) { beat({ who: null, text: text, phase: phase, kind: "guide", step: step }); }

    guide(mode === "solo"
      ? "You're the juror in the highlighted seat in the jury box. Tap Next, or press the space bar, to move the trial along. When you hear an important fact, tap Write it down. You can keep " + NOTE_LIMIT + " facts, and you'll use them to argue in the jury room."
      : "Follow along here and on your phone. The foreperson moves the trial along with Next on their phone. When a witness says something important, tap Write it down on your phone. Each juror can keep " + NOTE_LIMIT + " facts to argue with in the jury room.", "Before the trial");

    c.steps.forEach(function (s, si) {
      if (s.type === "judge" || s.type === "instructions") {
        var phase = s.type === "judge" ? "The judge's welcome" : "Jury instructions";
        guide(EXPLAIN[s.type], phase);
        if (s.type === "judge") {
          beat({ who: "bailiff", text: "All rise. The Superior Court of Maple County is now in session, the Honorable " + s.speaker.replace(/^Judge /, "") + " presiding.", phase: phase });
        }
        // The gavel opens court on the judge's first line.
        s.text.forEach(function (t, ti) { beat({ who: "judge", text: t, phase: phase, sfx: s.type === "judge" && ti === 0 ? "gavel" : undefined }); });
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
        beat({ who: caller, text: who + s.name + " to the stand.", phase: ph2, step: si });
        pos[w] = "stand";
        beat({ who: "clerk", text: "Please raise your right hand. Do you swear to tell the truth, the whole truth, and nothing but the truth?", phase: ph2, step: si });
        beat({ who: w, text: "I do.", phase: ph2, step: si });
        if (s.intro) guide(s.intro, ph2, si);
        [["Direct examination", caller, s.direct], ["Cross-examination", crosser, s.cross]].forEach(function (part, pi) {
          var phase = part[0] + ": " + s.name;
          // Spoken hand-offs make it clear which side is asking.
          if (pi === 0) beat({ who: "judge", text: "Counsel, you may question the witness.", phase: phase, step: si });
          else {
            beat({ who: "judge", text: "Cross-examination?", phase: phase, step: si });
            beat({ who: part[1], text: "Yes, Your Honor.", phase: phase, step: si });
          }
          pos[part[1]] = "podium";
          part[2].forEach(function (l) {
            if (l.objection) {
              var objector = l.by === "defense" ? "dl" : "pl";
              var struck = beats.filter(function (x) { return x.answer; }).pop().id;
              beat({ who: objector, text: "Objection, Your Honor. " + l.objection + ".", phase: phase, kind: "objection", step: si, expression: "angry", sfx: "objection" });
              // A sustained objection strikes the answer just given.
              beat({ who: "judge", text: l.ruling + "." + (l.ruling === "Sustained" ? " The jury will disregard that answer." : ""), phase: phase, step: si, expression: "calm", sfx: "gavel", strikes: l.ruling === "Sustained" ? struck : undefined });
              guide(l.note, phase, si);
            } else {
              beat({ who: part[1], text: l.q, phase: phase, step: si });
              // Witnesses look nervous under cross-examination unless a line says otherwise.
              beat({ who: w, text: l.a, phase: phase, card: l.card, show: l.show, step: si, sfx: l.sfx, mark: l.mark, react: l.react, answer: true, expression: l.expression || (part[0] === "Cross-examination" ? "nervous" : "calm") });
              if (l.sfx === "murmur") beat({ who: "bailiff", text: "Order in the court.", phase: phase, step: si });
            }
          });
          beat({ who: part[1], text: pi === 0 ? "Nothing further, Your Honor." : "Nothing further.", phase: phase, step: si });
          pos[part[1]] = part[1] === "dl" ? "d1" : "p1";
        });
        if (s.jurorQuestion) {
          beat({ who: "judge", text: "Members of the jury, each of you may submit one written question for a witness during this trial. Would you like to ask " + s.name + " something?", phase: "Juror question", kind: "ask", step: si, witness: w });
        }
        beat({ who: "judge", text: "Thank you. You may step down.", phase: ph2, step: si, stepDown: true });
        pos[w] = home;
        // After a side's last witness, that side rests its case.
        var next = c.steps[si + 1];
        if (!next || next.type !== "witness" || next.side !== s.side) {
          var side = s.side === "defense" ? "the defense" : c.kind === "criminal" ? "the State" : "the plaintiff";
          beat({ who: caller, text: "Your Honor, " + side + " rests.", phase: ph2 });
        }
      }
    });
    beat({ who: "judge", text: "Members of the jury, you've heard all the evidence. You may now go to the jury room to deliberate.", phase: "To the jury room" });
    beat({ who: "bailiff", text: "All rise for the jury. Jurors, please follow me to the jury room.", phase: "To the jury room", kind: "end" });
    return beats;
  }

  // ---------- Game setup and seats ----------

  function createGame(caseId, mode) {
    var g = { caseId: caseId, mode: mode, phase: "lobby", beats: buildBeats(findCase(caseId), mode), beat: 0, humans: [], foreperson: 0, d: null, reached: {}, seenAt: {}, nudges: {} };
    if (mode === "solo") {
      g.humans.push(newHuman("You", ""));
      g.phase = "trial";
    }
    return g;
  }

  function newHuman(name, token) {
    return { name: name, token: token || "", notebook: [], bonus: [], found: [], tries: TRIES, flags: 0, lastFlag: null, askUsed: false, strikes: 0, used: [], connected: true, choice: null, ballot: null, lastBallot: null };
  }

  function cleanName(name) {
    return String(name || "").replace(/\s+/g, " ").trim().slice(0, NAME_MAX).trim();
  }

  function nameTaken(g, name) {
    var lower = name.toLowerCase();
    return g.humans.some(function (p) { return p.name.toLowerCase() === lower; });
  }

  function uniqueName(g, name) {
    if (!nameTaken(g, name)) return name;
    for (var n = 2; ; n++) {
      var suffix = " " + n;
      var candidate = name.slice(0, NAME_MAX - suffix.length).trim() + suffix;
      if (!nameTaken(g, candidate)) return candidate;
    }
  }

  // A person asks to sit on the jury. The same token, or the same name on a
  // disconnected seat, gets that seat back.
  function join(g, name, token) {
    name = cleanName(name);
    if (!name) return { error: "Please enter your name." };
    var i;
    for (i = 0; i < g.humans.length; i++) {
      if (token && g.humans[i].token === token) return rejoin(g, i, token);
    }
    for (i = 0; i < g.humans.length; i++) {
      if (g.humans[i].name.toLowerCase() === name.toLowerCase() && !g.humans[i].connected) return rejoin(g, i, token);
    }
    if (g.phase === "deliberation" || g.phase === "verdict") return { error: "Deliberation has already started. Only jurors already on this jury can rejoin." };
    if (g.humans.length >= SEATS) return { error: "The jury is full. All six seats are taken." };
    g.humans.push(newHuman(uniqueName(g, name), token));
    var h = g.humans.length - 1;
    if (!g.humans[g.foreperson].connected) g.foreperson = h;
    return { h: h };
  }

  function rejoin(g, h, token) {
    g.humans[h].connected = true;
    if (token) g.humans[h].token = token;
    if (!g.humans[g.foreperson].connected) g.foreperson = h;
    return { h: h, rejoined: true };
  }

  function setConnected(g, h, on) {
    var p = g.humans[h];
    if (!p || p.connected === on) return false;
    p.connected = on;
    if (!on && h === g.foreperson) {
      // The role passes to the next connected human in seat order and stays there.
      for (var k = 1; k < g.humans.length; k++) {
        var next = (h + k) % g.humans.length;
        if (g.humans[next].connected) { g.foreperson = next; break; }
      }
    }
    if (!on && g.phase === "deliberation") {
      if (g.d.voting) { if (allVoted(g)) tally(g); }
      else if (allChosen(g)) resolveTurn(g);
    }
    return true;
  }

  // Humans take the first seats in join order; computer jurors fill the rest.
  function seats(g) {
    var gone = LEAVE_ORDER.slice(0, Math.max(0, g.humans.length - 1));
    var list = g.humans.map(function (p, i) { return { kind: "human", id: "h" + i, h: i, name: p.name }; });
    JURORS.forEach(function (j) {
      if (gone.indexOf(j.id) < 0) list.push({ kind: "computer", id: j.id, name: j.name, juror: j });
    });
    return list.slice(0, SEATS);
  }

  function computers(g) {
    var ids = g.d ? g.d.computers : seats(g).filter(function (s) { return s.kind === "computer"; }).map(function (s) { return s.id; });
    return ids.map(juror);
  }

  // Facts a juror can write down right now: any fact whose line first
  // appeared less than FACT_MS ago, newest first, with the time left.
  function factTimes(g) {
    if (g.phase !== "trial") return [];
    var t = now(), out = [], seen = {};
    for (var i = g.beats.length - 1; i >= 0; i--) {
      var b = g.beats[i];
      if (!b.card || seen[b.card] || g.seenAt[b.id] === undefined) continue;
      var left = FACT_MS - (t - g.seenAt[b.id]);
      if (left > 0) { seen[b.card] = true; out.push({ fact: b.card, ms: left }); }
    }
    return out.sort(function (x, y) { return x.ms - y.ms; }).reverse();
  }

  function available(g) {
    return factTimes(g).map(function (f) { return f.fact; });
  }

  // Testimony lines a juror can flag with "Something's off". Same window as
  // writing down facts: the current answer in solo, the current witness's
  // answers so far in multiplayer.
  function flagLines(g) {
    var b = g.beats[g.beat];
    if (!b || g.phase !== "trial") return [];
    if (g.mode === "solo") return b.answer ? [g.beat] : [];
    if (b.step === undefined) return [];
    var out = [];
    for (var i = 0; i <= g.beat; i++) if (g.beats[i].step === b.step && g.beats[i].answer) out.push(i);
    return out;
  }

  function flag(g, h, line, fact) {
    var me = g.humans[h];
    if (!me || g.phase !== "trial" || me.tries <= 0) return false;
    if (flagLines(g).indexOf(line) < 0 || me.notebook.indexOf(fact) < 0) return false;
    var c = findCase(g.caseId);
    var b = g.beats[line];
    var hit = (c.contradictions || []).filter(function (x) {
      return x.line === b.mark && x.conflictsWith === fact && me.found.indexOf(x.id) < 0;
    })[0];
    me.flags++;
    if (hit) {
      me.found.push(hit.id);
      me.bonus.push(hit.id);
      me.lastFlag = { seq: me.flags, ok: true, id: hit.id };
    } else {
      me.tries--;
      me.lastFlag = { seq: me.flags, ok: false, tries: me.tries };
    }
    return true;
  }

  // ---------- Actions ----------

  // h is the acting human's index, or -1 for the courtroom screen itself.
  // Returns true when the game changed.
  function apply(g, h, a) {
    var me = h >= 0 ? g.humans[h] : null;
    var lead = h === -1 || h === g.foreperson;
    var delib = g.phase === "deliberation" && g.d && !g.d.verdict;
    switch (a && a.type) {
      case "start":
        if (g.phase !== "lobby" || !lead || !g.humans.length) return false;
        g.phase = "trial";
        return true;
      case "advance":
        if (g.phase !== "trial" || !lead) return false;
        if (g.beat < g.beats.length - 1) { g.beat++; reachBeat(g); }
        else startDeliberation(g);
        return true;
      case "back":
        if (g.phase !== "trial" || !lead || g.beat === 0) return false;
        g.beat--;
        return true;
      case "write":
        if (!me || available(g).indexOf(a.fact) < 0 || me.notebook.indexOf(a.fact) >= 0 || me.notebook.length >= NOTE_LIMIT) return false;
        me.notebook.push(a.fact);
        return true;
      case "unwrite":
        if (!me || g.phase !== "trial" || me.notebook.indexOf(a.fact) < 0) return false;
        me.notebook = me.notebook.filter(function (id) { return id !== a.fact; });
        return true;
      case "ask":
        return ask(g, h, a.i);
      case "flag":
        return flag(g, h, a.line, a.fact);
      case "choose":
        return delib && !g.d.voting && me ? choose(g, h, a) : false;
      case "closeTurn":
        if (!delib || g.d.voting || h !== g.foreperson) return false;
        resolveTurn(g);
        return true;
      case "callVote":
        if (!delib || g.d.voting || h !== g.foreperson) return false;
        g.d.voting = true;
        g.humans.forEach(function (p) { p.ballot = null; });
        return true;
      case "cancelVote":
        if (!delib || !g.d.voting || h !== g.foreperson || g.d.round > ROUNDS) return false;
        g.d.voting = false;
        g.humans.forEach(function (p) { p.ballot = null; });
        return true;
      case "ballot":
        var w = words(findCase(g.caseId));
        if (!delib || !g.d.voting || !me || (a.verdict !== w.yesId && a.verdict !== w.noId)) return false;
        me.ballot = a.verdict;
        if (allVoted(g)) tally(g);
        return true;
    }
    return false;
  }

  function ask(g, h, i) {
    var c = findCase(g.caseId);
    var me = g.humans[h];
    var b = g.beats[g.beat];
    if (g.phase !== "trial" || !me || !b || b.kind !== "ask" || b.askedBy !== undefined || me.askUsed) return false;
    var q = c.steps[b.step].jurorQuestion[i];
    if (!q) return false;
    me.askUsed = true;
    b.askedBy = h;
    var base = { pos: b.pos, phase: "Juror question", step: b.step };
    g.beats.splice(g.beat + 1, 0,
      Object.assign({}, base, { id: "q" + b.id, who: "judge", text: "A juror asks: \"" + q.q + "\" Please answer the question." }),
      Object.assign({}, base, { id: "a" + b.id, who: b.witness, text: q.a, card: q.card, mark: q.mark, react: q.react, answer: true, sfx: q.sfx, expression: q.expression || "calm" }));
    g.beat++;
    return true;
  }

  // ---------- Reactions during the trial ----------

  function trialLean(g, c, id) {
    return clamp(c.jury.start[id] + (g.nudges[id] || 0));
  }

  // The first time a line appears, computer jurors may react to it.
  function reachBeat(g) {
    var b = g.beats[g.beat];
    if (!b || g.reached[b.id]) return;
    g.reached[b.id] = true;
    g.seenAt[b.id] = now();
    if (b.strikes !== undefined) strikeReactions(g, b);
    react(g, b);
  }

  function react(g, b) {
    var c = findCase(g.caseId);
    var card = b.card ? c.cards[b.card] : null;
    var present = computers(g);
    var here = function (id) { return present.some(function (j) { return j.id === id; }); };
    var list;
    if (b.react) {
      list = b.react.filter(function (r) { return here(r.juror); }).map(function (r) { return { juror: r.juror, word: r.word, expression: r.expression }; });
    } else if (card) {
      var matches = function (j) { return j.likes.filter(function (t) { return card.tags.indexOf(t) >= 0; }).length; };
      list = present.filter(function (j) { return matches(j) > 0; })
        .sort(function (x, y) { return matches(y) - matches(x); })
        .slice(0, 2).map(function (j) { return { juror: j.id }; });
    }
    if (!list || !list.length) return;
    list.forEach(function (r) {
      var j = juror(r.juror);
      var agrees = card ? (trialLean(g, c, j.id) >= threshold(c)) === (card.dir > 0) : true;
      var mood = agrees ? "agree" : "against";
      // Vary the word from line to line. Ids can be numbers or strings ("a12" for juror-question answers).
      var seed = String(b.id).split("").reduce(function (n, ch) { return n + ch.charCodeAt(0); }, j.id.length);
      if (!r.word) r.word = j.react[mood][seed % j.react[mood].length];
      if (!r.expression) r.expression = j.faces[mood];
      r.nudge = 0;
      if (card && !card.bonus) {
        var cur = g.nudges[j.id] || 0;
        var next = Math.max(-REACT_CAP, Math.min(REACT_CAP, cur + card.dir * card.power * 1.5 * j.sway));
        r.nudge = next - cur;
        g.nudges[j.id] = next;
      }
    });
    b.reactions = list;
  }

  // When the judge strikes an answer, jurors take back their reactions to it,
  // except Hank, who keeps half: it's hard to unhear something.
  function strikeReactions(g, ruling) {
    var answer = g.beats.filter(function (x) { return x.id === ruling.strikes; })[0];
    if (!answer || !answer.reactions) return;
    var hankKept = false;
    answer.reactions.forEach(function (r) {
      var keep = r.juror === "hank" ? 0.5 : 0;
      if (keep && r.nudge) hankKept = true;
      g.nudges[r.juror] = (g.nudges[r.juror] || 0) - r.nudge * (1 - keep);
    });
    if (hankKept) ruling.react = [{ juror: "hank", word: "Can't unhear it.", expression: "smug" }];
  }

  // ---------- Deliberation ----------

  function say(g, who, text, cls, meta, to) {
    g.d.log.push({ who: who, text: text, cls: cls || "", meta: meta || "", to: to || "" });
  }

  function clamp(n) { return Math.max(0, Math.min(100, n)); }

  function startDeliberation(g) {
    var c = findCase(g.caseId);
    var present = seats(g).filter(function (s) { return s.kind === "computer"; }).map(function (s) { return s.juror; });
    g.phase = "deliberation";
    g.d = { leans: {}, round: 1, log: [], pi: 0, voting: false, verdict: null, tally: null, counter: null, countered: [], computers: present.map(function (j) { return j.id; }) };
    // Moods start where the trial left them.
    present.forEach(function (j) { g.d.leans[j.id] = trialLean(g, c, j.id); });
    g.humans.forEach(function (p) { p.choice = null; p.ballot = null; });

    var likes = present.map(function (j) { return j.short + " by " + j.likes.join(" and "); }).join("; ");
    if (g.mode === "solo") {
      say(g, null, "The six of you file into the jury room and sit around a long table. Ruth volunteers to be the foreperson.");
      say(g, "ruth", "Let's go around the table and hear everyone's first impression before we argue about anything.");
    } else {
      say(g, null, "The jury files into the jury room and sits around a long table. " + g.humans[g.foreperson].name + " is the foreperson.");
    }
    present.forEach(function (j) { say(g, j.id, c.jury.takes[j.id]); });
    var LIKED = { facts: "the facts laid out", press: "being pressed hard", question: "questions" };
    var styles = present.filter(function (j) { return j.approaches; }).map(function (j) {
      return j.short + " likes " + LIKED[j.approaches.likes] + " and dislikes " + LIKED[j.approaches.dislikes];
    }).join("; ");
    if (!present.length) {
      say(g, null, "Every seat on this jury is held by a person. Talk it over, and the foreperson can call a vote whenever you're ready.");
    } else if (g.mode === "solo") {
      say(g, null, "Your turn. Pick a fact from your notebook, then choose who to say it to. Each juror is moved most by certain kinds of evidence: " + likes + ". " + (styles ? "How they like to be argued with: " + styles + ". " : "") + "If someone raises a counter-argument, answer it with a fact that rebuts it. You have " + ROUNDS + " turns before the final vote.");
    } else {
      say(g, null, "Each turn, every juror picks a fact on their phone and chooses who to say it to, or lets the others talk. Computer jurors are moved most by certain kinds of evidence: " + likes + ". " + (styles ? "How they like to be argued with: " + styles + ". " : "") + "If someone raises a counter-argument, answer it with a fact that rebuts it. You have " + ROUNDS + " turns before the final vote.");
    }
  }

  function choose(g, h, a) {
    var me = g.humans[h];
    if (a.pass) {
      me.choice = { pass: true };
    } else {
      if ((me.notebook.indexOf(a.fact) < 0 && me.bonus.indexOf(a.fact) < 0) || me.used.indexOf(a.fact) >= 0) return false;
      if (a.target !== "all" && g.d.computers.indexOf(a.target) < 0) return false;
      me.choice = { fact: a.fact, target: a.target, approach: APPROACHES.indexOf(a.approach) >= 0 ? a.approach : "facts" };
    }
    if (allChosen(g)) resolveTurn(g);
    return true;
  }

  function allChosen(g) {
    var live = g.humans.filter(function (p) { return p.connected; });
    return live.length > 0 && live.every(function (p) { return p.choice; });
  }

  function allVoted(g) {
    var live = g.humans.filter(function (p) { return p.connected; });
    return live.length > 0 && live.every(function (p) { return p.ballot; });
  }

  var APPROACHES = ["facts", "press", "question"];
  var APPROACH_WORDS = { facts: "laying out the facts", press: "pressing hard", question: "asking a question" };

  // Liked approaches land about 30% harder; disliked ones about 60% as hard.
  function approachEffect(j, approach) {
    if (!j.approaches) return 1;
    return j.approaches.likes === approach ? 1.3 : j.approaches.dislikes === approach ? 0.6 : 1;
  }

  // A computer juror's reply: a hand-written line for this fact, else their
  // line for this kind of evidence, else their stock reply.
  function replyTo(j, card, outcome) {
    var own = card.replies && card.replies[j.id] && card.replies[j.id][outcome];
    if (own) return own;
    if (outcome !== "agree" && j.replies) {
      for (var i = 0; i < card.tags.length; i++) if (j.replies[card.tags[i]]) return j.replies[card.tags[i]][outcome];
    }
    return j.say[outcome];
  }

  // Facts the jury actually heard at trial (not unasked juror-question answers).
  function heardFacts(g) {
    var out = [];
    g.beats.forEach(function (b) { if (b.card && g.reached[b.id] && out.indexOf(b.card) < 0) out.push(b.card); });
    return out;
  }

  // Everyone's choices play out in seat order. Then a computer juror who
  // disagrees with the strongest point raises a counter-argument, or, if no
  // one does, one of the case's scripted points comes up.
  function resolveTurn(g) {
    var c = findCase(g.caseId);
    var d = g.d;
    var open = d.counter;
    var moves = [];
    g.humans.forEach(function (p, h) {
      var ch = p.choice;
      if (ch && ch.fact) {
        var card = c.cards[ch.fact];
        var rebuttal = !!(open && !open.answered && !card.struck && (card.rebuts || []).indexOf(open.fact) >= 0);
        var moved = playCard(g, h, ch.fact, ch.target, ch.approach || "facts", rebuttal);
        if (rebuttal) answerCounter(g, h, open);
        if (!card.struck) moves.push({ fact: ch.fact, moved: moved });
      } else if (ch || p.connected) {
        say(g, "h" + h, g.mode === "solo" ? "(You stay quiet and let the others talk.)" : "(Lets the others talk.)");
      }
      p.choice = null;
    });
    d.counter = null;
    moves.sort(function (a, b) { return b.moved - a.moved; });
    if (!(moves.length && counterArgue(g, moves[0].fact))) scriptedPoint(g);
    endTurn(g);
  }

  function playCard(g, h, cardId, target, approach, rebuttal) {
    var c = findCase(g.caseId);
    var d = g.d;
    var me = g.humans[h];
    var card = c.cards[cardId];
    var t = threshold(c);
    var present = computers(g);
    me.used.push(cardId);
    say(g, "h" + h, card.title + ".", "move", APPROACH_WORDS[approach] + (rebuttal ? " · rebuttal" : ""), target);
    if (card.struck) {
      me.strikes++;
      var fixer = present.filter(function (j) { return j.id === "ruth"; })[0] || present[0];
      if (fixer) say(g, fixer.id, juror("ruth").say.struck);
      say(g, null, "The judge told the jury not to use that. Bringing it up makes the computer jurors trust " + (g.mode === "solo" ? "you" : me.name) + " less for the rest of deliberations.", "warn");
      return 0;
    }
    var cred = Math.pow(0.8, me.strikes);
    var best = null, bestDelta = 0, before = {}, total = 0;
    present.forEach(function (j) {
      before[j.id] = d.leans[j.id];
      var likes = card.tags.some(function (tag) { return j.likes.indexOf(tag) >= 0; });
      var share = target === "all" ? 0.5 : j.id === target ? 1 : 0.25;
      // Guilt has to be proven beyond a reasonable doubt, so it's harder to argue for.
      var caution = c.kind === "criminal" && card.dir > 0 ? 0.7 : 1;
      // The further someone already leans your way, the less one more fact moves them.
      var already = card.dir > 0 ? d.leans[j.id] / 100 : 1 - d.leans[j.id] / 100;
      var delta = card.dir * card.power * 3.5 * j.sway * cred * caution * (likes ? 1.8 : 1) * (1.3 - already) * share *
        approachEffect(j, approach) * (rebuttal ? 1.5 : 1);
      d.leans[j.id] = clamp(d.leans[j.id] + delta);
      total += Math.abs(d.leans[j.id] - before[j.id]);
      if (Math.abs(delta) > bestDelta) { bestDelta = Math.abs(delta); best = j.id; }
    });
    var r = target === "all" ? best : target;
    if (!r) return total;
    var j = juror(r);
    var real = Math.abs(d.leans[r] - before[r]);
    var agrees = (before[r] >= t) === (card.dir > 0);
    say(g, r, replyTo(j, card, agrees ? "agree" : real >= 8 ? "moved" : "unmoved"), "", "", "h" + h);
    return total;
  }

  // The juror most strongly against the point raises a fact from the trial
  // that points the other way. It keeps pulling the jury until someone rebuts it.
  function counterArgue(g, argued) {
    var c = findCase(g.caseId);
    var d = g.d;
    var t = threshold(c);
    var card = c.cards[argued];
    var present = computers(g);
    var against = present.filter(function (j) { return card.dir > 0 ? d.leans[j.id] < t : d.leans[j.id] >= t; });
    if (!against.length) return false;
    against.sort(function (a, b) { return card.dir > 0 ? d.leans[a.id] - d.leans[b.id] : d.leans[b.id] - d.leans[a.id]; });
    var j = against[0];
    var answerable = {};
    Object.keys(c.cards).forEach(function (k) { (c.cards[k].rebuts || []).forEach(function (r) { answerable[r] = true; }); });
    var options = heardFacts(g).filter(function (k) {
      var f = c.cards[k];
      return f.dir === -card.dir && !f.struck && !f.bonus && d.countered.indexOf(k) < 0;
    });
    if (!options.length) return false;
    var score = function (k) {
      var f = c.cards[k];
      return (answerable[k] ? 10 : 0) + (f.tags.some(function (x) { return j.likes.indexOf(x) >= 0; }) ? 5 : 0) + f.power;
    };
    options.sort(function (a, b) { return score(b) - score(a); });
    var fact = options[0];
    var f = c.cards[fact];
    d.countered.push(fact);
    say(g, j.id, "But remember: " + f.title + ".", "counter", "counter-argument", "all");
    var deltas = {};
    present.forEach(function (o) {
      var before = d.leans[o.id];
      // Saying it out loud makes the speaker a little more sure of themselves.
      d.leans[o.id] = clamp(before + (o.id === j.id ? f.dir * 4 : f.dir * f.power * COUNTER_PULL * o.sway));
      if (o.id !== j.id) deltas[o.id] = d.leans[o.id] - before;
    });
    d.counter = { juror: j.id, fact: fact, deltas: deltas, answered: false };
    return true;
  }

  // A rebuttal takes back the counter-argument's pull on the other jurors.
  function answerCounter(g, h, open) {
    var d = g.d;
    Object.keys(open.deltas).forEach(function (id) { d.leans[id] = clamp(d.leans[id] - open.deltas[id]); });
    open.answered = true;
    say(g, null, (g.mode === "solo" ? "You answered " : g.humans[h].name + " answered ") + juror(open.juror).short + "'s counter-argument, so it no longer pulls the jury.", "rebuttal");
  }

  function scriptedPoint(g) {
    var c = findCase(g.caseId);
    var d = g.d;
    var t = threshold(c);
    var pts = c.jury.points;
    var present = computers(g);
    for (var tries = 0; present.length && tries < pts.length; tries++) {
      var p = pts[d.pi % pts.length];
      d.pi++;
      var side = present.filter(function (j) { return p.dir > 0 ? d.leans[j.id] >= t - 5 : d.leans[j.id] < t + 5; });
      if (!side.length) continue;
      side.sort(function (a, b) { return p.dir > 0 ? d.leans[b.id] - d.leans[a.id] : d.leans[a.id] - d.leans[b.id]; });
      var speaker = side[0];
      say(g, speaker.id, p.text);
      if (p.struck) {
        var fixer = present.filter(function (j) { return j.id !== speaker.id; })[0];
        if (fixer) say(g, fixer.id, juror("ruth").say.struck);
      } else {
        present.forEach(function (j) {
          if (j.id !== speaker.id) d.leans[j.id] = clamp(d.leans[j.id] + p.dir * 6 * j.sway);
        });
        // Saying it out loud makes the speaker a little more sure of themselves.
        d.leans[speaker.id] = clamp(d.leans[speaker.id] + p.dir * 4);
      }
      break;
    }
  }

  function endTurn(g) {
    var d = g.d;
    d.round++;
    if (d.round > ROUNDS && !d.voting) {
      say(g, null, "Hours have passed. A note arrives from the judge asking whether the jury has reached a verdict. It's time for a final vote.");
      d.voting = true;
      g.humans.forEach(function (p) { p.ballot = null; });
    }
  }

  function tally(g) {
    var c = findCase(g.caseId);
    var d = g.d;
    var w = words(c);
    var t = threshold(c);
    var votes = {}, yes = 0, no = 0, humanYes = 0, humanNo = 0;
    d.computers.forEach(function (id) {
      var v = d.leans[id] >= t ? w.yesId : w.noId;
      votes[id] = v;
      if (v === w.yesId) yes++; else no++;
    });
    g.humans.forEach(function (p) {
      if (!p.ballot) return;
      p.lastBallot = p.ballot;
      if (p.ballot === w.yesId) { yes++; humanYes++; } else { no++; humanNo++; }
      p.ballot = null;
    });
    var need = needed(c);
    d.tally = { yes: yes, no: no, humanYes: humanYes, humanNo: humanNo, computers: votes };
    d.voting = false;
    say(g, null, (g.mode === "solo" ? "Ruth" : "The foreperson") + " reads the ballots: " + w.yes + " " + yes + ", " + w.no + " " + no + ".", "tally");
    if (yes >= need) d.verdict = w.yesId;
    else if (no >= need) d.verdict = w.noId;
    else if (d.round > ROUNDS) d.verdict = "mistrial";
    else say(g, g.mode === "solo" ? "ruth" : null, "That's not enough to reach a verdict. We need " + need + " of 6 to agree. Let's keep talking.");
    if (d.verdict) g.phase = "verdict";
  }

  // ---------- End of the case ----------

  function report(g, h) {
    var c = findCase(g.caseId);
    var w = words(c);
    var me = g.humans[h];
    var v = g.d.verdict;
    var word = function (id) { return id === w.yesId ? w.yes : w.no; };
    var good = me.notebook.filter(function (k) { return !c.cards[k].struck; }).length;
    var badNotes = me.notebook.length - good;
    var rows = [];
    var verdictRow = v === "mistrial" ? "No verdict. The case would be tried again with a new jury." : v === c.truth.lawful ? "Yes. Under the judge's instructions, the evidence supports this verdict." : "No. Under the judge's instructions, the evidence pointed the other way.";
    if (g.mode === "solo") {
      rows.push({ title: "Followed the law", text: verdictRow, ok: v !== "mistrial" && v === c.truth.lawful });
      rows.push({ title: "Matched what really happened", text: v === "mistrial" ? "No verdict." : v === c.truth.actual ? "Yes." : "No. See what really happened, above.", ok: v !== "mistrial" && v === c.truth.actual });
    } else {
      rows.push({ title: "Your ballot", text: me.lastBallot ? "You voted " + word(me.lastBallot).toLowerCase() + ". The evidence at trial supports " + word(c.truth.lawful).toLowerCase() + "." : "You didn't cast a ballot.", ok: me.lastBallot === c.truth.lawful });
      rows.push({ title: "The jury followed the law", text: verdictRow, ok: v !== "mistrial" && v === c.truth.lawful });
    }
    var total = (c.contradictions || []).length;
    if (total) rows.push({ title: "Contradictions found", text: me.found.length + " of " + total + ".", ok: me.found.length > 0 });
    rows.push({ title: "Notes taken", text: good + " useful facts written down" + (badNotes ? ", plus " + badNotes + " the judge threw out" : "") + ". You asked " + (me.askUsed ? "one" : "no") + " juror question.", ok: good >= 5 && !badNotes });
    rows.push({ title: "Played by the rules", text: me.strikes ? "You used thrown-out evidence " + me.strikes + (me.strikes === 1 ? " time." : " times.") : "You only argued with admitted evidence.", ok: !me.strikes });
    return rows;
  }

  // What one juror's phone is allowed to see: shared state plus their own
  // seat's private data, never another juror's notebook or ballot.
  function viewFor(g, h) {
    var c = findCase(g.caseId);
    var me = g.humans[h];
    var b = g.beats[g.beat];
    var moods = {};
    if (g.d) g.d.computers.forEach(function (id) { moods[id] = mood(c, g.d.leans[id]); });
    return {
      caseId: g.caseId,
      phase: g.phase,
      beatIndex: g.beat,
      beatsLen: g.beats.length,
      beat: g.phase === "trial" && b ? { who: b.who, text: b.text, phase: b.phase, kind: b.kind, show: b.show, step: b.step, askedBy: b.askedBy } : null,
      foreperson: g.foreperson,
      humans: g.humans.map(function (p) { return { name: p.name, connected: p.connected, chosen: !!p.choice, voted: !!p.ballot }; }),
      computers: computers(g).map(function (j) { return j.id; }),
      d: g.d ? { round: g.d.round, log: g.d.log, voting: g.d.voting, verdict: g.d.verdict, tally: g.d.tally, moods: moods,
        counter: g.d.counter ? { juror: g.d.counter.juror, fact: g.d.counter.fact, answered: g.d.counter.answered } : null } : null,
      me: {
        h: h, name: me.name, notebook: me.notebook.slice(), used: me.used.slice(), askUsed: me.askUsed, strikes: me.strikes,
        bonus: me.bonus.slice(), found: me.found.slice(), tries: me.tries, lastFlag: me.lastFlag,
        flagLines: flagLines(g).map(function (i) { return { i: i, text: g.beats[i].text }; }),
        choice: me.choice, ballot: me.ballot, lastBallot: me.lastBallot, available: available(g), factTimes: factTimes(g),
        report: g.phase === "verdict" ? report(g, h) : null
      }
    };
  }

  window.JuryEngine = {
    NOTE_LIMIT: NOTE_LIMIT, ROUNDS: ROUNDS, SEATS: SEATS, NAME_MAX: NAME_MAX,
    findCase: findCase, juror: juror, words: words, threshold: threshold, needed: needed, initials: initials,
    mood: mood, exhibit: exhibit, castOf: castOf, person: person,
    createGame: createGame, join: join, setConnected: setConnected, seats: seats, computers: computers,
    APPROACHES: APPROACHES, APPROACH_WORDS: APPROACH_WORDS,
    FACT_MS: FACT_MS, setClock: function (fn) { now = fn; }, factTimes: factTimes,
    available: available, flagLines: flagLines, TRIES: TRIES, apply: apply, report: report, viewFor: viewFor
  };
})();
