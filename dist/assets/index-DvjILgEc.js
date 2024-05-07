var _a;
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = freeGlobal || freeSelf || Function("return this")();
var Symbol$1 = root.Symbol;
var objectProto$1 = Object.prototype;
var hasOwnProperty = objectProto$1.hasOwnProperty;
var nativeObjectToString$1 = objectProto$1.toString;
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : void 0;
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag$1), tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}
var objectProto = Object.prototype;
var nativeObjectToString = objectProto.toString;
function objectToString(value) {
  return nativeObjectToString.call(value);
}
var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : void 0;
function baseGetTag(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
var symbolTag = "[object Symbol]";
function isSymbol(value) {
  return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
}
var reWhitespace = /\s/;
function trimmedEndIndex(string) {
  var index = string.length;
  while (index-- && reWhitespace.test(string.charAt(index))) {
  }
  return index;
}
var reTrimStart = /^\s+/;
function baseTrim(string) {
  return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
}
function isObject(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
var NAN = 0 / 0;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
function toNumber(value) {
  if (typeof value == "number") {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == "function" ? value.valueOf() : value;
    value = isObject(other) ? other + "" : other;
  }
  if (typeof value != "string") {
    return value === 0 ? value : +value;
  }
  value = baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}
var now = function() {
  return root.Date.now();
};
var FUNC_ERROR_TEXT$1 = "Expected a function";
var nativeMax = Math.max, nativeMin = Math.min;
function debounce(func, wait, options) {
  var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
  if (typeof func != "function") {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = "maxWait" in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  function invokeFunc(time) {
    var args = lastArgs, thisArg = lastThis;
    lastArgs = lastThis = void 0;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }
  function leadingEdge(time) {
    lastInvokeTime = time;
    timerId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }
  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
    return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }
  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
    return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
  }
  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = setTimeout(timerExpired, remainingWait(time));
  }
  function trailingEdge(time) {
    timerId = void 0;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = void 0;
    return result;
  }
  function cancel() {
    if (timerId !== void 0) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = void 0;
  }
  function flush() {
    return timerId === void 0 ? result : trailingEdge(now());
  }
  function debounced() {
    var time = now(), isInvoking = shouldInvoke(time);
    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;
    if (isInvoking) {
      if (timerId === void 0) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === void 0) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}
var FUNC_ERROR_TEXT = "Expected a function";
function throttle(func, wait, options) {
  var leading = true, trailing = true;
  if (typeof func != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = "leading" in options ? !!options.leading : leading;
    trailing = "trailing" in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    "leading": leading,
    "maxWait": wait,
    "trailing": trailing
  });
}
var suncalc = { exports: {} };
(function(module, exports) {
  (function() {
    var PI = Math.PI, sin = Math.sin, cos = Math.cos, tan = Math.tan, asin = Math.asin, atan = Math.atan2, acos = Math.acos, rad = PI / 180;
    var dayMs = 1e3 * 60 * 60 * 24, J1970 = 2440588, J2000 = 2451545;
    function toJulian(date) {
      return date.valueOf() / dayMs - 0.5 + J1970;
    }
    function fromJulian(j) {
      return new Date((j + 0.5 - J1970) * dayMs);
    }
    function toDays(date) {
      return toJulian(date) - J2000;
    }
    var e = rad * 23.4397;
    function rightAscension(l, b) {
      return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l));
    }
    function declination(l, b) {
      return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l));
    }
    function azimuth(H, phi, dec) {
      return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi));
    }
    function altitude(H, phi, dec) {
      return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H));
    }
    function siderealTime(d, lw) {
      return rad * (280.16 + 360.9856235 * d) - lw;
    }
    function astroRefraction(h) {
      if (h < 0)
        h = 0;
      return 2967e-7 / Math.tan(h + 312536e-8 / (h + 0.08901179));
    }
    function solarMeanAnomaly(d) {
      return rad * (357.5291 + 0.98560028 * d);
    }
    function eclipticLongitude(M) {
      var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 3e-4 * sin(3 * M)), P = rad * 102.9372;
      return M + C + P + PI;
    }
    function sunCoords(d) {
      var M = solarMeanAnomaly(d), L = eclipticLongitude(M);
      return {
        dec: declination(L, 0),
        ra: rightAscension(L, 0)
      };
    }
    var SunCalc = {};
    SunCalc.getPosition = function(date, lat, lng) {
      var lw = rad * -lng, phi = rad * lat, d = toDays(date), c = sunCoords(d), H = siderealTime(d, lw) - c.ra;
      return {
        azimuth: azimuth(H, phi, c.dec),
        altitude: altitude(H, phi, c.dec)
      };
    };
    var times = SunCalc.times = [
      [-0.833, "sunrise", "sunset"],
      [-0.3, "sunriseEnd", "sunsetStart"],
      [-6, "dawn", "dusk"],
      [-12, "nauticalDawn", "nauticalDusk"],
      [-18, "nightEnd", "night"],
      [6, "goldenHourEnd", "goldenHour"]
    ];
    SunCalc.addTime = function(angle, riseName, setName) {
      times.push([angle, riseName, setName]);
    };
    var J0 = 9e-4;
    function julianCycle(d, lw) {
      return Math.round(d - J0 - lw / (2 * PI));
    }
    function approxTransit(Ht, lw, n) {
      return J0 + (Ht + lw) / (2 * PI) + n;
    }
    function solarTransitJ(ds, M, L) {
      return J2000 + ds + 53e-4 * sin(M) - 69e-4 * sin(2 * L);
    }
    function hourAngle(h, phi, d) {
      return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d)));
    }
    function observerAngle(height) {
      return -2.076 * Math.sqrt(height) / 60;
    }
    function getSetJ(h, lw, phi, dec, n, M, L) {
      var w = hourAngle(h, phi, dec), a = approxTransit(w, lw, n);
      return solarTransitJ(a, M, L);
    }
    SunCalc.getTimes = function(date, lat, lng, height) {
      height = height || 0;
      var lw = rad * -lng, phi = rad * lat, dh = observerAngle(height), d = toDays(date), n = julianCycle(d, lw), ds = approxTransit(0, lw, n), M = solarMeanAnomaly(ds), L = eclipticLongitude(M), dec = declination(L, 0), Jnoon = solarTransitJ(ds, M, L), i, len, time, h0, Jset, Jrise;
      var result = {
        solarNoon: fromJulian(Jnoon),
        nadir: fromJulian(Jnoon - 0.5)
      };
      for (i = 0, len = times.length; i < len; i += 1) {
        time = times[i];
        h0 = (time[0] + dh) * rad;
        Jset = getSetJ(h0, lw, phi, dec, n, M, L);
        Jrise = Jnoon - (Jset - Jnoon);
        result[time[1]] = fromJulian(Jrise);
        result[time[2]] = fromJulian(Jset);
      }
      return result;
    };
    function moonCoords(d) {
      var L = rad * (218.316 + 13.176396 * d), M = rad * (134.963 + 13.064993 * d), F = rad * (93.272 + 13.22935 * d), l = L + rad * 6.289 * sin(M), b = rad * 5.128 * sin(F), dt = 385001 - 20905 * cos(M);
      return {
        ra: rightAscension(l, b),
        dec: declination(l, b),
        dist: dt
      };
    }
    SunCalc.getMoonPosition = function(date, lat, lng) {
      var lw = rad * -lng, phi = rad * lat, d = toDays(date), c = moonCoords(d), H = siderealTime(d, lw) - c.ra, h = altitude(H, phi, c.dec), pa = atan(sin(H), tan(phi) * cos(c.dec) - sin(c.dec) * cos(H));
      h = h + astroRefraction(h);
      return {
        azimuth: azimuth(H, phi, c.dec),
        altitude: h,
        distance: c.dist,
        parallacticAngle: pa
      };
    };
    SunCalc.getMoonIllumination = function(date) {
      var d = toDays(date || /* @__PURE__ */ new Date()), s = sunCoords(d), m = moonCoords(d), sdist = 149598e3, phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)), inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi)), angle = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) - cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));
      return {
        fraction: (1 + cos(inc)) / 2,
        phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
        angle
      };
    };
    function hoursLater(date, h) {
      return new Date(date.valueOf() + h * dayMs / 24);
    }
    SunCalc.getMoonTimes = function(date, lat, lng, inUTC) {
      var t = new Date(date);
      if (inUTC)
        t.setUTCHours(0, 0, 0, 0);
      else
        t.setHours(0, 0, 0, 0);
      var hc = 0.133 * rad, h0 = SunCalc.getMoonPosition(t, lat, lng).altitude - hc, h1, h2, rise, set, a, b, xe, ye, d, roots, x1, x2, dx;
      for (var i = 1; i <= 24; i += 2) {
        h1 = SunCalc.getMoonPosition(hoursLater(t, i), lat, lng).altitude - hc;
        h2 = SunCalc.getMoonPosition(hoursLater(t, i + 1), lat, lng).altitude - hc;
        a = (h0 + h2) / 2 - h1;
        b = (h2 - h0) / 2;
        xe = -b / (2 * a);
        ye = (a * xe + b) * xe + h1;
        d = b * b - 4 * a * h1;
        roots = 0;
        if (d >= 0) {
          dx = Math.sqrt(d) / (Math.abs(a) * 2);
          x1 = xe - dx;
          x2 = xe + dx;
          if (Math.abs(x1) <= 1)
            roots++;
          if (Math.abs(x2) <= 1)
            roots++;
          if (x1 < -1)
            x1 = x2;
        }
        if (roots === 1) {
          if (h0 < 0)
            rise = i + x1;
          else
            set = i + x1;
        } else if (roots === 2) {
          rise = i + (ye < 0 ? x2 : x1);
          set = i + (ye < 0 ? x1 : x2);
        }
        if (rise && set)
          break;
        h0 = h2;
      }
      var result = {};
      if (rise)
        result.rise = hoursLater(t, rise);
      if (set)
        result.set = hoursLater(t, set);
      if (!rise && !set)
        result[ye > 0 ? "alwaysUp" : "alwaysDown"] = true;
      return result;
    };
    module.exports = SunCalc;
  })();
})(suncalc);
var suncalcExports = suncalc.exports;
function toDate(argument) {
  const argStr = Object.prototype.toString.call(argument);
  if (argument instanceof Date || typeof argument === "object" && argStr === "[object Date]") {
    return new argument.constructor(+argument);
  } else if (typeof argument === "number" || argStr === "[object Number]" || typeof argument === "string" || argStr === "[object String]") {
    return new Date(argument);
  } else {
    return /* @__PURE__ */ new Date(NaN);
  }
}
function constructFrom(date, value) {
  if (date instanceof Date) {
    return new date.constructor(value);
  } else {
    return new Date(value);
  }
}
function addDays(date, amount) {
  const _date = toDate(date);
  if (isNaN(amount))
    return constructFrom(date, NaN);
  if (!amount) {
    return _date;
  }
  _date.setDate(_date.getDate() + amount);
  return _date;
}
function addMilliseconds(date, amount) {
  const timestamp = +toDate(date);
  return constructFrom(date, timestamp + amount);
}
const millisecondsInMinute = 6e4;
function startOfDay(date) {
  const _date = toDate(date);
  _date.setHours(0, 0, 0, 0);
  return _date;
}
function addMinutes(date, amount) {
  return addMilliseconds(date, amount * millisecondsInMinute);
}
function getRoundingMethod(method) {
  return (number) => {
    const round = method ? Math[method] : Math.trunc;
    const result = round(number);
    return result === 0 ? 0 : result;
  };
}
function differenceInMilliseconds(dateLeft, dateRight) {
  return +toDate(dateLeft) - +toDate(dateRight);
}
function differenceInMinutes(dateLeft, dateRight, options) {
  const diff = differenceInMilliseconds(dateLeft, dateRight) / millisecondsInMinute;
  return getRoundingMethod(options == null ? void 0 : options.roundingMethod)(diff);
}
const getColorFromGradient = (percentage, colorStops) => {
  for (const stop of colorStops) {
    const nextStop = colorStops.find((x) => x.position > stop.position);
    if (!nextStop) {
      return `${stop.color[0].toFixed(0)}, ${stop.color[1].toFixed(
        0
      )}, ${stop.color[2].toFixed(0)}`;
    }
    if (percentage >= stop.position && percentage <= nextStop.position) {
      const ratio = (percentage - stop.position) / (nextStop.position - stop.position);
      const r = Math.round(
        stop.color[0] + (nextStop.color[0] - stop.color[0]) * ratio
      ).toFixed(0);
      const g = Math.round(
        stop.color[1] + (nextStop.color[1] - stop.color[1]) * ratio
      ).toFixed(0);
      const b = Math.round(
        stop.color[2] + (nextStop.color[2] - stop.color[2]) * ratio
      ).toFixed(0);
      return `${r}, ${g}, ${b}`;
    }
  }
};
const positionFromDateTime = (date) => differenceInMinutes(date, startOfDay(date)) / 1440 * 100;
const drawGraph = (options) => {
  if (options.canvas.hidden || !options.location.lat || !options.location.lon) {
    return;
  }
  const mergedOpts = {
    offset: {
      minutes: 0,
      days: 0
    },
    date: /* @__PURE__ */ new Date(),
    ...options
  };
  if (!options.date) {
    mergedOpts.date = /* @__PURE__ */ new Date();
  }
  const ctx = options.canvas.getContext("2d");
  const dimensions = options.canvas.getBoundingClientRect();
  if (!ctx) {
    return;
  }
  ctx.reset();
  const midY = dimensions.height / 2;
  const currentTime = addDays(
    addMinutes(mergedOpts.date, mergedOpts.offset.minutes),
    mergedOpts.offset.days
  );
  ctx.fillStyle = "rgba(244,244,244,1)";
  const { lat, lon } = mergedOpts.location;
  const position = suncalcExports.getPosition(currentTime, lat, lon);
  const times = suncalcExports.getTimes(currentTime, lat, lon);
  const colorStops = [
    { color: [50, 4, 73], position: 0 },
    {
      color: [121, 9, 118],
      position: positionFromDateTime(times.nauticalDawn)
    },
    { color: [255, 215, 79], position: positionFromDateTime(times.dawn) },
    {
      color: [253, 255, 183],
      position: positionFromDateTime(times.sunrise)
    },
    {
      color: [174, 255, 254],
      position: positionFromDateTime(times.sunriseEnd)
    },
    {
      color: [225, 253, 255],
      position: positionFromDateTime(times.solarNoon)
    },
    {
      color: [62, 123, 201],
      position: positionFromDateTime(times.goldenHour)
    },
    {
      color: [201, 122, 17],
      position: positionFromDateTime(times.sunsetStart)
    },
    { color: [201, 81, 17], position: positionFromDateTime(times.dusk) },
    {
      color: [43, 20, 126],
      position: positionFromDateTime(times.nauticalDusk)
    },
    { color: [23, 6, 61], position: positionFromDateTime(times.night) }
  ];
  const pxYPerRadian = dimensions.height / Math.PI;
  console.log("🚀 ~ pxYPerRadian:", pxYPerRadian);
  ctx.lineWidth = 2;
  const dawnAlt = suncalcExports.getPosition(times.dawn, lat, lon).altitude * pxYPerRadian;
  const horizonY = midY - dawnAlt;
  ctx.beginPath();
  ctx.strokeStyle = "rgba(188, 144, 44, 1.000)";
  ctx.moveTo(0, horizonY);
  ctx.lineTo(dimensions.width, horizonY);
  ctx.stroke();
  const horizontalSteps = Math.min(dimensions.width, 1440);
  console.log("🚀 ~ horizontalSteps:", horizontalSteps);
  const xPixelsPerMinute = 1440 / horizontalSteps;
  console.log("🚀 ~ xPixelsPerMinute:", xPixelsPerMinute);
  for (let i = 0; i < horizontalSteps; i++) {
    const sunDotAltitude = suncalcExports.getPosition(
      addMinutes(startOfDay(currentTime), i * xPixelsPerMinute),
      lat,
      lon
    ).altitude;
    ctx.fillStyle = "rgba(147, 192, 237, 0.500)";
    ctx.strokeStyle = "transparent";
    ctx.beginPath();
    ctx.ellipse(
      i,
      midY - sunDotAltitude * pxYPerRadian,
      1,
      1,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  const sunY = midY - position.altitude * pxYPerRadian;
  console.log("🚀 ~ sunY:", sunY);
  const currentMinutes = (currentTime.getTime() - startOfDay(currentTime).getTime()) / 1e3 / 60;
  console.log("🚀 ~ currentMinutes:", currentMinutes);
  const sunX = currentMinutes / xPixelsPerMinute;
  console.log("🚀 ~ sunX:", sunX);
  ctx.fillStyle = "rgba(255, 240, 237, 1.000)";
  ctx.beginPath();
  ctx.ellipse(sunX, sunY, 10, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  const gradient = ctx.createRadialGradient(
    sunX,
    sunY,
    13,
    sunX,
    sunY,
    dimensions.height / 2
  );
  const startColor = getColorFromGradient(sunX / dimensions.width * 100, colorStops) ?? "200, 200, 255";
  gradient.addColorStop(0, `rgba(${startColor}, 0.22)`);
  gradient.addColorStop(1, `rgba(${startColor}, 0.000)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, dimensions.width, horizonY);
};
const ui = document.querySelector("#solar-widget");
if (ui) {
  let elem = document.querySelector(
    "#solar-widget [data-ui='graph']"
  );
  if (!elem) {
    const newCanvas = document.createElement("canvas");
    newCanvas.setAttribute("width", "100%");
    newCanvas.setAttribute("height", "100%");
    (_a = document.querySelector("body")) == null ? void 0 : _a.insertAdjacentElement("afterbegin", newCanvas);
    elem = newCanvas;
  }
  const defaultConfig = {
    canvas: elem,
    location: {
      lat: 39,
      lon: -104
    }
  };
  let minuteOffset = 0;
  let dayOffset = 0;
  const drawCurrentState = () => {
    elem.width = ui.clientWidth;
    elem.height = ui.clientHeight;
    drawGraph({
      ...defaultConfig,
      offset: { minutes: minuteOffset, days: dayOffset }
    });
  };
  window.addEventListener(
    "wheel",
    throttle((event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
      if (!event.deltaY) {
        return;
      }
      minuteOffset = minuteOffset + event.deltaY;
      drawCurrentState();
    }, 12)
  );
  window.addEventListener(
    "keydown",
    throttle((event) => {
      if (event.code === "ArrowRight") {
        dayOffset = dayOffset + 1;
      }
      if (event.code === "ArrowLeft") {
        dayOffset = dayOffset - 1;
      }
      if (event.code === "ArrowUp") {
        dayOffset = dayOffset + 30;
      }
      if (event.code === "ArrowDown") {
        dayOffset = dayOffset - 30;
      }
      if (event.code === "Enter") {
        dayOffset = 0;
        minuteOffset = 0;
      }
      drawCurrentState();
    }, 20)
  );
  window.addEventListener("resize", drawCurrentState);
  drawCurrentState();
  window.setInterval(drawCurrentState, 1e3 * 60);
}
