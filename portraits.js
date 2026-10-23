// Flat, code-drawn character portraits with changing expressions.
// A look is { skin, hair, hairColor, facial, glasses, older, clothes }; any
// character without one gets a consistent look generated from their name.
// Faces are drawn in a 100 x 110 box: the head sits near the top and the
// shoulders fill the bottom.
(function () {
  "use strict";

  var SKIN = ["#f5d6c2", "#e8bd9c", "#d3a27a", "#b47a52", "#8c5839", "#5e3a25"];
  var HAIR_COLORS = { black: "#1f1a17", brown: "#4a3222", chestnut: "#6e4529", auburn: "#8a3f22", blonde: "#c9a35c", gray: "#8f9296", white: "#d9d9d6" };
  var HAIR_STYLES = ["short", "side", "long", "bun", "curly", "ponytail", "buzz", "bald"];
  var CLOTHES = ["#2e5a88", "#8a3b3b", "#3e6b55", "#6b4f8a", "#9a7420", "#4a5568", "#a0522d", "#2f4f4f"];
  var EXPRESSIONS = ["calm", "nervous", "angry", "sad", "smug", "surprised"];
  var INK = "#2a1d16";

  function hash(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  // The same name always gets the same look.
  function autoLook(name) {
    var h = hash(name || "?");
    var pick = function (list, shift) { return list[(h >>> shift) % list.length]; };
    var colors = Object.keys(HAIR_COLORS);
    return {
      skin: (h % SKIN.length),
      hair: pick(HAIR_STYLES, 3),
      hairColor: pick(colors, 7),
      facial: ((h >>> 11) % 5 === 0) ? "beard" : ((h >>> 11) % 5 === 1) ? "mustache" : null,
      glasses: (h >>> 14) % 4 === 0,
      older: (h >>> 17) % 4 === 0,
      clothes: pick(CLOTHES, 20)
    };
  }

  function lookFor(c, name, own) {
    if (own) return own;
    if (c && c.looks && c.looks[name]) return c.looks[name];
    return autoLook(name);
  }

  function skinColor(look) {
    return typeof look.skin === "number" ? SKIN[look.skin % SKIN.length] : look.skin || SKIN[2];
  }

  function hairBack(look, color) {
    switch (look.hair) {
      case "long": return '<path d="M22 46 Q20 18 50 16 Q80 18 78 46 L80 84 Q66 90 50 88 Q34 90 20 84 Z" fill="' + color + '"/>';
      case "ponytail": return '<path d="M70 34 Q90 44 84 76 Q80 60 72 50 Z" fill="' + color + '"/>';
      case "bun": return '<circle cx="50" cy="13" r="10" fill="' + color + '"/>';
      default: return "";
    }
  }

  function hairFront(look, color) {
    switch (look.hair) {
      case "short": return '<path d="M23 46 Q22 15 50 15 Q78 15 77 46 Q72 30 50 28 Q30 28 23 46 Z" fill="' + color + '"/>';
      case "side": return '<path d="M23 48 Q20 15 52 14 Q80 16 77 44 Q70 27 44 30 Q32 33 23 48 Z" fill="' + color + '"/>';
      case "long": return '<path d="M23 50 Q22 16 50 16 Q78 16 77 50 Q74 30 56 26 Q46 34 26 38 Z" fill="' + color + '"/>';
      case "bun": case "ponytail": return '<path d="M24 44 Q24 17 50 17 Q76 17 76 44 Q70 29 50 27 Q30 29 24 44 Z" fill="' + color + '"/>';
      case "curly":
        var dots = [[26, 38], [30, 27], [39, 20], [50, 17], [61, 20], [70, 27], [74, 38]];
        return dots.map(function (d) { return '<circle cx="' + d[0] + '" cy="' + d[1] + '" r="9" fill="' + color + '"/>'; }).join("");
      case "buzz": return '<path d="M25 42 Q25 18 50 18 Q75 18 75 42 Q68 27 50 26 Q32 27 25 42 Z" fill="' + color + '" opacity="0.75"/>';
      case "bald": return '<path d="M24 50 Q23 42 26 38 L28 50 Z M76 50 Q77 42 74 38 L72 50 Z" fill="' + color + '"/>';
      default: return "";
    }
  }

  function facialHair(look, color) {
    if (look.facial === "beard") return '<path d="M26 52 Q28 80 50 82 Q72 80 74 52 Q70 66 62 70 Q50 64 38 70 Q30 66 26 52 Z" fill="' + color + '"/>';
    if (look.facial === "mustache") return '<path d="M40 61 Q50 56 60 61 Q55 63 50 61 Q45 63 40 61 Z" fill="' + color + '"/>';
    return "";
  }

  function features(expr) {
    var s = 'stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round" fill="none"';
    var eyes, brows, mouth, extra = "";
    switch (expr) {
      case "nervous":
        brows = '<path d="M34 41 L44 37 M56 37 L66 41" ' + s + "/>";
        eyes = '<circle cx="42" cy="49" r="2.2" fill="' + INK + '"/><circle cx="62" cy="49" r="2.2" fill="' + INK + '"/>';
        mouth = '<path d="M41 67 q3 -3 6 0 q3 3 6 0 q3 -3 6 0" ' + s + "/>";
        extra = '<path d="M75 30 q-4 6 0 8 q4 -2 0 -8 Z" fill="#7fb8e6"/>';
        break;
      case "angry":
        brows = '<path d="M33 37 L46 43 M54 43 L67 37" ' + s + ' stroke-width="3"/>';
        eyes = '<circle cx="41" cy="49" r="2.4" fill="' + INK + '"/><circle cx="59" cy="49" r="2.4" fill="' + INK + '"/>';
        mouth = '<path d="M41 69 Q50 62 59 69" ' + s + "/>";
        break;
      case "sad":
        brows = '<path d="M34 39 L45 35 M55 35 L66 39" ' + s + "/>";
        eyes = '<path d="M38 51 q3 2 6 0 M56 51 q3 2 6 0" ' + s + "/>";
        mouth = '<path d="M42 69 Q50 64 58 69" ' + s + "/>";
        extra = '<path d="M40 55 q-2 5 0 7 q2 -2 0 -7 Z" fill="#7fb8e6"/>';
        break;
      case "smug":
        brows = '<path d="M34 41 Q39 39 45 41 M55 37 Q60 33 66 37" ' + s + "/>";
        eyes = '<path d="M37 49 L45 49 M55 49 L63 49" ' + s + ' stroke-width="2.8"/>';
        mouth = '<path d="M42 66 Q52 69 60 62" ' + s + "/>";
        break;
      case "surprised":
        brows = '<path d="M34 35 Q39 31 45 35 M55 35 Q60 31 66 35" ' + s + "/>";
        eyes = '<circle cx="41" cy="48" r="3.6" fill="' + INK + '"/><circle cx="59" cy="48" r="3.6" fill="' + INK + '"/>';
        mouth = '<ellipse cx="50" cy="67" rx="4.5" ry="5.5" fill="' + INK + '"/>';
        break;
      default:
        brows = '<path d="M34 40 Q39 38 45 40 M55 40 Q60 38 66 40" ' + s + "/>";
        eyes = '<circle cx="41" cy="49" r="2.6" fill="' + INK + '"/><circle cx="59" cy="49" r="2.6" fill="' + INK + '"/>';
        mouth = '<path d="M42 65 Q50 70 58 65" ' + s + "/>";
    }
    return brows + eyes + '<path d="M50 52 Q48 58 51 59" ' + s + ' stroke-width="1.8"/>' + mouth + extra;
  }

  // The drawing itself, in a 100 x 110 box.
  function draw(look, expr) {
    var skin = skinColor(look);
    var hair = HAIR_COLORS[look.older && look.hairColor !== "white" ? "gray" : look.hairColor] || HAIR_COLORS[look.hairColor] || look.hairColor || HAIR_COLORS.brown;
    var clothes = look.clothes || CLOTHES[0];
    var lines = look.older ? '<path d="M38 32 Q50 30 62 32" stroke="' + INK + '" stroke-opacity="0.35" stroke-width="1.6" fill="none"/>' : "";
    var glasses = look.glasses
      ? '<g stroke="' + INK + '" stroke-width="2" fill="none"><circle cx="41" cy="49" r="7"/><circle cx="59" cy="49" r="7"/><path d="M48 49 L52 49 M34 48 L26 46 M66 48 L74 46"/></g>'
      : "";
    return hairBack(look, hair) +
      '<path d="M8 110 Q10 86 34 82 L66 82 Q90 86 92 110 Z" fill="' + clothes + '"/>' +
      '<path d="M42 72 L42 86 Q50 92 58 86 L58 72 Z" fill="' + skin + '"/>' +
      '<path d="M40 84 L50 96 L60 84" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="3"/>' +
      '<circle cx="24" cy="51" r="5" fill="' + skin + '"/><circle cx="76" cy="51" r="5" fill="' + skin + '"/>' +
      '<ellipse cx="50" cy="48" rx="26" ry="30" fill="' + skin + '"/>' +
      lines + facialHair(look, hair) + hairFront(look, hair) + features(EXPRESSIONS.indexOf(expr) >= 0 ? expr : "calm") + glasses;
  }

  // A standalone portrait: "bust" shows head and shoulders, "face" crops to the head.
  function svg(look, expr, opts) {
    opts = opts || {};
    var box = opts.crop === "face" ? "16 12 68 68" : "0 0 100 110";
    return '<svg class="portrait-svg" viewBox="' + box + '" width="' + (opts.size || 64) + '" height="' + (opts.size || 64) * (opts.crop === "face" ? 1 : 1.1) + '" aria-hidden="true" focusable="false">' + draw(look, expr) + "</svg>";
  }

  // A face to place inside a round board or table token of radius r. The
  // drawing that holds it defines a circular clipPath (clipId) of that radius.
  function tokenFace(look, expr, r, clipId) {
    return '<g clip-path="url(#' + clipId + ')"><svg x="' + -r + '" y="' + -r + '" width="' + 2 * r + '" height="' + 2 * r + '" viewBox="16 12 68 68">' + draw(look, expr) + "</svg></g>";
  }

  window.JuryPortraits = { EXPRESSIONS: EXPRESSIONS, autoLook: autoLook, lookFor: lookFor, svg: svg, tokenFace: tokenFace };
})();
