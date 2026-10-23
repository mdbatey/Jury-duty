// Courtroom sound effects, generated in code with the Web Audio API (no audio
// files). Sound is off until the viewer turns it on, and no audio is created
// before then. Only the courtroom screen and solo play call play(); phones never do.
(function () {
  "use strict";

  var KEY = "jury-duty-sound";
  var Ctx = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master = null;
  var played = [];

  function supported() { return !!Ctx; }

  function isOn() {
    try { return localStorage.getItem(KEY) === "on"; } catch (e) { return false; }
  }

  function setOn(on) {
    try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (e) {}
    if (on) ensure();
    else if (ctx && ctx.state === "running") ctx.suspend();
  }

  function ensure() {
    if (!ctx && Ctx) {
      try {
        ctx = new Ctx();
        master = ctx.createGain();
        master.gain.value = 0.35;
        master.connect(ctx.destination);
      } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function noise(c, seconds) {
    var buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
    var data = buf.getChannelData(0);
    var last = 0;
    for (var i = 0; i < data.length; i++) {
      // Slightly smoothed noise sounds less hissy.
      last = (last + (Math.random() * 2 - 1) * 0.3) / 1.3;
      data[i] = last * 3;
    }
    var src = c.createBufferSource();
    src.buffer = buf;
    return src;
  }

  function envelope(c, t, peak, attack, release) {
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
    return g;
  }

  var SOUNDS = {
    // Two wooden knocks.
    gavel: function (c, t) {
      [0, 0.17].forEach(function (offset) {
        var at = t + offset;
        var osc = c.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(170, at);
        osc.frequency.exponentialRampToValueAtTime(55, at + 0.12);
        var g = envelope(c, at, 0.9, 0.004, 0.18);
        osc.connect(g).connect(master);
        osc.start(at); osc.stop(at + 0.25);
        var click = noise(c, 0.05);
        var hp = c.createBiquadFilter();
        hp.type = "highpass"; hp.frequency.value = 1400;
        var cg = envelope(c, at, 0.45, 0.002, 0.04);
        click.connect(hp).connect(cg).connect(master);
        click.start(at);
      });
    },
    // A low rumble of voices from the gallery.
    murmur: function (c, t) {
      var src = noise(c, 1.9);
      var bp = c.createBiquadFilter();
      bp.type = "bandpass"; bp.frequency.value = 420; bp.Q.value = 0.9;
      var g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5, t + 0.45);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.85);
      var wobble = c.createOscillator();
      wobble.frequency.value = 3.2;
      var depth = c.createGain();
      depth.gain.value = 0.18;
      wobble.connect(depth).connect(g.gain);
      src.connect(bp).connect(g).connect(master);
      src.start(t); wobble.start(t); wobble.stop(t + 1.9);
    },
    // A short brassy sting.
    objection: function (c, t) {
      [220, 277, 330].forEach(function (f) {
        var osc = c.createOscillator();
        osc.type = "square";
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.linearRampToValueAtTime(f * 1.06, t + 0.08);
        var lp = c.createBiquadFilter();
        lp.type = "lowpass"; lp.frequency.value = 1800;
        var g = envelope(c, t, 0.12, 0.01, 0.45);
        osc.connect(lp).connect(g).connect(master);
        osc.start(t); osc.stop(t + 0.5);
      });
    },
    // A slow chord for the verdict.
    verdict: function (c, t) {
      [196, 247, 294, 392].forEach(function (f, i) {
        var osc = c.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = f;
        var g = c.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.16 - i * 0.02, t + 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
        osc.connect(g).connect(master);
        osc.start(t); osc.stop(t + 1.9);
      });
    }
  };

  // Play a named sound. Does nothing when sound is off, unsupported or unknown.
  function play(name) {
    if (!isOn() || !SOUNDS[name]) return;
    var c = ensure();
    if (!c) return;
    played.push(name);
    try { SOUNDS[name](c, c.currentTime + 0.02); } catch (e) {}
  }

  window.JurySound = { supported: supported, isOn: isOn, setOn: setOn, play: play, played: played };
})();
